import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Alert } from '@/components/ui/alert';
import { RadioGroup } from '@/components/ui/radio-group';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/layout/EmptyState';

describe('UI components', () => {
  it('renders an alert with role=alert', () => {
    render(<Alert variant="error">Something went wrong</Alert>);
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
  });

  it('renders a page header with title, description and actions', () => {
    render(
      <PageHeader
        title="Habits"
        description="Small steps"
        actions={<button type="button">Show archived</button>}
      />,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Habits' })).toBeInTheDocument();
    expect(screen.getByText('Small steps')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Show archived' })).toBeInTheDocument();
  });

  it('renders an empty state with title and optional action', () => {
    render(<EmptyState title="No entries yet" action={<button type="button">Add</button>} />);
    expect(screen.getByText('No entries yet')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });

  it('selects a radio option via keyboard-friendly labels', async () => {
    const user = userEvent.setup();
    const onChange = (value: string) => {
      selected = value;
    };
    let selected = 'a';
    render(
      <RadioGroup
        name="mood"
        value={selected}
        onChange={onChange}
        legend="How do you feel?"
        options={[
          { value: 'a', label: 'Great', emoji: '😄' },
          { value: 'b', label: 'Okay', emoji: '😐' },
        ]}
      />,
    );
    await user.click(screen.getByLabelText(/Okay/));
    expect(selected).toBe('b');
  });
});
