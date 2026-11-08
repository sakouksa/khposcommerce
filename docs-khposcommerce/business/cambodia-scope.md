# Cambodia-First Business Scope & Architecture Standard
**Project:** Enterprise E-Commerce & Smart POS System (Project-Enterprise-E-Commerce-POS-System)  
**Status:** Active Production Standard  
**Last Updated:** August 2026

---

## 1. Executive Summary & Core Philosophy

This platform is architected with a **Cambodia-First, Clean Data Model, and Simple User Experience** philosophy.

```
┌────────────────────────────────────────────────────────┐
│               CAMBODIA-FIRST PHILOSOPHY                │
│  1. Single Source of Truth Geography: Cambodia (KH)    │
│  2. Dual Currency Strategy: USD Base + KHR Dual-Price  │
│  3. National Payments: Bakong KHQR (ABA, ACLEDA, Wing) │
│  4. Local Administrative Model: 25 Provinces & Khans   │
│  5. Frictionless UX: Zero unnecessary country pickers  │
└────────────────────────────────────────────────────────┘
```

The system eliminates international bloat and unnecessary form fields while maintaining clean enterprise extensibility for regional cross-border trading partners (Thailand, Vietnam, China).

---

## 2. Cambodia Administrative & Address Architecture

### 2.1 Geographic Hierarchy
Cambodia follows a 4-tier administrative division system:
```
1. National: Kingdom of Cambodia (ព្រះរាជាណាចក្រកម្ពុជា - ISO: KH / +855)
   └── 2. Capital & Provinces (រាជធានី និង ខេត្ត — 25 Total: Phnom Penh + 24 Provinces)
         └── 3. Districts / Khans / Municipalities (ស្រុក / ខណ្ឌ / ក្រុង — e.g. Khan Daun Penh, Krong Suong)
               └── 4. Communes / Sangkats (ឃុំ / សង្កាត់)
                     └── Villages (ភូមិ) & Street / Building / House (#128, St. 2004)
```

### 2.2 Address Data Model & Validation Rules
- **Customer Addresses (`customer_addresses` table)**:
  - `country`: Defaults to `'Cambodia'`. **Optional in API and hidden from domestic checkout/address forms.**
  - `province`: Required. Picked from the 25 official Cambodian provinces.
  - `city`: Required. Represents the District / Khan / Krong.
  - `address`: Required. House number, Street name, Sangkat/Commune, Village, or Landmark.
  - `postal_code`: Nullable / Optional. Cambodian logistics services route packages via Province, District, and Recipient Phone rather than 5-digit postal codes.
  - `phone`: Required. Cambodian mobile number format (+855 / 0xx xxx xxx).

