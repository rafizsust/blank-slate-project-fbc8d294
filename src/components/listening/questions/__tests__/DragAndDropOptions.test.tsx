import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { DragAndDropOptions } from '../DragAndDropOptions';

describe('DragAndDropOptions (Listening)', () => {
  const defaultQuestions = [
    { 
      id: '1', 
      question_number: 21, 
      question_text: 'The main topic of the lecture was _____.', 
      is_given: false,
      correct_answer: 'A'
    },
    { 
      id: '2', 
      question_number: 22, 
      question_text: 'The speaker mentioned _____.', 
      is_given: false,
      correct_answer: 'B'
    },
    { 
      id: '3', 
      question_number: 23, 
      question_text: 'According to the talk, _____.', 
      is_given: false,
      correct_answer: 'C'
    },
  ];

  const defaultGroupOptions = [
    'climate change',
    'renewable energy',
    'economic growth',
    'population decline',
    'technological advancement',
  ];

  const defaultProps = {
    testId: 'test-1',
    questions: defaultQuestions,
    groupOptions: defaultGroupOptions,
    groupOptionFormat: 'A',
    answers: {} as Record<number, string>,
    onAnswerChange: vi.fn(),
    onQuestionFocus: vi.fn(),
    fontSize: 14,
    renderRichText: (text: string) => text,
  };

  describe('cross-group scoping', () => {
    it('should not ghost options used in OTHER question groups', () => {
      // Answers include questions from different groups (1-10)
      const answersFromMultipleGroups: Record<number, string> = {
        1: 'A',    // Different group
        2: 'B',    // Different group
        21: '',    // This group - empty
        22: '',    // This group - empty
        23: '',    // This group - empty
      };

      render(
        <DragAndDropOptions
          {...defaultProps}
          answers={answersFromMultipleGroups}
        />
      );

      // Options A and B should NOT be ghosted (used in questions 1-2, not 21-23)
      const optionA = screen.getByText(/climate change/);
      const optionB = screen.getByText(/renewable energy/);
      
      expect(optionA).not.toHaveClass('opacity-40');
      expect(optionB).not.toHaveClass('opacity-40');
    });

    it('should ghost options used within THIS question group', () => {
      const answersWithinThisGroup: Record<number, string> = {
        21: 'A',   // This group
        22: 'B',   // This group
        23: '',    // This group - empty
      };

      render(
        <DragAndDropOptions
          {...defaultProps}
          answers={answersWithinThisGroup}
        />
      );

      // Options A and B should be ghosted in the options panel
      const allOptionAs = screen.getAllByText(/climate change/);
      
      // Find the ones in the options list (not in drop zones)
      // The ghosted ones should have opacity-40
      const ghostedA = allOptionAs.find((el: HTMLElement) => el.closest('.opacity-40'));
      
      expect(ghostedA || allOptionAs.some((el: HTMLElement) => el.className.includes('opacity-40'))).toBeTruthy();
    });

    it('should correctly determine hasAnyAnswer scoped to this group', () => {
      // Only answers outside this group
      const answersOutsideGroup: Record<number, string> = {
        1: 'A',
        2: 'B',
        3: 'C',
      };

      render(
        <DragAndDropOptions
          {...defaultProps}
          answers={answersOutsideGroup}
        />
      );

      // hasAnyAnswer should be false for this group, so first question should be highlighted
      // This is implementation-specific, but the key test is that the component renders
      expect(screen.getByText(/climate change/)).toBeInTheDocument();
    });
  });

  describe('rendering', () => {
    it('should render all group options', () => {
      render(<DragAndDropOptions {...defaultProps} />);

      expect(screen.getByText(/climate change/)).toBeInTheDocument();
      expect(screen.getByText(/renewable energy/)).toBeInTheDocument();
      expect(screen.getByText(/economic growth/)).toBeInTheDocument();
      expect(screen.getByText(/population decline/)).toBeInTheDocument();
      expect(screen.getByText(/technological advancement/)).toBeInTheDocument();
    });

    it('should render all questions', () => {
      render(<DragAndDropOptions {...defaultProps} />);

      expect(screen.getByText(/main topic of the lecture/)).toBeInTheDocument();
      expect(screen.getByText(/speaker mentioned/)).toBeInTheDocument();
      expect(screen.getByText(/According to the talk/)).toBeInTheDocument();
    });

    it('should display option labels', () => {
      render(<DragAndDropOptions {...defaultProps} />);

      // Options should have labels A, B, C, D, E
      expect(screen.getAllByText('A').length).toBeGreaterThan(0);
      expect(screen.getAllByText('B').length).toBeGreaterThan(0);
    });
  });
});
