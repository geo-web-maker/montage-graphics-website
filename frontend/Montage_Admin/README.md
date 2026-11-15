# Montage Admin

Standalone admin app (PWA + Capacitor). Separate from the public site in `../Frontend_new`.

    npm install
    cp .env.example .env      # VITE_API_URL must be an absolute backend URL
    npm run dev

- PWA: deploy as its own Vercel project; install from the browser.
- Android: `npx cap add android` once, then `npm run cap:android`.
- Backend CORS must allow this app's origin and `https://localhost` (Capacitor).
