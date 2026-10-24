import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Unable to reach Melbourne Kitchen API',
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-3xl border border-status-danger/30 bg-status-danger/5 px-6 py-10 text-center"
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-status-danger/15 text-status-danger">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 className="font-display text-lg font-bold text-text-primary">{title}</h3>
      <p className="mt-1 max-w-lg text-sm text-text-secondary">{message}</p>
      {onRetry && (
        <div className="mt-5">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<RotateCcw className="h-4 w-4" />}
            onClick={onRetry}
          >
            Retry Connection
          </Button>
        </div>
      )}
    </div>
  );
}
