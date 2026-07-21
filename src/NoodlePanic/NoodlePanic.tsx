import { type CSSProperties, useCallback, useEffect, useRef, useState } from 'react'
import { Trophy, Volume2 } from 'lucide-react'
import { Leaderboard, useGameScore } from '@shared/leaderboard'
import type { LeaderboardEntry } from '@shared/leaderboard'
import { telegramId, useGameEvent } from '@shared/runtime'
import { useNoodlePanic } from './hooks/useNoodlePanic'
import { FIELD_H, FIELD_W, SEAL_TARGET, TOTAL_CELLS } from './types'
import { cultureResult, t } from './i18n'
import { dangerCells } from './strains'
import Watermark from './components/Watermark'
import './NoodlePanic.less'

export default function NoodlePanic() {
  const game = useNoodlePanic()
  const { isInAigram, canRank, submitScore, fetchLeaderboard } = useGameScore()
  const events = useGameEvent()
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [champion, setChampion] = useState<LeaderboardEntry | null>(null)
  const rowsRef = useRef<LeaderboardEntry[]>([])
  const preRunBestRef = useRef(0)
  const submittedRunRef = useRef(0)
  const noodle = dangerCells(game.head, game.strain, game.isSplitting)
  const multiplier = Math.min(4, Math.floor(Math.max(0, game.combo - 1) / 5) + 1)
  const culture = cultureResult(game.strain)
  const refreshLeaderboard = useCallback(async () => {
    if (!canRank) return [] as LeaderboardEntry[]
    const rows = await fetchLeaderboard()
    rowsRef.current = rows
    setChampion(rows[0] ?? null)
    return rows
  }, [canRank, fetchLeaderboard])
  useEffect(() => { refreshLeaderboard().catch(() => {}) }, [refreshLeaderboard])
  useEffect(() => {
    if (game.phase !== 'playing') return
    const mine = telegramId ? rowsRef.current.find(row => String(row.user_id) === String(telegramId)) : null
    preRunBestRef.current = mine ? Number(mine.score) || 0 : 0
  }, [game.phase, game.runId])
  useEffect(() => {
    if (game.phase !== 'over' || game.score <= 0 || submittedRunRef.current === game.runId) return
    submittedRunRef.current = game.runId
    submitScore(game.score).then(async () => {
      const fresh = await refreshLeaderboard()
      if (!canRank || !telegramId || game.score <= preRunBestRef.current) return
      const beaten = fresh.filter(row => String(row.user_id) !== String(telegramId) && Number(row.score) < game.score && Number(row.score) > preRunBestRef.current).sort((a, b) => Number(b.score) - Number(a.score))[0]
      if (beaten && events.canEmit) events.trigger('score_beat', { actions: [{ type: 'notify', target_user_id: String(beaten.user_id), message: { template: `{sender_name} 刚刚以 ${game.score} 净化点超越了你的《菌落封锁》记录。`, variables: ['sender_name'] } }] })
    }).catch(() => {})
  }, [canRank, events, game.phase, game.runId, game.score, refreshLeaderboard, submitScore])
  return <main className="np-shell">
    <section className={`np ${game.boil ? 'np--boil' : ''} ${game.phase === 'over' && game.reason === 'noodle' ? 'np--fail' : ''}`} style={{ width: FIELD_W, height: FIELD_H, transform: `scale(${game.scale})` }} aria-label={t('title')}>
      <div className="np__atmosphere" aria-hidden="true"><span /><span /><span /></div>
      <div className="np__lab-tools" aria-hidden="true"><i className="np__pipette" /><i className="np__sample-tube" /></div>
      <header className="np__header">
        <div className="np__brand"><span className="np__eyebrow">PETRI DISH LAB</span><h1>{t('title')}</h1></div>
        <div className={`np__timer ${game.seconds <= 5 && game.phase === 'playing' ? 'np__timer--danger' : ''}`}><span>{t('time')}</span><b>{String(Math.ceil(game.seconds)).padStart(2, '0')}</b></div>
      </header>
      <div className="np__stats" aria-live="polite">
        <div><span>{t('score')}</span><b>{game.score}</b></div><div><span>{t('combo')}</span><b>{game.combo}<em>×{multiplier}</em></b></div><div><span>{t('best')}</span><b>{game.best}</b></div>
      </div>
      <p className="np__strain-readout" aria-live="polite"><b>DNA.{String(game.cycle).padStart(2, '0')}</b><span>{game.strain.code}</span><i className={`np__dna np__dna--${game.strain.tone}`} aria-hidden="true" /></p>
      <p className="np__seal-progress" aria-live="polite"><span>{t('progress')}</span><b>{game.lit.length}/{SEAL_TARGET}</b></p>
      <div className="np__plate-wrap">
        <div className="np__plate-shadow" aria-hidden="true" />
        <div className="np__plate">
          <div className="np__plate-rim" aria-hidden="true" /><div className="np__broth-sheen" aria-hidden="true" />
          <div className="np__grid" role="grid" aria-label={t('hint')}>
            {Array.from({ length: TOTAL_CELLS }, (_, cell) => {
              const isNoodle = noodle.includes(cell), isLit = game.lit.includes(cell)
              return <button key={cell} role="gridcell" className={`np__cell ${isNoodle ? `np__cell--noodle np__cell--tone-${game.strain.tone} np__cell--body-${game.strain.body} np__cell--pulse-${game.strain.pulse} np__cell--route-${game.strain.route}` : ''} ${game.isSplitting && isNoodle ? 'np__cell--splitting' : ''} ${isLit ? 'np__cell--lit' : ''} ${game.flash === cell ? 'np__cell--flash' : ''}`} style={isNoodle ? { '--strain-delay': `${-(cell % 5) * 80}ms` } as CSSProperties : undefined} onPointerDown={() => game.tap(cell)} disabled={game.phase !== 'playing'} aria-label={isNoodle ? t('noodle') : `${t('score')} ${cell + 1}`}>
                {isLit && <span className="np__stamp">+{Math.min(4, Math.floor(Math.max(0, game.combo - 1) / 5) + 1) * 10}</span>}
                {game.flash === cell && <span className="np__burst" aria-hidden="true"><i /><i /><i /><i /><i /><i /></span>}
              </button>
            })}
          </div>
        </div>
      </div>
      <p className="np__hint"><span />{t('hint')}<span /></p>
      {canRank && <button className="np__champion" onPointerDown={() => setShowLeaderboard(true)} aria-label={t('leaderboard')}>
        <Trophy size={15} strokeWidth={2.6} />
        {champion?.avatar_url ? <img src={champion.avatar_url} alt="" draggable={false} /> : null}
        <span>{champion?.name || t('leaderboard')}</span>{champion ? <b>{Number(champion.score).toLocaleString()}</b> : null}
      </button>}
      {game.combo > 0 && game.combo % 12 === 0 && game.phase === 'playing' && <div className="np__boil" aria-live="assertive">{t('levelUp')}</div>}
      {game.phase !== 'playing' && <div className="np__overlay">
        <div className="np__menu">
        {game.phase === 'start' ? <><p className="np__overlay-kicker">CULTURE PROTOCOL</p><h2>{t('subtitle')}</h2><p className="np__overlay-copy">{t('progress')} 12/12 · {t('hint')}</p><button className="np__primary" onPointerDown={game.start}>{t('start')}<small>12 SEALS · 20 SEC</small></button></> : <>{game.reason === 'noodle' ? <><p className="np__overlay-kicker">BACTERIA CONTACT</p><h2>{t('noodle')}</h2></> : game.reason === 'sealed' ? <><p className="np__overlay-kicker">CULTURE SUCCESS · {culture.code}</p><h2>{culture.name}</h2><p className="np__overlay-copy">{t('timeup')} · {culture.note}</p></> : <><p className="np__overlay-kicker">CONTAINMENT BREACH</p><h2>{t('timeout')}</h2><p className="np__overlay-copy">{t('quotaMiss')} {t('progress')} {game.lit.length}/{SEAL_TARGET}</p></>}<p className="np__result"><b>{game.score}</b><span>{t('score')} {game.score >= game.best && game.score > 0 ? `· ${t('newBest')}` : ''}</span></p><button className="np__primary" onPointerDown={game.start}>{t('replay')}<small>AGAIN</small></button></>}
        </div>
      </div>}
      <button className="np__sound" aria-label={t('sound')} title={t('sound')}><Volume2 size={19} strokeWidth={2.7} /></button>
      {showLeaderboard && <Leaderboard gameName="COLONY LOCKDOWN" isInAigram={isInAigram} onClose={() => setShowLeaderboard(false)} fetch={fetchLeaderboard} />}
      <Watermark />
    </section>
  </main>
}
