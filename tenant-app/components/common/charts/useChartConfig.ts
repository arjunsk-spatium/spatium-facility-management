import { computed } from 'vue';
import { useTheme } from '../../../composables/useTheme';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Filler,
} from 'chart.js';

// Register global components
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Filler
);

export const useChartConfig = () => {
    const { colorMode } = useTheme();

    const isDark = computed(() => {
         if (colorMode.value === 'dark') return true;
         if (colorMode.value === 'light') return false;
         if (import.meta.client) {
             return window.matchMedia('(prefers-color-scheme: dark)').matches;
         }
         return false;
    });

    const textColor = computed(() => isDark.value ? '#e5e5e5' : '#4b5563');
    const gridColor = computed(() => isDark.value ? '#404040' : '#e5e7eb');

    const commonOptions = computed(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: textColor.value,
                    font: {
                        family: "Inter, sans-serif"
                    }
                }
            },
            title: {
                 color: textColor.value,
                 font: {
                        family: "Inter, sans-serif",
                        weight: 'bold'
                 }
            },
            tooltip: {
                backgroundColor: isDark.value ? '#1f1f1f' : '#ffffff',
                titleColor: isDark.value ? '#ffffff' : '#000000',
                bodyColor: isDark.value ? '#e5e5e5' : '#4b5563',
                borderColor: gridColor.value,
                borderWidth: 1,
                padding: 10,
                boxPadding: 4
            }
        },
        scales: {
            x: {
                grid: {
                    color: gridColor.value,
                    tickColor: gridColor.value
                },
                ticks: {
                    color: textColor.value
                }
            },
            y: {
                grid: {
                    color: gridColor.value,
                    tickColor: gridColor.value
                },
                ticks: {
                    color: textColor.value
                }
            }
        }
    }));
    
    // Doughnut doesn't have scales
    const doughnutOptions = computed(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    color: textColor.value,
                    font: {
                         family: "Inter, sans-serif"
                    }
                }
            },
            tooltip: commonOptions.value.plugins.tooltip
        }
    }));

    return {
        commonOptions,
        doughnutOptions,
        isDark
    };
};
