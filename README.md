# 🧺 Find Laundry Service — CRM Portal

> A full-stack, single-owner CRM system built for **Find Laundry Service**, Mambakkam, Chennai.  
> Manage customers, generate Razorpay payment links, send bills via WhatsApp/SMS, and track payment status — all from one dashboard.

---

## 🌐 Live Demo

| Service | URL |
|---|---|
| **Frontend** | https://find-laundry-frontend.onrender.com |
| **Backend API** | https://find-laundry-backend.onrender.com |
| **Health Check** | https://find-laundry-backend.onrender.com/health |

---

## ✨ Features

- 🔐 **Firebase Authentication** — secure email/password login for admin accounts only
- 👥 **Customer Directory** — add and manage customers with name, phone, and door number
- 🧾 **Bill Generation** — search customer by door number, enter amount, send invoice in one click
- 💳 **Razorpay Integration** — generates a secure hosted payment link for each bill
- 📲 **Twilio Messaging** — sends bill link via WhatsApp and/or SMS automatically
- 💵 **Cash Payment Mode** — record offline (cash/GPay) payments, instantly marked as PAID
- 📋 **Billing Logs** — full audit trail with search, status filter, and per-bill actions
- 🔁 **Reminder System** — resend payment reminders via WhatsApp or SMS from the logs page
- ✅ **Manual Pay Override** — mark any pending bill as PAID directly from the dashboard
- 🔄 **Razorpay Sync** — verify real-time payment status from Razorpay with one click

---

## 🛠️ Tech Stack

