# Amoeba Area — Frontend Scaffold Design

Date: 2026-05-03

## Purpose

Initialize a TypeScript frontend for an original two-player board game whose
piece movement and visualization resemble Twixt. This first iteration is a
scaffold: it renders the board and lets players place pegs by clicking. No
linking, no rule enforcement beyond turn alternation, no win detection.

## Stack

- Vite + React 18 + TypeScript (strict mode)
- Vitest for unit tests
- npm for package management
- No ESLint/Prettier yet (can be added later)

## Architecture

Single-page app, no router. State lives in `App` via `useState`:

- `pegs: Map<string, Player>` keyed by `"row,col"`, valued `"red" | "blue"`
- `currentPlayer: Player`

Clicking an empty intersection places the current player's peg and flips
`currentPlayer`. Clicks on occupied intersections are ignored.

Component tree:

```
App
└── Board (24x24 SVG)
```

## Visuals

A single `<svg>` renders:

- The 24x24 grid (lines between intersections)
- Four player-owned border bands styled distinctly: red on the top and bottom
  rows, blue on the left and right columns
- One `<circle>` per placed peg, colored by player

A header above the board shows whose turn it is.

## Rules in scope

- Place a peg on any empty intersection (borders allowed for now)
- Alternate turns
- Out of scope: link logic, border-placement restrictions, win detection,
  undo, persistence, multiplayer

## File layout

```
package.json
vite.config.ts
tsconfig.json
index.html
.gitignore
src/
  main.tsx
  App.tsx
  Board.tsx
  types.ts
  styles.css
src/__tests__/
  App.test.tsx
```

## Testing

One smoke test that renders `App` without crashing. Broader coverage waits
until real game rules exist to test against.

## Out of scope

Linking logic, win detection, undo, persistence, multiplayer, lint/format
tooling. These are deliberately deferred — the next design iteration will
introduce game rules on top of this scaffold.
