# Amoeba Area Frontend Implementation Plan

**Goal:** Scaffold a Vite + React + TypeScript project that renders a 24×24 Twixt-style board and supports two-player peg placement (red and blue) with turn alternation. No link logic, no win detection, no automated tests — verification is manual via the dev server.

**Architecture:** Single-page React app. State (placed pegs + current player) lives in the `App` component via `useState`. A single `<Board>` component renders the grid and pegs as one SVG. Clicks on empty intersections place a peg and flip the turn.

**Tech Stack:** Vite 5, React 18, TypeScript 5 (strict). No test framework.

---

## Task 1: package.json + install

**File:** `package.json`

```json
{
  "name": "amoeba-area",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "^5.6.3",
    "vite": "^5.4.11"
  }
}
```

Run `npm install`, then commit `package.json` and `package-lock.json` (do NOT add `node_modules/`).

---

## Task 2: Configs and HTML shell

**Files:** `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `vite.config.ts`, `.gitignore`, `index.html`

`tsconfig.json` references both project tsconfigs. App tsconfig sets strict mode, JSX react-jsx, target ES2022. Vite config registers the React plugin only (no test block). `.gitignore` excludes `node_modules`, `dist`, `.vite`, `.DS_Store`. `index.html` mounts `<div id="root">` and loads `/src/main.tsx`.

---

## Task 3: Source files

**Files:** `src/main.tsx`, `src/types.ts`, `src/Board.tsx`, `src/App.tsx`, `src/styles.css`

- `main.tsx` — bootstraps React into `#root`
- `types.ts` — `Player`, `Coord`, `coordKey`, `BOARD_SIZE = 24`
- `Board.tsx` — SVG with grid lines, red top/bottom and blue left/right border bands, transparent click circles per intersection, colored peg circles for placed pegs
- `App.tsx` — owns `pegs: Map<CoordKey, Player>` and `currentPlayer`; click handler places a peg if empty and flips player; renders header with current-player label and `<Board>`
- `styles.css` — basic layout + colors

---

## Task 4: Verify

Run `npm run dev`, click around in the browser, confirm:
- 24×24 grid with red top/bottom bands and blue left/right bands
- Click places current-player peg
- Turn alternates red ↔ blue
- Clicking an occupied intersection is a no-op

Then `npm run build` should succeed cleanly.
