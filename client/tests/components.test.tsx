import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Alert } from '@/components/ui/alert';
import { RadioGroup } from '@/components/ui/radio-group';

describe('UI components', () => {
  it('renders an alert with role=alert', () => {
    render(<Alert variant="error">Something went wrong</Alert>);
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
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
