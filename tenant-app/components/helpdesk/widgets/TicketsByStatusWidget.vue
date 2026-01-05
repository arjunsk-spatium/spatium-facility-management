<template>
    <a-card title="Tickets by Status" :bordered="false" class="shadow-sm h-full">
        <div class="flex items-center justify-center p-4">
            <!-- Simple CSS Donut Chart Mockup -->
            <div
                class="relative w-40 h-40 rounded-full bg-blue-100 dark:bg-gray-700 flex items-center justify-center border-8 border-blue-500">
                <div
                    class="absolute inset-0 rounded-full border-8 border-red-500 border-l-transparent border-t-transparent -rotate-45">
                </div>
                <div class="absolute inset-0 rounded-full border-8 border-green-500 border-r-transparent border-b-transparent rotate-45"
                    style="clip-path: polygon(0 0, 100% 0, 100% 30%, 0 30%);"></div>

                <div class="text-center z-10">
                    <div class="text-2xl font-bold dark:text-white">100</div>
                    <div class="text-xs text-gray-500">Total</div>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-2 gap-2 mt-4">
            <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-red-500"></span>
                <span class="text-sm">Open (35%)</span>
            </div>
            <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-blue-500"></span>
                <span class="text-sm">In Progress (25%)</span>
            </div>
            <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-green-500"></span>
                <span class="text-sm">Resolved (15%)</span>
            </div>
            <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-gray-400"></span>
                <span class="text-sm">Closed (25%)</span>
            </div>
        </div>
    </a-card>
</template>
