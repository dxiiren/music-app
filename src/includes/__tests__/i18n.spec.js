import i18n from '@/includes/i18n'
import en from '@/locales/en.json'
import ms from '@/locales/ms.json'

// Flattens a message bundle into sorted dotted key paths so the two locale
// files can be compared as sets ("home.listen", "song.comment_count", ...).
const keyPaths = (messages, prefix = '') =>
    Object.entries(messages)
        .flatMap(([key, value]) => {
            const path = prefix ? `${prefix}.${key}` : key
            return value !== null && typeof value === 'object' ? keyPaths(value, path) : [path]
        })
        .sort()

const readLocale = () =>
    typeof i18n.global.locale === 'string' ? i18n.global.locale : i18n.global.locale.value

const writeLocale = (value) => {
    if (typeof i18n.global.locale === 'string') {
        i18n.global.locale = value
    } else {
        i18n.global.locale.value = value
    }
}

describe('locale files', () => {
    test('en and ms expose exactly the same key paths', () => {
        expect(keyPaths(ms)).toStrictEqual(keyPaths(en))
    })

    test('every message is a non-empty string in both locales', () => {
        const flatten = (messages, prefix = '') =>
            Object.entries(messages).flatMap(([key, value]) => {
                const path = prefix ? `${prefix}.${key}` : key
                return value !== null && typeof value === 'object'
                    ? flatten(value, path)
                    : [[path, value]]
            })

        for (const [bundleName, bundle] of [
            ['en', en],
            ['ms', ms],
        ]) {
            for (const [path, value] of flatten(bundle)) {
                expect(typeof value, `${bundleName}.${path}`).toBe('string')
                expect(value.trim(), `${bundleName}.${path}`).not.toBe('')
            }
        }
    })

    test('ms actually translates — it is not a copy of en', () => {
        expect(ms.home.listen).not.toBe(en.home.listen)
        expect(ms.login).not.toBe(en.login)
    })
})

describe('i18n instance', () => {
    afterEach(() => {
        writeLocale('ms')
    })

    test('boots in ms', () => {
        expect(readLocale()).toBe('ms')
        expect(i18n.global.t('welcome')).toBe(ms.welcome)
    })

    test('serves en messages once the locale is switched', () => {
        writeLocale('en')
        expect(i18n.global.t('welcome')).toBe(en.welcome)
        expect(i18n.global.t('home.listen')).toBe(en.home.listen)
    })

    test('falls back to en for a locale with no messages', () => {
        writeLocale('de')
        expect(i18n.global.t('welcome')).toBe(en.welcome)
    })

    test('carries a USD currency format for en and MYR for ms', () => {
        expect(i18n.global.getNumberFormat('en').currency).toMatchObject({
            style: 'currency',
            currency: 'USD',
        })
        expect(i18n.global.getNumberFormat('ms').currency).toMatchObject({
            style: 'currency',
            currency: 'MYR',
        })
    })
})
