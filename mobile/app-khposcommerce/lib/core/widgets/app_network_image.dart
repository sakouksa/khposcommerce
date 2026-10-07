import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';

class AppNetworkImage extends StatelessWidget {
  final String? imageUrl;
  final double? width;
  final double? height;
  final BoxFit fit;
  final BorderRadius? borderRadius;
  final Widget? fallbackWidget;
  final IconData defaultIcon;

  const AppNetworkImage({
    super.key,
    required this.imageUrl,
    this.width,
    this.height,
    this.fit = BoxFit.cover,
    this.borderRadius,
    this.fallbackWidget,
    this.defaultIcon = Icons.image_not_supported_outlined,
  });

  static String resolveUrl(String? rawUrl) {
    if (rawUrl == null || rawUrl.isEmpty || rawUrl == '[]' || rawUrl == '""' || rawUrl == 'null') {
      return '';
    }

    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      if (rawUrl.contains('localhost') || rawUrl.contains('127.0.0.1')) {
        final clean = rawUrl
            .replaceAll(RegExp(r'^https?://(localhost|127\.0\.0\.1)(:\d+)?/?'), '')
            .replaceAll(RegExp(r'^(api/v1/)?storage/'), '');
        return 'https://enterprise-pos-api.onrender.com/api/v1/storage/$clean';
      }
      return rawUrl.replaceFirst('http://enterprise-pos-api.onrender.com', 'https://enterprise-pos-api.onrender.com');
    }

    final clean = rawUrl.replaceAll(RegExp(r'^/?(api/v1/storage/|storage/)?'), '');
    return 'https://enterprise-pos-api.onrender.com/api/v1/storage/$clean';
  }

  @override
  Widget build(BuildContext context) {
    final validUrl = resolveUrl(imageUrl);

    Widget placeholder = Container(
      width: width,
      height: height,
      color: Theme.of(context).colorScheme.surfaceContainerHighest.withValues(alpha: 0.5),
      child: Center(
        child: SizedBox(
          width: 20,
          height: 20,
          child: CircularProgressIndicator(
            strokeWidth: 2,
            valueColor: AlwaysStoppedAnimation<Color>(
              Theme.of(context).colorScheme.primary.withValues(alpha: 0.5),
            ),
          ),
        ),
      ),
    );

    Widget errorPlaceholder = fallbackWidget ??
        Container(
          width: width,
          height: height,
          color: Theme.of(context).colorScheme.surfaceContainerHighest.withValues(alpha: 0.5),
          child: Center(
            child: Icon(
              defaultIcon,
              size: (width != null && height != null) ? (width! < height! ? width! * 0.4 : height! * 0.4) : 24,
              color: Theme.of(context).colorScheme.onSurfaceVariant.withValues(alpha: 0.4),
            ),
          ),
        );

    Widget imageWidget;

    if (validUrl.isEmpty) {
      imageWidget = errorPlaceholder;
    } else {
      imageWidget = CachedNetworkImage(
        imageUrl: validUrl,
        width: width,
        height: height,
        fit: fit,
        placeholder: (context, url) => placeholder,
        errorWidget: (context, url, error) => errorPlaceholder,
      );
    }

    if (borderRadius != null) {
      return ClipRRect(
        borderRadius: borderRadius!,
        child: imageWidget,
      );
    }

    return imageWidget;
  }
}
