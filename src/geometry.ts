export type Point = { x: number; y: number }

const cross = (o: Point, a: Point, b: Point): number =>
  (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)

export function convexHull(points: Point[]): Point[] {
  const seen = new Set<string>()
  const unique: Point[] = []
  for (const p of points) {
    const key = `${p.x},${p.y}`
    if (!seen.has(key)) {
      seen.add(key)
      unique.push(p)
    }
  }

  if (unique.length <= 1) return unique.slice()

  const sorted = unique.slice().sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x))

  if (sorted.length === 2) return sorted

  const lower: Point[] = []
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop()
    }
    lower.push(p)
  }

  const upper: Point[] = []
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i]
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop()
    }
    upper.push(p)
  }

  lower.pop()
  upper.pop()

  return lower.concat(upper)
}

export function polygonArea(polygon: Point[]): number {
  if (polygon.length < 3) return 0
  let sum = 0
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i]
    const b = polygon[(i + 1) % polygon.length]
    sum += a.x * b.y - b.x * a.y
  }
  return Math.abs(sum) / 2
}

export function polygonPerimeter(polygon: Point[]): number {
  if (polygon.length < 2) return 0
  if (polygon.length === 2) {
    const dx = polygon[0].x - polygon[1].x
    const dy = polygon[0].y - polygon[1].y
    return 2 * Math.sqrt(dx * dx + dy * dy)
  }
  let total = 0
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i]
    const b = polygon[(i + 1) % polygon.length]
    const dx = a.x - b.x
    const dy = a.y - b.y
    total += Math.sqrt(dx * dx + dy * dy)
  }
  return total
}
