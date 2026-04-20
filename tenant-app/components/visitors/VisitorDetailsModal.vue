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
                        v-if="visitor.image_url" 
                        :src="visitor.image_url" 
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
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">{{ visitor.from_company || visitor.company_name || 'Guest Visitor' }}</p>
                    
                    <!-- Tags -->
                    <div class="flex flex-wrap gap-2">
                        <a-tag v-if="visitor.visitor_type" :color="visitor.visitor_type === 'walk_in' ? 'blue' : 'purple'" class="!m-0 !px-3 !py-1">
                            {{ visitor.visitor_type === 'walk_in' ? 'Walk-in' : 'Pre-invite' }}
                        </a-tag>
                        <a-tag v-else color="purple" class="!m-0 !px-3 !py-1">
                            Pre-invite
                        </a-tag>
                        <a-tag color="green" class="!m-0 !px-3 !py-1">
                            {{ formatDateShort(visitor.appointment_time || visitor.created_at) }}
                        </a-tag>
                        <a-tag :color="getStatusColor(visitor.status)">
                            {{ visitor.status }}
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
                                <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ visitor.phone_number || 'Not provided' }}</p>
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
                        <!-- Purpose of Visit -->
                        <div class="flex items-start gap-3">
                            <div class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                <HomeOutlined class="text-blue-600 dark:text-blue-400" />
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Purpose of Visit</p>
                                <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">{{ visitor.purpose_of_visit || 'N/A' }}</p>
                            </div>
                        </div>
                        
                        <!-- Facility -->
                        <div class="flex items-start gap-3">
                            <div class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                <TeamOutlined class="text-blue-600 dark:text-blue-400" />
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Facility</p>
                                <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">{{ visitor.facility_name || 'Not assigned' }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Bottom Row - Date and Time -->
            <div class="grid grid-cols-2 gap-6">
                <!-- Appointment Time -->
                <div class="flex items-start gap-3">
                    <div class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <CalendarOutlined class="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Appointment Time</p>
                        <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ visitor.appointment_time ? formatDateTime(visitor.appointment_time) : 'Not specified' }}</p>
                    </div>
                </div>
                
                <!-- Created At -->
                <div class="flex items-start gap-3">
                    <div class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <ClockCircleOutlined class="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Created At</p>
                        <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ formatDateTime(visitor.created_at) }}</p>
                    </div>
                </div>
            </div>

            <!-- Additional Information (if exists) -->
            <div v-if="visitor.check_in_time || visitor.check_out_time" 
                 class="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div class="grid grid-cols-2 gap-4">
                    <div v-if="visitor.check_in_time" class="flex items-center gap-2">
                        <LoginOutlined class="text-green-500" />
                        <span class="text-xs text-gray-500 dark:text-gray-400">Check-in:</span>
                        <span class="text-sm font-medium dark:text-gray-200">{{ formatDateTime(visitor.check_in_time) }}</span>
                    </div>
                    <div v-if="visitor.check_out_time" class="flex items-center gap-2">
                        <LogoutOutlined class="text-gray-500" />
                        <span class="text-xs text-gray-500 dark:text-gray-400">Check-out:</span>
                        <span class="text-sm font-medium dark:text-gray-200">{{ formatDateTime(visitor.check_out_time) }}</span>
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
import type { SpocVisitor } from '../../stores/spoc';

const { formatDisplayDate, formatDisplayDateTime, formatDisplayTime } = useDate()

type VisitorType = Visitor | SpocVisitor;

const props = defineProps<{
    open: boolean;
    visitor: VisitorType | null;
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
    return formatDisplayDate(dateStr);
};

const formatDateShort = (dateStr: string) => {
    return formatDisplayDate(dateStr);
};

const formatTime = (dateStr: string) => {
    return formatDisplayTime(dateStr);
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

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Approved': return 'green'
        case 'Pending': return 'orange'
        case 'Rejected': return 'red'
        default: return 'default'
    }
};

const formatDateTime = (dateStr: string) => {
    return formatDisplayDateTime(dateStr)
};
</script>
