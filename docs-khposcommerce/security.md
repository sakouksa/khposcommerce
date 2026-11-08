# 🛡️ គោលការណ៍ និងស្តង់ដាសុវត្ថិភាព Production (Security Architecture Guide)

ឯកសារនេះបង្ហាញពីការរៀបចំពង្រឹងសុវត្ថិភាព (Security Hardening) នៅលើគ្រប់ស្រទាប់នៃប្រព័ន្ធ **Enterprise POS & E-Commerce**។

---

## 1. ស្រទាប់សុវត្ថិភាព Network & Gateway Layer

1. **TLS 1.3 & HSTS**:
   - បង្ខំឱ្យប្រើ HTTPS 100% លើគ្រប់ Requests (`add_header Strict-Transport-Security "max-age=31536000; includeSubDomains"`)។
   - គ្មាន Mixed Content រវាង HTTP និង HTTPS។
2. **Rate Limiting (ការពារ DDoS & Brute Force Attacks)**:
   - Auth Endpoints (`/api/v1/auth/login`, `/register`, `/forgot-password`): កម្រិតអតិបរមា **10 requests/minute** ក្នុងមួយ IP។
   - General API Endpoints: កម្រិតអតិបរមា **60 requests/minute** ក្នុងមួយ IP ជាមួយ Burst 30។
3. **Security Headers**:
   - `X-Frame-Options: SAMEORIGIN` (ការពារ Clickjacking)
   - `X-Content-Type-Options: nosniff` (ការពារ MIME-type sniffing)
   - `X-XSS-Protection: 1; mode=block`
   - `Referrer-Policy: strict-origin-when-cross-origin`

---

## 2. ស្រទាប់សុវត្ថិភាព API & Authorization Layer

1. **JWT Secret & Token Expiration**:
   - Access Token មានអាយុកាល **24 ម៉ោង** (`JWT_TTL=86400`)។
   - Refresh Token មានអាយុកាល **7 ថ្ងៃ** សម្រាប់ចេញ Token ថ្មី។
2. **CORS Policy ការពារការលួចប្រើប្រាស់ API**:
   - អនុញ្ញាតតែ Domains ជាក់លាក់របស់ប្រព័ន្ធ (`https://www.example.com`, `https://admin.example.com`)។
   - មិនអនុញ្ញាតឱ្យប្រើ `Access-Control-Allow-Origin: *` លើ Requests ដែលមាន Credentials ឡើយ។
3. **Data Isolation (Tenant / Company / Branch Isolation)**:
   - រាល់ Query ទិន្នន័យត្រូវបាន Filter តាម `company_id` និង `branch_id` របស់អ្នកប្រើប្រាស់ដើម្បីធានាមិនឱ្យលេចធ្លាយទិន្នន័យឆ្លងស្ថាប័ន។
4. **ការការពារ File Upload Exploits**:
   - ពិនិត្យ MIME Types យ៉ាងតឹងរ៉ឹង (អនុញ្ញាតតែ `jpg`, `jpeg`, `png`, `webp`, `pdf`)។
   - ឯកសារ Upload ទាំងអស់ត្រូវបានបង្កើតឈ្មោះ Random ថ្មីដើម្បីការពារ Remote Code Execution (RCE)។
   - បិទការដំណើរការ PHP Scripts នៅក្នុង folder `/storage/`។

---

## 3. ស្រទាប់សុវត្ថិភាព Database & Storage Layer

- **PostgreSQL Isolation**: ដំណើរការលើ Private Docker Bridge Network ដែលគ្មាន Public Port Bind ទៅកាន់ម៉ាស៊ីនខាងក្រៅ។
- **Password Hashing**: ប្រើប្រាស់ `Bcrypt` ជាមួយ 12 Rounds (`BCRYPT_ROUNDS=12`) សម្រាប់ពាក្យសម្ងាត់អ្នកប្រើប្រាស់។
- **Parameter Binding**: ប្រើប្រាស់ Eloquent ORM និង PDO Parameterized Queries 100% ដើម្បីទប់ស្កាត់ SQL Injection។
