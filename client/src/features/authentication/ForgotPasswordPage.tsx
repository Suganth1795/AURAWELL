import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api, ApiError } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';

const schema = z.object({ email: z.string().email('Enter a valid email') });
const resetSchema = z.object({
  token: z.string().min(32),
  password: z.string().min(8).regex(/[a-zA-Z]/).regex(/[0-9]|[^a-zA-Z0-9]/),
});
type Form = z.infer<typeof schema>;

export function ForgotPasswordPage(): React.JSX.Element {
  const [sent, setSent] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resetDone, setResetDone] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const resetForm = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
  });

  async function onSubmit(values: Form) {
    setError(null);
    try {
      const data = await api.post<{ devToken?: string }>('/auth/request-password-reset', values);
      setSent(true);
      setDevToken(data.devToken ?? null);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Request failed');
    }
  }

  async function onReset(values: z.infer<typeof resetSchema>) {
    setError(null);
    try {
      await api.post('/auth/reset-password', values);
      setResetDone(true);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Reset failed');
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Reset your password</CardTitle>
          <CardDescription>
            We will send a reset link to your email. (In this development build the token is shown
            on screen instead of being emailed.)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? <Alert variant="error">{error}</Alert> : null}
          {resetDone ? (
            <Alert variant="success">Password updated. You can sign in now.</Alert>
          ) : sent ? (
            <>
              {devToken ? (
                <Alert variant="info">
                  Development reset token: <code className="break-all">{devToken}</code>
                </Alert>
              ) : null}
              <form onSubmit={resetForm.handleSubmit(onReset)} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="token">Reset token</Label>
                  <Input id="token" {...resetForm.register('token')} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="new-password">New password</Label>
                  <Input id="new-password" type="password" {...resetForm.register('password')} />
                </div>
                <Button type="submit" className="w-full">
                  Set new password
                </Button>
              </form>
            </>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
              </div>
              <Button type="submit" className="w-full">
                Send reset link
              </Button>
            </form>
          )}
          <p className="text-center text-sm">
            <Link to="/login" className="text-primary hover:underline">
              Back to sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
