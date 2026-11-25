# 🏠 Aapka PG - Minimalist PG & Hostel Management App

A modern, clean, cross-platform mobile application (iOS & Android) built for Paying Guest (PG) and hostel owners in India. Designed with a **minimalist, high-contrast Slate/Zinc design system (zero purple gradients)** and simple, human-friendly terminology.

---

## 🌟 Core Highlights

- **👥 3-Role Architecture (Role-Secured):**
  - **🙋 Tenant Portal:** View monthly dues, pay rent directly with 0% gateway fees, check room electricity consumption, track complaint progress in 3 live stages, and view the weekly dining menu.
  - **🧑‍💼 Manager Operations:** Quick room meter reading entries with automated calculation, ticket resolution tracker, and digital tenant onboarding.
  - **👑 Malik (Owner) Super-Admin:** Full financial health dashboard (collected vs. overdue rent, deposits held), live 40-bed visual matrix, 1-click WhatsApp vacancy marketing, room shifting, and tenant exit/deposit settlements.

- **⚡ 0% Gateway Fee Direct UPI & Cash Payment System:**
  - **Direct to Owner's Bank Account:** No 2% Razorpay/Cashfree transaction cuts.
  - **Standard UPI Deep Linking (`upi://pay`):** Launches Google Pay, PhonePe, Paytm, BHIM, or CRED with Owner's UPI ID, legal name, and exact bill amount pre-filled.
  - **Dynamic In-App QR Code & Copy UPI:** Perfect cross-platform fallback for iOS and tablets.
  - **12-Digit UTR Verification:** Tenant submits the transaction reference; Owner/Manager verifies and approves with 1 tap.
  - **Cash Support:** 1-tap "Cash Received" confirmation that automatically generates digital receipts.

- **🛠️ Real-World Edge Cases Handled:**
  - **Electricity Metered vs. Included:** Rooms with sub-meters calculate units and split automatically among roommates; non-AC / flat-rate rooms display an "Included in Rent (₹0 extra)" badge.
  - **Pro-Rata Rent on Join:** Automatically calculates partial first-month rent when a tenant moves in mid-month.
  - **Exit & Security Deposit Settlement:** Calculates final deductions (unpaid rent, electricity, damages) against the deposit, outputs the net refund, and auto-vacates the bed.
  - **1-Click Bed Shifting:** Swaps room/bed for existing tenants while preserving history and KYC documents.
  - **Live Bed Matrix:** Visual 40-bed color-coded grid with instant promotional link generator for WhatsApp marketing.

---

## 🎨 Design System

- **Clean & High Contrast:** Modern Slate/Zinc palette inspired by Linear and Stripe (`#0F172A`, `#F8FAFC`, `#FFFFFF`).
- **No Purple Gradients:** Replaced flashiness with clean cards, crisp borders, and focused typography.
- **Color-Coded Statuses:**
  - 🟢 **Emerald (`#059669`):** Paid bills, vacant beds, resolved complaints.
  - 🟡 **Amber (`#D97706`):** Verification pending, beds on notice, in-progress tickets.
  - 🔴 **Rose (`#E11D48`):** Overdue rent, unpaid dues.

---

## 📁 Project Structure

```
aapka-pg/
├── .github/
│   └── workflows/
│       └── build.yml             # GitHub Actions CI for Typecheck & Web/App export
├── assets/                       # App icons and splash assets
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx        # Top navigation with live Role Switcher Pill
│   │   │   └── TabBar.tsx        # Dynamic bottom navigation per role
│   │   └── upi/
│   │       └── DirectUPIModal.tsx# 0% Fee UPI launcher, QR fallback & UTR verification
│   ├── context/
│   │   └── AppContext.tsx        # Central reactive state store with mock 40-bed PG data
│   ├── screens/
│   │   ├── auth/
│   │   │   └── LoginScreen.tsx   # Phone + OTP + Smart Role Switcher (Screen 10)
│   │   ├── tenant/
│   │   │   ├── MeraKirayaScreen.tsx   # Screen 1: Online Rent, Direct UPI & Receipts
│   │   │   ├── BijliBillScreen.tsx    # Screen 2: Electricity Sub-meter & Room split
│   │   │   ├── ComplaintScreen.tsx    # Screen 3: File complaint + 3-stage live tracker
│   │   │   └── KhaanaMenuScreen.tsx   # Screen 4: Clean weekly mess menu
│   │   ├── manager/
│   │   │   ├── MeterReadingScreen.tsx # Screen 5: Room readings entry & batch send
│   │   │   ├── ComplaintListScreen.tsx# Screen 6: Review & resolve tickets
│   │   │   ├── NayaTenantScreen.tsx   # Screen 7: Onboard tenant + pro-rata rent + KYC
│   │   │   └── RoomShiftModal.tsx     # Room/Bed transfer workflow
│   │   └── malik/
│   │       ├── KirayaHisaabScreen.tsx # Screen 8: Revenue, pending dues & UTR approvals
│   │       ├── KhaaliBedScreen.tsx    # Screen 9: Visual 40-bed matrix & WhatsApp share
│   │       ├── MalikOperationsScreen.tsx # Solo Owner super-admin operations hub
│   │       └── ExitSettlementModal.tsx# Deposit refund & move-out settlement
│   ├── theme/
│   │   └── colors.ts             # Minimalist color palette
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces for all PG entities
│   └── utils/
│       └── upi.ts                # NPCI UPI deep link & QR code utilities
├── App.tsx                       # Root application entry
├── app.json                      # Expo app configuration
├── eas.json                      # EAS Build configuration (Android APK / iOS)
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Expo Go app on your physical iOS or Android phone (or an emulator)

### Installation
```bash
# Clone the repository
git clone https://github.com/<your-username>/aapka-pg.git
cd aapka-pg

# Install dependencies
npm install
```

### Running Locally
```bash
# Start the Expo development server
npx expo start

# Run directly on Android
npm run android

# Run directly on iOS (requires macOS for local simulator)
npm run ios

# Run in Web browser
npm run web
```

---

## 📱 Testing Roles Inside the App

Use the **Role Switcher pill** in the top navigation bar to test all user journeys instantly:
1. **Tenant:** View Rohit Sharma's November rent (₹9,463), click **"Pay via UPI"** to test the zero-fee UPI flow, file an AC repair ticket, and rate today's lunch.
2. **Manager:** Record current meter readings, 1-tap batch send bills to all rooms, mark open complaints as viewed/done, or onboard a new tenant with pro-rata rent.
3. **Malik (Owner):** Review revenue stats (₹2,58,000 collected), approve pending UTR verification requests, share the vacant bed link on WhatsApp, or perform a security deposit exit settlement.

---

## 📦 Building Android APK (Ready for Deployment)

This repository includes `eas.json` configured for Android APK generation:
```bash
# Install EAS CLI
npm install -g eas-cli

# Log in to your Expo account
eas login

# Build a standalone Android APK
eas build -p android --profile preview
```

---

## 🤖 GitHub Actions CI/CD

The workflow at `.github/workflows/build.yml` runs on every push:
- Validates all TypeScript types (`npx tsc --noEmit`).
- Prepares the production bundle (`npx expo export --platform web`).
- Uploads the exported build artifacts.
