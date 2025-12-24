import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

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
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { secretName, secretValue } = await req.json();

    if (!secretName || !secretValue) {
      return new Response(JSON.stringify({ error: 'Missing secretName or secretValue' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const appEncryptionKey = Deno.env.get('app_encryption_key');
    if (!appEncryptionKey) {
      throw new Error('app_encryption_key environment variable not set. Please ensure it is configured as a Supabase Secret.');
    }

    // --- Encryption Logic (as per Claude's suggestion) ---
    const encoder = new TextEncoder();
    const dataToEncrypt = encoder.encode(secretValue);
    const keyData = encoder.encode(appEncryptionKey);
    
    // Use first 32 bytes for AES-GCM key (256-bit)
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData.slice(0, 32), 
      { name: "AES-GCM" },
      false,
      ["encrypt"]
    );
    
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 12-byte IV for AES-GCM
    const encryptedData = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      cryptoKey,
      dataToEncrypt
    );
    
    // Combine IV and encrypted data, then base64 encode
    const combined = new Uint8Array(iv.length + encryptedData.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedData), iv.length);
    const encryptedValue = btoa(String.fromCharCode(...combined));
    // --- End Encryption Logic ---

    // Store in database
    const { error: dbError } = await supabaseClient
      .from('user_secrets')
      .upsert({
        user_id: user.id,
        secret_name: secretName, // Use the dynamic secretName
        encrypted_value: encryptedValue,
      }, { onConflict: 'user_id,secret_name' }); // Specify onConflict for upsert

    if (dbError) throw dbError;

    return new Response(JSON.stringify({ message: 'Secret saved successfully' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Edge Function error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});