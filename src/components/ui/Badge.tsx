import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type BadgeTone =
  | 'default'
  | 'brand'
  | 'amber'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  children: ReactNode;
}

const toneClasses: Record<BadgeTone, string> = {
  default: 'bg-bg-elevated text-text-secondary border-border-subtle',
  brand: 'bg-brand-primary/12 text-brand-primary border-brand-primary/25',
  amber: 'bg-brand-secondary/15 text-brand-secondary border-brand-secondary/30',
  success: 'bg-status-success/12 text-status-success border-status-success/25',
  warning: 'bg-status-warning/15 text-status-warning border-status-warning/30',
  danger: 'bg-status-danger/12 text-status-danger border-status-danger/25',
  info: 'bg-status-info/12 text-status-info border-status-info/25',
};

export function Badge({
  tone = 'default',
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-tight',
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
