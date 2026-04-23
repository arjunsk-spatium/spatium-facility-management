import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ConfigTable from './ConfigTable.vue'
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons-vue'

describe('ConfigTable.vue', () => {
    const mountComponent = (props = {}) => {
        return mount(ConfigTable, {
            props: {
                title: 'Test Table',
                columns: [{ title: 'Name', dataIndex: 'name', key: 'name' }],
                data: [],
                ...props
            },
            global: {
                components: {
                    PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined
                },
                stubs: {
                    'ResponsiveDataView': {
                        template: '<div class="responsive-data-view"><slot name="bodyCell" :column="{key: \'action\'}" :record="data[0]" /></div>',
                        props: ['data', 'columns', 'loading']
                    },
                    'a-button': { template: '<button class="a-button" @click="$emit(\'click\')"><slot /></button>' },
                    'a-popconfirm': { template: '<div><slot /></div>' },
                    'a-space': { template: '<div class="a-space"><slot /></div>' },
                    'a-modal': { 
                        template: '<div class="a-modal" v-if="open"><slot /></div>',
                        props: ['open', 'title', 'confirmLoading']
                    },
                    'a-form': { template: '<form><slot /></form>' },
                    'a-form-item': { template: '<div><slot /></div>' },
                    'a-select': { template: '<select :value="value" @change="$emit(\'update:value\', $event.target.value)"></select>', props: ['value', 'options'] },
                    'a-input': { template: '<input :value="value" @input="$emit(\'update:value\', $event.target.value)" />', props: ['value'] }
                }
            }
        })
    }

    it('mounts successfully', () => {
        const wrapper = mountComponent()
        expect(wrapper.exists()).toBe(true)
        expect(wrapper.find('h3').text()).toBe('Test Table')
    })

    it('opens edit modal and maps parent correctly using parentLabel', async () => {
        const data = [{ id: '1', name: 'Test', category: 'parent-123' }]
        const wrapper = mountComponent({
            data,
            parentOptions: [{ label: 'Parent 1', value: 'parent-123' }],
            parentLabel: 'Category',
            canUpdate: true
        })
        
        const editBtn = wrapper.find('.a-button')
        expect(editBtn.exists()).toBe(true)
        
        await editBtn.trigger('click')
        
        // Assert modal is open
        const modal = wrapper.find('.a-modal')
        expect(modal.exists()).toBe(true)
        
        // The formData should have mapped 'category' to 'parent_id'
        const vm = wrapper.vm as any
        expect(vm.formData.parent_id).toBe('parent-123')
    })
    
    it('opens edit modal and maps parent correctly using _id fallback', async () => {
        const data = [{ id: '1', name: 'Test', facility_id: 'fac-123' }]
        const wrapper = mountComponent({
            data,
            parentOptions: [{ label: 'Facility 1', value: 'fac-123' }],
            parentLabel: 'Facility',
            canUpdate: true
        })
        
        const editBtn = wrapper.find('.a-button')
        expect(editBtn.exists()).toBe(true)
        
        await editBtn.trigger('click')
        
        const vm = wrapper.vm as any
        expect(vm.formData.parent_id).toBe('fac-123')
    })
})
