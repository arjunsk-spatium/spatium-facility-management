<template>
    <a-card title="Bookings by Status" :bordered="false" class="shadow-sm h-full">
        <div class="flex items-center justify-center p-4">
            <!-- Simple CSS Donut Chart Mockup -->
            <div
                class="relative w-40 h-40 rounded-full bg-blue-100 dark:bg-gray-700 flex items-center justify-center border-8 border-green-500">
                <div
                    class="absolute inset-0 rounded-full border-8 border-gray-400 border-l-transparent border-t-transparent -rotate-45">
                </div>
                <div class="absolute inset-0 rounded-full border-8 border-red-500 border-r-transparent border-b-transparent rotate-90"
                    style="clip-path: polygon(0 0, 100% 0, 100% 20%, 0 20%);"></div>

                <div class="text-center z-10">
                    <div class="text-2xl font-bold dark:text-white">145</div>
                    <div class="text-xs text-gray-500">Total</div>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 gap-2 mt-4 px-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full bg-green-500"></span>
                    <span class="text-sm">Confirmed</span>
                </div>
                <span class="font-medium">85</span>
            </div>
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full bg-gray-400"></span>
                    <span class="text-sm">Completed</span>
                </div>
                <span class="font-medium">45</span>
            </div>
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full bg-red-500"></span>
                    <span class="text-sm">Cancelled</span>
                </div>
                <span class="font-medium">15</span>
            </div>
        </div>
    </a-card>
</template>
