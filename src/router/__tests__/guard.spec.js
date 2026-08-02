import { setActivePinia, createPinia } from 'pinia'
import router from '@/router'

// The guard reads useUserStore().userLoggedIn. Replacing the store module lets
// the spec both drive the flag and prove which routes consult it at all.
const { userState, useUserStore } = vi.hoisted(() => {
    const userState = { userLoggedIn: false }
    return { userState, useUserStore: vi.fn(() => userState) }
})

vi.mock('@/stores/user.js', () => ({ default: useUserStore }))

// Route components are lazily imported during navigation and pull in the
// firebase bundle / Howler, neither of which may touch the network here.
vi.mock('@/includes/firebase', () => ({
    default: {
        isConfigured: false,
        auth: { currentUser: null },
        db: {},
        storage: {},
        collection: vi.fn(),
        query: vi.fn(),
        where: vi.fn(),
        orderBy: vi.fn(),
        limit: vi.fn(),
        startAfter: vi.fn(),
        doc: vi.fn(),
        getDoc: vi.fn(),
        getDocs: vi.fn().mockResolvedValue({
            forEach: () => {},
            docs: [],
            size: 0,
            empty: true,
        }),
    },
}))

vi.mock('howler', () => ({ Howl: class Howl {} }))

describe('router auth guard', () => {
    beforeEach(async () => {
        setActivePinia(createPinia())
        userState.userLoggedIn = false
        await router.replace('/')
        await router.isReady()
        useUserStore.mockClear()
    })

    test('redirects a logged-out visitor away from /manage to home', async () => {
        await router.push('/manage')

        expect(useUserStore).toHaveBeenCalled()
        expect(router.currentRoute.value.name).toBe('home')
        expect(router.currentRoute.value.path).toBe('/')
    })

    test('lets a logged-in user through to /manage', async () => {
        userState.userLoggedIn = true

        await router.push('/manage')

        expect(useUserStore).toHaveBeenCalled()
        expect(router.currentRoute.value.name).toBe('manage')
        expect(router.currentRoute.value.meta.requiresAuth).toBe(true)
    })

    test.each([
        ['/', 'home'],
        ['/about', 'about'],
        ['/song/abc123', 'song'],
    ])('%s is public and never consults the user store', async (path, name) => {
        await router.push(path)

        expect(router.currentRoute.value.name).toBe(name)
        expect(useUserStore).not.toHaveBeenCalled()
    })

    test('passes the song id through as a route param', async () => {
        await router.push('/song/abc123')

        expect(router.currentRoute.value.params).toStrictEqual({ id: 'abc123' })
    })

    test('an unknown path falls through the catch-all to home', async () => {
        await router.push('/no/such/page')

        expect(router.currentRoute.value.name).toBe('home')
        expect(useUserStore).not.toHaveBeenCalled()
    })

    test('/manage is the only route carrying requiresAuth', () => {
        const guarded = router
            .getRoutes()
            .filter((route) => route.meta?.requiresAuth)
            .map((route) => route.path)

        expect(guarded).toStrictEqual(['/manage'])
    })
})
