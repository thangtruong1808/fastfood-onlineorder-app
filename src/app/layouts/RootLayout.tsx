import {
  BarChart3,
  Bike,
  ChevronDown,
  Compass,
  Flame,
  Home,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store as StoreIcon,
  User,
  UtensilsCrossed,
} from 'lucide-react';
import { Link, NavLink, Outlet } from 'react-router';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { ApiSimulatorControl } from '@/components/common/ApiSimulatorControl';
import { BrandLogo } from '@/components/common/BrandLogo';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { Badge } from '@/components/ui/Badge';
import { MELBOURNE_STORES } from '@/data/storesSeed';
import { switchDemoRole } from '@/features/auth-mock/authSlice';
import { CartDrawerShell } from '@/features/cart/CartDrawerShell';
import { setCartDrawerOpen } from '@/features/cart/cartSlice';
import { StoreSelectorModal } from '@/features/stores/StoreSelectorModal';
import { setStoreModalOpen } from '@/features/stores/storeSlice';
import { cn } from '@/lib/cn';
import { formatAUD } from '@/lib/currency';
import { FULFILLMENT_MODES } from '@/types';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/menu', label: 'Menu', icon: UtensilsCrossed, end: false },
  { to: '/account', label: 'My Orders & Rewards', icon: Sparkles, end: false },
  { to: '/admin', label: 'Analytics', icon: BarChart3, end: false },
];

