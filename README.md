# Southern Cross Burgers (Melbourne, Australia)
### Craft Fast-Food Online Ordering & Analytics Showcase

> **Flame-Grilled Under the Southern Cross — Melbourne's Craft Fast-Food Kitchen.**  
> A frontend-only showcase project built with React 19, Vite 8, Tailwind CSS v4, Redux Toolkit, React Router v8, and Recharts. Demonstrates modern product design, WCAG AA accessibility, data visualization, and an end-to-end Australian e-commerce experience.

---

## 🍔 Showcase Highlights

- **Melbourne Authenticity**: 8 connected Melbourne kitchens (Flinders Flagship, Fitzroy Brunswick St, South Yarra Chapel St, St Kilda Esplanade, Carlton Lygon St, Richmond Swan St, Docklands, Footscray), AUD pricing, and 10% Australian GST explicitly displayed.
- **Interactive Item Customization**: Size upgrades (Single, Double Stack, Southern King Triple), "Make it a Meal" combo upgrades (craft sodas & golden sides), add-ons (Aged cheddar, Otway bacon, sunny egg, truffle aioli), ingredient removals, and kitchen notes with live animated pricing.
- **Cart Slide-Over Drawer**: Customization breakdown, quantity stepper, smart upsell carousel, free delivery threshold progress bar (A$35), promo codes (`MELB15`, `FLAME10`, `FREEDEL`), and Australian 10% GST breakdown.
- **Dual-Adapter Payment Architecture**:
  - **Mock Payment Adapter (Default)**: Completely offline simulator with 1-click demo buttons for **Success (`4242 4242 4242 4242`)**, **3D Secure SMS Challenge (`4000 0025 0000 3155`)**, and **Declined (`4000 0000 0000 0002`)**.
  - **Stripe Test Mode Adapter**: Production-grade `@stripe/stripe-js` loader interfacing with a secure Vercel Node serverless function (`/api/create-payment-intent`).
- **Live Animated Order Tracking**: 4-stage visual progress timeline (*Received → Flame Grilling → Ready / En Route → Delivered*), dynamic countdown timer, courier status, interactive demo fast-forward controls, and official printable Australian tax invoice receipt.
- **Customer Dashboard & Flame Rewards**: Tier progression (*Bronze Star → Silver Cross → Southern Gold*), redeemable vouchers, saved delivery addresses, and **1-Click Reorder**.
- **Admin Analytics Dashboard**: Composable Recharts visualizations (Gross Revenue & Orders AreaChart, 24h Peak Rush Hour stacked bar, Category Revenue Share donut, Top-Selling Leaderboard, and a **Live Kitchen Order Gateway** where admins can change order statuses in real time).
- **1-Click Demo Persona Switcher**: Instant switching between **Alex Mercer (Customer — Southern Gold)**, **Sarah Chen (Store Operations Manager)**, and **First-Time Guest**.
- **Demo API Simulator**: Floating bottom toolbar to simulate artificial network latency (0ms, 400ms, 1200ms) or force 503 gateway errors to demonstrate skeletons and error recovery.

---

## 🛠 Tech Stack

| Layer | Library / Tool | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | React + ReactDOM | `19.2.x` | Modern component architecture & React Compiler |
| **Bundler** | Vite | `8.3.x` | Lightning fast HMR & Rollup code-splitting |
| **Styling** | Tailwind CSS | `4.3.x` | Modern `@theme` CSS tokens, flash-free Light & Dark themes |
| **State** | Redux Toolkit + RTK Query | `2.13.x` | Slices for cart, orders, stores, auth + mock API |
| **Routing** | React Router | `8.5.x` | Data router with lazy code-split routes |
| **Charts** | Recharts | `3.10.x` | Accessible SVG charts (Area, Stacked Bar, Donut) |
| **Primitives** | Radix UI | `1.8.x` | Accessible dialogs, drawers, and focus management |
| **Icons** | Lucide React | `1.61.x` | Consistent vector iconography |
| **Toasts** | Sonner | `2.0.x` | Theme-aware toast notifications |
| **Serverless** | Vercel Serverless (Node) | `@vercel/node 27.x` | `/api/create-payment-intent.ts` for Stripe Test Mode |
| **Testing** | Vitest | `5.0.x` | Vite-native unit and integration tests |

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js `18.0.0` or higher
- npm or pnpm

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/fastfood-onlineorder-app.git
cd fastfood-onlineorder-app

