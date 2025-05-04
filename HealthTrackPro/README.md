# HealthTrack - Vital Signs Monitoring

**HealthTrack** is a full-stack application designed to help users monitor their vital signs such as blood pressure, heart rate, and glucose levels. The app allows users to log measurements, visualize trends with charts, and receive alerts when values exceed normal thresholds.
![alt text]([http://url/to/img.png](https://github.com/MatteoRossato/BioMed_PROJECT-----HealthTracker/blob/main/HealthTrackPro/generated-icon.png
))
---

## 🏠 HealthTrack Dashboard

### 🔑 Key Features

* **User Authentication**: Complete registration and login system using JWT for security
* **Vital Sign Monitoring**: Track systolic/diastolic blood pressure, heart rate (BPM), and glucose levels (mg/dL)
* **Data Visualization**: Interactive charts to track trends over time
* **Alert System**: Automatic notifications when values exceed safety thresholds
* **Date Filters**: Filter data by date ranges
* **Responsive Interface**: Optimized design for mobile and desktop devices

---

## ⚙️ Tech Stack

### 🖥️ Frontend

* **React**: JavaScript library for building the UI
* **Tailwind CSS & shadcn/ui**: CSS framework and UI components
* **Chart.js**: Charting library for visual data representation
* **React Query**: State management and API request handling
* **Zod**: Schema-based form validation

### 🛠️ Backend

* **Node.js & Express**: Backend server
* **PostgreSQL**: Relational database for persistent storage
* **Drizzle ORM**: ORM for database interaction
* **JWT**: Token-based authentication
* **Passport.js**: Authentication middleware

---

## 🧱 Application Architecture

```
/
├── client/                # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and config
│   │   ├── pages/         # Application pages
├── db/                    # Database configuration
├── server/                # Express backend
│   ├── auth.ts            # Authentication logic
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Database access
└── shared/                # Shared client-server code
    └── schema.ts          # DB schema and validation
```

---

## 🧬 Data Entities

### 👤 Users

Users can register, log in, and manage their health data.

### 📊 Health Parameters

* **Blood Pressure**: Systolic and diastolic (mmHg)
* **Heart Rate**: Beats per minute (BPM)
* **Glucose Level**: mg/dL

---

## 💡 Main Features

### 🔐 Login/Register Screen

Allows users to create an account or log in securely.

### 📈 Dashboard

Displays:

* Cards for each type of vital sign
* Trend charts for each parameter
* Latest values with color-coded status (green/yellow/red)
* Filters by date range

### ➕ Data Entry

Users can input new measurements via dedicated forms.

### 📉 Trend Charts

Charts display parameter trends over time, with threshold lines for normal values.

---

## 🔧 Technical Implementation

### 🗄️ Database Schema (PostgreSQL + Drizzle ORM)

```ts
// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Health data table
export const healthData = pgTable('health_data', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  parameterType: text('parameter_type').notNull(),
  value: decimal('value', { precision: 10, scale: 2 }).notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  notes: text('notes')
});
```

### 🔐 Authentication with JWT

```ts
export const generateToken = (userId: number): string => {
  const secret = process.env.JWT_SECRET || 'default_secret_key';
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
};
```

---

## 🧩 API Endpoints

* `POST /api/auth/register`: Register new user
* `POST /api/auth/login`: User login
* `GET /api/healthdata`: Retrieve health data (with filters)
* `POST /api/healthdata`: Add new health measurement
* `GET /api/healthdata/latest`: Get latest recorded values

---

## 📊 Data Visualization with Chart.js

```tsx
<HealthChart 
  data={[
    getHealthDataByType(PARAMETER_TYPES.BLOOD_PRESSURE_SYSTOLIC),
    getHealthDataByType(PARAMETER_TYPES.HEART_RATE),
    getHealthDataByType(PARAMETER_TYPES.GLUCOSE)
  ]}
  parameterTypes={[
    PARAMETER_TYPES.BLOOD_PRESSURE_SYSTOLIC,
    PARAMETER_TYPES.HEART_RATE,
    PARAMETER_TYPES.GLUCOSE
  ]}
/>
```

---

## 🚀 Getting Started

### Prerequisites

* Node.js
* PostgreSQL

### Installation

```bash
git clone https://github.com/yourusername/healthtrack.git
cd healthtrack
npm install
```

### Database Setup

```bash
npm run db:push     # Apply schema to DB
npm run db:seed     # Seed with example data
```

### Start the App

```bash
npm run dev
```

### Access the App

* URL: `http://localhost:5000`
* Test user: `test@example.com`
* Password: `password123`

---

## ✅ Conclusion

**HealthTrack** is a complete health monitoring tool built with a modern tech stack and scalable architecture. Its intuitive interface and robust features make it a powerful solution for staying on top of your health.

---

**© 2025 HealthTrack | Built with ❤️ for your well-being**
