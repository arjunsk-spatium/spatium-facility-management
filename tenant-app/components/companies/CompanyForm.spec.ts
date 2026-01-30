import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import CompanyForm from './CompanyForm.vue'

describe('CompanyForm', () => {
  it('validates SPOC Phone attributes', async () => {
    const wrapper = await mountSuspended(CompanyForm)

    // Check if the input exists and has correct attributes
    const phoneInput = wrapper.find('input[placeholder="Enter SPOC phone number"]')
    expect(phoneInput.exists()).toBe(true)
    expect(phoneInput.attributes('maxlength')).toBe('10')
  })

  it('validates GSTIN attributes', async () => {
    const wrapper = await mountSuspended(CompanyForm)

    // Check if the input exists and has correct attributes
    const gstinInput = wrapper.find('input[placeholder="Enter GSTIN"]')
    expect(gstinInput.exists()).toBe(true)
    expect(gstinInput.attributes('maxlength')).toBe('15')
  })

  it('validates Company Name attributes', async () => {
      const wrapper = await mountSuspended(CompanyForm)
      const nameInput = wrapper.find('input[placeholder="Enter company name"]')
      expect(nameInput.exists()).toBe(true)
      expect(nameInput.attributes('maxlength')).toBe('100')
  })

  it('uppercases GSTIN input', async () => {
      const wrapper = await mountSuspended(CompanyForm)
      const gstinInput = wrapper.find('input[placeholder="Enter GSTIN"]')

      await gstinInput.setValue('lowercase')
      // Note: testing v-model updates with modifiers or custom logic might be tricky with stubs,
      // but let's check if the logic is triggered if we can.
      // Since a-input is likely a component, setValue might update the model.

      // In the component: @input="form.gstin = form.gstin.toUpperCase()"
      // We can try to trigger 'input' event.
      await gstinInput.trigger('input')

      // We need to access the component instance to check the form state
      // wrapper.vm.form.gstin should be 'LOWERCASE'

      // However, form is ref inside script setup, so it might not be directly exposed on vm.
      // But let's try.
      expect((wrapper.vm as any).form.gstin).toBe('LOWERCASE')
  })
})
