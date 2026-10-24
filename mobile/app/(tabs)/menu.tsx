import { useLocalSearchParams } from 'expo-router';
import {
  Flame,
  Heart,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useAppSelector } from '@/app/hooks';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { ItemCard } from '@/features/menu/ItemCard';
import { ItemDetailSheet } from '@/features/menu/ItemDetailSheet';
import { useDebounce } from '@/hooks/useDebounce';
import { useTheme } from '@/hooks/useTheme';
import { useGetCategoriesQuery, useGetMenuItemsQuery } from '@/services/mockApi';
import type { MenuCategoryId, MenuItem } from '@/types';

type SortOption =
  | 'popular'
  | 'rating-desc'
  | 'price-asc'
  | 'price-desc'
  | 'calories-asc'
  | 'prep-asc';

const SORT_OPTIONS: Array<{ id: SortOption; label: string }> = [
  { id: 'popular', label: 'Popular' },
  { id: 'rating-desc', label: 'Top Rated' },
  { id: 'price-asc', label: 'Price: Low-High' },
  { id: 'price-desc', label: 'Price: High-Low' },
  { id: 'calories-asc', label: 'Lowest Cal' },
  { id: 'prep-asc', label: 'Fastest Prep' },
];

const DIETARY_FILTER_CHIPS = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'gluten-friendly', label: 'Gluten-Friendly' },
  { id: 'spicy', label: 'Spicy' },
  { id: 'chef-special', label: "Chef's Special" },
  { id: 'under-15', label: 'Under A$15' },
];

