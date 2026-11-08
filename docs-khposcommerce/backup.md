# 💾 យុទ្ធសាស្ត្រ និងការអនុវត្ត Backup & Disaster Recovery (Backup Strategy)

ឯកសារនេះបង្ហាញពីយន្តការបង្កើត Backup ស្វ័យប្រវត្តិនៃ PostgreSQL 16 Database, ឯកសារ Uploads, និងការធ្វើតេស្តសង្គ្រោះទិន្នន័យ (Restoration Testing)។

---

## 1. គោលការណ៍រក្សាទុកទិន្នន័យបម្រុង (Retention Policy)

ប្រព័ន្ធប្រើប្រាស់គោលការណ៍ **Grandfather-Father-Son (GFS)** Backup Rotation:
- **Daily Backups**: បង្កើតរៀងរាល់ម៉ោង 2:00 AM (រក្សាទុករយៈពេល 7 ថ្ងៃ)។
- **Weekly Backups**: បង្កើតរៀងរាល់ថ្ងៃអាទិត្យ ម៉ោង 2:00 AM (រក្សាទុករយៈពេល 4 សប្តាហ៍)។
- **Monthly Backups**: បង្កើតនៅថ្ងៃទី 1 នៃខែនីមួយៗ (រក្សាទុករយៈពេល 12 ខែ)។

---

## 2. ការកំណត់ Cron Job ស្វ័យប្រវត្តនៅលើ Host Server

បន្ថែមបន្ទាត់ខាងក្រោមទៅក្នុង `crontab -e` របស់ Host OS:

```bash
# ដំណើរការ Backup Database រៀងរាល់ថ្ងៃនៅម៉ោង 2:00 AM
0 2 * * * /opt/enterprise-pos/scripts/backup-db.sh >> /var/log/db_backup.log 2>&1

# ដំណើរការ Sync Uploaded Files ទៅកាន់ Offsite / Cloud Storage រៀងរាល់ថ្ងៃនៅម៉ោង 3:00 AM
0 3 * * * rsync -avz /var/lib/docker/volumes/enterprise-pos_backend_storage/_data/ /var/backups/enterprise_pos/media/
```

---

## 3. ដំណើរការបង្កើត Backup ដោយផ្ទាល់ដៃ (Manual On-Demand Backup)

មុនពេលធ្វើការកែប្រែធំ ឬ Deploy Version ថ្មី៖

```bash
cd /opt/enterprise-pos
./scripts/backup-db.sh
```

លទ្ធផលនឹងត្រូវបានបង្កើតក្នុង `/var/backups/enterprise_pos/postgres/daily/enterprise_pos_YYYYMMDD_HHMMSS.sql.gz` រួមជាមួយឯកសារ `.sha256` សម្រាប់ផ្ទៀងផ្ទាត់សុក្រឹតភាព។

---

## 4. ដំណើរការសង្គ្រោះទិន្នន័យ (Restoration Workflow)

> [!WARNING]
> ការ Restore នឹងលុបជាន់ទិន្នន័យបច្ចុប្បន្ននៅក្នុង Database! សូមប្រាកដថាបានបញ្ជាក់ច្បាស់លាស់មុននឹងបន្ត។

```bash
cd /opt/enterprise-pos
./scripts/restore-db.sh /var/backups/enterprise_pos/postgres/daily/enterprise_pos_20260824_020000.sql.gz
```

ប្រព័ន្ធនឹង៖
1. ផ្ទៀងផ្ទាត់ SHA256 Checksum ដើម្បីធានាថាឯកសារមិនខូច។
2. ស្នើសុំឱ្យ Operator វាយពាក្យបញ្ជាក់ `YES RESTORE`។
3. Uncompress និង Import ទិន្នន័យចូល PostgreSQL 16 វិញដោយសុវត្ថិភាព។
