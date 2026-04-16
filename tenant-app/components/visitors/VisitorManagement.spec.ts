import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import VisitorManagement from './VisitorManagement.vue'
import { nextTick, ref } from 'vue'

// Mock pinia
vi.mock('pinia', () => ({
    storeToRefs: (val: any) => val,
    createTestingPinia: () => {}
}))

// Mock store modules to prevent loading real files
// We use a factory allowing us to override implementation later
vi.mock('../../stores/visitor', () => ({
    useVisitorStore: vi.fn()
}))
vi.mock('../../stores/facility', () => ({
    useFacilityStore: vi.fn()
}))
vi.mock('../../stores/company', () => ({
    useCompanyStore: vi.fn()
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

        fetchVisitors.mockClear();
        fetchFacilities.mockClear();
        fetchCompanies.mockClear();
        updateStatus.mockClear();

        // Setup mock implementations
        (useVisitorStore as any).mockReturnValue({
            visitors,
            loading,
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
                        template: '<select :value="value" @change="$emit(\'update:value\', parseInt($event.target.value)); $emit(\'change\')"><slot/></select>',
                        props: ['value'] 
                    },
                    'a-select-option': { template: '<option :value="value"><slot/></option>', props: ['value'] },
                    'a-input-search': { 
                        template: '<input :value="value" @input="$emit(\'update:value\', $event.target.value); $emit(\'search\')" />',
                        props: ['value']
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

    it('filters visitors by Facility', async () => {
        wrapper.vm.selectedFacility = 1;
        await nextTick();
        
        expect(wrapper.vm.filteredVisitors).toHaveLength(2);
        expect(wrapper.vm.filteredVisitors[0].id).toBe('1');
        
        wrapper.vm.selectedFacility = 2;
        await nextTick();
        expect(wrapper.vm.filteredVisitors).toHaveLength(1);
        expect(wrapper.vm.filteredVisitors[0].id).toBe('2');
    });

    it('filters visitors by Company', async () => {
        wrapper.vm.selectedCompany = 20; // Beta
        await nextTick();
        
        expect(wrapper.vm.filteredVisitors).toHaveLength(2);
    });

    it('filters visitors by Search Query', async () => {
        wrapper.vm.searchQuery = 'John';
        await nextTick();
        expect(wrapper.vm.filteredVisitors).toHaveLength(1);
        expect(wrapper.vm.filteredVisitors[0].name).toBe('John Doe');
        
        wrapper.vm.searchQuery = 'Delivery'; // Purpose
        await nextTick();
        expect(wrapper.vm.filteredVisitors).toHaveLength(1);
        expect(wrapper.vm.filteredVisitors[0].visitPurpose).toBe('Delivery');
    });

    it('combines filters correctly', async () => {
        wrapper.vm.selectedFacility = 1;
        wrapper.vm.selectedCompany = 20;
        await nextTick();
        
        expect(wrapper.vm.filteredVisitors).toHaveLength(1);
        expect(wrapper.vm.filteredVisitors[0].id).toBe('3');
    });
});
