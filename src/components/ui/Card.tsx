import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  elevated?: boolean;
  children: ReactNode;
}

export function Card({
  className,
  interactive = false,
  elevated = false,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border-subtle bg-bg-surface text-text-primary transition-all duration-200',
        elevated ? 'shadow-elevated' : 'shadow-card',
        interactive &&
          'hover:-translate-y-0.5 hover:border-border-strong hover:shadow-elevated cursor-pointer',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
