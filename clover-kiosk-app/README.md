# Kumira - Self-Service Kiosk App

A Kotlin Android application for Clover POS devices that enables customers to browse products, add items to cart, and pay - all without staff assistance.

**Supabase URL:** `https://dkgnxbfxmpihwnxtwvrz.supabase.co`

## Features

- **Product Browsing**: Grid view of products organized by category
- **Category Filtering**: Filter products by category (Hot Drinks, Cold Drinks, Pastries, Sandwiches)
- **Shopping Cart**: Add/remove items with quantity controls
- **Real-time Totals**: Subtotal, tax calculation, and grand total
- **Clover Integration**: Native payment processing via Clover SDK
- **Cloud Sync**: Orders automatically sync to Supabase for analytics

## Prerequisites

- Android Studio Arctic Fox or newer
- Clover developer account
- Clover device (Station, Mini, or Flex) for testing
- Supabase project with the correct schema

## Setup

### 1. Clone and Open

Open this project in Android Studio.

### 2. Configure Supabase

Edit `gradle.properties` and add your Supabase credentials:

```properties
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### 3. Set Merchant ID

In `app/build.gradle.kts`, update the merchant ID if needed:

```kotlin
buildConfigField("String", "MERCHANT_ID", "\"your_merchant_id\"")
```

### 4. Build and Deploy

1. Connect your Clover device via USB
2. Enable Developer Options on the Clover device
3. Run the app from Android Studio

## Project Structure

```
app/src/main/java/com/example/cloverkiosk/
├── CloverKioskApplication.kt    # Application class
├── MainActivity.kt               # Main activity with payment handling
├── clover/
│   └── CloverPaymentHelper.kt   # Clover SDK wrapper
├── data/
│   ├── models/
│   │   └── Models.kt            # Data classes
│   ├── remote/
│   │   └── SupabaseClient.kt    # Supabase client singleton
│   └── repository/
│       └── KioskRepository.kt   # Data repository
└── ui/
    ├── components/
    │   ├── CartItemRow.kt       # Cart item component
    │   ├── CategoryTabs.kt      # Category filter tabs
    │   └── ProductCard.kt       # Product grid item
    ├── screens/
    │   └── KioskScreen.kt       # Main kiosk UI
    ├── theme/
    │   └── Theme.kt             # Material 3 theme
    └── viewmodel/
        └── KioskViewModel.kt    # UI state management
```

## Clover SDK Integration

The app uses the following Clover SDK features:

- **PaymentConnector**: For processing card payments
- **SaleRequest**: For initiating sale transactions
- **IPaymentConnectorListener**: For handling payment responses

### Payment Flow

1. Customer taps "Pay" button
2. App creates a `SaleRequest` with the order total
3. Clover device handles card swipe/tap/insert
4. Payment result returned via `onSaleResponse`
5. On success, order is saved to Supabase
6. Analytics dashboard updates in real-time

## Testing Without Clover Device

The app includes a fallback for development:

- If Clover SDK is not available, payments are simulated
- Orders are still saved to Supabase
- Use this for UI development and testing

## Supported Clover Devices

- Clover Station (recommended for kiosk use)
- Clover Station Pro
- Clover Mini
- Clover Flex

## Dependencies

- Jetpack Compose for UI
- Material 3 Design
- Clover Android SDK
- Supabase Kotlin Client
- Ktor for HTTP
- Coil for image loading

## License

MIT License - See LICENSE file for details.
