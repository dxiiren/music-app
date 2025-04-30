import HomeView from '@/views/HomeView.vue';
import SongItem from '@/components/SongItem.vue';
import { shallowMount } from '@vue/test-utils';

describe('HomeView.vue', () => {
    test('renders list of song',() => {

        const songs = [
            {},{},{}
        ]

        const component = shallowMount(HomeView,{
            data() {
                return {
                    songs
                };
            },
            global: {
                mocks:{
                    $t: (msg) => msg,
                }
            }
        });

        const items = component.findAllComponents(SongItem);
        expect(items).toHaveLength(songs.length);

        items.forEach((wrapper, idx) => {
            expect(wrapper.props().song).toStrictEqual(songs[idx]);
        });

    });
});