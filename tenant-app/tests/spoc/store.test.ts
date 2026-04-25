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
        it('should fetch and populate stats', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                status: 200,
                json: async () => ({
                    success: true,
                    data: {
                        totalVisitors: 10,
                        pendingApprovals: 2,
                        checkedInToday: 5,
                        totalEmployees: 20
                    }
                })
            });
            const store = useSpocStore()
            await store.fetchStats()
            
            expect(store.stats).not.toBeNull()
            expect(store.stats?.totalVisitors).toBeDefined()
            expect(store.stats?.pendingApprovals).toBeDefined()
            expect(store.stats?.checkedInToday).toBeDefined()
            expect(store.stats?.totalEmployees).toBeDefined()
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

        it('should return false when employee not found', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 404,
                json: async () => ({ success: false })
            });
            const store = useSpocStore()
            
            const result = await store.deleteEmployee('nonexistent-id')
            expect(result).toBe(false)
        })
    })
})
