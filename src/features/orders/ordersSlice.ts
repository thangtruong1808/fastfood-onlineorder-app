import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { OrderRecord, OrderStatus } from '@/types';

const STORAGE_KEY_ORDERS = 'scb_orders_state';

const SEED_ORDERS: OrderRecord[] = [
  {
    id: 'ord-melb-7821',
    orderNumber: 'SCB-7821',
    createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    estimatedReadyAt: new Date(Date.now() + 12 * 60 * 1000).toISOString(),
    status: 'preparing',
    fulfillmentMode: 'delivery',
    storeId: 'melb-fitzroy-brunswick',
    storeName: 'Southern Cross • Brunswick St',
    storeSuburb: 'Fitzroy',
    deliveryAddress: '42 Napier Street, Apt 3B, Fitzroy VIC 3065',
    scheduledSlot: 'ASAP (~15–20 mins)',
    customerName: 'Alex Mercer',
    customerPhone: '0412 389 441',
    customerEmail: 'alex.mercer@melbmail.com.au',
    items: [
      {
        cartItemId: 'itm-southern-cross-signature-large',
        menuItemId: 'itm-southern-cross-signature',
        name: 'The Southern Cross Signature',
        imageUrl:
          'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80',
        categoryId: 'burgers',
        basePrice: 16.9,
        unitPrice: 21.4, // Large (+4.50)
        quantity: 1,
        customization: {
          sizeId: 'large',
          sizeLabel: 'Double Stack (300g)',
          isCombo: false,
          selectedAddOns: [],
          removedIngredients: [],
        },
      },
      {
        cartItemId: 'itm-rosemary-sea-salt-chips-regular',
        menuItemId: 'itm-rosemary-sea-salt-chips',
        name: 'Signature Rosemary & Murray Salt Chips',
        imageUrl:
          'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=900&q=80',
        categoryId: 'sides',
        basePrice: 6.5,
        unitPrice: 6.5,
        quantity: 1,
        customization: {
          sizeId: 'regular',
          sizeLabel: 'Regular',
          isCombo: false,
          selectedAddOns: [],
          removedIngredients: [],
        },
      },
    ],
    subtotal: 27.9,
    discountAmount: 0,
    deliveryFee: 3.5,
    gstIncluded: 2.85,
    total: 31.4,
    paymentMethodLabel: 'Test Card (•••• 4242)',
    loyaltyPointsEarned: 314,
  },
];

export interface OrdersState {
  orders: OrderRecord[];
  activeOrderId: string | null;
}

function loadInitialOrders(): OrdersState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ORDERS);
    if (raw) {
      const parsed = JSON.parse(raw) as OrderRecord[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return {
          orders: parsed,
          activeOrderId: parsed[0]?.id ?? null,
        };
      }
    }
  } catch {
    // Ignore storage parse error
  }
  return {
    orders: SEED_ORDERS,
    activeOrderId: SEED_ORDERS[0].id,
  };
}

const ordersSlice = createSlice({
  name: 'orders',
  initialState: loadInitialOrders(),
  reducers: {
    createOrder(state, action: PayloadAction<OrderRecord>) {
      state.orders.unshift(action.payload);
      state.activeOrderId = action.payload.id;
    },
    updateOrderStatus(
      state,
      action: PayloadAction<{ orderId: string; status: OrderStatus }>,
    ) {
      const order = state.orders.find((o) => o.id === action.payload.orderId);
      if (order) {
        order.status = action.payload.status;
      }
    },
    setActiveOrderId(state, action: PayloadAction<string | null>) {
      state.activeOrderId = action.payload;
    },
  },
});

export const { createOrder, updateOrderStatus, setActiveOrderId } = ordersSlice.actions;
export { STORAGE_KEY_ORDERS };
export default ordersSlice.reducer;

