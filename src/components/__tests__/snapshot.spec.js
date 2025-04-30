import { RouterLinkStub, shallowMount } from '@vue/test-utils'
import SongItem from '@/components/SongItem.vue'

describe('Snapshots SongIgem.vue', () => {
    test('renders correctly', () => {
        const song = {
            id: 1,
            display_name: 'Song Title',
            modified_name: 'Modified Song Title',
            comment_count: 5,
        }

        const wrapper = shallowMount(SongItem, {
            propsData: { song },
            global: {
                components: {
                    'router-link': RouterLinkStub,
                },
            },
        })

        expect(wrapper.element).toMatchSnapshot()
    })
})
