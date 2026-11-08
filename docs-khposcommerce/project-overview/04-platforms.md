# 04. Connected Client Platforms

This document outlines the 4 interconnected applications operating against the OptaPOS Single Source of Truth backend.

---

## 1. Admin Dashboard (`admin-dashboard`)
* **Technology**: React 19, Vite 8, Ant Design 5, TypeScript 5.7, TanStack Query v5, Zustand, Axios.
* **Port**: `5173` (Production: `https://enterprise-pos-admin.vercel.app`)
* **Scope**: 258 Management Pages.
* **Key Capabilities**:
  - Multi-branch and multi-warehouse operational management.
  - Granular Spatie RBAC role & permission assignment (169 nodes).
  - Supplier procurement, purchase orders, goods receiving, and vendor bills.
  - Real-time sales monitoring, cash register shifts, and transaction audits.
  - Dynamic QR attendance generation with 60-second anti-fraud rotation.
  - Cambodian progressive tax payroll computation (Seniority, NSSF, Withholding Tax).

---

## 2. Customer Storefront (`customer-website`)
* **Technology**: React 19, Vite 8, Tailwind CSS 3.4, React Router v7, Zustand, React Helmet Async.
* **Port**: `5174` (Production: `https://enterprise-customer-store.vercel.app`)
* **Scope**: 28 Public Customer Pages.
* **Key Capabilities**:
  - E-Commerce product catalog with variant filtering (color, size, storage).
  - Multi-currency shopping cart (USD & KHR conversion at real-time NBC rate).
  - Direct Bakong KHQR checkout generation and webhook payment confirmation.
  - Customer account dashboard, order tracking, address book, and product reviews.
  - Enterprise SEO with Schema.org Product, Organization, and CollectionPage structured data.

---

## 3. Mobile POS Terminal (`mobile_app`)
* **Technology**: Flutter 3.24, Dart 3.2, Riverpod State Management, Hive NoSQL, Dio HTTP client.
* **Platforms**: iOS & Android.
* **Scope**: 69 Dart Files across 18 Business Features.
* **Key Capabilities**:
  - Fast touch cashier terminal for mobile POS sales and barcode scanning.
  - **Offline-First Synchronization**: Local transaction queuing in Hive NoSQL with automatic background sync when network connectivity is restored.
  - Bakong KHQR dynamic QR generation on device screen.
  - Bluetooth thermal receipt printing (ESC/POS protocol).

---

## 4. Central Backend Hub (`backend`)
* **Technology**: Laravel 12 on PHP 8.2, PostgreSQL 18 Alpine, Redis 7, Spatie Permission v6, `tymon/jwt-auth`.
* **Port**: `8000` (Production: `https://enterprise-pos-api.onrender.com`)
* **Scope**: 759 REST APIs across 74 Controllers, 89 Eloquent Models, 36 Migrations.
* **Key Capabilities**:
  - Atomic database transactions with `lockForUpdate()` row-level locks.
  - Dual JWT authentication with token refresh and automatic blacklist.
  - Multi-branch tenant data isolation with global query scopes.
  - Rate limiting, audit logging, and automated Redis sitemap caching.

---
*Related Docs:*
- [01-System Overview](file:///Users/macbook/Workspace/projects/showcase/Project-Enterprise-E-Commerce-POS-System/docs/project-overview/01-system-overview.md)
- [07-System Status](file:///Users/macbook/Workspace/projects/showcase/Project-Enterprise-E-Commerce-POS-System/docs/project-overview/07-system-status.md)
