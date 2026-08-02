import AboutView from '@/views/AboutView.vue'
import { shallowMount } from '@vue/test-utils'

describe('AboutView.vue', () => {
    test('renders the About heading', () => {
        const wrapper = shallowMount(AboutView)

        expect(wrapper.find('h1').text()).toBe('About')
    })

    test('renders the blurb paragraphs under the heading', () => {
        const wrapper = shallowMount(AboutView)

        const paragraphs = wrapper.findAll('p').map((p) => p.text())
        expect(paragraphs).toHaveLength(3)
        expect(paragraphs[0]).toContain('about page')
    })
})
