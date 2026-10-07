# 📱 Mobile Application Architecture (Flutter)

## 1. Overview

The mobile application (`mobile_app/`) is built using **Flutter 3.x** and **Dart**, designed to provide an enterprise-grade mobile POS and on-the-go stock auditing tool for retail floor associates, store managers, and field sales teams.

---

## 2. Directory Structure (`mobile_app/lib/`)

```text
mobile_app/lib/
├── core/
│   ├── api/                 # Dio HTTP Client, Interceptors, Token Refresh
│   ├── database/            # Local SQLite / Hive for offline caching
│   ├── theme/               # Modern Dark & Light Material 3 Themes
│   └── utils/               # Currency formatters, Barcode parsers, Helpers
├── features/
│   ├── auth/                # Login, Biometrics, Pin Authentication
│   ├── catalog/             # Mobile Product Browser & Search
│   ├── pos/                 # Mobile Register, Cart, Split Tender, Discount
│   ├── scanner/             # Hardware / Camera Barcode Scanning Engine
│   ├── inventory/           # Fast stock lookup & Cycle counting (Opname)
│   └── printing/            # Bluetooth / ESC-POS thermal receipt printer
├── l10n/                    # Localization ARB files (Khmer, English, Chinese, Thai, Vietnamese)
└── main.dart                # Application entrypoint
```

---

## 3. Key Capabilities

1. **Camera Barcode & QR Code Scanning**:
   - Supports instant camera scanning via `mobile_scanner` or hardware Bluetooth laser scanners.
2. **Offline-First Synchronization**:
   - Stores transactions and stock audit lines locally in SQLite / Hive cache when internet connectivity is lost, auto-synchronizing with the Laravel backend when connection is restored.
3. **Thermal Receipt Printing**:
   - Built-in ESC/POS Bluetooth and network thermal printer driver support (58mm and 80mm roll sizes).
