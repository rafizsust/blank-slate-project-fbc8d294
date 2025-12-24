import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { MatchingHeadingsDragDrop } from '../MatchingHeadingsDragDrop';

describe('MatchingHeadingsDragDrop', () => {
  const defaultOptions = [
    { id: 'i', text: 'The importance of water' },
    { id: 'ii', text: 'Modern techniques' },
    { id: 'iii', text: 'Historical context' },
    { id: 'iv', text: 'Future predictions' },
  ];

  const defaultProps = {
    options: defaultOptions,
    paragraphLabels: ['A', 'B', 'C'],
    answers: {} as Record<string, string>,
    onAnswerChange: vi.fn(),
    isQuestionPanel: true,
  };

  describe('cross-group scoping', () => {
    it('should not ghost headings used for paragraphs in OTHER groups', () => {
      // Answers include paragraphs from a different passage (D, E) which are NOT in this group
      const answersFromMultipleGroups = {
        'A': '',      // This group - empty
        'B': '',      // This group - empty
        'C': '',      // This group - empty
        'D': 'i',     // DIFFERENT group - uses heading 'i'
        'E': 'ii',    // DIFFERENT group - uses heading 'ii'
      };

      render(
        <MatchingHeadingsDragDrop
          {...defaultProps}
          answers={answersFromMultipleGroups}
        />
      );

      // Heading 'i' and 'ii' should still be visible and draggable
      // because they're used in paragraphs D/E which are NOT in paragraphLabels ['A', 'B', 'C']
      expect(screen.getByText('The importance of water')).toBeInTheDocument();
      expect(screen.getByText('Modern techniques')).toBeInTheDocument();
      
      // They should be draggable (not hidden/replaced with placeholder)
      const heading1 = screen.getByText('The importance of water');
      expect(heading1.closest('[draggable]')).toHaveAttribute('draggable', 'true');
    });

    it('should hide headings used within THIS paragraph group', () => {
      const answersWithinThisGroup = {
        'A': 'i',   // Used in THIS group's paragraph A
        'B': '',    // Empty
        'C': 'ii',  // Used in THIS group's paragraph C
      };

      render(
        <MatchingHeadingsDragDrop
          {...defaultProps}
          answers={answersWithinThisGroup}
        />
      );

      // Heading 'i' should be replaced with empty placeholder (not visible)
      // Note: the component renders an empty div for used headings
      expect(screen.queryByText('The importance of water')).not.toBeInTheDocument();
      expect(screen.queryByText('Modern techniques')).not.toBeInTheDocument();
      
      // Unused headings should still be visible
      expect(screen.getByText('Historical context')).toBeInTheDocument();
      expect(screen.getByText('Future predictions')).toBeInTheDocument();
    });

    it('should correctly scope usedHeadings to only THIS groups paragraphLabels', () => {
      // Complex scenario: multiple groups with overlapping heading usage
      const complexAnswers = {
        'A': 'iii',   // This group uses heading iii
        'B': '',       // Empty
        'C': '',       // Empty
        'X': 'i',      // Different group
        'Y': 'ii',     // Different group
        'Z': 'iv',     // Different group
      };

      render(
        <MatchingHeadingsDragDrop
          {...defaultProps}
          answers={complexAnswers}
        />
      );

      // Only 'iii' should be hidden (used in this group's paragraph A)
      expect(screen.queryByText('Historical context')).not.toBeInTheDocument();
      
      // 'i', 'ii', 'iv' should be visible (used in paragraphs X, Y, Z which are NOT in this group)
      expect(screen.getByText('The importance of water')).toBeInTheDocument();
      expect(screen.getByText('Modern techniques')).toBeInTheDocument();
      expect(screen.getByText('Future predictions')).toBeInTheDocument();
    });
  });

  describe('rendering', () => {
    it('should render all heading options when none are used', () => {
      render(<MatchingHeadingsDragDrop {...defaultProps} />);

      expect(screen.getByText('The importance of water')).toBeInTheDocument();
      expect(screen.getByText('Modern techniques')).toBeInTheDocument();
      expect(screen.getByText('Historical context')).toBeInTheDocument();
      expect(screen.getByText('Future predictions')).toBeInTheDocument();
    });

    it('should render List of Headings title', () => {
      render(<MatchingHeadingsDragDrop {...defaultProps} />);

      expect(screen.getByText('List of Headings')).toBeInTheDocument();
    });

    it('should show click instructions', () => {
      render(<MatchingHeadingsDragDrop {...defaultProps} />);

      expect(screen.getByText(/Click to select/)).toBeInTheDocument();
    });
  });
});
