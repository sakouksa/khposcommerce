import 'package:flutter_riverpod/flutter_riverpod.dart';

class PermissionGuard {
  final List<String> permissions;
  final List<String> roles;
  final bool isSuperAdmin;

  PermissionGuard({
    required this.permissions,
    required this.roles,
    this.isSuperAdmin = false,
  });

  factory PermissionGuard.fromUserMap(Map<String, dynamic>? userMap) {
    if (userMap == null) {
      return PermissionGuard(permissions: [], roles: []);
    }

    final rawRoles = userMap['roles'] ?? [];
    final List<String> rolesList = [];
    bool superAdmin = false;

    if (rawRoles is List) {
      for (var r in rawRoles) {
        if (r is String) {
          rolesList.add(r.toLowerCase());
          if (r.toLowerCase() == 'superadmin' || r.toLowerCase() == 'admin') {
            superAdmin = true;
          }
        } else if (r is Map && r['name'] != null) {
          final name = r['name'].toString().toLowerCase();
          rolesList.add(name);
          if (name == 'superadmin' || name == 'admin') {
            superAdmin = true;
          }
        }
      }
    }

    final rawPerms = userMap['permissions'] ?? [];
    final List<String> permsList = [];
    if (rawPerms is List) {
      for (var p in rawPerms) {
        if (p is String) {
          permsList.add(p.toLowerCase());
        } else if (p is Map && p['name'] != null) {
          permsList.add(p['name'].toString().toLowerCase());
        }
      }
    }

    return PermissionGuard(
      permissions: permsList,
      roles: rolesList,
      isSuperAdmin: superAdmin,
    );
  }

  bool hasPermission(String permission) {
    if (isSuperAdmin) return true;
    final target = permission.toLowerCase();
    return permissions.contains(target) || permissions.contains('*');
  }

  bool hasAnyPermission(List<String> requiredPermissions) {
    if (isSuperAdmin) return true;
    for (var req in requiredPermissions) {
      if (hasPermission(req)) return true;
    }
    return false;
  }

  bool hasRole(String role) {
    if (isSuperAdmin) return true;
    return roles.contains(role.toLowerCase());
  }
}

final permissionGuardProvider = StateProvider<PermissionGuard>((ref) {
  return PermissionGuard(permissions: [], roles: [], isSuperAdmin: true);
});
