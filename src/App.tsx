import { useState } from 'react'
import Board from './Board'
import { coordKey, type Coord, type CoordKey, type Player } from './types'

const otherPlayer = (p: Player): Player => (p === 'red' ? 'blue' : 'red')

export default function App() {
  const [pegs, setPegs] = useState<Map<CoordKey, Player>>(() => new Map())
  const [currentPlayer, setCurrentPlayer] = useState<Player>('red')

  const handleCellClick = (coord: Coord) => {
    const key = coordKey(coord)
    if (pegs.has(key)) return
    const next = new Map(pegs)
    next.set(key, currentPlayer)
    setPegs(next)
    setCurrentPlayer(otherPlayer(currentPlayer))
  }

  const reset = () => {
    setPegs(new Map())
    setCurrentPlayer('red')
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
      <Board pegs={pegs} onCellClick={handleCellClick} />
    </main>
  )
}
