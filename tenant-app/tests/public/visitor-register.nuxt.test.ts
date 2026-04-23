import { describe, it, expect, vi } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import VisitorRegisterPage from "../../app/pages/public/visitor/register.vue";
import { createTestingPinia } from "@pinia/testing";

vi.mock("../../composables/publicVisitorService", () => ({
    usePublicVisitorService: () => ({
        requestOtp: vi.fn(),
        verifyOtp: vi.fn(),
        getMe: vi.fn(),
        getPurposesOfVisit: vi.fn(),
        getCompanies: vi.fn().mockResolvedValue([]),
        getCompanyUsers: vi.fn(),
        createWalkIn: vi.fn(),
        getFacility: vi.fn(),
        getFacilities: vi.fn().mockResolvedValue([]),
        getVisitorStatus: vi.fn(),
        getTenantConfig: vi.fn().mockResolvedValue({
            visitor_email_required: true,
            visitor_company_required: true,
        }),
    }),
}));

describe("Public Visitor Registration Page", () => {
    const mountOptions = {
        global: {
            plugins: [
                createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        visitor: { loading: false },
                        tenant: { tenant: { name: "Test Corp" } },
                    },
                }),
            ],
        },
    };

    it("should render registration page", async () => {
        const wrapper = await mountSuspended(VisitorRegisterPage, mountOptions);
        expect(wrapper.text()).toContain("No facilities available");
    });

    it("should have phone number input in step 1", async () => {
        const wrapper = await mountSuspended(VisitorRegisterPage, mountOptions);
        await wrapper.vm.$nextTick();
        (wrapper.vm as any).step = 1;
        await wrapper.vm.$nextTick();
        expect(wrapper.text()).toContain("Phone");
    });

    it("should show locked +91 country code in step 1", async () => {
        const wrapper = await mountSuspended(VisitorRegisterPage, mountOptions);
        await wrapper.vm.$nextTick();
        (wrapper.vm as any).step = 1;
        await wrapper.vm.$nextTick();
        expect(wrapper.text()).toContain("+91");
    });

    it("should have verification code option in step 1", async () => {
        const wrapper = await mountSuspended(VisitorRegisterPage, mountOptions);
        await wrapper.vm.$nextTick();
        (wrapper.vm as any).step = 1;
        await wrapper.vm.$nextTick();
        expect(wrapper.text()).toContain("Verification");
    });

    describe("OTP Verification", () => {
        it("should show resend option in step 2", async () => {
            const wrapper = await mountSuspended(
                VisitorRegisterPage,
                mountOptions,
            );

            await wrapper.vm.$nextTick();
            (wrapper.vm as any).step = 2;
            await wrapper.vm.$nextTick();

            expect(wrapper.text()).toContain("Didn't receive a code");
        });

        it("should show countdown timer when OTP is sent", async () => {
            const wrapper = await mountSuspended(
                VisitorRegisterPage,
                mountOptions,
            );

            await wrapper.vm.$nextTick();
            (wrapper.vm as any).step = 2;
            (wrapper.vm as any).resendCooldown = 30;
            await wrapper.vm.$nextTick();

            expect(wrapper.text()).toContain("Resend in");
        });

        it("should show Resend Code when cooldown is 0", async () => {
            const wrapper = await mountSuspended(
                VisitorRegisterPage,
                mountOptions,
            );

            await wrapper.vm.$nextTick();
            (wrapper.vm as any).step = 2;
            (wrapper.vm as any).resendCooldown = 0;
            await wrapper.vm.$nextTick();

            expect(wrapper.text()).toContain("Resend Code");
        });
    });

    describe("Form Step", () => {
        it("should show form fields in step 3", async () => {
            const wrapper = await mountSuspended(
                VisitorRegisterPage,
                mountOptions,
            );

            await wrapper.vm.$nextTick();
            (wrapper.vm as any).step = 3;
            await wrapper.vm.$nextTick();

            expect(wrapper.text()).toContain("Full Name");
            expect(wrapper.text()).toContain("Email");
            expect(wrapper.text()).toContain("Purpose of Visit");
            expect(wrapper.text()).toContain("Company to Visit");
            expect(wrapper.text()).toContain("Person to Meet");
        });

        it("should show submit button in step 3", async () => {
            const wrapper = await mountSuspended(
                VisitorRegisterPage,
                mountOptions,
            );

            await wrapper.vm.$nextTick();
            (wrapper.vm as any).step = 3;
            await wrapper.vm.$nextTick();

            expect(wrapper.text()).toContain("Submit Registration");
        });

        it("should hide email field when visitor_email_required is false", async () => {
            const wrapper = await mountSuspended(
                VisitorRegisterPage,
                mountOptions,
            );

            await wrapper.vm.$nextTick();
            (wrapper.vm as any).tenantConfig.visitor_email_required = false;
            (wrapper.vm as any).step = 3;
            await wrapper.vm.$nextTick();

            expect(wrapper.text()).toContain("Full Name");
            expect(wrapper.text()).not.toContain("Email Address");
            expect(wrapper.text()).toContain("Purpose of Visit");
        });

        it("should hide company field when visitor_company_required is false", async () => {
            const wrapper = await mountSuspended(
                VisitorRegisterPage,
                mountOptions,
            );

            await wrapper.vm.$nextTick();
            (wrapper.vm as any).tenantConfig.visitor_company_required = false;
            (wrapper.vm as any).step = 3;
            await wrapper.vm.$nextTick();

            expect(wrapper.text()).toContain("Full Name");
            expect(wrapper.text()).not.toContain("Your Company");
            expect(wrapper.text()).toContain("Purpose of Visit");
        });
    });
});
