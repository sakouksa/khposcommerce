import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';

class EnterpriseTextField extends StatefulWidget {
  final TextEditingController controller;
  final String label;
  final String hint;
  final IconData leadingIcon;
  final Widget? suffixIcon;
  final bool obscureText;
  final TextInputType keyboardType;
  final String? Function(String?)? validator;
  final ValueChanged<String>? onChanged;
  final bool isDark;

  const EnterpriseTextField({
    super.key,
    required this.controller,
    required this.label,
    required this.hint,
    required this.leadingIcon,
    this.suffixIcon,
    this.obscureText = false,
    this.keyboardType = TextInputType.text,
    this.validator,
    this.onChanged,
    this.isDark = false,
  });

  @override
  State<EnterpriseTextField> createState() => _EnterpriseTextFieldState();
}

class _EnterpriseTextFieldState extends State<EnterpriseTextField> {
  final FocusNode _focusNode = FocusNode();
  bool _isFocused = false;

  @override
  void initState() {
    super.initState();
    _focusNode.addListener(() {
      setState(() {
        _isFocused = _focusNode.hasFocus;
      });
    });
  }

  @override
  void dispose() {
    _focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final cardBg = widget.isDark ? AppColors.darkInputFill : AppColors.lightInputFill;
    final textColor = widget.isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight;
    final secondaryTextColor = widget.isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight;
    final borderColor = widget.isDark ? AppColors.borderDark : AppColors.borderLight;
    final focusColor = AppColors.primary;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Field Label
        Padding(
          padding: const EdgeInsets.only(left: 2, bottom: 4),
          child: Text(
            widget.label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: _isFocused ? focusColor : textColor.withValues(alpha: 0.85),
            ),
          ),
        ),

        // Animated Input Container
        AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            boxShadow: _isFocused
                ? [
                    BoxShadow(
                      color: focusColor.withValues(alpha: 0.16),
                      blurRadius: 10,
                      spreadRadius: 1,
                    ),
                  ]
                : [],
          ),
          child: TextFormField(
            controller: widget.controller,
            focusNode: _focusNode,
            obscureText: widget.obscureText,
            keyboardType: widget.keyboardType,
            style: TextStyle(
              color: textColor,
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
            onChanged: widget.onChanged,
            validator: widget.validator,
            decoration: InputDecoration(
              isDense: true,
              hintText: widget.hint,
              hintStyle: TextStyle(
                color: secondaryTextColor.withValues(alpha: 0.5),
                fontSize: 13,
              ),
              filled: true,
              fillColor: cardBg,
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              prefixIcon: AnimatedSwitcher(
                duration: const Duration(milliseconds: 180),
                child: Icon(
                  widget.leadingIcon,
                  key: ValueKey(_isFocused),
                  color: _isFocused ? focusColor : secondaryTextColor,
                  size: 18,
                ),
              ),
              suffixIcon: widget.suffixIcon,
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide(color: borderColor, width: 1.1),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide(color: focusColor, width: 1.8),
              ),
              errorBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: const BorderSide(color: AppColors.danger, width: 1.2),
              ),
              focusedErrorBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: const BorderSide(color: AppColors.danger, width: 1.8),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
