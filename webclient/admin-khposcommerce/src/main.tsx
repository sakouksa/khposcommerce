import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ensureLanguageLoaded, buildActiveDict } from './lib/i18n'
import { initCambodiaTimezoneGlobally } from './utils/formatters'

// Enforce Asia/Phnom_Penh as global default timezone for all date/time operations
initCambodiaTimezoneGlobally()

const savedLanguage = localStorage.getItem('enterprise-pos-lang') || 'km'

async function bootstrap() {
  await ensureLanguageLoaded(savedLanguage)
  buildActiveDict()

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}

bootstrap().catch(console.error)
