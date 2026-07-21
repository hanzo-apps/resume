/**
 * The canonical resume sections, in the order a reader expects them. The editor
 * offers these as presets; the resume view renders sections in this order and
 * appends any others (a custom section name) alphabetically after them. One
 * list, two consumers — no drift.
 */
export const SECTIONS = ['Experience', 'Projects', 'Skills', 'Education'] as const

export type Section = (typeof SECTIONS)[number]

/** Sort section names into canonical order, unknowns last (alphabetical). */
export function orderSections(names: string[]): string[] {
  const rank = (s: string) => {
    const i = (SECTIONS as readonly string[]).indexOf(s)
    return i === -1 ? SECTIONS.length : i
  }
  return [...names].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))
}
