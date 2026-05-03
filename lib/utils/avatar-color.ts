const PALETTE = [
  { bg: 'bg-teal-500', text: 'text-white' },
  { bg: 'bg-blue-500', text: 'text-white' },
  { bg: 'bg-violet-500', text: 'text-white' },
  { bg: 'bg-rose-500', text: 'text-white' },
  { bg: 'bg-amber-500', text: 'text-white' },
  { bg: 'bg-emerald-600', text: 'text-white' },
  { bg: 'bg-indigo-500', text: 'text-white' },
  { bg: 'bg-orange-500', text: 'text-white' },
]

export function getAvatarColor(name: string): { bg: string; text: string } {
  if (!name) return PALETTE[0]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
    hash |= 0
  }
  return PALETTE[Math.abs(hash) % PALETTE.length]
}

export function getAvatarInitial(name: string): string {
  return name?.charAt(0).toUpperCase() ?? '?'
}
