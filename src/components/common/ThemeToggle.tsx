import { Monitor, Moon, Sun } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/cn';
import type { ThemeMode } from '@/types';

const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: typeof Sun }[] = [
  { mode: 'light', label: 'Light Mode', icon: Sun },
  { mode: 'dark', label: 'Dark Mode', icon: Moon },
  { mode: 'system', label: 'System Preference', icon: Monitor },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="group"
      aria-label="Color theme selector"
      className="inline-flex items-center rounded-xl border border-border-subtle bg-bg-elevated p-1"
    >
      {THEME_OPTIONS.map(({ mode, label, icon: Icon }) => {
        const isActive = theme === mode;
        return (
          <Tooltip key={mode} content={label}>
            <button
              type="button"
              onClick={() => setTheme(mode)}
              aria-label={label}
              aria-pressed={isActive}
              className={cn(
                'inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary',
                isActive
                  ? 'bg-bg-surface text-brand-primary shadow-xs'
                  : 'text-text-muted hover:text-text-primary',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          </Tooltip>
        );
      })}
    </div>
  );
}
