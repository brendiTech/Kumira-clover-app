# Kumira 🛒

**Kumira** is a full-stack self-service kiosk platform for businesses. It combines an Android app running on Clover POS devices with a web dashboard for merchants to manage products and monitor sales analytics in real time.

---

## Overview

Kumira lets customers browse products, build a cart, and pay — all without staff assistance. Every transaction syncs to the cloud, giving merchants a live view of their sales performance through a web dashboard.

The system has two parts:

- **Kiosk App** — A Kotlin Android app deployed on Clover POS hardware (Station, Mini, Flex). Customers interact with this at the point of sale.
- **Merchant Dashboard** — A Next.js web app where merchants log in to manage their product catalog, view orders, and track revenue analytics.

---

## Features

### Kiosk App (Android / Clover)
- Product grid organized by category with images and prices
- Category filtering tabs for quick navigation
- Shopping cart with quantity controls and real-time totals
- Native Clover payment processing (card swipe, tap, insert)
- Automatic order sync to Supabase on successful payment
- Simulated payment fallback for development without a Clover device

### Merchant Dashboard (Web)
- Secure authentication with Supabase Auth
- Sales analytics with configurable time periods (today, week, month)
- Revenue charts broken down by hour
- Top products ranking by revenue
- Recent orders feed
- Product catalog management (create, edit, toggle availability)
- Multi-device support (track sales across multiple Clover terminals)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Kiosk App | Kotlin, Jetpack Compose, Clover Android SDK |
| Dashboard | Next.js 16, React 19, TypeScript |
| UI | Tailwind CSS v4, shadcn/ui |
| Backend | Next.js API Routes (server-side) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Payments | Clover Payment Connector SDK |
| Deployment | Vercel (dashboard), Clover device (kiosk) |

---

## Project Structure

```
kumira/
├── app/                        # Next.js app router
│   ├── page.tsx                # Analytics dashboard
│   ├── productos/              # Product management
│   └── auth/                   # Login & registration
├── components/
│   ├── dashboard/              # Analytics UI components
│   └── products/               # Product management components
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser-side Supabase client
│   │   ├── server.ts           # Server-side Supabase client
│   │   └── api.ts              # Service role client for API routes
│   └── types.ts                # Shared TypeScript types
├── scripts/
│   ├── 001_create_tables.sql   # Database schema
│   └── 002_seed_products.sql   # Demo seed data
└── clover-kiosk-app/           # Android app
    └── app/src/main/java/com/example/cloverkiosk/
        ├── MainActivity.kt
        ├── clover/
        │   └── CloverPaymentHelper.kt
        ├── data/
        │   ├── models/Models.kt
        │   ├── remote/SupabaseClient.kt
        │   └── repository/KioskRepository.kt
        └── ui/
            ├── screens/
            ├── components/
            ├── viewmodel/
            └── theme/
```

---

## Getting Started

### Prerequisites

- Node.js >= 20.9.0
- pnpm
- Android Studio (Meerkat 2024.3 or newer)
- JDK 17
- A Supabase project
- A Clover developer account (for payment testing)

### Dashboard Setup

```bash
# Clone the repo
git clone https://github.com/your-org/kumira.git
cd kumira

# Install dependencies
pnpm install

# Set environment variables
cp .env.example .env
```

Add to `.env`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

```bash
# Run database migrations
# Paste contents of scripts/001_create_tables.sql in Supabase SQL Editor
# Optionally seed demo data with scripts/002_seed_products.sql

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Android Kiosk App Setup

```bash
cd clover-kiosk-app
```

1. Open the `clover-kiosk-app` folder in Android Studio (Meerkat 2024.3+)
2. Set Gradle JDK to Java 17 in **Settings → Build, Execution, Deployment → Build Tools → Gradle**
3. Add your Supabase credentials to `gradle.properties`:

```properties
SUPABASE_ANON_KEY=your-anon-key
```

4. Sync project and build:

```bash
./gradlew assembleDebug
```

5. Deploy to a Clover device or run on an emulator (payments will be simulated on non-Clover devices)

---

## Deployment

### Dashboard (Vercel)

```bash
npx vercel --prod
```

Set the following environment variables in your Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Kiosk App (Clover Device)

1. Enable Developer Options on the Clover device
2. Connect via USB
3. Run from Android Studio or sideload the APK:

```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```

---

## Payment Flow

```
Customer taps "Pay"
       ↓
App checks for Clover device availability
       ↓
  ┌────┴────┐
  │ Clover  │              │ No Clover │
  │ device  │              │ (dev/sim) │
  └────┬────┘              └─────┬─────┘
       ↓                         ↓
SaleRequest sent          Simulated payment
via PaymentConnector      processed directly
       ↓                         ↓
  onSaleResponse ────────────────┘
       ↓
Order saved to Supabase
       ↓
Dashboard analytics updated
```

---

## Environment Variables

| Variable | Where used | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client (browser) | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only (API routes) | Secret key with full DB access — never expose to browser |

---

