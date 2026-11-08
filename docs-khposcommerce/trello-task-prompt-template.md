# 📋 MASTER AI PROMPT: ENTERPRISE TRELLO CARD & SPEC GENERATOR
> **Instructions for User:**
> Copy the entire prompt block below and paste it into any AI (ChatGPT, Claude, Gemini, Antigravity) whenever you want to generate a production-ready, enterprise-grade Trello Task Card. Just replace the `[FEATURE NAME & BRIEF REQUIREMENT]` section at the bottom.

---

```markdown
# MISSION & ROLE
You are an Elite Principal Software Architect and Agile Technical Product Manager.
Your job is to take a feature request, user story, or requirement and convert it into a complete, enterprise-grade Trello Task Card formatted according to our strict production engineering standard.

---

# 📐 REQUIRED TRELLO CARD SPECIFICATION STRUCTURE
Every Trello Card you generate MUST contain the following sections in this exact order:

### 1. Title & Meta
- Title Format: `[Layer/Scope] - [Feature Name] ([Story Points])`
  - Examples: `Web/Backend - Add School Activity History (3)`, `Web/Backend - Employee Holiday Management & Spatie RBAC (5)`, `Web - Common UI Components Cleanup (2)`
- Meta Labels: e.g. `Backend`, `WebClient`, `Security (RBAC)`, `P0 / P1 / P2`
- Story Points: Fibonnaci estimate (1, 2, 3, 5, 8)

### 2. Goal
- Clear 1-2 paragraph executive summary explaining WHAT this feature does, WHO uses it, and WHY it is valuable.
- Explicitly list coverage:
  - Web Client
  - Backend
  - Database / Migration (if applicable)

### 3. Important Security Rule (Multi-Tenancy & RBAC)
- Strict non-negotiable security constraints.
- Provide an ASCII flowchart showing tenant/company isolation:
  ```
  Tenant A Admin ────► Can view Tenant A data
  Tenant A Admin ────► CANNOT view Tenant B data
  ```
- Backend MUST automatically enforce scoping at the database/query layer (never rely only on frontend filtering).
- Explicitly define RBAC middleware requirements.

### 4. Page / Component Layout (Wireframe)
- Provide a clear, clean ASCII UI wireframe showing:
  - Header / Breadcrumb / Stats Banner
  - Filter Toolbar (Search input, dropdowns, date picker, action buttons)
  - Data Table / Grid structure with sample columns
  - Pagination bar

### 5. Information Schema / Data Model
- Detailed breakdown of all attributes/fields:
  - Field name
  - Data type
  - Required / Optional
  - Bilingual support (e.g. EN / KM)
  - Sample values

### 6. Types / Sub-categories / Actions
- Enumerate all relevant business types, statuses, actions, or lifecycle events.

### 7. Existing System Integration (Reusability)
- Direct the engineer to inspect existing architectures before creating duplicate code.
- Provide an ASCII integration flow:
  ```
  Request ──► Middleware (Auth/RBAC) ──► FormRequest ──► Controller ──► Model Scope
  ```
- Explicitly state which base controllers, models, or services to reuse.

### 8. Detail View / Drawer / Modal
- Provide an ASCII wireframe for the Detail Drawer, Create Modal, or Edit Modal.
- Specify what information is safe to display and what sensitive data MUST be masked/hidden (e.g. passwords, secret keys).

### 9. Search, Filters & Pagination
- Detail search behavior (frontend vs backend query, fields matched).
- Filter controls (Status, Date range, Category).
- Pagination parameters (`page`, `per_page`), and ensure page resets to 1 upon filter change.

### 10. Backend API Endpoints & Contracts
- Complete list of RESTful routes with HTTP methods:
  - `GET    /api/v1/...`
  - `POST   /api/v1/...`
  - `PUT    /api/v1/...`
  - `DELETE /api/v1/...`
- Query parameters list.
- FormRequest validation rules for payloads.

### 11. Edge Cases & Logging / Bulk Operations
- Rules for bulk actions (e.g. Bulk Delete, Bulk Import).
- Summary logging behavior (avoid spamming hundreds of identical log rows).
- Fail-safe rules (logging failure should never crash the main transaction).

### 12. UI States Handling
- **Loading State:** Skeleton table or spinner (prevent false "No data found").
- **Empty State:** Visual indicator + descriptive text + Primary Call-To-Action button.
- **Filtered Empty State:** Message when search/filters return 0 matches + [Clear Filters] button.
- **Error State:** Non-intrusive toast or inline error banner with [Try Again] retry mechanism.

### 13. Responsive Design Rules
- Desktop / Laptop behavior (full table layout).
- Tablet behavior (filter wrapping, horizontal table scroll).
- Mobile behavior (card list view or responsive modal).

### 14. Permissions & RBAC Matrix
- Table or list mapping roles (`super_admin`, `admin`, `manager`, `cashier`, `employee`) to permissions (`view`, `create`, `update`, `delete`).

### 15. Acceptance Criteria (Definition of Done)
- Comprehensive checklist with `[ ]` markdown checkboxes covering all functional, security, UI, and test requirements.

### 16. Development Scope Boundaries (Strict Guardrails)
- **Expected Web Areas:** Exact paths to files/components to create or edit.
- **Expected Backend Areas:** Exact paths to controllers, requests, routes, models.
- **Avoid Modifying:** Critical list of existing components, routes, or files that MUST NOT be touched to avoid regressions.
- **Out of Scope:** Features explicitly deferred to future phases to prevent scope creep.

---

# 📥 INPUT: FEATURE TO SPECIFY
Please generate the complete Trello Card adhering to the standard above for the following feature:

[FEATURE NAME & BRIEF REQUIREMENT]:
(Insert your feature requirements, tech stack, and details here)
```

