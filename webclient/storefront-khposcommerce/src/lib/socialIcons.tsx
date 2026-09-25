import React from 'react'

export interface SocialIconProps {
  className?: string
  size?: number
}

// ─── 1. Official Facebook Icon (Official Blue Circle with White f) ──────────
export const FacebookAppIcon: React.FC<SocialIconProps> = ({ className = 'w-5 h-5', size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={`flex-shrink-0 transition-transform duration-200 hover:scale-110 ${className}`}
    aria-label="Facebook"
  >
    <circle cx="12" cy="12" r="12" fill="#1877F2" />
    <path
      d="M16.5 12.5h-2.5v7.5h-3.2v-7.5H9v-2.7h1.8V8.1c0-1.8 1.1-2.9 2.8-2.9.8 0 1.7.1 1.7.1v2h-1c-.9 0-1.2.6-1.2 1.2v1.3H16.8l-.3 2.7z"
      fill="#FFFFFF"
    />
  </svg>
)

// ─── 2. Official TikTok Icon (Official Black Background with Note) ─────────
export const TikTokAppIcon: React.FC<SocialIconProps> = ({ className = 'w-5 h-5', size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={`flex-shrink-0 transition-transform duration-200 hover:scale-110 ${className}`}
    aria-label="TikTok"
  >
    <circle cx="12" cy="12" r="12" fill="#000000" />
    <path
      d="M14.6 6.8c.6.8 1.4 1.3 2.4 1.4v2.1c-1-.1-1.9-.5-2.6-1.1v4.8c0 2.2-1.8 4-4 4s-4-1.8-4-4 1.8-4 4-4c.3 0 .6.04.9.1v2.1c-.3-.1-.6-.1-.9-.1-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2V5h2.2c0 .6.2 1.3.6 1.8z"
      fill="#00F2FE"
      opacity="0.85"
      transform="translate(-0.4, 0.4)"
    />
    <path
      d="M14.6 6.8c.6.8 1.4 1.3 2.4 1.4v2.1c-1-.1-1.9-.5-2.6-1.1v4.8c0 2.2-1.8 4-4 4s-4-1.8-4-4 1.8-4 4-4c.3 0 .6.04.9.1v2.1c-.3-.1-.6-.1-.9-.1-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2V5h2.2c0 .6.2 1.3.6 1.8z"
      fill="#FE2C55"
      opacity="0.85"
      transform="translate(0.4, -0.4)"
    />
    <path
      d="M14.6 6.8c.6.8 1.4 1.3 2.4 1.4v2.1c-1-.1-1.9-.5-2.6-1.1v4.8c0 2.2-1.8 4-4 4s-4-1.8-4-4 1.8-4 4-4c.3 0 .6.04.9.1v2.1c-.3-.1-.6-.1-.9-.1-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2V5h2.2c0 .6.2 1.3.6 1.8z"
      fill="#FFFFFF"
    />
  </svg>
)

// ─── 3. Official Instagram Icon (Signature Rose/Pink #E1306C) ─────────────
export const InstagramAppIcon: React.FC<SocialIconProps> = ({ className = 'w-5 h-5', size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={`flex-shrink-0 transition-transform duration-200 hover:scale-110 ${className}`}
    aria-label="Instagram"
  >
    <rect width="24" height="24" rx="6" fill="#E1306C" />
    <rect
      x="5.5"
      y="5.5"
      width="13"
      height="13"
      rx="3.5"
      stroke="#FFFFFF"
      strokeWidth="1.6"
      fill="none"
    />
    <circle cx="12" cy="12" r="3.2" stroke="#FFFFFF" strokeWidth="1.6" fill="none" />
    <circle cx="15.5" cy="8.5" r="0.9" fill="#FFFFFF" />
  </svg>
)

// ─── 4. Official Telegram Icon (Official Blue Circle #229ED9 with Plane) ──
export const TelegramAppIcon: React.FC<SocialIconProps> = ({ className = 'w-5 h-5', size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={`flex-shrink-0 transition-transform duration-200 hover:scale-110 ${className}`}
    aria-label="Telegram"
  >
    <circle cx="12" cy="12" r="12" fill="#229ED9" />
    <path
      d="M17.3 7.8L5.9 12.2c-.8.3-.8.8-.1 1l2.9 1 6.8-4.3c.3-.2.6-.1.4.1l-5.5 5-.2 3c.3 0 .5-.1.6-.3l1.5-1.5 3.1 2.3c.6.3 1 .2 1.2-.5l2-9.4c.2-.9-.3-1.3-1.1-.9z"
      fill="#FFFFFF"
    />
  </svg>
)

// ─── 5. Official YouTube Icon (Official Red Rounded Rectangle with Play) ───
export const YouTubeAppIcon: React.FC<SocialIconProps> = ({ className = 'w-5 h-5', size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={`flex-shrink-0 transition-transform duration-200 hover:scale-110 ${className}`}
    aria-label="YouTube"
  >
    <rect width="24" height="24" rx="6" fill="#FF0000" />
    <path d="M10 8.5v7l5.8-3.5L10 8.5z" fill="#FFFFFF" />
  </svg>
)
