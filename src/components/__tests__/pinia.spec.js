import { setActivePinia, createPinia } from 'pinia'
import useUserStore from '@/stores/user'

vi.mock('@/includes/firebase', () => ({
    default: {
        signInWithEmailAndPassword: vi.fn(() => Promise.resolve()),
    },
}))

describe('User Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
    })

    test('authentication user', async () => {
        const userStore = useUserStore()

        expect(userStore.userLoggedIn).toBe(false)

        await userStore.login({})

        expect(userStore.userLoggedIn).toBe(true)
    })
})
