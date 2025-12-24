import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Question {
  questionNumber: number;
  questionText: string;
  correctAnswer: string;
  heading?: string;
  options?: any;
  isGiven?: boolean;
  optionFormat?: string;
  tableData?: any;
}

interface QuestionGroup {
  startQuestion: number;
  endQuestion: number;
  questionType: string;
  instruction?: string;
  options?: any;
  questions: Question[];
}

interface ImportTestData {
  bookName: string;
  testNumber: number;
  title: string;
  audioUrls: {
    part1?: string;
    part2?: string;
    part3?: string;
    part4?: string;
  };
  questionGroups: QuestionGroup[];
  transcripts?: {
    part1?: string;
    part2?: string;
    part3?: string;
    part4?: string;
  };
}

async function downloadAndUploadAudio(
  supabase: any,
  testId: string,
  part: string,
  externalUrl: string
): Promise<string | null> {
  try {
    console.log(`Downloading ${part} from:`, externalUrl);

    const response = await fetch(externalUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch ${part}: ${response.status} ${response.statusText}`);
      return null;
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
    const { error: uploadError } = await supabase.storage
      .from('listening-audios')
      .upload(filename, uint8Array, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      console.error(`Failed to upload ${part}:`, uploadError);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('listening-audios')
      .getPublicUrl(filename);

    console.log(`Successfully uploaded ${part}:`, urlData.publicUrl);
    return urlData.publicUrl;

  } catch (err) {
    console.error(`Error processing ${part}:`, err);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const testData: ImportTestData = await req.json();

    if (!testData.bookName || !testData.testNumber || !testData.title) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: bookName, testNumber, title' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting full test import:', testData.title);

    // Step 1: Create the listening test
    const { data: newTest, error: testError } = await supabase
      .from('listening_tests')
      .insert({
        book_name: testData.bookName,
        test_number: testData.testNumber,
        title: testData.title,
        total_questions: 40,
        time_limit: 30,
        is_published: false,
        transcript_part1: testData.transcripts?.part1 || null,
        transcript_part2: testData.transcripts?.part2 || null,
        transcript_part3: testData.transcripts?.part3 || null,
        transcript_part4: testData.transcripts?.part4 || null,
      })
      .select()
      .single();

    if (testError) {
      throw new Error(`Failed to create test: ${testError.message}`);
    }

    console.log('Created test with ID:', newTest.id);

    // Step 2: Download and upload audio files
    const audioUrls: Record<string, string> = {};
    const parts = ['part1', 'part2', 'part3', 'part4'] as const;

    for (const part of parts) {
      const externalUrl = testData.audioUrls[part];
      if (externalUrl) {
        const uploadedUrl = await downloadAndUploadAudio(supabase, newTest.id, part, externalUrl);
        if (uploadedUrl) {
          audioUrls[`audio_url_${part}`] = uploadedUrl;
        }
      }
    }

    // Update test with audio URLs
    if (Object.keys(audioUrls).length > 0) {
      const { error: updateError } = await supabase
        .from('listening_tests')
        .update(audioUrls)
        .eq('id', newTest.id);

      if (updateError) {
        console.error('Failed to update audio URLs:', updateError);
      } else {
        console.log('Audio URLs updated successfully');
      }
    }

    // Step 3: Create question groups and questions
    let totalQuestionsCreated = 0;
    let groupsCreated = 0;

    for (const group of testData.questionGroups) {
      // Create question group
      const { data: newGroup, error: groupError } = await supabase
        .from('listening_question_groups')
        .insert({
          test_id: newTest.id,
          start_question: group.startQuestion,
          end_question: group.endQuestion,
          question_type: group.questionType,
          instruction: group.instruction || null,
          options: group.options || null,
        })
        .select()
        .single();

      if (groupError) {
        console.error(`Failed to create group ${group.startQuestion}-${group.endQuestion}:`, groupError);
        continue;
      }

      groupsCreated++;
      console.log(`Created question group: ${group.startQuestion}-${group.endQuestion}`);

      // Create questions for this group
      for (const question of group.questions) {
        const { error: questionError } = await supabase
          .from('listening_questions')
          .insert({
            group_id: newGroup.id,
            question_number: question.questionNumber,
            question_text: question.questionText,
            correct_answer: question.correctAnswer,
            heading: question.heading || null,
            options: question.options || null,
            is_given: question.isGiven || false,
            option_format: question.optionFormat || 'A',
            table_data: question.tableData || null,
          });

        if (questionError) {
          console.error(`Failed to create question ${question.questionNumber}:`, questionError);
        } else {
          totalQuestionsCreated++;
        }
      }
    }

    console.log(`Import complete. Groups: ${groupsCreated}, Questions: ${totalQuestionsCreated}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully imported test "${testData.title}"`,
        testId: newTest.id,
        audioFilesUploaded: Object.keys(audioUrls).length,
        questionGroupsCreated: groupsCreated,
        questionsCreated: totalQuestionsCreated,
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
