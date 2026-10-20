import { Link } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/button';

export function NotFoundPage(): React.JSX.Element {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background">
      <h1 className="text-4xl font-bold">Page not found</h1>
      <p className="text-muted-foreground">The page you are looking for does not exist.</p>
      <Link to="/dashboard" className={buttonVariants()}>
        Back to dashboard
      </Link>
    </div>
  );
}
