import { cn } from '@/lib/cn';

interface BrandLogoProps {
  compact?: boolean;
  className?: string;
}

export function BrandLogo({ compact = false, className }: BrandLogoProps) {
  return (
    <div className={cn('inline-flex items-center gap-2.5 select-none', className)}>
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary text-white shadow-sm">
        <svg
          viewBox="0 0 64 64"
          fill="none"
          className="h-7 w-7"
          aria-hidden="true"
        >
          {/* Southern Cross 5-star constellation + flame crest */}
          <path
            d="M32 7L34.4 14.2L41.6 16.6L34.4 19L32 26.2L29.6 19L22.4 16.6L29.6 14.2L32 7Z"
            fill="#FBBF24"
          />
          <path
            d="M32 37L33.8 42.5L39.3 44.3L33.8 46.1L32 51.6L30.2 46.1L24.7 44.3L30.2 42.5L32 37Z"
            fill="#FFFBEB"
          />
          <path
            d="M15 24L16.5 28.5L21 30L16.5 31.5L15 36L13.5 31.5L9 30L13.5 28.5L15 24Z"
            fill="#FFFBEB"
          />
          <path
            d="M49 22L50.5 26.5L55 28L50.5 29.5L49 34L47.5 29.5L43 28L47.5 26.5L49 22Z"
            fill="#FFFBEB"
          />
          <circle cx="40.5" cy="35.5" r="2.6" fill="#FBBF24" />
        </svg>
      </div>
      {!compact && (
        <div className="leading-none">
          <span className="block font-display text-lg font-extrabold tracking-tight text-text-primary">
            Southern Cross
          </span>
          <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-brand-primary">
            Burgers • Melbourne
          </span>
        </div>
      )}
    </div>
  );
}
