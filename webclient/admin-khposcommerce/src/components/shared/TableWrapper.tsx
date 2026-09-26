import React from 'react'
import { Loader2 } from 'lucide-react'

interface TableWrapperProps {
  isFetching?: boolean
  children: React.ReactNode
}

export const TableWrapper: React.FC<TableWrapperProps> = ({ isFetching = false, children }) => {
  return (
    <div className="relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden">
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
