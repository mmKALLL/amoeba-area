import { convexHull, type Point } from './geometry'
import { BOARD_SIZE, coordKey, type Coord, type CoordKey, type Player } from './types'

const CELL_SIZE = 24
const PADDING = 24
const SVG_SIZE = PADDING * 2 + (BOARD_SIZE - 1) * CELL_SIZE

type Props = {
  pegs: Map<CoordKey, Player>
  onCellClick: (coord: Coord) => void
}

const intersectionX = (col: number) => PADDING + col * CELL_SIZE
const intersectionY = (row: number) => PADDING + row * CELL_SIZE

const playerHullPoints = (pegs: Map<CoordKey, Player>, player: Player): Point[] => {
  const points: Point[] = []
  for (const [key, owner] of pegs) {
    if (owner !== player) continue
    const [rowStr, colStr] = key.split(',')
    const row = Number(rowStr)
    const col = Number(colStr)
    points.push({ x: intersectionX(col), y: intersectionY(row) })
  }
  return convexHull(points)
}

const pointsAttr = (hull: Point[]): string => hull.map((p) => `${p.x},${p.y}`).join(' ')

export default function Board({ pegs, onCellClick }: Props) {
  const indices = Array.from({ length: BOARD_SIZE }, (_, i) => i)
  const redHull = playerHullPoints(pegs, 'red')
  const blueHull = playerHullPoints(pegs, 'blue')

  return (
    <svg
      viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
      width="100%"
      className="board"
      role="img"
      aria-label="Amoeba Area board"
    >
      {redHull.length >= 3 && <polygon points={pointsAttr(redHull)} className="hull hull-red" />}
      {blueHull.length >= 3 && (
        <polygon points={pointsAttr(blueHull)} className="hull hull-blue" />
      )}

      {indices.map((row) => (
        <line
          key={`h-${row}`}
          x1={intersectionX(0)}
          y1={intersectionY(row)}
          x2={intersectionX(BOARD_SIZE - 1)}
          y2={intersectionY(row)}
          className="grid-line"
        />
      ))}
      {indices.map((col) => (
        <line
          key={`v-${col}`}
          x1={intersectionX(col)}
          y1={intersectionY(0)}
          x2={intersectionX(col)}
          y2={intersectionY(BOARD_SIZE - 1)}
          className="grid-line"
        />
      ))}

      {indices.map((row) =>
        indices.map((col) => {
          const player = pegs.get(coordKey({ row, col }))
          return (
            <g key={`cell-${row}-${col}`}>
              <circle
                cx={intersectionX(col)}
                cy={intersectionY(row)}
                r={CELL_SIZE / 2}
                className="hit"
                onClick={() => onCellClick({ row, col })}
              />
              {player && (
                <circle
                  cx={intersectionX(col)}
                  cy={intersectionY(row)}
                  r={CELL_SIZE / 3}
                  className={`peg peg-${player}`}
                  pointerEvents="none"
                />
              )}
            </g>
          )
        }),
      )}
    </svg>
  )
}
