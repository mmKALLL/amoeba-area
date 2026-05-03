# Amoeba Area Frontend Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Scaffold a Vite + React + TypeScript project that renders a 24×24 Twixt-style board and supports two-player peg placement (red and blue) with turn alternation. No link logic, no win detection.

**Architecture:** Single-page React app. State (placed pegs + current player) lives in the `App` component via `useState`. A single `<Board>` component renders the grid and pegs as one SVG. Clicks on empty intersections place a peg and flip the turn.

**Tech Stack:** Vite 5, React 18, TypeScript 5 (strict), Vitest 2 with @testing-library/react, happy-dom.

**Repository state:** Empty repo on `main` with one commit (the design doc). No `package.json` yet.

---

## Task 1: Create package.json and install dependencies

**Files:**
- Create: `package.json`

**Step 1: Write package.json**

```json
{
  "name": "amoeba-area",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "happy-dom": "^15.11.0",
    "typescript": "^5.6.3",
    "vite": "^5.4.11",
    "vitest": "^2.1.5"
  }
}
```

**Step 2: Install**

Run: `npm install`
Expected: creates `node_modules/` and `package-lock.json` with no errors. Some peer-dep warnings are acceptable; an `npm error` line is not.

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add package.json with React + Vite + Vitest"
```

---

## Task 2: Add TypeScript and Vite config

**Files:**
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `.gitignore`

**Step 1: tsconfig.json (project references)**

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

**Step 2: tsconfig.app.json (app code)**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src"]
}
```

**Step 3: tsconfig.node.json (vite config typing)**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

**Step 4: vite.config.ts**

```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test-setup.ts'],
  },
})
```

**Step 5: .gitignore**

```
node_modules/
dist/
.DS_Store
*.local
.vite/
coverage/
```

**Step 6: Commit**

```bash
git add tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts .gitignore
git commit -m "chore: add TypeScript and Vite configuration"
```

---

## Task 3: Create entry point and minimal App

**Files:**
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`
- Create: `src/test-setup.ts`

**Step 1: index.html**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Amoeba Area</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Step 2: src/main.tsx**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**Step 3: src/App.tsx (minimal placeholder)**

```tsx
export default function App() {
  return <h1>Amoeba Area</h1>
}
```

**Step 4: src/styles.css (minimal)**

```css
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: #f5f5f5;
}
```

**Step 5: src/test-setup.ts**

```ts
import '@testing-library/jest-dom/vitest'
```

**Step 6: Verify dev server starts**

Run: `npm run dev` (in background or kill after a few seconds)
Expected: Vite prints `Local: http://localhost:5173/` (or similar) with no errors. Stop the server (Ctrl+C).

**Step 7: Verify production build**

Run: `npm run build`
Expected: TypeScript compiles cleanly, then Vite emits files into `dist/`. No errors.

**Step 8: Commit**

```bash
git add index.html src/main.tsx src/App.tsx src/styles.css src/test-setup.ts
git commit -m "feat: bootstrap React entry point with placeholder App"
```

---

## Task 4: Add smoke test for App

**Files:**
- Create: `src/__tests__/App.test.tsx`

**Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react'
import App from '../App'

describe('App', () => {
  it('renders the page heading', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /amoeba area/i })).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it passes**

Run: `npm test`
Expected: 1 test, passing. (Heading already exists from Task 3, so this confirms the test infrastructure works.)

**Step 3: Commit**

```bash
git add src/__tests__/App.test.tsx
git commit -m "test: add smoke test for App heading"
```

---

## Task 5: Define shared types

**Files:**
- Create: `src/types.ts`

**Step 1: Write types.ts**

```ts
export type Player = 'red' | 'blue'

export type Coord = { row: number; col: number }

export type CoordKey = `${number},${number}`

export const coordKey = ({ row, col }: Coord): CoordKey => `${row},${col}`

export const BOARD_SIZE = 24
```

**Step 2: Verify it type-checks**

Run: `npx tsc -b`
Expected: no errors.

**Step 3: Commit**

```bash
git add src/types.ts
git commit -m "feat: add shared types for board state"
```

---

