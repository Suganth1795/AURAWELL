import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MessageBubble, SupportPanel } from '@/pages/CounselingPage';
import type { ChatMessage } from '@/features/counseling/types';

describe('MessageBubble', () => {
  const base: ChatMessage = {
    id: 'm1',
    role: 'assistant',
    content: 'Here is a supportive reflection.',
    safetyLevel: 'none',
    source: 'fallback',
    createdAt: new Date().toISOString(),
  };

  it('marks offline reflection replies', () => {
    render(<MessageBubble message={base} />);
    expect(screen.getByText('Here is a supportive reflection.')).toBeInTheDocument();
    expect(screen.getByText('Offline reflection')).toBeInTheDocument();
  });

  it('flags safety support on crisis replies', () => {
    render(<MessageBubble message={{ ...base, safetyLevel: 'crisis_support', source: 'canned' }} />);
    expect(screen.getByText('Safety support')).toBeInTheDocument();
    expect(screen.queryByText('Offline reflection')).not.toBeInTheDocument();
  });

  it('renders user messages without badges', () => {
    render(<MessageBubble message={{ ...base, role: 'user', content: 'I feel worried.' }} />);
    expect(screen.getByText('I feel worried.')).toBeInTheDocument();
    expect(screen.queryByText('Safety support')).not.toBeInTheDocument();
  });
});

describe('SupportPanel', () => {
  it('lists crisis resources', () => {
    render(
      <SupportPanel
        resources={[
          { region: 'US', name: '988 Suicide & Crisis Lifeline', contact: 'Call or text 988' },
        ]}
      />,
    );
    expect(screen.getByText(/Suicide & Crisis Lifeline/)).toBeInTheDocument();
    expect(screen.getByText(/Call or text 988/)).toBeInTheDocument();
  });
});
