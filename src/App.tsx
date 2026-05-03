import { useState } from 'react'
import Board from './Board'
import { buildInitialPegs, type CoordKey, type Player } from './types'

export default function App() {
  const [pegs, setPegs] = useState<Map<CoordKey, Player>>(() => buildInitialPegs())
  const [currentPlayer, setCurrentPlayer] = useState<Player>('red')

  const handleCellClick = () => undefined

  const reset = () => {
    setPegs(buildInitialPegs())
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
