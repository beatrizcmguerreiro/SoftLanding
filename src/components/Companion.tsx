export type Expression = 'happy' | 'unsure' | 'attentive' | 'anxious' | 'overwhelmed' | 'sad' | 'okay' | 'calm'

export function Companion({ small = false, expression = 'happy' }: { small?: boolean; expression?: Expression }) {
  return (
    <svg className={`companion${small ? ' companion--small' : ''}`} viewBox="0 0 360 280" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={small ? 'little-lilac' : 'lilac'} x2="0" y2="1">
          <stop stopColor="#b6a9ee" /><stop offset="1" stopColor="#dfd8fb" />
        </linearGradient>
      </defs>
      <path d="M9 187C9 98 68 48 136 37c-2-31 33-39 45-18 19-23 49-6 46 19 75 16 124 65 124 149v42c0 25-18 40-44 40H53c-27 0-44-15-44-40Z" fill={`url(#${small ? 'little-lilac' : 'lilac'})`} stroke="#fff" strokeWidth="2" />
      {expression === 'calm' ? <path d="M125 146q21 18 42 0M195 146q21 18 42 0" fill="none" stroke="#76679d" strokeWidth="6" strokeLinecap="round" /> : expression === 'overwhelmed' ? <path d="m128 128 27 17-27 16m106-33-27 17 27 16" fill="none" stroke="#76679d" strokeWidth="6" strokeLinecap="round" /> : <>
      <ellipse cx="146" cy="145" rx="26" ry="33" fill="white" /><ellipse cx="216" cy="145" rx="26" ry="33" fill="white" />
      <ellipse cx="151" cy="146" rx="18" ry="27" fill="#343536" /><ellipse cx="211" cy="146" rx="18" ry="27" fill="#343536" />
      <circle cx="141" cy="135" r="9" fill="white" /><circle cx="202" cy="135" r="9" fill="white" />
      <circle cx="156" cy="159" r="4" fill="white" /><circle cx="216" cy="159" r="4" fill="white" />
      </>}
      {expression === 'anxious' ? <>
        <path d="m125 105 32-13m47 0 31 13" fill="none" stroke="#8776aa" strokeWidth="5" strokeLinecap="round" />
        <ellipse cx="181" cy="211" rx="10" ry="13" fill="#8776aa" />
      </> : expression === 'overwhelmed' ? <path d="m158 212 11-5 12 6 12-6 11 5" fill="none" stroke="#8776aa" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /> : expression === 'sad' ? <>
        <path d="M124 107q18-2 34-14M204 93q16 12 30 14M162 219q19-20 38 0" fill="none" stroke="#8776aa" strokeWidth="5" strokeLinecap="round" />
      </> : expression === 'okay' ? <path d="M166 212h30" fill="none" stroke="#8776aa" strokeWidth="5" strokeLinecap="round" /> : expression === 'calm' ? <path d="M165 207q16 12 32 0" fill="none" stroke="#8776aa" strokeWidth="5" strokeLinecap="round" /> : expression === 'attentive' ? <>
        <path d="M124 103q16-8 32-5M204 98q16-3 30 5" fill="none" stroke="#8776aa" strokeWidth="4" strokeLinecap="round" />
        <path d="M167 209q14 8 28 0" fill="none" stroke="#8776aa" strokeWidth="5" strokeLinecap="round" />
      </> : expression === 'unsure' ? <>
        <path d="M124 103q17-13 34-5M203 100q17 1 29 10" fill="none" stroke="#76679d" strokeWidth="5" strokeLinecap="round" />
        <path d="M163 212q10-7 19-2t17-3" fill="none" stroke="#76679d" strokeWidth="6" strokeLinecap="round" />
      </> : <>
        <path d="M143 207c0-17 19-18 37-13 18-5 38-4 38 13 0 17-19 29-38 29s-37-12-37-29Z" fill="white" />
        <path d="M161 232c3-25 35-25 39 0-13 6-26 6-39 0Z" fill="#ee959e" />
      </>}
    </svg>
  )
}