### 2.3 Official 25 Provinces (Single Source of Truth)
| ID | Province / Capital Name (English) | Khmer Name | ISO Code | Key Districts / Hubs |
|---|---|---|---|---|
| 1 | **Phnom Penh** (Capital) | រាជធានីភ្នំពេញ | `KH-12` | Daun Penh, Chamkarmon, Tuol Kouk, BKK, Sen Sok |
| 2 | **Siem Reap** | ខេត្តសៀមរាប | `KH-17` | Krong Siem Reap, Prasat Bakong, Banteay Srei |
| 3 | **Battambang** | ខេត្តបាត់ដំបង | `KH-02` | Krong Battambang, Moung Ruessei, Thma Koul |
| 4 | **Sihanoukville (Preah Sihanouk)** | ខេត្តព្រះសីហនុ | `KH-18` | Krong Preah Sihanouk, Prey Nob, Stung Hav |
| 5 | **Kampot** | ខេត្តកំពត | `KH-07` | Krong Kampot, Teuk Chhou, Chum Kiri |
| 6 | **Kandal** | ខេត្តកណ្តាល | `KH-08` | Krong Ta Khmau, Kien Svay, Ang Snuol |
| 7 | **Tbong Khmum** | ខេត្តត្បូងឃ្មុំ | `KH-25` | Krong Suong, Memot, Ponhea Kraek, Dambae |
| 8 | **Kampong Cham** | ខេត្តកំពង់ចាម | `KH-03` | Krong Kampong Cham, Batheay, Cheung Prey |
| 9 | **Kampong Chhnang** | ខេត្តកំពង់ឆ្នាំង | `KH-04` | Krong Kampong Chhnang, Rolea B'ier |
| 10 | **Kampong Speu** | ខេត្តកំពង់ស្ពឺ | `KH-05` | Krong Chbar Mon, Samraong Tong |
| 11 | **Kampong Thom** | ខេត្តកំពង់ធំ | `KH-06` | Krong Stung Saen, Baray, Santuk |
| 12 | **Kep** | ខេត្តកែប | `KH-23` | Krong Kep, Damnak Chang'aeur |
| 13 | **Koh Kong** | ខេត្តកោះកុង | `KH-09` | Krong Khemarak Phoumin, Mondol Seima |
| 14 | **Kratie** | ខេត្តក្រចេះ | `KH-10` | Krong Kratie, Snuol, Chhlong |
| 15 | **Mondulkiri** | ខេត្តមណ្ឌលគិរី | `KH-11` | Krong Sen Monorom, Kaoh Nheaek |
| 16 | **Oddar Meanchey** | ខេត្តឧត្តរមានជ័យ | `KH-22` | Krong Samraong, Anlong Veng |
| 17 | **Pailin** | ខេត្តប៉ៃលិន | `KH-24` | Krong Pailin, Sala Krau |
| 18 | **Preah Vihear** | ខេត្តព្រះវិហារ | `KH-13` | Krong Tbeng Meanchey, Choam Khsant |
| 19 | **Prey Veng** | ខេត្តព្រៃវែង | `KH-14` | Krong Prey Veng, Neak Loeung, Ba Phnum |
| 20 | **Pursat** | ខេត្តពោធិ៍សាត់ | `KH-15` | Krong Pursat, Bakan, Krakor |
| 21 | **Ratanakiri** | ខេត្តរតនគិរី | `KH-16` | Krong Banlung, Lumphat, Ta Veaeng |
| 22 | **Stung Treng** | ខេត្តស្ទឹងត្រែង | `KH-19` | Krong Stung Treng, Sesan, Siem Bouk |
| 23 | **Svay Rieng** | ខេត្តស្វាយរៀង | `KH-20` | Krong Svay Rieng, Krong Bavet, Romeas Haek |
| 24 | **Takeo** | ខេត្តតាកែវ | `KH-21` | Krong Doun Kaev, Bati, Tram Kak, Angkor Borei |
| 25 | **Banteay Meanchey** | ខេត្តបន្ទាយមានជ័យ | `KH-01` | Krong Serei Saophoan, Krong Poipet |

---

## 3. Currency & Pricing Architecture

### 3.1 Dual Currency Standard
In Cambodia's commercial ecosystem, prices are primarily calculated in **USD** with national currency **KHR (Cambodian Riel)** used alongside it for cash payments, change calculation, and Bakong KHQR transfers.

- **Base Accounting Currency:** `USD` ($).
- **Secondary Display / POS Currency:** `KHR` (៛).
- **Default Exchange Rate:** 1 USD = 4,100 KHR (configurable in System Settings).
- **POS Display Rule:** Receipts and POS checkout modals display total in both USD and KHR:
  ```
  Total USD: $25.00
  Total KHR: 102,500 ៛ (Rate: 4,100)
  ```
- **Regional Currencies for Cross-Border Supply Chains:**
  - `THB` (Thai Baht ฿) for Thai electronics/apparel suppliers.
  - `VND` (Vietnamese Dong ₫) for Vietnam border logistics and parts.
  - `CNY` (Chinese Yuan ¥) for direct manufacturing procurement from China.

---

## 4. Payment Ecosystem

