import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SpocEmployeesPage from '../../app/pages/spoc/employees/index.vue'
import { createTestingPinia } from '@pinia/testing'

describe('SPOC Employees Page', () => {
    const mockEmployees = [
        {
            id: '1',
            name: 'John Doe',
            email: 'john.doe@company.com',
            phone: '+91 98765 43210',
            department: 'Engineering',
            designation: 'Senior Developer'
        },
        {
            id: '2',
            name: 'Jane Smith',
            email: 'jane.smith@company.com',
            phone: '+91 87654 32109',
            department: 'HR',
            designation: 'HR Manager'
        },
        {
            id: '3',
            name: 'Bob Wilson',
            email: 'bob.wilson@company.com',
            phone: '+91 76543 21098',
            department: 'Sales',
            designation: 'Sales Executive'
        }
    ]

    it('should render employees page with header', async () => {
        const wrapper = await mountSuspended(SpocEmployeesPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        spoc: { employees: mockEmployees, loading: false }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('Employees')
        expect(wrapper.text()).toContain("Manage your company's employees")
    })

    it('should display employees in the list', async () => {
        const wrapper = await mountSuspended(SpocEmployeesPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        spoc: { employees: mockEmployees, loading: false }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('John Doe')
        expect(wrapper.text()).toContain('Jane Smith')
        expect(wrapper.text()).toContain('Bob Wilson')
    })

    it('should display employee departments', async () => {
        const wrapper = await mountSuspended(SpocEmployeesPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        spoc: { employees: mockEmployees, loading: false }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('Engineering')
        expect(wrapper.text()).toContain('HR')
        expect(wrapper.text()).toContain('Sales')
    })

    it('should display employee emails', async () => {
        const wrapper = await mountSuspended(SpocEmployeesPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        spoc: { employees: mockEmployees, loading: false }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('john.doe@company.com')
        expect(wrapper.text()).toContain('jane.smith@company.com')
    })

    it('should have "Add Employee" button', async () => {
        const wrapper = await mountSuspended(SpocEmployeesPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        spoc: { employees: [], loading: false }
                    }
                })]
            }
        })
        
        // Button shows "Add" text (Employee is hidden on mobile via <hide> element)
        expect(wrapper.html()).toContain('Add')
        expect(wrapper.html()).toContain('Employee')
    })

    it('should have search input for filtering employees', async () => {
        const wrapper = await mountSuspended(SpocEmployeesPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        spoc: { employees: [], loading: false }
                    }
                })]
            }
        })
        
        expect(wrapper.html()).toContain('Search employees')
    })

    it('should display designation for employees', async () => {
        const wrapper = await mountSuspended(SpocEmployeesPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        spoc: { employees: mockEmployees, loading: false }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('Senior Developer')
        expect(wrapper.text()).toContain('HR Manager')
        expect(wrapper.text()).toContain('Sales Executive')
    })

    it('should have delete buttons for employees', async () => {
        const wrapper = await mountSuspended(SpocEmployeesPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        spoc: { employees: mockEmployees, loading: false }
                    }
                })]
            }
        })
        
        // Check that delete buttons are present (one for each employee)
        const deleteButtons = wrapper.findAll('button').filter(btn => 
            btn.classes().includes('ant-btn-dangerous') || btn.classes().some(c => c.includes('danger'))
        )
        expect(deleteButtons.length).toBeGreaterThan(0)
    })
})
