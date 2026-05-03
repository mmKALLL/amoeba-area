import { useState } from 'react'
import Board from './Board'
import Stats from './Stats'
import { convexHull, polygonArea, polygonPerimeter, type Point } from './geometry'
import {
  buildInitialPegs,
  coordKey,
  intersectionX,
  intersectionY,
  type Coord,
  type CoordKey,
  type Player,
} from './types'

const EPSILON = 1e-9

const playerGridPoints = (
  pegs: Map<CoordKey, Player>,
  player: Player,
  excludeKey?: CoordKey | null,
  extra?: Coord | null,
): Point[] => {
  const points: Point[] = []
  for (const [key, owner] of pegs) {
    if (owner !== player) continue
    if (excludeKey && key === excludeKey) continue
    const [rowStr, colStr] = key.split(',')
    points.push({ x: Number(colStr), y: Number(rowStr) })
  }
  if (extra) {
    points.push({ x: extra.col, y: extra.row })
  }
  return points
}

const computeStats = (pegs: Map<CoordKey, Player>, player: Player) => {
  const hull = convexHull(playerGridPoints(pegs, player))
  return { area: polygonArea(hull), perimeter: polygonPerimeter(hull) }
}

export default function App() {
  const [pegs, setPegs] = useState<Map<CoordKey, Player>>(() => buildInitialPegs())
  const [currentPlayer, setCurrentPlayer] = useState<Player>('red')
  const [selectedKey, setSelectedKey] = useState<CoordKey | null>(null)
  const [hoverCoord, setHoverCoord] = useState<Coord | null>(null)

  const redStats = computeStats(pegs, 'red')
  const blueStats = computeStats(pegs, 'blue')
  const currentArea = currentPlayer === 'red' ? redStats.area : blueStats.area

  const handleCellClick = (coord: Coord) => {
    const key = coordKey(coord)
    const owner = pegs.get(key)

    if (owner === currentPlayer) {
      setSelectedKey((prev) => (prev === key ? null : key))
      setHoverCoord(null)
      return
    }

    if (owner) return

    if (!selectedKey) return

    const candidate = convexHull(
      playerGridPoints(pegs, currentPlayer, selectedKey, coord),
    )
    const candidateArea = polygonArea(candidate)
    if (Math.abs(candidateArea - currentArea) >= EPSILON) return

    const next = new Map(pegs)
    next.delete(selectedKey)
    next.set(key, currentPlayer)
    setPegs(next)
    setCurrentPlayer(currentPlayer === 'red' ? 'blue' : 'red')
    setSelectedKey(null)
    setHoverCoord(null)
  }

  const handleCellHover = (coord: Coord | null) => {
    if (!selectedKey) {
      setHoverCoord(null)
      return
    }
    if (!coord) {
      setHoverCoord(null)
      return
    }
    if (pegs.has(coordKey(coord))) {
      setHoverCoord(null)
      return
    }
    setHoverCoord(coord)
  }

  const reset = () => {
    setPegs(buildInitialPegs())
    setCurrentPlayer('red')
    setSelectedKey(null)
    setHoverCoord(null)
  }

  let preview: { player: Player; area: number; perimeter: number } | null = null
  let previewHull: { player: Player; points: Point[]; valid: boolean } | null = null
  if (selectedKey && hoverCoord) {
    const gridHull = convexHull(
      playerGridPoints(pegs, currentPlayer, selectedKey, hoverCoord),
    )
    const area = polygonArea(gridHull)
    const perimeter = polygonPerimeter(gridHull)
    const valid = Math.abs(area - currentArea) < EPSILON
    preview = { player: currentPlayer, area, perimeter }
    const screenPoints = gridHull.map((p) => ({
      x: intersectionX(p.x),
      y: intersectionY(p.y),
    }))
    previewHull = { player: currentPlayer, points: screenPoints, valid }
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1>Amoeba Area</h1>
        <div className="controls">
          <span className="turn">
            Turn: <span className={`turn-${currentPlayer}`}>{currentPlayer}</span>
          </span>
          <button type="button" onClick={reset} className="reset">
            Reset
          </button>
        </div>
      </header>
      <Stats red={redStats} blue={blueStats} preview={preview} />
      <Board
        pegs={pegs}
        onCellClick={handleCellClick}
        selectedKey={selectedKey}
        previewHull={previewHull}
        onCellHover={handleCellHover}
      />
    </main>
  )
}
