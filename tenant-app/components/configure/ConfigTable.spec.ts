import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ConfigTable from './ConfigTable.vue'

const baseProps = {
    title: 'Departments',
    columns: [{ title: 'Name', dataIndex: 'name', key: 'name' }],
    data: [],
    fields: [
        { name: 'name', label: 'Name', type: 'text' as const, required: true },
        { name: 'description', label: 'Description', type: 'text' as const }
    ],
    canCreate: true
}

describe('ConfigTable', () => {
    it('should not emit add or close the modal when a required field is empty', async () => {
        const wrapper = await mountSuspended(ConfigTable, { props: baseProps })
        const vm = wrapper.vm as any

        vm.openAddModal()
        await vm.$nextTick()
        vm.formData.name = ''

        await vm.handleSubmit()

        expect(wrapper.emitted('add')).toBeFalsy()
        expect(vm.modalVisible).toBe(true)
    })

    it('should emit add and close the modal when required fields are filled', async () => {
        const wrapper = await mountSuspended(ConfigTable, { props: baseProps })
        const vm = wrapper.vm as any

        vm.openAddModal()
        vm.formData.name = 'Engineering'
        vm.formData.description = 'R&D team'

        await vm.handleSubmit()

        expect(wrapper.emitted('add')).toBeTruthy()
        expect(wrapper.emitted('add')![0][0]).toMatchObject({ name: 'Engineering', description: 'R&D team' })
        expect(vm.modalVisible).toBe(false)
    })

    it('should keep the modal open for edit submissions with empty required fields', async () => {
        const wrapper = await mountSuspended(ConfigTable, { props: baseProps })
        const vm = wrapper.vm as any

        vm.openEditModal({ id: 'd1', name: 'Engineering', description: '' })
        await vm.$nextTick()
        vm.formData.name = ''

        await vm.handleSubmit()

        expect(wrapper.emitted('edit')).toBeFalsy()
        expect(vm.modalVisible).toBe(true)
    })
})
