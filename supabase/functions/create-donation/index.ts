import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-DONATION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const { amount, donorName, message, email } = await req.json();
    
    if (!amount || amount < 100) { // Minimum $1
      throw new Error("Invalid donation amount. Minimum is $1.");
    }

    logStep("Request data received", { amount, donorName, email });

    // Get authenticated user (optional for donations)
    const authHeader = req.headers.get("Authorization");
    let user = null;
    
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await supabaseClient.auth.getUser(token);
      user = userData.user;
      logStep("User authenticated", { userId: user?.id });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if customer exists by email
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    }

    // Create donation record first
    const { data: donation, error: donationError } = await supabaseClient
      .from('donations')
      .insert({
        user_id: user?.id || null,
        email,
        amount,
        donor_name: donorName,
        message,
        status: 'pending'
      })
      .select()
      .single();

    if (donationError) {
      logStep("Error creating donation record", donationError);
      throw donationError;
    }

    logStep("Donation record created", { donationId: donation.id });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Donation${donorName ? ` from ${donorName}` : ''}`,
              description: message || "Thank you for your generous donation!",
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/donation-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/`,
      metadata: {
        donation_id: donation.id,
        type: 'donation'
      }
    });

    logStep("Stripe session created", { sessionId: session.id });

    // Update donation with Stripe session info
    await supabaseClient
      .from('donations')
      .update({
        stripe_payment_intent_id: session.payment_intent as string,
        stripe_customer_id: customerId
      })
      .eq('id', donation.id);

    return new Response(JSON.stringify({ url: session.url, donationId: donation.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-donation", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});