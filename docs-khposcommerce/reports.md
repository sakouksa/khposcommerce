# 📊 Analytics & Financial Reports Architecture

## 1. Overview of Reporting Modules

The reporting engine calculates real-time aggregated metrics directly from database tables, supporting customizable date ranges, warehouse filters, and multi-currency formats without hardcoded mock data.

---

## 2. Report Breakdown & Calculations

### 2.1 Sales Reports (`/api/v1/reports/sales/...`)
- **Gross Revenue**: `SUM(grand_total)` across completed POS sales and fulfilled e-commerce orders.
- **Net Profit**: `SUM(item.selling_price - item.cost_price)` calculated dynamically using item-level historical cost prices.
- **Average Order Value (AOV)**: `Gross Revenue / Total Completed Orders`.
- **Top Performing SKUs**: Ranked by quantity sold and revenue contribution.
- **Payment Tender Distribution**: Breakdown of Cash, ABA PayWay, KHQR, Visa/Mastercard.

### 2.2 Inventory Valuation Reports (`/api/v1/reports/inventory/...`)
- **Total Stock Valuation (Cost)**: `SUM(inventories.quantity * products.cost_price)`.
- **Total Stock Valuation (Retail)**: `SUM(inventories.quantity * products.selling_price)`.
- **Potential Gross Profit**: `Retail Value - Cost Value`.
- **Stock Turnover Ratio**: `Cost of Goods Sold (COGS) / Average Inventory Value`.
- **Aging & Dead Stock Analysis**: Products with zero movement over 30, 60, 90+ days.

### 2.3 Purchase & Vendor Reports (`/api/v1/reports/purchase/...`)
- **Total Spend by Supplier**: Sum of fulfilled purchase orders.
- **Outstanding Payable**: Difference between `grand_total` and `paid_amount` on open POs.
- **Purchase Return Rate**: Percentage of goods returned for credit or replacement.

### 2.4 Date Range & Timezone Handling
- Filters support: `today`, `yesterday`, `this_week`, `this_month`, `last_month`, `this_year`, and `custom_range` (`start_date` to `end_date`).
- Query times are stored in UTC in MySQL and rendered in local business timezone (e.g., `Asia/Phnom_Penh` UTC+7).
