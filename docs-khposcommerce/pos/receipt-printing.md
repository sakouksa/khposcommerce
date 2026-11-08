# 🧾 ការបោះពុម្ពវិក្កយបត្រកម្ដៅ (ESC/POS Thermal Receipt Printing)

## 1. សេចក្តីផ្តើម (Overview)
ប្រព័ន្ធបោះពុម្ពវិក្កយបត្ររបស់ OptaPOS គាំទ្រទាំង **ម៉ាស៊ីនព្រីនកម្ដៅលើតុ (Thermal 80mm & 58mm)** តាមរយៈ USB/Network/Web Print និង **ម៉ាស៊ីនព្រីនចល័ត (Bluetooth Thermal Printer)** លើទូរស័ព្ទដៃ ដោយប្រើប្រាស់ស្តង់ដាពាក្យបញ្ជា **ESC/POS**។

---

## 2. ទម្រង់វិក្កយបត្រដែលគាំទ្រ (Supported Receipt Formats)

| ទម្រង់ | ទទឹងក្រដាស | ការប្រើប្រាស់ |
|---|---|---|
| 🖨️ **80mm Standard Thermal** | 32 - 48 តួអក្សរក្នុងមួយជួរ | សម្រាប់ហាងទូទៅ, Supermarket, ហាងលក់ទំនិញបច្ចេកវិទ្យា |
| 🖨️ **58mm Compact Mobile** | 24 - 32 តួអក្សរក្នុងមួយជួរ | សម្រាប់ម៉ាស៊ីន POS ចល័តតាមតុ ឬកន្លែងចង្អៀត |
| 📄 **A4 / A5 Tax Invoice PDF** | Full Page | សម្រាប់វិក្កយបត្រផ្លូវការសម្រាប់ក្រុមហ៊ុន (Official Tax Invoice) |

---

## 3. រចនាសម្ព័ន្ធព័ត៌មានលើវិក្កយបត្រ (Receipt Anatomy)

```
+--------------------------------------------------+
|                    OPTAPOS STORE                 |
|             Branch: Phnom Penh Main Hub          |
|         #110 Russian Blvd, Phnom Penh, KH        |
|             Tel: +855 12 220 152                 |
|               VAT TIN: K008-9021445              |
|--------------------------------------------------|
| Invoice: INV-20260824-0042                       |
| Date: 2026-08-24 21:45:10                        |
| Cashier: Socheat Dara (Register #01)             |
| Customer: John Doe (VIP Member)                  |
|--------------------------------------------------|
| Item                 Qty    Price         Total  |
|--------------------------------------------------|
| MacBook Pro M4 Max     1  $3,499.00   $3,499.00  |
| USB-C Hub 8-in-1       2     $35.00      $70.00  |
|--------------------------------------------------|
| Subtotal:                             $3,569.00  |
| VIP Discount (5%):                     -$178.45  |
| Tax Base:                             $3,390.55  |
| VAT (10% Included):                     $308.23  |
|--------------------------------------------------|
| GRAND TOTAL (USD):                    $3,390.55  |
| GRAND TOTAL (KHR):               13,901,300 ៛   |
|--------------------------------------------------|
| PAYMENTS:                                        |
| Bakong KHQR (ABA):                    $3,000.00  |
| Cash USD:                               $400.00  |
| Change USD:                               $9.45  |
| Change KHR:                            38,700 ៛  |
|--------------------------------------------------|
|               [ DIGITAL RECEIPT QR ]             |
|              Thank you for shopping!             |
+--------------------------------------------------+
```

---

## 4. ការកំណត់ការបោះពុម្ព (Printer Configuration)

1. **Auto-Print on Checkout**:
   - ក្នុង Admin Settings Cashier អាចបើកមុខងារ **"Auto-Print Receipt"**។ ពេលចុចបង់លុយរួចរាល់ Dialog ព្រីននឹងដំណើរការភ្លាមៗដោយស្វ័យប្រវត្តិ។
2. **Reprint Receipt**:
   - Cashier អាចចូលមើលប្រវត្តិលក់ក្នុង `Sales History` ហើយចុច Reprint វិក្កយបត្រចាស់ឡើងវិញបានគ្រប់ពេល។
3. **Cash Drawer Kick (បើកថតលុយ)**៖
   - ប្រព័ន្ធបញ្ជូនពាក្យបញ្ជា ESC/POS `ESC p 0 25 250` (Pin 2 pulse) ទៅកាន់ម៉ាស៊ីនព្រីន ដើម្បីឱ្យថតសាច់ប្រាក់រុញបើកដោយស្វ័យប្រវត្តិនៅពេលបញ្ចប់ការទូទាត់សាច់ប្រាក់។

---
*ឯកសារពាក់ព័ន្ធ:*
- [POS Overview](file:///Users/macbook/Workspace/projects/showcase/Project-Enterprise-E-Commerce-POS-System/docs/pos/pos-overview.md)
- [ការបង្វិលសងប្រាក់ & ដូរទំនិញ (Returns & Refunds)](file:///Users/macbook/Workspace/projects/showcase/Project-Enterprise-E-Commerce-POS-System/docs/pos/returns-and-refunds.md)
