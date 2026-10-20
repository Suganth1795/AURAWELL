import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AssessmentRunner } from '@/features/assessments/AssessmentRunner';
import { AssessmentCard } from '@/features/assessments/AssessmentCard';
import type { AssessmentDetail, AssessmentSummary } from '@/features/assessments/types';

const assessment: AssessmentDetail = {
  code: 'demo',
  version: '1.0.0',
  title: 'Demo check-in',
  description: 'A short demo',
  intro: 'This is a demo check-in.',
  disclaimer: 'Not a diagnosis.',
  estimatedMinutes: 3,
  questions: [
    {
      id: 'q1',
      text: 'How are you?',
      responseType: 'single_choice',
      required: true,
      options: [
        { id: 'good', label: 'Good' },
        { id: 'low', label: 'Low' },
      ],
    },
    {
      id: 'q2',
      text: 'Tell me more',
      responseType: 'short_text',
      required: true,
      maxLength: 100,
      options: [],
      conditional: { dependsOnQuestionId: 'q1', showWhenOptionIds: ['low'] },
    },
    {
      id: 'q3',
      text: 'Rate your week',
      responseType: 'single_choice',
      required: true,
      options: [
        { id: 'r1', label: 'Rough' },
        { id: 'r2', label: 'Fine' },
      ],
    },
  ],
};

describe('AssessmentRunner', () => {
  it('shows the intro before starting', () => {
    render(
      <MemoryRouter>
        <AssessmentRunner assessment={assessment} submitting={false} error={null} onSubmit={() => {}} />
      </MemoryRouter>,
    );
    expect(screen.getByText('This is a demo check-in.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /begin/i })).toBeInTheDocument();
  });

  it('blocks progress until the required question is answered', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AssessmentRunner assessment={assessment} submitting={false} error={null} onSubmit={() => {}} />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole('button', { name: /begin/i }));
    await user.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/please answer/i);
  });

  it('skips conditional questions that do not apply', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <MemoryRouter>
        <AssessmentRunner assessment={assessment} submitting={false} error={null} onSubmit={onSubmit} />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole('button', { name: /begin/i }));
    await user.click(screen.getByLabelText('Good'));
    await user.click(screen.getByRole('button', { name: /next/i }));
    // q2 is hidden because q1 answer was "good" -> q3 appears next.
    expect(screen.getByText('Rate your week')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Fine'));
    await user.click(screen.getByRole('button', { name: /see my results/i }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    const answers = onSubmit.mock.calls[0][0];
    expect(answers.map((a: { questionId: string }) => a.questionId)).toEqual(['q1', 'q3']);
  });

  it('includes conditional questions when triggered', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <MemoryRouter>
        <AssessmentRunner assessment={assessment} submitting={false} error={null} onSubmit={onSubmit} />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole('button', { name: /begin/i }));
    await user.click(screen.getByLabelText('Low'));
    await user.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByText('Tell me more')).toBeInTheDocument();
  });
});

describe('AssessmentCard', () => {
  const summary: AssessmentSummary = {
    code: 'demo',
    title: 'Demo check-in',
    description: 'A short demo',
    category: 'emotional',
    estimatedMinutes: 3,
    questionCount: 3,
    disclaimer: 'Not a diagnosis.',
    version: '1.0.0',
  };

  it('links to the check-in and shows metadata', () => {
    render(
      <MemoryRouter>
        <AssessmentCard assessment={summary} />
      </MemoryRouter>,
    );
    expect(screen.getByText('3 questions')).toBeInTheDocument();
    expect(screen.getByText('Emotional wellness')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /start check-in/i })).toHaveAttribute(
      'href',
      '/assessments/demo',
    );
  });
});
