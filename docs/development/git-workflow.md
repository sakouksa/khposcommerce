# 🌿 Git Workflow & Enterprise Team Branching Strategy

This document outlines the standard Git collaboration workflow, branching hierarchy, and release cycle for the **Project-Enterprise-E-Commerce + POS System** monorepo.

---

## 1. Monorepo Architecture Overview

All 4 core components are co-located in a single unified repository:

```text
enterprise-ecommerce-pos/
│
├── admin-dashboard/        # React Admin (Tailwind CSS, Vite, TanStack Query)
├── backend/                # Laravel 11 RESTful API (Sanctum/JWT, MySQL, Redis)
├── customer-website/       # Customer Storefront (Next.js / React)
├── mobile-app/             # Flutter Mobile POS & Staff App
│
├── docs/                   # System, API & Architecture Documentation
├── .github/                # GitHub Actions CI Workflows & PR Templates
├── .gitignore              # Monorepo-wide ignored artifacts
├── README.md               # Quickstart & Repository Overview
└── docker-compose.yml      # Local development environment services
```

---

## 2. Branch Hierarchy & Flow

```text
                  ┌──────────────┐
                  │     main     │  ← Production / Stable Releases Only
                  │  Production  │
                  └──────▲───────┘
                         │
                    Pull Request (Tags: v1.0.0, v1.1.0...)
                         │
                  ┌──────┴───────┐
                  │    develop   │  ← Integration & Active Team Collaboration
                  │ Integration  │
                  └──────▲───────┘
                         │
          ┌──────────────┼──────────────┬──────────────┐
          │              │              │              │
          ▼              ▼              ▼              ▼
   feature/backend  feature/admin  feature/mobile  feature/customer
          │              │              │              │
          ▼              ▼              ▼              ▼
     Backend Dev     Admin Dev      Mobile Dev      Web Dev
```

### Core Rules:
1. **`main`**: Production-only branch. **Direct pushes are strictly forbidden.**
2. **`develop`**: Central integration branch where all tested features merge.
3. **No sub-main branches**: Do NOT create `main-admin`, `main-backend`, or `main-mobile`. Use the single `develop` branch for integration.

---

## 3. Branch Naming Standards

Always prefix branch names based on the work type and module:

| Prefix | Use Case | Examples |
|---|---|---|
| `feature/admin-...` | React Admin features | `feature/admin-pos-checkout`, `feature/admin-employee-shifts` |
| `feature/backend-...` | Laravel API & DB Migrations | `feature/backend-attendance-api`, `feature/backend-purchase-return` |
| `feature/mobile-...` | Flutter Mobile App features | `feature/mobile-home-dashboard`, `feature/mobile-qr-scanner` |
| `feature/customer-...` | Customer Web Storefront | `feature/customer-product-grid`, `feature/customer-cart-checkout` |
| `fix/...` | Bug fixes across any module | `fix/pos-checkout-calculation`, `fix/khmer-translation-keys` |
| `refactor/...` | Code refactoring without behavior change | `refactor/notification-service`, `refactor/workspace-tabs` |
| `docs/...` | Documentation changes | `docs/api-catalog-endpoints`, `docs/git-workflow` |
| `chore/...` | Dependencies & build maintenance | `chore/update-vite-dependencies`, `chore/github-actions-ci` |
| `hotfix/...` | Urgent critical fixes branched directly from `main` | `hotfix/payment-gateway-timeout` |

---

## 4. Step-by-Step Developer Workflow

### Step 1: Sync with `develop` and create a feature branch
```bash
git checkout develop
git pull origin develop
git checkout -b feature/admin-pos-multi-tender
```

### Step 2: Develop and verify locally before committing
Before committing, ensure automated validation passes for your module:

* **Admin Dashboard (`admin-dashboard/`)**:
  ```bash
  cd admin-dashboard
  npm run build
  ```
* **Backend API (`backend/`)**:
  ```bash
  cd backend
  php artisan test
  php artisan route:list
  ```
* **Mobile App (`mobile-app/`)**:
  ```bash
  cd mobile-app
  flutter analyze
  flutter test
  ```

### Step 3: Commit using Conventional Commits
```bash
git add .
git commit -m "feat(pos): add KHQR split tender option to payment modal"
```

**Allowed Commit Types**:
* `feat:` New user-facing feature
* `fix:` Bug fix
* `refactor:` Code improvements without altering behavior
* `style:` UI styling adjustments or formatting
* `docs:` Documentation additions or updates
* `test:` Unit or integration test updates
* `chore:` Build scripts or dependency updates

### Step 4: Push feature branch and open a Pull Request
```bash
git push -u origin feature/admin-pos-multi-tender
```
* Open a PR on GitHub: **`feature/admin-pos-multi-tender` → `develop`**
* Fill out the PR template checklist (`.github/pull_request_template.md`).
* Ensure all CI workflow checks pass before requesting code review.

---

## 5. Environment File & Secrets Security (`.env`)

> [!CAUTION]
> **NEVER commit or push `.env`, `.env.local`, or `.env.production` to GitHub.**

* Always commit and maintain sanitized `.env.example` templates in each folder:
  * `backend/.env.example`
  * `admin-dashboard/.env.example`
  * `customer-website/.env.example`
* Verify `.gitignore` includes `*.env`, `.env.*.local`, and sensitive credential files.

---

## 6. Production Release Cycle

When milestone features in `develop` are tested and verified:
1. Open PR: **`develop` → `main`**
2. Perform QA sanity testing on staging.
3. Merge into `main`.
4. Tag release using Semantic Versioning:
   ```bash
   git checkout main
   git pull origin main
   git tag -a v1.2.0 -m "Release v1.2.0: Multi-branch inventory, Dynamic QR Kiosk, and Enhanced POS"
   git push origin v1.2.0
   ```
