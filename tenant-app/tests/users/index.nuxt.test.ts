import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import UsersPage from '../../app/pages/users/index.vue'
import { createTestingPinia } from '@pinia/testing'

describe('Users Module Management Page', () => {
    it('should render users page with header', async () => {
        const wrapper = await mountSuspended(UsersPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        auth: { modules: ['users'] }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('User')
    })

    it('should have Add User button', async () => {
        const wrapper = await mountSuspended(UsersPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        auth: { modules: ['users'] }
                    }
                })]
            }
        })
        
        expect(wrapper.html()).toContain('Add')
    })
})
