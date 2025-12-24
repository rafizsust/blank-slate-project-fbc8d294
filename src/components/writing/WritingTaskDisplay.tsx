
import { QuestionTextWithTools } from '@/components/common/QuestionTextWithTools';
import { Tables } from '@/integrations/supabase/types';

// Now expects a WritingTest and the specific WritingTask to display
interface WritingTaskDisplayProps {
  testId: string; // The ID of the parent WritingTest
  writingTest: Tables<'writing_tests'>; // The parent test data
  writingTask: Tables<'writing_tasks'>; // The specific task (Task 1 or Task 2) to display
  fontSize: number;
  renderRichText: (text: string) => string;
}

export function WritingTaskDisplay({ testId, writingTest, writingTask, fontSize, renderRichText }: WritingTaskDisplayProps) {
  const imageStyle = {
    width: writingTask.image_width ? `${writingTask.image_width}px` : '100%',
    height: writingTask.image_height ? `${writingTask.image_height}px` : 'auto',
    maxWidth: '100%', // Ensure image doesn't overflow its container
    objectFit: 'contain' as 'contain', // Ensure image scales down if too large
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold text-foreground">
        <QuestionTextWithTools
          testId={testId}
          contentId={`${writingTask.id}-title`} // Use writingTask.id for contentId
          text={writingTest.title} // Title comes from the parent WritingTest
          fontSize={fontSize + 2} // Slightly larger font for title
          renderRichText={renderRichText}
          isActive={false}
        />
      </h2>

      <div className="space-y-4">
        <QuestionTextWithTools
          testId={testId}
          contentId={`${writingTask.id}-instruction`} // Use writingTask.id for contentId
          text={writingTask.instruction}
          fontSize={fontSize}
          renderRichText={renderRichText}
          isActive={false}
        />

        {writingTask.task_type === 'task1' && writingTask.image_url && (
          <div className="flex justify-center py-4">
            <img
              src={writingTask.image_url}
              alt="Writing Task 1 Image"
              className="rounded-md border"
              style={imageStyle}
            />
          </div>
        )}

        {writingTask.text_content && (
          <QuestionTextWithTools
            testId={testId}
            contentId={`${writingTask.id}-text-content`} // Use writingTask.id for contentId
            text={writingTask.text_content}
            fontSize={fontSize}
            renderRichText={renderRichText}
            isActive={false}
          />
        )}
      </div>
    </div>
  );
}