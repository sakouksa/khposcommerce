# 👥 Workforce & Cambodian Tax Payroll Domain Manual

## 1. Overview
The **Employee & Payroll Domain** handles staff lifecycle management, anti-fraud dynamic QR attendance, leave approvals, and **Cambodian Progressive Withholding Tax on Salary (WHT) & NSSF compliance**.

---

## 2. Dynamic QR Anti-Fraud Attendance System

To eliminate buddy-punching and location fraud:
1. **Dynamic QR Generation**: The Admin dashboard terminal generates a cryptographically signed HMAC token rotated every **60 seconds**.
2. **Scan Verification**: When an employee scans the QR using the Flutter mobile app, the backend verifies:
   - Token validity & expiration (max 60s TTL).
   - Staff geolocation within the branch geofence ($\le 100\text{ meters}$).
   - Device ID fingerprint matching registered employee device.

---

## 3. Cambodian Salary Tax & NSSF Calculation Engine

Implemented in `backend/app/Services/Employee/PayrollService.php`:

### A. National Social Security Fund (NSSF)
- **Health & Occupational Risk**: Calculated on base salary capped at standard NBC ceiling (max ~\$12.50 USD employee contribution).

### B. Monthly Tax on Salary (Progressive Tax Brackets)

| Monthly Taxable Salary (KHR) | USD Equivalent (Approx.) | Tax Rate | Deductible (KHR) |
|---|---|---|---|
| 0 – 1,500,000 ៛ | \$0 – \$375 | **0%** | 0 ៛ |
| 1,500,001 – 2,000,000 ៛ | \$375 – \$500 | **5%** | 75,000 ៛ |
| 2,000,001 – 8,500,000 ៛ | \$500 – \$2,125 | **10%** | 175,000 ៛ |
| 8,500,001 – 12,500,000 ៛ | \$2,125 – \$3,125 | **15%** | 600,000 ៛ |
| > 12,500,000 ៛ | > \$3,125 | **20%** | 1,225,000 ៛ |

### C. Formula
$$\text{Tax Due} = (\text{Taxable Salary} \times \text{Rate}) - \text{Bracket Deduction} - (\text{Spouse/Child Relief} \times 150,000\text{ KHR})$$

---

## 4. Key Files in Codebase

| Layer | File Path | Purpose |
|---|---|---|
| **Employee Model** | `backend/app/Models/Employee/Employee.php` | Staff profile, department, position, salary |
| **Attendance Model**| `backend/app/Models/Employee/Attendance.php` | Check-in/out timestamps, GPS coordinates |
| **Payroll Model** | `backend/app/Models/Employee/Payroll.php` | Monthly payslip, gross salary, tax, NSSF, net |
| **Payroll Service**| `backend/app/Services/Employee/PayrollService.php` | Cambodian tax formulas & batch generation |
| **Admin Page** | `admin-dashboard/src/pages/employees/PayrollPage.tsx` | Batch salary generation & payslip printing |
| **Mobile Screen** | `mobile_app/lib/features/attendance/presentation/pages/attendance_scan_page.dart` | QR clock-in scanner |

---
*Related Docs:*
- [Database Schema Reference](file:///Users/macbook/Workspace/projects/showcase/Project-Enterprise-E-Commerce-POS-System/docs/database/README.md)
- [Finance Domain Manual](file:///Users/macbook/Workspace/projects/showcase/Project-Enterprise-E-Commerce-POS-System/docs/business-domains/finance/README.md)
