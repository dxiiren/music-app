import { RouterLinkStub, shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { reactive } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import useUserStore from '@/stores/user'
import useModalStore from '@/stores/modal'
import firebase from '@/includes/firebase'

vi.mock('@/includes/firebase', () => ({
    default: {
        auth: {},
        signOut: vi.fn(() => Promise.resolve()),
    },
}))

let pinia

const mountHeader = ({ route = { name: 'home', meta: {} }, locale = 'en' } = {}) => {
    // $i18n has to be reactive or currentLocale() never re-evaluates.
    const $i18n = reactive({ locale })
    const $router = { push: vi.fn() }

    const wrapper = shallowMount(AppHeader, {
        global: {
            plugins: [pinia],
            components: { 'router-link': RouterLinkStub },
            mocks: {
                $t: (msg) => msg,
                $i18n,
                $route: route,
                $router,
            },
        },
    })

    return { wrapper, $i18n, $router }
}

const localeToggle = (wrapper) => wrapper.find('ul.ml-auto a')

describe('AppHeader.vue', () => {
    let userStore
    let modalStore

    beforeEach(() => {
        pinia = createPinia()
        setActivePinia(pinia)
        userStore = useUserStore()
        modalStore = useModalStore()
        firebase.signOut.mockClear()
    })

    describe('locale toggle', () => {
        test('labels the active locale', () => {
            const { wrapper } = mountHeader({ locale: 'en' })
            expect(localeToggle(wrapper).text()).toBe('English')
        })

        test('flips en -> ms -> en and relabels each time', async () => {
            const { wrapper, $i18n } = mountHeader({ locale: 'en' })

            await localeToggle(wrapper).trigger('click')
            expect($i18n.locale).toBe('ms')
            expect(localeToggle(wrapper).text()).toBe('Malay')

            await localeToggle(wrapper).trigger('click')
            expect($i18n.locale).toBe('en')
            expect(localeToggle(wrapper).text()).toBe('English')
        })

        test('labels a non-en locale as Malay', () => {
            const { wrapper } = mountHeader({ locale: 'ms' })
            expect(localeToggle(wrapper).text()).toBe('Malay')
        })
    })

    describe('logged out', () => {
        test('offers Login / Register and hides the member links', () => {
            const { wrapper } = mountHeader()

            expect(wrapper.text()).toContain('Login / Register')
            expect(wrapper.text()).not.toContain('Logout')

            const links = wrapper.findAllComponents(RouterLinkStub).map((l) => l.props().to)
            expect(links).not.toContain('/manage')
        })

        test('clicking Login / Register opens the auth modal', async () => {
            const { wrapper } = mountHeader()
            expect(modalStore.isOpen).toBe(false)

            await wrapper.find('li a').trigger('click')

            expect(modalStore.isOpen).toBe(true)
        })
    })

    describe('logged in', () => {
        test('swaps Login / Register for Manage and Logout', async () => {
            const { wrapper } = mountHeader()

            userStore.userLoggedIn = true
            await wrapper.vm.$nextTick()

            expect(wrapper.text()).not.toContain('Login / Register')
            expect(wrapper.text()).toContain('Logout')

            const links = wrapper.findAllComponents(RouterLinkStub).map((l) => l.props().to)
            expect(links).toContain('/manage')
        })
    })

    describe('signOut', () => {
        test('signs the user out of firebase and clears the flag', async () => {
            const { wrapper } = mountHeader()
            userStore.userLoggedIn = true
            await wrapper.vm.$nextTick()

            await wrapper.vm.signOut()
            await wrapper.vm.$nextTick()

            expect(firebase.signOut).toHaveBeenCalledTimes(1)
            expect(userStore.userLoggedIn).toBe(false)
        })

        test('leaves an auth-gated route for home', async () => {
            const { wrapper, $router } = mountHeader({
                route: { name: 'manage', meta: { requiresAuth: true } },
            })
            userStore.userLoggedIn = true
            await wrapper.vm.$nextTick()

            await wrapper.vm.signOut()

            expect($router.push).toHaveBeenCalledWith({ name: 'home' })
        })

        test('stays put when the current route is public', async () => {
            const { wrapper, $router } = mountHeader({ route: { name: 'about', meta: {} } })
            userStore.userLoggedIn = true
            await wrapper.vm.$nextTick()

            await wrapper.vm.signOut()

            expect($router.push).not.toHaveBeenCalled()
        })
    })
})
