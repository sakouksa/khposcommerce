# 🏷️ ការបញ្ចុះតម្លៃ ពន្ធអាករ និងប័ណ្ណសន្សំ (Discounts, Taxes & Promo Coupons)

## 1. សេចក្តីផ្តើម (Overview)
OptaPOS គាំទ្រការគណនាបញ្ចុះតម្លៃពហុកម្រិត (Item-Level, Cart-Level, Loyalty Redemption, Promo Coupons) និងការគណនា **ពន្ធលើតម្លៃបន្ថែម (Cambodian VAT 10%)** ស្របតាមច្បាប់សារពើពន្ធនៃព្រះរាជាណាចក្រកម្ពុជា។

---

## 2. ស្រទាប់នៃការបញ្ចុះតម្លៃ (Discount Hierarchy)

```
[1. Item Base Price] 
        ↓  (កាត់បញ្ចុះតម្លៃ Item-Level Discount)
[2. Line Item Net Total] 
        ↓  (បូកសរុបទំនិញទាំងអស់ = Subtotal)
[3. Cart Subtotal] 
        ↓  (កាត់បញ្ចុះតម្លៃ Cart-Level Discount ឬ Coupon Code)
[4. Taxable Base] 
        ↓  (បូកបន្ថែមពន្ធ VAT 10%)
[5. Final Grand Total]
```

---

## 3. ប្រភេទនៃការបញ្ចុះតម្លៃ

### A. បញ្ចុះតម្លៃលើទំនិញនីមួយៗ (Item-Level Discount)
- Cashier អាចចុចលើ Item ក្នុង Cart ដើម្បីដាក់បញ្ចុះតម្លៃ៖
  - **ភាគរយ (Percentage %)**៖ ឧទាហរណ៍ បញ្ចុះ `10%` លើតម្លៃទំនិញ។
  - **ទឹកប្រាក់ថេរ (Fixed Amount $)**៖ ឧទាហរណ៍ បញ្ចុះ `$5.00` ក្នុងមួយឯកតា។
- ត្រូវមានសិទ្ធិ `pos.discount.item`។

### B. បញ្ចុះតម្លៃលើវិក្កយបត្រទាំងមូល (Cart-Level Discount)
- អនុវត្តលើ Subtotal សរុបនៃ Cart ទាំងមូលមុនគិតពន្ធ។
- ត្រូវមានសិទ្ធិ `pos.discount.order`។ ប្រសិនបើបញ្ចុះលើសពី **20%** ប្រព័ន្ធនឹងទាមទារ **Manager PIN Override**។

### C. ប័ណ្ណបញ្ចុះតម្លៃ (Promo Coupons)
- វាយបញ្ចូលកូដប័ណ្ណ (ឧទាហរណ៍៖ `OPTA2026`, `WELCOME10`)។
- ប្រព័ន្ធនឹងផ្ទៀងផ្ទាត់លើ Backend៖
  1. កាលបរិច្ឆេទសុពលភាព (`start_date` ដល់ `end_date`)
  2. ចំនួនដងប្រើប្រាស់អតិបរមា (`usage_limit` vs `times_used`)
  3. តម្លៃទិញអប្បបរមា (`min_order_amount`)

---

## 4. ការគណនាពន្ធអាករ (Cambodian VAT 10% Calculation)

OptaPOS គាំទ្រជម្រើសគណនាពន្ធ ២ ប្រភេទ៖

### ជម្រើសទី ១៖ ពន្ធបូកបន្ថែមពីលើ (Exclusive Tax)
- តម្លៃបង្ហាញលើទំនិញមិនទាន់បូកពន្ធទេ។ ពន្ធត្រូវបានបូកបន្ថែមនៅចុងវិក្កយបត្រ៖
$$\text{Tax Amount} = \text{Taxable Subtotal} \times 10\%$$
$$\text{Grand Total} = \text{Taxable Subtotal} + \text{Tax Amount}$$

### ជម្រើសទី ២៖ ពន្ធរួមបញ្ចូលក្នុងតម្លៃទំនិញរួចជាស្រេច (Inclusive Tax - Standard Retail)
- តម្លៃដែលអតិថិជនឃើញ គឺជាតម្លៃត្រូវបង់រួចជាស្រេច។ ប្រព័ន្ធនឹងបំបែកចំនួនពន្ធសម្រាប់របាយការណ៍សារពើពន្ធ៖
$$\text{Tax Base} = \frac{\text{Item Price}}{1 + 0.10} = \frac{\text{Item Price}}{1.10}$$
$$\text{VAT 10\% Included} = \text{Item Price} - \text{Tax Base}$$

---
*ឯកសារពាក់ព័ន្ធ:*
- [POS Overview](file:///Users/macbook/Workspace/projects/showcase/Project-Enterprise-E-Commerce-POS-System/docs/pos/pos-overview.md)
- [ការទូទាត់ចម្រុះ (Split Payments)](file:///Users/macbook/Workspace/projects/showcase/Project-Enterprise-E-Commerce-POS-System/docs/pos/card-transfer-and-split-payments.md)
