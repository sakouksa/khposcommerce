import React from 'react'
import HttpErrorPage from './HttpErrorPage'

/**
 * 403 Access Denied page — rendered by ProtectedRoute when permission check fails.
 * Uses the unified HttpErrorPage with Ant Design (antd) Result component.
 */
const AccessDeniedPage: React.FC = () => (
  <HttpErrorPage
    code={403}
    showRetryButton={false}
    showContactButton
  />
)

export default AccessDeniedPage
