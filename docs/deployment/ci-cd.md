# 🔄 ប្រព័ន្ធស្វ័យប្រវត្តិកម្ម CI/CD Pipelines (Continuous Integration & Deployment)

ឯកសារនេះពន្យល់អំពីដំណើរការ **GitHub Actions CI/CD** សម្រាប់ធ្វើតេស្ត (Test), ត្រួតពិនិត្យប្រភេទកូដ (Type Check), និង Deploy ស្វ័យប្រវត្តទៅកាន់ Production Server។

---

## 1. ដំណើរការ CI/CD Pipelines Workflow

```
Developer Workstation
      │
      ├──▶ git push feature/branch ──▶ Pull Request ──▶ GitHub Actions CI (backend-ci, admin-ci, website-ci)
      │                                                         │
      └──▶ Merge to main ───────────────────────────────────────┼──▶ Run Automated Tests on PostgreSQL 16
                                                                │
                                                                └──▶ Deploy to Production (deploy-production.yml)
                                                                           │
                                                                           └──▶ SSH Trigger: ./scripts/deploy.sh
```

---

## 2. បញ្ជី Workflows នៅក្នុង `.github/workflows/`

1. **`backend-ci.yml`**:
   - ដំណើរការពេលមាន Push ឬ PR លើ folder `backend/**`។
   - បង្កើត Service Container **PostgreSQL 16** និង **Redis 7**។
   - ដំឡើង PHP 8.2 & 8.3 រួមជាមួយ Extensions (`pdo_pgsql`, `redis`, `gd`, `intl`)។
   - ដំណើរការ `php artisan migrate` និង `php artisan test` (PHPUnit Tests)។
2. **`admin-dashboard-ci.yml`**:
   - ដំណើរការពេលមាន Push ឬ PR លើ folder `admin-dashboard/**`។
   - ដំណើរការ `oxlint` និង `npm run build` (TypeScript Type Check & Vite Production Build)។
3. **`customer-website-ci.yml`**:
   - ដំណើរការពេលមាន Push ឬ PR លើ folder `customer-website/**`។
   - ដំណើរការ `oxlint` និង `npm run build` (TypeScript Type Check & Vite Production Build)។
4. **`deploy-production.yml`**:
   - ដំណើរការពេល Merge ចូល branch `main`។
   - ភ្ជាប់ SSH ទៅកាន់ Production Server និងដំណើរការ `./scripts/deploy.sh` ដោយស្វ័យប្រវត្តិ។

---

## 3. ការកំណត់ GitHub Repository Secrets

ដើម្បីឱ្យ Automated Deployment ដំណើរការបាន សូមបន្ថែម Secrets ក្នុង GitHub Settings -> Secrets and variables -> Actions:
- `PROD_SSH_HOST`: IP Address របស់ Production Server (ឧ. `203.0.113.10`)
- `PROD_SSH_USER`: SSH User (ឧ. `ubuntu` ឬ `deployer`)
- `PROD_SSH_KEY`: Private SSH Key (OpenSSH RSA/Ed25519)
- `PROD_SSH_PORT`: Port SSH (Default: `22`)
