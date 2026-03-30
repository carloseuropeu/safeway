export default function SafeWayLogo({ size = 48, shieldColor = '#FF6B9D', shieldColor2 = '#FF3F7A' }) {
  const id = `sg-${size}`
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 54"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="48" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={shieldColor} />
          <stop offset="100%" stopColor={shieldColor2} />
        </linearGradient>
      </defs>

      {/* Shield shape */}
      <path
        d="M24 2L42 9.5V27C42 38.5 34 47.5 24 51.5C14 47.5 6 38.5 6 27V9.5L24 2Z"
        fill={`url(#${id})`}
      />

      {/* Location pin — white */}
      <path
        d="M24 14C19.6 14 16 17.6 16 22C16 27.8 24 38 24 38C24 38 32 27.8 32 22C32 17.6 28.4 14 24 14Z"
        fill="white"
      />

      {/* Inner circle of pin */}
      <circle cx="24" cy="22" r="4" fill={shieldColor} />
    </svg>
  )
}
