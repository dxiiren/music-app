import { vi } from 'vitest'

// The config module reads import.meta.env at evaluation time, so each test
// stubs the env first and then imports a fresh copy of the module.
const loadConfigModule = async () => {
    vi.resetModules()
    return await import('@/includes/firebase-config')
}

describe('firebase-config', () => {
    afterEach(() => {
        vi.unstubAllEnvs()
    })

    test('reads VITE_FIREBASE_* env vars into the config object', async () => {
        vi.stubEnv('VITE_FIREBASE_API_KEY', 'test-api-key')
        vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'test.firebaseapp.com')
        vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'test-project')
        vi.stubEnv('VITE_FIREBASE_STORAGE_BUCKET', 'test.appspot.com')
        vi.stubEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', '123456789012')
        vi.stubEnv('VITE_FIREBASE_APP_ID', '1:123456789012:web:abc123')
        vi.stubEnv('VITE_FIREBASE_MEASUREMENT_ID', 'G-TEST123')

        const { firebaseConfig, isFirebaseConfigured } = await loadConfigModule()

        expect(firebaseConfig).toStrictEqual({
            apiKey: 'test-api-key',
            authDomain: 'test.firebaseapp.com',
            projectId: 'test-project',
            storageBucket: 'test.appspot.com',
            messagingSenderId: '123456789012',
            appId: '1:123456789012:web:abc123',
            measurementId: 'G-TEST123',
        })
        expect(isFirebaseConfigured).toBe(true)
    })

    test('omits measurementId when its env var is not set', async () => {
        vi.stubEnv('VITE_FIREBASE_API_KEY', 'test-api-key')
        vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'test.firebaseapp.com')
        vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'test-project')
        vi.stubEnv('VITE_FIREBASE_STORAGE_BUCKET', 'test.appspot.com')
        vi.stubEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', '123456789012')
        vi.stubEnv('VITE_FIREBASE_APP_ID', '1:123456789012:web:abc123')
        vi.stubEnv('VITE_FIREBASE_MEASUREMENT_ID', '')

        const { firebaseConfig } = await loadConfigModule()

        expect(firebaseConfig).not.toHaveProperty('measurementId')
    })

    test('falls back to an empty object when the API key is missing', async () => {
        vi.stubEnv('VITE_FIREBASE_API_KEY', '')

        const { firebaseConfig, isFirebaseConfigured } = await loadConfigModule()

        expect(firebaseConfig).toStrictEqual({})
        expect(isFirebaseConfigured).toBe(false)
    })
})
