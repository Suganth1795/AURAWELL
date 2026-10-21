import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, FileText, ShieldCheck, Trash2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { Modal } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingState } from '@/components/ui/spinner';
import { useAsync } from '@/hooks/useAsync';
import { api, ApiError } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import { privacyService } from '@/features/privacy/privacyService';

const COUNT_LABELS: { key: string; label: string }[] = [
  { key: 'assessments', label: 'Check-ins' },
  { key: 'goals', label: 'Goals' },
  { key: 'recommendations', label: 'Recommendations' },
  { key: 'games', label: 'Game sessions' },
  { key: 'mood', label: 'Mood entries' },
  { key: 'journal', label: 'Journal entries' },
  { key: 'sleep', label: 'Sleep records' },
  { key: 'activity', label: 'Activity records' },
  { key: 'habits', label: 'Habits' },
  { key: 'counselingSessions', label: 'AURA conversations' },
  { key: 'counselingMessages', label: 'AURA messages' },
];

export function formatConsentType(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function PrivacyPage(): React.JSX.Element {
  const { data, error, loading, reload } = useAsync(() => privacyService.overview(), []);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  async function handleExport(): Promise<void> {
    setExporting(true);
    setExportError(null);
    try {
      const bundle = await privacyService.exportData();
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `aurawell-export-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setExportError(e instanceof ApiError ? e.message : 'Could not create your export.');
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Privacy centre</h1>
        <p className="text-sm text-muted-foreground">
          Your data belongs to you. Review consent, download a copy, or delete your account.
        </p>
      </div>

      {error ? (
        <Alert variant="error">
          {error.message}{' '}
          <button type="button" className="underline" onClick={reload}>
            Retry
          </button>
        </Alert>
      ) : null}
      {loading ? <LoadingState label="Loading your privacy settings…" /> : null}

      {data ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
                AI data consent
              </CardTitle>
              <CardDescription>
                These switches control whether your wellness data may be sent to an external AI
                provider. AURA still works offline when they are off.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span>AI wellness data</span>
                <Badge variant={data.consents.current.aiWellnessDataConsent ? 'success' : 'secondary'}>
                  {data.consents.current.aiWellnessDataConsent ? 'Allowed' : 'Not allowed'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Journal AI processing</span>
                <Badge variant={data.consents.current.journalAiConsent ? 'success' : 'secondary'}>
                  {data.consents.current.journalAiConsent ? 'Allowed' : 'Not allowed'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Change these anytime in Settings → AI &amp; privacy.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
                Consent records
              </CardTitle>
              <CardDescription>The latest decision recorded for each agreement.</CardDescription>
            </CardHeader>
            <CardContent>
              {data.consents.history.length === 0 ? (
                <p className="text-sm text-muted-foreground">No consent records yet.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {data.consents.history.map((item) => (
                    <li
                      key={item.type}
                      className="flex items-center justify-between border-b pb-2 last:border-0"
                    >
                      <span>{formatConsentType(item.type)}</span>
                      <span className="flex items-center gap-2">
                        <Badge variant={item.granted ? 'success' : 'secondary'}>
                          {item.granted ? 'Granted' : 'Declined'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          v{item.version} · {new Date(item.latestAt).toLocaleDateString()}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">What we store about you</CardTitle>
              <CardDescription>Counts by data type. Nothing here is sold or shared.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {COUNT_LABELS.map(({ key, label }) => (
                  <div key={key} className="rounded-md border p-3">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-lg font-semibold">
                      {(data.counts as Record<string, number>)[key] ?? 0}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Download className="h-4 w-4 text-primary" aria-hidden="true" />
                Export your data
              </CardTitle>
              <CardDescription>
                Download a JSON copy of everything AuraWell stores about you (format v
                {data.export.formatVersion}). Passwords and security secrets are never included.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {exportError ? <Alert variant="error">{exportError}</Alert> : null}
              <Button onClick={handleExport} disabled={exporting}>
                <Download className="h-4 w-4" aria-hidden="true" />
                {exporting ? 'Preparing…' : 'Download my data'}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-destructive/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-destructive">
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Delete account
              </CardTitle>
              <CardDescription>
                This soft-deletes your account and signs you out. Your data is retained for recovery
                but is no longer accessible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
                Delete my account
              </Button>
            </CardContent>
          </Card>
        </>
      ) : null}

      <DeleteAccountModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={reload}
      />
    </div>
  );
}

function DeleteAccountModal({
  open,
  onOpenChange,
  onDeleted,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}): React.JSX.Element {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm(): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      await api.post('/users/account/delete', { password });
      await logout();
      navigate('/');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not delete your account.');
      setBusy(false);
      onDeleted();
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Delete your account?"
      description="Enter your password to confirm. This cannot be undone from the app."
    >
      <div className="space-y-4">
        {error ? <Alert variant="error">{error}</Alert> : null}
        <div className="space-y-1.5">
          <Label htmlFor="delete-password">Password</Label>
          <Input
            id="delete-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={confirm} disabled={busy || !password}>
            {busy ? 'Deleting…' : 'Delete account'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
