# TechConnect

**Find, connect with, and book local service professionals.**

TechConnect is a web-based service discovery and booking platform designed to help customers find verified local technicians and service professionals. It supports cooperative-based worker management, service discovery, booking workflows, and customer feedback.

> Academic minor project — SIH 2026.

## Overview

TechConnect brings customers, workers, cooperative administrators, and super administrators into one platform. Customers can discover nearby workers and request services. Workers can manage their profiles, skills, availability, working hours, and bookings. Cooperative administrators can review workers and manage services for their cooperative.

## Key Features

- **Role-based access:** customer, worker, cooperative admin, and super admin.
- **Authentication:** signup, email OTP verification, login, logout, and password reset.
- **Worker onboarding:** worker profiles, cooperative association, skills, certifications, and verification workflow.
- **Worker discovery:** find nearby workers using location, distance, category, and skill filters.
- **Service catalogue:** cooperative admins create services; customers and workers can browse active services.
- **Booking management:** customers create and cancel bookings; workers manage booking status and completion.
- **Schedule management:** workers configure working days and hours.
- **Worker dashboard:** booking overview and earnings information.
- **Ratings and reviews:** customers can rate workers after service completion.
- **Community services:** cooperative admins can publish community service opportunities for workers.

Features may evolve as development continues. See [API documentation](docs/API.md) for the current backend routes.

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, Tailwind CSS, Axios, React Router |
| Backend | Node.js, Express 5 |
| Database | MongoDB, Mongoose |
| Authentication | JWT, HTTP-only cookie-based session, bcrypt |
| Email | Nodemailer |
| UI icons | Lucide React, React Icons |

## Repository Structure

```text
SIH_2026/
├── Backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── templates/
│   │   ├── utils/
│   │   └── validator/
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── docs/
│   └── API.md
├── README.md
├── LICENSE
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
├── CHANGELOG.md
└── .gitignore
```

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- npm
- MongoDB database (local MongoDB or MongoDB Atlas)
- Gmail account with an app password for email OTP delivery

### 1. Clone the repository

```bash
git clone https://github.com/abhisheknishad345/SIH_2026.git
cd SIH_2026
```

### 2. Configure the backend

```bash
cd Backend
npm install
```

Copy the example environment file and fill in your own values:

**Windows PowerShell**
```powershell
Copy-Item .env.example .env
```

**macOS / Linux**
```bash
cp .env.example .env
```

Required environment variables:

| Variable | Description |
|---|---|
| `PORT` | Backend server port (defaults to `5000`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Long, random secret used to sign JWTs |
| `EMAIL_USER` | Gmail address used to send OTP emails |
| `EMAIL_PASS` | Gmail App Password (not your normal account password) |

Start the backend:

```bash
npm run dev
```

The backend root endpoint should respond at `http://localhost:5000/` unless you configure a different port.

### 3. Configure the frontend

Open a second terminal:

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
VITE_DEV_URL=http://localhost:5000
```

Start the Vite development server:

```bash
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`).

> **Local development note:** The backend CORS configuration currently allows `http://localhost:5173`. If you change the frontend origin or backend port, update the backend CORS configuration and the frontend API base URL accordingly.

## API Documentation

The backend API route reference is maintained in **[docs/API.md](docs/API.md)**. It lists the registered HTTP methods, paths, access roles, and request details available from the current route/controller implementation.

## Security Notes

- Never commit real `.env` files, passwords, API keys, database credentials, or JWT secrets.
- Use a unique, strong `JWT_SECRET` in every environment.
- Use Gmail App Passwords for SMTP authentication.
- Keep dependencies updated and validate all incoming data.
- Report security vulnerabilities privately; see [SECURITY.md](SECURITY.md).

## Contributing

Contributions, bug reports, and suggestions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request and follow the community standards in [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## License

This project is licensed under the [MIT License](LICENSE).
