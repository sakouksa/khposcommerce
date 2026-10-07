import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';

class GlowingOrbWidget extends StatelessWidget {
  final double size;

  const GlowingOrbWidget({super.key, this.size = 90.0});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Ambient Outer Radial Glow
          Container(
            width: size * 1.8,
            height: size * 1.8,
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              gradient: AppColors.orbGlowGradient,
            ),
          ),
          // 3D Sphere Container
          Container(
            width: size,
            height: size,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: const RadialGradient(
                center: Alignment(-0.3, -0.4),
                radius: 0.85,
                colors: [
                  Color(0xFFE5FF66), // Bright highlight spot
                  Color(0xFF88B810), // Mid tone
                  Color(0xFF324D05), // Dark shadow
                  Color(0xFF0F1A02), // Deep shadow edge
                ],
              ),
              boxShadow: [
                BoxShadow(
                  color: AppColors.electricLime.withValues(alpha: 0.4),
                  blurRadius: 24,
                  spreadRadius: 2,
                ),
              ],
            ),
            child: const Center(
              child: Icon(
                Icons.storefront,
                size: 40,
                color: Color(0xFF0C0F0A),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