### Frontend
| Tool | Purpose |
|---|---|
| [React 19](https://react.dev) + [Vite](https://vitejs.dev) | UI framework & build tool |
| [Tailwind CSS v4](https://tailwindcss.com) | Utility-first styling |
| [React Router v7](https://reactrouter.com) | Client-side routing |
| [Axios](https://axios-http.com) | HTTP API calls |
| [Firebase SDK](https://firebase.google.com) | Email/Password authentication |
| [Lucide React](https://lucide.dev) | Icon library |
| [serve](https://github.com/vercel/serve) | Static file server for production |

### Backend
| Tool | Purpose |
|---|---|
| [Node.js](https://nodejs.org) + [Express 5](https://expressjs.com) | REST API server |
| [Prisma ORM v7](https://www.prisma.io) | Database access layer |
| [PostgreSQL](https://www.postgresql.org) via [Neon](https://neon.tech) | Serverless database |
| [Razorpay Node SDK](https://razorpay.com/docs/api) | Payment link creation & verification |
| [Twilio](https://twilio.com) | SMS & WhatsApp messaging |
| [cors](https://github.com/expressjs/cors) | Cross-origin request handling |
| [dotenv](https://github.com/motdotla/dotenv) | Environment variable loading |

### Hosting
| Service | What runs there |
|---|---|
| [Render](https://render.com) | Backend (Node Web Service) + Frontend (Node Web Service) |
| [Neon](https://neon.tech) | Serverless PostgreSQL database |
| [Firebase](https://firebase.google.com) | Authentication provider |

---

## 📁 Project Structure

```
my-shop-crm/
├── render.yaml                  # Render Blueprint — defines both services
├── .gitignore
│
├── frontend/                    # Vite + React app
│   ├── public/
│   │   └── logo.png
│   ├── src/
│   │   ├── api.js               # Centralised backend base URL
│   │   ├── firebase.js          # Firebase SDK initialisation
│   │   ├── App.jsx              # Router + AuthProvider
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Firebase auth state (login/logout/user)
│   │   ├── components/
│   │   │   ├── Navbar.jsx       # Sidebar + mobile topbar with logout
│   │   │   └── ProtectedRoute.jsx  # Redirects unauthenticated users
│   │   └── pages/
│   │       ├── Login.jsx        # Branded login page
│   │       ├── Dashboard.jsx    # Stats overview
│   │       ├── Customers.jsx    # Customer CRUD
│   │       ├── Billing.jsx      # Bill generation
│   │       └── Logs.jsx         # Payment history & actions
│   ├── .env.example
│   └── package.json
│
└── backend/                     # Express API server
    ├── server.js                # All routes + middleware
    ├── prisma.config.ts         # Prisma 7 config (reads DATABASE_URL)
    ├── prisma/
    │   ├── schema.prisma        # Customer + Payment models
    │   └── migrations/          # SQL migration history
    ├── .env.example
    └── package.json
```

---

## 🗃️ Database Schema

```prisma
model Customer {
  id         Int       @id @default(autoincrement())
  name       String
  phone      String    @unique          // E.164 format e.g. +919876543210
  doorNumber String                     // e.g. "12/A"
  payments   Payment[]
  createdAt  DateTime  @default(now())
}

model Payment {
  id             Int       @id @default(autoincrement())
  amount         Float
  status         String    @default("PENDING")  // PENDING | PAID
  razorpayLinkId String?
  deliveryMethod String?   @default("whatsapp") // whatsapp | sms | both | none
  doorNumber     String
  customer       Customer  @relation(fields: [customerId], references: [id])
  customerId     Int
  createdAt      DateTime  @default(now())
  paidAt         DateTime?
}
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js ≥ 18
- PostgreSQL running locally (or a Neon free account)
- Firebase project with Email/Password auth enabled
- Razorpay account (test mode keys)
- Twilio account with a sandbox WhatsApp number

### 1. Clone the repository

```bash
git clone https://github.com/dhinesh0-bi/CRM_shop.git
cd CRM_shop/my-shop-crm
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env
# Fill in all values in .env (see Environment Variables section below)
npm install
npx prisma migrate deploy   # Creates tables in your database
npm run dev                 # Starts server on http://localhost:8080
```

### 3. Frontend setup

```bash
cd frontend
cp .env.example .env
# Fill in Firebase keys + VITE_API_URL=http://localhost:8080
npm install
npm run dev                 # Starts on http://localhost:5173
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (e.g. from Neon with `?sslmode=require`) |
| `RAZORPAY_KEY_ID` | Razorpay API key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay API key secret |
| `TWILIO_ACCOUNT_SID` | Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token |
| `TWILIO_PHONE_NUMBER` | Twilio phone number for SMS (e.g. `+12185147898`) |
| `TWILIO_WHATSAPP_NUMBER` | Twilio WhatsApp sender (e.g. `whatsapp:+14155238886`) |
| `PORT` | Server port — Render sets this automatically |

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend URL (e.g. `https://find-laundry-backend.onrender.com`) |
| `VITE_FIREBASE_API_KEY` | Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |

> ⚠️ **Never commit `.env` files.** Only `.env.example` files (with blank values) are tracked by git.

---

## ☁️ Deployment Guide (Render + Neon)

### Step 1 — Neon database

1. Create a free project at [console.neon.tech](https://console.neon.tech)
2. Copy the connection string (PostgreSQL URL ending with `?sslmode=require`)
3. Run migrations locally once with the Neon URL set as `DATABASE_URL`:
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

### Step 2 — Backend on Render

1. Render → **New Web Service** → connect `dhinesh0-bi/CRM_shop`
2. Settings:
   - Root Directory: `backend`
   - Build: `npm install && npx prisma generate && npx prisma migrate deploy`
   - Start: `npm start`
3. Add all backend environment variables in the **Environment** tab
4. Deploy and confirm `https://<backend>.onrender.com/health` returns `{"status":"ok"}`

### Step 3 — Frontend on Render

1. Render → **New Web Service** → same repo
2. Settings:
   - Root Directory: `frontend`
   - Build: `npm install && npm run build`
   - Start: `npm start`
3. Add all frontend environment variables including `VITE_API_URL` pointing to your backend URL
4. Deploy — the `serve` package serves the built `dist/` folder

### Step 4 — Firebase Authorized Domains

Firebase blocks auth from unknown domains by default:

1. Firebase Console → **Authentication** → **Settings** → **Authorized domains**
2. Add your Render frontend URL: `find-laundry-frontend.onrender.com`

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check — returns `{"status":"ok"}` |
| `GET` | `/api/customers` | List all customers |
| `POST` | `/api/customers` | Create a new customer |
| `GET` | `/api/logs` | List all payment records |
| `POST` | `/api/billing/send` | Generate bill + send via WhatsApp/SMS |
| `PUT` | `/api/billing/manual-pay/:id` | Mark a payment as PAID manually |
| `POST` | `/api/billing/remind` | Resend payment reminder |
| `GET` | `/api/billing/verify/:id` | Sync payment status with Razorpay |
| `GET` | `/api/dashboard/stats` | Get summary stats (customers, revenue, pending) |

---

## 🔒 Admin Accounts

This system is restricted to authorised admin accounts created in Firebase Console.

| Admin | Email |
|---|---|
| Admin 1 | `admin1@gmail.com` |
| Admin 2 | `admin2@gmail.com` |

> Passwords are set directly in **Firebase Console → Authentication → Users**.  
> Only accounts registered in Firebase can log in — there is no self-registration.

---

## 🏪 About

**Find Laundry Service**  
Club House, Ground Floor  
SBIOA Unity Enclave, Mambakkam  
Chennai – 600 127

---

## 📄 License

This project is private and proprietary. All rights reserved © 2025 Find Laundry Service.
