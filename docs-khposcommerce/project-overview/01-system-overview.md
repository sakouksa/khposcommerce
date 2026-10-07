# 01. System Overview & Executive Summary

## 1. Overview
**OptaPOS** is an enterprise-grade, omni-channel retail management ecosystem designed to bridge high-speed retail checkout, e-commerce storefronts, multi-warehouse inventory control, supply chain procurement, anti-fraud attendance, and Cambodian tax payroll into a **single, unified Laravel 12 + PostgreSQL 18 architecture**.

## 2. Why It Exists (Business Problem Solved)
Traditional retail enterprises suffer from fragmented software silos:
- POS software runs separately from the online store, causing **race conditions and phantom stock overselling**.
- Inventory is calculated across multiple mismatched databases, creating accounting discrepancies.
- Attendance and payroll require manual spreadsheet calculations vulnerable to buddy punching and tax miscalculations.

OptaPOS eliminates these silos by deploying a **Single Source of Truth** where every sale, transfer, purchase, and clock-in is validated by atomic database transactions with row-level locks.

## 3. The 4 Connected Client Applications
1. **Admin Dashboard (React 19 + Ant Design 5)**: 258 pages covering operations, branch analytics, permissions, inventory, and procurement.
2. **Customer Storefront (React 19 + Tailwind CSS)**: 28 pages supporting catalog browsing, multi-currency cart, Bakong KHQR checkout, and order tracking.
3. **Mobile POS Terminal (Flutter 3.24 + Hive NoSQL)**: Cashier mobile app with offline transaction queuing, barcode scanning, and receipt printing.
4. **Backend REST Engine (Laravel 12 on PHP 8.2)**: 759 REST APIs across 74 Controllers, executing business logic via Service-Repository pattern.

## 4. Key Metrics at a Glance
- **PostgreSQL 18 Tables**: 99 Normalized Tables (36 Migrations)
- **Eloquent Models**: 89 Rich Domain Models
- **REST Endpoints**: 759 REST APIs
- **Spatie RBAC Permissions**: 169 Fine-grained Permission Nodes
- **Supported Locales**: 5 Languages (Khmer, English, Thai, Vietnamese, Chinese)

---
*Related Docs:*
- [04-Platforms](file:///Users/macbook/Workspace/projects/showcase/Project-Enterprise-E-Commerce-POS-System/docs/project-overview/04-platforms.md)
- [High-Level Architecture](file:///Users/macbook/Workspace/projects/showcase/Project-Enterprise-E-Commerce-POS-System/docs/architecture/01-high-level-architecture.md)
