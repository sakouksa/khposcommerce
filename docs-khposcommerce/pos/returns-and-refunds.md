# 🔄 ការបង្វិលសងប្រាក់ & ទទួលទំនិញត្រឡប់ (POS Returns, Exchanges & Refunds)

## 1. សេចក្តីផ្តើម (Overview)
មុខងារ **Sales Returns & Refunds** អនុញ្ញាតឱ្យ Cashier ឬ Supervisor ទទួលទំនិញដែលអតិថិជនយកមកដូរ ឬសុំបង្វិលប្រាក់ត្រឡប់មកវិញ ដោយផ្ទៀងផ្ទាត់យ៉ាងម៉ត់ចត់ជាមួយវិក្កយបត្រដើម និងគ្រប់គ្រងស្តុកឡើងវិញប្រកបដោយតម្លាភាព។

---

## 2. ដំណើរការបង្វិលទំនិញ (Return Workflow)

```mermaid
flowchart TD
    A[1. ស្វែងរកវិក្កយបត្រដើម Original Invoice] --> B[2. ផ្ទៀងផ្ទាត់កាលបរិច្ឆេទ & គោលការណ៍ Return Policy]
    B --> C[3. ជ្រើសរើសទំនិញ & ចំនួនដែលត្រូវ Return Partial/Full]
    C --> D{4. ស្ថានភាពទំនិញ?}
    D -- ល្អ អាចលក់បន្តបាន --> E[បូកស្តុកត្រឡប់ចូលឃ្លាំងលក់ Inventories (+)]
    D -- ខូចខាត Defective --> F[ដាក់ចូលឃ្លាំងទំនិញខូច Damaged Stock Location]
    E --> G[5. ជ្រើសរើសវិធីសងប្រាក់ Refund Method]
    F --> G
    G --> H[Cash Refund / Store Credit / Original Method]
    H --> I[6. កត់ត្រាចូល sale_returns & ចេញ Return Receipt]
```

---

## 3. ជម្រើសនៃការសងប្រាក់ត្រឡប់ (Refund Payment Options)

1. **សងជាសាច់ប្រាក់ (Cash Refund)**៖
   - ប្រព័ន្ធដកសាច់ប្រាក់ចេញពីថតបច្ចុប្បន្ន និងកត់ត្រា `cash_out` ក្នុង Shift នោះ។
2. **ប្តូរជា Store Credit / Customer Balance**៖
   - បន្ថែមទឹកប្រាក់ទៅក្នុងកាបូបគណនីរបស់អតិថិជន (Customer Wallet) សម្រាប់ទិញទំនិញលើកក្រោយ។
3. **ដូរយកទំនិញផ្សេង (Product Exchange)**៖
   - តម្លៃទំនិញចាស់ត្រូវបានកាត់កងជាមួយទំនិញថ្មីភ្លាមៗក្នុង Cart តែមួយ (Net Amount Due ឬ Net Refund)។

---

## 4. សុវត្ថិភាព និងការអនុញ្ញាត (Security & Authorization)
- ការ Refund ត្រូវតែមានសិទ្ធិ `pos.sales.refund`។
- ប្រសិនបើទឹកប្រាក់សងវិញលើសពី **$50.00** ប្រព័ន្ធនឹងទាមទារ **Manager PIN Override** ដើម្បីការពារការក្លែងបន្លំពីសំណាក់បុគ្គលិក។

---
*ឯកសារពាក់ព័ន្ធ:*
- [POS Overview](file:///Users/macbook/Workspace/projects/showcase/Project-Enterprise-E-Commerce-POS-System/docs/pos/pos-overview.md)
- [ការគ្រប់គ្រងវេនលក់ (Open/Close Shift)](file:///Users/macbook/Workspace/projects/showcase/Project-Enterprise-E-Commerce-POS-System/docs/pos/open-close-shift.md)
