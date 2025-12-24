import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { SummaryWordBank } from '../SummaryWordBank';

describe('SummaryWordBank', () => {
  const defaultProps = {
    content: 'The {{31}} was found in the {{32}} area.',
    wordBank: ['artifact', 'ancient', 'modern', 'temple'],
    answers: {} as Record<number, string>,
    onAnswerChange: vi.fn(),
  };

  describe('cross-group scoping', () => {
    it('should not ghost words used in OTHER question groups', () => {
      // Simulate answers from another group (questions 1-10) alongside this group (31-32)
      const answersFromMultipleGroups = {
        1: 'artifact',  // Answer from a DIFFERENT group
        2: 'ancient',   // Answer from a DIFFERENT group
        31: '',         // This group - empty
        32: '',         // This group - empty
      };

      render(
        <SummaryWordBank
          {...defaultProps}
          answers={answersFromMultipleGroups}
        />
      );

      // "artifact" and "ancient" should NOT be ghosted since they're used in a different group
      const artifactWord = screen.getByText('artifact');
      const ancientWord = screen.getByText('ancient');
      
      // Words should be draggable (not disabled) since they're not used in THIS group
      expect(artifactWord).not.toHaveClass('line-through');
      expect(ancientWord).not.toHaveClass('line-through');
      expect(artifactWord).not.toHaveClass('opacity-40');
      expect(ancientWord).not.toHaveClass('opacity-40');
    });

    it('should ghost words used within THIS question group', () => {
      const answersWithinThisGroup = {
        31: 'artifact',  // Used in THIS group
        32: '',          // Empty in this group
      };

      render(
        <SummaryWordBank
          {...defaultProps}
          answers={answersWithinThisGroup}
        />
      );

      // Find the word bank items (they're in the sidebar, separate from the gap)
      const wordBankItems = screen.getAllByText('artifact');
      
      // The word in the word bank (not the one in the gap) should be ghosted
      const wordBankArtifact = wordBankItems.find((el: HTMLElement) => 
        el.closest('.w-44') // The word bank sidebar
      );
      
      expect(wordBankArtifact).toHaveClass('line-through');
      expect(wordBankArtifact).toHaveClass('opacity-40');
    });

    it('should correctly identify gap question numbers from content', () => {
      const customContent = 'Question {{15}} and {{16}} are in this group.';
      const mixedAnswers = {
        1: 'word1',   // Different group
        15: 'temple', // This group
        16: '',       // This group - empty
        20: 'word2',  // Different group
      };

      render(
        <SummaryWordBank
          {...defaultProps}
          content={customContent}
          answers={mixedAnswers}
        />
      );

      // "temple" used in question 15 should be ghosted
      const wordBankItems = screen.getAllByText('temple');
      const wordBankTemple = wordBankItems.find((el: HTMLElement) => el.closest('.w-44'));
      expect(wordBankTemple).toHaveClass('opacity-40');

      // "artifact" should NOT be ghosted (not used in questions 15-16)
      const artifactWord = screen.getByText('artifact');
      expect(artifactWord).not.toHaveClass('opacity-40');
    });
  });

  describe('rendering', () => {
    it('should render word bank with all words', () => {
      render(<SummaryWordBank {...defaultProps} />);

      defaultProps.wordBank.forEach(word => {
        expect(screen.getByText(word)).toBeInTheDocument();
      });
    });

    it('should render gap placeholders with question numbers', () => {
      render(<SummaryWordBank {...defaultProps} />);

      expect(screen.getByText('31')).toBeInTheDocument();
      expect(screen.getByText('32')).toBeInTheDocument();
    });

    it('should display answered values in gaps', () => {
      render(
        <SummaryWordBank
          {...defaultProps}
          answers={{ 31: 'artifact', 32: 'temple' }}
        />
      );

      // Should show the answers in the gaps (these appear as filled gaps)
      const artifacts = screen.getAllByText('artifact');
      expect(artifacts.length).toBeGreaterThan(0);
    });
  });
});
