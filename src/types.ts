export type Player = 'red' | 'blue'

export type Coord = { row: number; col: number }

export type CoordKey = `${number},${number}`

export const coordKey = ({ row, col }: Coord): CoordKey => `${row},${col}`

export const BOARD_SIZE = 24
