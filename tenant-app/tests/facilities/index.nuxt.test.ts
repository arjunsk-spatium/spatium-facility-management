import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import FacilitiesPage from '../../app/pages/facilities/index.vue'
import { createTestingPinia } from '@pinia/testing'

describe('Facilities List Page', () => {
    // Mock with all required properties to avoid render errors
    const mockFacilities = [
        { 
            id: '1', 
            name: 'HQ Building', 
            address: '123 Main St', 
            status: 'Active', 
            location: { city: 'New York', state: 'NY' },
            towers: [{ id: 't1', name: 'Tower A', floors: [{ id: 'f1' }, { id: 'f2' }] }],
            staff: [{ id: 's1', name: 'John' }]
        },
        { 
            id: '2', 
            name: 'Tech Park', 
            address: '456 Tech Ave', 
            status: 'Active', 
            location: { city: 'San Francisco', state: 'CA' },
            towers: [{ id: 't2', name: 'Tower B', floors: [{ id: 'f3' }] }],
            staff: [{ id: 's2', name: 'Jane' }, { id: 's3', name: 'Bob' }]
        }
    ]

    it('should render facilities page with header', async () => {
        const wrapper = await mountSuspended(FacilitiesPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        facility: { facilities: mockFacilities, loading: false }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('Facilities')
    }, 15000)

    it('should display facilities list', async () => {
        const wrapper = await mountSuspended(FacilitiesPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        facility: { facilities: mockFacilities, loading: false }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('HQ Building')
        expect(wrapper.text()).toContain('Tech Park')
    }, 15000)

    it('should have "Add Facility" button', async () => {
        const wrapper = await mountSuspended(FacilitiesPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        facility: { facilities: [], loading: false }
                    }
                })]
            }
        })
        
        expect(wrapper.html()).toContain('Add')
    }, 15000)
})
