export type Player = 'red' | 'blue'

export type Coord = { row: number; col: number }

export type CoordKey = `${number},${number}`

export const coordKey = ({ row, col }: Coord): CoordKey => `${row},${col}`

export const BOARD_SIZE = 24

export const INITIAL_LAYOUT: ReadonlyArray<{ row: number; col: number; player: Player }> = [
  { row: 5, col: 4, player: 'red' },
  { row: 5, col: 12, player: 'red' },
  { row: 5, col: 20, player: 'red' },
  { row: 10, col: 4, player: 'red' },
  { row: 10, col: 12, player: 'red' },
  { row: 10, col: 20, player: 'red' },
  { row: 13, col: 4, player: 'blue' },
  { row: 13, col: 12, player: 'blue' },
  { row: 13, col: 20, player: 'blue' },
  { row: 18, col: 4, player: 'blue' },
  { row: 18, col: 12, player: 'blue' },
  { row: 18, col: 20, player: 'blue' },
]

export const buildInitialPegs = (): Map<CoordKey, Player> => {
  const m = new Map<CoordKey, Player>()
  for (const { row, col, player } of INITIAL_LAYOUT) {
    m.set(coordKey({ row, col }), player)
  }
  return m
}
