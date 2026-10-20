import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';

const registerSchema = z
  .object({
    displayName: z.string().min(2, 'At least 2 characters').max(60),
    email: z.string().email('Enter a valid email'),
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[a-zA-Z]/, 'Include at least one letter')
      .regex(/[0-9]|[^a-zA-Z0-9]/, 'Include at least one number or symbol'),
    birthYear: z
      .number({ error: 'Enter your birth year' })
      .int('Enter a valid year')
      .min(new Date().getFullYear() - 110, 'Enter a valid year')
      .max(new Date().getFullYear() - 3, 'Enter a valid year'),
    guardianName: z.string().max(80).optional(),
    guardianConsent: z.boolean(),
    termsOfService: z.boolean(),
    privacyPolicy: z.boolean(),
    aiWellnessData: z.boolean(),
  })
  .refine((data) => data.birthYear >= new Date().getFullYear() - 110 && data.birthYear <= new Date().getFullYear() - 3, {
    message: 'Enter a valid birth year',
    path: ['birthYear'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export function RegisterPage(): React.JSX.Element {
  const register = useAuthStore((s) => s.register);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register: field,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      guardianConsent: false,
      termsOfService: false,
      privacyPolicy: false,
      aiWellnessData: false,
    },
  });

  const birthYearValue = watch('birthYear');
  const isChild = useMemo(() => {
    const year = Number(birthYearValue);
    if (!Number.isFinite(year)) return false;
    return new Date().getFullYear() - year < 13;
  }, [birthYearValue]);

  async function onSubmit(values: RegisterForm) {
    clearError();
    setSubmitting(true);
    try {
      await register({
        email: values.email,
        password: values.password,
        displayName: values.displayName,
        birthYear: values.birthYear,
        guardianConsent: values.guardianConsent,
        guardianName: values.guardianName || undefined,
        consents: {
          termsOfService: values.termsOfService,
          privacyPolicy: values.privacyPolicy,
          aiWellnessData: values.aiWellnessData,
        },
      });
      navigate('/onboarding', { replace: true });
    } catch {
      /* error surfaced from store */
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-xl">Create your AuraWell account</CardTitle>
          <CardDescription>
            A few details to set up a safe, age-appropriate wellness space.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          ) : null}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="displayName">Display name</Label>
              <Input id="displayName" autoComplete="nickname" {...field('displayName')} />
              {errors.displayName ? (
                <p className="text-xs text-destructive">{errors.displayName.message}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...field('email')} />
              {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="new-password" {...field('password')} />
              {errors.password ? (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="birthYear">Birth year</Label>
              <Input
                id="birthYear"
                type="number"
                inputMode="numeric"
                {...field('birthYear', { valueAsNumber: true })}
              />
              {errors.birthYear ? (
                <p className="text-xs text-destructive">{errors.birthYear.message}</p>
              ) : null}
              <p className="text-xs text-muted-foreground">
                Used only to adapt content to your age group. You can update it later in settings.
              </p>
            </div>

            {isChild ? (
              <div className="space-y-3 rounded-md border border-warning/50 bg-warning/10 p-3">
                <p className="text-sm font-medium">Parent or guardian consent required</p>
                <p className="text-xs text-muted-foreground">
                  Accounts for children under 13 need a parent or guardian. A guardian name is
                  recorded with the consent record. AI conversations are not enabled for children;
                  they receive structured, age-appropriate activities instead.
                </p>
                <div className="space-y-1.5">
                  <Label htmlFor="guardianName">Guardian name</Label>
                  <Input id="guardianName" {...field('guardianName')} />
                </div>
                <Checkbox
                  label="I am the parent or guardian of this child and I consent to this account."
                  {...field('guardianConsent')}
                />
                {errors.guardianConsent ? (
                  <p className="text-xs text-destructive">{errors.guardianConsent.message}</p>
                ) : null}
              </div>
            ) : null}

            <div className="space-y-3">
              <Checkbox
                label="I agree to the terms of service"
                {...field('termsOfService')}
              />
              {errors.termsOfService ? (
                <p className="text-xs text-destructive">{errors.termsOfService.message}</p>
              ) : null}
              <Checkbox
                label="I agree to the privacy policy"
                {...field('privacyPolicy')}
              />
              {errors.privacyPolicy ? (
                <p className="text-xs text-destructive">{errors.privacyPolicy.message}</p>
              ) : null}
              <Checkbox
                label="Allow optional AI wellness features to use my activity data (can be changed later)"
                description="Assessment results and check-ins are never sent unless you enable this."
                {...field('aiWellnessData')}
              />
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Creating account…' : 'Create account'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
