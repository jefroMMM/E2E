export const TYPE_ORDER = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison',
  'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
] as const

export type PokemonType = (typeof TYPE_ORDER)[number]

export function isPokemonType(name: string): name is PokemonType {
  return TYPE_ORDER.some((type) => type === name)
}

export function typeHue(name?: string | null): string {
  return name && isPokemonType(name) ? `var(--type-${name})` : 'var(--color-ink)'
}
