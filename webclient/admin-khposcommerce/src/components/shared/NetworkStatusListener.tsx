import React, { useState, useEffect } from 'react'
import { WifiOff, RefreshCw } from 'lucide-react'

const NetworkStatusListener: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!isOffline) return null

  return (
    <div className="bg-amber-600 text-white px-4 py-2 text-xs font-medium flex items-center justify-between shadow-md z-[9999] relative animate-fade-in">
      <div className="flex items-center gap-2">
        <WifiOff size={16} className="animate-pulse shrink-0" />
        <span>
          <strong>Offline Mode:</strong> No internet connection. Please check your network connection.
        </span>
      </div>

      <button
        onClick={() => window.location.reload()}
        className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded text-white text-xs font-medium flex items-center gap-1 transition-colors"
      >
        <RefreshCw size={12} /> Retry
      </button>
    </div>
  )
}

export default NetworkStatusListener
