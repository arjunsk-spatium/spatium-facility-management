import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import FeedForm from '../../app/components/feed/FeedForm.vue'

vi.mock('../../composables/feedService', () => ({
    useFeedService: () => ({
        getCategories: vi.fn().mockResolvedValue([
            { id: 'cat-1', name: 'General', slug: 'general', description: '', is_active: true },
            { id: 'cat-2', name: 'Event', slug: 'event', description: '', is_active: true }
        ])
    })
}))

const mockAllCompanyStore = {
    companies: [
        { id: 'comp-1', name: 'Acme Corp' },
        { id: 'comp-2', name: 'Beta LLC' }
    ],
    loading: false,
    fetchAllCompanies: vi.fn().mockResolvedValue(undefined)
}

const mockAllFacilityStore = {
    facilities: [
        { id: 'fac-1', name: 'Tower A' },
        { id: 'fac-2', name: 'Tower B' }
    ],
    loading: false,
    fetchAllFacilities: vi.fn().mockResolvedValue(undefined)
}

vi.mock('../../stores/allCompany', () => ({
    useAllCompanyStore: () => mockAllCompanyStore
}))

vi.mock('../../stores/allFacility', () => ({
    useAllFacilityStore: () => mockAllFacilityStore
}))

describe('FeedForm.vue', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders default scope_type as all', () => {
        const wrapper = mount(FeedForm, {
            global: {
                stubs: {
                    'a-form': { template: '<form @submit.prevent="$emit(\'finish\')"><slot /></form>' },
                    'a-form-item': { template: '<div><slot /></div>' },
                    'a-input': { template: '<input />' },
                    'a-textarea': { template: '<textarea />' },
                    'a-radio-group': { template: '<div><slot /></div>', props: ['value'] },
                    'a-radio': { template: '<label><slot /></label>', props: ['value'] },
                    'a-select': { template: '<select><slot /></select>' },
                    'a-select-option': { template: '<option><slot /></option>' },
                    'a-switch': { template: '<input type="checkbox" />' },
                    'a-date-picker': true,
                    'a-time-picker': true,
                    'a-button': { template: '<button><slot /></button>' }
                }
            }
        })

        expect(wrapper.exists()).toBe(true)
        // Verify audience radio group is present
        expect(wrapper.text()).toContain('Target Audience')
        expect(wrapper.text()).toContain('All (Everyone)')
    })

    it('emits submit with scope_type all when no specific companies/facilities selected', async () => {
        const wrapper = mount(FeedForm, {
            global: {
                stubs: {
                    'a-form': { template: '<form @submit.prevent><slot /></form>' },
                    'a-form-item': { template: '<div><slot /></div>' },
                    'a-input': { template: '<input />' },
                    'a-textarea': { template: '<textarea />' },
                    'a-radio-group': true,
                    'a-radio': true,
                    'a-select': true,
                    'a-select-option': true,
                    'a-switch': true,
                    'a-date-picker': true,
                    'a-time-picker': true,
                    'a-button': { template: '<button><slot /></button>' }
                }
            }
        })

        // Trigger submit
        const vm = wrapper.vm as any
        vm.formState.title = 'Announcement Title'
        vm.formState.description = 'Announcement Description'
        vm.formState.category_id = 'cat-1'
        vm.handleSubmit()

        expect(wrapper.emitted('submit')).toBeTruthy()
        const payload = wrapper.emitted('submit')![0][0]
        expect(payload.scope_type).toBe('all')
        expect(payload.company_ids).toBeUndefined()
        expect(payload.facility_ids).toBeUndefined()
    })

    it('emits submit with scope_type companies when companies selected', async () => {
        const wrapper = mount(FeedForm, {
            global: {
                stubs: {
                    'a-form': { template: '<form><slot /></form>' },
                    'a-form-item': true,
                    'a-input': true,
                    'a-textarea': true,
                    'a-radio-group': true,
                    'a-radio': true,
                    'a-select': true,
                    'a-select-option': true,
                    'a-switch': true,
                    'a-date-picker': true,
                    'a-time-picker': true,
                    'a-button': true
                }
            }
        })

        const vm = wrapper.vm as any
        vm.formState.title = 'Company Post'
        vm.formState.description = 'Details'
        vm.formState.category_id = 'cat-1'
        vm.formState.scope_type = 'companies'
        vm.formState.company_ids = ['comp-1', 'comp-2']
        vm.handleSubmit()

        expect(wrapper.emitted('submit')).toBeTruthy()
        const payload = wrapper.emitted('submit')![0][0]
        expect(payload.scope_type).toBe('companies')
        expect(payload.company_ids).toEqual(['comp-1', 'comp-2'])
        expect(payload.facility_ids).toBeUndefined()
    })

    it('emits submit with scope_type facilities when facilities selected', async () => {
        const wrapper = mount(FeedForm, {
            global: {
                stubs: {
                    'a-form': { template: '<form><slot /></form>' },
                    'a-form-item': true,
                    'a-input': true,
                    'a-textarea': true,
                    'a-radio-group': true,
                    'a-radio': true,
                    'a-select': true,
                    'a-select-option': true,
                    'a-switch': true,
                    'a-date-picker': true,
                    'a-time-picker': true,
                    'a-button': true
                }
            }
        })

        const vm = wrapper.vm as any
        vm.formState.title = 'Facility Post'
        vm.formState.description = 'Details'
        vm.formState.category_id = 'cat-1'
        vm.formState.scope_type = 'facilities'
        vm.formState.facility_ids = ['fac-1']
        vm.handleSubmit()

        expect(wrapper.emitted('submit')).toBeTruthy()
        const payload = wrapper.emitted('submit')![0][0]
        expect(payload.scope_type).toBe('facilities')
        expect(payload.facility_ids).toEqual(['fac-1'])
        expect(payload.company_ids).toBeUndefined()
    })
})
