import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, testData } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Initialize Supabase client to fetch actual test data
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    let detailedTestData = testData;
    
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Fetch actual submission data with answers for detailed analysis
      const [readingSubmissions, listeningSubmissions] = await Promise.all([
        supabase
          .from('reading_test_submissions')
          .select('*, reading_tests(title, book_name)')
          .eq('user_id', userId)
          .order('completed_at', { ascending: false })
          .limit(5),
        supabase
          .from('listening_test_submissions')
          .select('*, listening_tests(title, book_name)')
          .eq('user_id', userId)
          .order('completed_at', { ascending: false })
          .limit(5)
      ]);
      
      detailedTestData = {
        reading: readingSubmissions.data || [],
        listening: listeningSubmissions.data || [],
        ...testData
      };
    }

    const systemPrompt = `You are an IELTS expert analyst providing detailed, actionable feedback. Analyze the student's test performance data and provide comprehensive insights.

IMPORTANT: Include specific examples from the student's actual performance when available. For instance:
- "In Cambridge 19 Listening Test 1, you wrote 'cup' instead of 'cups' - pay attention to singular/plural forms"
- "You often confuse 'Not Given' with 'False' in True/False/Not Given questions"
- "Your spelling errors cost you 3 marks in the last test (e.g., 'accomodation' instead of 'accommodation')"

Return a JSON object with this exact structure:
{
  "overallBand": number (0-9 scale, with .5 increments),
  "overallTrend": "up" | "down" | "stable",
  "topStrengths": string[] (3 items, be specific with examples),
  "areasToImprove": string[] (3 items, with specific actionable techniques),
  "modules": [
    {
      "module": "reading" | "listening" | "writing" | "speaking",
      "averageScore": number (0-100),
      "totalTests": number,
      "bandScore": number (0-9),
      "trend": "up" | "down" | "stable",
      "weakAreas": string[] (2-3 specific question types),
      "commonMistakes": string[] (2-3 specific patterns with examples like "wrote 'informations' instead of 'information'"),
      "improvements": string[] (2-3 actionable techniques like "Use the '3-step skimming method': 1. Read first/last sentences 2. Identify keywords 3. Match with answer options"),
      "detailedExamples": [
        {
          "testName": string (e.g., "Cambridge 19 Test 1"),
          "mistake": string (specific error),
          "correction": string (what should have been),
          "technique": string (how to avoid this in future)
        }
      ],
      "resources": [{ "title": string, "url": string, "type": "video" | "article" | "practice" }]
    }
  ]
}

Provide REAL, ACTIONABLE resources from reputable IELTS sources like:
- British Council IELTS (https://takeielts.britishcouncil.org/)
- IELTS.org (https://www.ielts.org/)
- Cambridge IELTS (https://www.cambridgeenglish.org/)

Be specific, practical, and encouraging. Focus on patterns that can be improved with targeted practice.`;

    const userPrompt = `Analyze this IELTS test performance data in detail:

${JSON.stringify(detailedTestData, null, 2)}

Provide:
1. Comprehensive analysis with specific examples from the test data
2. Identify recurring patterns in mistakes
3. Give actionable techniques with step-by-step instructions
4. Recommend specific resources for improvement
5. Be encouraging but honest about areas needing work`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Parse JSON from response
    let analytics;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analytics = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      return new Response(
        JSON.stringify({ analytics: null }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ analytics }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-performance function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error", analytics: null }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});