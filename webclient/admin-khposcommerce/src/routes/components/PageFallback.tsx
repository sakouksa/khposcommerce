import React from 'react'

export const PageFallback: React.FC = () => (
  <div className="flex items-center justify-center h-64">
    <div className="flex gap-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  </div>
)

export default PageFallback
