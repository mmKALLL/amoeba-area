import type { Player } from './types'

type Props = {
  winner: Player
  onReset: () => void
}

export default function GameOverBanner({ winner, onReset }: Props) {
  return (
    <div className={`game-over banner-${winner}`} role="alert">
      <span className="banner-text">
        <span className="banner-name">{winner}</span> wins!
      </span>
      <button type="button" className="reset" onClick={onReset}>
        Play again
      </button>
    </div>
  )
}
