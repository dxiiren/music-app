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

    test('renders the UI shell with demo songs instead of only the banner', () => {
        const el = document.createElement('div')

        renderFirebaseNotConfigured(el)

        // Real shell pieces: header wordmark, hero heading, Songs card
        expect(el.textContent).toContain('Music')
        expect(el.textContent).toContain('Listen to Great Music!')
        expect(el.textContent).toContain('Songs')

        // 3-4 static demo songs render in the playlist
        const demoSongs = el.querySelectorAll('[data-demo-song]')
        expect(demoSongs.length).toBeGreaterThanOrEqual(3)
        expect(demoSongs.length).toBeLessThanOrEqual(4)
        expect(el.textContent).toContain('Demo')
    })

    test('the setup notice is dismissible while the demo shell stays', () => {
        const el = document.createElement('div')
        document.body.appendChild(el)

        renderFirebaseNotConfigured(el)

        expect(el.textContent).toContain('Firebase not configured')

        el.querySelector('[data-demo-dismiss]').click()

        expect(el.textContent).not.toContain('Firebase not configured')
        expect(el.querySelectorAll('[data-demo-song]').length).toBeGreaterThanOrEqual(3)

        document.body.removeChild(el)
    })
})
