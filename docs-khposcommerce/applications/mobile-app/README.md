# 📱 Mobile POS Terminal Application Manual

## 1. Overview
The **OptaPOS Mobile POS App** is an offline-first, cross-platform mobile cashier and branch management application engineered in **Flutter 3.24** and **Dart 3.2**.

---

## 2. Architecture & Tech Stack

```
+---------------------------------------------------------------------------------------------------------------+
|                                      MOBILE POS TECHNICAL STACK                                               |
+---------------------------------------------------------------------------------------------------------------+
|  Framework          | Flutter 3.24.x + Dart 3.2+                                                              |
|  State Management   | Riverpod (StateNotifierProvider & AutoDisposeProvider)                                  |
|  Local Storage / DB | Hive NoSQL (^2.2.3) for Offline Transactions & Local Product Catalog Cache              |
|  Networking         | Dio (^5.4.0) with Retry Interceptors & Offline Request Queuing                           |
|  Hardware / POS     | mobile_scanner (Camera Barcode/QR) + esc_pos_printer (Bluetooth Thermal 58mm/80mm)     |
|  Supported OS       | Android 8.0+ (API 26+) & iOS 14.0+                                                      |
+---------------------------------------------------------------------------------------------------------------+
```

---

## 3. Directory Layout

```
mobile_app/
├── lib/
│   ├── core/                # Network clients, Theme, Constants, Utils, Storage
│   │   ├── api/             # Dio interceptors, JWT handler, Error mappings
│   │   ├── database/        # Hive box initializations & TypeAdapters
│   │   └── theme/           # App colors, Typography, Dark mode support
│   ├── features/            # 18 Modular Domain Features
│   │   ├── auth/            # Staff PIN login, Biometrics, Branch selection
│   │   ├── pos/             # Cashier cart, Barcode scanning, Split payment, KHQR
│   │   ├── product/         # Product catalog, Search, Variant selection
│   │   ├── inventory/       # Stock check, Quick adjustment, Stock counts
│   │   ├── attendance/      # Dynamic QR scanner for clock-in/out
│   │   ├── sales/           # Transaction history, Receipt re-printing
│   │   ├── purchase/        # PO receiving and vendor inspection
│   │   ├── notification/    # Local push alerts & Low stock notifications
│   │   └── settings/        # Printer configuration (Bluetooth/WiFi), Language
│   └── main.dart            # Flutter entry point & Dependency Container
```

---

## 4. Offline Synchronization Protocol

1. **Transaction Queuing**: When connectivity drops (`ConnectivityResult.none`), completed sales are serialized as encrypted JSON payloads and appended to the Hive `offline_sales_box`.
2. **Background Sync**: An active connectivity listener monitors network restoration.
3. **Bulk Dispatch**: When the device reconnects, the `OfflineSyncService` executes `POST /api/v1/pos/sync-offline-sales` with idempotency tokens to prevent duplicate charging.

---
*Related Docs:*
- [POS Subsystem Manual](file:///Users/macbook/Workspace/projects/showcase/Project-Enterprise-E-Commerce-POS-System/docs/pos/README.md)
- [Backend POS APIs](file:///Users/macbook/Workspace/projects/showcase/Project-Enterprise-E-Commerce-POS-System/docs/api/pos-and-sales.md)
