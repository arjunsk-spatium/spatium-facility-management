
import { defineStore } from 'pinia';
import { useHelpdeskService, type Ticket, type HelpdeskStats, type HelpdeskInsights, type CreateTicketPayload, type HelpdeskCategory, type HelpdeskSubCategory, type HelpdeskPriority } from '../composables/helpdeskService';

export const useHelpdeskStore = defineStore('helpdesk', {
    state: () => ({
        tickets: [] as Ticket[],
        currentTicket: null as Ticket | null,
        stats: null as HelpdeskStats | null,
        insights: null as HelpdeskInsights | null,
        categories: [] as HelpdeskCategory[],
        subCategories: [] as HelpdeskSubCategory[],
        priorities: [] as HelpdeskPriority[],
        loading: false,
        creating: false,
        error: null as string | null,
        init: false,
        priorityCount: 0,
        openCount: 0,
        inprogressCount: 0,
        pendingCount: 0,
        closedCount: 0,
        allCount: 0
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

        async fetchPriorityTickets(page = 1, pageSize = 20, facilityId?: string) {
            this.loading = true;
            this.error = null;
            const service = useHelpdeskService();
            
            try {
                this.tickets = await service.getPriorityTickets(page, pageSize, facilityId);
                this.priorityCount = this.tickets.length;
            } catch (err: any) {
                this.error = err.message || 'Failed to fetch priority tickets';
            } finally {
                this.loading = false;
            }
        },

        async fetchTicketCounts() {
            const service = useHelpdeskService();
            try {
                const [allTickets, open, inprogress, pending, closed] = await Promise.all([
                    service.getTickets({}),
                    service.getTickets({ states: 'open' }),
                    service.getTickets({ states: 'inprogress' }),
                    service.getTickets({ states: 'pending_confirmation' }),
                    service.getTickets({ states: 'closed' })
                ]);
                this.allCount = allTickets.length;
                this.openCount = open.length;
                this.inprogressCount = inprogress.length;
                this.pendingCount = pending.length;
                this.closedCount = closed.length;
            } catch (err) {
                console.error('Failed to fetch ticket counts', err);
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

        async fetchInsightsAction(startDate?: string, endDate?: string) {
            this.loading = true;
            this.error = null;
            const service = useHelpdeskService();
            try {
                this.insights = await service.getInsights(startDate, endDate);
            } catch (err: any) {
                this.error = err.message || 'Failed to fetch helpdesk insights';
            } finally {
                this.loading = false;
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
        },

        async reassignTicket(ticketId: string, assignee: string, notes?: string) {
            this.loading = true;
            this.error = null;
            const service = useHelpdeskService();

            try {
                const updatedTicket = await service.reassignTicket(ticketId, assignee, notes);
                const index = this.tickets.findIndex(t => t.id === ticketId);
                if (index > -1) {
                    this.tickets[index] = updatedTicket;
                }
                if (this.currentTicket?.id === ticketId) {
                    this.currentTicket = updatedTicket;
                }
                return updatedTicket;
            } catch (err: any) {
                this.error = err.message || 'Failed to reassign ticket';
                throw err;
            } finally {
                this.loading = false;
            }
        },

        async confirmCloseTicket(ticketId: string) {
            this.loading = true;
            this.error = null;
            const service = useHelpdeskService();

            try {
                const updatedTicket = await service.confirmCloseTicket(ticketId);
                const index = this.tickets.findIndex(t => t.id === ticketId);
                if (index > -1) {
                    this.tickets[index] = updatedTicket;
                }
                if (this.currentTicket?.id === ticketId) {
                    this.currentTicket = updatedTicket;
                }
                return updatedTicket;
            } catch (err: any) {
                this.error = err.message || 'Failed to close ticket';
                throw err;
            } finally {
                this.loading = false;
            }
        },

        async reopenTicket(ticketId: string, assignee?: string, notes?: string) {
            this.loading = true;
            this.error = null;
            const service = useHelpdeskService();

            try {
                const updatedTicket = await service.reopenTicket(ticketId, assignee, notes);
                const index = this.tickets.findIndex(t => t.id === ticketId);
                if (index > -1) {
                    this.tickets[index] = updatedTicket;
                }
                if (this.currentTicket?.id === ticketId) {
                    this.currentTicket = updatedTicket;
                }
                return updatedTicket;
            } catch (err: any) {
                this.error = err.message || 'Failed to reopen ticket';
                throw err;
            } finally {
                this.loading = false;
            }
        },

        async forceCloseTicket(ticketId: string, notes?: string) {
            this.loading = true;
            this.error = null;
            const service = useHelpdeskService();

            try {
                const updatedTicket = await service.forceCloseTicket(ticketId, notes);
                const index = this.tickets.findIndex(t => t.id === ticketId);
                if (index > -1) {
                    this.tickets[index] = updatedTicket;
                }
                if (this.currentTicket?.id === ticketId) {
                    this.currentTicket = updatedTicket;
                }
                return updatedTicket;
            } catch (err: any) {
                this.error = err.message || 'Failed to force close ticket';
                throw err;
            } finally {
                this.loading = false;
            }
        },

        async updateTicket(ticketId: string, payload: { priority?: string; location_text?: string }) {
            this.loading = true;
            this.error = null;
            const service = useHelpdeskService();

            try {
                const updatedTicket = await service.updateTicket(ticketId, payload);
                const index = this.tickets.findIndex(t => t.id === ticketId);
                if (index > -1) {
                    this.tickets[index] = updatedTicket;
                }
                if (this.currentTicket?.id === ticketId) {
                    this.currentTicket = updatedTicket;
                }
                return updatedTicket;
            } catch (err: any) {
                this.error = err.message || 'Failed to update ticket';
                throw err;
            } finally {
                this.loading = false;
            }
        }
    }
});
