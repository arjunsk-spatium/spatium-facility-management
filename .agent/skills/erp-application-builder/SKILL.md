---
name: erp-application-builder
description: Specialized skill for analyzing, designing, planning, and building enterprise ERP applications with deep coverage of Financial Management, Commercials / Sales and Contracts, and Space / Property / Facility Rental. Use when designing, architecting, or implementing ERP systems, modules, or workflows; defining enterprise roles, granular permissions, and action guards; enforcing Segregation of Duties (SoD), financial controls, and lease lifecycles; configuring multi-company and multi-property isolation; or generating role-permission-action matrices, ERP database schemas, and audit logging frameworks.
---
# ERP Application Builder

Comprehensive guide for analyzing, designing, planning, and implementing modular Enterprise Resource Planning (ERP) applications with strict security, granular role-based and attribute-based access control, Segregation of Duties (SoD), and immutable audit trails.

## When to Use

Use this skill when:

- Analyzing business requirements and designing end-to-end ERP solutions.
- Defining domain models, workflows, and authorization architectures for Financial Management, Commercials / Sales and Contracts, and Space / Property / Facility Rental.
- Establishing enterprise security matrices covering standard roles, granular permissions (resource:action), and custom business actions.
- Enforcing Segregation of Duties (SoD), multi-level approvals, and financial transaction controls.
- Designing multi-tenancy, multi-company, multi-branch, and multi-property scoping hierarchies.
- Specifying database schemas for ERP entities, security models, and immutable audit logs.
- Generating developer-ready user stories, authorization policies, and implementation roadmaps.

## Core Architectural Principles

- **Least Privilege**: Grant only permissions required for explicit job responsibilities.
- **Segregation of Duties (SoD)**: Enforce structural separation between transaction creation, approval, and execution to prevent fraud and errors.
- **Immutable Audit Trails**: Record every insert, update, soft delete, status transition, and financial entry with user, timestamp, prior state, new state, and client metadata.
- **Hierarchical Scope Isolation**: Scope all permissions and queries by Tenant, Company/Legal Entity, Branch/Region, or Property/Facility.
- **Hybrid RBAC + ABAC**: Use Role-Based Access Control (RBAC) for coarse feature permissions and Attribute-Based Access Control (ABAC) for row-level scoping, threshold limits, and status guards.

## Module 1: Financial Management

### Standard Roles and Responsibilities

- **System Admin / ERP Admin**: Manages tenant setup, chart of accounts templates, integrations, and user-role provisioning. Cannot post financial transactions.
- **Finance Manager / Controller**: Supervises general ledger, defines fiscal periods, reconciles accounts, and approves journal entries and adjustments.
- **Accountant / Bookkeeper**: Prepares journal entries, posts recurring entries, and manages fixed assets and depreciation.
- **Accounts Payable (AP) Clerk**: Records supplier bills, performs 3-way matching (PO, receipt, bill), and prepares payment batches.
- **Accounts Receivable (AR) Clerk**: Generates customer invoices, issues credit memos, records receipts, and manages collections.
- **Cashier / Treasury**: Executes disbursements, manages bank accounts, records cash receipts, and processes wire transfers.
- **Auditor**: Possesses read-only access to all financial records, audit logs, and trial balances with dedicated audit reporting views.
- **CFO / High-Level Approver**: Authorizes high-value payments, write-offs exceeding manager limits, fiscal year closing, and policy changes.

### Roles, Permissions, and Actions Matrix

