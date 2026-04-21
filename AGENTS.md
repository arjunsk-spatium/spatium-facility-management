# Spatium Facility Management — Agent Guide

This document provides essential context for AI coding agents working on the Spatium Facility Management frontend monorepo. The reader is assumed to know nothing about the project.

---

## Project Overview

This is a **Nuxt 3** monorepo containing two separate Single-Page Applications (SPAs):

| App | Directory | Dev Port | Purpose |
|-----|-----------|----------|---------|
| **Tenant App** | `tenant-app/` | `4000` | Main tenant-facing application used by facility managers, front-desk staff, and company SPOCs. |
| **Admin Console** | `admin-console/` | `5000` | Administrative interface for super-admins to manage tenants, plans, and system settings. |

Both apps are **client-side rendered only** (`ssr: false`). They communicate with a shared backend API (configured per environment via `apiBaseUrl`).

---

## Technology Stack

- **Framework:** Nuxt 3 (`^4.x`) with Vue 3 (`^3.5.x`) and TypeScript
- **State Management:** Pinia (`@pinia/nuxt`)
- **UI Library:** Ant Design Vue (`^4.2.x`) — globally registered in a plugin
- **Styling:** Tailwind CSS v4 (`^4.1.x`) via `@tailwindcss/vite`
- **Font:** Fira Sans (loaded from Google Fonts)
- **Charts:** Chart.js / vue-chartjs, @ant-design/charts, @antv/g2plot
- **Excel Export:** xlsx
- **Date Utilities:** dayjs
- **Testing:**
  - Unit/Component: Vitest + `@nuxt/test-utils` + `@vue/test-utils`
  - E2E (tenant-app only): Playwright
  - DOM Environment: `happy-dom` (admin-console), `nuxt` environment (tenant-app)

---

## Project Structure

### Root Level

```
/
├── admin-console/          # Admin Console SPA
├── tenant-app/             # Tenant App SPA
├── dev-runner.js           # Node script to run both apps concurrently
├── README.md               # Human-facing quick start
└── AGENTS.md               # This file
```

**There is no root `package.json` workspace configuration.** Each app is an isolated Node project with its own `package.json` and `node_modules`. Dependencies are installed separately in each directory.

### Tenant App (`tenant-app/`)

```
tenant-app/
├── app/                    # Nuxt source root (srcDir)
│   ├── app.vue             # Root component with <a-config-provider> and tenant loader
│   ├── components/         # Page-level components (charts)
│   ├── layouts/            # auth.vue, default.vue, public.vue
│   ├── middleware/         # auth.ts, module-guard.global.ts
│   ├── pages/              # File-based routing
│   ├── plugins/            # antd.ts, api.ts, tenant-loader.ts
│   └── assets/styles/main.css
├── components/             # Shared/global Vue components (Sidebar, widgets, forms)
├── composables/            # Composables and service layers
├── stores/                 # Pinia stores
├── server/                 # Nitro server routes & middleware (API proxy)
├── e2e/                    # Playwright end-to-end tests
├── tests/                  # Vitest component/integration tests
├── package.json
├── nuxt.config.ts
├── vitest.config.ts
├── playwright.config.ts
└── tsconfig.json
```

### Admin Console (`admin-console/`)

```
admin-console/
├── app/                    # Nuxt source root (srcDir)
│   ├── app.vue             # Root component with <a-config-provider>
│   ├── components/         # UI components, forms, data views
│   ├── composables/        # API service composables
│   ├── layouts/            # auth.vue, default.vue
│   ├── pages/              # File-based routing
│   ├── plugins/            # antd.ts, auth-interceptor.ts
│   └── assets/styles/main.css
├── stores/                 # Pinia stores
├── package.json
├── nuxt.config.ts
├── vitest.config.ts
└── tsconfig.json
```

### Key Directory Conventions

- **`app/`** is the Nuxt `srcDir` in both apps. Auto-imports for composables and stores are configured relative to this directory.
- **Tenant app** keeps `components/`, `composables/`, and `stores/` at the project root (outside `app/`) and registers them via `nuxt.config.ts` (`imports.dirs`, `components` array).
- **Admin console** keeps most code inside `app/` but also has a root-level `stores/` directory that is imported via `imports.dirs: ['../stores']`.

