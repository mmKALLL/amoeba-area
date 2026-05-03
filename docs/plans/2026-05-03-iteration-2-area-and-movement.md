# Iteration 2: Area + Movement

**Goal:** Convert the scaffold from "click to add a peg" into the real game: each player starts with 6 pieces in a rectangle, can only move existing pieces, and area (convex hull) must stay constant on every move. Show each player's hull as a tinted region and display area + perimeter stats.

## Design summary

**Initial layout (locked):** 6 pieces per player. Cols 4, 12, 20.
- Red rows: 5 and 10 (top rectangle)
- Blue rows: 13 and 18 (bottom rectangle)
- 2 empty rows between the rectangles (rows 11 and 12); board-centered vertically.

**Border bands:** Removed entirely (all four `<rect>` border-band elements gone).

**Area = convex hull area.** Each player's "area" is the area of the convex hull of their 6 pieces, in unit cells² (1 grid spacing = 1 unit). With the initial layout that's 16 × 5 = **80 units²** and perimeter **42 units** for each player.

**Move rules:**
- Pieces cannot be added or removed; only moved.
- A move is `(from, to)` where `from` is one of the current player's pieces and `to` is an empty intersection.
- The move is valid iff the convex-hull area of the player's pieces with `from` replaced by `to` equals the current area.
- Interior (non-load-bearing) pieces can move freely within the hull. Hull-vertex pieces can usually only move along the hull edge (or to interior positions that still leave the hull-vertex role to another piece).

**Selection + preview UX:**
- Click your own piece → it becomes selected (visual marker).
- While selected, hovering an empty cell renders a *preview hull* — the hull that would result if the piece moved to that cell.
  - If preview area equals current area → preview drawn in the player's color (valid).
  - Otherwise → preview drawn in a neutral invalid color (gray with red stroke).
- Click an empty cell → if valid, commit the move and flip the turn; if invalid, ignore (piece stays selected).
- Click the selected piece again → deselect.
- It is never the opponent's turn to select; clicks on opponent pieces are ignored.

**Stats panel:** Above or beside the board, show per-player area and perimeter. Updates live when a move commits and shows the *preview* values when hovering a valid destination during selection.

**Reset:** Returns to the initial layout (not an empty board); current player → red.

## Files

- New: `src/geometry.ts` — pure functions: `convexHull`, `polygonArea`, `polygonPerimeter`
- New: `src/Stats.tsx` — small presentational component for the per-player stats
- Modify: `src/types.ts` — export `INITIAL_PEGS` (a `Map<CoordKey, Player>`), add helper for it
- Modify: `src/Board.tsx` — drop border bands; render two hull polygons (one per player) with semi-transparent fill; render preview polygon when applicable; mark selected piece; pass hover events
- Modify: `src/App.tsx` — state for `selectedKey: CoordKey | null` and `hoverCoord: Coord | null`; `handleCellClick` becomes `handlePieceClick`/`handleEmptyClick`; reset goes to `INITIAL_PEGS`; compute stats and pass to Stats and Board
- Modify: `src/styles.css` — styles for selected peg, preview hull (valid + invalid), stats panel

## Tasks

### Task 1: Geometry helpers

Pure-TS module with no React dependency.

**File:** `src/geometry.ts`

