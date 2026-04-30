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

    describe('CRUD Operations', () => {
        it('should have edit buttons for employees', async () => {
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
            
            // Edit buttons should be present
            const vm = wrapper.vm as any
            expect(typeof vm.handleEdit).toBe('function')
        })

        it('should have editingEmployee state', async () => {
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
            
            const vm = wrapper.vm as any
            expect(vm.editingEmployee).toBe(null)
        })

        it('should have handleSaveEmployee method', async () => {
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
            
            const vm = wrapper.vm as any
            expect(typeof vm.handleSaveEmployee).toBe('function')
        })
    })

    describe('Bulk Upload', () => {
        it('should have "Bulk Upload" button', async () => {
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

            expect(wrapper.html()).toContain('Bulk')
            expect(wrapper.html()).toContain('Upload')
        })

        it('should have bulk upload modal state', async () => {
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

            const vm = wrapper.vm as any
            // Modal should be closed by default
            expect(vm.showBulkUploadModal).toBe(false)
        })

        it('should have handleBeforeUpload method for CSV validation', async () => {
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

            const vm = wrapper.vm as any
            expect(typeof vm.handleBeforeUpload).toBe('function')
        })

        it('should have handleBulkUpload method', async () => {
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

            const vm = wrapper.vm as any
            expect(typeof vm.handleBulkUpload).toBe('function')
        })

        it('should have resetBulkUpload method', async () => {
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

            const vm = wrapper.vm as any
            expect(typeof vm.resetBulkUpload).toBe('function')
        })

        it('should have downloadSampleCsv method', async () => {
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

            const vm = wrapper.vm as any
            expect(typeof vm.downloadSampleCsv).toBe('function')
        })

        it('should initialize bulk upload state correctly', async () => {
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

            const vm = wrapper.vm as any
            expect(vm.bulkUploadFileList).toEqual([])
            expect(vm.bulkUploadFile).toBe(null)
            expect(vm.bulkUploading).toBe(false)
            expect(vm.bulkUploadError).toBe('')
        })

        it('should have error columns for error report table', async () => {
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

            const vm = wrapper.vm as any
            expect(vm.errorColumns).toEqual([
                { title: 'Row', key: 'row_number', dataIndex: 'row_number', width: 60 },
                { title: 'Field', key: 'field', dataIndex: 'field', width: 140 },
                { title: 'Error', key: 'error', dataIndex: 'error' }
            ])
        })
    })

    describe('Upload History', () => {
        it('should have "Upload History" button', async () => {
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

            expect(wrapper.html()).toContain('Upload History')
        })

        it('should initialize jobs drawer state correctly', async () => {
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

            const vm = wrapper.vm as any
            expect(vm.showJobsDrawer).toBe(false)
            expect(vm.jobs).toEqual([])
            expect(vm.jobsCount).toBe(0)
            expect(vm.jobsPage).toBe(1)
            expect(vm.jobsLoading).toBe(false)
        })

        it('should have openJobsDrawer method', async () => {
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

            const vm = wrapper.vm as any
            expect(typeof vm.openJobsDrawer).toBe('function')
        })

        it('should have loadJobs method', async () => {
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

            const vm = wrapper.vm as any
            expect(typeof vm.loadJobs).toBe('function')
        })

        it('should have getJobStatusColor method with correct mappings', async () => {
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

            const vm = wrapper.vm as any
            expect(vm.getJobStatusColor('pending')).toBe('processing')
            expect(vm.getJobStatusColor('processing')).toBe('processing')
            expect(vm.getJobStatusColor('completed')).toBe('success')
            expect(vm.getJobStatusColor('failed')).toBe('error')
            expect(vm.getJobStatusColor('unknown')).toBe('default')
        })

        it('should have date formatting methods', async () => {
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

            const vm = wrapper.vm as any
            expect(typeof vm.formatJobDate).toBe('function')
            expect(typeof vm.formatJobDateTime).toBe('function')
            expect(vm.formatJobDate(null)).toBe('-')
            expect(vm.formatJobDateTime(null)).toBe('-')
        })
    })
})
