# SocioServe

A full-stack platform for booking domestic help / maid services, with separate flows for
customers, service providers (maids) and admins.

## Tech stack

**Frontend** — React 19, Vite, Tailwind CSS, React Router, Framer Motion, Leaflet (maps),
Recharts, Firebase (auth), Cashfree JS checkout.

**Backend** — Node.js, Express 5, MongoDB (Mongoose), JWT auth, Cloudinary (media),
Nodemailer (email), Cashfree PG (payments), Groq SDK, Firebase Admin.

## Project structure

```
backend/
  config/        service configuration (db, cloudinary, ...)
  controllers/   auth, user, maid, booking, payment, review, helpdesk, admin
  models/        User, Maid, Booking, Address, Review, Helpdesk*
  routes/        express routers, mounted in server.js
  middleware/    auth + upload middleware
  utils/         shared helpers
  emails/        email templates
frontend/
  src/pages/     Home, Login/Register, User/Maid/Admin dashboards, MaidList
  src/components/
  src/api/       axios clients
```

## Getting started

### Backend

```bash
cd backend
npm install
cp .env.example .env        # then fill in real values
npm run dev                 # nodemon, or `npm start`
```

You also need a Firebase service account key at `backend/serviceAccountKey.json`
(download it from the Firebase console — it is git-ignored, never commit it).

### Frontend

```bash
cd frontend
npm install
cp .env.example .env        # then fill in real values
npm run dev
```

## Environment variables

See `backend/.env.example` and `frontend/.env.example` for the full list. Secrets
(`.env` files, `serviceAccountKey.json`, `backend/uploads/`) are excluded from version
control via `.gitignore`.
