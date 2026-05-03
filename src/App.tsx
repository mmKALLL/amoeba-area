import { useState } from 'react'
import Board from './Board'
import Stats from './Stats'
import { convexHull, polygonArea, polygonPerimeter, type Point } from './geometry'
import { buildInitialPegs, type CoordKey, type Player } from './types'

const computeStats = (pegs: Map<CoordKey, Player>, player: Player) => {
  const points: Point[] = []
  for (const [key, owner] of pegs) {
    if (owner !== player) continue
    const [rowStr, colStr] = key.split(',')
    points.push({ x: Number(colStr), y: Number(rowStr) })
  }
  const hull = convexHull(points)
  return { area: polygonArea(hull), perimeter: polygonPerimeter(hull) }
}

export default function App() {
  const [pegs, setPegs] = useState<Map<CoordKey, Player>>(() => buildInitialPegs())
  const [currentPlayer, setCurrentPlayer] = useState<Player>('red')

  const handleCellClick = () => undefined

  const reset = () => {
    setPegs(buildInitialPegs())
    setCurrentPlayer('red')
  }

  const redStats = computeStats(pegs, 'red')
  const blueStats = computeStats(pegs, 'blue')

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
      <Stats red={redStats} blue={blueStats} preview={null} />
      <Board pegs={pegs} onCellClick={handleCellClick} />
    </main>
  )
}
