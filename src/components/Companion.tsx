export function Companion({ small = false }: { small?: boolean }) {
  return (
    <svg className={`companion${small ? ' companion--small' : ''}`} viewBox="0 0 360 280" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={small ? 'little-lilac' : 'lilac'} x2="0" y2="1">
          <stop stopColor="#b6a9ee" /><stop offset="1" stopColor="#dfd8fb" />
        </linearGradient>
      </defs>
      <path d="M9 187C9 98 68 48 136 37c-2-31 33-39 45-18 19-23 49-6 46 19 75 16 124 65 124 149v42c0 25-18 40-44 40H53c-27 0-44-15-44-40Z" fill={`url(#${small ? 'little-lilac' : 'lilac'})`} stroke="#fff" strokeWidth="2" />
      <ellipse cx="146" cy="145" rx="26" ry="33" fill="white" /><ellipse cx="216" cy="145" rx="26" ry="33" fill="white" />
      <ellipse cx="151" cy="146" rx="18" ry="27" fill="#343536" /><ellipse cx="211" cy="146" rx="18" ry="27" fill="#343536" />
      <circle cx="141" cy="135" r="9" fill="white" /><circle cx="202" cy="135" r="9" fill="white" />
      <circle cx="156" cy="159" r="4" fill="white" /><circle cx="216" cy="159" r="4" fill="white" />
      <path d="M143 207c0-17 19-18 37-13 18-5 38-4 38 13 0 17-19 29-38 29s-37-12-37-29Z" fill="white" />
      <path d="M161 232c3-25 35-25 39 0-13 6-26 6-39 0Z" fill="#ee959e" />
    </svg>
  )
}
