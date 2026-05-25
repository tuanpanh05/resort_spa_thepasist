# 🌿 Ngũ Sơn Resort & Spa

<p align="center">
  <strong>Modern Resort & Spa Management System</strong><br/>
  Built with React, Vite, TailwindCSS, and Spring Boot REST APIs.
</p>

---

## ✨ Features

- 🔐 Authentication & Authorization
- 🏨 Room Booking System
- 💆 Spa & Wellness Services
- 🧘 Yoga & Therapy Reservation
- 📱 Responsive UI/UX
- 🔌 RESTful API Integration
- 🛡 JWT Authentication
- ⚡ Fast & Modern Frontend Architecture

---

## 🛠 Tech Stack

| Frontend | Backend | Database |
|---|---|---|
| ReactJS | Spring Boot | SQL Server |
| Vite | Spring Security | JWT |
| TailwindCSS | RESTful API | |
| Axios | Java | |

---

## 📂 Project Structure

```bash
src
├── assets
├── components
├── context
├── hooks
├── layouts
├── pages
├── routes
├── services
├── utils
└── App.jsx
```

---

## 🚀 Getting Started

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/your-repository.git
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Run Development Server

```bash
npm run dev
```

### 4️⃣ Build Production

```bash
npm run build
```

---

## 🔐 Authentication Flow

```text
Register/Login
       ↓
Receive JWT Token
       ↓
Store Token
       ↓
Access Protected Routes
```

---

## 🏨 Booking Workflow

```text
Browse Rooms & Services
            ↓
Choose Booking Option
            ↓
Submit Booking Request
            ↓
Backend Validation
            ↓
Booking Confirmation
```

---

## 🔌 API Integration

The frontend communicates with the backend using Axios:

- JWT Authorization Headers
- Axios Interceptors
- Centralized Error Handling
- Automatic Redirect on Unauthorized Requests

Example:

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
```

---

## 📱 Responsive Design

- Mobile-first UI
- Tablet optimization
- Desktop responsive layout
- Modern organic-green design
- Glassmorphism effects

---

## 📸 Preview

| Home Page | Booking Page |
|---|---|
| Add Screenshot Here | Add Screenshot Here |

---

## 🧪 Testing

### Run ESLint

```bash
npm run lint
```

### Verify Production Build

```bash
npm run build
```

---

## 👨‍💻 Team Members

- Phạm Anh Tuấn
- Nguyễn Anh Dũng
- Group 3 - SE2003

---

## 🚧 Project Status

Currently under active development.

---

## 📄 License

This project is developed for educational purposes only.
