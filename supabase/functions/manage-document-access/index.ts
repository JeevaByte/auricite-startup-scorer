import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { action, requestId, documentId, startupUserId, message } = await req.json();

    if (action === 'request') {
      // Create access request
      const { data, error } = await supabaseClient
        .from('document_access_requests')
        .insert({
          investor_user_id: user.id,
          startup_user_id: startupUserId,
          document_id: documentId,
          message: message
        })
        .select()
        .single();

      if (error) throw error;

      // Log the request
      await supabaseClient
        .from('document_access_audit')
        .insert({
          document_id: documentId || '00000000-0000-0000-0000-000000000000',
          user_id: user.id,
          action: 'access_requested',
          metadata: { request_id: data.id }
        });

      return new Response(
        JSON.stringify({ success: true, request: data }), 
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (action === 'approve' || action === 'deny') {
      // Update request status
      const { data, error } = await supabaseClient
        .from('document_access_requests')
        .update({
          status: action === 'approve' ? 'approved' : 'denied',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;

      // Log the decision
      await supabaseClient
        .from('document_access_audit')
        .insert({
          document_id: data.document_id || '00000000-0000-0000-0000-000000000000',
          user_id: user.id,
          action: action === 'approve' ? 'access_granted' : 'access_denied',
          metadata: { request_id: requestId }
        });

      return new Response(
        JSON.stringify({ success: true, request: data }), 
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (action === 'log_view' || action === 'log_download') {
      // Log document access
      const { error } = await supabaseClient
        .from('document_access_audit')
        .insert({
          document_id: documentId,
          user_id: user.id,
          action: action === 'log_view' ? 'view' : 'download',
          user_agent: req.headers.get('user-agent') || undefined
        });

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true }), 
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Error in manage-document-access function:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});