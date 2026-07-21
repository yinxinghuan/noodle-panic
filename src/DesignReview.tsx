import { Check, Droplets, Leaf, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import './DesignReview.less'

type Direction = 'mint' | 'sunny' | 'paper'

const directions: Array<{ id: Direction; index: string; name: string; tagline: string; note: string; colors: string[]; icon: typeof Droplets }> = [
  { id: 'mint', index: '01', name: '海风汤面', tagline: '清爽、安静、危险色更锋利', note: '提取《急刹车》的蓝绿底色与珊瑚警示；碗像浮在夜色里的浅水面。', colors: ['#10263b', '#a9dcd8', '#f06449', '#f5f0dd'], icon: Droplets },
  { id: 'sunny', index: '02', name: '柚子食堂', tagline: '明亮、轻盈、早午餐般上头', note: '暖奶油底、薄荷绿和橘红危险物；更有亲和力，适合高频短局。', colors: ['#f7f1de', '#69d1b5', '#ee7056', '#273a3b'], icon: Sparkles },
  { id: 'paper', index: '03', name: '青瓷小馆', tagline: '克制、留白、东方材质感', note: '青瓷釉、纸纹与朱砂红；信息最少，保留更强的安静氛围。', colors: ['#dce9e3', '#4d7770', '#c75440', '#f4f0e6'], icon: Leaf },
]

function BowlMock({ id }: { id: Direction }) {
  return <div className={`review-phone review-phone--${id}`}>
    <div className="review-phone__sky" /><div className="review-phone__mist"><i /><i /><i /></div>
    <header><span>NOODLE PANIC</span><b>20</b></header>
    <div className="review-phone__hud"><div><small>SCORE</small><strong>120</strong></div><div><small>STREAK</small><strong>×3</strong></div><div><small>BEST</small><strong>540</strong></div></div>
    <div className="review-phone__bowl"><div className="review-phone__broth" />{Array.from({ length: 12 }, (_, i) => <i key={i} className={`review-phone__cell review-phone__cell--${i}`} />)}<span className="review-phone__noodle"><i /><i /><i /></span><em>+10</em></div>
    <p>点空格 · 躲红面</p><button aria-label="查看此方向"><Check size={15} /> 选这个方向</button>
  </div>
}

export default function DesignReview() {
  const [selected, setSelected] = useState<Direction>('mint')
  useEffect(() => {
    document.body.classList.add('review-open')
    return () => document.body.classList.remove('review-open')
  }, [])
  return <main className="review">
    <div className="review__intro"><p className="review__eyebrow">NOODLE PANIC · ART DIRECTION REVIEW</p><h1>选一个更清新的<br />游戏世界</h1><p>只评审视觉方向，不改玩法。三版都保留红色危险面与 4×6 点按区域，但从《急刹车》借用更清透的色彩秩序与安静 HUD。</p></div>
    <section className="review__directions" aria-label="设计方向">
      {directions.map(direction => { const Icon = direction.icon; const active = selected === direction.id; return <article className={`review-card ${active ? 'review-card--selected' : ''}`} key={direction.id}>
        <div className="review-card__meta"><span>{direction.index}</span><Icon size={18} /></div><BowlMock id={direction.id} />
        <div className="review-card__copy"><h2>{direction.name}</h2><strong>{direction.tagline}</strong><p>{direction.note}</p><div className="review-card__swatches" aria-label="调色板">{direction.colors.map(color => <i key={color} style={{ background: color }} title={color} />)}</div><button className="review-card__select" type="button" onClick={() => setSelected(direction.id)}>{active ? <><Check size={17} /> 当前选择</> : '选择此方向'}</button></div>
      </article> })}
    </section>
    <footer className="review__decision"><div><span>当前暂选</span><strong>{directions.find(item => item.id === selected)?.name}</strong></div><p>你可以直接回复「选 01 / 02 / 03」，或告诉我想混合哪两版的元素。</p></footer>
  </main>
}
