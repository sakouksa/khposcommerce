import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/enterprise_app_bar.dart';
import '../../../core/widgets/enterprise_drawer.dart';
import '../../../core/widgets/enterprise_card.dart';

class NotificationScreen extends StatelessWidget {
  const NotificationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final notifications = [
      {
        'title': 'Low Stock Alert: MacBook Pro M3',
        'message': 'Warehouse Phnom Penh Main WH stock reached minimum threshold (3 items left).',
        'time': '10 mins ago',
        'type': 'inventory',
        'isRead': false,
      },
      {
        'title': 'Large Sales Transaction Completed',
        'message': 'Invoice INV-2026-9081 completed by Cashier Admin for \$3,898.00 via POS Cash.',
        'time': '1 hour ago',
        'type': 'sales',
        'isRead': false,
      },
      {
        'title': 'System Security Alert',
        'message': 'New login detected on Mobile Terminal #4 from IP 192.168.1.105.',
        'time': '3 hours ago',
        'type': 'security',
        'isRead': true,
      },
    ];

    return Scaffold(
      appBar: const EnterpriseAppBar(title: 'Notifications & Alerts'),
      drawer: const EnterpriseDrawer(),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: notifications.length,
        itemBuilder: (context, index) {
          final n = notifications[index];
          final isUnread = !(n['isRead'] as bool);
          final type = n['type'] as String;

          IconData icon = Icons.notifications;
          Color color = AppColors.primary;
          if (type == 'inventory') {
            icon = Icons.warning_amber;
            color = AppColors.warning;
          } else if (type == 'sales') {
            icon = Icons.attach_money;
            color = AppColors.success;
          } else if (type == 'security') {
            icon = Icons.security;
            color = AppColors.danger;
          }

          return EnterpriseCard(
            backgroundColor: isUnread ? color.withValues(alpha: 0.06) : null,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                CircleAvatar(
                  backgroundColor: color.withValues(alpha: 0.12),
                  child: Icon(icon, color: color),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(n['title'] as String, style: TextStyle(fontWeight: isUnread ? FontWeight.bold : FontWeight.normal, fontSize: 14)),
                          ),
                          Text(n['time'] as String, style: const TextStyle(fontSize: 11, color: AppColors.textSecondaryLight)),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(n['message'] as String, style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryLight)),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
