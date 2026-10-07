import 'package:flutter/material.dart';

/// Enterprise Modern Clean Palette (Matching reference POS & ERP design)
class AppColors {
  // Primary & Secondary Brand Colors
  static const Color primary = Color(0xFF0F4C5C);       // Enterprise Deep Cyan (#0F4C5C)
  static const Color primaryBlue = Color(0xFF2563EB);   // Royal Blue (#2563EB)
  static const Color primaryDark = Color(0xFF3B82F6);   // Blue 500 (#3B82F6)
  static const Color secondary = Color(0xFF0284C7);     // Ocean Cyan (#0284C7)
  static const Color accent = Color(0xFF0EA5E9);        // Sky Blue (#0EA5E9)
  static const Color electricLime = Color(0xFFD4F642);

  // Neutral Colors (Light Theme - Soft Ice-Cyan Tint matching reference screenshot)
  static const Color backgroundLight = Color(0xFFEBF3F6); // Soft Ice-Cyan (#EBF3F6)
  static const Color surfaceLight = Color(0xFFFFFFFF);    // Pure White Card
  static const Color cardLight = Color(0xFFFFFFFF);
  static const Color lightInputFill = Color(0xFFFFFFFF);
  static const Color borderLight = Color(0xFFD8E6EA);     // Soft Ice Border
  static const Color textPrimaryLight = Color(0xFF0F172A); // Dark Slate 900
  static const Color textSecondaryLight = Color(0xFF64748B); // Slate 500

  // Neutral Colors (Dark Theme)
  static const Color backgroundDark = Color(0xFF0F172A);  // Slate 900 (#0F172A)
  static const Color surfaceDark = Color(0xFF1E293B);     // Slate 800 (#1E293B)
  static const Color cardDark = Color(0xFF1E293B);
  static const Color darkInputFill = Color(0xFF0F172A);
  static const Color borderDark = Color(0xFF334155);      // Slate 700
  static const Color textPrimaryDark = Color(0xFFF8FAFC); // Slate 50
  static const Color textSecondaryDark = Color(0xFF94A3B8); // Slate 400

  // Status & Indicator Colors
  static const Color success = Color(0xFF10B981);       // Emerald (#10B981)
  static const Color warning = Color(0xFFF59E0B);       // Amber (#F59E0B)
  static const Color danger = Color(0xFFEF4444);        // Red/Rose (#EF4444)
  static const Color info = Color(0xFF3B82F6);          // Blue

  // Enterprise Hero & Gradients
  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF0F4C5C), Color(0xFF0284C7)],
  );

  static const LinearGradient heroGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF0B3C49), Color(0xFF0F4C5C), Color(0xFF0284C7)],
  );

  static const LinearGradient heroDarkGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF0B132B), Color(0xFF1E293B), Color(0xFF312E81)],
  );

  static const RadialGradient orbGlowGradient = RadialGradient(
    colors: [Color(0xFF0F4C5C), Color(0x440284C7), Colors.transparent],
    stops: [0.2, 0.6, 1.0],
  );

  static const LinearGradient glassGradientLight = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xE6FFFFFF), Color(0xB3FFFFFF)],
  );

  static const LinearGradient glassGradientDark = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xE61E293B), Color(0xB31E293B)],
  );
}
