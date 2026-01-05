
import { defineStore } from 'pinia';
import { useHelpdeskService, type Ticket, type HelpdeskStats } from '../composables/helpdeskService';

export const useHelpdeskStore = defineStore('helpdesk', {
    state: () => ({
        tickets: [] as Ticket[],
        currentTicket: null as Ticket | null,
        stats: null as HelpdeskStats | null,
        loading: false,
        error: null as string | null,
        init: false
    }),

    getters: {
        getTicketById: (state) => (id: string) => state.tickets.find(t => t.id === id),
        openTickets: (state) => state.tickets.filter(t => t.status === 'Open'),
        inProgressTickets: (state) => state.tickets.filter(t => t.status === 'In Progress'),
        activeTicketsCount: (state): number => state.tickets.filter(t => ['Open', 'In Progress'].includes(t.status)).length
    },

    actions: {
        async fetchTickets(force = false) {
            if (this.init && !force) return;
            
            this.loading = true;
            this.error = null;
            const service = useHelpdeskService();
            
            try {
                this.tickets = await service.getTickets();
                this.init = true;
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
        }
    }
});
