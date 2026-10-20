import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/utils/cn';

const INTERESTS = [
  { id: 'sleep', label: 'Better sleep' },
  { id: 'focus', label: 'Focus and study' },
  { id: 'mood', label: 'Understanding feelings' },
  { id: 'stress', label: 'Managing stress' },
  { id: 'habits', label: 'Building habits' },
  { id: 'movement', label: 'Physical activity' },
  { id: 'social', label: 'Social connection' },
  { id: 'strengths', label: 'My strengths' },
];

const GOAL_SUGGESTIONS: Record<string, string[]> = {
  child: ['Feel calmer at bedtime', 'Play a focus game every day', 'Notice happy moments'],
  teen: ['Sleep before 11pm on school nights', 'Study in short focus sessions', 'Check in with my mood daily'],
  adult: ['Keep a consistent bedtime', 'Move for 20 minutes most days', 'Journal twice a week'],
  older_adult: ['Keep a gentle daily routine', 'Stay connected with friends', 'Try a relaxation exercise weekly'],
};

const ACTIVITY_PREFS = [
  { id: 'games', label: 'Games' },
  { id: 'journal', label: 'Journaling' },
  { id: 'movement', label: 'Movement' },
  { id: 'breathing', label: 'Breathing exercises' },
  { id: 'reflection', label: 'Reflection' },
  { id: 'sleep', label: 'Sleep routines' },
];

export function OnboardingPage(): React.JSX.Element {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [interests, setInterests] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [preferredActivities, setPreferredActivities] = useState<string[]>([]);
  const [fontScale, setFontScale] = useState(user?.preferences.fontScale ?? 1);
  const [audioInstructions, setAudioInstructions] = useState(
    user?.preferences.audioInstructions ?? false,
  );
  const [reduceMotion, setReduceMotion] = useState(user?.preferences.reduceMotion ?? false);
  const [notifications, setNotifications] = useState({
    dailyCheckIn: true,
    weeklySummary: true,
    habitReminders: true,
  });

  const ageGroup = user?.ageGroup ?? 'adult';
  const goalSuggestions = GOAL_SUGGESTIONS[ageGroup] ?? GOAL_SUGGESTIONS.adult;

  const steps = [
    {
      title: 'Nice to meet you',
      description: 'How should AuraWell address you?',
    },
    {
      title: 'What interests you?',
      description: 'Pick anything you would like to work on. You can change this later.',
    },
    {
      title: 'Personal goals',
      description: 'Choose a suggested goal or write your own (up to 3).',
    },
    {
      title: 'How do you like to practise?',
      description: 'We will prioritise these activity types in your recommendations.',
    },
    {
      title: 'Accessibility and reminders',
      description: 'Make the app comfortable for you.',
    },
  ];

  function toggle(list: string[], setList: (v: string[]) => void, id: string, max: number) {
    if (list.includes(id)) setList(list.filter((v) => v !== id));
    else if (list.length < max) setList([...list, id]);
  }

  async function finish() {
    setSubmitting(true);
    setError(null);
    try {
      const result = await api.put<{
        user: import('@/types').User;
        onboarding: unknown;
      }>('/users/onboarding', {
        displayName: displayName.trim(),
        interests,
        goals,
        preferredActivities,
        accessibility: { fontScale, audioInstructions, reduceMotion },
        notifications,
      });
      setUser(result.user);
      navigate('/dashboard', { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  const canNext =
    step === 0
      ? displayName.trim().length >= 2
      : step === 2
        ? goals.length > 0
        : true;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{steps[step].title}</CardTitle>
            <span className="text-sm text-muted-foreground">
              Step {step + 1} of {steps.length}
            </span>
          </div>
          <CardDescription>{steps[step].description}</CardDescription>
          <div className="mt-2 flex gap-1" aria-hidden="true">
            {steps.map((s, i) => (
              <div
                key={s.title}
                className={cn(
                  'h-1.5 flex-1 rounded-full',
                  i <= step ? 'bg-primary' : 'bg-muted',
                )}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          ) : null}

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.2 }}
              className="min-h-64 space-y-4"
            >
              {step === 0 ? (
                <div className="space-y-1.5">
                  <Label htmlFor="ob-name">Display name</Label>
                  <Input
                    id="ob-name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    maxLength={60}
                  />
                </div>
              ) : null}

              {step === 1 ? (
                <div className="grid grid-cols-2 gap-2">
                  {INTERESTS.map((interest) => (
                    <Checkbox
                      key={interest.id}
                      label={interest.label}
                      checked={interests.includes(interest.id)}
                      onChange={() => toggle(interests, setInterests, interest.id, 10)}
                    />
                  ))}
                </div>
              ) : null}

              {step === 2 ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    {goalSuggestions.map((goal) => (
                      <Checkbox
                        key={goal}
                        label={goal}
                        checked={goals.includes(goal)}
                        onChange={() => toggle(goals, setGoals, goal, 3)}
                      />
                    ))}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="custom-goal">Or write your own goal</Label>
                    <Input
                      id="custom-goal"
                      placeholder="My own goal…"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const value = (e.target as HTMLInputElement).value.trim();
                          if (value.length >= 3 && goals.length < 3 && !goals.includes(value)) {
                            setGoals([...goals, value]);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      Press Enter to add. Current: {goals.length}/3
                    </p>
                  </div>
                </div>
              ) : null}

              {step === 3 ? (
                <div className="grid grid-cols-2 gap-2">
                  {ACTIVITY_PREFS.map((activity) => (
                    <Checkbox
                      key={activity.id}
                      label={activity.label}
                      checked={preferredActivities.includes(activity.id)}
                      onChange={() =>
                        toggle(preferredActivities, setPreferredActivities, activity.id, 6)
                      }
                    />
                  ))}
                </div>
              ) : null}

              {step === 4 ? (
                <div className="space-y-5">
                  <Slider
                    label="Text size"
                    min={0.85}
                    max={1.5}
                    step={0.05}
                    value={fontScale}
                    onValueChange={setFontScale}
                  />
                  <Checkbox
                    label="Prefer audio instructions where available"
                    checked={audioInstructions}
                    onChange={(e) => setAudioInstructions(e.target.checked)}
                  />
                  <Checkbox
                    label="Reduce animations and motion"
                    checked={reduceMotion}
                    onChange={(e) => setReduceMotion(e.target.checked)}
                  />
                  <div className="space-y-2 border-t border-border pt-4">
                    <p className="text-sm font-medium">Reminders</p>
                    <Checkbox
                      label="Daily mood check-in reminder"
                      checked={notifications.dailyCheckIn}
                      onChange={(e) =>
                        setNotifications({ ...notifications, dailyCheckIn: e.target.checked })
                      }
                    />
                    <Checkbox
                      label="Weekly summary"
                      checked={notifications.weeklySummary}
                      onChange={(e) =>
                        setNotifications({ ...notifications, weeklySummary: e.target.checked })
                      }
                    />
                    <Checkbox
                      label="Habit reminders"
                      checked={notifications.habitReminders}
                      onChange={(e) =>
                        setNotifications({ ...notifications, habitReminders: e.target.checked })
                      }
                    />
                  </div>
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex justify-between">
            <Button
              variant="outline"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
            </Button>
            {step < steps.length - 1 ? (
              <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext}>
                Next <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            ) : (
              <Button onClick={finish} disabled={submitting}>
                <Check className="h-4 w-4" aria-hidden="true" />
                {submitting ? 'Saving…' : 'Finish'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
