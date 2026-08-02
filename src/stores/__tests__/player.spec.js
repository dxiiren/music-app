import { setActivePinia, createPinia } from 'pinia'
import { toRaw } from 'vue'
import { Howl } from 'howler'
import usePlayerStore from '@/stores/player'
import helper from '@/includes/helper.js'

// player.js does `import { Howl } from 'howler'` — a bare top-level named
// import — so the whole module is replaced here. A real class (not vi.fn) is
// used so the store's `this.sound instanceof Howl` branch behaves like production.
vi.mock('howler', () => {
    class MockHowl {
        constructor(options) {
            this.options = options
            this.play = vi.fn()
            this.pause = vi.fn()
            this.stop = vi.fn()
            this.unload = vi.fn()
            this.on = vi.fn()
            this.once = vi.fn()
            this.playing = vi.fn(() => false)
            this.seek = vi.fn(() => 0)
            this.duration = vi.fn(() => 0)
            MockHowl.instances.push(this)
        }
    }
    MockHowl.instances = []
    return { Howl: MockHowl }
})

const song = { url: 'https://example.test/song.mp3', modified_name: 'Song' }

describe('player store', () => {
    let store

    beforeEach(() => {
        Howl.instances.length = 0
        // Keeps progress()'s rAF loop from recursing during a test.
        vi.stubGlobal('requestAnimationFrame', vi.fn())
        setActivePinia(createPinia())
        store = usePlayerStore()
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    describe('newSong', () => {
        test('constructs a Howl for the song url and starts playback', async () => {
            await store.newSong(song)

            expect(Howl.instances).toHaveLength(1)
            expect(Howl.instances[0].options).toStrictEqual({
                src: [song.url],
                html5: true,
            })
            // Pinia state is deeply reactive, so store.sound is a proxy of the Howl.
            expect(toRaw(store.sound)).toBe(Howl.instances[0])
            expect(store.currentSong).toStrictEqual(song)
            expect(Howl.instances[0].play).toHaveBeenCalledTimes(1)
        })

        test('stops and unloads the previous sound before loading the next', async () => {
            await store.newSong(song)
            const first = Howl.instances[0]

            await store.newSong({ url: 'https://example.test/other.mp3' })

            expect(first.stop).toHaveBeenCalledTimes(1)
            expect(first.unload).toHaveBeenCalledTimes(1)
            expect(Howl.instances).toHaveLength(2)
            expect(toRaw(store.sound)).toBe(Howl.instances[1])
        })

        test('drives the progress loop from the play event', async () => {
            await store.newSong(song)
            const sound = Howl.instances[0]

            const [event, handler] = sound.on.mock.calls[0]
            expect(event).toBe('play')

            sound.seek.mockReturnValue(30)
            sound.duration.mockReturnValue(120)
            handler()

            expect(requestAnimationFrame).toHaveBeenCalled()
        })
    })

    describe('toggleAudio', () => {
        test('does nothing when no sound is loaded', async () => {
            expect(store.sound).toStrictEqual({})

            await expect(store.toggleAudio()).resolves.toBeUndefined()

            expect(Howl.instances).toHaveLength(0)
        })

        test('pauses a playing sound', async () => {
            await store.newSong(song)
            const sound = Howl.instances[0]
            sound.playing.mockReturnValue(true)

            await store.toggleAudio()

            expect(sound.pause).toHaveBeenCalledTimes(1)
            expect(sound.play).toHaveBeenCalledTimes(1) // only the newSong() call
        })

        test('resumes a paused sound', async () => {
            await store.newSong(song)
            const sound = Howl.instances[0]
            sound.playing.mockReturnValue(false)

            await store.toggleAudio()

            expect(sound.pause).not.toHaveBeenCalled()
            expect(sound.play).toHaveBeenCalledTimes(2) // newSong() + the resume
        })
    })

    describe('progress', () => {
        test('formats seek and duration through the helper and computes the percentage', async () => {
            await store.newSong(song)
            const sound = Howl.instances[0]
            sound.seek.mockReturnValue(30)
            sound.duration.mockReturnValue(120)

            store.progress()

            expect(store.seek).toBe(helper.formatTime(30))
            expect(store.seek).toBe('0:30')
            expect(store.duration).toBe('2:00')
            expect(store.playerProgress).toBe('25%')
        })

        test('reports 0% instead of NaN% when the duration is not known yet', async () => {
            await store.newSong(song)
            const sound = Howl.instances[0]
            sound.seek.mockReturnValue(0)
            sound.duration.mockReturnValue(0)

            store.progress()

            expect(store.playerProgress).toBe('0%')
            expect(store.playerProgress).not.toContain('NaN')
        })

        test('schedules another frame while playing and stops once paused', async () => {
            await store.newSong(song)
            const sound = Howl.instances[0]
            sound.duration.mockReturnValue(100)

            sound.playing.mockReturnValue(true)
            store.progress()
            expect(requestAnimationFrame).toHaveBeenCalledTimes(1)

            sound.playing.mockReturnValue(false)
            store.progress()
            expect(requestAnimationFrame).toHaveBeenCalledTimes(1)
        })
    })

    describe('updateSeek', () => {
        const clickEvent = (clientX) => ({
            clientX,
            target: {
                getBoundingClientRect: () => ({ x: 100, width: 200 }),
            },
        })

        test('does nothing when no sound is loaded', () => {
            expect(() => store.updateSeek(clickEvent(150))).not.toThrow()
        })

        test('converts the click position on the scrub bar into a seek time', async () => {
            await store.newSong(song)
            const sound = Howl.instances[0]
            sound.duration.mockReturnValue(100)

            store.updateSeek(clickEvent(150)) // 25% along a 200px bar

            expect(sound.seek).toHaveBeenCalledWith(25)
            expect(sound.pause).toHaveBeenCalledTimes(1)
            expect(sound.play).toHaveBeenCalledTimes(2) // newSong() + the restart
            expect(sound.once.mock.calls[0][0]).toBe('seek')
        })

        test('seeks to the start when the bar is clicked at its left edge', async () => {
            await store.newSong(song)
            const sound = Howl.instances[0]
            sound.duration.mockReturnValue(100)

            store.updateSeek(clickEvent(100))

            expect(sound.seek).toHaveBeenCalledWith(0)
        })
    })

    describe('isPlaying getter', () => {
        test('is false on the initial empty state', () => {
            expect(store.isPlaying).toBe(false)
        })

        test('reflects Howl.playing() once a song is loaded', async () => {
            await store.newSong(song)

            // Written through the store proxy: the getter is a cached computed,
            // and only a reactive write on `sound` invalidates it.
            store.sound.playing = () => true
            expect(store.isPlaying).toBe(true)

            store.sound.playing = () => false
            expect(store.isPlaying).toBe(false)
        })
    })
})
