// Rendered by src/main.js instead of mounting the app when the Firebase
// config is empty (see src/includes/firebase-config.js). Inline styles on
// purpose: this screen must render even if the CSS pipeline changes.
export function renderFirebaseNotConfigured(el) {
    if (!el) return

    el.innerHTML = `
        <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f9fafb; font-family: 'Roboto', system-ui, sans-serif; padding: 1.5rem;">
            <div style="max-width: 34rem; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <h1 style="font-size: 1.5rem; font-weight: 700; color: #1f2937; margin-bottom: 0.75rem;">
                    &#127925; Firebase not configured
                </h1>
                <p style="color: #4b5563; margin-bottom: 1rem; line-height: 1.6;">
                    The app shell is running, but no Firebase project is wired up yet,
                    so there is nothing to sign in to or stream from.
                </p>
                <ol style="color: #4b5563; line-height: 1.8; margin: 0 0 1rem 1.25rem; padding: 0; list-style: decimal;">
                    <li>Copy <code style="background:#f3f4f6;padding:0.1rem 0.3rem;border-radius:0.25rem;">.env.example</code> to <code style="background:#f3f4f6;padding:0.1rem 0.3rem;border-radius:0.25rem;">.env</code></li>
                    <li>Fill the <code style="background:#f3f4f6;padding:0.1rem 0.3rem;border-radius:0.25rem;">VITE_FIREBASE_API_KEY</code> and friends from your Firebase console</li>
                    <li>Restart the dev server</li>
                </ol>
                <p style="color: #6b7280; font-size: 0.875rem; margin: 0;">
                    Details in the README's <strong>Firebase setup</strong> section.
                </p>
            </div>
        </div>
    `
}
