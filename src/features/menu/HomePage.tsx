import {
  ArrowRight,
  Award,
  Bike,
  Coffee,
  Cookie,
  CupSoda,
  Flame,
  Leaf,
  MapPin,
  Sandwich,
  ShieldCheck,
  Smile,
  Sparkles,
  Store as StoreIcon,
  TicketPercent,
  Utensils,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { MELBOURNE_STORES } from '@/data/storesSeed';
import { applyPromoCode } from '@/features/cart/cartSlice';
import { ItemCard } from '@/features/menu/ItemCard';
import { ItemDetailModal } from '@/features/menu/ItemDetailModal';
import { setStoreModalOpen } from '@/features/stores/storeSlice';
import { formatAUD } from '@/lib/currency';
import {
  useGetCategoriesQuery,
  useGetMenuItemsQuery,
  useGetPromoDealsQuery,
} from '@/services/mockApi';
import { FULFILLMENT_MODES, type MenuCategoryId, type MenuItem } from '@/types';

const CATEGORY_ICONS: Record<MenuCategoryId, typeof Flame> = {
  burgers: Flame,
  chicken: Sparkles,
  wraps: Sandwich,
  sides: Utensils,
  drinks: CupSoda,
  desserts: Cookie,
  breakfast: Coffee,
  kids: Smile,
  combos: Award,
};

export default function HomePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { selectedStoreId, fulfillmentMode, deliverySuburb } = useAppSelector(
    (state) => state.store,
  );
  const activePromoCode = useAppSelector((state) => state.cart.promoCode);
  const [selectedItemForModal, setSelectedItemForModal] = useState<MenuItem | null>(null);

  const activeStore =
    MELBOURNE_STORES.find((s) => s.id === selectedStoreId) ?? MELBOURNE_STORES[0];

  const {
    data: menuItems,
    isLoading: isMenuLoading,
    isError: isMenuError,
    error: menuError,
    refetch: refetchMenu,
  } = useGetMenuItemsQuery();

  const { data: categories } = useGetCategoriesQuery();
  const { data: promoDeals } = useGetPromoDealsQuery();

  const featuredItems = (menuItems ?? []).filter((item) => item.isFeatured).slice(0, 6);
  const signatureItem = (menuItems ?? []).find(
    (item) => item.id === 'itm-southern-cross-signature',
  );

  const handleApplyPromo = (code: string) => {
    dispatch(applyPromoCode(code));
    toast.success(`Promo code ${code} applied!`, {
      description: 'Discount will be calculated automatically in your order bag.',
    });
  };

  return (
    <div className="space-y-14">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-border-subtle bg-gradient-to-br from-brand-dark via-[#271914] to-[#3B1D14] text-white shadow-elevated">
        <div className="relative z-10 grid grid-cols-1 items-center gap-8 p-6 sm:p-10 lg:grid-cols-12 lg:p-12">
          <div className="space-y-5 lg:col-span-7">
            <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/15 px-3.5 py-1 text-xs font-bold text-amber-300">
              <Flame className="h-3.5 w-3.5 text-amber-400" />
              <span>FLAME-GRILLED UNDER THE SOUTHERN CROSS • MELBOURNE</span>
            </div>

            <h1 className="font-display text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
              Gippsland Grass-Fed Smash &amp; Crispy Free-Range Chicken.
            </h1>

            <p className="max-w-xl text-sm leading-relaxed text-amber-100/85 sm:text-base">
              Seared to order over ironbark charcoal across 8 Melbourne kitchens—from
              Flinders Quarter to Brunswick Street. Hot, crisp, and ready in minutes.
            </p>

            {/* Live Melbourne Store Pill inside Hero */}
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/15 bg-white/8 p-3.5 backdrop-blur-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary text-white shadow-xs">
                {fulfillmentMode === FULFILLMENT_MODES.PICKUP ? (
                  <StoreIcon className="h-5 w-5" />
                ) : (
                  <Bike className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1 min-w-[180px]">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  {fulfillmentMode === FULFILLMENT_MODES.PICKUP
                    ? `Click & Collect • Ready in ~${activeStore.pickupEtaMinutes} mins`
                    : `Delivering to ${deliverySuburb} • ~${activeStore.deliveryEtaMinutes} mins`}
                </p>
                <p className="text-sm font-semibold text-white truncate">
                  {activeStore.name} ({activeStore.address})
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-white/25 bg-white/10 text-white hover:bg-white/20"
                onClick={() => dispatch(setStoreModalOpen(true))}
              >
                Change Kitchen
              </Button>
            </div>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight className="h-4 w-4" />}
                onClick={() => navigate('/menu')}
              >
                Explore Full Melbourne Menu
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white/25 bg-white/5 text-white hover:bg-white/15"
                leftIcon={<Award className="h-4 w-4" />}
                onClick={() => navigate('/menu?category=combos')}
              >
                View Best Value Combos
              </Button>
            </div>
          </div>

          {/* Right Hero Featured Card (Interactive - opens modal) */}
          <div className="lg:col-span-5">
            <div
              tabIndex={0}
              role="button"
              onClick={() => signatureItem && setSelectedItemForModal(signatureItem)}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && signatureItem) {
                  e.preventDefault();
                  setSelectedItemForModal(signatureItem);
                }
              }}
              className="group relative mx-auto max-w-md overflow-hidden rounded-3xl border border-white/20 bg-black/40 p-4 backdrop-blur-md transition-all duration-300 hover:border-amber-400/60 hover:scale-[1.02] cursor-pointer"
            >
              <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-neutral-900">
                <img
                  src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80"
                  alt="The Southern Cross Signature Burger"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <Badge tone="brand" className="bg-brand-primary text-white border-none shadow-xs">
                    #1 in Melbourne
                  </Badge>
                  <Badge tone="amber" className="bg-black/70 text-amber-300 border-amber-400/30">
                    100% Gippsland Beef
                  </Badge>
                </div>
                <div className="absolute bottom-3 right-3 rounded-full bg-brand-primary px-3 py-1 text-xs font-bold text-white shadow-md">
                  Click to Customise →
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                    The Southern Cross Signature
                  </h2>
                  <p className="text-xs text-amber-100/75">
                    Otway streaky bacon, 18-mo aged cheddar &amp; Yarra onion jam
                  </p>
                </div>
                <div className="text-right">
                  <span className="block text-lg font-extrabold text-amber-300">
                    {formatAUD(16.9)}
                  </span>
                  <span className="text-[10px] text-amber-100/60">incl. GST</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Shortcuts Strip */}
      <section aria-labelledby="categories-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 id="categories-heading" className="font-display text-2xl font-bold">
              Explore by Category
            </h2>
            <p className="text-xs text-text-secondary">
              9 handcrafted menu sections prepared fresh across Melbourne kitchens
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            rightIcon={<ArrowRight className="h-4 w-4" />}
            onClick={() => navigate('/menu')}
          >
            View All ({menuItems?.length ?? 23} Items)
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5 lg:grid-cols-9">
          {(categories ?? []).map((cat) => {
            const Icon = CATEGORY_ICONS[cat.id] ?? Flame;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => navigate(`/menu?category=${cat.id}`)}
                className="group flex flex-col items-center justify-center rounded-2xl border border-border-subtle bg-bg-surface p-3.5 text-center shadow-card transition-all hover:-translate-y-1 hover:border-brand-primary cursor-pointer"
              >
                <span
                  className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-xs transition-transform group-hover:scale-110"
                  style={{ backgroundColor: cat.accentColor }}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-xs font-bold text-text-primary group-hover:text-brand-primary">
                  {cat.shortName}
                </span>
                {cat.badgeText && (
                  <span className="mt-1 rounded-full bg-brand-primary/10 px-2 py-0.5 text-[10px] font-bold text-brand-primary">
                    {cat.badgeText}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Melbourne Deals & Promotions */}
      <section aria-labelledby="deals-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TicketPercent className="h-5 w-5 text-brand-primary" />
            <h2 id="deals-heading" className="font-display text-2xl font-bold">
              Melbourne Local Perks &amp; Promos
            </h2>
          </div>
          <Badge tone="amber">Click to Apply to Bag</Badge>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {(promoDeals ?? []).map((deal) => {
            const isApplied = activePromoCode === deal.code;
            return (
              <Card
                key={deal.id}
                interactive
                onClick={() => handleApplyPromo(deal.code)}
                className="relative overflow-hidden p-5 transition-all hover:border-brand-primary"
              >
                <div className="flex items-start justify-between gap-2">
                  <Badge tone="brand">{deal.badgeText}</Badge>
                  <span className="rounded-lg border border-dashed border-brand-primary/40 bg-brand-primary/8 px-2.5 py-1 font-mono text-xs font-extrabold text-brand-primary">
                    {deal.code}
                  </span>
                </div>
                <h3 className="mt-3 font-display text-lg font-bold text-text-primary">
                  {deal.title}
                </h3>
                <p className="mt-1 text-xs text-text-secondary">{deal.description}</p>
                <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-3 text-[11px] font-semibold text-text-muted">
                  <span>{deal.expiryText}</span>
                  <span className="font-bold text-brand-primary">
                    {isApplied ? 'Applied in Bag ✓' : 'Apply Code →'}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Featured Items Grid (Uses ItemCard + ItemDetailModal) */}
      <section aria-labelledby="featured-heading" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 id="featured-heading" className="font-display text-2xl font-bold">
              Melbourne Signatures &amp; Crowd Favorites
            </h2>
            <p className="text-xs text-text-secondary">
              Handcrafted with grass-fed beef, local produce, and house-made sauces.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            rightIcon={<ArrowRight className="h-4 w-4" />}
            onClick={() => navigate('/menu')}
          >
            See All Menu Items
          </Button>
        </div>

        {isMenuLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Card key={idx} className="overflow-hidden p-4 space-y-3">
                <Skeleton className="aspect-16/10 w-full rounded-2xl" />
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
        ) : isMenuError ? (
          <ErrorState
            title="Failed to load Melbourne favorites"
            message={
              (menuError as { message?: string })?.message ?? 'Simulated Gateway Outage'
            }
            onRetry={() => refetchMenu()}
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onOpenCustomization={(i) => setSelectedItemForModal(i)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Value Pillars / Trust Badges */}
      <section aria-labelledby="pillars-heading" className="rounded-3xl border border-border-subtle bg-bg-surface p-6 sm:p-10">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <Badge tone="success" className="mx-auto">
            The Southern Cross Guarantee
          </Badge>
          <h2 id="pillars-heading" className="font-display text-2xl font-bold text-text-primary">
            Melbourne Craft Fast-Food Standards
          </h2>
          <p className="text-xs text-text-secondary">
            Fast food reimagined with premium Victorian ingredients and zero compromises.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2 rounded-2xl bg-bg-elevated p-5 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
              <Flame className="h-6 w-6" />
            </span>
            <h3 className="font-display text-sm font-bold text-text-primary">
              100% Gippsland Grass-Fed
            </h3>
            <p className="text-xs text-text-secondary">
              Pasture-raised Victorian beef with no added hormones, seared over open ironbark coals.
            </p>
          </div>

          <div className="space-y-2 rounded-2xl bg-bg-elevated p-5 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Leaf className="h-6 w-6" />
            </span>
            <h3 className="font-display text-sm font-bold text-text-primary">
              Free-Range &amp; Local Produce
            </h3>
            <p className="text-xs text-text-secondary">
              Victorian free-range chicken, Macedon Ranges mushrooms, and Yarra Valley dairy.
            </p>
          </div>

          <div className="space-y-2 rounded-2xl bg-bg-elevated p-5 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
              <MapPin className="h-6 w-6" />
            </span>
            <h3 className="font-display text-sm font-bold text-text-primary">
              8 Melbourne Kitchens
            </h3>
            <p className="text-xs text-text-secondary">
              Strategically placed from the CBD to Fitzroy and St Kilda for sub-25 min delivery.
            </p>
          </div>

          <div className="space-y-2 rounded-2xl bg-bg-elevated p-5 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <h3 className="font-display text-sm font-bold text-text-primary">
              100% Recyclable Packaging
            </h3>
            <p className="text-xs text-text-secondary">
              FSC-certified paperboard and plant-based bioplastics with zero landfill waste.
            </p>
          </div>
        </div>
      </section>

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
