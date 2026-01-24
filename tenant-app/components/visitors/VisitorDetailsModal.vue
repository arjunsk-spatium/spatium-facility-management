<template>
    <a-modal 
        v-model:open="isOpen" 
        :footer="null" 
        width="700px"
        title="Visitor Details"
    >
        <div v-if="visitor" class="space-y-6">
            <!-- Visitor Profile Card -->
            <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 flex items-stretch gap-4">
                <!-- Avatar -->
                <div class="w-24 flex-shrink-0">
                    <a-avatar 
                        v-if="visitor.photoUrl" 
                        :src="visitor.photoUrl" 
                        shape="square" 
                        class="w-full h-full"
                    />
                    <div 
                        v-else 
                        class="w-full h-full rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center"
                    >
                        <span class="text-white text-3xl font-bold">{{ getInitials(visitor.name) }}</span>
                    </div>
                </div>
                
                <!-- Info -->
                <div class="flex-1 min-w-0 flex flex-col justify-center">
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-1">{{ visitor.name }}</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">{{ visitor.company || 'Guest Visitor' }}</p>
                    
                    <!-- Tags -->
                    <div class="flex flex-wrap gap-2">
                        <a-tag color="blue" class="!m-0 !px-3 !py-1">
                            {{ visitor.visitPurpose || 'Visit' }}
                        </a-tag>
                        <a-tag color="green" class="!m-0 !px-3 !py-1">
                            {{ formatDateShort(visitor.visitDate) }}
                        </a-tag>
                    </div>
                </div>
            </div>

            <!-- Two Column Layout -->
            <div class="grid grid-cols-2 gap-6">
                <!-- Contact Information -->
                <div>
                    <h4 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                        Contact Information
                    </h4>
                    <div class="space-y-4">
                        <!-- Email -->
                        <div class="flex items-start gap-3">
                            <div class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                <MailOutlined class="text-blue-600 dark:text-blue-400" />
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Email</p>
                                <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">{{ visitor.email || 'Not provided' }}</p>
                            </div>
                        </div>
                        
                        <!-- Phone -->
                        <div class="flex items-start gap-3">
                            <div class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                <PhoneOutlined class="text-blue-600 dark:text-blue-400" />
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Phone</p>
                                <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ visitor.phone }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Visit Details -->
                <div>
                    <h4 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                        Visit Details
                    </h4>
                    <div class="space-y-4">
                        <!-- Visiting Company / Facility -->
                        <div class="flex items-start gap-3">
                            <div class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                <HomeOutlined class="text-blue-600 dark:text-blue-400" />
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Visiting Company</p>
                                <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">{{ visitor.company || 'N/A' }}</p>
                            </div>
                        </div>
                        
                        <!-- Host Contact -->
                        <div class="flex items-start gap-3">
                            <div class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                <TeamOutlined class="text-blue-600 dark:text-blue-400" />
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Host Contact</p>
                                <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">{{ visitor.hostName || 'Not assigned' }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Bottom Row - Date and Time -->
            <div class="grid grid-cols-2 gap-6">
                <!-- Visit Date -->
                <div class="flex items-start gap-3">
                    <div class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <CalendarOutlined class="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Visit Date</p>
                        <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ formatDate(visitor.visitDate) }}</p>
                    </div>
                </div>
                
                <!-- Visit Time -->
                <div class="flex items-start gap-3">
                    <div class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <ClockCircleOutlined class="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Visit Time</p>
                        <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ visitor.checkInTime ? formatTime(visitor.checkInTime) : 'Not specified' }}</p>
                    </div>
                </div>
            </div>

            <!-- Additional Information (if exists) -->
            <div v-if="visitor.checkInTime || visitor.checkOutTime" 
                 class="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div class="grid grid-cols-2 gap-4">
                    <div v-if="visitor.checkInTime" class="flex items-center gap-2">
                        <LoginOutlined class="text-green-500" />
                        <span class="text-xs text-gray-500 dark:text-gray-400">Check-in:</span>
                        <span class="text-sm font-medium dark:text-gray-200">{{ formatTime(visitor.checkInTime) }}</span>
                    </div>
                    <div v-if="visitor.checkOutTime" class="flex items-center gap-2">
                        <LogoutOutlined class="text-gray-500" />
                        <span class="text-xs text-gray-500 dark:text-gray-400">Check-out:</span>
                        <span class="text-sm font-medium dark:text-gray-200">{{ formatTime(visitor.checkOutTime) }}</span>
                    </div>
                </div>
            </div>
        </div>
    </a-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { 
    UserOutlined, 
    PhoneOutlined, 
    MailOutlined, 
    CalendarOutlined,
    ClockCircleOutlined,
    TeamOutlined,
    KeyOutlined,
    HomeOutlined,
    CarOutlined,
    LoginOutlined,
    LogoutOutlined
} from '@ant-design/icons-vue';
import type { Visitor } from '../../composables/visitorService';

const props = defineProps<{
    open: boolean;
    visitor: Visitor | null;
}>();

const emit = defineEmits<{
    'update:open': [value: boolean];
}>();

const isOpen = ref(props.open);

watch(() => props.open, (val) => {
    isOpen.value = val;
});

watch(isOpen, (val) => {
    emit('update:open', val);
});

const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: '2-digit',
        year: 'numeric'
    });
};

const formatDateShort = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: '2-digit',
        year: 'numeric'
    });
};

const formatTime = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-IN', { 
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.trim().split(' ').filter(p => p.length > 0);
    if (parts.length === 0) return '?';
    if (parts.length === 1) {
        const firstPart = parts[0];
        return firstPart ? firstPart.substring(0, 2).toUpperCase() : '?';
    }
    const firstPart = parts[0];
    const lastPart = parts[parts.length - 1];
    const firstInitial = firstPart?.[0] || '';
    const lastInitial = lastPart?.[0] || '';
    return (firstInitial + lastInitial).toUpperCase() || '?';
};
</script>
