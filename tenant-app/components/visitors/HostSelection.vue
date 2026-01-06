<template>
    <div class="space-y-6">
        <div class="text-center">
            <h2 class="text-xl font-bold mb-2">Who are you visiting?</h2>
            <p class="text-gray-500 text-sm">Confirm the company and find your host.</p>
        </div>

        <!-- Confirm Company Card -->
        <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center text-white">
                    <BankOutlined class="text-xl" />
                </div>
                <div>
                    <div class="text-xs text-blue-600 font-bold tracking-wider uppercase">VISITING</div>
                    <div class="font-bold text-gray-900">Innovation Corp HQ</div>
                </div>
            </div>
            <a-button @click="$emit('change-company')" size="small">Change</a-button>
        </div>

        <!-- Search -->
        <a-input v-model:value="searchQuery" placeholder="Search by name or email..." size="large" class="rounded-lg">
            <template #prefix>
                <SearchOutlined class="text-gray-400" />
            </template>
        </a-input>

        <!-- Host List -->
        <div>
            <div class="flex justify-between items-center mb-3 px-1">
                <h3 class="font-bold text-gray-900">Suggested Hosts</h3>
                <a-button type="link" size="small">View All</a-button>
            </div>
            
            <div class="space-y-3 max-h-60 overflow-y-auto pr-1">
                <div v-for="host in filteredHosts" :key="host.id" 
                    @click="selectHost(host)"
                    class="p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group bg-white"
                    :class="selectedHostId === host.id ? 'border-blue-500 shadow-sm ring-1 ring-blue-500' : 'border-gray-100 hover:border-blue-200'">
                    
                    <div class="flex items-center gap-4">
                        <img :src="host.avatar" class="w-12 h-12 rounded-full bg-gray-100" />
                        <div>
                            <div class="font-bold text-gray-900">{{ host.name }}</div>
                            <div class="text-xs text-gray-500">{{ host.role }}</div>
                        </div>
                    </div>
                    
                    <div v-if="selectedHostId === host.id" class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white">
                        <CheckOutlined :style="{ fontSize: '12px' }" />
                    </div>
                </div>

                <div class="p-4 rounded-xl border border-dashed border-gray-200 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                     @click="$emit('manual-entry')">
                     <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 text-gray-500">
                        <UserOutlined />
                     </div>
                     <span class="text-sm font-medium text-blue-600">Enter host details manually</span>
                </div>
            </div>
        </div>

        <a-button type="primary" block size="large" class="h-12 text-lg font-medium rounded-xl"
            :disabled="!selectedHostId"
            @click="$emit('confirm')">
            Continue &rarr;
        </a-button>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { BankOutlined, SearchOutlined, CheckOutlined, UserOutlined } from '@ant-design/icons-vue'
import { useVisitorService } from '../../composables/visitorService'

const props = defineProps<{
    modelValue?: any
}>()

const emit = defineEmits(['update:modelValue', 'confirm', 'change-company', 'manual-entry'])

const { searchHosts } = useVisitorService()
const searchQuery = ref('')
const selectedHostId = ref(props.modelValue?.id || '')
const hosts = ref<any[]>([])

const filteredHosts = computed(() => {
    if (!searchQuery.value) return hosts.value
    return hosts.value.filter(h => h.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

const selectHost = (host: any) => {
    selectedHostId.value = host.id
    emit('update:modelValue', host)
}

onMounted(async () => {
    hosts.value = await searchHosts('') as any[]
})
</script>

<style scoped>
/* Custom scrollbar for host list */
::-webkit-scrollbar {
    width: 4px;
}
::-webkit-scrollbar-track {
    background: transparent;
}
::-webkit-scrollbar-thumb {
    background: #e5e7eb;
    border-radius: 4px;
}
</style>
