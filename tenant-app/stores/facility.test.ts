import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useFacilityStore } from './facility'

// Mock the facilityService
vi.mock('../composables/facilityService', () => ({
    useFacilityService: () => ({
        getFacilities: vi.fn().mockResolvedValue([
            { id: '1', name: 'HQ Building', address: '123 Main St', status: 'Active' },
            { id: '2', name: 'Tech Park', address: '456 Tech Ave', status: 'Active' }
        ]),
        createFacility: vi.fn().mockImplementation((data) => Promise.resolve({ id: Date.now().toString(), ...data })),
        deleteFacility: vi.fn().mockResolvedValue(true)
    })
}))

describe('Facility Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
    })

    describe('Initial State', () => {
        it('should have empty facilities array initially', () => {
            const store = useFacilityStore()
            expect(store.facilities).toEqual([])
        })

        it('should have null currentFacility initially', () => {
            const store = useFacilityStore()
            expect(store.currentFacility).toBeNull()
        })

        it('should have loading false initially', () => {
            const store = useFacilityStore()
            expect(store.loading).toBe(false)
        })

        it('should have init false initially', () => {
            const store = useFacilityStore()
            expect(store.init).toBe(false)
        })
    })

    describe('Getters', () => {
        it('totalFacilities should return facilities count', () => {
            const store = useFacilityStore()
            store.facilities = [
                { id: '1', name: 'A' },
                { id: '2', name: 'B' }
            ] as any[]
            expect(store.totalFacilities).toBe(2)
        })

        it('getFacilityById should return correct facility', () => {
            const store = useFacilityStore()
            store.facilities = [
                { id: '1', name: 'Facility A' },
                { id: '2', name: 'Facility B' }
            ] as any[]
            const result = store.getFacilityById('2')
            expect(result?.name).toBe('Facility B')
        })

        it('getFacilityById should return undefined for non-existing id', () => {
            const store = useFacilityStore()
            store.facilities = [{ id: '1', name: 'A' }] as any[]
            expect(store.getFacilityById('999')).toBeUndefined()
        })
    })

    describe('Actions', () => {
        it('fetchFacilities should populate facilities', async () => {
            const store = useFacilityStore()
            await store.fetchFacilities()
            
            expect(store.facilities.length).toBe(2)
            expect(store.facilities[0].name).toBe('HQ Building')
            expect(store.init).toBe(true)
        })

        it('fetchFacilities should not refetch if already initialized', async () => {
            const store = useFacilityStore()
            await store.fetchFacilities()
            const initialCount = store.facilities.length
            
            await store.fetchFacilities() // Should not fetch again
            expect(store.facilities.length).toBe(initialCount)
        })

        it('fetchFacilities with force should refetch', async () => {
            const store = useFacilityStore()
            await store.fetchFacilities()
            store.init = true
            
            await store.fetchFacilities(true) // Force refetch
            expect(store.loading).toBe(false)
        })

        it('createFacility should add new facility to list', async () => {
            const store = useFacilityStore()
            const newFacility = { name: 'New Building', address: '789 New St' }
            
            await store.createFacility(newFacility as any)
            
            expect(store.facilities.length).toBe(1)
            expect(store.facilities[0].name).toBe('New Building')
        })

        it('deleteFacility should remove facility from list', async () => {
            const store = useFacilityStore()
            store.facilities = [
                { id: '1', name: 'A' },
                { id: '2', name: 'B' }
            ] as any[]
            
            await store.deleteFacility('1')
            
            expect(store.facilities.length).toBe(1)
            expect(store.facilities[0].id).toBe('2')
        })
    })
})
