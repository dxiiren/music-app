import { RouterLinkStub, shallowMount } from '@vue/test-utils'
import SongItem from '@/components/SongItem.vue'

describe('Router Link', () => {
    test('renders router link', () => {
        const song = {
            id: 1,
            display_name: 'Song Title',
        }

        const wrapper = shallowMount(SongItem, {
            propsData: { song },
            global: {
                components: {
                    'router-link': RouterLinkStub,
                },
            },
        })

        const routerLink = wrapper.findComponent(RouterLinkStub).props().to
        expect(routerLink).toEqual({ 
            name: 'song', 
            params: { id: song.id } 
        });
    })
})