export function RootLayout() {
  const dispatch = useAppDispatch();
  const { selectedStoreId, fulfillmentMode, deliverySuburb } = useAppSelector(
    (state) => state.store,
  );
  const { currentUser } = useAppSelector((state) => state.auth);
  const cartItems = useAppSelector((state) => state.cart.items);

  const activeStore =
    MELBOURNE_STORES.find((s) => s.id === selectedStoreId) ?? MELBOURNE_STORES[0];

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cartItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );

  const handleToggleRole = () => {
    const nextRole = currentUser.role === 'admin' ? 'customer' : 'admin';
    dispatch(switchDemoRole(nextRole));
    toast.success(
      `Switched to ${nextRole === 'admin' ? 'Admin (Sarah Chen)' : 'Customer (Alex Mercer)'}`,
      {
        description:
          nextRole === 'admin'
            ? 'Full access to Melbourne Store Analytics & Live Kitchen Orders.'
            : 'Viewing as Southern Gold loyalty member.',
      },
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary text-text-primary">
      {/* Top Announcement / Melbourne Context Strip */}
      <div className="border-b border-border-subtle bg-brand-dark px-4 py-1.5 text-xs text-amber-100/90">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Flame className="h-3.5 w-3.5 text-brand-accent" />
            <span>
              <strong>Southern Cross Burgers</strong> • 100% Gippsland Grass-Fed Beef & Free-Range Victorian Chicken
            </span>
          </div>
          <div className="hidden items-center gap-4 sm:flex">
            <span className="text-amber-200/80">
              Promo Code: <strong className="text-white">MELB15</strong> (15% Off A$25+)
            </span>
            <span className="text-amber-200/60">|</span>
            <span>All prices in AUD ($) incl. 10% GST</span>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-30 border-b border-border-subtle bg-bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          {/* Left: Brand Logo & Store Selector Pill */}
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <BrandLogo />
            </Link>

            {/* Melbourne Store & Fulfillment Selector Trigger */}
            <button
              type="button"
              onClick={() => dispatch(setStoreModalOpen(true))}
              className="hidden items-center gap-2.5 rounded-2xl border border-border-strong bg-bg-elevated/80 px-3.5 py-2 text-left transition-all hover:border-brand-primary hover:bg-bg-elevated lg:flex cursor-pointer"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-primary/12 text-brand-primary">
                {fulfillmentMode === FULFILLMENT_MODES.PICKUP ? (
                  <StoreIcon className="h-4 w-4" />
                ) : (
                  <Bike className="h-4 w-4" />
                )}
              </span>
              <div className="leading-tight">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-primary">
                  <span>
                    {fulfillmentMode === FULFILLMENT_MODES.PICKUP
                      ? `Pickup • ~${activeStore.pickupEtaMinutes}m`
                      : `Delivery to ${deliverySuburb} • ~${activeStore.deliveryEtaMinutes}m`}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-text-primary">
                  <MapPin className="h-3 w-3 text-text-muted" />
                  <span className="max-w-[180px] truncate">{activeStore.suburb} Kitchen</span>
                  <ChevronDown className="h-3.5 w-3.5 text-text-muted" />
                </div>
              </div>
            </button>
          </div>

          {/* Center: Desktop Navigation */}
          <nav
            aria-label="Primary Navigation"
            className="hidden items-center gap-1 md:flex"
          >
            {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors',
                    isActive
                      ? 'bg-brand-primary/12 text-brand-primary'
                      : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary',
                  )
                }
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Right: Role Switcher, Theme Toggle, Cart Drawer Trigger */}
          <div className="flex items-center gap-2.5">
            {/* 1-Click Role Switcher Pill */}
            <button
              type="button"
              onClick={handleToggleRole}
              title="Click to switch between Customer and Admin demo personas"
              className="hidden items-center gap-2 rounded-xl border border-border-subtle bg-bg-elevated px-3 py-1.5 text-xs font-semibold text-text-primary transition-colors hover:border-brand-primary sm:inline-flex cursor-pointer"
            >
              {currentUser.role === 'admin' ? (
                <ShieldCheck className="h-3.5 w-3.5 text-brand-secondary" />
              ) : (
                <User className="h-3.5 w-3.5 text-brand-primary" />
              )}
              <span>{currentUser.name.split(' ')[0]}</span>
              <Badge tone={currentUser.role === 'admin' ? 'amber' : 'brand'}>
                {currentUser.role === 'admin' ? 'Admin' : 'Gold'}
              </Badge>
            </button>

            <ThemeToggle />

            {/* Cart Trigger Button */}
            <button
              type="button"
              onClick={() => dispatch(setCartDrawerOpen(true))}
              aria-label={`Open order bag with ${totalItems} items`}
              className="inline-flex h-10 items-center gap-2.5 rounded-xl bg-brand-primary px-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-primary-hover active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">{formatAUD(cartSubtotal)}</span>
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white/20 px-1.5 text-xs font-extrabold">
                {totalItems}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Store & Fulfillment Sub-bar */}
        <div className="flex items-center justify-between border-t border-border-subtle bg-bg-elevated/60 px-4 py-2 lg:hidden">
          <button
            type="button"
            onClick={() => dispatch(setStoreModalOpen(true))}
            className="flex items-center gap-2 text-xs font-semibold text-text-primary cursor-pointer"
          >
            <MapPin className="h-3.5 w-3.5 text-brand-primary" />
            <span>
              {fulfillmentMode === FULFILLMENT_MODES.PICKUP ? 'Pickup:' : 'Deliver from:'}{' '}
              <strong className="text-brand-primary">{activeStore.suburb}</strong> (
              {fulfillmentMode === FULFILLMENT_MODES.PICKUP
                ? `${activeStore.pickupEtaMinutes}m`
                : `${activeStore.deliveryEtaMinutes}m`}
              )
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-text-muted" />
          </button>

          <button
            type="button"
            onClick={handleToggleRole}
            className="text-xs font-semibold text-brand-secondary underline-offset-2 hover:underline cursor-pointer"
          >
            Role: {currentUser.role === 'admin' ? 'Admin' : 'Customer'}
          </button>
        </div>
      </header>

      {/* Main Content Outlet */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-28 sm:px-6 md:pb-12">
        <Outlet />
      </main>

      {/* Desktop Footer */}
      <footer className="border-t border-border-subtle bg-bg-surface py-10 pb-24 md:pb-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-4 sm:px-6 md:flex-row md:items-center">
          <div className="space-y-2">
            <BrandLogo />
            <p className="max-w-md text-xs text-text-secondary">
              Crafted in Melbourne, Victoria. 100% Gippsland grass-fed beef, free-range
              chicken, and locally sourced produce across 8 inner-Melbourne kitchens.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted">
            <span>ABN 48 612 904 331 (Simulated Showcase)</span>
            <span>•</span>
            <span>AUD ($) • 10% GST Included</span>
            <span>•</span>
            <Link to="/login" className="font-semibold text-brand-primary hover:underline">
              Switch Demo Persona
            </Link>
          </div>
        </div>
      </footer>

      {/* Mobile Sticky Cart Bar (Shown when items > 0) */}
      {totalItems > 0 && (
        <div className="fixed bottom-18 left-4 right-4 z-30 md:hidden animate-in slide-in-from-bottom-2 fade-in duration-200">
          <button
            type="button"
            onClick={() => dispatch(setCartDrawerOpen(true))}
            className="flex w-full items-center justify-between rounded-2xl border border-brand-primary/30 bg-brand-primary px-4 py-3 text-white shadow-elevated transition-transform active:scale-98 cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs font-extrabold">
                {totalItems}
              </span>
              <span className="text-xs font-bold tracking-wide uppercase">View Order Bag</span>
            </div>
            <div className="flex items-center gap-1.5 font-display text-sm font-extrabold">
              <span>{formatAUD(cartSubtotal)}</span>
              <span className="text-[10px] font-normal text-amber-200/80">incl. GST</span>
            </div>
          </button>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-border-subtle bg-bg-surface/95 px-2 backdrop-blur-md md:hidden"
      >
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-1 text-[11px] font-semibold transition-colors',
                isActive ? 'text-brand-primary' : 'text-text-muted hover:text-text-primary',
              )
            }
          >
            <Icon className="h-5 w-5" />
            <span>{label.split(' ')[0]}</span>
          </NavLink>
        ))}
        <NavLink
          to="/login"
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-1 text-[11px] font-semibold transition-colors',
              isActive ? 'text-brand-primary' : 'text-text-muted hover:text-text-primary',
            )
          }
        >
          <Compass className="h-5 w-5" />
          <span>Demo</span>
        </NavLink>
      </nav>

      {/* Global Modals, Drawers & Simulator Control */}
      <StoreSelectorModal />
      <CartDrawerShell />
      <ApiSimulatorControl />
    </div>
  );
}
