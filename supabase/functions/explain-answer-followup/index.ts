import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Decrypt user's Gemini API key
async function decryptApiKey(encryptedValue: string, encryptionKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  
  const combined = Uint8Array.from(atob(encryptedValue), c => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const encryptedData = combined.slice(12);
  
  const keyData = encoder.encode(encryptionKey);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData.slice(0, 32),
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );
  
  const decryptedData = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    encryptedData
  );
  
  return decoder.decode(decryptedData);
}

// Gemini models to try (with fallback)
const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

async function callGemini(apiKey: string, prompt: string): Promise<string | null> {
  for (const model of GEMINI_MODELS) {
    try {
      console.log(`Trying Gemini model: ${model}`);
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Gemini ${model} failed:`, JSON.stringify(errorData));
        if (response.status === 429) continue;
        continue;
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        console.log(`Success with ${model}`);
        return text;
      }
    } catch (err) {
      console.error(`Error with ${model}:`, err);
      continue;
    }
  }
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting explain-answer-followup function");
    
    // Auth
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get API key
    const { data: secretData } = await supabaseClient
      .from('user_secrets')
      .select('encrypted_value')
      .eq('user_id', user.id)
      .eq('secret_name', 'GEMINI_API_KEY')
      .single();

    if (!secretData) {
      return new Response(JSON.stringify({ 
        error: 'Gemini API key not found. Please add your API key in Settings.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const appEncryptionKey = Deno.env.get('app_encryption_key');
    if (!appEncryptionKey) throw new Error('Encryption key not configured');
    
    const geminiApiKey = await decryptApiKey(secretData.encrypted_value, appEncryptionKey);

    // Parse request
    const { 
      question, // User's follow-up question
      context // Full context about the test
    } = await req.json();

    if (!question || !context) {
      return new Response(JSON.stringify({ error: 'Missing question or context' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Processing follow-up question: ${question.substring(0, 100)}...`);

    // Build comprehensive prompt with all context
    const prompt = `You are an expert IELTS tutor helping a test-taker understand their practice test results.

## TEST CONTEXT

**Module:** ${context.module || 'Reading'}
**Question Type:** ${context.questionType?.replace(/_/g, ' ') || 'Unknown'}
**Difficulty:** ${context.difficulty || 'Medium'}
**Topic:** ${context.topic || 'General'}

${context.passage ? `## PASSAGE
Title: ${context.passage.title || 'Untitled'}

${context.passage.content || '(No passage content available)'}
` : ''}

## QUESTION BEING DISCUSSED
**Question ${context.questionNumber || ''}:** ${context.questionText || '(No question text)'}

${context.options ? `**Options:** ${JSON.stringify(context.options)}` : ''}

**Test-taker's Answer:** ${context.userAnswer || '(No answer provided)'}
**Correct Answer:** ${context.correctAnswer || '(Unknown)'}
**Was Correct:** ${context.isCorrect ? 'Yes ✓' : 'No ✗'}

${context.explanation ? `**Original Explanation:** ${context.explanation}` : ''}

## USER'S FOLLOW-UP QUESTION
${question}

## YOUR TASK
Answer the user's question clearly and helpfully. Use these guidelines:
1. Be specific and reference the passage/question when relevant
2. If they ask why their answer was wrong, explain the specific reasoning
3. If they want more examples, provide IELTS-relevant examples
4. If they want tips, give practical test-taking strategies
5. Be encouraging but honest
6. Keep your answer concise but complete (aim for 2-4 paragraphs unless more detail is needed)
7. Use simple, clear language appropriate for non-native English speakers

Your response:`;

    const result = await callGemini(geminiApiKey, prompt);
    
    if (!result) {
      return new Response(JSON.stringify({ error: 'Failed to generate response' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      response: result.trim(),
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Edge Function error:', error.message, error.stack);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
