export interface DateFilter {
    filter: string
    date_from: string
    date_to: string
}

export interface RecentCompany {
    id: string
    name: string
    created_at: string
    status: string
}

export interface CompanySummary {
    total_count: number
    last_month_growth_percentage: number
    active_percentage: number
    by_status: Record<string, number>
    recent_companies: RecentCompany[]
}

export interface DailyCount {
    date: string
    count: number
}

export interface VisitorSummary {
    today_count: number
    last_7_days: DailyCount[]
}

export interface PreInviteSummary {
    today_count: number
    last_7_days: DailyCount[]
}

export interface InfrastructureSummary {
    facilities_count: number
    towers_count: number
    floors_count: number
    wings_count: number
}

export interface StaffSummary {
    total_staff_count: number
    on_duty_now: number
}

export interface TicketCategory {
    category__name: string
    ticket_count: number
}

export interface TicketCounts {
    open: number
    in_progress: number
    closed: number
    by_priority: Record<string, number>
    top_categories: TicketCategory[]
}

export interface UrgentSummary {
    disputed: number
    reopened: number
    escalated: number
}

export interface SlaSummary {
    breached: number
    near_breach: number
}

export interface HelpdeskTrendItem {
    date: string
    created: number
    resolved: number
}

export interface AverageTimes {
    response_time_minutes: number
    resolution_time_minutes: number
}

export interface HelpdeskSummary {
    tickets: TicketCounts
    urgent: UrgentSummary
    sla: SlaSummary
    trends_last_7_days: HelpdeskTrendItem[]
    average_times: AverageTimes
}

export interface TopCompanyByTickets {
    company_id: string
    name: string
    ticket_count: number
}

export interface TopCompanyByVisitors {
    company_id: string
    name: string
    visitor_count: number
}

export interface TopFacility {
    facility_id: string
    name: string
    count: number
}

export interface InsightsSummary {
    top_companies_by_tickets: TopCompanyByTickets[]
    top_companies_by_visitors: TopCompanyByVisitors[]
    top_facilities: {
        highest_visitors: TopFacility | null
        highest_tickets: TopFacility | null
    }
}

export interface UsersSummary {
    active_today: number
    active_last_7_days: number
    new_registrations_last_7_days: number
}

export interface DashboardSummaryData {
    date_filter: DateFilter
    companies: CompanySummary
    visitors: VisitorSummary
    pre_invites: PreInviteSummary
    infrastructure: InfrastructureSummary
    staff: StaffSummary
    helpdesk: HelpdeskSummary
    insights: InsightsSummary
    users: UsersSummary
}

export interface DashboardSummaryResponse {
    success: boolean
    code: string
    message: string
    data: DashboardSummaryData
    error: any | null
    meta: {
        request_id: string
        timestamp: string
    }
}

export interface VisitorInsightsDateRange {
    start_date: string
    end_date: string
}

export interface VisitorInsightsSummary {
    total_visitors: number
    checked_in: number
    checked_out: number
    pending: number
    expected: number
}

export interface VisitorInsightsTrafficItem {
    date: string
    count: number
}

export interface VisitorInsightsHourlyItem {
    hour: string
    count: number
}

export interface VisitorInsightsPurpose {
    purpose: string
    count: number
    percentage: number
}

export interface VisitorInsightsTopCompany {
    company_id: string
    name: string
    count: number
}

export interface VisitorInsightsData {
    date_range: VisitorInsightsDateRange
    summary: VisitorInsightsSummary
    traffic: VisitorInsightsTrafficItem[]
    today_hourly_traffic: VisitorInsightsHourlyItem[]
    visit_purposes: VisitorInsightsPurpose[]
    top_visiting_companies: VisitorInsightsTopCompany[]
}

export interface VisitorInsightsResponse {
    success: boolean
    code: string
    message: string
    data: VisitorInsightsData
    error: any | null
    meta: {
        request_id: string
        timestamp: string
    }
}

export const useDashboardService = () => {
    const { $api } = useNuxtApp()

    return {
        getSummary: async (): Promise<DashboardSummaryData> => {
            const response = await $api<DashboardSummaryResponse>(
                '/api/portal/dashboard/summary/',
                { method: 'GET' }
            )

            if (!response.success) {
                throw new Error(response.message || 'Failed to fetch dashboard summary')
            }

            return response.data
        },

        getVisitorInsights: async (startDate: string, endDate: string): Promise<VisitorInsightsData> => {
            const response = await $api<VisitorInsightsResponse>(
                '/api/portal/dashboard/visitor-insights/',
                {
                    method: 'GET',
                    query: { start_date: startDate, end_date: endDate },
                }
            )

            if (!response.success) {
                throw new Error(response.message || 'Failed to fetch visitor insights')
            }

            return response.data
        },
    }
}
