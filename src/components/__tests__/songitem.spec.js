import SongItem from "../SongItem.vue";
import { shallowMount, RouterLinkStub } from "@vue/test-utils";

describe("SongItem.vue", () => {
    test("renders song.display_name", () => {

        const song = {
            display_name: "Song Title",
        };

        const wrapper = shallowMount(SongItem, {
            propsData: { song },
            global: {
                components: {
                    'router-link': RouterLinkStub,
                },
            },
        });

        //general
        expect(wrapper.text()).toContain(song.display_name);

        //specific
        const compositionAuthor = wrapper.find('.text-gray-500')
        expect(compositionAuthor.text()).toBe(song.display_name);
    });

    test("renders song.id in id attribute", () => {

        const song = {
            id: 1,
        };

        const wrapper = shallowMount(SongItem, {
            propsData: { song },
            global: {
                components: {
                    'router-link': RouterLinkStub,
                },
            },
        });

        //general
        expect(wrapper.attributes('id')).toBe(`song-id-${song.id}`);
        expect(wrapper.attributes().id).toBe(`song-id-${song.id}`);
        expect(wrapper.classes()).toContain('cursor-pointer');

    });
});