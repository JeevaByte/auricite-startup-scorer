
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[WEBHOOK-HANDLER] ${step}${detailsStr}`);
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
    logStep("Webhook received");

    // Check if this is a Stripe webhook
    const contentType = req.headers.get('content-type');
    const stripeSignature = req.headers.get('stripe-signature');
    
    if (stripeSignature || contentType?.includes('application/json')) {
      return await handleStripeWebhook(req, supabaseClient);
    } else {
      // Handle custom webhook events
      const { event_type, data } = await req.json();
      logStep('Custom webhook triggered', { event_type, data });

      // Handle different webhook events
      switch (event_type) {
        case 'score_created':
          await handleScoreCreated(supabaseClient, data);
          break;
        case 'assessment_completed':
          await handleAssessmentCompleted(supabaseClient, data);
          break;
        default:
          logStep('Unknown event type', { type: event_type });
      }
    }

    return new Response(JSON.stringify({ success: true, message: 'Webhook processed' }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in webhook-handler", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function handleStripeWebhook(req: Request, supabaseClient: any) {
  const body = await req.text();
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2023-10-16",
  });

  const sig = req.headers.get('stripe-signature');
  const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  let event;
  if (endpointSecret && sig) {
    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
      logStep("Webhook signature verified", { eventType: event.type });
    } catch (err) {
      logStep("Webhook signature verification failed", { error: err.message });
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }
  } else {
    // For testing without webhook secret
    event = JSON.parse(body);
    logStep("Processing webhook without signature verification", { eventType: event.type });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      logStep("Processing checkout.session.completed", { sessionId: session.id });

      if (session.metadata?.type === 'donation') {
        const donationId = session.metadata.donation_id;
        
        // Update donation status
        const { error: updateError } = await supabaseClient
          .from('donations')
          .update({ status: 'completed' })
          .eq('id', donationId);

        if (updateError) {
          logStep("Error updating donation", updateError);
        } else {
          logStep("Donation marked as completed", { donationId });
          
          // Send confirmation email
          try {
            await supabaseClient.functions.invoke('send-donation-confirmation', {
              body: { donationId, sessionId: session.id }
            });
            logStep("Confirmation email triggered");
          } catch (emailError) {
            logStep("Error sending confirmation email", emailError);
          }
        }
      } else {
        // Handle subscription checkout
        logStep("Processing subscription checkout", { customerId: session.customer });
      }
      break;
    }

    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      logStep("Payment succeeded", { paymentIntentId: paymentIntent.id });
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      logStep("Payment failed", { paymentIntentId: paymentIntent.id });
      
      // Mark donation as failed
      await supabaseClient
        .from('donations')
        .update({ status: 'failed' })
        .eq('stripe_payment_intent_id', paymentIntent.id);
      break;
    }

    default:
      logStep("Unhandled event type", { type: event.type });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
}

async function handleScoreCreated(supabase: any, data: any) {
  logStep('Handling score created', data);
  
  // Log the event
  await supabase.from('audit_log').insert({
    table_name: 'scores',
    record_id: data.score_id,
    action: 'WEBHOOK_TRIGGERED',
    new_values: data,
    user_id: data.user_id
  });

  // Send external webhook if configured
  const webhookUrl = Deno.env.get('EXTERNAL_WEBHOOK_URL');
  if (webhookUrl) {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'score_created',
        data: data,
        timestamp: new Date().toISOString()
      })
    });
  }
}

async function handleAssessmentCompleted(supabase: any, data: any) {
  logStep('Handling assessment completed', data);
  
  // Queue notification
  await supabase.from('notification_queue').insert({
    user_id: data.user_id,
    notification_type: 'assessment_completed',
    title: 'Assessment Completed',
    message: `Your assessment has been completed with a score of ${data.total_score}`,
    data: data
  });
}
