import {
  Bike,
  CheckCircle2,
  Clock,
  MapPin,
  Navigation,
  Phone,
  Store as StoreIcon,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useToast } from '@/components/common/ToastProvider';
import { Badge } from '@/components/ui/Badge';
import { BottomSheetModal } from '@/components/ui/BottomSheetModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MELBOURNE_STORES } from '@/data/storesSeed';
import {
  setDeliveryDetails,
  setFulfillmentMode,
  setSelectedStore,
  setStoreModalOpen,
} from '@/features/stores/storeSlice';
import { useTheme } from '@/hooks/useTheme';
import { formatAUD } from '@/lib/currency';
import { FULFILLMENT_MODES, type FulfillmentMode } from '@/types';

export function StoreSelectorSheet() {
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const { showToast } = useToast();

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
      showToast({
        title: `Kitchen switched to ${chosen.suburb}`,
        description: `${chosen.address} (${
          fulfillmentMode === FULFILLMENT_MODES.PICKUP
            ? `Pickup ~${chosen.pickupEtaMinutes} mins`
            : `Delivery ~${chosen.deliveryEtaMinutes} mins`
        })`,
        tone: 'success',
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
    <BottomSheetModal
      open={isStoreModalOpen}
      onOpenChange={(open) => dispatch(setStoreModalOpen(open))}
      title="Choose Melbourne Kitchen"
      subtitle="Select Click & Collect Pickup or Melbourne Suburb Delivery"
      footer={
        <Button variant="primary" size="lg" fullWidth onPress={handleConfirm}>
          Confirm Kitchen & Fulfillment
        </Button>
      }
    >
      <View style={{ gap: 16 }}>
        {/* Fulfillment Mode Segmented Toggle */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: colors.bgElevated,
            borderRadius: 16,
            padding: 4,
            gap: 6,
          }}
        >
          <Pressable
            onPress={() => handleModeSwitch(FULFILLMENT_MODES.PICKUP)}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              paddingVertical: 10,
              borderRadius: 12,
              backgroundColor:
                fulfillmentMode === FULFILLMENT_MODES.PICKUP
                  ? colors.bgSurface
                  : 'transparent',
            }}
          >
            <StoreIcon
              size={15}
              color={
                fulfillmentMode === FULFILLMENT_MODES.PICKUP
                  ? colors.brandPrimary
                  : colors.textSecondary
              }
            />
            <Text
              style={{
                fontSize: 13,
                fontWeight: '800',
                color:
                  fulfillmentMode === FULFILLMENT_MODES.PICKUP
                    ? colors.brandPrimary
                    : colors.textSecondary,
              }}
            >
              Click & Collect
            </Text>
          </Pressable>

          <Pressable
            onPress={() => handleModeSwitch(FULFILLMENT_MODES.DELIVERY)}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              paddingVertical: 10,
              borderRadius: 12,
              backgroundColor:
                fulfillmentMode === FULFILLMENT_MODES.DELIVERY
                  ? colors.bgSurface
                  : 'transparent',
            }}
          >
            <Bike
              size={15}
              color={
                fulfillmentMode === FULFILLMENT_MODES.DELIVERY
                  ? colors.brandPrimary
                  : colors.textSecondary
              }
            />
            <Text
              style={{
                fontSize: 13,
                fontWeight: '800',
                color:
                  fulfillmentMode === FULFILLMENT_MODES.DELIVERY
                    ? colors.brandPrimary
                    : colors.textSecondary,
              }}
            >
              Suburb Delivery
            </Text>
          </Pressable>
        </View>

        {/* Conditional Delivery Drop-off Address Form */}
        {fulfillmentMode === FULFILLMENT_MODES.DELIVERY ? (
          <View
            style={{
              backgroundColor: colors.bgElevated,
              borderColor: colors.brandPrimary,
              borderWidth: 1,
              borderRadius: 18,
              padding: 14,
              gap: 10,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Navigation size={14} color={colors.brandPrimary} />
              <Text
                style={{
                  color: colors.brandPrimary,
                  fontSize: 11,
                  fontWeight: '800',
                  textTransform: 'uppercase',
                  letterSpacing: 0.6,
                }}
              >
                Delivery Drop-off Address (Victoria)
              </Text>
            </View>

            <Input
              label="Street Address"
              value={addressInput}
              onChangeText={setAddressInput}
              placeholder="e.g. 42 Napier Street"
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 2 }}>
                <Input
                  label="Suburb"
                  value={suburbInput}
                  onChangeText={setSuburbInput}
                  placeholder="Fitzroy"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="Postcode"
                  value={postcodeInput}
                  onChangeText={setPostcodeInput}
                  keyboardType="number-pad"
                  placeholder="3065"
                />
              </View>
            </View>
          </View>
        ) : null}

        {/* Filter Suburbs Input */}
        <Input
          placeholder="Search suburb or postcode (Fitzroy, CBD, St Kilda, 3000)..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<MapPin size={16} color={colors.textMuted} />}
        />

        {/* 8 Melbourne Kitchen Cards */}
        <View style={{ gap: 10 }}>
          {filteredStores.map((store) => {
            const isSelected = store.id === selectedStoreId;
            return (
              <Pressable
                key={store.id}
                onPress={() => handleSelectStore(store.id)}
                style={{
                  borderRadius: 18,
                  borderWidth: isSelected ? 2 : 1,
                  borderColor: isSelected ? colors.brandPrimary : colors.borderSubtle,
                  backgroundColor: isSelected ? colors.bgElevated : colors.bgSurface,
                  padding: 14,
                  gap: 8,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 8,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text
                        style={{
                          color: colors.textPrimary,
                          fontSize: 15,
                          fontWeight: '800',
                        }}
                      >
                        {store.suburb}
                      </Text>
                      <Badge
                        tone={
                          store.busyLevel === 'quiet'
                            ? 'success'
                            : store.busyLevel === 'moderate'
                              ? 'amber'
                              : 'warning'
                        }
                      >
                        {store.busyLevel.toUpperCase()}
                      </Badge>
                    </View>
                    <Text
                      style={{
                        color: colors.textSecondary,
                        fontSize: 12,
                        marginTop: 2,
                      }}
                    >
                      {store.address} ({store.postcode})
                    </Text>
                  </View>

                  {isSelected ? (
                    <CheckCircle2 size={20} color={colors.brandPrimary} />
                  ) : null}
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: 12,
                    paddingTop: 6,
                    borderTopWidth: 1,
                    borderTopColor: colors.borderSubtle,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} color={colors.brandPrimary} />
                    <Text style={{ color: colors.textPrimary, fontSize: 11, fontWeight: '700' }}>
                      {fulfillmentMode === FULFILLMENT_MODES.PICKUP
                        ? `Pickup ~${store.pickupEtaMinutes}m`
                        : `Delivery ~${store.deliveryEtaMinutes}m (${formatAUD(store.deliveryFee)})`}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Phone size={12} color={colors.textMuted} />
                    <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                      {store.phone}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </BottomSheetModal>
  );
}

