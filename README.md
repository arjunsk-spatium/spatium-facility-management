# Spatium Facility Management

This is a monorepo containing the Frontend applications for the Spatium Facility Management system.

## Project Structure

The project consists of two main applications:

- **Admin Console** (`/admin-console`): The administrative interface for managing the facility management system.
- **Tenant App** (`/tenant-app`): The application used by tenants to interact with facility services.

## Prerequisites

- Node.js (Latest LTS recommended)
- npm (or pnpm/yarn)

## Setup

Navigate to each application directory and install dependencies:

```bash
# Install dependencies for Admin Console
cd admin-console
npm install

# Install dependencies for Tenant App
cd ../tenant-app
npm install
```

## Running the Applications

### Concurrent Development (Recommended)

You can run both applications simultaneously using the provided runner script:

```bash
node dev-runner.js
```

This will start:
- **Tenant App** on `http://localhost:4000`
- **Admin Console** on `http://localhost:5000`

### Individual Execution

You can also run each application separately:

**Admin Console:**
```bash
cd admin-console
npm run dev
# Runs on http://localhost:5000
```

**Tenant App:**
```bash
cd tenant-app
npm run dev
# Runs on http://localhost:4000
```

## Technologies

- **Framework:** Nuxt 3
- **State Management:** Pinia
- **UI Framework:** Ant Design Vue
- **Styling:** Tailwind CSS
