# Southern Cross Burgers — iOS & Android Mobile App (Expo + React Native + TypeScript)

An Australian fast-casual online ordering, customer loyalty, regional analytics, and counter/drive-thru POS mobile application built with **Expo SDK 52**, **React Native**, **TypeScript**, **Expo Router**, **NativeWind v4 (Tailwind CSS)**, and **Redux Toolkit + RTK Query**.

> **Complete Isolation:** This mobile application lives entirely inside `/mobile` and shares zero runtime imports with the root Vite web application, while preserving 100% of the visual identity, Melbourne seed data, AUD + 10% GST rules, and Stripe test-mode payment flows.

---

## 1. Quick Start (iOS Simulator & Android Emulator)

### Prerequisites
- **Node.js** 18+ and npm
- **iOS (macOS):** Xcode + iOS Simulator installed
- **Android (Windows / macOS / Linux):** Android Studio + Android Virtual Device (AVD) running, or **Expo Go** on a physical iOS/Android device

### Install & Launch
```bash
cd mobile
npm install

# Start the Expo Metro bundler
npx expo start
```

### Run on iOS Simulator or Android Emulator
- Press **`i`** in the terminal (or run `npm run ios`) to open in **iOS Simulator**.
- Press **`a`** in the terminal (or run `npm run android`) to open in **Android Emulator**.
- Or scan the terminal QR code using the **Expo Go** app on any physical iOS or Android device.

---

## 2. Screen & Navigation Map

| Web Route | Mobile Route (`expo-router`) | Description |
| :--- | :--- | :--- |
| `/` | `app/(tabs)/index.tsx` | **Home Tab**: Hero showcase, 1-tap promo code copy (`MELB15`, `FREEDEL`, `FLAME10`), category quick-strip, Chef's Signatures, Popular Near You, Loyalty banner, and Melbourne Kitchens directory |
| `/menu` | `app/(tabs)/menu.tsx` | **Menu Tab**: Category pills, debounced search, dietary chips (`Vegetarian`, `Spicy`, `Chef's Signature`, `Popular`), `Saved` favorites filter, 6 sort modes, and `ItemDetailSheet` customization modal |
| `/dashboard` | `app/(tabs)/orders.tsx` | **Orders & Loyalty Tab**: 4-sub-tab Customer Hub (`Orders`, `Flame Rewards`, `Favorites`, `Melbourne Addresses`) with 1-tap reorder, point redemption, and AU Tax Invoice modal |
| `/admin` | `app/(tabs)/admin.tsx` | **Admin Ops Tab**: Regional Melbourne Analytics (`7d`/`30d`/`90d` + store filter), native SVG charts, Top Dishes, Store KPIs, and Live Kitchen Order Feed with 1-tap status progression |
| *(Header / Floating Widgets)* | `app/(tabs)/more.tsx` | **Demo & Settings Tab**: 1-Tap Demo Persona Switcher (`Liam O'Connor`, `Marcus Vance`, `Guest`), Theme Toggle (`Light`/`Dark`/`System`), Store Selector, RTK Query API Latency/503 Simulator, and POS launcher |
| `/checkout` | `app/checkout.tsx` | **Checkout Stack Screen**: Delivery/Pickup summary, Melbourne address validation, time slots, Stripe Test Mode & Mock Payment Simulator (`4242`, `3155`, `0002`), and 3DS 2.0 OTP verification sheet |
| `/tracking/:orderId` | `app/tracking/[orderId].tsx` | **Live Order Tracker**: 4-stage live progress stepper, Reviewer Fast-Forward stage controls, and Australian GST Tax Invoice sheet |
| `/pos` | `app/pos.tsx` | **Counter & Drive-Thru POS Register**: Dine-In/Takeaway/Drive-Thru modes, Table/Buzzer assignment, 1-tap item grid, Staff/Promo discounts, Cash Tender Calculator, EFTPOS charge, and Thermal Kitchen Docket modal |

---

## 3. Stripe Test Mode & Payment Simulator Cards

By default (`EXPO_PUBLIC_PAYMENT_MODE=mock`), the app runs the interactive **Stripe Test Card & 3DS 2.0 Simulator** out-of-the-box in Expo Go, iOS Simulator, and Android Emulator:

| Preset Button | Card Number | Behavior |
| :--- | :--- | :--- |
| **Success (4242)** | `4242 •••• •••• 4242` | Instant `succeeded` payment & navigates to Live Order Tracking |
| **3DS Challenge (3155)** | `4000 •••• •••• 3155` | Triggers the interactive **3D Secure 2.0 Bank OTP Modal** (enter any 6 digits, e.g. `123456`) |
| **Decline (0002)** | `4000 •••• •••• 0002` | Simulates an issuer card decline with inline error feedback |

To enable the native `@stripe/stripe-react-native` PaymentSheet in a custom Expo dev client, copy `.env.example` to `.env` and set `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...` and `EXPO_PUBLIC_PAYMENT_MODE=stripe`.

