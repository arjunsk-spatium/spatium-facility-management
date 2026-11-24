import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import CompanyDetailsPage from '../../app/pages/companies/[id]/index.vue'
import { createTestingPinia } from '@pinia/testing'
import { useCompanyStore } from '../../stores/company'
import { message } from 'ant-design-vue'

describe('Company Details Page', () => {
    const mockCompany = {
        id: '1',
        name: 'Tech Corp',
        status: 'active',
        contacts: [{
            contact_name: 'John Smith',
            email: 'john.smith@techcorp.com',
            phone: '+91 98765 43210',
            address: '123 Tech Street, Bangalore',
            gstin: '29ABCDE1234F1ZH'
        }],
        facility: 'Facility 1'
    }

    it('should render company details', async () => {
        const wrapper = await mountSuspended(CompanyDetailsPage, {
            route: {
                params: { id: '1' }
            },
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        company: {
                            currentCompany: mockCompany,
                            loading: false
                        }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('Tech Corp')
        expect(wrapper.text()).toContain('123 Tech Street, Bangalore')
        // Check for edit link
        expect(wrapper.find('a[href="/companies/1/edit"]').exists()).toBe(true)
    })

    it('should fetch company and facilities on mount', async () => {
        const wrapper = await mountSuspended(CompanyDetailsPage, {
             route: {
                params: { id: '1' }
            },
            global: {
                plugins: [createTestingPinia({ createSpy: vi.fn })]
            }
        })
        const store = useCompanyStore()
        expect(store.fetchCompany).toHaveBeenCalledWith('1')
        expect(store.fetchCompanyFacilitiesAction).toHaveBeenCalledWith('1')
    })

    it('should render assigned facilities', async () => {
        const mockFacility = {
            id: 'map-1',
            company: '1',
            facility_id: 'fac-1',
            facility_name: 'HQ Campus',
            tower_name: 'Tower 1',
            floor_name: 'Floor 3'
        }
        const wrapper = await mountSuspended(CompanyDetailsPage, {
            route: {
                params: { id: '1' }
            },
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        company: {
                            currentCompany: mockCompany,
                            currentCompanyFacilities: [mockFacility],
                            loading: false
                        }
                    }
                })]
            }
        })
        expect(wrapper.text()).toContain('HQ Campus')
        expect(wrapper.text()).toContain('Tower 1')
        expect(wrapper.text()).toContain('Floor 3')
    })

    it('should configure Employee List table with pagination', async () => {
        const wrapper = await mountSuspended(CompanyDetailsPage, {
            route: {
                params: { id: '1' }
            },
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        company: {
                            currentCompany: mockCompany,
                            loading: false
                        }
                    }
                })]
            }
        })

        expect(wrapper.text()).toContain('Employee List')
        const tables = wrapper.findAllComponents({ name: 'ATable' })
        expect(tables.length).toBeGreaterThan(0)
    })

    it('should show the backend error message when QR code generation fails', async () => {
        const errorSpy = vi.spyOn(message, 'error').mockImplementation(() => ({}) as any)
        const wrapper = await mountSuspended(CompanyDetailsPage, {
            route: {
                params: { id: '1' }
            },
            global: {
                plugins: [createTestingPinia({ createSpy: vi.fn })]
            }
        })
        const store = useCompanyStore()
        vi.mocked(store.generateCompanyQRCode).mockRejectedValueOnce(
            Object.assign(new Error('HTTP 400'), { data: { message: 'Facility is not mapped to this company' } })
        )

        await (wrapper.vm as any).generateQR('fac-1', 'Tech Corp')

        expect(store.generateCompanyQRCode).toHaveBeenCalledWith('1', 'Tech Corp', 'fac-1')
        expect(errorSpy).toHaveBeenCalledWith('Facility is not mapped to this company')
        errorSpy.mockRestore()
    })

    it('should call the store QR action and show success when QR code generation succeeds', async () => {
        const successSpy = vi.spyOn(message, 'success').mockImplementation(() => ({}) as any)
        const wrapper = await mountSuspended(CompanyDetailsPage, {
            route: {
                params: { id: '1' }
            },
            global: {
                plugins: [createTestingPinia({ createSpy: vi.fn })]
            }
        })
        const store = useCompanyStore()

        await (wrapper.vm as any).generateQR('fac-1', 'Tech Corp')

        expect(store.generateCompanyQRCode).toHaveBeenCalledWith('1', 'Tech Corp', 'fac-1')
        expect(successSpy).toHaveBeenCalledWith('QR Code generated successfully')
        successSpy.mockRestore()
    })

    describe('Booking History', () => {
        const mountPage = () => mountSuspended(CompanyDetailsPage, {
            route: { params: { id: '1' } },
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: { company: { currentCompany: mockCompany, loading: false } }
                })]
            }
        })

        it('renders bookings with room, booker, credits, price and status', async () => {
            const wrapper = await mountPage()
            const vm = wrapper.vm as any
            vm.bookings = [
                { id: 'b1', booking_id: 'BK-001', booking_date: '2026-11-02', start_time: '10:00:00', end_time: '11:30:00', meeting_room_name: 'Silent Valley', user_name: 'Bhavya', credits_used: 5, amount_charged: '0.00', booking_status: 'CANCELLED' },
                { id: 'b2', booking_id: 'BK-002', booking_date: '2026-09-29', start_time: '14:00:00', end_time: '15:00:00', meeting_room_name: 'Periyar', user_name: 'Rajesh', credits_used: 0, amount_charged: '1500.00', booking_status: 'CONFIRMED' },
            ]
            vm.bookingTotal = 2
            await wrapper.vm.$nextTick()

            const card = wrapper.find('[data-testid="booking-history-card"]')
            expect(card.exists()).toBe(true)
            const text = card.text()
            expect(text).toContain('Booking History')
            expect(text).toContain('BK-001')
            expect(text).toContain('02/11/2026')
            expect(text).toContain('10:00 AM - 11:30 AM')
            expect(text).toContain('Silent Valley')
            expect(text).toContain('Bhavya')
            expect(text).toContain('₹1,500')
            expect(text).toContain('Cancelled')
            expect(text).toContain('Confirmed')
            expect(text).toContain('Total 2 bookings')
        })

        it('maps statuses and empty values', async () => {
            const wrapper = await mountPage()
            const vm = wrapper.vm as any
            expect(vm.getBookingStatusTag('INPROGRESS').label).toBe('In Progress')
            expect(vm.getBookingStatusTag('COMPLETED').color).toBe('blue')
            expect(vm.formatAmount(null)).toBe('-')
            expect(vm.formatBookingTime('00:30:00')).toBe('12:30 AM')
        })
    })
})
