import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import VisitorManagement from './VisitorManagement.vue'
import { nextTick, ref } from 'vue'

// Mock pinia
vi.mock('pinia', () => ({
    storeToRefs: (val: any) => val,
    createTestingPinia: () => {},
    defineStore: (name: string, setup: any) => setup
}))

// Mock store modules to prevent loading real files
vi.mock('../../stores/visitor', () => ({
    useVisitorStore: vi.fn()
}))
vi.mock('../../stores/facility', () => ({
    useFacilityStore: vi.fn()
}))
vi.mock('../../stores/company', () => ({
    useCompanyStore: vi.fn()
}))
vi.mock('../../stores/auth', () => ({
    useAuthStore: vi.fn(() => ({
        hasPermission: vi.fn(() => true)
    }))
}))

// Import the mocked functions to set implementations
import { useVisitorStore } from '../../stores/visitor'
import { useFacilityStore } from '../../stores/facility'
import { useCompanyStore } from '../../stores/company'

describe('VisitorManagement', () => {
    let wrapper: any;
    
    // Reactive state
    const visitors = ref<any[]>([]);
    const loading = ref(false);
    const count = ref(0);
    const page = ref(1);
    const pageSize = ref(10);
    const facilities = ref<any[]>([]);
    const companies = ref<any[]>([]);

    const fetchVisitors = vi.fn().mockResolvedValue(true);
    const fetchFacilities = vi.fn().mockResolvedValue(true);
    const fetchCompanies = vi.fn().mockResolvedValue(true);
    const updateStatus = vi.fn();

    const mockVisitorsData = [
        { id: '1', name: 'John Doe', facilityId: 1, companyId: 10, company: 'Acme', hostName: 'Host A', visitPurpose: 'Meeting' },
        { id: '2', name: 'Jane Smith', facilityId: 2, companyId: 20, company: 'Beta', hostName: 'Host B', visitPurpose: 'Interview' },
        { id: '3', name: 'Bob Jones', facilityId: 1, companyId: 20, company: 'Beta', hostName: 'Host A', visitPurpose: 'Delivery' }
    ];

    const mockFacilitiesData = [
        { id: 1, name: 'Facility A' },
        { id: 2, name: 'Facility B' }
    ];

    const mockCompaniesData = [
        { id: 10, name: 'Acme Corp' },
        { id: 20, name: 'Beta Inc' }
    ];

    beforeEach(() => {
        // Reset state
        visitors.value = [...mockVisitorsData];
        facilities.value = [...mockFacilitiesData];
        companies.value = [...mockCompaniesData];
        loading.value = false;
        count.value = 27;
        page.value = 1;
        pageSize.value = 10;

        fetchVisitors.mockClear();
        fetchFacilities.mockClear();
        fetchCompanies.mockClear();
        updateStatus.mockClear();

        // Setup mock implementations
        (useVisitorStore as any).mockReturnValue({
            visitors,
            loading,
            count,
            page,
            pageSize,
            fetchVisitors,
            updateStatus
        });
        
        (useFacilityStore as any).mockReturnValue({
            facilities,
            fetchFacilities
        });

        (useCompanyStore as any).mockReturnValue({
            companies,
            fetchCompanies
        });

        wrapper = mount(VisitorManagement, {
            global: {
                stubs: {
                    'a-button': { template: '<button><slot/></button>' },
                    'a-select': { 
                        template: '<select :value="value" @change="$emit(\'update:value\', $event.target.value); $emit(\'change\')"><slot/></select>',
                        props: ['value'] 
                    },
                    'a-select-option': { template: '<option :value="value"><slot/></option>', props: ['value'] },
                    'a-input-search': { 
                        template: '<input :value="value" @input="$emit(\'update:value\', $event.target.value); $emit(\'search\')" />',
                        props: ['value']
                    },
                    'a-range-picker': {
                        template: '<div class="range-picker"><slot/></div>',
                        props: ['value']
                    },
                    'a-pagination': {
                        template: '<div class="pagination"><slot/></div>',
                        props: ['current', 'total', 'pageSize']
                    },
                    'VisitorList': true,
                    'ExportOutlined': true
                }
            }
        });
    });

    it('mounts successfully', () => {
        expect(wrapper.exists()).toBe(true);
        expect(wrapper.find('h1').text()).toContain('Visitors Management');
    });

    it('fetches data on mount', () => {
        expect(fetchVisitors).toHaveBeenCalled();
        expect(fetchFacilities).toHaveBeenCalled();
        expect(fetchCompanies).toHaveBeenCalled();
    });

    it('calls fetchVisitors with facility filter', async () => {
        wrapper.vm.selectedFacility = '1';
        await wrapper.vm.handleFilterChange();
        
        expect(fetchVisitors).toHaveBeenCalledWith(
            expect.objectContaining({ facility_id: '1', page: 1 })
        );
    });

    it('calls fetchVisitors with company filter', async () => {
        wrapper.vm.selectedCompany = '20';
        await wrapper.vm.handleFilterChange();
        
        expect(fetchVisitors).toHaveBeenCalledWith(
            expect.objectContaining({ company_id: '20', page: 1 })
        );
    });

    it('calls fetchVisitors with search query', async () => {
        wrapper.vm.searchQuery = 'John';
        await wrapper.vm.handleFilterChange();
        
        expect(fetchVisitors).toHaveBeenCalledWith(
            expect.objectContaining({ search: 'John', page: 1 })
        );
    });

    it('combines filters correctly', async () => {
        wrapper.vm.selectedFacility = '1';
        wrapper.vm.selectedCompany = '20';
        wrapper.vm.searchQuery = 'test';
        await wrapper.vm.handleFilterChange();
        
        expect(fetchVisitors).toHaveBeenCalledWith(
            expect.objectContaining({
                facility_id: '1',
                company_id: '20',
                search: 'test',
                page: 1
            })
        );
    });

    it('resets to page 1 when filters change', async () => {
        page.value = 3;
        wrapper.vm.selectedFacility = '1';
        await wrapper.vm.handleFilterChange();
        
        expect(fetchVisitors).toHaveBeenCalledWith(
            expect.objectContaining({ page: 1 })
        );
    });

    it('handles page change with current filters', async () => {
        wrapper.vm.selectedFacility = '1';
        wrapper.vm.searchQuery = 'query';
        await wrapper.vm.handlePageChange(2);
        
        expect(fetchVisitors).toHaveBeenCalledWith(
            expect.objectContaining({
                facility_id: '1',
                search: 'query',
                page: 2
            })
        );
    });

})
