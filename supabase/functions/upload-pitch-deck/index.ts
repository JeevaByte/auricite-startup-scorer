import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[UPLOAD-PITCH-DECK] ${step}${detailsStr}`);
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

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization required");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) {
      throw new Error("Invalid user token");
    }

    const user = userData.user;
    logStep("User authenticated", { userId: user.id });

    // Check if user has access to upload pitch decks
    const { data: hasAccess, error: accessError } = await supabaseClient
      .rpc('has_paid_access', { user_uuid: user.id, access_type_param: 'pitch_upload' });

    if (accessError) {
      throw new Error("Error checking access permissions");
    }

    if (!hasAccess) {
      return new Response(JSON.stringify({ 
        error: "Access denied. Please make a donation or upgrade to premium to upload pitch decks." 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    logStep("Access verified for user");

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const fileName = formData.get('fileName') as string;

    if (!file) {
      throw new Error("No file provided");
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error("Invalid file type. Only PDF, PPT, and PPTX files are allowed.");
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error("File size too large. Maximum size is 10MB.");
    }

    logStep("File validation passed", { type: file.type, size: file.size });

    // Generate unique file path
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${timestamp}-${fileName || file.name}`;
    const filePath = `${user.id}/${uniqueFileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('pitch-decks')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      logStep("Upload error", uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    logStep("File uploaded successfully", { path: uploadData.path });

    // Save pitch deck record
    const { data: pitchDeck, error: dbError } = await supabaseClient
      .from('pitch_decks')
      .insert({
        user_id: user.id,
        file_name: fileName || file.name,
        file_path: uploadData.path,
        file_size: file.size,
        file_type: file.type,
        upload_status: 'uploaded'
      })
      .select()
      .single();

    if (dbError) {
      logStep("Database error", dbError);
      // Clean up uploaded file if database insert fails
      await supabaseClient.storage
        .from('pitch-decks')
        .remove([uploadData.path]);
      throw new Error(`Database error: ${dbError.message}`);
    }

    logStep("Pitch deck record created", { pitchDeckId: pitchDeck.id });

    return new Response(JSON.stringify({ 
      success: true, 
      pitchDeck: {
        id: pitchDeck.id,
        fileName: pitchDeck.file_name,
        fileSize: pitchDeck.file_size,
        uploadedAt: pitchDeck.created_at
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in upload-pitch-deck", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});