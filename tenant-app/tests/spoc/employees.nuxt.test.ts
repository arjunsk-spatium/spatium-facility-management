import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SpocEmployeesPage from '../../app/pages/spoc/employees/index.vue'
import { createTestingPinia } from '@pinia/testing'
import dayjs from 'dayjs'

describe('SPOC Employees Page', () => {
    const mockEmployees = [
        {
            id: '1',
            name: 'John Doe',
            email: 'john.doe@company.com',
            phone: '+91 98765 43210',
            department: 'Engineering',
            designation: 'Senior Developer',
            buildingPassEnabled: false
        },
        {
            id: '2',
            name: 'Jane Smith',
            email: 'jane.smith@company.com',
            phone: '+91 87654 32109',
            department: 'HR',
            designation: 'HR Manager',
            buildingPassEnabled: true
        },
        {
            id: '3',
            name: 'Bob Wilson',
            email: 'bob.wilson@company.com',
            phone: '+91 76543 21098',
            department: 'Sales',
            designation: 'Sales Executive',
            buildingPassEnabled: false
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

        it('should have formErrors reactive object and clearFieldError method', async () => {
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
            expect(vm.formErrors).toBeDefined()
            expect(typeof vm.clearFieldError).toBe('function')
            expect(typeof vm.openAddModal).toBe('function')
        })

        it('should set formErrors.email when addEmployee fails with email domain mismatch', async () => {
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
            const spocStore = useSpocStore()
            
            const validationError: any = new Error('Failed to create user.')
            validationError.data = {
                success: false,
                code: 'USER_CREATION_ERROR',
                message: 'Failed to create user.',
                error: {
                    type: 'VALIDATION_ERROR',
                    fields: {
                        email: [
                            {
                                code: 'INVALID',
                                message: 'Email domain must match the company domain (@gmail.com).'
                            }
                        ]
                    }
                }
            }
            vi.mocked(spocStore.addEmployee).mockRejectedValueOnce(validationError)

            vm.newEmployee.name = 'Test User'
            vm.newEmployee.email = 'test@wrong.com'
            vm.showAddModal = true

            await vm.handleSaveEmployee()

            expect(vm.formErrors.email).toBe('Email domain must match the company domain (@gmail.com).')
            expect(vm.showAddModal).toBe(true)

            // clearing field error
            vm.clearFieldError('email')
            expect(vm.formErrors.email).toBe('')
        })
    })

    describe('Building Pass Toggle', () => {
        it('should have handleBuildingPassToggle method', async () => {
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
            expect(typeof vm.handleBuildingPassToggle).toBe('function')
        })

        it('should initialize buildingPassLoading state', async () => {
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
            expect(vm.buildingPassLoading).toEqual({})
        })

        it('should include Building Pass column', async () => {
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
            const buildingPassColumn = vm.columns.find((c: any) => c.key === 'building_pass')
            expect(buildingPassColumn).toBeDefined()
            expect(buildingPassColumn.title).toBe('Building Pass')
        })

        it('should render Building Pass toggle for employees', async () => {
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
            
            // Ant Design Vue switch renders a button with role="switch"
            const switches = wrapper.findAll('[role="switch"]')
            expect(switches.length).toBeGreaterThan(0)
        })

        it('should have buildingPassEnabled in newEmployee form', async () => {
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
            expect(vm.newEmployee.buildingPassEnabled).toBe(false)
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

    describe('Gender, Date of Joining, and Date of Birth fields', () => {
        it('should initialize newEmployee with null gender, date_of_joining, and date_of_birth', async () => {
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
            expect(vm.newEmployee.gender).toBe(null)
            expect(vm.newEmployee.date_of_joining).toBe(null)
            expect(vm.newEmployee.date_of_birth).toBe(null)
        })

        it('should have gender, date_of_joining, and date_of_birth in newEmployee and formErrors', async () => {
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
            expect('gender' in vm.newEmployee).toBe(true)
            expect('date_of_joining' in vm.newEmployee).toBe(true)
            expect('date_of_birth' in vm.newEmployee).toBe(true)
            expect('gender' in vm.formErrors).toBe(true)
            expect('date_of_joining' in vm.formErrors).toBe(true)
            expect('date_of_birth' in vm.formErrors).toBe(true)
        })

        it('should reset gender, date_of_joining, and date_of_birth when openAddModal is called', async () => {
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
            vm.newEmployee.gender = 'male'
            vm.newEmployee.date_of_joining = '2025-01-15'
            vm.newEmployee.date_of_birth = '1995-05-20'

            vm.openAddModal()

            expect(vm.newEmployee.gender).toBe(null)
            expect(vm.newEmployee.date_of_joining).toBe(null)
            expect(vm.newEmployee.date_of_birth).toBe(null)
        })

        it('should populate gender, date_of_joining, and date_of_birth in handleEdit', async () => {
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
            vm.handleEdit({
                id: '123',
                name: 'Alice',
                email: 'alice@company.com',
                gender: 'female',
                date_of_joining: '2024-06-01',
                date_of_birth: '1998-10-12'
            })

            expect(vm.newEmployee.gender).toBe('female')
            expect(vm.newEmployee.date_of_joining).toBe('2024-06-01')
            expect(vm.newEmployee.date_of_birth).toBe('1998-10-12')
        })

        it('should pass gender, date_of_joining, and date_of_birth when saving a new employee', async () => {
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
            const spocStore = useSpocStore()
            vi.mocked(spocStore.addEmployee).mockResolvedValueOnce({} as any)

            vm.newEmployee.name = 'Bob Ross'
            vm.newEmployee.email = 'bob@company.com'
            vm.newEmployee.gender = 'male'
            vm.newEmployee.date_of_joining = '2024-01-01'
            vm.newEmployee.date_of_birth = '1990-01-01'

            await vm.handleSaveEmployee()

            expect(spocStore.addEmployee).toHaveBeenCalledWith(expect.objectContaining({
                name: 'Bob Ross',
                email: 'bob@company.com',
                gender: 'male',
                date_of_joining: '2024-01-01',
                date_of_birth: '1990-01-01'
            }))
        })

        it('should disable birth dates less than 18 years ago in disabledBirthDate', async () => {
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
            const today = dayjs()
            const seventeenYearsAgo = today.subtract(17, 'year')
            const eighteenYearsAgo = today.subtract(18, 'year')
            const twentyYearsAgo = today.subtract(20, 'year')
            const futureDate = today.add(1, 'day')

            expect(vm.disabledBirthDate(futureDate)).toBe(true)
            expect(vm.disabledBirthDate(seventeenYearsAgo)).toBe(true)
            expect(vm.disabledBirthDate(eighteenYearsAgo)).toBe(false)
            expect(vm.disabledBirthDate(twentyYearsAgo)).toBe(false)
        })

        it('should reject employee creation if date_of_birth is less than 18 years old', async () => {
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
            const spocStore = useSpocStore()

            vm.newEmployee.name = 'Young Employee'
            vm.newEmployee.email = 'young@company.com'
            // Born 10 years ago
            vm.newEmployee.date_of_birth = dayjs().subtract(10, 'year').format('YYYY-MM-DD')

            await vm.handleSaveEmployee()

            expect(vm.formErrors.date_of_birth).toBe('Employee must be at least 18 years old')
            expect(spocStore.addEmployee).not.toHaveBeenCalled()
        })

        it('should have defaultBirthDatePickerValue set to 18 years ago (allowed year)', async () => {
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
            expect(vm.defaultBirthDatePickerValue).toBeDefined()
            const expectedYear = dayjs().subtract(18, 'year').year()
            expect(dayjs(vm.defaultBirthDatePickerValue).year()).toBe(expectedYear)
        })
    })
})
