import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    // Support both 'expirationHours' and 'expiration' for flexibility
    const expirationHours = formData.get('expirationHours') as string | null 
      || formData.get('expiration') as string | null;

    if (!file) {
      return new Response(
        JSON.stringify({ success: false, error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[api-upload] Uploading file: ${file.name}, size: ${file.size}, type: ${file.type}`);

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${timestamp}-${randomString}.${fileExtension}`;

    // Upload to storage
    const arrayBuffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('public-files')
      .upload(uniqueFileName, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('[api-upload] Upload error:', uploadError);
      return new Response(
        JSON.stringify({ success: false, error: uploadError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('public-files')
      .getPublicUrl(uniqueFileName);

    const publicUrl = urlData.publicUrl;

    // Calculate expiration
    let deleteAt: string | null = null;
    if (expirationHours && expirationHours !== 'never' && expirationHours !== '0') {
      const hours = parseInt(expirationHours, 10);
      if (!isNaN(hours) && hours > 0) {
        const expirationDate = new Date();
        expirationDate.setHours(expirationDate.getHours() + hours);
        deleteAt = expirationDate.toISOString();
      }
    }

    console.log(`[api-upload] File uploaded successfully. URL: ${publicUrl}, Delete at: ${deleteAt || 'Never'}`);

    // Save metadata to database
    const { data: metaData, error: metaError } = await supabase
      .from('files_metadata')
      .insert({
        name: file.name,
        size: file.size,
        type: file.type,
        url: publicUrl,
        expires_at: deleteAt,
      })
      .select()
      .single();

    if (metaError) {
      console.error('[api-upload] Metadata insert error:', metaError);
      // Clean up uploaded file if metadata insert fails
      await supabase.storage.from('public-files').remove([uniqueFileName]);
      return new Response(
        JSON.stringify({ success: false, error: metaError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Response format matching spec
    return new Response(
      JSON.stringify({
        success: true,
        url: publicUrl,
        delete_at: deleteAt,
        metadata: {
          id: metaData.id,
          name: file.name,
          size: file.size,
          type: file.type,
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[api-upload] Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
