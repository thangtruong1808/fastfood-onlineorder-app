import { cn } from '@/lib/cn';

export interface BrandLogoProps {
  compact?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'invert';
}

export function BrandLogo({
  compact = false,
  className,
  size = 'md',
  variant = 'default',
}: BrandLogoProps) {
  const iconDimensions = {
    sm: 'h-8 w-8 rounded-lg',
    md: 'h-10 w-10 sm:h-11 sm:w-11 rounded-xl',
    lg: 'h-12 w-12 sm:h-14 sm:w-14 rounded-2xl',
  }[size];

  return (
    <div
      className={cn(
        'inline-flex shrink-0 items-center gap-2.5 sm:gap-3 select-none transition-transform active:scale-[0.98]',
        className,
      )}
    >
      {/* Brand Icon Emblem */}
      <div
        className={cn(
          'relative flex shrink-0 items-center justify-center overflow-hidden border border-amber-400/30 bg-gradient-to-br from-brand-primary via-[#C52B14] to-[#991B1B] p-1.5 shadow-md ring-1 ring-black/10',
          iconDimensions,
        )}
      >
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full drop-shadow-xs"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="scb-flame-grad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EA580C" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#FDE68A" />
            </linearGradient>
            <linearGradient id="scb-bun-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>

          {/* Top Golden Brioche Bun with Sesame Seeds */}
          <path
            d="M13 25C13 16 20.5 11 32 11C43.5 11 51 16 51 25C51 26.8 49.5 28 47.5 28H16.5C14.5 28 13 26.8 13 25Z"
            fill="url(#scb-bun-grad)"
          />
          <ellipse cx="24" cy="17" rx="1.5" ry="0.8" transform="rotate(-20 24 17)" fill="#FFFBEB" />
          <ellipse cx="32" cy="15" rx="1.5" ry="0.8" fill="#FFFBEB" />
          <ellipse cx="40" cy="17" rx="1.5" ry="0.8" transform="rotate(20 40 17)" fill="#FFFBEB" />
          <ellipse cx="20" cy="22" rx="1.3" ry="0.7" transform="rotate(-15 20 22)" fill="#FFFBEB" />
          <ellipse cx="44" cy="22" rx="1.3" ry="0.7" transform="rotate(15 44 22)" fill="#FFFBEB" />

          {/* Sizzling Flame Grill Smash Patty Layer */}
          <path
            d="M11 32C13.5 29.5 16.5 34.5 19.5 31.5C22.5 28.5 25.5 34 28.5 31.5C31.5 29 34.5 34 37.5 31.5C40.5 29 43.5 34 46.5 31.5C49.5 29 53 32 53 32C53 34.5 51.5 35.5 49.5 35.5H14.5C12.5 35.5 11 34.5 11 32Z"
            fill="#B91C1C"
          />
          <path
            d="M12 33C14.5 31 17 35 20 33C23 31 26 35 29 33C32 31 35 35 38 33C41 31 44 35 47 33C49 31.8 52 33 52 33"
            stroke="url(#scb-flame-grad)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* Bottom Toasted Bun Heel */}
          <path
            d="M15 41H49C50.5 41 51.5 42.2 51 43.8C49.5 48.5 41.5 52 32 52C22.5 52 14.5 48.5 13 43.8C12.5 42.2 13.5 41 15 41Z"
            fill="url(#scb-bun-grad)"
          />

          {/* Southern Cross Constellation 5 Stars */}
          {/* Alpha Crucis (Bottom star) */}
          <path
            d="M32 43L33 45.2L35.2 46.2L33 47.2L32 49.4L31 47.2L28.8 46.2L31 45.2L32 43Z"
            fill="#FFFFFF"
          />
          {/* Gamma Crucis (Top star above bun) */}
          <path
            d="M32 2L33.3 5L36.3 6.3L33.3 7.6L32 10.6L30.7 7.6L27.7 6.3L30.7 5L32 2Z"
            fill="#FDE047"
          />
          {/* Beta Crucis (Left star) */}
          <path
            d="M6 21L7.2 23.2L9.4 24.4L7.2 25.6L6 27.8L4.8 25.6L2.6 24.4L4.8 23.2L6 21Z"
            fill="#FFFFFF"
          />
          {/* Delta Crucis (Right star) */}
          <path
            d="M58 19L59.2 21.2L61.4 22.4L59.2 23.6L58 25.8L56.8 23.6L54.6 22.4L56.8 21.2L58 19Z"
            fill="#FFFFFF"
          />
          {/* Epsilon Crucis (Fifth small star) */}
          <circle cx="43.5" cy="27" r="1.6" fill="#FDE047" />
        </svg>
      </div>

      {/* Brand Name & Location Subtitle */}
      {!compact && (
        <div className="flex flex-col justify-center whitespace-nowrap">
          <span
            className={cn(
              'font-display font-extrabold tracking-tight leading-none text-text-primary',
              size === 'sm' && 'text-base',
              size === 'md' && 'text-lg sm:text-xl',
              size === 'lg' && 'text-2xl sm:text-3xl',
              variant === 'invert' && 'text-white',
            )}
          >
            Southern Cross
          </span>
          <span
            className={cn(
              'font-extrabold uppercase tracking-[0.2em] leading-none mt-1.5 flex items-center gap-1.5',
              size === 'sm' && 'text-[9px]',
              size === 'md' && 'text-[10px] sm:text-[11px]',
              size === 'lg' && 'text-xs',
              variant === 'invert' ? 'text-amber-300' : 'text-brand-primary',
            )}
          >
            <span>Burgers</span>
            <span className="text-amber-400/80">•</span>
            <span>Melbourne</span>
          </span>
        </div>
      )}
    </div>
  );
}
