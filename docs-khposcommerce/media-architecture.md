# 🌐 Media Architecture & Global URL Resolution Strategy

> **Single Source of Truth (SSOT) Media Resolution Guide**

---

## 📌 Core Media URL Resolution Principle

Frontend code (Admin, Customer, or Mobile) must **NEVER** manually concatenate `http://localhost:8001/storage/...` or hardcode IP addresses.

### The Canonical Resolution Matrix

```ts
resolveMediaUrl(pathOrObject, fallbackType)
```

1. **Null / Empty / "[]" / '""'**:
   * Returns standard category/entity fallback or default asset.
2. **Data URI (`data:image/...`) or Blob (`blob:http...`)**:
   * Returned immediately without transformation (used for instant client upload previews).
3. **Local Public Assets (`/logo.svg`, `/logo.png`, `/favicon.ico`, `/images/...`)**:
   * Returned unchanged as relative root assets for the frontend SPA.
4. **Absolute CDN / HTTPS URLs (`https://images.unsplash.com/...`, `https://res.cloudinary.com/...`)**:
   * Returned directly.
5. **Legacy Localhost URLs from Database Seeds (`http://127.0.0.1:8001/storage/...`)**:
   * Rewritten dynamically to `${BACKEND_ORIGIN}/api/v1/storage/...`.
6. **Relative Storage Paths (`products/1/p1.webp`, `storage/companies/logo.png`)**:
   * Normalized and prepended with `${BACKEND_ORIGIN}/api/v1/storage/...`.

---

## 💻 Code Examples

### 1. In Admin Dashboard (React 19)
```tsx
import { AppImage, AvatarImage } from '@/components/common'

// Product Image with category fallback
<AppImage
  src={product.primary_image}
  fallbackType="product"
  alt={product.name}
  aspectRatio="square"
  className="rounded-xl shadow-xs"
/>

// Employee / User Avatar with initial badge
<AvatarImage
  src={employee.photo}
  name={employee.name}
  size="md"
  status="online"
/>
```

### 2. In Customer Website (React 19)
```tsx
import { ImageWithFallback } from '@/components/common/ImageWithFallback'

<ImageWithFallback
  src={product.primary_image}
  fallbackType="product"
  alt={product.name}
  aspectRatio="square"
  className="group-hover:scale-105 transition-transform"
/>
```

### 3. In Flutter Mobile App
```dart
import 'package:ecommerce_pos/core/widgets/app_network_image.dart';

AppNetworkImage(
  imageUrl: product.primaryImage,
  width: 80,
  height: 80,
  borderRadius: BorderRadius.circular(12),
  fit: BoxFit.cover,
)
```