---

## Build and Development Commands

### Run Both Apps Concurrently (Recommended)

```bash
node dev-runner.js
```

This starts the tenant app on `http://localhost:4000` and the admin console on `http://localhost:5000`. It checks if ports are already in use and skips already-running apps.

### Individual Apps

**Tenant App:**
```bash
cd tenant-app
npm install
npm run dev      # localhost:4000
npm run build    # Production build
npm run generate # Static generation
npm run preview  # Preview production build
npm run test     # Run Vitest unit/component tests
npm run test:e2e # Run Playwright E2E tests
```

**Admin Console:**
```bash
cd admin-console
npm install
npm run dev      # localhost:5000
npm run build
npm run generate
npm run preview
```

**Note:** Admin console tests are run via `npx vitest` (no npm script alias in `package.json`).

---

## Runtime Configuration & Environment

Both apps use `.env` files (not committed) and `runtimeConfig.public` in `nuxt.config.ts`.

### Tenant App Public Runtime Config

- `apiBaseUrl` — Backend API base URL
- `tenantAdminAppId` — App ID for admin login flows
- `tenantClientAppId` — App ID for client login flows

### Admin Console Public Runtime Config

- `apiBaseUrl` — Backend API base URL
- `adminConsoleAppId` — App ID for admin console login

### Tenant App `.env` Workaround

The `nuxt.config.ts` manually reads `.env` with `fs.readFileSync` and injects values into `process.env` to work around stale env variable issues during dev. Be cautious when modifying this.

---

## Authentication & Security

### OTP-Based Login Flow

Both apps use an email + OTP (one-time password) login system:

1. User enters email → `authStore.requestOtp(email)`
2. Backend sends OTP to email
3. User enters OTP → `authStore.login(email, otp, appId)`
4. Backend returns JWT `access` token and `refresh` token

### Token Storage

- **Tenant App:** `localStorage` keys: `access_token`, `refresh_token`, `auth_user`, `tenant_id`
- **Admin Console:** `localStorage` keys: `admin_auth_token`, `admin_auth_refresh_token`, `admin_auth_user`

### Automatic Token Refresh

- **Tenant App:** Implemented in `app/plugins/api.ts` using raw `fetch`. On 401, it calls `authStore.refreshAccessToken()`, then retries the request. If refresh fails, it logs the user out.
- **Admin Console:** Implemented in `app/plugins/auth-interceptor.ts` using `$fetch.create()` with `onResponseError`. It queues concurrent requests during refresh to prevent race conditions.
- **Tenant App also has `composables/useAuthFetch.ts`** as an alternative authenticated fetch wrapper.

### Auth Middleware

- `tenant-app/app/middleware/auth.ts` — Redirects unauthenticated users to `/login`
- `tenant-app/app/middleware/module-guard.global.ts` — Restricts access to module routes based on the user's enabled modules (e.g., `/companies`, `/visitors`, `/helpdesk`). Redirects to `/dashboard` if unauthorized.

### Tenant Isolation

The tenant app resolves the tenant by domain on load (`tenant-loader.ts` plugin). It:
1. Fetches tenant config via `getTenantByDomain()`
2. Stores `tenant_id` in `localStorage` and as a cookie (`tenant_id`)
3. Injects `X-TENANT-ID` header into all API calls
4. Dynamically sets primary color, logo, favicon, and page title

Server-side proxy middleware (`server/middleware/proxy.ts`) injects `X-TENANT-ID` from the cookie if the header is missing.

---

## API Communication Patterns

### Preferred API Client

**Tenant App:** Use the globally provided `$api` plugin:
```ts
const { $api } = useNuxtApp()
const data = await $api<any>('/api/endpoint', { method: 'GET' })
```

**Admin Console:** Use the globally provided `$api` (ofetch instance with interceptors):
```ts
const { $api } = useNuxtApp()
const data = await $api('/api/endpoint')
```

### Service Composables

API calls are organized in service composables:
- `tenant-app/composables/tenantService.ts`
- `tenant-app/composables/companyService.ts`
- `tenant-app/composables/facilityService.ts`
- `tenant-app/composables/helpdeskService.ts`
- `tenant-app/composables/meetingRoomService.ts`
- `tenant-app/composables/visitorService.ts`
- `tenant-app/composables/userService.ts`
- `admin-console/app/composables/tenantService.ts`
- `admin-console/app/composables/planService.ts`
- `admin-console/app/composables/userService.ts`