# Install dependencies
npm install
```

### 3. Environment Configuration
The application runs **100% offline out-of-the-box** using the default Mock Payment Adapter. No Stripe account or API keys are required to present or review the app.

To optionally test with real Stripe Test Mode keys:
```bash
cp .env.example .env.local
```
Update `.env.local`:
```env
VITE_PAYMENT_ADAPTER=stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Running Tests & Quality Verification

```bash
# Run unit & integration tests (15 test suites)
npm test

# Run ESLint across entire codebase
npm run lint

# Run TypeScript compilation and production build
npm run build
```

---

## 💳 Demo Accounts & Test Credentials

### Demo Accounts
Click the **Demo Switcher pill** in the top-right header or visit `/login` to switch accounts in 1 click:
1. **Customer**: `Alex Mercer` — Southern Gold tier (1,420 pts), past orders in history, saved Fitzroy loft address.
2. **Admin**: `Sarah Chen` — Operations Manager, full access to Melbourne regional analytics and live kitchen orders.
3. **Guest**: Clean session for showcasing new customer onboarding.

### Test Cards (Available in Checkout Simulator)
- **🟢 Instant Approval**: `4242 4242 4242 4242` • Any future date (e.g. `12/28`) • CVC `123`
- **🟡 3D Secure SMS Challenge**: `4000 0025 0000 3155` • Triggers simulated Melbourne Bank SMS verification modal (Code: `884210`)
- **🔴 Card Declined**: `4000 0000 0000 0002` • Simulates bank decline and recovery

### Promo Codes
- `MELB15`: 15% off any order over A$25.00
- `FLAME10`: A$10.00 off family/combo feasts over A$45.00
- `FREEDEL`: Free delivery across all Melbourne suburbs on orders over A$20.00

---

## ☁️ Deploying to Vercel

The project is pre-configured with a root `vercel.json` for SPA route rewrites preserving `/api/*` serverless routes:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    {
      "source": "/((?!api/.*).*)",
      "destination": "/index.html"
    }
  ]
}
```

### Deploying via Vercel CLI:
```bash
npm i -g vercel
vercel
```

When deploying on the free **Vercel Hobby Plan**:
1. Framework Preset: **Vite**
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. Set optional environment variable `STRIPE_SECRET_KEY` if testing serverless Stripe payments.

---

## 📁 Project Architecture

```text
src/
├── app/
│   ├── store.ts                  # Redux store with localStorage sync middleware
│   ├── router.tsx                # React Router v8 data router with lazy route splitting
│   ├── simulatorSlice.ts         # Theme and Demo API Simulator state
│   └── layouts/
│       ├── RootLayout.tsx        # Sticky header, store selector, mobile bottom nav, sticky cart
│       └── AdminLayout.tsx       # Admin header & navigation
├── components/
│   ├── ui/                       # Accessible Button, Card, Badge, Modal, Drawer, Skeleton, Input
│   └── common/                   # ThemeToggle, BrandLogo, ApiSimulatorControl
├── data/
│   ├── menuSeed.ts               # 23+ original Melbourne fast-food items across 9 categories
│   ├── storesSeed.ts             # 8 Melbourne locations (CBD, Fitzroy, South Yarra, St Kilda, etc.)
│   ├── promosSeed.ts             # Promo codes & demo customer/admin profiles
│   └── analyticsSeed.ts          # Sales trends (7d/30d/90d), hourly rush data, category splits
├── features/
│   ├── auth-mock/                # DemoLoginPage, authSlice, loyalty tier calculations
│   ├── stores/                   # StoreSelectorModal, storeSlice (pickup vs delivery)
│   ├── menu/                     # HomePage, MenuPage, ItemCard, ItemDetailModal
│   ├── cart/                     # CartDrawerShell, cartSlice, cartSelectors, cart.test.ts
│   ├── checkout/                 # CheckoutShellPage (Fulfillment, Contact, Dual-Adapter payment)
│   ├── orders/                   # CustomerDashboardShellPage (1-Click Reorder, Loyalty, Addresses)
│   ├── tracking/                 # TrackingShellPage (4-Stage animated timeline, tax invoice receipt)
│   └── dashboard/                # AdminDashboardShellPage (Recharts analytics & Live Kitchen Gateway)
├── services/
│   ├── mockApi.ts                # RTK Query with simulated latency and outage controls
│   └── payment/                  # MockPaymentAdapter, StripePaymentAdapter, getPaymentAdapter
└── styles/
    └── index.css                 # Tailwind v4 theme variables (Light and Dark tokens)
api/
└── create-payment-intent.ts      # Vercel Serverless Function (Stripe Test Mode)
```

---

## 📄 License

MIT. Crafted for showcase & portfolio demonstration purposes. All brand names, menu items, and copy are original and fictional.