## Task 6: Implement Board component (grid + border bands, no pegs yet)

**Files:**
- Create: `src/Board.tsx`
- Create: `src/__tests__/Board.test.tsx`

**Step 1: Write the failing test**

```tsx
import { render } from '@testing-library/react'
import Board from '../Board'
import { BOARD_SIZE } from '../types'

describe('Board', () => {
  it('renders a 24x24 grid of clickable cells', () => {
    const onCellClick = vi.fn()
    const { container } = render(<Board pegs={new Map()} onCellClick={onCellClick} />)
    const cells = container.querySelectorAll('[data-testid^="cell-"]')
    expect(cells.length).toBe(BOARD_SIZE * BOARD_SIZE)
  })

  it('calls onCellClick with the right coord when a cell is clicked', () => {
    const onCellClick = vi.fn()
    const { container } = render(<Board pegs={new Map()} onCellClick={onCellClick} />)
    const cell = container.querySelector('[data-testid="cell-3-7"]') as SVGElement
    cell.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(onCellClick).toHaveBeenCalledWith({ row: 3, col: 7 })
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `Board` cannot be found.

**Step 3: Implement Board.tsx**

```tsx
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
  const rows = Array.from({ length: BOARD_SIZE }, (_, i) => i)

  return (
    <svg
      viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
      width={SVG_SIZE}
      height={SVG_SIZE}
      className="board"
    >
      <rect
        x={PADDING - CELL_SIZE / 2}
        y={PADDING - CELL_SIZE / 2}
        width={CELL_SIZE}
        height={(BOARD_SIZE - 1) * CELL_SIZE + CELL_SIZE}
        className="border-band border-blue"
      />
      <rect
        x={PADDING + (BOARD_SIZE - 1) * CELL_SIZE - CELL_SIZE / 2}
        y={PADDING - CELL_SIZE / 2}
        width={CELL_SIZE}
        height={(BOARD_SIZE - 1) * CELL_SIZE + CELL_SIZE}
        className="border-band border-blue"
      />
      <rect
        x={PADDING - CELL_SIZE / 2}
        y={PADDING - CELL_SIZE / 2}
        width={(BOARD_SIZE - 1) * CELL_SIZE + CELL_SIZE}
        height={CELL_SIZE}
        className="border-band border-red"
      />
      <rect
        x={PADDING - CELL_SIZE / 2}
        y={PADDING + (BOARD_SIZE - 1) * CELL_SIZE - CELL_SIZE / 2}
        width={(BOARD_SIZE - 1) * CELL_SIZE + CELL_SIZE}
        height={CELL_SIZE}
        className="border-band border-red"
      />

      {rows.map((row) =>
        rows.map((col) => (
          <line
            key={`h-${row}-${col}`}
            x1={intersectionX(0)}
            y1={intersectionY(row)}
            x2={intersectionX(BOARD_SIZE - 1)}
            y2={intersectionY(row)}
            className="grid-line"
          />
        )),
      )}
      {rows.map((col) => (
        <line
          key={`v-${col}`}
          x1={intersectionX(col)}
          y1={intersectionY(0)}
          x2={intersectionX(col)}
          y2={intersectionY(BOARD_SIZE - 1)}
          className="grid-line"
        />
      ))}

      {rows.map((row) =>
        rows.map((col) => {
          const player = pegs.get(coordKey({ row, col }))
          return (
            <g key={`cell-${row}-${col}`}>
              <circle
                cx={intersectionX(col)}
                cy={intersectionY(row)}
                r={CELL_SIZE / 2}
                className="hit"
                data-testid={`cell-${row}-${col}`}
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
```

**Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: all tests pass.

**Step 5: Commit**

```bash
git add src/Board.tsx src/__tests__/Board.test.tsx
git commit -m "feat: render 24x24 SVG board with grid lines and border bands"
```

---

## Task 7: Wire pegs and turn alternation into App

**Files:**
- Modify: `src/App.tsx`
- Create: `src/__tests__/App.placement.test.tsx`

**Step 1: Write failing tests for placement behavior**

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

describe('App placement', () => {
  it('shows red as the starting player', () => {
    render(<App />)
    expect(screen.getByTestId('current-player')).toHaveTextContent(/red/i)
  })

  it('alternates turns after placing a peg', async () => {
    const user = userEvent.setup()
    const { container } = render(<App />)
    await user.click(container.querySelector('[data-testid="cell-0-0"]')!)
    expect(screen.getByTestId('current-player')).toHaveTextContent(/blue/i)
    await user.click(container.querySelector('[data-testid="cell-1-1"]')!)
    expect(screen.getByTestId('current-player')).toHaveTextContent(/red/i)
  })

  it('ignores clicks on already-placed cells', async () => {
    const user = userEvent.setup()
    const { container } = render(<App />)
    const cell = container.querySelector('[data-testid="cell-5-5"]')!
    await user.click(cell)
    await user.click(cell)
    expect(screen.getByTestId('current-player')).toHaveTextContent(/blue/i)
  })

  it('renders a peg with the placing player color', async () => {
    const user = userEvent.setup()
    const { container } = render(<App />)
    await user.click(container.querySelector('[data-testid="cell-2-3"]')!)
    expect(container.querySelector('.peg-red')).toBeInTheDocument()
  })
})
```

**Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: the four placement tests fail (no `current-player` testid, no state).

**Step 3: Update App.tsx**

```tsx
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

  return (
    <main className="app">
      <header className="app-header">
        <h1>Amoeba Area</h1>
        <div className="turn">
          Turn:{' '}
          <span data-testid="current-player" className={`turn-${currentPlayer}`}>
            {currentPlayer}
          </span>
        </div>
      </header>
      <Board pegs={pegs} onCellClick={handleCellClick} />
    </main>
  )
}
```

**Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: all tests pass (smoke + Board + placement).

**Step 5: Commit**

```bash
git add src/App.tsx src/__tests__/App.placement.test.tsx
git commit -m "feat: place pegs and alternate turns on click"
```

---

## Task 8: Style the board

**Files:**
- Modify: `src/styles.css`

**Step 1: Append styles**

```css
.app {
  max-width: 720px;
  margin: 0 auto;
  padding: 24px;
}

.app-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 16px;
}

.app-header h1 {
  margin: 0;
  font-size: 1.5rem;
}

.turn { font-size: 1rem; }
.turn-red { color: #c0392b; font-weight: 600; }
.turn-blue { color: #2c5fb8; font-weight: 600; }

.board {
  background: #fafaf6;
  border: 1px solid #ddd;
  display: block;
  width: 100%;
  height: auto;
}

.grid-line {
  stroke: #ccc;
  stroke-width: 1;
}

.border-band { fill-opacity: 0.18; stroke: none; }
.border-red  { fill: #c0392b; }
.border-blue { fill: #2c5fb8; }

.hit { fill: transparent; cursor: pointer; }
.hit:hover { fill: rgba(0, 0, 0, 0.06); }

.peg-red  { fill: #c0392b; stroke: #7a1f14; stroke-width: 1; }
.peg-blue { fill: #2c5fb8; stroke: #16386b; stroke-width: 1; }
```

**Step 2: Visual smoke check**

Run: `npm run dev`
Open the browser at the printed URL, click around, confirm:
- 24×24 grid with red top/bottom bands and blue left/right bands
- Clicking places a peg in the current player's color
- Turn indicator alternates red ↔ blue
- Clicking an occupied intersection is a no-op

Stop the dev server (Ctrl+C).

**Step 3: Commit**

```bash
git add src/styles.css
git commit -m "style: paint board, border bands, and turn indicator"
```

---

## Task 9: Final verification

**Step 1: Run the full test suite**

Run: `npm test`
Expected: all tests pass.

**Step 2: Run a production build**

Run: `npm run build`
Expected: clean tsc output, Vite emits to `dist/` without errors.

**Step 3: Confirm working tree is clean**

Run: `git status`
Expected: `nothing to commit, working tree clean`.

**Done.** The repo now has a working Twixt-style frontend scaffold with passing tests. Future work (link logic, win detection, border-placement rules) builds on this foundation.
