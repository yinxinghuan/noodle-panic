export const FIELD_W = 390
export const FIELD_H = 720
export const COLS = 4
export const ROWS = 6
export const SIDE_CELLS = 8
export const TOTAL_CELLS = COLS * ROWS + SIDE_CELLS
export type Phase = 'start' | 'playing' | 'over'
export type EndReason = 'noodle' | 'time'
