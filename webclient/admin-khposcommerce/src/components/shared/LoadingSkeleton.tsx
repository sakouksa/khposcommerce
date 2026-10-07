import React from 'react'

interface LoadingSkeletonProps {
  cols: number
  rows?: number
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ cols, rows = 5 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="p-4">
              <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

export default LoadingSkeleton
