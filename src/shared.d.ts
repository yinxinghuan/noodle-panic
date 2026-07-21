declare module '@shared/leaderboard' {
  import type { FC } from 'react'
  export interface LeaderboardEntry { user_id: string; name: string; avatar_url: string; score: number; rank: number; isMe?: boolean }
  export const Leaderboard: FC<{ gameName: string; isInAigram: boolean; onClose: () => void; fetch: () => Promise<LeaderboardEntry[]> }>
  export function useGameScore(): { isInAigram: boolean; canRank: boolean; telegramId: string | null; submitScore: (score: number) => Promise<void>; fetchLeaderboard: () => Promise<LeaderboardEntry[]> }
}
declare module '@shared/runtime' {
  export const telegramId: string | null
  export interface UseGameEvent { trigger: (event: string, configJson?: object | string) => void; canEmit: boolean }
  export function useGameEvent(): UseGameEvent
}
