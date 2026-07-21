import { useCallback, useEffect, useRef, useState } from 'react'
import { FIELD_H, FIELD_W, SEAL_TARGET, type EndReason, type Phase } from '../types'
import { dangerCells, generateNextStrain, generateStrain, nextHead } from '../strains'

export function useNoodlePanic() {
  const [phase, setPhase] = useState<Phase>('start')
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(() => Number(localStorage.getItem('noodle-panic.best') || 0))
  const [combo, setCombo] = useState(0)
  const [seconds, setSeconds] = useState(20)
  const [head, setHead] = useState(5)
  const [lit, setLit] = useState<number[]>([])
  const [reason, setReason] = useState<EndReason>('timeout')
  const [boil, setBoil] = useState(false)
  const [flash, setFlash] = useState<number | null>(null)
  const [cycle, setCycle] = useState(1)
  const [nextCycle, setNextCycle] = useState(1)
  const [nextStrain, setNextStrain] = useState(() => generateStrain())
  const [strain, setStrain] = useState(() => nextStrain)
  const [isSplitting, setIsSplitting] = useState(false)
  const [runId, setRunId] = useState(0)
  const raf = useRef(0), lastMove = useRef(0), started = useRef(0), audio = useRef<AudioContext | null>(null), turns = useRef(0)
  const scoreRef = useRef(0), comboRef = useRef(0), phaseRef = useRef<Phase>('start'), strainRef = useRef(strain), splittingRef = useRef(false), litRef = useRef<number[]>([])

  const tone = useCallback((freq: number, duration: number, type: OscillatorType = 'sine', volume = .035) => {
    try { const ctx = audio.current ?? new AudioContext(); audio.current = ctx; const osc = ctx.createOscillator(), gain = ctx.createGain(); osc.type = type; osc.frequency.value = freq; gain.gain.setValueAtTime(volume, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + duration); osc.connect(gain).connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + duration) } catch { /* audio is optional */ }
  }, [])
  const finish = useCallback((why: EndReason) => {
    if (phaseRef.current !== 'playing') return
    phaseRef.current = 'over'; setPhase('over'); setReason(why); cancelAnimationFrame(raf.current)
    if (why === 'sealed') { setNextCycle(current => current + 1); setNextStrain(generateNextStrain(strainRef.current)) }
    if (scoreRef.current > best) { setBest(scoreRef.current); localStorage.setItem('noodle-panic.best', String(scoreRef.current)) }
    tone(why === 'sealed' ? 880 : 150, why === 'sealed' ? .11 : .26, why === 'sealed' ? 'triangle' : 'sawtooth', .055)
  }, [best, tone])
  const loop = useCallback((now: number) => {
    if (phaseRef.current !== 'playing') return
    const activeStrain = strainRef.current
    const elapsed = now - started.current, remaining = Math.max(0, 20 - elapsed / 1000), speedup = remaining <= 5 ? .62 : remaining <= 12 ? .8 : 1, interval = activeStrain.moveMs * speedup
    const nextSplit = activeStrain.fission && Math.floor(elapsed / 1800) % 2 === 1
    if (nextSplit !== splittingRef.current) { splittingRef.current = nextSplit; setIsSplitting(nextSplit) }
    setSeconds(remaining)
    if (remaining <= 0) { finish('timeout'); return }
    if (now - lastMove.current > interval) { lastMove.current = now; turns.current += 1; setHead(h => nextHead(h, activeStrain, turns.current)); tone(170, .035, 'sine', .01) }
    raf.current = requestAnimationFrame(loop)
  }, [finish, tone])
  const start = useCallback(() => { scoreRef.current = 0; comboRef.current = 0; litRef.current = []; phaseRef.current = 'playing'; strainRef.current = nextStrain; turns.current = 0; splittingRef.current = false; setRunId(value => value + 1); setCycle(nextCycle); setStrain(nextStrain); setIsSplitting(false); setScore(0); setCombo(0); setLit([]); setHead(5); setBoil(false); setSeconds(20); setPhase('playing'); started.current = performance.now(); lastMove.current = started.current; raf.current = requestAnimationFrame(loop) }, [loop, nextCycle, nextStrain])
  const tap = useCallback((cell: number) => {
    if (phaseRef.current !== 'playing') return
    if (dangerCells(head, strainRef.current, splittingRef.current).includes(cell)) { finish('noodle'); return }
    setFlash(cell)
    // Keep the impact state through the full ripple + splash animation.
    window.setTimeout(() => setFlash(null), 460)
    if (litRef.current.includes(cell)) { comboRef.current = 0; setCombo(0); tone(220, .05); return }
    const nextLit = [...litRef.current, cell]
    litRef.current = nextLit
    setLit(nextLit)
    const nextCombo = comboRef.current + 1, multi = Math.min(4, Math.floor((nextCombo - 1) / 5) + 1), nextScore = scoreRef.current + 10 * multi
    comboRef.current = nextCombo; scoreRef.current = nextScore; setCombo(nextCombo); setScore(nextScore); tone(420 + multi * 80, .07)
    if (nextLit.length >= SEAL_TARGET) { finish('sealed'); return }
    if (nextCombo % 12 === 0) { setBoil(true); tone(920, .14, 'triangle', .05); window.setTimeout(() => setBoil(false), 300) }
  }, [finish, head, tone])
  useEffect(() => () => cancelAnimationFrame(raf.current), [])
  useEffect(() => { const key = (e: KeyboardEvent) => { if (phaseRef.current === 'start' && (e.key === 'Enter' || e.key === ' ')) start(); const n = Number(e.key); if (n >= 1 && n <= 4) tap(n - 1) }; window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key) }, [start, tap])
  const [scale, setScale] = useState(1)
  useEffect(() => { const update = () => setScale(Math.min(window.innerWidth / FIELD_W, window.innerHeight / FIELD_H, 1)); update(); window.addEventListener('resize', update); return () => window.removeEventListener('resize', update) }, [])
  return { phase, score, best, combo, seconds, head, lit, reason, boil, flash, scale, cycle, runId, isSplitting, strain, start, tap }
}