| Role | Core Resources | Granular Permissions (resource:action) | Special Business Actions Allowed |
| :--- | :--- | :--- | :--- |
| ERP Admin | sys_config, user, role | `sys:manage`, `user:assign_role`, `currency:configure` | Lock system for fiscal maintenance, configure fiscal calendars |
| Controller | gl, journal, period, report | `gl:read`, `journal:approve`, `period:open_close`, `report:view_all` | Reopen closed period (with CFO dual sign-off), post adjusting entries |
| Accountant | gl, journal, asset | `journal:create`, `journal:edit_draft`, `asset:calculate_depr` | Post standard journal, run depreciation batch |
| AP Clerk | bill, vendor, po_match | `bill:create`, `bill:match_3way`, `vendor:read` | Flag bill dispute, submit payment batch proposal |
| AR Clerk | invoice, customer, payment_receipt | `invoice:create`, `invoice:send`, `receipt:record`, `credit_memo:request` | Apply customer credit, generate aging dunning notices |
| Treasury | bank_account, payment_run | `payment_run:execute`, `bank_stmt:import`, `wire:initiate` | Void issued checks, release wire batches |
| Auditor | all financial tables | `gl:read`, `journal:read`, `audit_log:read`, `tax:read` | Export read-only audit package, run ledger integrity check |
| CFO | payment_run, write_off, period | `payment_run:authorize`, `write_off:approve`, `period:close_year` | Authorize disbursements > threshold, approve bad debt write-offs |

### Critical Segregation of Duties (SoD) Rules

- **AP Bill Creation vs. Payment Execution**: A user who creates or edits a vendor bill cannot approve or release payment for that bill.
- **Bank Reconciliation vs. Cash Disbursement**: The user reconciling bank statements cannot have cash disbursement or check-writing permissions.
- **Journal Entry Creation vs. Posting**: Users entering manual journal entries cannot approve or post their own entries (dual-control principle).
- **Credit Memo Issuance vs. AR Receipt Application**: Staff issuing credit memos cannot unilaterally write off balances against cash receipts.

## Module 2: Commercials / Sales & Contracts

### Standard Roles and Responsibilities

- **Sales Manager**: Sets team quotas, assigns sales territories, reviews pipeline, and approves discount exceptions within tier limits.
- **Sales Executive / Account Manager**: Manages leads, generates opportunities, drafts quotes, and submits contract proposals.
- **Contract Administrator**: Reviews contract terms, ensures regulatory compliance, tracks expirations, and governs contract templates.
- **Pricing Manager**: Governs master price books, volume tiers, seasonal surcharges, and discount tier policies.
- **Commercial Approver**: Evaluates non-standard legal terms, payment term waivers, and high-tier margin exceptions.
- **Customer Success / Account Owner**: Tracks post-sale renewals, upsells, amendments, and SLA performance metrics.

### Roles, Permissions, and Actions Matrix

| Role | Core Resources | Granular Permissions (resource:action) | Special Business Actions Allowed |
| :--- | :--- | :--- | :--- |
| Sales Exec | lead, opp, quote | `lead:manage`, `opp:manage`, `quote:create`, `quote:edit_draft` | Request discount override, submit quote to customer |
| Sales Manager | quote, discount, team_opp | `quote:approve_tier1`, `team_opp:reassign`, `target:track` | Override discount <= 15%, reassign stalled deal |
| Pricing Mgr | price_book, discount_rule | `price_book:manage`, `discount_rule:configure`, `currency_rate:edit` | Publish seasonal rate card, deactivate pricing tier |
| Contract Admin | contract, clause_library | `contract:create`, `contract:review`, `contract:amend`, `template:manage` | Mark contract legally cleared, trigger digital signature |
| Commercial Approver | contract, quote, credit_limit | `contract:authorize`, `discount:approve_tier2`, `credit:override` | Approve discount > 15%, approve non-standard liability clauses |
| Customer Success | contract, renewal, sla | `contract:read`, `renewal:initiate`, `sla:record`, `amendment:request` | Initiate early renewal, log SLA violation credit request |

### Commercial Governance & Workflow Rules

- **Discount Threshold Enforcement**:
  - 0% to 5%: Sales Executive auto-authorized.
  - 5.1% to 15%: Requires Sales Manager approval.
  - Greater than 15%: Requires dual approval from Sales Manager and Commercial Approver / CFO.
- **Contract Activation**: A contract cannot transition to `ACTIVE` without digital signatures from both parties and legal sign-off from Contract Admin.
- **Billing Schedule Generation**: Activating a contract must atomically generate unbilled invoice milestones or recurring billing schedules in the finance ledger.

## Module 3: Space / Property / Facility Rental

### Standard Roles and Responsibilities

