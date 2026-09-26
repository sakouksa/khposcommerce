# 📱 Flutter Mobile Assets

This folder stores static assets bundled with the Flutter Mobile application (`appkhposcommerce`).

## Directory Organization
- **`sounds/`**: Audio files for POS interactions (e.g. `barcode_beep.mp3`, `payment_success.wav`).
- **`fonts/`**: Google Khmer Fonts (`KantumruyPro-Regular.ttf`, `KantumruyPro-Bold.ttf`).
- **`images/`**: Brand logos, placeholder images, and receipt header graphics.

## Registering Assets in `pubspec.yaml`
```yaml
flutter:
  assets:
    - assets/sounds/
    - assets/images/
  fonts:
    - family: KantumruyPro
      fonts:
        - asset: assets/fonts/KantumruyPro-Regular.ttf
        - asset: assets/fonts/KantumruyPro-Bold.ttf
          weight: 700
```
