import React from 'react'
import { QueryProvider, ThemeProvider, FaviconProvider } from './providers'
import { AppRouter } from './router'

export const App: React.FC = () => {
  return (
    <QueryProvider>
      <ThemeProvider>
        <FaviconProvider>
          <AppRouter />
        </FaviconProvider>
      </ThemeProvider>
    </QueryProvider>
  )
}

export default App
