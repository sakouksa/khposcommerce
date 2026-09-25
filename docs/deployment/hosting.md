# 🏢 ជម្រើស និងការរៀបចំ Hosting សម្រាប់ Production (Hosting Architecture Guide)

ឯកសារនេះពន្យល់អំពីជម្រើស Cloud Hosting ផ្សេងៗដែលស័ក្តិសមសម្រាប់ **Project-Enterprise-E-Commerce-POS-System** និងការគណនាទំហំធនធាន (Resource Sizing)។

---

## 1. ជម្រើស Cloud Providers ដែលត្រូវបានណែនាំ

| Cloud Provider | គំរូនៃសេវាកម្ម | ចំណុចខ្លាំង (Strengths) | តម្លៃប៉ាន់ស្មាន/ខែ |
| :--- | :--- | :--- | :--- |
| **DigitalOcean** | Droplets (Ubuntu 24.04) + Managed DB | ងាយស្រួលគ្រប់គ្រង, មាន Private VPC, CDN Space | $40 - $80/mo |
| **Hetzner Cloud** | Dedicated/Cloud VPS (CPX31 / CPX41) | ល្បឿនលឿនខ្លាំង, តម្លៃសមរម្យបំផុតសម្រាប់ High RAM/CPU | $25 - $50/mo |
| **AWS (Amazon)** | EC2 + RDS PostgreSQL + ElastiCache + S3 | Enterprise Scale, Multi-AZ High Availability | $100 - $250/mo |
| **Local VPS / Dedicated** | Bare Metal / Custom VPS in Cambodia | Low Latency សម្រាប់អតិថិជន និង POS ក្នុងស្រុក | $30 - $70/mo |

---

## 2. ការគណនាទំហំម៉ាស៊ីន (Server Hardware Sizing Matrix)

### ក. កម្រិតចាប់ផ្តើម (Starter Tier: 1 - 5 POS Terminals & < 1,000 Daily Online Orders)
- **Architecture**: Single-Node Server ជាមួយ Docker Compose
- **CPU**: 4 vCPUs (Intel Xeon ឬ AMD EPYC)
- **RAM**: 8 GB
- **Storage**: 80 GB NVMe SSD
- **Traffic**: 100 concurrent users

### ខ. កម្រិតពាណិជ្ជកម្មមធ្យម (Standard Enterprise Tier: 5 - 25 POS Terminals & 5,000+ Daily Orders)
- **Architecture**: Multi-Container / Managed Database Split
- **Backend & Web Server**: 4 vCPUs, 8 GB RAM
- **Managed PostgreSQL 16**: 2 vCPUs, 4 GB RAM (Dedicated)
- **Managed Redis 7**: 1 vCPU, 2 GB RAM
- **Storage**: 200 GB NVMe + S3 Storage សម្រាប់រូបភាពទំនិញ

---

## 3. គោលការណ៍បែងចែក Network & Port Security

> [!CAUTION]
> **ច្បាប់សុវត្ថិភាព**: មិនត្រូវបើក Port Database (`5432`) ឬ Port Redis (`6379`) ទៅកាន់ Public Internet ដាច់ខាត។

- **Ports ដែលអនុញ្ញាតឱ្យចូលពីក្រៅ (Public Ingress)**:
  - `80` (HTTP - សម្រាប់បង្វែរ Redirect ទៅ HTTPS និង Certbot)
  - `443` (HTTPS - សម្រាប់ Web, Admin, និង Mobile App APIs)
  - `22` (SSH - កំណត់ឱ្យប្រើតែ SSH Key-based Authentication និងប្តូរ Default Port បើចាំបាច់)
- **Internal Ports (Docker Private Network Only)**:
  - `5432` (PostgreSQL Database - ចូលប្រើបានតែ `backend` container)
  - `6379` (Redis Cache & Queue - ចូលប្រើបានតែ `backend` container)
  - `9000` (PHP-FPM - ភ្ជាប់ជាមួយតែ Nginx Gateway)
