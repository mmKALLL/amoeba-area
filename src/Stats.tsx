import type { Player } from './types'

type PlayerStats = { area: number; perimeter: number }

type Props = {
  red: PlayerStats
  blue: PlayerStats
  preview?: { player: Player; area: number; perimeter: number } | null
}

export default function Stats({ red, blue, preview }: Props) {
  const row = (player: Player, base: PlayerStats) => {
    const showPreview = preview && preview.player === player
    return (
      <div className={`stats-row stats-${player}`}>
        <span className="stats-label">{player}</span>
        <span className="stats-value">
          area {base.area.toFixed(0)}
          {showPreview && (
            <span className="stats-preview"> → {preview!.area.toFixed(0)}</span>
          )}
        </span>
        <span className="stats-value">
          perim {base.perimeter.toFixed(2)}
          {showPreview && (
            <span className="stats-preview"> → {preview!.perimeter.toFixed(2)}</span>
          )}
        </span>
      </div>
    )
  }
  return (
    <section className="stats" aria-label="player statistics">
      {row('red', red)}
      {row('blue', blue)}
    </section>
  )
}
