const isMobile = ref(false);
const isOpen = ref(false);
const collapsed = ref(false);

export const useSidebar = () => {
    // Actions
    const toggleMobileSidebar = () => {
        isOpen.value = !isOpen.value;
    };

    const closeMobileSidebar = () => {
        isOpen.value = false;
    };

    const toggleDesktopCollapse = () => {
        collapsed.value = !collapsed.value;
    };

    const setCollapsed = (value: boolean) => {
        collapsed.value = value;
    };

    // Screen size detection
    const checkMobile = () => {
        if (import.meta.client) {
            isMobile.value = window.innerWidth < 768;
            if (!isMobile.value) {
                isOpen.value = false;
            }
        }
    };

    onMounted(() => {
        if (import.meta.client) {
            checkMobile();
            window.addEventListener('resize', checkMobile);
        }
    });

    onUnmounted(() => {
        if (import.meta.client) {
            window.removeEventListener('resize', checkMobile);
        }
    });

    return {
        isMobile,
        isOpen,
        collapsed,
        toggleMobileSidebar,
        closeMobileSidebar,
        toggleDesktopCollapse,
        setCollapsed
    };
};