- **Portfolio Manager**: Oversees multi-property performance, asset valuations, target occupancy rates, and portfolio-wide rate structures.
- **Property / Facility Manager**: Manages daily property operations, space readiness, vendor contracts, and facility incidents.
- **Leasing Manager**: Negotiates lease agreements, manages tenant onboarding/offboarding, and oversees unit availability.
- **Space Administrator**: Configures space hierarchies (buildings, floors, suites, desks, common areas) and amenity catalogs.
- **Maintenance Supervisor**: Dispatches work orders, oversees preventive maintenance schedules, and inspects facility repairs.
- **Facility Ops / Front Desk**: Handles day passes, visitor check-ins, parcel management, and urgent operational requests.
- **Tenant / Occupant (Portal)**: Self-service access to view leases, download invoices, pay rent, book bookable spaces, and log tickets.

### Roles, Permissions, and Actions Matrix

| Role | Core Resources | Granular Permissions (resource:action) | Special Business Actions Allowed |
| :--- | :--- | :--- | :--- |
| Portfolio Mgr | portfolio, property, rent_roll | `portfolio:read_all`, `property:create`, `rate_card:approve` | Approve property master budget, adjust benchmark rates |
| Property Mgr | property, facility, incident | `property:manage`, `incident:resolve`, `vendor_contract:review` | Authorize facility repairs up to budget, approve move-ins |
| Leasing Mgr | unit, lease, tenant | `unit:reserve`, `lease:draft`, `lease:execute`, `tenant:onboard` | Terminate lease on breach, approve lease concessions |
| Space Admin | space_hierarchy, amenity | `unit:configure`, `meter:assign`, `amenity:configure` | Split/merge units, recalculate rentable vs. usable area |
| Maintenance Sup | work_order, vendor, inventory | `work_order:assign`, `work_order:close`, `spare:consume` | Approve emergency work order, sign off completed work |
| Front Desk | badge, visitor, parcel | `visitor:checkin`, `parcel:log`, `keycard:issue`, `amenity:verify` | Issue emergency access pass, receive certified delivery |
| Tenant User | self_lease, ticket, booking | `self_lease:read`, `self_bill:pay`, `ticket:create`, `booking:create` | Book meeting room, dispute utility allocation, request maintenance |

### Property and Rental Life-Cycle Governance

- **Move-In / Move-Out Checklist Guard**: A lease cannot transition to `OCCUPIED` until move-in inspection is signed off by both Property Manager and Tenant.
- **Deposit Handling SoD**: Staff negotiating lease terms cannot process or approve security deposit refunds. Refunds require clearance from Maintenance (damages) and Finance (outstanding arrears).
- **Utility Meter Reconciliation**: Utility charges based on sub-metering require automated validation against master utility bills before posting to tenant billing ledgers.

## Cross-Cutting Security & Authorization Architecture

### 1. Hybrid RBAC + ABAC Architecture

Combine Role-Based Access Control for functional permissions with Attribute-Based Access Control for contextual scoping:

```
Authorization Decision =
  HasRolePermission(User.Roles, Resource.Action)
  AND InEntityScope(User.AssignedScopes, Target.ScopeHierarchy)
  AND EvaluatesConditions(User.Attributes, Target.Attributes, Environment)
```

- **Scope Hierarchy**:
  - `Organization (Tenant)`
    - `Company / Legal Entity`
      - `Branch / Region`
        - `Property / Facility`
          - `Building / Zone`
            - `Floor / Unit`

### 2. Core Relational Schema Blueprint

```sql
-- 1. Security & RBAC
CREATE TABLE roles (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    module VARCHAR(50) NOT NULL,
    description TEXT
);

CREATE TABLE permissions (
    id VARCHAR(64) PRIMARY KEY, -- e.g. 'journal:post', 'lease:execute'
    module VARCHAR(50) NOT NULL,
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL
);

CREATE TABLE role_permissions (
    role_id VARCHAR(64) REFERENCES roles(id),
    permission_id VARCHAR(64) REFERENCES permissions(id),
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_role_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role_id VARCHAR(64) REFERENCES roles(id),
    company_id UUID NOT NULL,
    property_id UUID, -- NULL indicates all properties within company
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Immutable Audit Log
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    company_id UUID NOT NULL,
    user_id UUID NOT NULL,
    action VARCHAR(64) NOT NULL,
    resource_type VARCHAR(64) NOT NULL,
    resource_id VARCHAR(64) NOT NULL,
    old_state JSONB,
    new_state JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_user_action ON audit_logs(user_id, action);
```

