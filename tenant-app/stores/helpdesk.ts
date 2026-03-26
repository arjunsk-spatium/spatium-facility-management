
import { defineStore } from 'pinia';
import { useHelpdeskService, type Ticket, type HelpdeskStats, type CreateTicketPayload, type HelpdeskCategory, type HelpdeskSubCategory, type HelpdeskPriority } from '../composables/helpdeskService';

export const useHelpdeskStore = defineStore('helpdesk', {
    state: () => ({
        tickets: [] as Ticket[],
        currentTicket: null as Ticket | null,
        stats: null as HelpdeskStats | null,
        categories: [] as HelpdeskCategory[],
        subCategories: [] as HelpdeskSubCategory[],
        priorities: [] as HelpdeskPriority[],
        loading: false,
        creating: false,
        error: null as string | null,
        init: false
    }),

    getters: {
        getTicketById: (state) => (id: string) => state.tickets.find(t => t.id === id),
        openTickets: (state) => state.tickets.filter(t => t.state?.key === 'OPEN'),
        inProgressTickets: (state) => state.tickets.filter(t => t.state?.key === 'INPROGRESS'),
        activeTicketsCount: (state): number => state.tickets.filter(t => ['OPEN', 'INPROGRESS'].includes(t.state?.key || '')).length
    },

    actions: {
        async fetchTickets(params: { state?: string; facility_id?: string } = {}, force = false) {
            this.loading = true;
            this.error = null;
            const service = useHelpdeskService();
            
            try {
                this.tickets = await service.getTickets(params);
            } catch (err: any) {
                this.error = err.message || 'Failed to fetch tickets';
            } finally {
                this.loading = false;
            }
        },

        async fetchTicketById(id: string) {
            this.loading = true;
            this.error = null;
            const service = useHelpdeskService();

            try {
                const ticket = await service.getTicketById(id);
                if (ticket) {
                    this.currentTicket = ticket;
                } else {
                    this.error = 'Ticket not found';
                }
            } catch (err: any) {
                this.error = err.message || 'Failed to fetch ticket details';
            } finally {
                this.loading = false;
            }
        },
        
        async fetchStats() {
             const service = useHelpdeskService();
             try {
                 this.stats = await service.getStats();
             } catch (err) {
                 console.error('Failed to fetch helpdesk stats', err);
             }
        },

        async createTicket(payload: CreateTicketPayload) {
            this.creating = true;
            this.error = null;
            const service = useHelpdeskService();

            try {
                const newTicket = await service.createTicket(payload);
                this.tickets.unshift(newTicket);
                return newTicket;
            } catch (err: any) {
                this.error = err.message || 'Failed to create ticket';
                throw err;
            } finally {
                this.creating = false;
            }
        },

        async fetchCategories() {
            const service = useHelpdeskService();
            try {
                this.categories = await service.getCategories();
            } catch (err) {
                console.error('Failed to fetch categories', err);
            }
        },

        async fetchSubCategories(categoryId?: string) {
            const service = useHelpdeskService();
            try {
                this.subCategories = await service.getSubCategories(categoryId);
            } catch (err) {
                console.error('Failed to fetch subcategories', err);
            }
        },

        async fetchPriorities() {
            const service = useHelpdeskService();
            try {
                this.priorities = await service.getPriorities();
            } catch (err) {
                console.error('Failed to fetch priorities', err);
            }
        },

        async assignTicket(ticketId: string, assignee: string, notes?: string) {
            this.loading = true;
            this.error = null;
            const service = useHelpdeskService();

            try {
                const updatedTicket = await service.assignTicket(ticketId, assignee, notes);
                const index = this.tickets.findIndex(t => t.id === ticketId);
                if (index > -1) {
                    this.tickets[index] = updatedTicket;
                }
                if (this.currentTicket?.id === ticketId) {
                    this.currentTicket = updatedTicket;
                }
                return updatedTicket;
            } catch (err: any) {
                this.error = err.message || 'Failed to assign ticket';
                throw err;
            } finally {
                this.loading = false;
            }
        }
    }
});
