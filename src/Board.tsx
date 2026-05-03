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

export default function Board({ pegs, onCellClick }: Props) {
  const indices = Array.from({ length: BOARD_SIZE }, (_, i) => i)
  const bandThickness = CELL_SIZE
  const innerLength = (BOARD_SIZE - 1) * CELL_SIZE + bandThickness

  return (
    <svg
      viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
      width="100%"
      className="board"
      role="img"
      aria-label="Amoeba Area board"
    >
      <rect
        x={PADDING - bandThickness / 2}
        y={PADDING - bandThickness / 2}
        width={innerLength}
        height={bandThickness}
        className="border-band border-red"
      />
      <rect
        x={PADDING - bandThickness / 2}
        y={PADDING + (BOARD_SIZE - 1) * CELL_SIZE - bandThickness / 2}
        width={innerLength}
        height={bandThickness}
        className="border-band border-red"
      />
      <rect
        x={PADDING - bandThickness / 2}
        y={PADDING - bandThickness / 2}
        width={bandThickness}
        height={innerLength}
        className="border-band border-blue"
      />
      <rect
        x={PADDING + (BOARD_SIZE - 1) * CELL_SIZE - bandThickness / 2}
        y={PADDING - bandThickness / 2}
        width={bandThickness}
        height={innerLength}
        className="border-band border-blue"
      />

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
