# FixMatch

FixMatch is a modern platform designed to bridge the gap between vehicle owners and repair shops. It streamlines the process of finding reliable mechanics, booking services, and managing repair jobs.

## 🚀 Features

### For Vehicle Owners

- **Easy Job Creation**: Submit repair requests with details about your vehicle and the issue.
- **Find Repair Shops**: Browse and locate nearby repair shops using an interactive map.
- **Booking System**: Schedule appointments directly through the platform.
- **Compare Offers**: Receive and compare quotes from different workshops.
- **User Dashboard**: Manage bookings, requests, and received offers.

### For Repair Shops

- **Business Profile**: Manage your shop's presence, services, and opening hours.
- **Job Board**: View available repair jobs in your area and submit offers.
- **Booking Management**: Dedicated dashboard to handle incoming appointments.
- **Subscription Plans**: Manage business subscriptions and features.

### General

- **Real-time Messaging**: Communication channel between owners and shops.
- **Mobile Support**: Optimized for mobile devices with Capacitor support (iOS/Android).
- **Secure Payments**: Integrated with Stripe for secure transactions.
- **Interactive Visuals**: 3D visualization using Three.js and Mapbox.

## 🛠 Tech Stack

- **Framework**: [Vue 3](https://vuejs.org/) (Composition API)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **State Management**: [Pinia](https://pinia.vuejs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), SCSS, [PrimeVue](https://primevue.org/)
- **Backend/Auth**: [Firebase](https://firebase.google.com/)
- **Maps**: [Mapbox GL JS](https://www.mapbox.com/)
- **Mobile**: [Capacitor](https://capacitorjs.com/)
- **Payments**: [Stripe](https://stripe.com/)
- **Testing**: Cypress, Vitest

## 📦 Prerequisites

- Node.js (v18+ recommended)
- npm or pnpm

## 🔧 Installation

1. Navigate to the client directory:

   ```bash
   cd client
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Environment Setup:
   Ensure you have the necessary environment variables set up (e.g., Firebase config, Mapbox token, Stripe keys).

## 🏃‍♂️ Running the Project

### Development

Start the development server with hot-reload:

```bash
npm run dev
```

### Production Build

Build the project for production:

```bash
npm run build
```

### Mobile Development (iOS)

Sync and open the iOS project:

```bash
npx cap sync ios
npx cap open ios
```

## 📂 Project Structure

- `src/components`: Reusable UI components organized by feature (Nav, Dialogs, Forms, etc.).
- `src/views`: Page-level components (Landing, Admin, UserHome, etc.).
- `src/stores`: Pinia state management modules.
- `src/services`: API service layers (Firebase interactions, Authentication, etc.).
- `src/assets`: Static assets, global styles, and visualizations.
- `src/models`: TypeScript interfaces and types for type safety.
- `src/composables`: Shared logic and Vue composables (e.g., SEO).
