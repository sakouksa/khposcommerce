# 🌐 ការគ្រប់គ្រង Domain, DNS និង SSL/TLS (Domain & DNS Configuration Guide)

ឯកសារនេះរៀបរាប់អំពីការកំណត់ DNS Records, Cloudflare CDN/Proxy, និងការដំឡើង SSL Certificate (Let's Encrypt / Certbot)។

---

## 1. បញ្ជី DNS Records ដែលត្រូវកំណត់ (DNS Records Table)

សន្មតថា Server IP របស់អ្នកគឺ `203.0.113.10`:

| Type | Name / Host | Target / IP Value | TTL | គោលបំណង (Purpose) |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `@` (example.com) | `203.0.113.10` | Auto / 300 | Customer Storefront Root Domain |
| **A** | `www` | `203.0.113.10` | Auto / 300 | Customer Storefront WWW Subdomain |
| **A** | `admin` | `203.0.113.10` | Auto / 300 | React Admin Dashboard & POS Portal |
| **A** | `api` | `203.0.113.10` | Auto / 300 | Laravel 12 Backend RESTful API |
| **A** | `staging` | `203.0.113.20` | Auto / 300 | Staging Customer Storefront (Optional) |
| **A** | `admin-staging` | `203.0.113.20` | Auto / 300 | Staging Admin Dashboard (Optional) |
| **A** | `api-staging` | `203.0.113.20` | Auto / 300 | Staging Backend API (Optional) |

---

## 2. ការកំណត់ Cloudflare Proxy & SSL/TLS

ប្រសិនបើប្រើប្រាស់ **Cloudflare**:
1. **SSL/TLS Encryption Mode**: ជ្រើសរើសយក **Full (Strict)** ដើម្បីធានាការ Encrypt ពី Browser ទៅ Cloudflare និងពី Cloudflare ទៅ Nginx Gateway។
2. **Always Use HTTPS**: បើក **ON**។
3. **HTTP Strict Transport Security (HSTS)**: បើក **ON** (Max-Age: 12 months, Include Subdomains)។
4. **Brotli Compression**: បើក **ON** ដើម្បីបង្កើនល្បឿន Render របស់ React Frontend SPAs។
5. **WebSockets Support**: បើក **ON** ប្រសិនបើប្រើ Real-time POS updates ឬ Notifications។

---

## 3. ការបង្កើត SSL Certificate ស្វ័យប្រវត្តតាមរយៈ Certbot (Let's Encrypt)

```bash
# ដំឡើង Certbot នៅលើ Host Server
sudo apt update && sudo apt install -y certbot

# បង្កើត SSL Certificate សម្រាប់គ្រប់ Domains ក្នុងពេលតែមួយ
sudo certbot certonly --standalone \
    -d example.com \
    -d www.example.com \
    -d admin.example.com \
    -d api.example.com \
    --agree-tos \
    --email admin@example.com

# បង្កើត Symlink ចូលទៅក្នុងថត docker/ssl/ របស់ Project
sudo mkdir -p /opt/enterprise-pos/docker/ssl
sudo ln -sf /etc/letsencrypt/live/example.com/fullchain.pem /opt/enterprise-pos/docker/ssl/fullchain.pem
sudo ln -sf /etc/letsencrypt/live/example.com/privkey.pem /opt/enterprise-pos/docker/ssl/privkey.pem

# កំណត់ Auto-renewal រៀងរាល់ខែក្នុង Cron
sudo crontab -l | { cat; echo "0 0 1 * * certbot renew --quiet && docker exec enterprise_pos_gateway_prod nginx -s reload"; } | sudo crontab -
```
