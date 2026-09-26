import React from 'react'

export interface CircularProgressRingProps {
  percentage: number
  colorClass: string
  size?: number
  strokeWidth?: number
  bgStrokeColor?: string
}

export const CircularProgressRing: React.FC<CircularProgressRingProps> = ({
  percentage,
  colorClass,
  size = 44,
  strokeWidth = 3.5,
  bgStrokeColor = 'text-border/40',
}) => {
  const radius = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        className={bgStrokeColor}
        strokeWidth={strokeWidth}
        stroke="currentColor"
        fill="transparent"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        className={`${colorClass} transition-all duration-700 ease-out`}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        stroke="currentColor"
        fill="transparent"
      />
    </svg>
  )
}

export default CircularProgressRing
