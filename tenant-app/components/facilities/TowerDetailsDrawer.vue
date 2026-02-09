<template>
    <a-drawer
        :open="open"
        :title="`Manage ${tower?.name || 'Tower'}`"
        width="600"
        @close="$emit('close')"
    >
        <FacilitiesTowerStructureManager 
            v-if="tower?.id"
            :towerId="tower.id" 
            @refresh="$emit('refresh')" 
        />
        <div v-else class="flex justify-center py-8">
            <a-spin />
        </div>
    </a-drawer>
</template>

<script setup lang="ts">
import type { Tower } from '../../composables/facilityService';

defineProps<{
    open: boolean;
    tower: Tower | null;
}>();

defineEmits(['close', 'refresh']);
</script>
