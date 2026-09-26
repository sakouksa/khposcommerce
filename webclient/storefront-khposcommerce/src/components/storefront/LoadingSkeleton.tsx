import React from 'react'
import { cn } from '@/lib/utils'

interface LoadingSkeletonProps {
  type?: 'banner' | 'grid' | 'categories'
  count?: number
  className?: string
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  type = 'grid',
  count = 6,
  className,
}) => {
  if (type === 'banner') {
    return (
      <div className={cn('container-site pt-6', className)}>
        <div className="w-full h-[440px] rounded-3xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
      </div>
    )
  }

  if (type === 'categories') {
    return (
      <div className={cn('container-site py-6', className)}>
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-2xl bg-gray-100 dark:bg-gray-800/60 animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('container-site py-6', className)}>
      <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse mb-6" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[...Array(count)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col p-3 space-y-3"
          >
            <div className="aspect-square w-full bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
            <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            <div className="h-5 w-1/3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default LoadingSkeleton
