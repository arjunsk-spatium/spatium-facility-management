<template>
  <div class="min-h-screen flex flex-col justify-between bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-300">
    <!-- Top Navigation Header -->
    <header class="w-full px-6 py-4 flex items-center justify-between border-b border-neutral-200/80 dark:border-neutral-800/80 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md sticky top-0 z-10">
      <div class="flex items-center space-x-3">
        <div class="h-9 w-9 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold shadow-sm">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div>
          <span class="text-base font-bold tracking-tight text-neutral-900 dark:text-white">Nexspace</span>
          <span class="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
            Facility Portal
          </span>
        </div>
      </div>

      <div class="flex items-center space-x-3">
        <button
          type="button"
          @click="toggleTheme"
          class="p-2 rounded-lg text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus:outline-none"
          :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <span v-if="isDark" class="text-sm">☀️</span>
          <span v-else class="text-sm">🌙</span>
        </button>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div class="w-full max-w-lg">
        <div class="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 text-center">
          <!-- Icon & Status Chip -->
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/50 mb-5">
            <ExclamationCircleOutlined class="text-3xl" />
          </div>

          <div class="inline-block mb-3 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/50">
            Workspace Not Found
          </div>

          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Tenant Not Registered
          </h1>

          <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
            We couldn't find an active workspace registration for the requested domain address.
          </p>

          <!-- Attempted Domain Callout Chip -->
          <div class="mt-6 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/80 text-left">
            <div class="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-1.5">
              <span>Attempted Domain</span>
              <span class="font-mono text-[11px] px-1.5 py-0.5 rounded bg-neutral-200/60 dark:bg-neutral-700/60 text-neutral-600 dark:text-neutral-300">
                HTTP 404
              </span>
            </div>
            <div class="font-mono text-sm font-semibold text-rose-600 dark:text-rose-400 break-all flex items-center space-x-2">
              <span>{{ attemptedHost }}</span>
            </div>
            <p class="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
              The subdomain <span class="font-semibold text-neutral-700 dark:text-neutral-300">{{ attemptedSubdomain || 'provided' }}</span> is not associated with any organization in Nexspace.
            </p>
          </div>

          <!-- Quick Try Another Subdomain Form -->
          <div class="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800 text-left">
            <label for="retry-subdomain-input" class="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-2">
              Try a different workspace
            </label>

            <form @submit.prevent="handleGoSubdomain" class="flex items-stretch rounded-xl border border-neutral-300 dark:border-neutral-700 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 overflow-hidden bg-neutral-50/50 dark:bg-neutral-800/40">
              <span class="inline-flex items-center px-3 text-xs text-neutral-400 dark:text-neutral-500 bg-neutral-100/70 dark:bg-neutral-800/80 border-r border-neutral-200 dark:border-neutral-700 font-mono select-none">
                {{ protocolPrefix }}
              </span>

              <input
                id="retry-subdomain-input"
                v-model="newSubdomain"
                type="text"
                placeholder="correct-workspace"
                autocomplete="off"
                spellcheck="false"
                class="flex-1 min-w-0 px-3 py-2.5 text-sm bg-transparent text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none font-medium"
              />

              <span class="hidden sm:inline-flex items-center px-2.5 text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100/70 dark:bg-neutral-800/80 border-l border-neutral-200 dark:border-neutral-700 font-mono select-none">
                .{{ displayBaseDomain }}
              </span>

              <button
                type="submit"
                :disabled="!cleanedNewSubdomain"
                class="px-4 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Go
              </button>
            </form>
          </div>

          <!-- Action Buttons -->
          <div class="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              @click="handleRetry"
              class="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center justify-center space-x-1.5"
            >
              <ReloadOutlined class="text-xs" />
              <span>Retry</span>
            </button>

            <button
              type="button"
              @click="emit('switch-to-finder')"
              class="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200/60 dark:border-primary-800/60 hover:bg-primary-100 dark:hover:bg-primary-900/60 transition-colors flex items-center justify-center space-x-1.5"
            >
              <SearchOutlined class="text-xs" />
              <span>Find Workspace</span>
            </button>
          </div>

          <!-- Contact admin footer -->
          <div class="mt-6 text-xs text-neutral-500 dark:text-neutral-400">
            If you believe this is an error, please reach out to your system administrator or
            <a href="mailto:support@nexspace.app" class="text-primary-600 dark:text-primary-400 hover:underline font-medium">
              contact support
            </a>.
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="w-full py-4 px-6 text-center text-xs text-neutral-400 dark:text-neutral-600 border-t border-neutral-200/40 dark:border-neutral-800/40">
      &copy; {{ currentYear }} Nexspace Facility Management. All rights reserved.
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ExclamationCircleOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons-vue';
import { extractDomainInfo, buildTenantUrl, type DomainInfo } from '../../composables/domainUtils';

const props = withDefaults(defineProps<{
  initialDomainInfo?: DomainInfo | null;
  errorMessage?: string | null;
}>(), {
  initialDomainInfo: null,
  errorMessage: null,
});

const emit = defineEmits<{
  (e: 'switch-to-finder'): void;
  (e: 'retry'): void;
}>();

const { isDark, toggleTheme } = useTheme();

const currentYear = new Date().getFullYear();
const newSubdomain = ref('');

const domainInfo = computed<DomainInfo>(() => {
  if (props.initialDomainInfo) {
    return props.initialDomainInfo;
  }
  if (typeof window !== 'undefined') {
    return extractDomainInfo(window.location.host, window.location.protocol);
  }
  return extractDomainInfo('xyz.nexspace.app', 'https:');
});

const attemptedHost = computed(() => {
  return domainInfo.value.fullHost || 'unknown';
});

const attemptedSubdomain = computed(() => {
  return domainInfo.value.subdomain;
});

const protocolPrefix = computed(() => {
  return domainInfo.value.isLocalhost ? 'http://' : 'https://';
});

const displayBaseDomain = computed(() => {
  return domainInfo.value.baseDomain || 'nexspace.app';
});

const cleanedNewSubdomain = computed(() => {
  return newSubdomain.value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
});

const handleGoSubdomain = () => {
  if (!cleanedNewSubdomain.value) return;
  const targetUrl = buildTenantUrl(cleanedNewSubdomain.value, domainInfo.value);
  if (targetUrl && typeof window !== 'undefined') {
    window.location.href = targetUrl;
  }
};

const handleRetry = () => {
  emit('retry');
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
};
</script>
