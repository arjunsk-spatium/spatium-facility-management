import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StatusBadge from './StatusBadge.vue'

describe('StatusBadge', () => {
  it('renders active status correctly', () => {
    const wrapper = mount(StatusBadge, {
      props: { status: 'active' }
    })
    expect(wrapper.text()).toContain('active')
    expect(wrapper.classes()).toContain('bg-green-100')
  })

  it('renders inactive status correctly', () => {
    const wrapper = mount(StatusBadge, {
      props: { status: 'inactive' }
    })
    expect(wrapper.text()).toContain('inactive')
    expect(wrapper.classes()).toContain('bg-red-100')
  })

  it('renders pending status correctly', () => {
    const wrapper = mount(StatusBadge, {
      props: { status: 'pending' }
    })
    expect(wrapper.text()).toContain('pending')
    expect(wrapper.classes()).toContain('bg-yellow-100')
  })
})
