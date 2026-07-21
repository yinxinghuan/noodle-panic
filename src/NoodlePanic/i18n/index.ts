const zh = {
  title: '菌落封锁', subtitle: '下净化球，封住菌株', start: '开始净化', score: '净化点', best: '最高', combo: '连锁', time: '培养时间', noodle: '碰到菌株！', timeup: '培养成功', timeout: '封锁不足', progress: '封锁进度', quotaMiss: '净化球不足，菌株扩散了。', replay: '再做一次', hint: '点净化球 · 别碰菌株', newBest: '新纪录！', levelUp: '封锁加强！', muted: '声音已关闭', sound: '声音', leaderboard: '排行榜',
}
const en = {
  title: 'COLONY LOCKDOWN', subtitle: 'Deploy clean cells. Contain the strain.', start: 'PURIFY', score: 'CLEAN POINTS', best: 'BEST', combo: 'CHAIN', time: 'CULTURE TIME', noodle: 'STRAIN TOUCHED!', timeup: 'CULTURE SUCCESS', timeout: 'CONTAINMENT INCOMPLETE', progress: 'SEAL PROGRESS', quotaMiss: 'The strain spread before the seal was complete.', replay: 'RUN AGAIN', hint: 'TAP CLEAN CELLS · AVOID THE STRAIN', newBest: 'NEW BEST!', levelUp: 'CONTAINMENT UP!', muted: 'SOUND OFF', sound: 'SOUND', leaderboard: 'LEADERBOARD',
}
type Key = keyof typeof zh
function locale() { return localStorage.getItem('game_locale') === 'en' ? 'en' : 'zh' }
export function t(key: Key) { return (locale() === 'en' ? en : zh)[key] }

export function cultureResult(strain: BacteriaStrain) {
  return locale() === 'en'
    ? { code: strain.code, name: strain.nameEn, note: strain.noteEn }
    : { code: strain.code, name: strain.name, note: strain.note }
}
import type { BacteriaStrain } from '../strains'
