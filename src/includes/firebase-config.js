// Firebase web-app config, injected via Vite env vars (see .env.example).
//
// Copy .env.example to .env and fill the VITE_FIREBASE_* values from the
// Firebase console (Project settings > Your apps > SDK setup). When the API
// key is absent the config falls back to an empty object and the app renders
// the "Firebase not configured" banner instead of mounting (src/main.js).
//
// Note: import.meta.env.VITE_* is accessed statically on purpose — Vite
// replaces these expressions at build time.
export const firebaseConfig = import.meta.env.VITE_FIREBASE_API_KEY
    ? {
          apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
          authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
          projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
          storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
          appId: import.meta.env.VITE_FIREBASE_APP_ID,
          ...(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
              ? { measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID }
              : {}),
      }
    : {}

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey)
