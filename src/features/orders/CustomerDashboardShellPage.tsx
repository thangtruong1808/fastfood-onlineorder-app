import {
  ArrowRight,
  Clock,
  Gift,
  Heart,
  MapPin,
  Plus,
  Receipt,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  Store as StoreIcon,
  Tag,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { MENU_ITEMS } from '@/data/menuSeed';
import { addCartItem, setCartDrawerOpen } from '@/features/cart/cartSlice';
import { ItemDetailModal } from '@/features/menu/ItemDetailModal';
import { cn } from '@/lib/cn';
import { formatAUD } from '@/lib/currency';
import { formatMelbDate, formatMelbTime } from '@/lib/date';
import type { MenuItem, OrderRecord, SavedAddress } from '@/types';

type DashboardTab = 'orders' | 'loyalty' | 'favorites' | 'addresses';

const REWARD_VOUCHERS = [
  {
    id: 'rew-chips',
    title: 'Free Rosemary & Salt Chips',
    costPoints: 300,
    desc: 'Redeem on any burger or wrap order',
    code: 'FREECHIPS',
  },
  {
    id: 'rew-thickshake',
    title: 'Free Hand-Spun Thickshake',
    costPoints: 400,
    desc: 'Lygon espresso, malt chocolate, or vanilla',
    code: 'FREESHAKE',
  },
  {
    id: 'rew-voucher5',
    title: 'A$5.00 Off Any Order',
    costPoints: 500,
    desc: 'No minimum spend requirement',
    code: 'FLAMEFIVE',
  },
  {
    id: 'rew-meal-upgrade',
    title: 'Complimentary Combo Upgrade',
    costPoints: 650,
    desc: 'Upgrade any single burger to full box meal',
    code: 'FREECOMBO',
  },
];

export default function CustomerDashboardShellPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { currentUser, favoriteItemIds } = useAppSelector((state) => state.auth);
  const orders = useAppSelector((state) => state.orders.orders);

  const [activeTab, setActiveTab] = useState<DashboardTab>('orders');
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<OrderRecord | null>(null);
  const [selectedItemForModal, setSelectedItemForModal] = useState<MenuItem | null>(null);

  // Address state
  const [addresses, setAddresses] = useState<SavedAddress[]>(currentUser.savedAddresses);
  const [newAddressModalOpen, setNewAddressModalOpen] = useState(false);
  const [newAddrLabel, setNewAddrLabel] = useState('');
  const [newAddrStreet, setNewAddrStreet] = useState('');
  const [newAddrSuburb, setNewAddrSuburb] = useState('Fitzroy');
  const [newAddrPostcode, setNewAddrPostcode] = useState('3065');

  // Favorites items lookup
  const favoriteItems = MENU_ITEMS.filter((item) => favoriteItemIds.includes(item.id));

  // Loyalty Tier Progress Calculation
  const points = currentUser.loyaltyPoints;
  let nextTierName = 'Southern Gold';
  let tierProgressPercent = 100;
  let pointsToNext = 0;

  if (points < 500) {
    nextTierName = 'Silver Cross';
    tierProgressPercent = Math.min(100, Math.round((points / 500) * 100));
    pointsToNext = 500 - points;
  } else if (points < 1200) {
    nextTierName = 'Southern Gold';
    tierProgressPercent = Math.min(100, Math.round(((points - 500) / 700) * 100));
    pointsToNext = 1200 - points;
  }

  // 1-Click Reorder Action
  const handleReorder = (order: OrderRecord) => {
    order.items.forEach((item) => {
      dispatch(addCartItem(item));
    });

    toast.success(`Added ${order.items.length} items from Order #${order.orderNumber} to bag!`, {
      description: 'Your bag has been populated with your previous selections.',
      action: {
        label: 'View Bag',
        onClick: () => dispatch(setCartDrawerOpen(true)),
      },
    });

    dispatch(setCartDrawerOpen(true));
  };

  const handleRedeemVoucher = (voucher: (typeof REWARD_VOUCHERS)[0]) => {
    if (currentUser.loyaltyPoints < voucher.costPoints) {
      toast.error(
        `Insufficient points: You need ${voucher.costPoints} pts (You have ${currentUser.loyaltyPoints} pts).`,
      );
      return;
    }
    toast.success(`Voucher ${voucher.code} redeemed!`, {
      description: `Copied to clipboard. Apply ${voucher.code} at checkout.`,
    });
  };

  const handleSaveNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrStreet.trim()) return;

    const newAddr: SavedAddress = {
      id: `addr-${Date.now()}`,
      label: newAddrLabel.trim() || 'New Address',
      street: newAddrStreet.trim(),
      suburb: newAddrSuburb.trim(),
      postcode: newAddrPostcode.trim(),
      isDefault: false,
    };

    setAddresses((prev) => [...prev, newAddr]);
    setNewAddressModalOpen(false);
    setNewAddrStreet('');
    setNewAddrLabel('');
    toast.success('Melbourne delivery address saved!');
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Customer Hero Profile Header */}
      <section className="relative overflow-hidden rounded-3xl border border-border-subtle bg-gradient-to-br from-brand-dark via-[#241713] to-[#361A11] p-6 text-white shadow-elevated sm:p-8">
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary text-xl font-extrabold text-white shadow-md">
              {currentUser.avatarInitials || 'AM'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-bold sm:text-3xl text-white">
                  {currentUser.name}
                </h1>
                <Badge tone="amber" className="bg-amber-400/20 text-amber-300 border-amber-400/30">
                  {currentUser.loyaltyTier}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-amber-100/75 sm:text-sm">
                {currentUser.email} • Member since {currentUser.memberSince}
              </p>
            </div>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-white/15 bg-white/8 px-4 py-2.5 backdrop-blur-xs">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-300">
                Flame Rewards Balance
              </span>
              <span className="font-display text-xl font-extrabold text-white">
                {currentUser.loyaltyPoints.toLocaleString()} pts
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="border-white/25 bg-white/10 text-white hover:bg-white/20"
              onClick={() => navigate('/login')}
            >
              Switch Demo Persona
            </Button>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-border-subtle pb-3">
        {[
          { id: 'orders' as const, label: `Order History (${orders.length})`, icon: Clock },
          { id: 'loyalty' as const, label: 'Flame Rewards & Vouchers', icon: Sparkles },
          { id: 'favorites' as const, label: `Saved Favorites (${favoriteItems.length})`, icon: Heart },
          { id: 'addresses' as const, label: `Melbourne Addresses (${addresses.length})`, icon: MapPin },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer',
                isActive
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'bg-bg-surface text-text-secondary hover:bg-bg-elevated hover:text-text-primary border border-border-subtle',
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Order History with 1-Click Reorder */}
      {activeTab === 'orders' && (
        <section aria-labelledby="history-heading" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="history-heading" className="font-display text-xl font-bold">
                Your Past Melbourne Orders
              </h2>
              <p className="text-xs text-text-secondary">
                Review past receipts or reorder your favorite meals in one click.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              rightIcon={<ArrowRight className="h-4 w-4" />}
              onClick={() => navigate('/menu')}
            >
              Order New Meal
            </Button>
          </div>

          {orders.length === 0 ? (
            <Card className="p-8 text-center space-y-3">
              <ShoppingBag className="mx-auto h-10 w-10 text-text-muted" />
              <h3 className="font-display text-base font-bold">No Past Orders Yet</h3>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                Explore our flame-grilled Gippsland beef burgers and crispy free-range chicken.
              </p>
              <Button variant="primary" size="sm" onClick={() => navigate('/menu')}>
                Browse Melbourne Menu
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card
                  key={order.id}
                  className="p-5 sm:p-6 space-y-4 transition-all hover:border-brand-primary/50"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border-subtle pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-base font-extrabold text-text-primary">
                        #{order.orderNumber}
                      </span>
                      <Badge
                        tone={
                          order.status === 'completed'
                            ? 'success'
                            : order.status === 'ready_or_out'
                              ? 'brand'
                              : 'amber'
                        }
                      >
                        {order.status.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-text-muted">
                        {formatMelbDate(order.createdAt)} at {formatMelbTime(order.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
                      <StoreIcon className="h-4 w-4 text-brand-primary" />
                      <span>{order.storeName}</span>
                    </div>
                  </div>

                  {/* Line Items Summary */}
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div
                        key={item.cartItemId}
                        className="flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-text-primary">
                            {item.quantity}x
                          </span>
                          <span className="text-text-primary">{item.name}</span>
                          <span className="text-text-muted">({item.customization.sizeLabel})</span>
                          {item.customization.isCombo && (
                            <Badge tone="amber" className="text-[10px] py-0 px-1.5">
                              Combo
                            </Badge>
                          )}
                        </div>
                        <span className="font-semibold text-text-primary">
                          {formatAUD(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Footer with Totals, 1-Click Reorder & Tracking */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-border-subtle pt-3">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-bold text-text-primary">
                        Total: {formatAUD(order.total)}
                      </span>
                      <span className="text-text-muted text-[11px]">
                        (incl. {formatAUD(order.gstIncluded)} GST)
                      </span>
                      <span className="text-amber-600 dark:text-amber-400 font-semibold text-[11px]">
                        +{order.loyaltyPointsEarned} pts
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Receipt className="h-3.5 w-3.5" />}
                        onClick={() => setSelectedReceiptOrder(order)}
                      >
                        Tax Receipt
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Clock className="h-3.5 w-3.5" />}
                        onClick={() => navigate(`/orders/${order.id}`)}
                      >
                        Track Status
                      </Button>

                      {/* 1-Click Reorder Button */}
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
                        onClick={() => handleReorder(order)}
                      >
                        1-Click Reorder
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB 2: Flame Rewards & Vouchers */}
      {activeTab === 'loyalty' && (
        <section aria-labelledby="loyalty-heading" className="space-y-6">
          {/* Tier Progress Card */}
          <Card className="p-6 space-y-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
                  Southern Cross Flame Rewards Program
                </span>
                <h2 id="loyalty-heading" className="font-display text-2xl font-bold">
                  Tier: {currentUser.loyaltyTier}
                </h2>
              </div>
              <div className="text-left sm:text-right">
                <span className="font-display text-2xl font-extrabold text-brand-primary">
                  {points.toLocaleString()}
                </span>
                <span className="block text-xs text-text-muted">Available Flame Points</span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-text-secondary">
                <span>Current Tier: {currentUser.loyaltyTier}</span>
                <span>
                  {pointsToNext > 0
                    ? `${pointsToNext} pts to ${nextTierName}`
                    : 'Maximum Tier Attained!'}
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-border-subtle">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-brand-primary transition-all duration-700"
                  style={{ width: `${tierProgressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-text-muted">
                <span>Bronze Star (0 pts)</span>
                <span>Silver Cross (500 pts)</span>
                <span>Southern Gold (1,200+ pts)</span>
              </div>
            </div>
          </Card>

          {/* Redeemable Rewards Grid */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-brand-primary" />
              <h3 className="font-display text-lg font-bold">Redeemable Flame Vouchers</h3>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {REWARD_VOUCHERS.map((voucher) => (
                <Card key={voucher.id} className="p-4 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <Badge tone="amber">{voucher.costPoints} Points</Badge>
                      <Tag className="h-4 w-4 text-text-muted" />
                    </div>
                    <h4 className="mt-2 font-display text-sm font-bold text-text-primary">
                      {voucher.title}
                    </h4>
                    <p className="mt-1 text-xs text-text-secondary">{voucher.desc}</p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-bold hover:border-brand-primary"
                    onClick={() => handleRedeemVoucher(voucher)}
                  >
                    Redeem Voucher
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TAB 3: Saved Favorites */}
      {activeTab === 'favorites' && (
        <section aria-labelledby="favs-heading" className="space-y-4">
          <div>
            <h2 id="favs-heading" className="font-display text-xl font-bold">
              Your Melbourne Kitchen Favorites
            </h2>
            <p className="text-xs text-text-secondary">
              Heart-saved items for rapid re-ordering.
            </p>
          </div>

          {favoriteItems.length === 0 ? (
            <Card className="p-8 text-center space-y-3">
              <Heart className="mx-auto h-10 w-10 text-text-muted" />
              <h3 className="font-display text-base font-bold">No Favorites Saved Yet</h3>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                Click the heart icon on any burger or chicken item on the menu to save it here.
              </p>
              <Button variant="primary" size="sm" onClick={() => navigate('/menu')}>
                Explore Menu
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {favoriteItems.map((item) => (
                <Card key={item.id} className="p-4 flex gap-3 items-center">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-16 w-16 shrink-0 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-sm font-bold truncate">{item.name}</h3>
                    <p className="text-xs font-bold text-brand-primary">
                      {formatAUD(item.basePrice)}
                    </p>
                    <div className="mt-2 flex gap-1.5">
                      <Button
                        variant="primary"
                        size="sm"
                        className="h-7 text-xs px-2.5"
                        onClick={() => setSelectedItemForModal(item)}
                      >
                        Configure &amp; Order
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB 4: Saved Melbourne Addresses */}
      {activeTab === 'addresses' && (
        <section aria-labelledby="addr-heading" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="addr-heading" className="font-display text-xl font-bold">
                Saved Melbourne Delivery Addresses
              </h2>
              <p className="text-xs text-text-secondary">
                Pre-configured for sub-25 min delivery from our 8 connected kitchens.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setNewAddressModalOpen(true)}
            >
              Add New Address
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {addresses.map((addr) => (
              <Card key={addr.id} className="p-5 space-y-2 relative">
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm font-bold text-text-primary">
                    {addr.label}
                  </span>
                  {addr.isDefault && <Badge tone="brand">Default</Badge>}
                </div>
                <p className="text-xs text-text-secondary">{addr.street}</p>
                <p className="text-xs font-bold text-text-primary">
                  {addr.suburb}, VIC {addr.postcode}
                </p>
                {addr.deliveryNotes && (
                  <p className="text-[11px] italic text-text-muted pt-1">
                    Note: &quot;{addr.deliveryNotes}&quot;
                  </p>
                )}
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Tax Invoice Modal */}
      {selectedReceiptOrder && (
        <Modal
          open={Boolean(selectedReceiptOrder)}
          onOpenChange={(open) => !open && setSelectedReceiptOrder(null)}
          title={`Tax Invoice • #${selectedReceiptOrder.orderNumber}`}
          description="Official Australian GST receipt"
        >
          <div className="space-y-3 text-xs">
            <div className="text-center border-b border-border-subtle pb-3">
              <h4 className="font-bold text-sm">Southern Cross Burgers Pty Ltd</h4>
              <p className="text-text-muted">ABN 48 612 904 331</p>
              <p className="text-text-secondary">{selectedReceiptOrder.storeName}</p>
              <p className="text-text-muted">
                {formatMelbDate(selectedReceiptOrder.createdAt)}
              </p>
            </div>

            <div className="space-y-1.5 divide-y divide-border-subtle">
              {selectedReceiptOrder.items.map((item) => (
                <div key={item.cartItemId} className="flex justify-between pt-1.5">
                  <span>
                    {item.quantity}x {item.name}
                  </span>
                  <span className="font-bold">
                    {formatAUD(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-border-subtle pt-2 space-y-1">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatAUD(selectedReceiptOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>{formatAUD(selectedReceiptOrder.deliveryFee)}</span>
              </div>
              <div className="flex justify-between font-bold text-text-primary border-t border-border-subtle pt-1 text-sm">
                <span>Total Paid (AUD)</span>
                <span className="text-brand-primary">
                  {formatAUD(selectedReceiptOrder.total)}
                </span>
              </div>
              <p className="text-[10px] text-text-muted text-right">
                Includes {formatAUD(selectedReceiptOrder.gstIncluded)} 10% GST
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* Item Customization Modal for Favorites */}
      <ItemDetailModal
        item={selectedItemForModal}
        open={Boolean(selectedItemForModal)}
        onOpenChange={(open) => !open && setSelectedItemForModal(null)}
      />

      {/* Add Address Modal */}
      <Modal
        open={newAddressModalOpen}
        onOpenChange={setNewAddressModalOpen}
        title="Add Melbourne Address"
        description="Enter delivery details"
      >
        <form onSubmit={handleSaveNewAddress} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold mb-1">Label (e.g. Home, Office, Gym)</label>
            <input
              type="text"
              required
              value={newAddrLabel}
              onChange={(e) => setNewAddrLabel(e.target.value)}
              placeholder="e.g. South Yarra Apartment"
              className="w-full rounded-xl border border-border-strong p-2.5 text-text-primary bg-bg-elevated"
            />
          </div>
          <div>
            <label className="block font-bold mb-1">Street Address</label>
            <input
              type="text"
              required
              value={newAddrStreet}
              onChange={(e) => setNewAddrStreet(e.target.value)}
              placeholder="e.g. 182 Chapel Street, Apt 4"
              className="w-full rounded-xl border border-border-strong p-2.5 text-text-primary bg-bg-elevated"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold mb-1">Suburb</label>
              <input
                type="text"
                value={newAddrSuburb}
                onChange={(e) => setNewAddrSuburb(e.target.value)}
                className="w-full rounded-xl border border-border-strong p-2.5 text-text-primary bg-bg-elevated"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Postcode</label>
              <input
                type="text"
                value={newAddrPostcode}
                onChange={(e) => setNewAddrPostcode(e.target.value)}
                className="w-full rounded-xl border border-border-strong p-2.5 text-text-primary bg-bg-elevated"
              />
            </div>
          </div>
          <Button type="submit" variant="primary" size="md" className="w-full mt-2">
            Save Address
          </Button>
        </form>
      </Modal>
    </div>
  );
}