Naming convention: `useXxxService()` returning an object of async functions.

### Server Proxy Routes (Tenant App)

Some backend endpoints are proxied through Nitro server routes under `server/routes/api/portal/` to avoid CORS or to inject headers. Examples:
- `server/routes/api/portal/modules/[...].ts`
- `server/routes/api/portal/visitors/public/[...].ts`

---

## State Management (Pinia)

### Store Conventions

- Stores are defined with `defineStore` using the Options API style (`state`, `getters`, `actions`).
- Stores auto-hydrate from `localStorage` on initialization (guarded with `typeof window !== 'undefined'`).
- Stores persist critical state back to `localStorage` in actions.

### Key Stores

**Tenant App:**
- `useAuthStore` — Auth state, tokens, modules, permissions
- `useTenantStore` — Current tenant config, branding, loading state
- `useCompanyStore`, `useFacilityStore`, `useHelpdeskStore`, `useMeetingRoomStore`, `useVisitorStore` — Feature-specific data

**Admin Console:**
- `useAuthStore` — Admin auth state
- `useTenantStore` — Tenant listing and management
- `usePlanStore` — Subscription plans

---

## Styling & Design System

### Tailwind CSS v4

Both apps use Tailwind CSS v4 with the Vite plugin. Configuration is done entirely in CSS via `@theme` inside `assets/styles/main.css` (no `tailwind.config.js`).

### Design Tokens

Custom CSS variables are defined in `main.css` under `@theme`:
- `--color-primary-50` through `--color-primary-950`
- `--color-success-*`, `--color-warning-*`, `--color-danger-*`
- `--color-neutral-50` through `--color-neutral-950`
- `--font-sans`, `--font-mono`
- `--shadow-card`, `--shadow-elevated`
- `--radius-sm` through `--radius-full`

### Dark Mode

Dark mode is class-based (`dark` class on `<html>`). The `useTheme()` composable manages switching between `light`, `dark`, and `system` modes, persisting preference to `localStorage`.

### Component CSS Classes

A library of reusable component classes is defined in `main.css` under `@layer components`:
- `.card`, `.card-header`, `.card-body`, `.card-footer`
- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-danger`, `.btn-success`
- `.input`, `.label`
- `.badge`, `.badge-primary`, `.badge-success`, etc.
- `.sidebar`, `.sidebar-nav-item`, `.sidebar-section-title`
- `.table`, `.table-container`
- `.modal`, `.modal-backdrop`, `.modal-header`, `.modal-body`, `.modal-footer`
- `.toast`, `.toast-info`, `.toast-success`, `.toast-error`
- `.spinner`, `.skeleton`

Both apps share nearly identical design system CSS, though there are minor differences in selection colors.

### Scoped Styles vs Utility Classes

- **Tenant app** heavily uses Tailwind utility classes in templates.
- **Admin console** mixes Tailwind utilities with scoped `<style>` blocks (especially on the login page).

---

## Testing Strategy

### Unit / Component Tests (Vitest)

- **Config:** `vitest.config.ts` in each app
- **Tenant app:** Uses `environment: 'nuxt'` with `globals: true`
- **Admin console:** Uses `environment: 'happy-dom'`
- **Test locations:**
  - Co-located: `[Component].spec.ts` or `[composable].test.ts` next to source files
  - Dedicated folder: `tenant-app/tests/` for broader integration tests

### E2E Tests (Playwright — Tenant App Only)

- **Config:** `playwright.config.ts`
- **Test directory:** `tenant-app/e2e/`
- **Base URL:** `http://localhost:4000`
- **Browsers:** Chromium, Firefox, WebKit
- **CI settings:** `workers: 1`, `retries: 2`

### Test-Driven Development Requirement

The project enforces TDD via `.agent/skills/test_driven_development/SKILL.md`:
- When creating/modifying a component or feature, you **must** create or update the corresponding test.
- Tests should be written before or immediately after the implementation.
- Mock external API calls with `vi.mock()` — never make real network requests in tests.

### Running Tests

