export const gradientAvatar = (seed = 'campus') => {
  const safe = encodeURIComponent(seed)
  const initials = (seed || '校').trim().slice(0, 1).toUpperCase()
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#c28b5e" />
          <stop offset="55%" stop-color="#5f8e7b" />
          <stop offset="100%" stop-color="#2a3140" />
        </linearGradient>
      </defs>
      <rect width="96" height="96" rx="28" fill="url(#g)" />
      <text x="50%" y="53%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="Georgia, serif" font-size="40" font-weight="700">${initials}</text>
    </svg>`
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}
