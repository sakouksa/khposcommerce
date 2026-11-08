# 🎓 មេរៀនពេញលេញ៖ ការប្រើប្រាស់ Database Index ឱ្យត្រូវស្តង់ដារ Enterprise (Learning + Project Guide)

> **គោលបំណងនៃមេរៀន៖** យល់ដឹងស៊ីជម្រៅអំពីមូលដ្ឋានគ្រឹះនៃ Database Index, ក្បួនជ្រើសរើស Columns មក Index, ការចៀសវាងកំហុសដែលធ្វើឱ្យខូច Index ក្នុង Laravel, និងការអនុវត្តជាក់ស្តែងលើគម្រោង **khposcommerce** លើទិន្នន័យ 100k ដល់ 1M+ records។

---

## តារាងមាតិកា (Table of Contents)
1. [តើ Database Index ជាអ្វី? (រូបភាពប្រៀបធៀប)](file:///Users/macbook/Workspace/projects/showcase/khposcommerce/docs/tutorials/02-database-indexing-masterclass.md#1-តើ-database-index-ជាអ្វី-conceptual-analogy)
2. [ប្រភេទ Index ធំៗដែលត្រូវដឹង](file:///Users/macbook/Workspace/projects/showcase/khposcommerce/docs/tutorials/02-database-indexing-masterclass.md#2-ប្រភេទ-index-ធំៗ-types-of-indexes)
3. [ក្បួនមាសទាំង ៥ ក្នុងការជ្រើសរើស Column មក Index](file:///Users/macbook/Workspace/projects/showcase/khposcommerce/docs/tutorials/02-database-indexing-masterclass.md#3-ក្បួនមាសទាំង-៥-ក្នុងការជ្រើសរើស-columns-មក-index)
4. [ច្បាប់ Leftmost Prefix Rule លើ Composite Index (ABC Rule)](file:///Users/macbook/Workspace/projects/showcase/khposcommerce/docs/tutorials/02-database-indexing-masterclass.md#4-ច្បាប់-leftmost-prefix-rule-លើ-composite-index-abc-rule)
5. [ពេលណាដែល "មិនគួរ" បង្កើត Index?](file:///Users/macbook/Workspace/projects/showcase/khposcommerce/docs/tutorials/02-database-indexing-masterclass.md#5-ពេលណាដែល-មិនគួរ-បង្កើត-index-trade-offs)
6. [ករណីសិក្សាជាក់ស្តែងក្នុងគម្រោង khposcommerce](file:///Users/macbook/Workspace/projects/showcase/khposcommerce/docs/tutorials/02-database-indexing-masterclass.md#6-ករណីសិក្សាជាក់ស្តែងក្នុងគម្រោង-khposcommerce-real-project-cases)
7. [កំហុសស្លាប់ ៤ យ៉ាងក្នុង Laravel ដែលធ្វើឱ្យ Index លែងដំណើរការ](file:///Users/macbook/Workspace/projects/showcase/khposcommerce/docs/tutorials/02-database-indexing-masterclass.md#7-កំហុសស្លាប់-៤-យ៉ាងក្នុង-laravel-ដែលធ្វើឱ្យ-index-លែងដំណើរការ)
8. [របៀបពិនិត្យល្បឿនដោយប្រើ EXPLAIN ANALYZE](file:///Users/macbook/Workspace/projects/showcase/khposcommerce/docs/tutorials/02-database-indexing-masterclass.md#8-របៀបពិនិត្យល្បឿនដោយប្រើ-explain-analyze)
9. [លំហាត់អនុវត្តផ្ទាល់ដៃ (Hands-on Practice)](file:///Users/macbook/Workspace/projects/showcase/khposcommerce/docs/tutorials/02-database-indexing-masterclass.md#9-លំហាត់អនុវត្តផ្ទាល់ដៃ-hands-on-exercises)

---

## 1. តើ Database Index ជាអ្វី? (Conceptual Analogy)

### រូបភាពប្រៀបធៀបងាយយល់៖
ស្រមៃថាអ្នកមាន **សៀវភៅកម្រាស់ ១,០០០ ទំព័រ** អំពីវេជ្ជសាស្ត្រ ហើយចង់រកពាក្យថា **"Paracetamol"**៖
- **គ្មាន Index (Full Table Scan / Sequential Scan)**៖ អ្នកត្រូវបើកមើលម្តងមួយទំព័រ តាំងពីទំព័រទី ១ រហូតដល់ទំព័រទី ១,០០០ ដើម្បីរកមើលថាតើពាក្យនោះនៅត្រង់ណាខ្លះ។ វិធីនេះចំណាយពេលយូរក្រៃលែង!
- **មាន Index (B-Tree Index Scan)**៖ អ្នកបើកទៅទំព័រចុងក្រោយនៃសៀវភៅ ដែលជា **សន្ទស្សន៍ពាក្យ (Index)** តម្រៀបតាមលំដាប់អក្ខរក្រម (A-Z)។ អ្នកមើលអក្សរ **P ➔ Paracetamol ➔ ទំព័រ 142, 580**។ អ្នកចំណាយពេលតែ ២ វិនាទីប៉ុណ្ណោះ!

```
គ្មាន Index (Sequential Scan O(N)) : ស្កេនគ្រប់ជួរ (1,000,000 Rows ➔ 500ms - 3000ms)
មាន Index   (B-Tree Scan O(log N))  : លោតទៅរកចំជួរទិន្នន័យ (1,000,000 Rows ➔ 1ms - 5ms)
```

---

## 2. ប្រភេទ Index ធំៗ (Types of Indexes)

| ប្រភេទ Index | ការពិពណ៌នា | ឧទាហរណ៍ក្នុងគម្រោង |
| :--- | :--- | :--- |
| **B-Tree Index (Default)** | Index ស្តង់ដាររៀបចំជារចនាសម្ព័ន្ធដើមឈើ ល្អបំផុតសម្រាប់ `=`, `<`, `>`, `<=`, `>=`, `BETWEEN`, `ORDER BY` | `customers(phone)`, `sales(created_at)` |
| **Composite Index** | Index រួមបញ្ចូលគ្នាលើ Columns ច្រើនក្នុង Table តែមួយ ( Multi-column ) | `sales(company_id, status, created_at)` |
| **Unique Index** | ធានាថាតម្លៃមិនជាន់គ្នា + ស្វែងរកលឿន | `products(sku)`, `sales(invoice_number)` |
| **Full-Text Index (FTS)** | សម្រាប់ស្វែងរកអត្ថបទវែងៗ ឬស្វែងរកពាក្យគន្លឹះជំនួសឱ្យ `%LIKE%` | `products(name, sku, barcode)` |
| **Partial / Filtered Index** *(PostgreSQL)* | Index តែជួរណាដែលត្រូវនឹងលក្ខខណ្ឌជាក់លាក់ សន្សំសំចៃទំហំ Disk | `CREATE INDEX idx ON orders(status) WHERE deleted_at IS NULL;` |

---

## 3. ក្បួនមាសទាំង ៥ ក្នុងការជ្រើសរើស Columns មក Index

កុំចេះតែ Index គ្រប់ Column ដោយគ្មានផែនការ! ត្រូវជ្រើសរើស Columns ណាដែលត្រូវនឹងលក្ខខណ្ឌខាងក្រោម៖

### ✅ ក្បួនទី ១៖ Columns នៅក្នុង `WHERE` Clause
Column ណាដែលត្រូវបាន Client ចុច Filter ញឹកញាប់បំផុត (ឧទាហរណ៍៖ `status`, `payment_status`, `category_id`, `date`)។

### ✅ ក្បួនទី ២៖ Columns សម្រាប់ `ORDER BY`
ពេល query មាន `ORDER BY created_at DESC` បើគ្មាន Index ទេ Database ត្រូវយក Data ទាំងអស់មកដាក់ក្នុង Memory រួចធ្វើ **Filesort** ដែលធ្វើឱ្យស៊ី CPU ខ្ពស់។

### ✅ ក្បួនទី ៣៖ Columns សម្រាប់ `JOIN` (Foreign Keys)
រាល់ Foreign Key ដូចជា `customer_id`, `warehouse_id`, `company_id`, `product_id` ត្រូវតែមាន Index ដើម្បីឱ្យ Table Join គ្នាបានលឿន។

### ✅ ក្បួនទី ៤៖ High Cardinality Columns
- **Cardinality ខ្ពស់ (ល្អ)**៖ តម្លៃប្លែកៗគ្នាច្រើន (ឧទាហរណ៍៖ `phone`, `email`, `invoice_number`, `sku`) ➔ Index ដំណើរការមានប្រសិទ្ធភាពខ្ពស់បំផុត!
- **Cardinality ទាប (មិនសូវល្អ)**៖ មានតម្លៃតែ ២-៣ បែបដដែលៗ (ឧទាហរណ៍៖ `gender` (male/female), `is_active` (true/false))។ **កុំ Index វាទទេរៗ** លើកលែងតែដាក់បញ្ចូលគ្នាជា Composite Index ជាមួយ Column ដទៃ។

### ✅ ក្បួនទី ៥៖ Multi-Tenant Identifier (`company_id`)
ក្នុងប្រព័ន្ធ SaaS ឬ Multi-Branch/Company គ្រប់ Query តែងតែចាប់ផ្តើមដោយ `WHERE company_id = ?` ដូច្នេះ `company_id` ត្រូវតែជាបង្គោលដំបូងក្នុង Composite Index។

---

## 4. ច្បាប់ Leftmost Prefix Rule លើ Composite Index (ABC Rule)

បើយើងបង្កើត Composite Index មួយឈ្មោះថា `(A, B, C)` ដូចជា៖
```sql
CREATE INDEX idx_sales_comp ON sales(company_id, status, created_at);
```

Database អាចប្រើ Index នេះបានតែក្នុងករណីដែល Query ប្រើ Column ពីឆ្វេងមកស្តាំតាមលំដាប់ (Leftmost Prefix)៖

| Query Where Clause | តើ Database ប្រើ Index ដែរឬទេ? | មូលហេតុ |
| :--- | :---: | :--- |
| `WHERE company_id = 1` | ✅ **ប្រើ (A)** | ត្រូវនឹង Column ទីមួយ |
| `WHERE company_id = 1 AND status = 'completed'` | ✅ **ប្រើ (A, B)** | ត្រូវតាមលំដាប់ពីឆ្វេងមក |
| `WHERE company_id = 1 AND status = 'completed' ORDER BY created_at DESC` | ✅ **ប្រើ (A, B, C) ល្អបំផុត!** | គ្មាន Filesort ឡើយ |
| `WHERE company_id = 1 ORDER BY created_at DESC` | ⚠️ **ប្រើតែ A** | រំលង B (status) ដូច្នេះ `ORDER BY` ត្រូវ Sort ក្នុង Memory |
| `WHERE status = 'completed'` | ❌ **មិនប្រើទេ!** | ខ្វះ A (company_id) ➔ Database ធ្វើ Full Table Scan! |
| `WHERE created_at > '2026-01-01'` | ❌ **មិនប្រើទេ!** | ខ្វះ A និង B ➔ មិនអាចប្រើ Index នេះបានឡើយ |

---

## 5. ពេលណាដែល "មិនគួរ" បង្កើត Index? (Trade-offs)

Index មិនមែនចេះតែដាក់កាន់តែច្រើនកាន់តែល្អនោះទេ ព្រោះវាមានតម្លៃដែលត្រូវបង់ (Costs)៖

1. **បន្ថយល្បឿន INSERT, UPDATE, DELETE**៖
   - រាល់ពេលអ្នក `INSERT` ទិន្នន័យថ្មីមួយជួរ Database មិនត្រឹមតែសរសេរទិន្នន័យចូល Table ទេ គឺត្រូវរៀបចំដើមឈើ B-Tree ឡើងវិញលើរាល់ Index ទាំងអស់។
   - បើ Table មួយមាន 15 Indexes នោះការ Insert នឹងយឺតជាងធម្មតាទ្វេដង។
2. **ស៊ីទំហំ Storage (Disk & RAM)**៖
   - Index ត្រូវបានផ្ទុកក្នុង Memory (RAM Buffer Pool)។ បើ Index ធំពេក វានឹងរុញ Cache ចេញពី RAM បង្កឱ្យ Query យឺត។
3. **Table តូចៗ (ក្រោម ១,០០០ ជួរ)**៖
   - ដូចជា Table `units`, `currencies`, `languages` មិនចាំបាច់បន្ថែម Composite Index ច្រើនទេ ព្រោះការ Scan ទាំងមូលលឿនស្រាប់ហើយ។

---

## 6. ករណីសិក្សាជាក់ស្តែងក្នុងគម្រោង `khposcommerce` (Real Project Cases)

### ករណីទី ១៖ ស្វែងរកអតិថិជនតាមលេខទូរស័ព្ទក្នុង POS
- **បញ្ហាពីមុន**៖ Table `customers` មាន 200,000 records តែគ្មាន Index លើ `phone`។ ពេល Cashier វាយលេខទូរស័ព្ទ Database ត្រូវស្កេន 200,000 ជួរ (ចំណាយពេល 300ms - 800ms)។
- **ដំណោះស្រាយ**៖ បន្ថែម Composite Index `(company_id, phone)`:
  ```php
  $table->index(['company_id', 'phone'], 'idx_customers_comp_phone');
  ```
- **លទ្ធផល**៖ ស្វែងរកឃើញភ្លាមៗក្នុងរយៈពេល **0.8ms**!

---

### ករណីទី ២៖ សៀវភៅតាមដានស្តុក `inventory_movements` (កើនរាប់លានជួរ)
- **បញ្ហាពីមុន**៖ Table នេះមានរាប់លាន records ហើយកើនរាល់នាទី។ Admin ចុចមើលរបាយការណ៍ចលនាស្តុកតាមឃ្លាំង (Warehouse Ledger) ជាប់គាំង Browser (Timeout 504) ដោយសារគ្មាន Index លើ `company_id`។
- **ដំណោះស្រាយ**៖ បង្កើត Composite Index តាមលំដាប់ Company + Warehouse + Created At:
  ```php
  $table->index(['company_id', 'warehouse_id', 'created_at'], 'idx_inv_mov_comp_wh_created');
  ```
- **លទ្ធផល**៖ ទោះបីមាន 5,000,000 records ក៏ទាញយក Page នីមួយៗមកបង្ហាញចំណាយពេលក្រោម **15ms**។

---

## 7. កំហុសស្លាប់ ៤ យ៉ាងក្នុង Laravel ដែលធ្វើឱ្យ Index លែងដំណើរការ

ទោះបីជាអ្នកបង្កើត Index ក្នុង Migration យ៉ាងស្អាតក៏ដោយ បើអ្នកសរសេរ Eloquent/Query Builder ខុស នោះ PostgreSQL/MySQL នឹងមិនប្រើ Index ឡើយ!

### ❌ កំហុសទី ១៖ ប្រើ SQL Function លើ Column (`whereDate`, `whereYear`)
```php
// ❌ ខុស: MySQL/Postgres ត្រូវដំណើរការ DATE() លើរាល់ជួរ => បាត់ B-Tree Index!
Sale::whereDate('created_at', '>=', '2026-09-01')->get();

// ✅ ត្រូវ: ប្រើ Range Comparison (>= និង <=) រក្សា Index Scan បាន 100%
Sale::where('created_at', '>=', '2026-09-01 00:00:00')
    ->where('created_at', '<=', '2026-09-01 23:59:59')
    ->get();
```

---

### ❌ កំហុសទី ២៖ ប្រើ Leading Wildcard `%keyword%`
```php
// ❌ ខុស: សញ្ញា % នៅខាងមុខបង្ខំឱ្យ Database ស្កេនតួអក្សរគ្រប់ Record (Full Scan)
Product::where('name', 'like', "%coca%")->paginate(20);

// ✅ ជម្រើសទី ១ (បើអាច): ប្រើ Trailing Wildcard (ស្វែងរកពាក្យចាប់ផ្តើមដោយ...)
Product::where('sku', 'like', "CAM-%")->paginate(20); // ប្រើ Index លើ SKU បាន!

// ✅ ជម្រើសទី ២ (សម្រាប់ Search ធំៗ): ប្រើ PostgreSQL / MySQL Full-Text Search
Product::whereRaw("to_tsvector('simple', name) @@ to_tsquery('simple', ?)", ['coca:*'])->paginate(20);
```

---

### ❌ កំហុសទី ៣៖ Type Mismatch (ប្រៀបធៀបខុសប្រភេទ Data Type)
ឧទាហរណ៍៖ Column `phone` ជាប្រភេទ `VARCHAR` តែក្នុង code បែរជាបញ្ជូនលេខ `INTEGER` ទៅឱ្យ query:
```php
// ❌ ខុស: Database ត្រូវ Cast string ទៅជា int លើគ្រប់ row => បាត់ Index!
Customer::where('phone', 012345678)->first();

// ✅ ត្រូវ: តែងតែប្រើ string សម្រាប់ phone ឬ code
Customer::where('phone', '012345678')->first();
```

---

### ❌ កំហុសទី ៤៖ Over-Eager Loading លើ List Table
```php
// ❌ ខុស: លើ List View ត្រូវការតែ Total & Invoice ប៉ុន្តែទាញយក Items ទាំងអស់មកជាមួយ
$sales = Sale::with(['items.product.images'])->paginate(20);

// ✅ ត្រូវ: Eager load តែ relation និង columns ចាំបាច់សម្រាប់បង្ហាញលើ Table
$sales = Sale::query()
    ->select(['id', 'invoice_number', 'date', 'status', 'grand_total', 'customer_id', 'user_id'])
    ->with([
        'customer:id,name,phone',
        'cashier:id,name'
    ])
    ->paginate(20);
```

---

## 8. របៀបពិនិត្យល្បឿនដោយប្រើ `EXPLAIN ANALYZE`

ដើម្បីដឹងច្បាស់ថា Query របស់អ្នករត់តាម Index ឬអត់ ត្រូវប្រើ `EXPLAIN` ក្នុង SQL ឬ Tinker៖

### វិធី Run ក្នុង Laravel Tinker:
```bash
php artisan tinker
```
```php
DB::select("EXPLAIN SELECT id, invoice_number FROM sales WHERE company_id = 1 AND status = 'completed' ORDER BY created_at DESC LIMIT 12");
```

### របៀបអានលទ្ធផល (How to Read Execution Plan):

#### 🔴 លទ្ធផលអាក្រក់ (Seq Scan / Full Table Scan)៖
```text
->  Seq Scan on sales  (cost=0.00..1845.00 rows=50000 width=36)
      Filter: ((company_id = 1) AND (status = 'completed'))
```
👉 *មានន័យថា Database ស្កេនមើលគ្រប់ជួរក្នុង Hard Disk។ ពេលទិន្នន័យឡើងដល់ 1M ជួរ វានឹងគាំង!*

#### 🟢 លទ្ធផលល្អបំផុត (Index Scan / Index Range Scan)៖
```text
->  Index Scan Backward using idx_sales_comp_stat_created on sales  (cost=0.14..24.16 rows=138 width=36)
      Index Cond: ((company_id = 1) AND (status = 'completed'))
```
👉 *Cost ទាបបំផុត (`0.14..24.16`), ប្រើ `idx_sales_comp_stat_created` ដោយផ្ទាល់ គ្មានការស្កេនក្រៅផ្លូវឡើយ!*

---

## 9. លំហាត់អនុវត្តផ្ទាល់ដៃ (Hands-on Exercises)

ដើម្បីឱ្យកាន់តែស្ទាត់ សូមសាកល្បងអនុវត្ត ៣ លំហាត់នេះក្នុងគម្រោង៖

### លំហាត់ទី ១៖
ចូលពិនិត្យ Table `expenses` ក្នុងគម្រោង។ សរសេរ Query ស្វែងរកការចំណាយប្រចាំខែ តាម Category ជាក់លាក់។
- ពិនិត្យមើលថាតើ Index ណាខ្លះក្នុង `idx_expenses_comp_cat_date` ត្រូវបានដំណើរការ?

### លំហាត់ទី ២៖
សាកល្បងសរសេរ Query មួយដោយប្រើ `whereDate('created_at', '2026-09-10')` រួចរត់ `EXPLAIN`។ បន្ទាប់មកប្តូរទៅប្រើ `whereBetween()` រួចរត់ `EXPLAIN` ម្តងទៀត ដើម្បីប្រៀបធៀប Execution Cost!

### លំហាត់ទី ៣៖
បង្កើត Index លើ Table ថ្មីមួយរបស់អ្នក ដោយគោរពតាមច្បាប់ Leftmost Prefix Rule `(company_id, filter_col, sort_col)`។

---

*ឯកសារពាក់ព័ន្ធក្នុងគម្រោង៖*
- [Database Performance & Indexing Guide](file:///Users/macbook/Workspace/projects/showcase/khposcommerce/docs/database/database-performance-and-indexing.md)
- [Database Schema Overview](file:///Users/macbook/Workspace/projects/showcase/khposcommerce/docs/database/schema-overview.md)
- [Enterprise Performance Migration](file:///Users/macbook/Workspace/projects/showcase/khposcommerce/backendkhposcommerce/database/migrations/2026_09_10_000003_add_enterprise_performance_indexes.php)
