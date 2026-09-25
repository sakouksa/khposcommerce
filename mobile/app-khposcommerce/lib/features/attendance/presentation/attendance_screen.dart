import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/enterprise_app_bar.dart';
import '../../../core/widgets/enterprise_drawer.dart';
import '../../../core/widgets/enterprise_card.dart';

class AttendanceScreen extends StatefulWidget {
  const AttendanceScreen({super.key});

  @override
  State<AttendanceScreen> createState() => _AttendanceScreenState();
}

class _AttendanceScreenState extends State<AttendanceScreen> {
  bool _isCheckedIn = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const EnterpriseAppBar(title: 'Attendance & Time Tracker'),
      drawer: const EnterpriseDrawer(),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Check-In Status Card
            EnterpriseCard(
              backgroundColor: AppColors.heroGradient.colors.first,
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Today\'s Shift: 08:00 AM - 05:00 PM', style: TextStyle(color: Colors.white70, fontSize: 13)),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: _isCheckedIn ? AppColors.success : AppColors.danger,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          _isCheckedIn ? 'ON DUTY' : 'OFF DUTY',
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  const Text('08:02 AM', style: TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.bold)),
                  const Text('Checked In • GPS Verified (HQ Branch)', style: TextStyle(color: Colors.white70, fontSize: 12)),
                  const SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildMetricTile('Working Hours', '7h 45m', Icons.timer),
                      _buildMetricTile('Late Minutes', '2 mins', Icons.access_time_filled),
                      _buildMetricTile('Overtime', '1h 30m', Icons.more_time),
                    ],
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _isCheckedIn ? AppColors.danger : AppColors.success,
                      ),
                      onPressed: () {
                        setState(() => _isCheckedIn = !_isCheckedIn);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text(_isCheckedIn ? 'Checked in successfully!' : 'Checked out successfully!')),
                        );
                      },
                      icon: Icon(_isCheckedIn ? Icons.logout : Icons.login),
                      label: Text(_isCheckedIn ? 'CLOCK OUT NOW' : 'CLOCK IN NOW', style: const TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Attendance QR Code Generator for Staff Scan
            EnterpriseCard(
              child: Column(
                children: [
                  const Text('Branch Attendance QR Code', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 4),
                  const Text('Scan with staff app or kiosk terminal', style: TextStyle(fontSize: 12, color: AppColors.textSecondaryLight)),
                  const SizedBox(height: 16),
                  QrImageView(
                    data: 'BRANCH_HQ_ATTENDANCE_TIMESTAMP_${DateTime.now().millisecondsSinceEpoch}',
                    version: QrVersions.auto,
                    size: 160.0,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Recent Logs
            const Align(
              alignment: Alignment.centerLeft,
              child: Text('Recent Attendance Logs', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            ),
            const SizedBox(height: 12),
            _buildLogTile('Today (Jul 24)', 'In: 08:02 AM • Out: Pending', 'Punctual (GPS Validated)'),
            _buildLogTile('Yesterday (Jul 23)', 'In: 07:58 AM • Out: 06:15 PM', 'Overtime +1h 15m'),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricTile(String label, String value, IconData icon) {
    return Column(
      children: [
        Icon(icon, color: Colors.white70, size: 20),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
        Text(label, style: const TextStyle(color: Colors.white70, fontSize: 11)),
      ],
    );
  }

  Widget _buildLogTile(String date, String time, String status) {
    return EnterpriseCard(
      padding: const EdgeInsets.all(14),
      child: Row(
        children: [
          const Icon(Icons.fingerprint, color: AppColors.primary),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(date, style: const TextStyle(fontWeight: FontWeight.bold)),
                Text(time, style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryLight)),
              ],
            ),
          ),
          Text(status, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.success)),
        ],
      ),
    );
  }
}
