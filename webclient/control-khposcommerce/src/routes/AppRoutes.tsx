import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from '@/components/layout/AdminLayout'
import { ProtectedRoute } from './guards/ProtectedRoute'
import { PublicRoute } from './guards/PublicRoute'
import { PageFallback } from './components/PageFallback'
import HttpErrorPage from '@/components/shared/HttpErrorPage'

// ─── 1. Auth & Public Pages ──────────────────────────────────────────────────
const LoginPage = React.lazy(() => import('@/pages/auth/LoginPage'))

// ─── 2. Platform SaaS Core Pages ─────────────────────────────────────────────
const DashboardPage = React.lazy(() => import('@/pages/DashboardPage').then(m => ({ default: m.PlatformDashboardPage || m.DashboardPage })))
const ShopsPage = React.lazy(() => import('@/pages/ShopsPage').then(m => ({ default: m.ShopsPage })))
const PlansPage = React.lazy(() => import('@/pages/PlansPage').then(m => ({ default: m.PlansPage })))
const PlaceholderPage = React.lazy(() => import('@/pages/PlaceholderPage').then(m => ({ default: m.PlaceholderPage })))

// ─── 3. Users, Roles & Permissions ───────────────────────────────────────────
const UsersPage = React.lazy(() => import('@/pages/users/UsersPage'))
const RolesPage = React.lazy(() => import('@/pages/roles/RolesPage'))
const PermissionsPage = React.lazy(() => import('@/pages/permissions/PermissionsPage'))

// ─── 4. Operations, Audit & Notifications ────────────────────────────────────
const ActivityLogsPage = React.lazy(() => import('@/pages/logs/ActivityLogsPage'))
const NotificationListPage = React.lazy(() => import('@/pages/notifications/NotificationListPage'))
const NotificationTemplateListPage = React.lazy(() => import('@/pages/notifications/NotificationTemplateListPage'))
const NotificationSettingsPage = React.lazy(() => import('@/pages/notifications/NotificationSettingsPage'))
const ChatbotManagementPage = React.lazy(() => import('@/pages/chatbot/ChatbotManagementPage'))

// ─── 5. Platform Settings & Profile ──────────────────────────────────────────
const SettingsPage = React.lazy(() => import('@/pages/settings/SettingsPage'))
const ProfilePage = React.lazy(() => import('@/pages/profile/ProfilePage'))

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* ── Public Auth Routes ────────────────────────────────────────────── */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* ── Protected SaaS Platform Routes ─────────────────────────────────── */}
        <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>

          {/* 1. Dashboard */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/platform/dashboard" element={<DashboardPage />} />

          {/* 2. Shops & Tenants */}
          <Route path="/shops" element={<ShopsPage />} />

          {/* 3. Subscription Plans */}
          <Route path="/plans" element={<PlansPage />} />

          {/* 4. Billing & Invoices */}
          <Route
            path="/billing"
            element={
              <PlaceholderPage
                title="វិក្កយបត្រ SaaS (Billing & Invoices)"
                subtitle="គ្រប់គ្រងវិក្កយបត្រ ការទូទាត់កញ្ចប់សេវា SaaS តាម Bakong KHQR"
              />
            }
          />

          {/* 5. Resellers & Partners */}
          <Route
            path="/resellers"
            element={
              <PlaceholderPage
                title="ដៃគូចែកចាយ (Resellers & Partners)"
                subtitle="គ្រប់គ្រងភ្នាក់ងារចែកចាយប្រព័ន្ធ POS និងកម្រៃជើងសារ (Commission)"
              />
            }
          />

          {/* 6. Super Admins & Staff */}
          <Route path="/users" element={<UsersPage />} />

          {/* 7. Roles & Permissions */}
          <Route path="/roles" element={<RolesPage />} />
          <Route path="/permissions" element={<PermissionsPage />} />

          {/* 8. System Health & Backup */}
          <Route
            path="/backup"
            element={
              <PlaceholderPage
                title="សុខភាពប្រព័ន្ធ & Backup"
                subtitle="ស្ថានភាព Database, Server Load, និង Cloud Storage Backup"
              />
            }
          />

          {/* 9. Activity & Audit Logs */}
          <Route path="/activity-logs" element={<ActivityLogsPage />} />

          {/* 10. Platform Settings */}
          <Route path="/settings" element={<SettingsPage />} />

          {/* 11. Broadcast Notifications */}
          <Route path="/notifications" element={<NotificationListPage />} />
          <Route path="/notification-templates" element={<NotificationTemplateListPage />} />
          <Route path="/notifications/settings" element={<NotificationSettingsPage />} />

          {/* 12. AI Chatbot & Telegram */}
          <Route path="/chatbot" element={<ChatbotManagementPage />} />

          {/* Super Admin Profile */}
          <Route path="/profile" element={<ProfilePage />} />

          {/* Fallback */}
          <Route path="*" element={<HttpErrorPage code={404} />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default AppRoutes