### 3. Action Guard & Authorization Middleware Pattern

Implement authorization gates at the API/Service boundary using declarative checks:

```typescript
interface AccessContext {
  userId: string;
  roles: string[];
  companyId: string;
  propertyIds: string[];
}

export function authorize(requiredPermission: string, options?: {
  scopeParam?: 'companyId' | 'propertyId';
  amountField?: string;
  maxAmountLimit?: number;
}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ctx: AccessContext = req.userContext;

    // 1. RBAC check
    const hasPerm = await checkUserPermission(ctx.userId, requiredPermission);
    if (!hasPerm) return res.status(403).json({ error: 'Forbidden: Missing permission' });

    // 2. ABAC Scope check
    if (options?.scopeParam === 'propertyId') {
      const targetPropertyId = req.params.propertyId || req.body.propertyId;
      if (targetPropertyId && !ctx.propertyIds.includes(targetPropertyId)) {
        return res.status(403).json({ error: 'Forbidden: Out of property scope' });
      }
    }

    // 3. ABAC Limit check
    if (options?.amountField && options.maxAmountLimit) {
      const amount = req.body[options.amountField];
      if (amount > options.maxAmountLimit) {
        return res.status(403).json({ error: 'Forbidden: Amount exceeds approval authority' });
      }
    }

    next();
  };
}
```

## Step-by-Step Implementation Workflow

When building an ERP solution using this skill, execute these steps:

1. **Discovery & Scope Analysis**:
   - Determine target modules (Finance, Commercials, Space Rental, or combined).
   - Document the organizational hierarchy (holding entity, legal entities, branches, properties).
   - Conduct roles and permissions workshops with stakeholders to capture business actions.

2. **Authorization Modeling**:
   - Map standard roles to customer personas.
   - Fill the Role-Permission-Action Matrix with resource:action pairs and allowed special actions.
   - Define SoD constraints and high-value approval tiers.

3. **Data Modeling & Storage Design**:
   - Design tenant-isolated relational models for each module.
   - Include standard audit columns (`created_by`, `created_at`, `updated_by`, `updated_at`, `version`, `is_deleted`).
   - Define foreign key constraints enforcing scope integrity across company and property boundaries.

4. **Service & Guard Implementation**:
   - Implement authorization middleware / composables before any business service execution.
   - Enforce database row-level security (RLS) or tenant filter interceptors in ORM queries.
   - Wrap state mutations in atomic transactions that emit structured audit log entries.

5. **Validation and Audit Verification**:
   - Run negative permission tests verifying access denial for unauthorized roles.
   - Run SoD violation tests (e.g. maker attempting to self-approve a bill or lease).
   - Verify that audit trails accurately capture payload diffs without logging raw secrets or credentials.

## Gotchas & Anti-Patterns

- **Client-Side Authorization Only**: Never rely solely on UI button hiding. Every backend API endpoint and domain service must independently verify permissions and scope.
- **Missing Scope in Composite Keys**: Omitting company_id or property_id from child tables (like journal lines or lease charges) leads to cross-tenant data leaks during bulk operations.
- **Mutable Financial Entries**: Never perform SQL `UPDATE` on posted journal entries. All adjustments must be made via reversal journals or adjustment vouchers.
- **Unbounded Auditor Queries**: Auditors need read-only access, but uncontrolled queries over millions of financial rows can exhaust database memory. Enforce strict index usage and date-range pagination.
- **Ignoring Soft-Delete Semantics**: In an ERP, financial, contract, and lease records must never be hard-deleted if they have downstream references. Use state machines (`DRAFT` -> `VOID` / `CANCELLED`) instead of hard row deletions.
