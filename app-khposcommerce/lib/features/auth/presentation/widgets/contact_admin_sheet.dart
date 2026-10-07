import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';

class ContactAdminSheet extends StatelessWidget {
  final bool isDark;

  const ContactAdminSheet({super.key, this.isDark = false});

  @override
  Widget build(BuildContext context) {
    final bg = isDark ? AppColors.surfaceDark : AppColors.surfaceLight;
    final textColor = isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;
    final secondaryTextColor = isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
    final borderColor = isDark ? AppColors.borderDark : AppColors.borderLight;

    return Container(
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Drag Handle
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: secondaryTextColor.withValues(alpha: 0.3),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 20),

          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.admin_panel_settings_rounded, color: AppColors.primary, size: 24),
              ),
              const SizedBox(width: 14),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Contact IT Administrator',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: textColor,
                    ),
                  ),
                  Text(
                    'Enterprise System Support & Credentials',
                    style: TextStyle(fontSize: 12, color: secondaryTextColor),
                  ),
                ],
              ),
            ],
          ),

          const SizedBox(height: 24),

          // Admin Info List
          _buildInfoItem(
            icon: Icons.support_agent_rounded,
            title: '24/7 Enterprise IT Helpdesk',
            subtitle: 'Extension: #4000 | Direct: +1 (800) 555-0199',
            borderColor: borderColor,
            textColor: textColor,
            subColor: secondaryTextColor,
          ),
          const SizedBox(height: 12),
          _buildInfoItem(
            icon: Icons.mark_email_read_rounded,
            title: 'System Admin Support Email',
            subtitle: 'support-erp@enterprise-pos.com',
            borderColor: borderColor,
            textColor: textColor,
            subColor: secondaryTextColor,
          ),
          const SizedBox(height: 12),
          _buildInfoItem(
            icon: Icons.location_city_rounded,
            title: 'HQ Security & Ops Center',
            subtitle: 'Building B, Floor 4, Suite 402',
            borderColor: borderColor,
            textColor: textColor,
            subColor: secondaryTextColor,
          ),

          const SizedBox(height: 24),

          // Close button
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              onPressed: () => Navigator.pop(context),
              child: const Text('Close Support Info', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required Color borderColor,
    required Color textColor,
    required Color subColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor),
      ),
      child: Row(
        children: [
          Icon(icon, color: AppColors.primary, size: 20),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: textColor)),
                const SizedBox(height: 2),
                Text(subtitle, style: TextStyle(fontSize: 12, color: subColor)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
