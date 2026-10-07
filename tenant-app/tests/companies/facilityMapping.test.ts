import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useCompanyStore } from '../../stores/company'

const mockMapping = {
    id: 'mapping-1',
    company: 'comp-1',
    facility_id: 'fac-1',
    tower_id: 'tower-1',
    floor_id: 'floor-1',
    facility_name: 'Main Facility',
    tower_name: 'Tower A',
    floor_name: 'Floor 2'
}

const mockGetCompanyFacilities = vi.fn()
const mockCreateCompanyFacilityMapping = vi.fn()
const mockDeleteCompanyFacilityMapping = vi.fn()

vi.mock('../../composables/companyService', () => ({
    useCompanyService: () => ({
        getCompanyFacilities: mockGetCompanyFacilities,
        createCompanyFacilityMapping: mockCreateCompanyFacilityMapping,
        deleteCompanyFacilityMapping: mockDeleteCompanyFacilityMapping,
    })
}))

describe('Company Store - Facility Mapping', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        vi.clearAllMocks()
    })

    it('fetches company facilities using fetchCompanyFacilitiesAction', async () => {
        mockGetCompanyFacilities.mockResolvedValue([mockMapping])
        const store = useCompanyStore()

        await store.fetchCompanyFacilitiesAction('comp-1')

        expect(mockGetCompanyFacilities).toHaveBeenCalledWith('comp-1')
        expect(store.currentCompanyFacilities).toEqual([mockMapping])
    })

    it('adds facility mapping using createCompanyFacilityMappingAction', async () => {
        mockCreateCompanyFacilityMapping.mockResolvedValue(mockMapping)
        const store = useCompanyStore()

        const payload = {
            company: 'comp-1',
            facility_id: 'fac-1',
            tower_id: 'tower-1',
            floor_id: 'floor-1'
        }

        const result = await store.createCompanyFacilityMappingAction(payload)

        expect(mockCreateCompanyFacilityMapping).toHaveBeenCalledWith(payload)
        expect(result).toEqual(mockMapping)
        expect(store.currentCompanyFacilities).toContainEqual(mockMapping)
    })

    it('adds facility mapping using addCompanyFacilityMappingAction', async () => {
        mockCreateCompanyFacilityMapping.mockResolvedValue(mockMapping)
        const store = useCompanyStore()

        const payload = {
            company: 'comp-1',
            facility_id: 'fac-1'
        }

        const result = await store.addCompanyFacilityMappingAction(payload)

        expect(mockCreateCompanyFacilityMapping).toHaveBeenCalledWith(payload)
        expect(result).toEqual(mockMapping)
        expect(store.currentCompanyFacilities).toContainEqual(mockMapping)
    })

    it('deletes facility mapping using deleteCompanyFacilityMappingAction', async () => {
        mockDeleteCompanyFacilityMapping.mockResolvedValue(undefined)
        const store = useCompanyStore()
        store.currentCompanyFacilities = [mockMapping]

        await store.deleteCompanyFacilityMappingAction('mapping-1')

        expect(mockDeleteCompanyFacilityMapping).toHaveBeenCalledWith('mapping-1')
        expect(store.currentCompanyFacilities).toHaveLength(0)
    })

    it('deletes facility mapping using removeCompanyFacilityMappingAction', async () => {
        mockDeleteCompanyFacilityMapping.mockResolvedValue(undefined)
        const store = useCompanyStore()
        store.currentCompanyFacilities = [mockMapping]

        await store.removeCompanyFacilityMappingAction('mapping-1')

        expect(mockDeleteCompanyFacilityMapping).toHaveBeenCalledWith('mapping-1')
        expect(store.currentCompanyFacilities).toHaveLength(0)
    })

    it('throws error and sets error state if adding facility fails', async () => {
        mockCreateCompanyFacilityMapping.mockRejectedValue(new Error('Network error'))
        const store = useCompanyStore()

        const payload = {
            company: 'comp-1',
            facility_id: 'fac-1'
        }

        await expect(store.createCompanyFacilityMappingAction(payload)).rejects.toThrow('Network error')
        expect(store.error).toBe('Network error')
    })
})
