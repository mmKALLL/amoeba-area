import { useState } from 'react'
import Board from './Board'
import Stats from './Stats'
import GameOverBanner from './GameOverBanner'
import { convexHull, pointInConvexHull, polygonArea, polygonPerimeter, type Point } from './geometry'
import {
  BOARD_SIZE,
  buildInitialPegs,
  coordKey,
  intersectionX,
  intersectionY,
  type Coord,
  type CoordKey,
  type Player,
} from './types'

const EPSILON = 1e-9

const otherPlayer = (player: Player): Player => (player === 'red' ? 'blue' : 'red')

const keyToPoint = (key: CoordKey): Point => {
  const [rowStr, colStr] = key.split(',')
  return { x: Number(colStr), y: Number(rowStr) }
}

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
    points.push(keyToPoint(key))
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

const isValidDestination = (
  pegs: Map<CoordKey, Player>,
  player: Player,
  fromKey: CoordKey,
  to: Coord,
  currentArea: number,
): boolean => {
  const hull = convexHull(playerGridPoints(pegs, player, fromKey, to))
  return Math.abs(polygonArea(hull) - currentArea) < EPSILON
}

const findCaptures = (
  pegsAfterMove: Map<CoordKey, Player>,
  mover: Player,
  hullBefore: Point[],
  hullAfter: Point[],
): CoordKey[] => {
  const opponent = otherPlayer(mover)
  const captured: CoordKey[] = []
  for (const [key, owner] of pegsAfterMove) {
    if (owner !== opponent) continue
    const p = keyToPoint(key)
    if (!pointInConvexHull(p, hullBefore) && pointInConvexHull(p, hullAfter)) {
      captured.push(key)
    }
  }
  return captured
}

const playerLoses = (pegs: Map<CoordKey, Player>, player: Player, opponentHull: Point[]): boolean => {
  const points = playerGridPoints(pegs, player)
  const hull = convexHull(points)
  if (polygonArea(hull) <= EPSILON) return true
  if (points.length === 0) return true
  for (const p of points) {
    if (!pointInConvexHull(p, opponentHull)) return false
  }
  return true
}

const detectWinner = (pegs: Map<CoordKey, Player>, mover: Player): Player | null => {
  const opponent = otherPlayer(mover)
  const moverHull = convexHull(playerGridPoints(pegs, mover))
  const opponentHull = convexHull(playerGridPoints(pegs, opponent))
  const moverLost = playerLoses(pegs, mover, opponentHull)
  const opponentLost = playerLoses(pegs, opponent, moverHull)
  if (opponentLost) return mover
  if (moverLost) return opponent
  return null
}

export default function App() {
  const [pegs, setPegs] = useState<Map<CoordKey, Player>>(() => buildInitialPegs())
  const [currentPlayer, setCurrentPlayer] = useState<Player>('red')
  const [selectedKey, setSelectedKey] = useState<CoordKey | null>(null)
  const [hoverCoord, setHoverCoord] = useState<Coord | null>(null)
  const [winner, setWinner] = useState<Player | null>(null)

  const redStats = computeStats(pegs, 'red')
  const blueStats = computeStats(pegs, 'blue')
  const currentArea = currentPlayer === 'red' ? redStats.area : blueStats.area

  const handleCellClick = (coord: Coord) => {
    if (winner !== null) return
    const key = coordKey(coord)
    const owner = pegs.get(key)

    if (owner === currentPlayer) {
      setSelectedKey((prev) => (prev === key ? null : key))
      setHoverCoord(null)
      return
    }

    if (owner) return

    if (!selectedKey) return

    if (!isValidDestination(pegs, currentPlayer, selectedKey, coord, currentArea)) return

    const hullBefore = convexHull(playerGridPoints(pegs, currentPlayer))

    const pegsAfterMove = new Map(pegs)
    pegsAfterMove.delete(selectedKey)
    pegsAfterMove.set(key, currentPlayer)

    const hullAfter = convexHull(playerGridPoints(pegsAfterMove, currentPlayer))

    const captured = findCaptures(pegsAfterMove, currentPlayer, hullBefore, hullAfter)
    const pegsAfterCaptures = new Map(pegsAfterMove)
    for (const capKey of captured) {
      pegsAfterCaptures.delete(capKey)
    }

    const newWinner = detectWinner(pegsAfterCaptures, currentPlayer)

    setPegs(pegsAfterCaptures)
    setCurrentPlayer(otherPlayer(currentPlayer))
    setSelectedKey(null)
    setHoverCoord(null)
    setWinner(newWinner)
  }

  const handleCellHover = (coord: Coord | null) => {
    if (winner !== null) {
      setHoverCoord(null)
      return
    }
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
    setWinner(null)
  }

  const validDestinations: Coord[] = []
  if (selectedKey && winner === null) {
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const key = coordKey({ row, col })
        if (pegs.has(key)) continue
        const coord = { row, col }
        if (isValidDestination(pegs, currentPlayer, selectedKey, coord, currentArea)) {
          validDestinations.push(coord)
        }
      }
    }
  }

  let preview: { player: Player; area: number; perimeter: number } | null = null
  let previewHull: { player: Player; points: Point[]; valid: boolean } | null = null
  if (selectedKey && hoverCoord && winner === null) {
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
      {winner !== null && <GameOverBanner winner={winner} onReset={reset} />}
      <Stats red={redStats} blue={blueStats} preview={preview} />
      <Board
        pegs={pegs}
        onCellClick={handleCellClick}
        selectedKey={selectedKey}
        previewHull={previewHull}
        onCellHover={handleCellHover}
        validDestinations={validDestinations}
        currentPlayer={currentPlayer}
        disabled={winner !== null}
      />
    </main>
  )
}
