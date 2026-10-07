# 👤 អតិថិជន ពិន្ទុសន្សំ & កម្រិតតម្លៃ (Customer Loyalty, Tier Pricing & Credit)

## 1. សេចក្តីផ្តើម (Overview)
ការគ្រប់គ្រងអតិថិជនលើផ្ទាំង POS អនុញ្ញាតឱ្យ Cashier ជ្រើសរើស ឬចុះឈ្មោះអតិថិជនថ្មីបានភ្លាមៗ ដោយមិនចាំបាច់ចាកចេញពីផ្ទាំងគិតប្រាក់។ ប្រព័ន្ធនឹងទាញយកកម្រិតតម្លៃពិសេស (Tier Pricing), ពិន្ទុសន្សំ (Loyalty Points), និងដែនកំណត់ជំពាក់ (Credit Limit) ដោយស្វ័យប្រវត្តិ។

---

## 2. មុខងារស្វែងរក & ចុះឈ្មោះអតិថិជនរហ័ស (`POSCustomerModal.tsx`)

- **ស្វែងរករហ័ស**: អាចស្វែងរកតាម **ឈ្មោះ**, **លេខទូរស័ព្ទ**, ឬ **លេខកូដកាតសមាជិក (Member Barcode)**។
- **Quick Registration**: ប្រសិនបើជាអតិថិជនថ្មី Cashier គ្រាន់តែបញ្ចូលឈ្មោះ និងលេខទូរស័ព្ទ រួចចុច "Save & Select" នោះអតិថិជននឹងត្រូវបង្កើត និងភ្ជាប់ទៅកាន់ Cart ភ្លាមៗ។
- **Default Walk-in Customer**: ប្រសិនបើភ្ញៀវមិនចង់ផ្តល់ព័ត៌មាន ប្រព័ន្ធនឹងប្រើ `Walk-in Customer` ជាទូទៅ។

---

## 3. កម្រិតតម្លៃតាមក្រុមអតិថិជន (Customer Tier Pricing)

OptaPOS គាំទ្រកម្រិតតម្លៃ ៤ ថ្នាក់៖

```
+---------------------------------------------------------------------------------------------------------------+
|  កម្រិតអតិថិជន (Tier)       | ការអនុវត្តលើតម្លៃទំនិញ (Pricing Rule)                                          |
+---------------------------------------------------------------------------------------------------------------+
|  1. Retail Customer        | តម្លៃលក់រាយស្តង់ដា (Standard Selling Price)                                    |
|  2. VIP Member             | បញ្ចុះតម្លៃ 5% - 10% ដោយស្វ័យប្រវត្តិនឹងទទួលបានពិន្ទុទ្វេដង                     |
|  3. Wholesale Buyer        | តម្លៃបោះដុំ (Wholesale Price Tier) សម្រាប់ទិញចាប់ពី 10 ឯកតាឡើងទៅ             |
|  4. Distributor / Partner  | តម្លៃពិសេសសម្រាប់តំណាងចែកចាយផ្តាច់មុខ                                         |
+---------------------------------------------------------------------------------------------------------------+
```

នៅពេល Cashier ជ្រើសរើសអតិថិជន VIP ឬ Wholesale តម្លៃទំនិញទាំងអស់ក្នុង Cart នឹង **ផ្លាស់ប្តូរតម្លៃទៅតាម Tier នោះដោយស្វ័យប្រវត្តិ** (Auto-Recomputed)។

---

## 4. ប្រព័ន្ធពិន្ទុសន្សំ (Loyalty Points System)

1. **ការសន្សំពិន្ទុ (Points Earning)**៖
   - រាល់ការចំណាយ **$1.00 = 1 Point** (អាចកែសម្រួលក្នុង Settings)។
   - ឧទាហរណ៍៖ ទិញអស់ `$150.00` ទទួលបាន `150 Points`។
2. **ការប្តូរពិន្ទុជាប្រាក់បញ្ចុះតម្លៃ (Points Redemption)**៖
   - អត្រាប្តូរ៖ **100 Points = $1.00 Discount**។
   - Cashier អាចចុច "Redeem Points" ហើយជ្រើសរើសចំនួនពិន្ទុដែលភ្ញៀវចង់ប្រើ។
   - ប្រព័ន្ធនឹងកាត់បន្ថយ Total Cart Amount និងកាត់ពិន្ទុចេញពីគណនីអតិថិជនក្នុងតារាង `customer_points`។

---

## 5. ការទិញជំពាក់ & ដែនកំណត់ឥណទាន (Credit Limit & Accounts Receivable)

សម្រាប់អតិថិជនជាក្រុមហ៊ុន ឬដៃគូអាជីវកម្មដែលទទួលបានសិទ្ធិទិញជំពាក់៖
- **Credit Limit Verification**: ប្រព័ន្ធនឹងផ្ទៀងផ្ទាត់ថាតើ `(បំណុលចាស់ + តម្លៃវិក្កយបត្រថ្មី) <= ដែនកំណត់ Credit Limit` ឬអត់។
- **Credit Terms**: កំណត់កាលបរិច្ឆេទទូទាត់ (ឧទាហរណ៍៖ Net 15, Net 30 ថ្ងៃ)។
- **Payment Method**: ជ្រើសរើសវិធីទូទាត់ជា `On Credit / Due`។

---
*ឯកសារពាក់ព័ន្ធ:*
- [ការបញ្ចុះតម្លៃ និងពន្ធ (Discounts & Taxes)](file:///Users/macbook/Workspace/projects/showcase/Project-Enterprise-E-Commerce-POS-System/docs/pos/discounts-taxes-and-coupons.md)
- [ការទូទាត់ចម្រុះ (Split Payments)](file:///Users/macbook/Workspace/projects/showcase/Project-Enterprise-E-Commerce-POS-System/docs/pos/card-transfer-and-split-payments.md)
