import {
  Check,
  ChevronDown,
  Flame,
  Heart,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useAppSelector } from '@/app/hooks';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { ItemCard } from '@/features/menu/ItemCard';
import { ItemDetailModal } from '@/features/menu/ItemDetailModal';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/cn';
import { useGetCategoriesQuery, useGetMenuItemsQuery } from '@/services/mockApi';
import type { MenuCategoryId, MenuItem } from '@/types';

type SortOption =
  | 'popular'
  | 'rating-desc'
  | 'price-asc'
  | 'price-desc'
  | 'calories-asc'
  | 'prep-asc';

const SORT_LABELS: Record<SortOption, string> = {
  popular: 'Popular (Recommended)',
  'rating-desc': 'Highest Rated',
  'price-asc': 'Price: Low to High',
  'price-desc': 'Price: High to Low',
  'calories-asc': 'Lowest Calories',
  'prep-asc': 'Fastest Prep Time',
};

const DIETARY_FILTER_CHIPS = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'gluten-friendly', label: 'Gluten-Friendly' },
  { id: 'spicy', label: 'Spicy' },
  { id: 'chef-special', label: "Chef's Special" },
  { id: 'under-15', label: 'Under $15' },
];

export default function MenuPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = (searchParams.get('category') as MenuCategoryId | null) ?? 'all';

  // Search, Filters & Sort state
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 250);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [selectedItemForModal, setSelectedItemForModal] = useState<MenuItem | null>(null);

  const favoriteIds = useAppSelector((state) => state.auth.favoriteItemIds);

  const { data: categories } = useGetCategoriesQuery();
  const {
    data: allItems,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetMenuItemsQuery();

  // Category counts for horizontal bar
  const categoryItemCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allItems?.length ?? 0 };
    (allItems ?? []).forEach((item) => {
      counts[item.categoryId] = (counts[item.categoryId] || 0) + 1;
    });
    return counts;
  }, [allItems]);

  // Toggle dietary tag
  const handleToggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId],
    );
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchInput('');
    setSelectedTags([]);
    setShowOnlyFavorites(false);
    setSortBy('popular');
    setSearchParams({});
  };

  // Filter and sort items
  const processedItems = useMemo(() => {
    if (!allItems) return [];

    let list = [...allItems];

    // 1. Category filter
    if (activeCategory !== 'all') {
      list = list.filter((item) => item.categoryId === activeCategory);
    }

    // 2. Favorites filter
    if (showOnlyFavorites) {
      list = list.filter((item) => favoriteIds.includes(item.id));
    }

    // 3. Debounced Search query
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.shortDescription.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.dietaryTags.some((tag) => tag.toLowerCase().includes(q)),
      );
    }

    // 4. Dietary tag chips
    if (selectedTags.length > 0) {
      list = list.filter((item) => {
        return selectedTags.every((tag) => {
          if (tag === 'under-15') {
            return item.basePrice < 15;
          }
          return item.dietaryTags.includes(tag as MenuItem['dietaryTags'][number]);
        });
      });
    }

    // 5. Sorting
    list.sort((a, b) => {
      switch (sortBy) {
        case 'rating-desc':
          return b.rating - a.rating;
        case 'price-asc':
          return a.basePrice - b.basePrice;
        case 'price-desc':
          return b.basePrice - a.basePrice;
        case 'calories-asc':
          return a.nutrition.calories - b.nutrition.calories;
        case 'prep-asc':
          return a.prepTimeMinutes - b.prepTimeMinutes;
        case 'popular':
        default:
          if (a.isPopular && !b.isPopular) return -1;
          if (!a.isPopular && b.isPopular) return 1;
          return b.rating - a.rating;
      }
    });

    return list;
  }, [allItems, activeCategory, showOnlyFavorites, favoriteIds, debouncedSearch, selectedTags, sortBy]);

  const activeFiltersCount =
    (activeCategory !== 'all' ? 1 : 0) +
    selectedTags.length +
    (showOnlyFavorites ? 1 : 0) +
    (debouncedSearch.trim() ? 1 : 0);

  return (
    <div className="space-y-6 pb-6">
      {/* Menu Header with Title & Search */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/20 bg-brand-primary/10 px-3 py-1 text-xs font-bold text-brand-primary">
            <Flame className="h-3.5 w-3.5" />
            <span>AUTHENTIC MELBOURNE FAST-FOOD MENU</span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Flame-Grilled Burgers, Chicken &amp; Craft Sides
          </h1>
          <p className="mt-1 text-sm text-text-secondary max-w-2xl">
            Sourced from Gippsland, Macedon Ranges, and Yarra Valley. Customise every item
            with artisan brioche buns, double-smoked bacon, and house-made truffle aioli.
          </p>
        </div>

        {/* Search Input with Clear Button */}
        <div className="w-full sm:w-80 relative">
          <Input
            id="menu-search-input"
            placeholder="Search burgers, wraps, chips..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
          {searchInput && (
            <button
              type="button"
              aria-label="Clear search query"
              onClick={() => setSearchInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-text-muted hover:text-text-primary cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Sticky Horizontal Category Bar */}
      <div className="sticky top-18 z-20 -mx-4 border-y border-border-subtle bg-bg-surface/95 px-4 py-2.5 backdrop-blur-md sm:mx-0 sm:rounded-2xl sm:border sm:px-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setSearchParams({})}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer',
              activeCategory === 'all'
                ? 'bg-brand-primary text-white shadow-xs'
                : 'border border-border-subtle bg-bg-surface text-text-secondary hover:border-brand-primary/50 hover:text-text-primary',
            )}
          >
            <span>All Menu Items</span>
            <span
              className={cn(
                'rounded-full px-1.5 py-0.2 text-[10px] font-extrabold',
                activeCategory === 'all'
                  ? 'bg-white/20 text-white'
                  : 'bg-bg-elevated text-text-muted',
              )}
            >
              {categoryItemCounts.all}
            </span>
          </button>

          {(categories ?? []).map((cat) => {
            const isSelected = activeCategory === cat.id;
            const count = categoryItemCounts[cat.id] ?? 0;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSearchParams({ category: cat.id })}
                className={cn(
                  'inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer',
                  isSelected
                    ? 'bg-brand-primary text-white shadow-xs'
                    : 'border border-border-subtle bg-bg-surface text-text-secondary hover:border-brand-primary/50 hover:text-text-primary',
                )}
              >
                <span>{cat.shortName}</span>
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.2 text-[10px] font-extrabold',
                    isSelected ? 'bg-white/20 text-white' : 'bg-bg-elevated text-text-muted',
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Chips & Sort Controls Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border-subtle bg-bg-surface p-3.5 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Dietary Chips & Favorites */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Favorites Toggle Button */}
          <button
            type="button"
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer',
              showOnlyFavorites
                ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                : 'border-border-subtle bg-bg-elevated text-text-secondary hover:border-border-strong hover:text-text-primary',
            )}
          >
            <Heart className={cn('h-3.5 w-3.5', showOnlyFavorites && 'fill-rose-500')} />
            <span>Favorites</span>
            <span className="rounded-full bg-bg-surface px-1.5 py-0.2 text-[10px] font-bold">
              {favoriteIds.length}
            </span>
          </button>

          <span className="hidden h-4 w-px bg-border-strong sm:inline-block" />

          {/* Dietary Filter Chips */}
          {DIETARY_FILTER_CHIPS.map((chip) => {
            const isSelected = selectedTags.includes(chip.id);
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => handleToggleTag(chip.id)}
                className={cn(
                  'inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer',
                  isSelected
                    ? 'border-brand-primary bg-brand-primary/10 text-brand-primary font-bold shadow-2xs'
                    : 'border-border-subtle bg-bg-elevated text-text-secondary hover:border-border-strong hover:text-text-primary',
                )}
              >
                {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Sort Dropdown & Reset Filters Button */}
        <div className="flex items-center justify-between gap-2.5 sm:justify-end">
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-text-muted hover:bg-bg-elevated hover:text-brand-primary cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset ({activeFiltersCount})</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-text-muted hidden md:inline">Sort:</span>
            <div className="relative">
              <select
                aria-label="Sort menu items"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none rounded-xl border border-border-strong bg-bg-elevated py-1.5 pl-3 pr-8 text-xs font-bold text-text-primary focus:border-brand-primary focus:outline-none cursor-pointer"
              >
                {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                  <option key={key} value={key}>
                    {SORT_LABELS[key]}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
            </div>
          </div>
        </div>
      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between px-1 text-xs text-text-muted">
        <span>
          Showing <strong>{processedItems.length}</strong> items
          {activeCategory !== 'all' && (
            <>
              {' '}
              in <strong className="capitalize text-brand-primary">{activeCategory}</strong>
            </>
          )}
          {debouncedSearch && (
            <>
              {' '}
              matching &quot;<strong>{debouncedSearch}</strong>&quot;
            </>
          )}
        </span>
        <span className="hidden sm:inline">Click any item or &quot;Custom&quot; to configure combos &amp; add-ons</span>
      </div>

      {/* Main Grid: Loading, Error, Empty, or Items */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Card key={idx} className="p-4 space-y-3">
              <Skeleton className="aspect-16/10 w-full rounded-2xl" />
              <div className="flex gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-4/5" />
              <div className="flex justify-between pt-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-8 w-24 rounded-xl" />
              </div>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="Could not load Melbourne menu"
          message={(error as { message?: string })?.message ?? 'Simulated Network Outage'}
          onRetry={() => refetch()}
        />
      ) : processedItems.length === 0 ? (
        <EmptyState
          icon={<SlidersHorizontal className="h-7 w-7" />}
          title="No menu items match your criteria"
          description="Try clearing some dietary filters, search terms, or checking another category."
          actionLabel="Reset All Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {processedItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onOpenCustomization={(i) => setSelectedItemForModal(i)}
            />
          ))}
        </div>
      )}

      {/* Item Customization Modal */}
      <ItemDetailModal
        item={selectedItemForModal}
        open={Boolean(selectedItemForModal)}
        onOpenChange={(open) => {
          if (!open) setSelectedItemForModal(null);
        }}
      />
    </div>
  );
}