export default function MenuTabScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ category?: string }>();

  const [activeCategory, setActiveCategory] = useState<MenuCategoryId | 'all'>('all');
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 250);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [selectedItemForModal, setSelectedItemForModal] = useState<MenuItem | null>(null);

  useEffect(() => {
    if (params.category) {
      setActiveCategory(params.category as MenuCategoryId);
    }
  }, [params.category]);

  const favoriteIds = useAppSelector((state) => state.auth.favoriteItemIds);

  const { data: categories } = useGetCategoriesQuery();
  const {
    data: allItems,
    isLoading,
    isError,
    refetch,
  } = useGetMenuItemsQuery();

  const categoryItemCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allItems?.length ?? 0 };
    (allItems ?? []).forEach((item) => {
      counts[item.categoryId] = (counts[item.categoryId] || 0) + 1;
    });
    return counts;
  }, [allItems]);

  const handleToggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId],
    );
  };

  const handleResetFilters = () => {
    setActiveCategory('all');
    setSearchInput('');
    setSelectedTags([]);
    setShowOnlyFavorites(false);
    setSortBy('popular');
  };

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

    // 3. Debounced search query
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

    // 4. Dietary / Under-$15 tag chips
    if (selectedTags.length > 0) {
      list = list.filter((item) =>
        selectedTags.every((tag) => {
          if (tag === 'under-15') {
            return item.basePrice < 15;
          }
          return item.dietaryTags.includes(tag as MenuItem['dietaryTags'][number]);
        }),
      );
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
          return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0) || b.reviewCount - a.reviewCount;
      }
    });

    return list;
  }, [allItems, activeCategory, showOnlyFavorites, favoriteIds, debouncedSearch, selectedTags, sortBy]);

  const hasActiveFilters =
    activeCategory !== 'all' ||
    Boolean(searchInput.trim()) ||
    selectedTags.length > 0 ||
    showOnlyFavorites ||
    sortBy !== 'popular';

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 110, gap: 16 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Flame size={20} color={colors.brandPrimary} />
            <Text style={{ color: colors.textPrimary, fontSize: 23, fontWeight: '900' }}>
              Melbourne Kitchen Menu
            </Text>
          </View>
          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
            100% Gippsland grass-fed beef & Victorian free-range chicken • AUD incl. 10% GST
          </Text>
        </View>

        {/* Search Input with Clear Button */}
        <Input
          placeholder="Search burgers, hot honey chicken, chips, vegan..."
          value={searchInput}
          onChangeText={setSearchInput}
          leftIcon={<Search size={16} color={colors.textMuted} />}
          rightElement={
            searchInput ? (
              <Pressable onPress={() => setSearchInput('')}>
                <X size={16} color={colors.textMuted} />
              </Pressable>
            ) : null
          }
        />

        {/* Horizontal Category Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          <Pressable
            onPress={() => setActiveCategory('all')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 14,
              paddingVertical: 9,
              borderRadius: 999,
              backgroundColor:
                activeCategory === 'all' ? colors.brandPrimary : colors.bgSurface,
              borderWidth: 1,
              borderColor:
                activeCategory === 'all' ? colors.brandPrimary : colors.borderSubtle,
            }}
          >
            <Text
              style={{
                color: activeCategory === 'all' ? '#FFFFFF' : colors.textPrimary,
                fontSize: 12,
                fontWeight: '800',
              }}
            >
              All Menu ({categoryItemCounts.all ?? 0})
            </Text>
          </Pressable>

          {(categories ?? []).map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <Pressable
                key={cat.id}
                onPress={() => setActiveCategory(cat.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 14,
                  paddingVertical: 9,
                  borderRadius: 999,
                  backgroundColor: isSelected ? colors.brandPrimary : colors.bgSurface,
                  borderWidth: 1,
                  borderColor: isSelected ? colors.brandPrimary : colors.borderSubtle,
                }}
              >
                <Text
                  style={{
                    color: isSelected ? '#FFFFFF' : colors.textPrimary,
                    fontSize: 12,
                    fontWeight: '800',
                  }}
                >
                  {cat.shortName} ({categoryItemCounts[cat.id] ?? 0})
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Dietary & Favorites Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {/* Saved Favorites Toggle */}
          <Pressable
            onPress={() => setShowOnlyFavorites((prev) => !prev)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              paddingHorizontal: 12,
              paddingVertical: 7,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: showOnlyFavorites ? '#F43F5E' : colors.borderStrong,
              backgroundColor: showOnlyFavorites
                ? 'rgba(244, 63, 94, 0.14)'
                : colors.bgSurface,
            }}
          >
            <Heart
              size={13}
              color={showOnlyFavorites ? '#F43F5E' : colors.textSecondary}
              fill={showOnlyFavorites ? '#F43F5E' : 'transparent'}
            />
            <Text
              style={{
                color: showOnlyFavorites ? '#F43F5E' : colors.textSecondary,
                fontSize: 11,
                fontWeight: '800',
              }}
            >
              Saved ({favoriteIds.length})
            </Text>
          </Pressable>

          {DIETARY_FILTER_CHIPS.map((chip) => {
            const isSelected = selectedTags.includes(chip.id);
            return (
              <Pressable
                key={chip.id}
                onPress={() => handleToggleTag(chip.id)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: isSelected ? colors.brandPrimary : colors.borderStrong,
                  backgroundColor: isSelected ? colors.bgElevated : colors.bgSurface,
                }}
              >
                <Text
                  style={{
                    color: isSelected ? colors.brandPrimary : colors.textSecondary,
                    fontSize: 11,
                    fontWeight: '800',
                  }}
                >
                  {chip.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Sort Bar */}
        <View style={{ gap: 8 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <SlidersHorizontal size={13} color={colors.textMuted} />
              <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '700' }}>
                Sort by:
              </Text>
            </View>

            {hasActiveFilters ? (
              <Pressable
                onPress={handleResetFilters}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
              >
                <RotateCcw size={12} color={colors.brandPrimary} />
                <Text
                  style={{
                    color: colors.brandPrimary,
                    fontSize: 11,
                    fontWeight: '800',
                  }}
                >
                  Reset Filters
                </Text>
              </Pressable>
            ) : null}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 6 }}
          >
            {SORT_OPTIONS.map((option) => {
              const isSelected = sortBy === option.id;
              return (
                <Pressable
                  key={option.id}
                  onPress={() => setSortBy(option.id)}
                  style={{
                    paddingHorizontal: 11,
                    paddingVertical: 6,
                    borderRadius: 10,
                    backgroundColor: isSelected ? colors.bgElevated : 'transparent',
                    borderWidth: 1,
                    borderColor: isSelected ? colors.brandPrimary : colors.borderSubtle,
                  }}
                >
                  <Text
                    style={{
                      color: isSelected ? colors.brandPrimary : colors.textMuted,
                      fontSize: 11,
                      fontWeight: '700',
                    }}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Results Count Banner */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '700' }}>
            Showing {processedItems.length} of {allItems?.length ?? 22} Melbourne dishes
          </Text>
          {activeCategory !== 'all' ? (
            <Badge tone="brand">{activeCategory.toUpperCase()}</Badge>
          ) : null}
        </View>

        {/* Catalog List / Loading Skeletons / 503 Error / Empty State */}
        {isLoading ? (
          <View style={{ gap: 14 }}>
            <Skeleton height={290} borderRadius={22} />
            <Skeleton height={290} borderRadius={22} />
            <Skeleton height={290} borderRadius={22} />
          </View>
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : processedItems.length === 0 ? (
          <EmptyState
            icon={<Search size={26} color={colors.brandPrimary} />}
            title="No matching Melbourne dishes found"
            description="Try clearing some dietary filters or searching for another burger, wrap, or side."
            actionLabel="Reset All Filters"
            onAction={handleResetFilters}
          />
        ) : (
          <View style={{ gap: 14 }}>
            {processedItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onOpenCustomization={(chosen) => setSelectedItemForModal(chosen)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Item Customization Modal Sheet */}
      <ItemDetailSheet
        item={selectedItemForModal}
        open={Boolean(selectedItemForModal)}
        onOpenChange={(open) => {
          if (!open) setSelectedItemForModal(null);
        }}
      />
    </View>
  );
}
