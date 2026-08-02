import { renderFirebaseNotConfigured } from '@/includes/not-configured'

describe('renderFirebaseNotConfigured', () => {
    test('renders a friendly banner into the given element', () => {
        const el = document.createElement('div')

        renderFirebaseNotConfigured(el)

        expect(el.textContent).toContain('Firebase not configured')
        expect(el.textContent).toContain('.env')
        expect(el.textContent).toContain('VITE_FIREBASE_API_KEY')
    })

    test('does nothing when the element is missing', () => {
        expect(() => renderFirebaseNotConfigured(null)).not.toThrow()
    })
})
