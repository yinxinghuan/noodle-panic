import { COLS, TOTAL_CELLS } from './types'

export type StrainBody = 'rod' | 'chain' | 'crescent' | 'spore'
export type StrainTone = 'coral' | 'violet' | 'amber' | 'lime'
export type StrainPulse = 'glide' | 'breathe' | 'jitter' | 'blink'
export type StrainRoute = 'row' | 'column' | 'orbit' | 'jump'

export type BacteriaStrain = {
  code: string
  name: string
  nameEn: string
  note: string
  noteEn: string
  tone: StrainTone
  body: StrainBody
  pulse: StrainPulse
  route: StrainRoute
  fission: boolean
  moveMs: number
}

const pigments = [
  { tone: 'coral' as const, code: 'C', zh: '珊瑚', en: 'Coral' },
  { tone: 'violet' as const, code: 'V', zh: '雾紫', en: 'Violet' },
  { tone: 'amber' as const, code: 'Y', zh: '琥珀', en: 'Amber' },
  { tone: 'lime' as const, code: 'G', zh: '绿孢', en: 'Lime' },
]
const bodies = [
  { body: 'rod' as const, code: 'R', zh: '杆菌', en: 'Bacillus' },
  { body: 'chain' as const, code: 'K', zh: '链菌', en: 'Chain Strain' },
  { body: 'crescent' as const, code: 'A', zh: '弧菌', en: 'Arc Strain' },
  { body: 'spore' as const, code: 'S', zh: '孢菌', en: 'Spore Strain' },
]
const pulses = [
  { pulse: 'glide' as const, zh: '滑行', en: 'glide' },
  { pulse: 'breathe' as const, zh: '呼吸', en: 'breathe' },
  { pulse: 'jitter' as const, zh: '抖动', en: 'jitter' },
  { pulse: 'blink' as const, zh: '闪烁', en: 'blink' },
]
const routes = [
  { route: 'row' as const, zh: '横向游走', en: 'row route', speed: 700 },
  { route: 'column' as const, zh: '纵向游走', en: 'column route', speed: 640 },
  { route: 'orbit' as const, zh: '环形巡游', en: 'orbit route', speed: 620 },
  { route: 'jump' as const, zh: '跳格', en: 'jump route', speed: 570 },
]

const pick = <T,>(items: readonly T[], random: () => number) => items[Math.floor(random() * items.length)]

export function generateStrain(random = Math.random): BacteriaStrain {
  const pigment = pick(pigments, random), body = pick(bodies, random), pulse = pick(pulses, random), route = pick(routes, random)
  const fission = random() < .34
  const serial = String(Math.floor(random() * 90) + 10)
  return {
    code: `${pigment.code}${body.code}-${serial}`,
    name: `${pigment.zh}${body.zh}`,
    nameEn: `${pigment.en} ${body.en}`,
    note: `${pulse.zh} · ${route.zh}${fission ? ' · 二分裂' : ''}`,
    noteEn: `${pulse.en} · ${route.en}${fission ? ' · binary fission' : ''}`,
    tone: pigment.tone,
    body: body.body,
    pulse: pulse.pulse,
    route: route.route,
    fission,
    moveMs: route.speed,
  }
}

export function generateNextStrain(previous: BacteriaStrain, random = Math.random): BacteriaStrain {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const candidate = generateStrain(random)
    if (candidate.tone !== previous.tone || candidate.body !== previous.body || candidate.pulse !== previous.pulse || candidate.route !== previous.route || candidate.fission !== previous.fission) return candidate
  }
  return { ...previous, code: `${previous.code.slice(0, 2)}-${String(Math.floor(random() * 90) + 10)}`, route: previous.route === 'row' ? 'column' : 'row' }
}

export function dangerCells(head: number, strain: BacteriaStrain, isSplitting: boolean) {
  const offsets = strain.body === 'rod' ? [0, 1, 2, 3]
    : strain.body === 'chain' ? [0, COLS, COLS * 2, COLS * 3]
      : strain.body === 'crescent' ? [0, 1, COLS]
        : [0]
  if (strain.fission && isSplitting) offsets.push(9, 10)
  return [...new Set(offsets.map(offset => (head + offset + TOTAL_CELLS) % TOTAL_CELLS))]
}

export function nextHead(head: number, strain: BacteriaStrain, turn: number) {
  const step = strain.route === 'row' ? 1
    : strain.route === 'column' ? COLS
      : strain.route === 'orbit' ? (turn % 2 ? COLS : 1)
        : (turn % 2 ? 7 : 5)
  return (head + step + TOTAL_CELLS) % TOTAL_CELLS
}
