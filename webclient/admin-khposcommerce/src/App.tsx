import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ToastContainer from '@/components/ui/ToastContainer'
import ThemeSynchronizer from '@/components/shared/ThemeSynchronizer'
import NetworkStatusListener from '@/components/shared/NetworkStatusListener'
import MuiAppProvider from '@/components/shared/MuiAppProvider'
import { ErrorBoundary } from '@/components/common'
import { AppRoutes } from '@/routes'

// ─── Query Client ────────────────────────────────────────────────────────────

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// ─── App Component ───────────────────────────────────────────────────────────

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeSynchronizer />
    <MuiAppProvider>
      <BrowserRouter>
        <div className="h-full">
          <NetworkStatusListener />
          <ToastContainer />
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
        </div>
      </BrowserRouter>
    </MuiAppProvider>
  </QueryClientProvider>
)

export default App