---

# 🌟 EXAMPLE CARD ALREADY GENERATED: HOLIDAY MANAGEMENT
*(Below is the actual card generated for KHPosCommerce ready to copy into Trello)*

### Title:
`Web/Backend - Employee Holiday Management & Spatie RBAC (5)`

### Description:
```markdown
Goal
Add a dedicated, enterprise-grade Holiday Management system inside the Employee Module so Company Admins can manage public, religious, and company-specific holidays, automate leave/attendance calculations, sync national holidays via live API, and ensure strict RBAC access control.

This task covers:
- Web Client
- Backend

Important Security Rule
A Company Admin must only view and manage holidays belonging to their own company/tenant.

Company A Admin
      ↓
Can view/manage Company A holidays
Company A Admin
      ↓
Cannot view/modify Company B holidays

The backend must enforce this. Do not rely only on frontend filtering.
Backend routes MUST be protected by Spatie permission middleware (permission:holiday.view, permission:holiday.create, permission:holiday.update, permission:holiday.delete).

Holiday Management Page
Located at: /employees under Holidays Tab (HolidaysTab.tsx)
Suggested layout:
-----------------------------------------------------------------------------------------
[ Holidays Overview ]   Total: 28 | Active: 26 | Upcoming: 3
-----------------------------------------------------------------------------------------
[ Search holiday... ]  [ Status: All ▾ ]  [ Year: 2026 ▾ ]   [ Sync Live API ]  [+ Add Holiday]
-----------------------------------------------------------------------------------------
[x] | Holiday Title (EN/KM)       | Date         | Day     | Recurring | Status   | Actions
-----------------------------------------------------------------------------------------
[ ] | Khmer New Year (បុណ្យចូលឆ្នាំ) | 14-16 Apr 2026 | Tue-Thu | [ Yes ]   | [Active] | [ ⋮ ]
[ ] | International Labor Day     | 01 May 2026  | Friday  | [ Yes ]   | [Active] | [ ⋮ ]
[ ] | King's Birthday             | 14 May 2026  | Thu     | [ Yes ]   | [Active] | [ ⋮ ]
-----------------------------------------------------------------------------------------
Showing 1 - 10 of 28 holidays                           < Previous  [1]  2  3  Next >
-----------------------------------------------------------------------------------------

Holiday Information
- Title EN: Holiday title in English
- Title KM: Holiday title in Khmer
- Date: YYYY-MM-DD
- Day: Day of the week (auto-computed)
- Recurring: Boolean (repeats every year)
- Status: active | inactive
- Description: Notes or official sub-decree references

Holiday Types
- Public National Holidays
- Religious & Traditional Ceremonies
- Company-Specific Observances
- Live API Synced Holidays (Cambodian Official Calendar)

Existing System Architecture
Before creating new logic, inspect and reuse:
Admin API Route (/api/v1/admin/holidays)
        ↓
Spatie Permission Middleware (permission:holiday.*)
        ↓
FormRequest Validation (StoreHolidayRequest / UpdateHolidayRequest)
        ↓
HolidayController (Extends BaseApiController)
        ↓
Holiday Model (Company Scoped + Search Scope)

Holiday Create / Edit Modal
+-------------------------------------------------------+
|  Add New Holiday                                  [X] |
+-------------------------------------------------------+
|  Title (English) *                                    |
|  [ King's Birthday                                  ] |
|                                                       |
|  Title (Khmer) *                                      |
|  [ ព្រះរាជពិធីបុណ្យចម្រើនព្រះជន្ម                      ] |
|                                                       |
|  Date *                       Status *                |
|  [ 2026-05-14      📅 ]      [ Active           ▾ ]  |
|                                                       |
|  Recurring Yearly                                     |
|  [ (o) ON ] Automatically repeats every year          |
|                                                       |
|  Description (Optional)                               |
|  [ Official public holiday in Cambodia............. ] |
+-------------------------------------------------------+
|                              [ Cancel ]  [ Save Holiday ]
+-------------------------------------------------------+

Search & Filters
- Search: Bilingual search across title_en, title_km, description.
- Status Filter: All, Active, Inactive.
- Year Filter: All, 2024, 2025, 2026.
- Backend Pagination: page, per_page (10, 25, 50, 100). Filter changes reset to page 1.

Backend API
- GET    /admin/holidays              -> permission:holiday.view
- POST   /admin/holidays              -> permission:holiday.create
- GET    /admin/holidays/{id}         -> permission:holiday.view
- PUT    /admin/holidays/{id}         -> permission:holiday.update
- DELETE /admin/holidays/{id}         -> permission:holiday.delete
- POST   /admin/holidays/bulk-delete  -> permission:holiday.delete
- POST   /admin/holidays/bulk-import  -> permission:holiday.create
- POST   /admin/holidays/sync-live-api-> permission:holiday.create

FormRequest Validation
- title_en: required_without:title_km|nullable|string|max:255
- title_km: required_without:title_en|nullable|string|max:255
- date: required|date
- description: nullable|string|max:1000
- status: required|in:active,inactive
- is_recurring: boolean

UI States
- Loading State: Skeleton shimmer without premature "No holidays found".
- Empty State: EmptyState component with "+ Add Holiday" button.
- Error State: Toast error notification with retry button.

Responsive Design
- Desktop: Multi-column full layout.
- Tablet: Wrapped filter controls and horizontally scrollable table.
- Mobile: Modal sheet drawer and touch-friendly buttons.

Permissions (Spatie RBAC)
- Super Admin: Full access.
- Admin: holiday.view, holiday.create, holiday.update, holiday.delete.
- Manager: holiday.view (read-only).
- Cashier / Staff: Access Denied (403).

Acceptance Criteria
[ ] RolesPermissionsSeeder registers 'holidays' and creates holiday.* permissions
[ ] Admin routes in routes/api/v1/admin.php are guarded by Spatie permission middleware
[ ] StoreHolidayRequest and UpdateHolidayRequest handle validation
[ ] HolidayController uses FormRequests instead of inline validation
[ ] HolidaysTab.tsx renders list with date formatting, day-of-week, and recurring badge
[ ] Create, Edit, and Delete modals function with TanStack Query cache invalidation
[ ] Bulk Delete and Live API Sync operate correctly with toast and audio feedback
[ ] Khmer translations in locales/km/employees.json cover 100% of keys
[ ] Tenant isolation verified: Company A cannot modify Company B holidays
[ ] npx tsc --noEmit compiles with 0 errors

Development Scope
Expected Web Areas:
- webclient/admin-khposcommerce/src/pages/employees/components/HolidaysTab.tsx
- webclient/admin-khposcommerce/src/services/employeeService.ts
- webclient/admin-khposcommerce/src/locales/km/employees.json
Expected Backend Areas:
- api/backend-khposcommerce/routes/api/v1/admin.php
- api/backend-khposcommerce/database/seeders/RolesPermissionsSeeder.php
- api/backend-khposcommerce/app/Http/Controllers/Api/V1/Admin/Employee/HolidayController.php
- api/backend-khposcommerce/app/Http/Requests/Admin/Employee/StoreHolidayRequest.php
- api/backend-khposcommerce/app/Http/Requests/Admin/Employee/UpdateHolidayRequest.php
Avoid Modifying:
- LeaveDetailDrawer.tsx, AttendanceTab.tsx, PayrollTab.tsx
- Authentication & AuthController
- Unrelated POS, Inventory, or E-commerce routes
Out of Scope:
- Automated SMS/Push notifications to employees on holidays
- Two-way Google Calendar synchronization
```

