import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import ImagePreviewModal from "./ImagePreviewModal.vue";

describe("ImagePreviewModal.vue", () => {
    it("renders image with correct src and alt", () => {
        const wrapper = mount(ImagePreviewModal, {
            props: {
                open: true,
                src: "https://example.com/image.png",
                alt: "Test Image",
            },
            global: {
                stubs: {
                    "a-modal": {
                        template: '<div class="a-modal"><slot></slot></div>',
                        props: ["open"],
                        emits: ["cancel", "update:open"],
                    },
                },
            },
        });

        const img = wrapper.find("img");
        expect(img.exists()).toBe(true);
        expect(img.attributes("src")).toBe("https://example.com/image.png");
        expect(img.attributes("alt")).toBe("Test Image");
    });

    it("emits update:open when modal is closed", async () => {
        const wrapper = mount(ImagePreviewModal, {
            props: {
                open: true,
                src: "https://example.com/image.png",
            },
            global: {
                stubs: {
                    "a-modal": {
                        template: '<div class="a-modal" @click="$emit(\'cancel\')"><slot></slot></div>',
                        props: ["open"],
                    },
                },
            },
        });

        // Simulate cancel event on a-modal
        await wrapper.find(".a-modal").trigger("click");
        expect(wrapper.emitted()["update:open"]).toBeTruthy();
        expect(wrapper.emitted()["update:open"][0]).toEqual([false]);
    });
});
