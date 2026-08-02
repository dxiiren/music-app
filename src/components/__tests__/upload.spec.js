import { shallowMount } from '@vue/test-utils'
import Upload from '@/components/Upload.vue'
import firebase from '@/includes/firebase'

vi.mock('@/includes/firebase', () => ({
    default: {
        auth: { currentUser: { uid: 'uid-1', displayName: 'Tester' } },
        db: {},
        storage: {},
        ref: vi.fn(() => 'storage-ref'),
        uploadBytesResumable: vi.fn(),
        getDownloadURL: vi.fn(() => Promise.resolve('https://example.test/song.mp3')),
        collection: vi.fn(() => 'songs-collection'),
        addDoc: vi.fn(() => Promise.resolve({ id: 'doc-1' })),
    },
}))

// Stands in for the Firebase resumable upload task: captures the three
// state_changed callbacks so a test can fire them by hand.
const makeTask = () => {
    const task = {
        cancel: vi.fn(),
        snapshot: { ref: { name: 'song.mp3' } },
        handlers: {},
    }
    task.on = vi.fn((event, onProgress, onError, onComplete) => {
        task.handlers = { event, onProgress, onError, onComplete }
    })
    return task
}

const audioFile = (name = 'song.mp3', type = 'audio/mpeg') => ({ name, type })
const inputEvent = (...files) => ({ target: { files } })
const dropEvent = (...files) => ({ dataTransfer: { files } })

const setOnline = (value) => {
    Object.defineProperty(window.navigator, 'onLine', { configurable: true, get: () => value })
}

describe('Upload.vue', () => {
    let wrapper
    let addSong

    beforeEach(() => {
        vi.clearAllMocks()
        setOnline(true)
        vi.spyOn(window, 'alert').mockImplementation(() => {})
        vi.spyOn(console, 'log').mockImplementation(() => {})
        vi.spyOn(console, 'error').mockImplementation(() => {})

        addSong = vi.fn()
        wrapper = shallowMount(Upload, { props: { addSong } })
    })

    afterEach(() => {
        delete window.navigator.onLine
        vi.restoreAllMocks()
    })

    describe('file validation', () => {
        test('rejects a non-audio MIME type without starting an upload', () => {
            wrapper.vm.upload(inputEvent({ name: 'notes.txt', type: 'text/plain' }))

            expect(window.alert).toHaveBeenCalledWith('Please upload an audio file.')
            expect(firebase.uploadBytesResumable).not.toHaveBeenCalled()
            expect(wrapper.vm.uploads).toHaveLength(0)
        })

        test('accepts mpeg and wav and skips only the invalid file in a batch', () => {
            firebase.uploadBytesResumable.mockImplementation(() => makeTask())

            wrapper.vm.upload(
                inputEvent(
                    audioFile('a.mp3', 'audio/mpeg'),
                    { name: 'cover.png', type: 'image/png' },
                    audioFile('b.wav', 'audio/wav'),
                ),
            )

            expect(firebase.uploadBytesResumable).toHaveBeenCalledTimes(2)
            expect(wrapper.vm.uploads.map((u) => u.name)).toStrictEqual(['a.mp3', 'b.wav'])
        })

        test('reads dropped files off dataTransfer as well as the file input', () => {
            firebase.uploadBytesResumable.mockImplementation(() => makeTask())
            wrapper.vm.isDragOver = true

            wrapper.vm.upload(dropEvent(audioFile()))

            expect(wrapper.vm.isDragOver).toBe(false)
            expect(wrapper.vm.uploads).toHaveLength(1)
        })
    })

    describe('offline', () => {
        test('records a failed red row instead of contacting Storage', async () => {
            setOnline(false)

            wrapper.vm.upload(inputEvent(audioFile('offline.mp3')))

            expect(firebase.uploadBytesResumable).not.toHaveBeenCalled()
            expect(wrapper.vm.uploads).toHaveLength(1)
            expect(wrapper.vm.uploads[0]).toMatchObject({
                name: 'offline.mp3',
                currentProgress: 0,
                variant: 'bg-red-400',
                icon: 'fas fa-times',
                textClass: 'text-red-400',
            })

            await wrapper.vm.$nextTick()

            expect(wrapper.text()).toContain('offline.mp3')
            expect(wrapper.find('.text-red-400').exists()).toBe(true)
            expect(wrapper.find('.progress-bar').classes()).toContain('bg-red-400')
        })

        test('unmounting after an offline failure does not throw', () => {
            setOnline(false)
            wrapper.vm.upload(inputEvent(audioFile('offline.mp3')))

            expect(() => wrapper.unmount()).not.toThrow()
        })
    })

    describe('upload lifecycle', () => {
        let task

        beforeEach(() => {
            task = makeTask()
            firebase.uploadBytesResumable.mockReturnValue(task)
            wrapper.vm.upload(inputEvent(audioFile()))
        })

        test('starts a pending blue row and wires the state_changed listener', () => {
            expect(firebase.ref).toHaveBeenCalledWith(firebase.storage, 'songs/song.mp3')
            expect(task.handlers.event).toBe('state_changed')
            expect(wrapper.vm.uploads[0]).toMatchObject({
                task,
                currentProgress: 0,
                name: 'song.mp3',
                variant: 'bg-blue-400',
                icon: 'fas fa-spinner fa-spin',
            })
        })

        test('the progress callback widens the bar', async () => {
            task.handlers.onProgress({ bytesTransferred: 25, totalBytes: 100 })
            await wrapper.vm.$nextTick()

            expect(wrapper.vm.uploads[0].currentProgress).toBe(25)
            expect(wrapper.find('.progress-bar').attributes('style')).toContain('width: 25%')
        })

        test('the error callback switches the row to the red failed variant', async () => {
            task.handlers.onError(new Error('network down'))
            await wrapper.vm.$nextTick()

            expect(wrapper.vm.uploads[0]).toMatchObject({
                variant: 'bg-red-400',
                icon: 'fas fa-times',
                textClass: 'text-red-400',
            })
            expect(wrapper.find('.progress-bar').classes()).toContain('bg-red-400')
        })

        test('the completion callback stores the song and reports it to the parent', async () => {
            await task.handlers.onComplete()

            expect(firebase.getDownloadURL).toHaveBeenCalledWith(task.snapshot.ref)
            expect(firebase.addDoc).toHaveBeenCalledWith(
                'songs-collection',
                expect.objectContaining({
                    uid: 'uid-1',
                    display_name: 'Tester',
                    original_name: 'song.mp3',
                    modified_name: 'song.mp3',
                    url: 'https://example.test/song.mp3',
                    comment_count: 0,
                }),
            )
            expect(addSong).toHaveBeenCalledWith('doc-1', expect.objectContaining({ genre: '' }))
            expect(wrapper.vm.uploads[0]).toMatchObject({
                variant: 'bg-green-400',
                icon: 'fas fa-check',
                textClass: 'text-green-400',
            })
        })

        test('unmounting cancels in-flight upload tasks', () => {
            wrapper.unmount()

            expect(task.cancel).toHaveBeenCalledTimes(1)
        })
    })
})
