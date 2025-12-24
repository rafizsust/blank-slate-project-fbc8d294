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
    const { testId, action } = await req.json();

    if (!testId || !action) {
      return new Response(
        JSON.stringify({ success: false, error: 'testId and action are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (action === 'publish') {
      const { error } = await supabase
        .from('listening_tests')
        .update({ is_published: true })
        .eq('id', testId);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, message: 'Test published successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'unpublish') {
      const { error } = await supabase
        .from('listening_tests')
        .update({ is_published: false })
        .eq('id', testId);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, message: 'Test unpublished successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Unknown action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Action error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Action failed';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
