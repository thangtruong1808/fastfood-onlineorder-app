import {
  Bike,
  CheckCircle2,
  Clock,
  MapPin,
  Navigation,
  Phone,
  Store as StoreIcon,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { MELBOURNE_STORES } from '@/data/storesSeed';
import {
  setDeliveryDetails,
  setFulfillmentMode,
  setSelectedStore,
  setStoreModalOpen,
} from '@/features/stores/storeSlice';
import { cn } from '@/lib/cn';
import { formatAUD } from '@/lib/currency';
import { FULFILLMENT_MODES, type FulfillmentMode } from '@/types';

export function StoreSelectorModal() {
  const dispatch = useAppDispatch();
  const {
    selectedStoreId,
    fulfillmentMode,
    deliveryAddress,
    deliverySuburb,
    deliveryPostcode,
    isStoreModalOpen,
  } = useAppSelector((state) => state.store);

  const [addressInput, setAddressInput] = useState(deliveryAddress);
  const [suburbInput, setSuburbInput] = useState(deliverySuburb);
  const [postcodeInput, setPostcodeInput] = useState(deliveryPostcode);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStores = MELBOURNE_STORES.filter(
    (s) =>
      s.suburb.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.postcode.includes(searchQuery),
  );

  const handleModeSwitch = (mode: FulfillmentMode) => {
    dispatch(setFulfillmentMode(mode));
  };

  const handleSelectStore = (storeId: string) => {
    dispatch(setSelectedStore(storeId));
    const chosen = MELBOURNE_STORES.find((s) => s.id === storeId);
    if (chosen) {
      toast.success(`Kitchen switched to ${chosen.suburb}`, {
        description: `${chosen.address} (${
          fulfillmentMode === FULFILLMENT_MODES.PICKUP
            ? `Pickup ~${chosen.pickupEtaMinutes} mins`
            : `Delivery ~${chosen.deliveryEtaMinutes} mins`
        })`,
      });
    }
  };

  const handleConfirm = () => {
    if (fulfillmentMode === FULFILLMENT_MODES.DELIVERY && addressInput.trim()) {
      dispatch(
        setDeliveryDetails({
          address: addressInput.trim(),
          suburb: suburbInput.trim() || 'Melbourne',
          postcode: postcodeInput.trim() || '3000',
        }),
      );
    }
    dispatch(setStoreModalOpen(false));
  };

  return (
    <Modal
      open={isStoreModalOpen}
      onOpenChange={(open) => dispatch(setStoreModalOpen(open))}
      title="Choose Melbourne Kitchen & Fulfillment"
      description="Select Pickup or Delivery and pick your nearest Southern Cross Burgers kitchen."
      maxWidthClass="max-w-2xl"
      footer={
        <div className="flex items-center justify-between gap-4">
          <div className="text-xs text-text-secondary">
            All prices in <strong className="text-text-primary">AUD ($)</strong> • 10% GST included
          </div>
          <Button variant="primary" onClick={handleConfirm}>
            Confirm Selection
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Fulfillment Mode Toggle */}
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-bg-elevated p-1.5">
          <button
            type="button"
            onClick={() => handleModeSwitch(FULFILLMENT_MODES.PICKUP)}
            className={cn(
              'flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all cursor-pointer',
              fulfillmentMode === FULFILLMENT_MODES.PICKUP
                ? 'bg-bg-surface text-brand-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary',
            )}
          >
            <StoreIcon className="h-4 w-4" />
            <span>Click & Collect Pickup</span>
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch(FULFILLMENT_MODES.DELIVERY)}
            className={cn(
              'flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all cursor-pointer',
              fulfillmentMode === FULFILLMENT_MODES.DELIVERY
                ? 'bg-bg-surface text-brand-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary',
            )}
          >
            <Bike className="h-4 w-4" />
            <span>Melbourne Suburb Delivery</span>
          </button>
        </div>

        {/* Conditional Delivery Address Bar */}
        {fulfillmentMode === FULFILLMENT_MODES.DELIVERY && (
          <div className="rounded-2xl border border-brand-primary/25 bg-brand-primary/5 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-primary">
              <Navigation className="h-3.5 w-3.5" />
              <span>Delivery Drop-off Address (Victoria)</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              <div className="sm:col-span-2">
                <Input
                  id="del-street"
                  label="Street Address"
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  placeholder="e.g. 42 Napier Street"
                />
              </div>
              <div>
                <Input
                  id="del-suburb"
                  label="Suburb"
                  value={suburbInput}
                  onChange={(e) => setSuburbInput(e.target.value)}
                  placeholder="Fitzroy"
                />
              </div>
              <div>
                <Input
                  id="del-postcode"
                  label="Postcode"
                  value={postcodeInput}
                  onChange={(e) => setPostcodeInput(e.target.value)}
                  placeholder="3065"
                />
              </div>
            </div>
          </div>
        )}

        {/* Filter Suburbs */}
        <Input
          id="store-search"
          placeholder="Filter by Melbourne suburb or postcode (e.g. Fitzroy, CBD, St Kilda, 3000)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<MapPin className="h-4 w-4" />}
        />

        {/* Store Cards List */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filteredStores.map((store) => {
            const isSelected = store.id === selectedStoreId;
            return (
              <div
                key={store.id}
                role="button"
                tabIndex={0}
                onClick={() => handleSelectStore(store.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelectStore(store.id);
                  }
                }}
                className={cn(
                  'group relative flex flex-col justify-between rounded-2xl border p-4 text-left transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary',
                  isSelected
                    ? 'border-brand-primary bg-brand-primary/6 shadow-sm'
                    : 'border-border-subtle bg-bg-surface hover:border-border-strong',
                )}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">
                        {store.suburb} • VIC {store.postcode}
                      </span>
                      <h4 className="font-display text-base font-bold text-text-primary">
                        {store.name}
                      </h4>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-primary" />
                    )}
                  </div>

                  <p className="mt-1 text-xs text-text-secondary">{store.address}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <Badge tone="success">Open • {store.openingHours}</Badge>
                    <Badge
                      tone={
                        store.busyLevel === 'quiet'
                          ? 'info'
                          : store.busyLevel === 'moderate'
                            ? 'amber'
                            : 'warning'
                      }
                    >
                      {store.busyLevel === 'quiet'
                        ? 'Fast Grill'
                        : store.busyLevel === 'moderate'
                          ? 'Moderate Rush'
                          : 'Peak Hour'}
                    </Badge>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-border-subtle pt-2.5 text-xs text-text-secondary">
                  <span className="inline-flex items-center gap-1 font-semibold text-text-primary">
                    <Clock className="h-3.5 w-3.5 text-brand-secondary" />
                    {fulfillmentMode === FULFILLMENT_MODES.PICKUP
                      ? `Ready in ~${store.pickupEtaMinutes} mins`
                      : `Est. ${store.deliveryEtaMinutes} mins (${formatAUD(store.deliveryFee)} fee)`}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-text-muted">
                    <Phone className="h-3 w-3" />
                    {store.phone}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
