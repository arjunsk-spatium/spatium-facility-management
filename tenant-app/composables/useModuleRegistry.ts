export interface ModuleChild {
    key: string
    label: string
    route: string
}

export interface Module {
    key: string
    label: string
    icon?: string
    route?: string
    children?: ModuleChild[]
}

// Static definition of all available modules in the system
const registry: Module[] = [
    { key: 'dashboard', label: 'Dashboard', icon: 'BarChartOutlined', route: '/dashboard' },
    {
        key: 'visitors',
        label: 'Visitors',
        icon: 'UsergroupAddOutlined',
        children: [
            { key: 'visitors-insights', label: 'Insights', route: '/visitors/insights' },
            { key: 'visitors-list', label: 'All Visitors', route: '/visitors' }
        ]
    },
    {
        key: 'companies',
        label: 'Companies',
        icon: 'BankOutlined',
        children: [
            { key: 'companies-insights', label: 'Insights', route: '/companies/insights' },
            { key: 'companies-list', label: 'All Companies', route: '/companies' }
        ]
    },
    {
        key: 'helpdesk',
        label: 'Helpdesk',
        icon: 'CustomerServiceOutlined',
        children: [
            { key: 'helpdesk-insights', label: 'Insights', route: '/helpdesk/insights' },
            { key: 'helpdesk-tickets', label: 'Tickets', route: '/helpdesk' }
        ]
    },
    {
        key: 'facilities',
        label: 'Facilities',
        icon: 'HomeOutlined',
        children: [
            { key: 'facilities-insights', label: 'Insights', route: '/facilities/insights' },
            { key: 'facilities-list', label: 'All Facilities', route: '/facilities' }
        ]
    },
    {
        key: 'meeting_rooms',
        label: 'Meeting Rooms',
        icon: 'CalendarOutlined',
        children: [
            { key: 'meeting-rooms-insights', label: 'Insights', route: '/meeting-rooms/insights' },
            { key: 'meeting-rooms-list', label: 'All Rooms', route: '/meeting-rooms' },
            { key: 'meeting-rooms-bookings', label: 'Bookings', route: '/meeting-rooms/bookings' }
        ]
    },
    { key: 'users', label: 'User Management', icon: 'TeamOutlined', route: '/users' },
    { key: 'configure', label: 'Configure', icon: 'SettingOutlined', route: '/configure' },
    {
        key: 'frontdesk',
        label: 'Front Desk',
        icon: 'SafetyCertificateOutlined',
        children: [
            { key: 'frontdesk-visitors', label: 'All Visitors', route: '/frontdesk/visitors' }
        ]
    },
    // SPOC Modules - for company SPOCs
    { key: 'spoc_dashboard', label: 'Company Dashboard', icon: 'DashboardOutlined', route: '/spoc' },
    {
        key: 'spoc_visitors',
        label: 'Visitors',
        icon: 'UsergroupAddOutlined',
        children: [
            { key: 'spoc-visitors-insights', label: 'Insights', route: '/spoc/visitors/insights' },
            { key: 'spoc-visitors-list', label: 'Visitor List', route: '/spoc/visitors' },
            { key: 'spoc-visitors-invite', label: 'Invite Visitor', route: '/spoc/visitors/invite' }
        ]
    },
    { key: 'spoc_employees', label: 'Employees', icon: 'TeamOutlined', route: '/spoc/employees' },
    { key: 'spoc_config', label: 'Configuration', icon: 'SettingOutlined', route: '/spoc/config' }
]

export const useModuleRegistry = () => {
    const getAllModules = (): Module[] => {
        return registry
    }

    return {
        getAllModules
    }
}
