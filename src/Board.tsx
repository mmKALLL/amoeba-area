import { convexHull, type Point } from './geometry'
import {
  BOARD_SIZE,
  CELL_SIZE,
  SVG_SIZE,
  coordKey,
  intersectionX,
  intersectionY,
  type Coord,
  type CoordKey,
  type Player,
} from './types'

type PreviewHull = {
  player: Player
  points: Point[]
  valid: boolean
} | null

type Props = {
  pegs: Map<CoordKey, Player>
  onCellClick: (coord: Coord) => void
  selectedKey?: CoordKey | null
  previewHull?: PreviewHull
  onCellHover?: (coord: Coord | null) => void
  validDestinations?: Coord[]
  currentPlayer?: Player
}

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

export default function Board({
  pegs,
  onCellClick,
  selectedKey,
  previewHull,
  onCellHover,
  validDestinations,
  currentPlayer,
}: Props) {
  const indices = Array.from({ length: BOARD_SIZE }, (_, i) => i)
  const redHull = playerHullPoints(pegs, 'red')
  const blueHull = playerHullPoints(pegs, 'blue')

  const previewClass = previewHull
    ? previewHull.valid
      ? `hull-preview hull-preview-valid hull-preview-${previewHull.player}`
      : 'hull-preview hull-preview-invalid'
    : ''

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

      {previewHull && previewHull.points.length >= 3 && (
        <polygon points={pointsAttr(previewHull.points)} className={previewClass} />
      )}

      {validDestinations && currentPlayer &&
        validDestinations.map(({ row, col }) => (
          <circle
            key={`valid-${row}-${col}`}
            cx={intersectionX(col)}
            cy={intersectionY(row)}
            r={CELL_SIZE / 6}
            className={`valid-marker valid-marker-${currentPlayer}`}
          />
        ))}

      {indices.map((row) =>
        indices.map((col) => {
          const key = coordKey({ row, col })
          const player = pegs.get(key)
          return (
            <g key={`cell-${row}-${col}`}>
              <circle
                cx={intersectionX(col)}
                cy={intersectionY(row)}
                r={CELL_SIZE / 2}
                className="hit"
                onClick={() => onCellClick({ row, col })}
                onMouseEnter={onCellHover ? () => onCellHover({ row, col }) : undefined}
                onMouseLeave={onCellHover ? () => onCellHover(null) : undefined}
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
              {selectedKey === key && (
                <circle
                  cx={intersectionX(col)}
                  cy={intersectionY(row)}
                  r={CELL_SIZE / 3 + 3}
                  className="peg-selected"
                />
              )}
            </g>
          )
        }),
      )}
    </svg>
  )
}
