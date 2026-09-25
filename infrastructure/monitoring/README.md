# 📊 Production Metrics & Observability

This folder contains Prometheus configurations for monitoring POS transactions, database queries, and response latencies across KHPosCommerce services.

## Key Metrics Monitored
- **POS Sale Throughput**: Orders processed per minute
- **Stock Lock Latency**: Time taken for row-locking transactions during high-concurrency checkout
- **KHQR Webhook Latency**: Response times for payment provider callbacks
