import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { testId, audioUrls } = await req.json();

    if (!testId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Test ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!audioUrls || typeof audioUrls !== 'object') {
      return new Response(
        JSON.stringify({ success: false, error: 'Audio URLs object is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting audio import for test:', testId);

    const uploadedUrls: Record<string, string> = {};
    const parts = ['part1', 'part2', 'part3', 'part4'];

    for (const part of parts) {
      const externalUrl = audioUrls[part];
      if (!externalUrl) {
        console.log(`No URL provided for ${part}, skipping`);
        continue;
      }

      console.log(`Downloading ${part} from:`, externalUrl);

      try {
        // Fetch the audio file from external URL
        const response = await fetch(externalUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });

        if (!response.ok) {
          console.error(`Failed to fetch ${part}: ${response.status} ${response.statusText}`);
          continue;
        }

        const contentType = response.headers.get('content-type') || 'audio/mpeg';
        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        console.log(`Downloaded ${part}: ${uint8Array.length} bytes, type: ${contentType}`);

        // Determine file extension
        let extension = 'mp3';
        if (externalUrl.includes('.m4a') || contentType.includes('m4a')) {
          extension = 'm4a';
        } else if (externalUrl.includes('.wav') || contentType.includes('wav')) {
          extension = 'wav';
        } else if (externalUrl.includes('.ogg') || contentType.includes('ogg')) {
          extension = 'ogg';
        }

        // Generate unique filename
        const timestamp = Date.now();
        const filename = `${testId}/${part}-${timestamp}.${extension}`;

        console.log(`Uploading to storage: ${filename}`);

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('listening-audios')
          .upload(filename, uint8Array, {
            contentType,
            upsert: true,
          });

        if (uploadError) {
          console.error(`Failed to upload ${part}:`, uploadError);
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('listening-audios')
          .getPublicUrl(filename);

        uploadedUrls[`audio_url_${part}`] = urlData.publicUrl;
        console.log(`Successfully uploaded ${part}:`, urlData.publicUrl);

      } catch (err) {
        console.error(`Error processing ${part}:`, err);
      }
    }

    if (Object.keys(uploadedUrls).length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'No audio files were successfully imported' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update the listening_tests table with new URLs
    console.log('Updating test record with new URLs:', uploadedUrls);

    const { error: updateError } = await supabase
      .from('listening_tests')
      .update(uploadedUrls)
      .eq('id', testId);

    if (updateError) {
      console.error('Failed to update test record:', updateError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Files uploaded but failed to update test: ${updateError.message}`,
          uploadedUrls 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Audio import completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully imported ${Object.keys(uploadedUrls).length} audio files`,
        uploadedUrls 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Import error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Import failed';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
