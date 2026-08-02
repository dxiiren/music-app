import HomeView from '@/views/HomeView.vue';
import SongItem from '@/components/SongItem.vue';
import { shallowMount } from '@vue/test-utils';
import { vi } from 'vitest';

// Stub the firebase bundle so importing HomeView never touches the real SDK
// (with no VITE_FIREBASE_* env the real module has no initialized services).
vi.mock('@/includes/firebase', () => ({
    default: {
        isConfigured: false,
        db: {},
        collection: vi.fn(),
        query: vi.fn(),
        orderBy: vi.fn(),
        limit: vi.fn(),
        startAfter: vi.fn(),
        getDocs: vi.fn().mockResolvedValue({
            forEach: () => {},
            docs: [],
            size: 0,
            empty: true,
        }),
    },
}));

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