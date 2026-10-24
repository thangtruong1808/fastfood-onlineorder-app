import {
  Clock,
  Flame,
  Heart,
  Plus,
  SlidersHorizontal,
  Star,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { toggleFavoriteItem } from '@/features/auth-mock/authSlice';
import { addCartItem, setCartDrawerOpen } from '@/features/cart/cartSlice';
import { cn } from '@/lib/cn';
import { formatAUD } from '@/lib/currency';
import type { MenuItem } from '@/types';

export interface ItemCardProps {
  item: MenuItem;
  onOpenCustomization: (item: MenuItem) => void;
}

export function ItemCard({ item, onOpenCustomization }: ItemCardProps) {
  const dispatch = useAppDispatch();
  const favoriteIds = useAppSelector((state) => state.auth.favoriteItemIds);
  const isFavorite = favoriteIds.includes(item.id);
  const [imgError, setImgError] = useState(false);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(toggleFavoriteItem(item.id));
    toast.success(
      isFavorite ? `Removed ${item.name} from favorites` : `Saved ${item.name} to favorites!`,
    );
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    const regularSize = item.sizeOptions[0] ?? {
      id: 'regular',
      label: 'Regular',
      priceDelta: 0,
      caloriesDelta: 0,
    };

    dispatch(
      addCartItem({
        cartItemId: `${item.id}-regular-single`,
        menuItemId: item.id,
        name: item.name,
        imageUrl: item.imageUrl,
        categoryId: item.categoryId,
        basePrice: item.basePrice,
        unitPrice: item.basePrice,
        quantity: 1,
        customization: {
          sizeId: 'regular',
          sizeLabel: regularSize.label,
          isCombo: false,
          selectedAddOns: [],
          removedIngredients: [],
        },
      }),
    );

    toast.success(`Added ${item.name} to bag`, {
      description: `${formatAUD(item.basePrice)} • Single (incl. 10% GST)`,
      action: {
        label: 'View Bag',
        onClick: () => dispatch(setCartDrawerOpen(true)),
      },
    });
  };

  return (
    <article
      tabIndex={0}
      role="button"
      onClick={() => onOpenCustomization(item)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenCustomization(item);
        }
      }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border-subtle bg-bg-surface p-4 text-left shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-brand-primary/60 hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary cursor-pointer"
    >
      <div className="space-y-3">
        {/* Item Image with Badges & Favorite Heart */}
        <div className="relative aspect-16/10 w-full overflow-hidden rounded-2xl bg-neutral-900">
          {!imgError ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              loading="lazy"
              onError={() => setImgError(true)}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div
              className={cn(
                'flex h-full w-full flex-col items-center justify-center bg-gradient-to-br p-4 text-white text-center',
                item.fallbackGradient,
              )}
            >
              <Flame className="h-8 w-8 text-amber-300 mb-1 opacity-80" />
              <p className="font-display text-sm font-bold truncate max-w-full">{item.name}</p>
            </div>
          )}

          {/* Top Left Tags */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
            {item.isFeatured && (
              <Badge tone="brand" className="bg-brand-primary text-white border-none text-[10px] shadow-xs">
                Chef Special
              </Badge>
            )}
            {item.isPopular && (
              <Badge tone="amber" className="bg-black/75 text-amber-300 border-amber-400/30 text-[10px] backdrop-blur-xs">
                Popular
              </Badge>
            )}
            {item.isNew && (
              <Badge tone="info" className="text-[10px]">
                New
              </Badge>
            )}
          </div>

          {/* Top Right Favorite Button */}
          <button
            type="button"
            aria-label={isFavorite ? `Remove ${item.name} from favorites` : `Save ${item.name} to favorites`}
            onClick={handleToggleFavorite}
            className={cn(
              'absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all active:scale-90 cursor-pointer',
              isFavorite
                ? 'bg-rose-500 text-white shadow-md'
                : 'bg-black/50 text-white/80 hover:bg-black/75 hover:text-white',
            )}
          >
            <Heart className={cn('h-4 w-4', isFavorite && 'fill-white')} />
          </button>

          {/* Bottom Overlay: Prep time & Rating */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] font-semibold text-white">
            <span className="flex items-center gap-1 rounded-md bg-black/70 px-2 py-0.5 backdrop-blur-xs">
              <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
              <span>{item.rating.toFixed(1)}</span>
            </span>
            <span className="flex items-center gap-1 rounded-md bg-black/70 px-2 py-0.5 backdrop-blur-xs">
              <Clock className="h-3 w-3 text-brand-primary" />
              <span>~{item.prepTimeMinutes}m</span>
            </span>
          </div>
        </div>

        {/* Dietary & Energy Bar */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="rounded-md bg-bg-elevated px-2 py-0.5 text-[10px] font-bold text-text-secondary">
            {item.nutrition.calories} kcal
          </span>
          {item.dietaryTags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400"
            >
              {tag}
            </span>
          ))}
          {item.dietaryTags.length > 2 && (
            <span className="text-[10px] text-text-muted">+{item.dietaryTags.length - 2}</span>
          )}
        </div>

        {/* Item Title & Short Description */}
        <div>
          <h3 className="font-display text-base font-bold text-text-primary transition-colors group-hover:text-brand-primary line-clamp-1">
            {item.name}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-text-secondary line-clamp-2">
            {item.shortDescription}
          </p>
        </div>
      </div>

      {/* Pricing & Action Buttons */}
      <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-3">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-extrabold text-brand-primary">
              {formatAUD(item.basePrice)}
            </span>
            {item.originalPrice && (
              <span className="text-xs text-text-muted line-through">
                {formatAUD(item.originalPrice)}
              </span>
            )}
          </div>
          <span className="block text-[10px] text-text-muted">incl. 10% GST</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2.5 text-xs text-text-secondary hover:text-text-primary"
            leftIcon={<SlidersHorizontal className="h-3.5 w-3.5" />}
            onClick={(e) => {
              e.stopPropagation();
              onOpenCustomization(item);
            }}
          >
            Custom
          </Button>

          <Button
            variant="primary"
            size="sm"
            className="h-8 px-2.5 text-xs"
            leftIcon={<Plus className="h-3.5 w-3.5" />}
            onClick={handleQuickAdd}
          >
            Add
          </Button>
        </div>
      </div>
    </article>
  );
}

