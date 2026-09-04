import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSpocStore } from '../../stores/spoc'

describe('SPOC Store', () => {
    let originalFetch: typeof global.fetch;
    const mockFetch = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        setActivePinia(createPinia());
        originalFetch = global.fetch;
        global.fetch = mockFetch;
        
        if (typeof window !== "undefined") {
            localStorage.setItem("access_token", "fake-token");
        }
    })

    afterEach(() => {
        global.fetch = originalFetch;
    });

    describe('Initial State', () => {
        it('should have empty visitors array initially', () => {
            const store = useSpocStore()
            expect(store.visitors).toEqual([])
        })

        it('should have empty employees array initially', () => {
            const store = useSpocStore()
            expect(store.employees).toEqual([])
        })

        it('should have null stats initially', () => {
            const store = useSpocStore()
            expect(store.stats).toBeNull()
        })

        it('should have loading false initially', () => {
            const store = useSpocStore()
            expect(store.loading).toBe(false)
        })

        it('should have null error initially', () => {
            const store = useSpocStore()
            expect(store.error).toBeNull()
        })
    })

    describe('fetchStats', () => {
        it('should fetch and populate stats from client dashboard API', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                json: async () => ({
                    success: true,
                    data: {
                        total_visitors: 10,
                        pending_approvals: 2,
                        checked_in_today: 5,
                        total_employees: 20
                    }
                })
            });
            const store = useSpocStore()
            await store.fetchStats()
            
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/portal/visitors/client/dashboard/'),
                expect.anything()
            )
            expect(store.stats).not.toBeNull()
            expect(store.stats?.totalVisitors).toBe(10)
            expect(store.stats?.pendingApprovals).toBe(2)
            expect(store.stats?.checkedInToday).toBe(5)
            expect(store.stats?.totalEmployees).toBe(20)
        })

        it('should parse nested stats and recent_visitors from dashboard response', async () => {
            const dashboardPayload = {
                success: true,
                code: 'DASHBOARD_RETRIEVED',
                message: 'Dashboard data retrieved successfully.',
                data: {
                    stats: {
                        total_visitors: 99,
                        pending: 27,
                        checked_in: 23,
                        employees: 8
                    },
                    recent_visitors: [
                        {
                            id: '2d5b9111-a696-4181-bdf7-625da2622d06',
                            name: 'Hariharan',
                            purpose: 'Meeting',
                            host: 'Hari',
                            status: 'Approved',
                            created_at: '2026-09-03T05:44:03.497722+00:00'
                        },
                        {
                            id: '7e58d760-3b05-4e5e-b217-2a1ea8538340',
                            name: 'Gowtham',
                            purpose: 'Meeting',
                            host: 'Ashwini',
                            status: 'Pending',
                            created_at: '2026-09-02T09:36:23.201567+00:00'
                        }
                    ]
                }
            }

            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                json: async () => dashboardPayload
            });
            const store = useSpocStore()
            await store.fetchStats()

            expect(store.stats?.totalVisitors).toBe(99)
            expect(store.stats?.pendingApprovals).toBe(27)
            expect(store.stats?.checkedInToday).toBe(23)
            expect(store.stats?.totalEmployees).toBe(8)
            expect(store.recentVisitors.length).toBe(2)
            expect(store.recentVisitors[0].name).toBe('Hariharan')
            expect(store.recentVisitors[0].host).toBe('Hari')
            expect(store.recentVisitors[0].status).toBe('Approved')
        })

        it('should set loading to false after fetch', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                json: async () => ({ success: true, data: {} })
            });
            const store = useSpocStore()
            await store.fetchStats()
            
            expect(store.loading).toBe(false)
        })
    })

    describe('fetchInsights', () => {
        it('should fetch insights with start_date and end_date filters', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                json: async () => ({
                    success: true,
                    data: {
                        summary: {
                            total_visitors: 45,
                            checked_in: 30,
                            checked_out: 25,
                            pending: 5,
                            expected: 10
                        },
                        traffic: [
                            { date: '2025-01-01', count: 12 }
                        ],
                        visit_purposes: [
                            { purpose: 'Meeting', count: 20, percentage: 50 }
                        ]
                    }
                })
            });
            const store = useSpocStore()
            const result = await store.fetchInsights('2025-01-01', '2025-12-31')

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringMatching(/\/api\/portal\/visitors\/client\/insights\/\?.*start_date=2025-01-01.*end_date=2025-12-31/),
                expect.anything()
            )
            expect(result?.summary.total_visitors).toBe(45)
            expect(store.insights?.summary.total_visitors).toBe(45)
            expect(store.insightsLoading).toBe(false)
        })

        it('should correctly parse backend response with stats and visit_purpose_breakdown', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                json: async () => ({
                    success: true,
                    code: 'INSIGHTS_RETRIEVED',
                    message: 'Visitor insights retrieved successfully.',
                    data: {
                        filters: {
                            start_date: '2025-01-01',
                            end_date: '2026-12-31'
                        },
                        stats: {
                            total_visitors: 99,
                            completed_visits: 23,
                            walk_in: 75,
                            pre_invite: 24,
                            this_month: 4
                        },
                        visit_purpose_breakdown: [
                            { purpose: 'Meeting', count: 83 },
                            { purpose: 'Interview', count: 16 }
                        ]
                    }
                })
            });
            const store = useSpocStore()
            const result = await store.fetchInsights('2025-01-01', '2026-12-31')

            expect(result?.stats.total_visitors).toBe(99)
            expect(result?.stats.completed_visits).toBe(23)
            expect(result?.stats.walk_in).toBe(75)
            expect(result?.stats.pre_invite).toBe(24)
            expect(result?.stats.this_month).toBe(4)
            expect(result?.visit_purpose_breakdown).toHaveLength(2)
            expect(result?.visit_purpose_breakdown[0].purpose).toBe('Meeting')
            expect(result?.visit_purpose_breakdown[0].count).toBe(83)
            expect(result?.visit_purpose_breakdown[0].percentage).toBe(84) // 83 / 99 = 84%
            expect(result?.visit_purpose_breakdown[1].purpose).toBe('Interview')
            expect(result?.visit_purpose_breakdown[1].count).toBe(16)
            expect(result?.visit_purpose_breakdown[1].percentage).toBe(16) // 16 / 99 = 16%
        })

        it('should handle error when fetchInsights fails', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 500,
                json: async () => ({ success: false, message: 'Server error' })
            });
            const store = useSpocStore()
            await expect(store.fetchInsights('2025-01-01', '2025-12-31')).rejects.toThrow()
            expect(store.insightsError).toBeDefined()
            expect(store.insightsLoading).toBe(false)
        })
    })

    describe('fetchVisitors', () => {
        it('should fetch and populate visitors', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                json: async () => ({
                    success: true,
                    data: {
                        results: [{
                            id: '1',
                            name: 'Test Visitor',
                            phone_number: '+91 12345 67890',
                            created_at: '2024-01-01T10:00:00Z',
                            purpose_of_visit: 'Meeting',
                            status: 'Pending'
                        }]
                    }
                })
            });
            const store = useSpocStore()
            await store.fetchVisitors()
            
            expect(store.visitors.length).toBeGreaterThan(0)
        })

        it('should have required visitor properties', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                json: async () => ({
                    success: true,
                    data: {
                        results: [{
                            id: '1',
                            name: 'Test Visitor',
                            phone_number: '+91 12345 67890',
                            created_at: '2024-01-01T10:00:00Z',
                            purpose_of_visit: 'Meeting',
                            status: 'Pending'
                        }]
                    }
                })
            });
            const store = useSpocStore()
            await store.fetchVisitors()
            
            const visitor = store.visitors[0]
            expect(visitor.id).toBeDefined()
            expect(visitor.name).toBeDefined()
            expect(visitor.phone_number).toBeDefined()
            expect(visitor.created_at).toBeDefined()
            expect(visitor.purpose_of_visit).toBeDefined()
            expect(visitor.status).toBeDefined()
        })
    })

    describe('fetchEmployees', () => {
        it('should fetch and populate employees', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                json: async () => ({
                    success: true,
                    data: {
                        results: [{ id: '1', full_name: 'Test User', email: 'test@example.com' }]
                    }
                })
            });
            const store = useSpocStore()
            await store.fetchEmployees()
            
            expect(store.employees.length).toBeGreaterThan(0)
        })

        it('should have required employee properties', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                json: async () => ({
                    success: true,
                    data: {
                        results: [{ id: '1', full_name: 'Test User', email: 'test@example.com' }]
                    }
                })
            });
            const store = useSpocStore()
            await store.fetchEmployees()
            
            const employee = store.employees[0]
            expect(employee.id).toBeDefined()
            expect(employee.name).toBeDefined()
            expect(employee.email).toBeDefined()
        })
    })

    describe('inviteVisitor', () => {
        it('should add a new visitor to the list', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                json: async () => ({
                    success: true,
                    data: {
                        id: 'new-v', passcode: '123456', status: 'Pending', name: 'Test Visitor'
                    }
                })
            });
            const store = useSpocStore()
            const initialLength = store.visitors.length
            
            await store.inviteVisitor({
                name: 'Test Visitor',
                phone: '+91 12345 67890',
                purpose: 'Business Meeting'
            })
            
            expect(store.visitors.length).toBe(initialLength + 1)
        })

        it('should generate a passcode for new visitor', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                json: async () => ({
                    success: true,
                    data: {
                        id: 'new-v', passcode: '123456', status: 'Pending', name: 'Test Visitor'
                    }
                })
            });
            const store = useSpocStore()
            
            const visitor = await store.inviteVisitor({
                name: 'Test Visitor',
                phone: '+91 12345 67890',
                purpose: 'Business Meeting'
            })
            
            expect(visitor.passcode).toBeDefined()
            expect(visitor.passcode?.length).toBe(6)
        })

        it('should set status to pending for new visitor', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                json: async () => ({
                    success: true,
                    data: {
                        id: 'new-v', passcode: '123456', status: 'Pending', name: 'Test Visitor'
                    }
                })
            });
            const store = useSpocStore()
            
            const visitor = await store.inviteVisitor({
                name: 'Test Visitor',
                phone: '+91 12345 67890',
                purpose: 'Meeting'
            })
            
            expect(visitor.status).toBe('pending')
        })
    })

    describe('addEmployee', () => {
        it('should add a new employee to the list', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                json: async () => ({
                    success: true,
                    data: { id: 'new-e', name: 'New Employee', email: 'new@company.com' }
                })
            });
            const store = useSpocStore()
            const initialLength = store.employees.length
            
            await store.addEmployee({
                name: 'New Employee',
                email: 'new@company.com'
            })
            
            expect(store.employees.length).toBe(initialLength + 1)
        })

        it('should return the created employee', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                json: async () => ({
                    success: true,
                    data: { id: 'new-e', name: 'New Employee', email: 'new@company.com', department: 'Engineering' }
                })
            });
            const store = useSpocStore()
            
            const employee = await store.addEmployee({
                name: 'New Employee',
                email: 'new@company.com',
                department: 'Engineering'
            })
            
            expect(employee.name).toBe('New Employee')
            expect(employee.email).toBe('new@company.com')
            expect(employee.department).toBe('Engineering')
        })

        it('should handle USER_CREATION_ERROR with email domain mismatch on HTTP error', async () => {
            const errorPayload = {
                success: false,
                code: 'USER_CREATION_ERROR',
                message: 'Failed to create user.',
                data: null,
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
                },
                meta: {
                    request_id: '5b99ad9d-9e95-4638-bd71-04a079991c35',
                    timestamp: '2026-09-04T08:59:44.518876Z'
                }
            }

            mockFetch.mockResolvedValue({
                ok: false,
                status: 400,
                json: async () => errorPayload
            });

            const store = useSpocStore()
            await expect(store.addEmployee({
                name: 'Test User',
                email: 'test@wrongdomain.com'
            })).rejects.toThrow()

            expect(store.error).toBe('Email domain must match the company domain (@gmail.com).')
        })

        it('should handle 200 response with success: false and VALIDATION_ERROR', async () => {
            const errorPayload = {
                success: false,
                code: 'USER_CREATION_ERROR',
                message: 'Failed to create user.',
                data: null,
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

            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                json: async () => errorPayload
            });

            const store = useSpocStore()
            await expect(store.addEmployee({
                name: 'Test User',
                email: 'test@wrongdomain.com'
            })).rejects.toThrow()

            expect(store.error).toBe('Email domain must match the company domain (@gmail.com).')
        })
    })

    describe('deleteEmployee', () => {
        it('should remove employee from the list', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                json: async () => ({
                    success: true,
                    data: { id: 'delete-id', name: 'To Delete', email: 'delete@company.com' }
                })
            });
            const store = useSpocStore()
            
            // First add an employee
            const employee = await store.addEmployee({
                name: 'To Delete',
                email: 'delete@company.com'
            })
            
            const lengthBefore = store.employees.length
            
            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                json: async () => ({ success: true })
            });

            // Then delete
            await store.deleteEmployee(employee.id)
            
            expect(store.employees.length).toBe(lengthBefore - 1)
            expect(store.employees.find(e => e.id === employee.id)).toBeUndefined()
        })

        it('should return true when employee is deleted', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                json: async () => ({
                    success: true,
                    data: { id: 'delete-id', name: 'To Delete', email: 'delete@company.com' }
                })
            });
            const store = useSpocStore()
            
            const employee = await store.addEmployee({
                name: 'To Delete',
                email: 'delete@company.com'
            })
            
            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                json: async () => ({ success: true })
            });

            const result = await store.deleteEmployee(employee.id)
            expect(result).toBe(true)
        })

        it('should throw error when employee deletion fails', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 404,
                json: async () => ({ success: false, message: 'Employee not found' })
            });
            const store = useSpocStore()
            
            await expect(store.deleteEmployee('nonexistent-id')).rejects.toThrow()
        })
    })

    describe('updateEmployee', () => {
        it('should omit app_name from request body when turning off building pass (buildingPassEnabled: false)', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                json: async () => ({
                    success: true,
                    data: { id: 'emp-1', name: 'John Doe', email: 'john@example.com' }
                })
            })
            const store = useSpocStore()
            store.employees = [
                {
                    id: 'emp-1',
                    name: 'John Doe',
                    email: 'john@example.com',
                    buildingPassEnabled: true
                }
            ]

            await store.updateEmployee('emp-1', {
                buildingPassEnabled: false
            })

            expect(mockFetch).toHaveBeenCalled()
            const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1]
            const requestBody = JSON.parse(lastCall[1].body)
            
            expect(requestBody.building_pass_enabled).toBe(false)
            expect(requestBody.app_name).toBeUndefined()
            expect(requestBody).not.toHaveProperty('app_name')
        })

        it('should omit app_name from request body when enabling building pass (buildingPassEnabled: true)', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                json: async () => ({
                    success: true,
                    data: { id: 'emp-1', name: 'John Doe', email: 'john@example.com' }
                })
            })
            const store = useSpocStore()
            store.employees = [
                {
                    id: 'emp-1',
                    name: 'John Doe',
                    email: 'john@example.com',
                    buildingPassEnabled: false
                }
            ]

            await store.updateEmployee('emp-1', {
                buildingPassEnabled: true
            })

            expect(mockFetch).toHaveBeenCalled()
            const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1]
            const requestBody = JSON.parse(lastCall[1].body)
            
            expect(requestBody.building_pass_enabled).toBe(true)
            expect(requestBody.app_name).toBeUndefined()
            expect(requestBody).not.toHaveProperty('app_name')
        })

        it('should include app_name client_portal when role is SPOC', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                json: async () => ({
                    success: true,
                    data: { id: 'emp-1', name: 'John Doe', email: 'john@example.com' }
                })
            })
            const store = useSpocStore()
            store.employees = [
                {
                    id: 'emp-1',
                    name: 'John Doe',
                    email: 'john@example.com'
                }
            ]

            await store.updateEmployee('emp-1', {
                name: 'John Updated',
                role: 'SPOC'
            })

            expect(mockFetch).toHaveBeenCalled()
            const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1]
            const requestBody = JSON.parse(lastCall[1].body)
            
            expect(requestBody.full_name).toBe('John Updated')
            expect(requestBody.app_name).toBe('client_portal')
        })
    })
})