```bash
# Tenant app unit/component tests
cd tenant-app && npx vitest

# Tenant app E2E tests (requires dev server)
cd tenant-app && npm run test:e2e

# Admin console tests
cd admin-console && npx vitest
```

---

## Module System (Tenant App)

The tenant app uses a module-based access control system. Available modules are defined statically in `composables/useModuleRegistry.ts`:

- `dashboard`
- `visitors` (with insights, list)
- `companies` (with insights, list)
- `helpdesk` (with insights, tickets)
- `facilities` (with insights, list)
- `meeting_rooms` (with insights, list, bookings)
- `users`
- `configure`
- `frontdesk`
- `spoc_dashboard`, `spoc_visitors`, `spoc_employees`

The `module-guard.global.ts` middleware checks `authStore.hasModule(moduleKey)` before allowing navigation to restricted routes.

---

## Code Style Guidelines

### Language & Formatting

- **Language:** TypeScript with Vue SFCs (`<script setup lang="ts">`)
- **Quotes:** Mixed (tenant app leans toward single quotes; admin console uses single quotes). Follow the dominant style in the file you are editing.
- **Semicolons:** Mixed. Follow the dominant style in the file.
- **Indentation:** 4 spaces (admin console), 2 spaces (tenant app Vue templates). Follow existing file conventions.

### Naming Conventions

- **Components:** PascalCase (e.g., `CompanyForm.vue`, `SidebarMenu.vue`)
- **Composables:** camelCase, prefixed with `use` (e.g., `useTheme`, `useTenantService`)
- **Stores:** camelCase, prefixed with `use`, suffixed with `Store` (e.g., `useAuthStore`)
- **Service composables:** `useXxxService` (e.g., `useCompanyService`)
- **Pages:** kebab-case directories, `index.vue` for directory roots (e.g., `pages/companies/index.vue`)
- **Tests:** `[name].spec.ts` for components, `[name].test.ts` for composables/stores, `[name].nuxt.test.ts` for Nuxt integration tests

### Imports & Auto-Imports

- Nuxt auto-imports are heavily used for Vue APIs (`ref`, `computed`, `onMounted`) and Nuxt APIs (`useRuntimeConfig`, `useNuxtApp`, `navigateTo`).
- Pinia stores are auto-imported via `@pinia/nuxt`.
- Tenant app custom composables and stores are auto-imported via `imports.dirs` in `nuxt.config.ts`.
- Explicit imports are acceptable when clarity is needed.

### Vue Patterns

- Use `<script setup lang="ts">` for all new components.
- Use `definePageMeta({ layout: 'default' })` to specify layouts.
- Use `useHead()` and `useHeadSafe()` for dynamic head metadata.
- Ant Design Vue components are globally registered; no need to import them.

---

## Deployment Notes

- Both apps are built with `nuxt generate` (static generation) or `nuxt build` (SSR disabled, so effectively SPA).
- The `dist` symlink in each app points to `.output/public`.
- The backend URL is injected at build time or runtime via `runtimeConfig.public.apiBaseUrl`.
- **Do not commit `.env` files.** They are gitignored.

---

## Common Pitfalls for Agents

1. **No root workspace:** Always `cd` into the correct app directory before running npm commands.
2. **SSR disabled:** Both apps are SPAs. `localStorage` is safe to access, but still guard with `typeof window !== 'undefined'` or `import.meta.client` where appropriate.
3. **Two different auth systems:** Tenant app and admin console have separate auth stores, token keys, and API interceptors. Do not mix them.
4. **Multiple API fetch patterns:** Tenant app has `$api` plugin, `useAuthFetch`, and raw `$fetch`. The `$api` plugin is the canonical choice for tenant app.
5. **Tenant context is mandatory:** In the tenant app, most API calls require `X-TENANT-ID`. The `$api` plugin injects this automatically from the tenant store or localStorage.
6. **Testing requirement:** New components and features must have accompanying tests. See the TDD skill in `.agent/skills/test_driven_development/SKILL.md`.
7. **Tailwind v4:** There is no `tailwind.config.js`. All theming is in `assets/styles/main.css` using `@theme` and `@variant`.
8. **Port conflicts:** If `dev-runner.js` says a port is in use, the app may already be running in another terminal.
