const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '')

export function filterByName<T extends { name: string }>(entries: readonly T[], query: string): T[] {
  const needle = normalize(query)
  if (!needle) return [...entries]
  const rank = (name: string) => name === needle ? 0 : name.startsWith(needle) ? 1 : 2
  return entries
    .filter((entry) => normalize(entry.name).includes(needle))
    .sort((a, b) => rank(normalize(a.name)) - rank(normalize(b.name)))
}
