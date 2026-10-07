# 🔔 Enterprise Notifications Architecture

## 1. Multi-Channel Notification Pipeline

The platform supports in-app popovers, real-time alerts, email notifications, and SMS/Telegram webhook dispatches.

```mermaid
flowchart LR
    Event[System Event\ne.g. Low Stock / Sale Complete] --> Service[NotificationService]
    Service --> Template[Render NotificationTemplate]
    Service --> DB[(enterprise_notifications Table)]
    Service --> Queue[Redis Notification Queue]
    
    Queue --> Mail[Email SMTP / SES]
    Queue --> Telegram[Telegram Bot Webhook]
    Queue --> MobilePush[Firebase Cloud Messaging FCM]
```

---

## 2. Notification Data Model

- `enterprise_notifications`: Stores individual notification instances per user (`user_id`, `type`, `title`, `message`, `data`, `read_at`).
- `notification_templates`: Configurable multilingual templates with dynamic variable placeholders (`{order_number}`, `{customer_name}`, `{stock_qty}`).
- `notification_settings`: Per-user subscription preferences (e.g., enable/disable email for low-stock alerts).
