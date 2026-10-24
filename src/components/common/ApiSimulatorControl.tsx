import {
  Activity,
  AlertOctagon,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sliders,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  setApiLatency,
  setForceNextApiError,
  setSimulatorExpanded,
} from '@/app/simulatorSlice';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { mockApi } from '@/services/mockApi';
import type { SimulatorLatency } from '@/types';

const LATENCY_OPTIONS: { value: SimulatorLatency; label: string }[] = [
  { value: 0, label: 'Instant (0ms)' },
  { value: 400, label: 'Realistic (400ms)' },
  { value: 1200, label: 'Slow 3G (1.2s)' },
];

export function ApiSimulatorControl() {
  const dispatch = useAppDispatch();
  const { apiLatencyMs, forceNextApiError, isSimulatorExpanded } = useAppSelector(
    (state) => state.simulator,
  );

  const handleLatencyChange = (latency: SimulatorLatency) => {
    dispatch(setApiLatency(latency));
    dispatch(mockApi.util.invalidateTags(['Menu', 'Stores', 'Promos']));
    toast.info(`Mock API latency set to ${latency}ms`, {
      description: 'Refetching data to demonstrate loading skeletons.',
    });
  };

  const handleTriggerError = () => {
    dispatch(setForceNextApiError(true));
    dispatch(mockApi.util.invalidateTags(['Menu', 'Promos']));
    toast.error('Simulated 503 API Error Armed', {
      description: 'Current query will fail so you can inspect the ErrorState UI.',
    });
  };

  const handleRefetchClean = () => {
    dispatch(setForceNextApiError(false));
    dispatch(mockApi.util.invalidateTags(['Menu', 'Stores', 'Promos']));
    toast.success('Mock API Refetched Cleanly');
  };

  return (
    <div className="fixed bottom-20 left-4 z-40 md:bottom-5">
      {!isSimulatorExpanded ? (
        <button
          type="button"
          onClick={() => dispatch(setSimulatorExpanded(true))}
          className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-bg-surface/95 px-3.5 py-2 text-xs font-semibold text-text-primary shadow-elevated backdrop-blur-md transition-transform hover:scale-105 cursor-pointer"
        >
          <Sliders className="h-3.5 w-3.5 text-brand-primary" />
          <span>Demo API Simulator</span>
          <Badge tone={forceNextApiError ? 'danger' : 'amber'}>
            {forceNextApiError ? 'Error Armed' : `${apiLatencyMs}ms`}
          </Badge>
          <ChevronUp className="h-3.5 w-3.5 text-text-muted" />
        </button>
      ) : (
        <div className="w-80 rounded-2xl border border-border-strong bg-bg-surface/98 p-4 shadow-elevated backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-border-subtle pb-2.5">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-brand-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-text-primary">
                RTK Query Simulator
              </span>
            </div>
            <button
              type="button"
              onClick={() => dispatch(setSimulatorExpanded(false))}
              aria-label="Minimize simulator"
              className="rounded-lg p-1 text-text-muted hover:bg-bg-elevated hover:text-text-primary cursor-pointer"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 space-y-3">
            <div>
              <p className="mb-1.5 text-[11px] font-semibold text-text-secondary">
                Artificial Network Latency (Tests Skeletons)
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {LATENCY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleLatencyChange(opt.value)}
                    className={cn(
                      'rounded-lg border px-2 py-1.5 text-[11px] font-semibold transition-all cursor-pointer',
                      apiLatencyMs === opt.value
                        ? 'border-brand-primary bg-brand-primary/12 text-brand-primary'
                        : 'border-border-subtle bg-bg-elevated text-text-secondary hover:text-text-primary',
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="danger"
                size="sm"
                className="flex-1 text-xs"
                leftIcon={<AlertOctagon className="h-3.5 w-3.5" />}
                onClick={handleTriggerError}
              >
                Simulate 503 Error
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
                onClick={handleRefetchClean}
              >
                Recover
              </Button>
            </div>

            <p className="flex items-center gap-1.5 text-[11px] text-text-muted">
              <Zap className="h-3 w-3 text-brand-secondary shrink-0" />
              Use this panel during client demos to prove loading & error states.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
