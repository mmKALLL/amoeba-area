# Iteration 3: Capture + Game End

**Goal:** Add the capturing mechanism and end-of-game detection.

## Rules (locked)

**Capture** — at the end of a move:
- Compute the moving player's hull *before* the move.
- Apply the move (selected piece removed, destination added).
- Compute the moving player's hull *after* the move.
- For every opponent piece coord: if it was *strictly outside* the mover's hull-before but is *inside or on the boundary* of the mover's hull-after, the piece is captured (removed).
- "Inside or on the boundary" — the perimeter is inclusive, so opponent pieces lying exactly on the new hull edge are also captured.
- A player moving their own piece into the opponent's hull on their own turn does **not** trigger any capture (the capture check only considers opponent pieces against the mover's hull change).

**Game end** — checked at the end of every move (after captures applied):
- A player's hull area is 0 (e.g. ≤ 2 pieces left, or all remaining pieces collinear) → that player loses.
- All of a player's pieces are inside-or-on the opponent's hull → that player loses.
- The opponent of the loser wins. (If both conditions trigger simultaneously the moving player still wins — the loser is whoever's pieces have been engulfed/erased.)

**While game is over:**
- Board clicks are disabled.
- A banner above the board shows the winner.
- Reset returns to the initial layout and clears the winner.

## Implementation

### Task A: `pointInConvexHull`

**File:** `src/geometry.ts` (extend)

Add:

```ts
export function pointInConvexHull(point: Point, hull: Point[]): boolean
```

Returns `true` if `point` lies inside `hull` or on its boundary.

Edge cases:
- Empty hull → `false`
- Single-vertex hull → `true` iff `point` equals that vertex (with epsilon)
- Two-vertex hull (degenerate segment) → `true` iff `point` lies on the segment, endpoints inclusive
- 3+ vertex convex polygon → standard "all cross products have consistent sign, zero allowed" test

Use a small epsilon (1e-9) for boundary inclusivity.

The hull is assumed convex and oriented consistently (the `convexHull` already emits CCW or CW consistently). Don't assume one specific orientation — accept either by checking `>= -EPS` for one orientation or `<= EPS` for the other; the cleanest formulation is "all cross-product signs are the same (within epsilon)".

No tests. Self-verify by reasoning through:
- Square hull `[(0,0),(4,0),(4,4),(0,4)]`: `(2,2)` → true, `(0,0)` → true, `(4,2)` → true (on boundary), `(5,2)` → false.
- Degenerate two-vertex hull `[(0,0),(4,0)]`: `(2,0)` → true, `(2,1)` → false.
- Empty hull `[]`: any point → false.

**Commit message:** `Add point-in-convex-hull predicate (boundary-inclusive)`

---

### Task B: capture + game end + banner

**Files:**
- Modify: `src/App.tsx`
- New: `src/GameOverBanner.tsx`
- Modify: `src/Board.tsx` (small — disable clicks/hover when game is over)
- Modify: `src/styles.css` (banner styles)

#### State additions in `App.tsx`

- `winner: Player | null`. `null` while game is in progress; set to the winning player when the game ends.

When `winner !== null`:
- `handleCellClick` returns immediately (no-op).
- Hover handler also no-ops (clear `hoverCoord` and `selectedKey`).
- Reset clears the winner.

#### Move-commit logic update

Replace the current commit path with:

1. Compute mover's `hullBefore` from current pegs (in **grid coords**).
2. Build `pegsAfterMove` = current pegs with selectedKey removed and destination added.
3. Compute mover's `hullAfter` from `pegsAfterMove` (grid coords).
4. Find captures: iterate every opponent peg in `pegsAfterMove`; if `!pointInConvexHull(opp, hullBefore)` AND `pointInConvexHull(opp, hullAfter)` → mark captured. Build `pegsAfterCaptures` by removing the captured opponent pegs.
5. Determine `winner`:
   - Compute final hulls (red and blue) from `pegsAfterCaptures`.
   - If a player has no pegs OR their hull has area ≤ ε → that player loses.
   - Else if all of one player's pegs are inside-or-on the opponent's hull → that player loses.
   - If both players lose simultaneously, the moving player wins (i.e., the moving player is never the loser when both trigger).
   - If neither, `winner = null` and play continues.
6. Set state: `pegs = pegsAfterCaptures`, `currentPlayer = otherPlayer(currentPlayer)` (only flip turn if game is still going — if the game ended on this move, the turn flip is harmless but unnecessary; either way is fine), `selectedKey = null`, `hoverCoord = null`, `winner`.

The validity check (area-preserving for the *mover's* hull) still uses the simulated `pegsAfterMove` (no captures applied) — captures are a *consequence* of the move, not a precondition. This means a move can be valid even if it triggers self-loss; the player is allowed to make a losing move.

#### Validity check + valid-destinations highlight

The `isValidDestination` predicate continues to operate purely on the mover's pegs and area. It does NOT consider captures or end conditions. So the highlight set remains "moves that preserve mover's area" — captures are a side effect.

#### `src/GameOverBanner.tsx` (new)

```tsx
import type { Player } from './types'

type Props = {
  winner: Player
  onReset: () => void
}

export default function GameOverBanner({ winner, onReset }: Props) {
  return (
    <div className={`game-over banner-${winner}`} role="alert">
      <span className="banner-text">
        <span className={`banner-name banner-${winner}`}>{winner}</span> wins!
      </span>
      <button type="button" className="reset" onClick={onReset}>
        Play again
      </button>
    </div>
  )
}
```

Render this in `App.tsx` when `winner !== null`, between the header and the stats panel (or above the stats panel).

#### `Board.tsx` changes

Accept a new prop `disabled?: boolean`. When true:
- Hit circles still render but their `onClick`/`onMouseEnter`/`onMouseLeave` become no-ops (simplest: gate the handlers in the JSX).
- Visual: optional CSS dimming (`.board.disabled { filter: grayscale(0.4); }`) — feel free to skip dimming if it's distracting; either way disable the interactivity.

Pass `disabled={winner !== null}` from App.

#### `styles.css` additions

```css
.game-over {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 16px;
  margin-bottom: 12px;
  border: 2px solid;
  border-radius: 6px;
  font-size: 1.1rem;
}
.banner-text { font-weight: 600; }
.banner-name { text-transform: capitalize; }
.banner-red { color: #c0392b; border-color: #c0392b; background: #fdecea; }
.banner-blue { color: #2c5fb8; border-color: #2c5fb8; background: #ebf1fc; }
.banner-red.banner-text, .banner-blue.banner-text { /* unused — name span carries color */ }

.board.disabled { filter: grayscale(0.4); }
```

#### Verification

- `npx tsc -b` clean.
- `npm run build` clean.
- Reasoning self-check: walk through one capture scenario in your head.
  - Initial layout. Red is to move. Red picks the (5,12) midpoint and moves it to (5,8). New red hull (with collinear-dropping): still the rectangle (5,7)-(5,17)-(10,17)-(10,7), area 50. Mover's hullBefore was the same rectangle, hullAfter is the same rectangle. No captures (nothing changed in red's hull). Game continues.
  - Now blue's turn. Blue moves (13,12) to (5,12). Wait — that's inside red's hull, not blue's. Blue's hull may shrink. After blue's move, captures considered: any red piece that was outside blue's hullBefore but is inside blue's hullAfter? Blue's hullAfter shrunk (fewer points around 13,12 area), so probably no captures. Blue's piece is now inside red's hull but doesn't trigger capture (capture only checked against mover's hull, not the destination's hull).
  - Eventually engineered scenario: red expands their hull to engulf a blue piece → that blue piece captured.

**Commit message:** `Capture opponent pieces and end the game`

---

## Out of scope

Networked multiplayer, animations of removal, undo, recap of which pieces were captured, scoring beyond winner. Capture preview during hover (not requested — area highlight stays purely about area-preservation).
