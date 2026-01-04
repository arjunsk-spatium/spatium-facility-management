export const useUserService = () => {
    // Simulate API delay
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

    const getUserModules = async (): Promise<string[]> => {
        await delay(300)
        // Mock response
        return ['dashboard', 'visitors', 
                'companies',
                'facilities', 'helpdesk', 'users', 'settings']
    }

    return {
        getUserModules
    }
}
