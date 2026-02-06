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

### Frontend (Client)

- **Framework**: [Vue 3](https://vuejs.org/) (Composition API)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **State Management**: [Pinia](https://pinia.vuejs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), SCSS, [PrimeVue](https://primevue.org/)
- **Maps**: [Mapbox GL JS](https://www.mapbox.com/)
- **Mobile**: [Capacitor](https://capacitorjs.com/)

### Backend (Server)

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (via [Mongoose](https://mongoosejs.com/))
- **Authentication**: [Firebase Admin](https://firebase.google.com/docs/admin/setup)
- **Payment**: [Stripe](https://stripe.com/)
- **Email**: Nodemailer, Resend, Mailtrap

## 📦 Prerequisites

- Node.js (v20+ recommended)
- npm or pnpm (pnpm is used in the server)
- MongoDB instance (local or Atlas)

## 🔧 Installation

### Client Setup

1. Navigate to the client directory:

   ```bash
   cd client
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Environment Setup:
   Create a `.env` file in the `client` directory with necessary keys (Firebase, Mapbox, Stripe).

### Server Setup

1. Navigate to the server directory:

   ```bash
   cd server
   ```

2. Install dependencies (using pnpm):

   ```bash
   npm install -g pnpm
   pnpm install
   ```

3. Environment Setup:
   Create a `.env` file in the `server` directory. Required variables typically include:
   - `PORT`
   - `MONGODB_URI`
   - `STRIPE_SECRET_KEY`
   - `FIREBASE_ADMIN_CREDENTIALS`
   - Email service credentials

## 🏃‍♂️ Running the Project

### Start Client

Start the development server with hot-reload:

```bash
cd client
npm run dev
```

### Start Server

Start the backend server:

```bash
cd server
npm run dev
```

### Mobile Development (iOS)

Sync and open the iOS project (from client directory):

```bash
cd client
npx cap sync ios
npx cap open ios
```

## 📂 Project Structure

- **`client/`**: Vue 3 frontend application.
  - `src/components`: Reusable UI components.
  - `src/views`: Page-level components.
  - `src/stores`: Pinia state management.
  - `src/services`: API and Firebase services.
- **`server/`**: Express.js backend API.
  - `routes/`: API route definitions.
  - `models/`: Mongoose data models.
  - `components/`: Scheduled tasks and utilities.
  - `email-templates/`: Templates for transactional emails.