Exports:
- `type Point = { x: number; y: number }`
- `convexHull(points: Point[]): Point[]` — returns hull vertices in CCW order. Use the monotone-chain (Andrew's) algorithm. Handles collinear points (drop them from the hull). Returns `[]` for 0 inputs, `[p]` for 1 input, `[a, b]` for 2 distinct inputs (degenerate hull).
- `polygonArea(polygon: Point[]): number` — shoelace formula. Returns 0 for `<3` vertices. Always non-negative (use `Math.abs`).
- `polygonPerimeter(polygon: Point[]): number` — sum of edge lengths. For 2 vertices returns 2× the segment length (treats it as a degenerate polygon). For 0 or 1 returns 0.

Implementation notes:
- All math in plain numbers (Cartesian coords). Callers convert grid `(row, col)` → `(x: col, y: row)` themselves; this module is grid-agnostic.
- Sort input by `(x, then y)` ascending in `convexHull`.
- Use a strict left-turn test (`cross > 0`) so that collinear points are excluded from the hull.

No tests required. Self-verify with these expectations in your head before reporting:
- `convexHull([(0,0),(4,0),(4,3),(0,3)])` → 4 points, area 12, perimeter 14
- `convexHull([(0,0),(4,0),(4,3),(0,3),(2,1)])` → still 4 points (interior dropped), area 12
- `convexHull([(0,0),(2,0),(4,0)])` → 2 points (collinear), area 0, perimeter 8

**Commit:** `feat: add convex hull and polygon math helpers`

---

### Task 2: Initial layout + hull rendering, drop border bands

Extends the existing scaffold so the game starts with 12 placed pieces and each player's convex hull is rendered as a tinted polygon. No movement logic yet.

**Files:**
- Modify: `src/types.ts`
- Modify: `src/Board.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

**`src/types.ts`** — add:

```ts
import type { CoordKey, Player } from './types' // (already in this file, just for reference)

export const INITIAL_LAYOUT: ReadonlyArray<{ row: number; col: number; player: Player }> = [
  // red top rectangle
  { row: 5, col: 4, player: 'red' },
  { row: 5, col: 12, player: 'red' },
  { row: 5, col: 20, player: 'red' },
  { row: 10, col: 4, player: 'red' },
  { row: 10, col: 12, player: 'red' },
  { row: 10, col: 20, player: 'red' },
  // blue bottom rectangle
  { row: 13, col: 4, player: 'blue' },
  { row: 13, col: 12, player: 'blue' },
  { row: 13, col: 20, player: 'blue' },
  { row: 18, col: 4, player: 'blue' },
  { row: 18, col: 12, player: 'blue' },
  { row: 18, col: 20, player: 'blue' },
]

export const buildInitialPegs = (): Map<CoordKey, Player> => {
  const m = new Map<CoordKey, Player>()
  for (const { row, col, player } of INITIAL_LAYOUT) {
    m.set(coordKey({ row, col }), player)
  }
  return m
}
```

**`src/App.tsx`**:
- Initialise `pegs` with `buildInitialPegs()` (in both `useState` initial value and in `reset`).
- App still has `currentPlayer` and (for now) the placement click handler can be left intact or made a no-op — Task 4 replaces it. To avoid breakage now, simplest: `handleCellClick` becomes a no-op that does nothing.

**`src/Board.tsx`**:
- Remove the four border-band `<rect>` elements entirely.
- Compute red hull and blue hull from `pegs`. Convert grid `(row, col)` into Cartesian `(x = intersectionX(col), y = intersectionY(row))` and pass to `convexHull` (so the polygon is in screen coordinates).
- Render each hull as a `<polygon>` with class `hull hull-red` / `hull hull-blue`.
- Render hulls *under* the grid lines so the grid still shows through, but *over* the board background.

**`src/styles.css`**:
- Remove `.border-band`, `.border-red`, `.border-blue` rules.
- Add:
  ```css
  .hull { fill-opacity: 0.18; stroke-opacity: 0.6; stroke-width: 1.5; pointer-events: none; }
  .hull-red  { fill: #c0392b; stroke: #c0392b; }
  .hull-blue { fill: #2c5fb8; stroke: #2c5fb8; }
  ```

**Verify:** `npm run build` passes; `npm run dev` shows two tinted rectangles with pegs at their corners and edge midpoints, no border bands.

**Commit:** `feat: render player area hulls and seed the initial 12-piece layout`

---

### Task 3: Stats panel

Per-player area and perimeter, live-updated.

**Files:**
- New: `src/Stats.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

**`src/Stats.tsx`**:

```tsx
import type { Player } from './types'

type PlayerStats = { area: number; perimeter: number }

type Props = {
  red: PlayerStats
  blue: PlayerStats
  preview?: { player: Player; area: number; perimeter: number } | null
}

export default function Stats({ red, blue, preview }: Props) {
  const cell = (player: Player, base: PlayerStats) => {
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
    <section className="stats">
      {cell('red', red)}
      {cell('blue', blue)}
    </section>
  )
}
```

**`src/App.tsx`**: compute stats from `pegs` (filter by player → hull → area + perimeter) and pass to `<Stats />`. Render `<Stats />` between header and `<Board />`. The `preview` prop stays `null` until Task 4 adds hover preview.

**`src/styles.css`** additions:

```css
.stats {
  margin-bottom: 12px;
  padding: 8px 12px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.stats-row { display: flex; gap: 16px; align-items: baseline; }
.stats-label { width: 48px; font-weight: 600; text-transform: capitalize; }
.stats-red .stats-label { color: #c0392b; }
.stats-blue .stats-label { color: #2c5fb8; }
.stats-value { font-variant-numeric: tabular-nums; }
.stats-preview { color: #888; font-style: italic; }
```

**Verify:** `npm run build` clean; in the browser, the stats panel shows `red area 80, perim 42.00` and the same for blue.

**Commit:** `feat: show per-player area and perimeter stats`

---

### Task 4: Select, hover preview, area-preserving move

The biggest task — replaces the placeholder click handler with the real interaction.

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/Board.tsx`
- Modify: `src/styles.css`

**State additions in `App.tsx`:**
- `selectedKey: CoordKey | null` — the currently selected piece's coord (must belong to `currentPlayer`)
- `hoverCoord: Coord | null` — the empty cell currently hovered while a piece is selected; `null` otherwise

**Click behaviour:**
- Click cell `(r,c)`:
  - If `pegs.get(key) === currentPlayer`: toggle selection (`selectedKey = key` or `null` if it was already selected). Clear `hoverCoord`.
  - Else if `pegs.get(key) === otherPlayer`: ignore.
  - Else (empty cell):
    - If no piece selected: ignore.
    - Else: validate. Compute new player pegs = current player's pegs minus `selectedKey` plus the destination. If hull area equals the player's current area, commit: update `pegs`, flip `currentPlayer`, clear `selectedKey` and `hoverCoord`. Else: do nothing (piece stays selected).

**Hover behaviour:**
- `Board` accepts `onCellHover(coord | null)`.
- `App` only stores hover when `selectedKey` is set and the hovered cell is empty; ignores otherwise.

**Preview computation in `App.tsx`:**
- If `selectedKey` and `hoverCoord` are both set: compute the candidate set = `currentPlayer`'s pegs with `selectedKey` removed and `hoverCoord` added. Compute its hull area + perimeter. Pass `preview` to both `<Board>` (so it can render the preview polygon) and `<Stats>` (so it can show the `→ value`). Tag preview as `valid: true` if the area matches, `false` otherwise.

**Board rendering additions:**
- `Board` props now include: `selectedKey`, `previewHull` (`{ player: Player; points: Point[]; valid: boolean } | null`), `onCellHover`.
- Selected piece: render an extra ring `<circle>` around the selected peg with class `peg-selected`.
- Preview polygon: render with class `hull-preview` plus `hull-preview-valid` (uses player color) or `hull-preview-invalid` (gray fill, red stroke). Pointer-events: none. Drawn above the base hulls but below the pegs.
- The board's hit `<circle>`s now wire `onMouseEnter` / `onMouseLeave` calling `onCellHover({row,col})` / `onCellHover(null)`. Only fire hover for empty cells (a peg overlay covers the hit anyway when occupied).

**Style additions:**
```css
.peg-selected {
  fill: none;
  stroke: #f5d14a;
  stroke-width: 2.5;
  pointer-events: none;
}
.hull-preview { fill-opacity: 0.28; stroke-width: 2; stroke-dasharray: 4 3; pointer-events: none; }
.hull-preview-valid.hull-preview-red { fill: #c0392b; stroke: #c0392b; }
.hull-preview-valid.hull-preview-blue { fill: #2c5fb8; stroke: #2c5fb8; }
.hull-preview-invalid { fill: #999; stroke: #c0392b; }
```

**Reset:** still resets `pegs` and `currentPlayer`; also clears `selectedKey` and `hoverCoord`.

**Verify manually:**
- Click a red corner piece — it becomes selected; hovering empty cells outside the rectangle shows a gray preview (invalid); hovering a cell on the same edge as the corner shows... actually the corner can't move freely; only collinear positions on the same edge keep the hull area. Hover should preview red where valid and gray where not.
- Click a red midpoint piece (one of the col-12 pieces) — interior to the hull edges. Hovering anywhere inside the hull rectangle should preview red. Hovering outside should preview gray.
- Click an empty cell → moves committed if valid; opponent piece clicks ignored; clicking selected piece again deselects.
- After a valid move, turn flips to blue.
- Reset returns to initial layout.

**Commit:** `feat: select pieces and move them with area-preserving constraint and hover preview`

---

## Out of scope (still)

Win conditions, multi-piece animations, undo, persistence, networked multiplayer, accessibility beyond basic ARIA labels.
