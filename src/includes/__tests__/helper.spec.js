import helper from '@/includes/helper.js'

describe('helper.formatTime', () => {
    test('formats zero as 0:00', () => {
        expect(helper.formatTime(0)).toBe('0:00')
    })

    test('zero-pads seconds below ten', () => {
        expect(helper.formatTime(5)).toBe('0:05')
        expect(helper.formatTime(65)).toBe('1:05')
    })

    test('formats whole minutes and values past an hour', () => {
        expect(helper.formatTime(60)).toBe('1:00')
        expect(helper.formatTime(130)).toBe('2:10')
        expect(helper.formatTime(3725)).toBe('62:05')
    })

    test('rounds fractional seconds, as Howler reports them', () => {
        expect(helper.formatTime(12.4)).toBe('0:12')
        expect(helper.formatTime(12.6)).toBe('0:13')
    })

    test('degrades to 0:00 for NaN, undefined and null', () => {
        // Howl.seek()/duration() return NaN before the track has loaded.
        expect(helper.formatTime(NaN)).toBe('0:00')
        expect(helper.formatTime(undefined)).toBe('0:00')
        expect(helper.formatTime(null)).toBe('0:00')
    })
})

describe('helper randomisers', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    test('getRandomInt stays within [min, max)', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.999999)
        expect(helper.getRandomInt(1, 5)).toBe(4)

        vi.spyOn(Math, 'random').mockReturnValue(0)
        expect(helper.getRandomInt(1, 5)).toBe(1)
    })

    test('getRandomArray picks an element of the array', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.5)
        expect(helper.getRandomArray(['a', 'b', 'c', 'd'])).toBe('c')
    })
})
