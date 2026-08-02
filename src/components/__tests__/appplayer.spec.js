import { shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AppPlayer from '@/components/AppPlayer.vue'
import usePlayerStore from '@/stores/player'

vi.mock('howler', () => ({ Howl: class Howl {} }))

describe('AppPlayer.vue', () => {
    let store
    let pinia

    const mountPlayer = () => shallowMount(AppPlayer, { global: { plugins: [pinia] } })

    beforeEach(() => {
        pinia = createPinia()
        setActivePinia(pinia)
        store = usePlayerStore()
    })

    describe('play / pause button', () => {
        test('shows the play icon while nothing is playing', () => {
            const wrapper = mountPlayer()
            const btn = wrapper.find('#play-pause-btn')

            expect(btn.classes()).toContain('fa-play')
            expect(btn.classes()).not.toContain('fa-pause')
        })

        test('flips to the pause icon while a song is playing', async () => {
            const wrapper = mountPlayer()

            store.sound = { playing: () => true }
            await wrapper.vm.$nextTick()

            const btn = wrapper.find('#play-pause-btn')
            expect(btn.classes()).toContain('fa-pause')
            expect(btn.classes()).not.toContain('fa-play')
        })

        test('clicking it calls the store toggleAudio action', async () => {
            const toggleAudio = vi.spyOn(store, 'toggleAudio').mockResolvedValue(undefined)
            const wrapper = mountPlayer()

            await wrapper.find('#play-pause-btn').trigger('click')

            expect(toggleAudio).toHaveBeenCalledTimes(1)
        })
    })

    describe('scrub bar', () => {
        test('clicking it forwards the event to updateSeek', async () => {
            const updateSeek = vi.spyOn(store, 'updateSeek').mockImplementation(() => {})
            const wrapper = mountPlayer()

            await wrapper.find('div.cursor-pointer').trigger('click')

            expect(updateSeek).toHaveBeenCalledTimes(1)
            expect(updateSeek.mock.calls[0][0]).toBeInstanceOf(Event)
        })

        test('the progress bar and ball track playerProgress', async () => {
            const wrapper = mountPlayer()

            store.playerProgress = '42%'
            await wrapper.vm.$nextTick()

            const [ball, bar] = wrapper.findAll('div.cursor-pointer > span')
            expect(ball.attributes('style')).toContain('left: 42%')
            expect(bar.attributes('style')).toContain('width: 42%')
        })
    })

    describe('track info', () => {
        test('renders the store seek and duration labels', async () => {
            const wrapper = mountPlayer()

            expect(wrapper.find('.player-currenttime').text()).toBe('00:00')
            expect(wrapper.find('.player-duration').text()).toBe('00:00')

            store.seek = '1:23'
            store.duration = '3:45'
            await wrapper.vm.$nextTick()

            expect(wrapper.find('.player-currenttime').text()).toBe('1:23')
            expect(wrapper.find('.player-duration').text()).toBe('3:45')
        })

        test('hides the title row until a song is loaded, then shows it', async () => {
            const wrapper = mountPlayer()
            expect(wrapper.find('.song-title').exists()).toBe(false)

            store.currentSong = { modified_name: 'Ocean Avenue', display_name: 'Sample Sounds' }
            await wrapper.vm.$nextTick()

            expect(wrapper.find('.song-title').text()).toBe('Ocean Avenue')
            expect(wrapper.find('.song-artist').text()).toBe('Sample Sounds')
        })
    })
})
