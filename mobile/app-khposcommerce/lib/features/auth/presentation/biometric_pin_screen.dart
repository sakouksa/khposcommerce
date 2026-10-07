import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/security/biometric_service.dart';

class BiometricPinScreen extends StatefulWidget {
  const BiometricPinScreen({super.key});

  @override
  State<BiometricPinScreen> createState() => _BiometricPinScreenState();
}

class _BiometricPinScreenState extends State<BiometricPinScreen> {
  String _pin = '';
  final BiometricService _biometricService = BiometricService();

  void _onKeyPress(String val) {
    if (_pin.length < 4) {
      setState(() => _pin += val);
      if (_pin.length == 4) {
        _verifyPin();
      }
    }
  }

  void _onDelete() {
    if (_pin.isNotEmpty) {
      setState(() => _pin = _pin.substring(0, _pin.length - 1));
    }
  }

  void _verifyPin() {
    if (_pin == '1234' || _pin == '0000') {
      context.go('/home');
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Invalid Security PIN'), backgroundColor: AppColors.danger),
      );
      setState(() => _pin = '');
    }
  }

  Future<void> _triggerBiometric() async {
    final success = await _biometricService.authenticate(
      localizedReason: 'Authenticate to access Enterprise POS Terminal',
    );
    if (success && mounted) {
      context.go('/home');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Terminal Security Lock')),
      body: SafeArea(
        child: Column(
          children: [
            const SizedBox(height: 30),
            const Icon(Icons.security, size: 64, color: AppColors.primary),
            const SizedBox(height: 16),
            const Text('Enter 4-Digit Security PIN', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(4, (index) {
                final isFilled = index < _pin.length;
                return Container(
                  margin: const EdgeInsets.symmetric(horizontal: 12),
                  width: 20,
                  height: 20,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: isFilled ? AppColors.primary : Colors.grey.shade300,
                  ),
                );
              }),
            ),
            const Spacer(),
            // Numeric Keypad
            GridView.count(
              shrinkWrap: true,
              crossAxisCount: 3,
              childAspectRatio: 1.5,
              padding: const EdgeInsets.symmetric(horizontal: 48),
              children: [
                ...List.generate(9, (index) {
                  final number = (index + 1).toString();
                  return KeypadButton(text: number, onTap: () => _onKeyPress(number));
                }),
                KeypadButton(
                  icon: Icons.fingerprint,
                  color: AppColors.accent,
                  onTap: _triggerBiometric,
                ),
                KeypadButton(text: '0', onTap: () => _onKeyPress('0')),
                KeypadButton(
                  icon: Icons.backspace_outlined,
                  onTap: _onDelete,
                ),
              ],
            ),
            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }
}

class KeypadButton extends StatelessWidget {
  final String? text;
  final IconData? icon;
  final Color? color;
  final VoidCallback onTap;

  const KeypadButton({super.key, this.text, this.icon, this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(40),
      child: Center(
        child: text != null
            ? Text(text!, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: color))
            : Icon(icon, size: 28, color: color ?? AppColors.primary),
      ),
    );
  }
}
