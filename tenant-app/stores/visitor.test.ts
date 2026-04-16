import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useVisitorStore } from './visitor'

// Mock the visitorService
vi.mock('../composables/visitorService', () => ({
    useVisitorService: () => ({
        getVisitors: vi.fn().mockResolvedValue([
            { id: '1', name: 'John Visitor', status: 'checked_in', passcode: '123456' },
            { id: '2', name: 'Jane Guest', status: 'pending', passcode: '654321' }
        ]),
        getStats: vi.fn().mockResolvedValue({ total: 100, checkedIn: 20, pending: 5 }),
        getTrends: vi.fn().mockResolvedValue([{ date: '2026-01-01', count: 10 }]),
        getPurposeStats: vi.fn().mockResolvedValue([{ purpose: 'Meeting', count: 50 }]),
        updateVisitorStatus: vi.fn().mockImplementation((id, status) => 
            Promise.resolve({ id, status, name: 'Updated Visitor' })
        ),
        registerWalkIn: vi.fn().mockResolvedValue({ id: 'new', name: 'Walk-in Visitor', passcode: '111111' }),
        getVisitorByPasscode: vi.fn().mockImplementation((code) =>
            code === '123456' ? Promise.resolve({ id: '1', name: 'John', passcode: '123456' }) : Promise.resolve(null)
        )
    })
}))

describe('Visitor Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
    })

    describe('Initial State', () => {
        it('should have empty visitors array initially', () => {
            const store = useVisitorStore()
            expect(store.visitors).toEqual([])
        })

        it('should have null stats initially', () => {
            const store = useVisitorStore()
            expect(store.stats).toBeNull()
        })

        it('should have empty trends array initially', () => {
            const store = useVisitorStore()
            expect(store.trends).toEqual([])
        })

        it('should have null currentVisitor initially', () => {
            const store = useVisitorStore()
            expect(store.currentVisitor).toBeNull()
        })
    })

    describe('Actions', () => {
        it('fetchVisitors should populate visitors', async () => {
            const store = useVisitorStore()
            await store.fetchVisitors()
            
            expect(store.visitors.length).toBe(2)
            expect(store.visitors[0].name).toBe('John Visitor')
        })

        it('fetchStats should populate stats', async () => {
            const store = useVisitorStore()
            await store.fetchStats()
            
            expect(store.stats).not.toBeNull()
            expect(store.stats?.total).toBe(100)
        })

        it('fetchTrends should populate trends', async () => {
            const store = useVisitorStore()
            await store.fetchTrends()
            
            expect(store.trends.length).toBeGreaterThan(0)
        })

        it('fetchPurposeStats should populate purposeStats', async () => {
            const store = useVisitorStore()
            await store.fetchPurposeStats()
            
            expect(store.purposeStats.length).toBeGreaterThan(0)
        })

        it('updateStatus should update visitor in list', async () => {
            const store = useVisitorStore()
            store.visitors = [
                { id: '1', name: 'John', status: 'pending' },
                { id: '2', name: 'Jane', status: 'pending' }
            ] as any[]
            
            await store.updateStatus('1', 'checked-in')
            
            expect(store.visitors.find(v => v.id === '1')?.status).toBe('checked-in')
        })

        it('registerWalkIn should return new visitor', async () => {
            const store = useVisitorStore()
            const result = await store.registerWalkIn({ name: 'New Walk-in' })
            
            expect(result).not.toBeNull()
            expect(result.name).toBe('Walk-in Visitor')
            expect(store.currentVisitor).not.toBeNull()
        })

        it('verifyPasscode should set currentVisitor for valid code', async () => {
            const store = useVisitorStore()
            const result = await store.verifyPasscode('123456')
            
            expect(result).not.toBeNull()
            expect(store.currentVisitor?.name).toBe('John')
        })

        it('verifyPasscode should throw error for invalid code', async () => {
            const store = useVisitorStore()
            
            await expect(store.verifyPasscode('invalid')).rejects.toThrow('Invalid Passcode')
        })
    })
})
