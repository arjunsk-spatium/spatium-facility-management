import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from './auth'

// Mock the userService
vi.mock('../composables/userService', () => ({
    useUserService: () => ({
        getUserModules: vi.fn().mockResolvedValue(['dashboard', 'visitors', 'companies'])
    })
}))

describe('Auth Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
    })

    describe('Initial State', () => {
        it('should have null user initially', () => {
            const store = useAuthStore()
            expect(store.user).toBeNull()
        })

        it('should have null token initially', () => {
            const store = useAuthStore()
            expect(store.token).toBeNull()
        })

        it('should have empty modules array initially', () => {
            const store = useAuthStore()
            expect(store.modules).toEqual([])
        })
    })

    describe('Getters', () => {
        it('isAuthenticated should return false when no token', () => {
            const store = useAuthStore()
            expect(store.isAuthenticated).toBe(false)
        })

        it('isAuthenticated should return true when token exists', () => {
            const store = useAuthStore()
            store.login({ name: 'Test' }, 'test-token')
            expect(store.isAuthenticated).toBe(true)
        })

        it('hasModule should return true for existing module', () => {
            const store = useAuthStore()
            store.modules = ['dashboard', 'visitors']
            expect(store.hasModule('dashboard')).toBe(true)
        })

        it('hasModule should return false for non-existing module', () => {
            const store = useAuthStore()
            store.modules = ['dashboard']
            expect(store.hasModule('visitors')).toBe(false)
        })
    })

    describe('Actions', () => {
        it('login should set user and token', () => {
            const store = useAuthStore()
            const user = { id: 1, name: 'John Doe' }
            store.login(user, 'auth-token-123')
            
            expect(store.user).toEqual(user)
            expect(store.token).toBe('auth-token-123')
        })

        it('logout should clear user, token and modules', () => {
            const store = useAuthStore()
            store.login({ name: 'Test' }, 'token')
            store.modules = ['dashboard']
            
            store.logout()
            
            expect(store.user).toBeNull()
            expect(store.token).toBeNull()
            expect(store.modules).toEqual([])
        })

        it('fetchModules should populate modules array', async () => {
            const store = useAuthStore()
            await store.fetchModules()
            
            expect(store.modules).toContain('dashboard')
            expect(store.modules).toContain('visitors')
            expect(store.modules).toContain('companies')
        })
    })
})
