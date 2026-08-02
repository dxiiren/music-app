import { setActivePinia, createPinia } from 'pinia'
import useUserStore from '@/stores/user'
import firebase from '@/includes/firebase'

vi.mock('@/includes/firebase', () => ({
    default: {
        auth: { name: 'auth-service' },
        db: { name: 'firestore' },
        signInWithEmailAndPassword: vi.fn(() => Promise.resolve({ user: { uid: 'uid-1' } })),
        createUserWithEmailAndPassword: vi.fn(() =>
            Promise.resolve({ user: { uid: 'uid-1', email: 'new@example.test' } }),
        ),
        signOut: vi.fn(() => Promise.resolve()),
        setDoc: vi.fn(() => Promise.resolve()),
        doc: vi.fn(() => 'user-doc-ref'),
        updateProfile: vi.fn(() => Promise.resolve()),
    },
}))

const credentials = { email: 'akmal@example.test', password: 's3cret' }

const registration = {
    ...credentials,
    name: 'Akmal',
    age: 25,
    country: 'Malaysia',
}

describe('User Store', () => {
    let userStore

    beforeEach(() => {
        vi.clearAllMocks()
        vi.spyOn(console, 'log').mockImplementation(() => {})
        setActivePinia(createPinia())
        userStore = useUserStore()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    test('starts logged out', () => {
        expect(userStore.userLoggedIn).toBe(false)
    })

    describe('login', () => {
        test('authentication user', async () => {
            expect(userStore.userLoggedIn).toBe(false)

            await userStore.login({})

            expect(userStore.userLoggedIn).toBe(true)
        })

        test('passes the auth service and credentials straight through', async () => {
            await userStore.login(credentials)

            expect(firebase.signInWithEmailAndPassword).toHaveBeenCalledWith(
                firebase.auth,
                credentials.email,
                credentials.password,
            )
        })

        test('a rejected sign-in leaves the user logged out', async () => {
            firebase.signInWithEmailAndPassword.mockRejectedValueOnce(
                new Error('auth/wrong-password'),
            )

            await expect(userStore.login(credentials)).rejects.toThrow('auth/wrong-password')

            expect(userStore.userLoggedIn).toBe(false)
        })
    })

    describe('register', () => {
        test('creates the account, writes the profile doc and sets the display name', async () => {
            await userStore.register(registration)

            expect(firebase.createUserWithEmailAndPassword).toHaveBeenCalledWith(
                firebase.auth,
                registration.email,
                registration.password,
            )
            expect(firebase.doc).toHaveBeenCalledWith(firebase.db, 'users', 'uid-1')
            expect(firebase.setDoc).toHaveBeenCalledWith('user-doc-ref', {
                uid: 'uid-1',
                name: registration.name,
                email: registration.email,
                age: registration.age,
                country: registration.country,
            })
            expect(firebase.updateProfile).toHaveBeenCalledWith(
                { uid: 'uid-1', email: 'new@example.test' },
                { displayName: registration.name },
            )
            expect(userStore.userLoggedIn).toBe(true)
        })

        test('a rejected sign-up leaves the user logged out and writes no profile doc', async () => {
            firebase.createUserWithEmailAndPassword.mockRejectedValueOnce(
                new Error('auth/email-already-in-use'),
            )

            await expect(userStore.register(registration)).rejects.toThrow(
                'auth/email-already-in-use',
            )

            expect(firebase.setDoc).not.toHaveBeenCalled()
            expect(userStore.userLoggedIn).toBe(false)
        })
    })

    describe('logout', () => {
        test('signs out of firebase and clears the flag', async () => {
            await userStore.login(credentials)
            expect(userStore.userLoggedIn).toBe(true)

            await userStore.logout()

            expect(firebase.signOut).toHaveBeenCalledWith(firebase.auth)
            expect(userStore.userLoggedIn).toBe(false)
        })
    })
})
