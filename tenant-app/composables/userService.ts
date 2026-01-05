export const useUserService = () => {
    // Simulate API delay
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

    const getUserModules = async (): Promise<string[]> => {
        await delay(300)
        // Mock response
        return [   
            'dashboard', 
            'companies',
            'visitors', 
            'facilities', 
            'helpdesk', 
            'users', 
            'settings',
            'meeting_rooms'
        ]
    }

    return {
        getUserModules
    }
}
