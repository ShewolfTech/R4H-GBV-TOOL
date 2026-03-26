# Rights 4 Her Uganda — GBV Documentation & Response Tool

A secure, PWA-enabled incident reporting system for gender-based violence cases.

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.local.example .env.local
```
Fill in all values in `.env.local`

### 3. Generate VAPID keys (push notifications)
```bash
node scripts/generate-vapid-keys.js
```
Copy both keys into `.env.local`

### 4. Create the admin user
```bash
node scripts/seed-admin.js
```
Edit the password in the script before running. Change it after first login.

### 5. Run development server
```bash
npm run dev
```
Open http://localhost:3000

---

## Routes

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Welcome screen |
| `/report` | Public | 7-step incident form |
| `/report/success` | Public | Confirmation + case ref |
| `/admin` | Staff | Login page |
| `/admin/dashboard` | Staff only | All cases, search, filters |
| `/admin/cases/[id]` | Staff only | Case detail + case management |

---

## Environment Variables

```env
MONGODB_URI                   # MongoDB Atlas connection string
NEXTAUTH_SECRET               # Random 32-char string (openssl rand -base64 32)
NEXTAUTH_URL                  # http://localhost:3000 (or production URL)
ADMIN_EMAIL                   # The one email allowed to log in
NEXT_PUBLIC_VAPID_PUBLIC_KEY  # From generate-vapid-keys.js
VAPID_PRIVATE_KEY             # From generate-vapid-keys.js
```

---

## MongoDB Collections (auto-created)

- `incidents` — all form submissions
- `users` — single admin account
- `pushsubscriptions` — push notification subscriptions

---

## Deployment (Vercel)

```bash
npm i -g vercel
vercel
```

Add all environment variables in the Vercel dashboard.
Set `NEXTAUTH_URL` to your production domain.

---

## Security Notes

- Admin access is gated by `ADMIN_EMAIL` env var — not a DB role
- Passwords hashed with bcrypt (cost 12)
- Sessions expire after 8 hours
- VAPID private key never leaves the server
- Quick Exit button on every page for survivor safety