### 4.1 Supported Payment Methods
1. **ABA KHQR (PayWay Instant QR):** National Bakong KHQR dynamic QR standard supported across all Cambodian banking apps.
2. **ACLEDA Mobile (KHQR):** ACLEDA Bank instant QR payment gateway.
3. **Wing Bank (KHQR / E-Wallet):** Wing Pay & KHQR QR code.
4. **Cash on Delivery (COD):** Most widely utilized payment method for domestic e-commerce packages in Cambodia.
5. **Credit / Debit Cards (Visa, Mastercard, UnionPay):** Supported for corporate and international customers.

---

## 5. Domestic Logistics & Courier Network

### 5.1 Integrated Carriers
- **Phnom Penh Same-Day (1-3 Hours):** FastCourier / GrabExpress for inner-city capital delivery.
- **Virak Buntham Logistics (VET Express):** Nationwide hub-to-hub bus/van parcel delivery across all 25 provinces.
- **J&T Express Cambodia:** Doorstep parcel express for urban and provincial addresses.
- **OptaLogistics / Standard Express:** 1-2 day regional courier.

---

## 6. Supplier Management & Cross-Border Procurement

### 6.1 Domestic vs. Regional Suppliers
- **Domestic Suppliers (Cambodia):**
  - Bank Accounts: ABA Bank, ACLEDA Bank, Canadia Bank, Wing Bank, Sathapana Bank.
  - Tax ID: Cambodian General Department of Taxation (GDT) TIN format (`K00...`).
  - Currency: USD or KHR.
- **Regional Import Suppliers (Thailand, Vietnam, China):**
  - Retain optional `country`, `currency_code` (USD/THB/CNY), and `swift_code` fields for international wire transfers.
  - Deprecated Field: `fax` (obsolete in modern Cambodian business workflows; replaced with Telegram/Hotline/Email).

---

## 7. Phone Number Formatting & Timezone

### 7.1 Phone Number Standard
- **Country Code:** `+855` (Cambodia).
- **Local Mobile Prefixes:**
  - Smart Axiata: `010`, `015`, `016`, `069`, `070`, `086`, `087`, `093`, `096`, `098`
  - Cellcard (CamGSM): `011`, `012`, `014`, `017`, `061`, `076`, `077`, `078`, `079`, `085`, `089`, `092`, `095`, `099`
  - Metfone (Viettel): `031`, `060`, `066`, `067`, `068`, `071`, `088`, `090`, `097`
  - Seatel: `018`
- **Normalization:** UI components use smart phone formatting removing leading zeros when prefixed with `+855`.

### 7.2 Timezone
- **Standard Timezone:** `Asia/Phnom_Penh` (UTC+07:00 / Indochina Time).
- **Laravel Configuration:** `config/app.php` sets `timezone => env('APP_TIMEZONE', 'Asia/Phnom_Penh')`.

---

## 8. Anti-Patterns & Prohibited Legacy Configurations

For all future development on this project, the following patterns are **strictly prohibited**:

❌ **PROHIBITED:**
1. Do NOT set default country to `ID` or default currency to `IDR`.
2. Do NOT set default timezone to `Asia/Jakarta` or generic `UTC`.
3. Do NOT make `shipping_country` or `postal_code` mandatory fields in customer APIs or storefront checkout.
4. Do NOT use Indonesian administrative terminology (`Kota`, `Kabupaten`, `RT/RW`, `Kelurahan`, `Kecamatan`, `NPWP`).
5. Do NOT hardcode US/Foreign state placeholders (`["US", "CA"]`, `["California", "Texas"]`) in shipping zone components.

✅ **MANDATORY:**
1. Always default country to `'Cambodia'` / `'KH'`.
2. Always default currency to `'USD'` with `'KHR'` dual-pricing enabled.
3. Always default timezone to `'Asia/Phnom_Penh'`.
4. Always validate Cambodian administrative structure (Province -> District/Khan -> Commune/Sangkat -> Street).
5. Always support Bakong KHQR and Cash on Delivery (COD) as first-class payment methods.
