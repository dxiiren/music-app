import HomeView from '@/views/HomeView.vue'
import SongItem from '@/components/SongItem.vue'
import firebase from '@/includes/firebase'
import { flushPromises, shallowMount } from '@vue/test-utils'
import { vi } from 'vitest'

// Stub the firebase bundle so importing HomeView never touches the real SDK
// (with no VITE_FIREBASE_* env the real module has no initialized services).
vi.mock('@/includes/firebase', () => ({
    default: {
        isConfigured: false,
        db: {},
        collection: vi.fn(() => 'songs-collection'),
        query: vi.fn((...args) => ({ args })),
        orderBy: vi.fn(() => 'order-by'),
        limit: vi.fn((n) => `limit-${n}`),
        startAfter: vi.fn((doc) => ({ startAfter: doc })),
        getDocs: vi.fn(),
    },
}))

const doc = (id) => ({ id, data: () => ({ modified_name: `Song ${id}` }) })

const snapshot = (docs) => ({
    docs,
    size: docs.length,
    empty: docs.length === 0,
    forEach: (cb) => docs.forEach(cb),
})

const page = (count, offset = 0) =>
    snapshot(Array.from({ length: count }, (_, i) => doc(`s${offset + i}`)))

const mountHome = (options = {}) =>
    shallowMount(HomeView, {
        global: {
            mocks: { $t: (msg) => msg },
            directives: { icon: () => {} },
        },
        ...options,
    })

describe('HomeView.vue', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        firebase.getDocs.mockResolvedValue(page(0))
        vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    test('renders list of song', () => {
        const songs = [{}, {}, {}]

        const component = mountHome({
            data() {
                return { songs }
            },
        })

        const items = component.findAllComponents(SongItem)
        expect(items).toHaveLength(songs.length)

        items.forEach((wrapper, idx) => {
            expect(wrapper.props().song).toStrictEqual(songs[idx])
        })
    })

    describe('loadSongs', () => {
        test('fetches the first ordered page on created and renders it', async () => {
            firebase.getDocs.mockResolvedValue(page(7))

            const wrapper = mountHome()
            await flushPromises()

            expect(firebase.collection).toHaveBeenCalledWith(firebase.db, 'songs')
            expect(firebase.orderBy).toHaveBeenCalledWith('modified_name')
            expect(firebase.limit).toHaveBeenCalledWith(7)
            expect(firebase.startAfter).not.toHaveBeenCalled()

            expect(wrapper.vm.songs).toHaveLength(7)
            expect(wrapper.vm.songs[0]).toStrictEqual({ id: 's0', modified_name: 'Song s0' })
            expect(wrapper.vm.pendingRequest).toBe(false)
            expect(wrapper.vm.noMoreSongs).toBe(false)
            expect(wrapper.findAllComponents(SongItem)).toHaveLength(7)
        })

        test('pages the next batch with startAfter the last doc', async () => {
            const first = page(7)
            firebase.getDocs.mockResolvedValueOnce(first).mockResolvedValueOnce(page(7, 7))

            const wrapper = mountHome()
            await flushPromises()

            await wrapper.vm.loadSongs()

            expect(firebase.startAfter).toHaveBeenCalledWith(first.docs[6])
            expect(wrapper.vm.songs).toHaveLength(14)
        })

        test('stops paging once a short page comes back', async () => {
            firebase.getDocs.mockResolvedValue(page(3))

            const wrapper = mountHome()
            await flushPromises()

            expect(wrapper.vm.noMoreSongs).toBe(true)

            await wrapper.vm.loadSongs()
            expect(firebase.getDocs).toHaveBeenCalledTimes(1)
        })

        test('ignores a re-entrant call while a request is still pending', async () => {
            firebase.getDocs.mockResolvedValue(page(7))

            const wrapper = mountHome()
            const inFlight = wrapper.vm.loadSongs()
            await flushPromises()
            await inFlight

            expect(firebase.getDocs).toHaveBeenCalledTimes(1)
        })

        test('a failed page is logged and does not wedge infinite scroll', async () => {
            firebase.getDocs
                .mockRejectedValueOnce(new Error('firestore is unhappy'))
                .mockResolvedValueOnce(page(3))

            const wrapper = mountHome()
            await flushPromises()

            expect(console.error).toHaveBeenCalled()
            expect(wrapper.vm.songs).toHaveLength(0)
            // The retry latch has to be released or scrolling never loads again.
            expect(wrapper.vm.pendingRequest).toBe(false)

            await wrapper.vm.loadSongs()

            expect(firebase.getDocs).toHaveBeenCalledTimes(2)
            expect(wrapper.vm.songs).toHaveLength(3)
        })
    })

    describe('infinite scroll', () => {
        test('loads another page when the scroll reaches the bottom', async () => {
            firebase.getDocs.mockResolvedValue(page(7))

            const wrapper = mountHome()
            await flushPromises()

            vi.spyOn(document.documentElement, 'scrollTop', 'get').mockReturnValue(500)
            vi.spyOn(document.documentElement, 'offsetHeight', 'get').mockReturnValue(1268)
            vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(768)

            wrapper.vm.handleScroll()
            await flushPromises()

            expect(firebase.getDocs).toHaveBeenCalledTimes(2)
        })

        test('does nothing while the page is not at the bottom', async () => {
            firebase.getDocs.mockResolvedValue(page(7))

            const wrapper = mountHome()
            await flushPromises()

            vi.spyOn(document.documentElement, 'scrollTop', 'get').mockReturnValue(0)
            vi.spyOn(document.documentElement, 'offsetHeight', 'get').mockReturnValue(5000)
            vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(768)

            wrapper.vm.handleScroll()
            await flushPromises()

            expect(firebase.getDocs).toHaveBeenCalledTimes(1)
        })
    })
})
