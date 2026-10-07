import React from 'react'
import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

interface TableWrapperProps {
  isFetching?: boolean
  className?: string
  children: React.ReactNode
}

export const TableWrapper: React.FC<TableWrapperProps> = ({ isFetching = false, className, children }) => {
  return (
    <div className={cn("relative bg-card rounded-2xl border border-border shadow-xs overflow-hidden", className)}>
      {isFetching && (
        <div className="absolute inset-0 bg-background/30 backdrop-blur-[1px] flex items-center justify-center z-10 transition-opacity">
          <Loader2 className="w-7 h-7 animate-spin text-cyan-600 dark:text-cyan-400" />
        </div>
      )}
      <div className="overflow-x-auto w-full">
        {children}
      </div>
    </div>
  )
}

export default TableWrapper
