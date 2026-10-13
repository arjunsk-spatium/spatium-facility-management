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
          <span class="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300 border border-primary-200/50 dark:border-primary-800/50">
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
        <div class="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8">
          <!-- Icon & Header -->
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-900/60 mb-4">
              <GlobalOutlined class="text-2xl" />
            </div>
            <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Find your workspace
            </h1>
            <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Enter your organization's registered subdomain to access your facility portal.
            </p>
          </div>

          <!-- Subdomain Form -->
          <form @submit.prevent="handleSubmit" class="space-y-5">
            <div>
              <label for="subdomain-input" class="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-2">
                Workspace Subdomain
              </label>

              <!-- Unified input container -->
              <div
                class="flex items-stretch rounded-xl border transition-all duration-200 overflow-hidden bg-neutral-50/50 dark:bg-neutral-800/40"
                :class="[
                  errorMessage
                    ? 'border-red-400 dark:border-red-500 ring-2 ring-red-400/20'
                    : 'border-neutral-300 dark:border-neutral-700 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20'
                ]"
              >
                <span class="inline-flex items-center px-3.5 text-xs text-neutral-400 dark:text-neutral-500 bg-neutral-100/70 dark:bg-neutral-800/80 border-r border-neutral-200 dark:border-neutral-700 select-none font-mono">
                  {{ protocolPrefix }}
                </span>

                <input
                  id="subdomain-input"
                  v-model="subdomain"
                  type="text"
                  placeholder="your-workspace"
                  autocomplete="off"
                  autofocus
                  spellcheck="false"
                  class="flex-1 min-w-0 px-3.5 py-3 text-sm bg-transparent text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none font-medium"
                  @input="handleInput"
                />

                <span class="inline-flex items-center px-3.5 text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100/70 dark:bg-neutral-800/80 border-l border-neutral-200 dark:border-neutral-700 select-none font-mono">
                  .{{ displayBaseDomain }}
                </span>
              </div>

              <!-- Error message -->
              <p v-if="errorMessage" class="mt-2 text-xs text-red-500 dark:text-red-400 flex items-center space-x-1">
                <span>⚠️</span>
                <span>{{ errorMessage }}</span>
              </p>
            </div>

            <!-- Target URL Preview -->
            <div v-if="cleanedSubdomain" class="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 text-xs flex items-center justify-between">
              <span class="text-neutral-500 dark:text-neutral-400">Target Address:</span>
              <span class="font-mono text-primary-600 dark:text-primary-400 font-semibold truncate ml-2">
                {{ previewUrl }}
              </span>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="!isValid"
              class="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-semibold text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed"
              :class="isValid ? 'bg-primary-600 hover:bg-primary-700 active:scale-[0.99]' : 'bg-neutral-400 dark:bg-neutral-700'"
            >
              <span>Continue to Workspace</span>
              <ArrowRightOutlined class="text-xs" />
            </button>
          </form>

          <!-- Help and info footer -->
          <div class="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-800 text-center">
            <p class="text-xs text-neutral-500 dark:text-neutral-400">
              Need help finding your organization subdomain?
            </p>
            <p class="mt-1 text-xs text-neutral-600 dark:text-neutral-300">
              Check your invite email or reach out to your facility administrator.
            </p>
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
import { GlobalOutlined, ArrowRightOutlined } from '@ant-design/icons-vue';
import { extractDomainInfo, buildTenantUrl, type DomainInfo } from '../../composables/domainUtils';

const props = withDefaults(defineProps<{
  initialDomainInfo?: DomainInfo | null;
}>(), {
  initialDomainInfo: null,
});

const { isDark, toggleTheme } = useTheme();

const currentYear = new Date().getFullYear();
const subdomain = ref('');
const errorMessage = ref('');

// Resolve current domain info
const domainInfo = computed<DomainInfo>(() => {
  if (props.initialDomainInfo) {
    return props.initialDomainInfo;
  }
  if (typeof window !== 'undefined') {
    return extractDomainInfo(window.location.host, window.location.protocol);
  }
  return extractDomainInfo('nexspace.app', 'https:');
});

const protocolPrefix = computed(() => {
  return domainInfo.value.isLocalhost ? 'http://' : 'https://';
});

const displayBaseDomain = computed(() => {
  return domainInfo.value.baseDomain || 'nexspace.app';
});

const cleanedSubdomain = computed(() => {
  return subdomain.value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
});

const isValid = computed(() => {
  const sub = cleanedSubdomain.value;
  return sub.length >= 2 && !sub.startsWith('-') && !sub.endsWith('-');
});

const previewUrl = computed(() => {
  if (!cleanedSubdomain.value) return '';
  return buildTenantUrl(cleanedSubdomain.value, domainInfo.value);
});

const handleInput = () => {
  errorMessage.value = '';
};

const handleSubmit = () => {
  if (!cleanedSubdomain.value) {
    errorMessage.value = 'Please enter a subdomain';
    return;
  }

  if (cleanedSubdomain.value.length < 2) {
    errorMessage.value = 'Subdomain must be at least 2 characters long';
    return;
  }

  if (cleanedSubdomain.value.startsWith('-') || cleanedSubdomain.value.endsWith('-')) {
    errorMessage.value = 'Subdomain cannot start or end with a hyphen';
    return;
  }

  const targetUrl = buildTenantUrl(cleanedSubdomain.value, domainInfo.value);
  if (targetUrl && typeof window !== 'undefined') {
    window.location.href = targetUrl;
  }
};
</script>
