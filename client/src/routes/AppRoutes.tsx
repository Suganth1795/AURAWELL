import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';
import { applyPreferences } from '@/utils/applyPreferences';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/features/authentication/LoginPage';
import { RegisterPage } from '@/features/authentication/RegisterPage';
import { ForgotPasswordPage } from '@/features/authentication/ForgotPasswordPage';
import { OnboardingPage } from '@/features/onboarding/OnboardingPage';
import { AppShell } from '@/layouts/AppShell';
import { RequireAuth } from '@/routes/RequireAuth';
import { DashboardPage } from '@/pages/DashboardPage';
import { AssessmentsPage } from '@/pages/AssessmentsPage';
import { GamesPage } from '@/pages/GamesPage';
import { MoodPage } from '@/pages/MoodPage';
import { JournalPage } from '@/pages/JournalPage';
import { SleepPage } from '@/pages/SleepPage';
import { ActivityPage } from '@/pages/ActivityPage';
import { HabitsPage } from '@/pages/HabitsPage';
import { CounselingPage } from '@/pages/CounselingPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { PrivacyPage } from '@/pages/PrivacyPage';
import { SettingsPage } from '@/features/privacy/SettingsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { LoadingState } from '@/components/ui/spinner';

export function AppRoutes(): React.JSX.Element {
  const init = useAuthStore((s) => s.init);
  const initializing = useAuthStore((s) => s.initializing);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    void init();
  }, [init]);

  useEffect(() => {
    applyPreferences(user?.preferences ?? null);
  }, [user]);

  if (initializing) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <LoadingState label="Loading AuraWell AI…" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route
        path="/onboarding"
        element={
          <RequireAuth>
            <OnboardingPage />
          </RequireAuth>
        }
      />
      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/assessments" element={<AssessmentsPage />} />
        <Route path="/games" element={<GamesPage />} />
        <Route path="/mood" element={<MoodPage />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="/sleep" element={<SleepPage />} />
        <Route path="/activity" element={<ActivityPage />} />
        <Route path="/habits" element={<HabitsPage />} />
        <Route path="/counseling" element={<CounselingPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
