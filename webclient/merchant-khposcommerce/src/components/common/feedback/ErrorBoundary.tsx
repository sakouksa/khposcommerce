import React, { Component, type ErrorInfo, type ReactNode } from 'react'
import HttpErrorPage from '@/components/shared/HttpErrorPage'

export interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode | ((error: Error | null, reset: () => void) => ReactNode)
  /** If true, error renders cleanly within the current layout (e.g. keeping sidebar & header intact) */
  inLayout?: boolean
  /** Keys that trigger an automatic error boundary reset when changed (e.g. location.pathname) */
  resetKeys?: unknown[]
  /** Callback fired when an error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  /** Callback fired when the error boundary is reset */
  onReset?: () => void
}

export interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

// ─── ErrorBoundary Class Component ───────────────────────────────────────────

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })
    console.error('ErrorBoundary caught a frontend application error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // If resetKeys changed (e.g. user clicked another route/page), auto-reset error state
    if (this.state.hasError && this.props.resetKeys && prevProps.resetKeys) {
      const hasChanged = this.props.resetKeys.some(
        (key, idx) => key !== prevProps.resetKeys?.[idx]
      )
      if (hasChanged) {
        this.handleReset()
      }
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
    this.props.onReset?.()
  }

  handleHardReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(this.state.error, this.handleReset)
      }
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Render Application Error page using pure shadcn/ui
      return (
        <HttpErrorPage
          code="app"
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          fullPage={true}
          showRetryButton
          showHomeButton
          showBackButton
          showContactButton
          onRetry={this.handleReset}
        />
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
