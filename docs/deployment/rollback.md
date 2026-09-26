# ⏪ យុទ្ធសាស្ត្រ និងដំណើរការ Rollback បន្ទាន់ (Emergency Rollback Protocols)

ឯកសារនេះណែនាំអំពីវិធានការដោះស្រាយពេលមានបញ្ហាបន្ទាប់ពី Deployment (Deployment Incident Response & Rollback Procedures)។

---

## 1. ពេលណាដែលត្រូវធ្វើ Rollback?

ត្រូវធ្វើការ Rollback ភ្លាមៗប្រសិនបើជួបប្រទះករណីណាមួយដូចខាងក្រោម៖
1. **Critical API Failure**: API ផ្តល់កូដ `500 Internal Server Error` លើសពី 5% នៃចំនួន Requests សរុប។
2. **Database Incompatibility**: Migration បង្កឱ្យខូចដំណើរការចាស់របស់ Mobile App ឬ Web Storefront។
3. **Frontend Blank Screen**: មាន JavaScript Runtime Error រារាំងអតិថិជនមិនឱ្យធ្វើការ Checkout ឬបុគ្គលិកមិនអាច Login ចូល POS។

---

## 2. ជំហានអនុវត្ត Rollback ភ្លាមៗ (Instant Rollback Steps)

### ជំហានទី 1: Revert ទៅកាន់ Git Release មុន

```bash
cd /opt/enterprise-pos

# មើលបញ្ជី Releases/Tags ឬ Commits មុន
git tag -l
git log --oneline -n 5

# ដំណើរការ Rollback Script ទៅកាន់ Tag/Commit ជាក់លាក់
./scripts/rollback.sh v1.0.3
```

Script នេះនឹង៖
- Checkout កូដ Version មុន។
- Rebuild Container Images។
- សម្អាត Cache ចាស់ និង Re-cache ឡើងវិញ។
- Restart Queue Workers។

---

### ជំហានទី 2: Rollback Database (ប្រសិនបើចាំបាច់)

> [!CAUTION]
> ការ Rollback Database ត្រូវធ្វើដោយប្រុងប្រយ័ត្នបំផុត។ ប្រសិនបើមានទិន្នន័យ Orders ថ្មីៗចូលរួចហើយ មិនគួរ Restore Database Dump ទាំងមូលទេ គួរតែប្រើ Migration Rollback (`php artisan migrate:rollback --step=1`) ជំនួសវិញ។

```bash
# ប្រសិនបើគ្រាន់តែជា Migration ធម្មតា៖
docker exec enterprise_pos_backend_prod php artisan migrate:rollback --step=1

# ប្រសិនបើតម្រូវឱ្យ Restore Database Dump ពេញលេញដែលបាន Backup មុនពេល Deploy៖
./scripts/restore-db.sh /var/backups/enterprise_pos/postgres/daily/enterprise_pos_YYYYMMDD_HHMMSS.sql.gz
```

---

### ជំហានទី 3: ផ្ទៀងផ្ទាត់ឡើងវិញបន្ទាប់ពី Rollback

```bash
# ពិនិត្យ Health Status
curl -i https://api.example.com/api/health

# ពិនិត្យ Logs
docker compose -f docker-compose.prod.yml logs -f --tail=100
```
