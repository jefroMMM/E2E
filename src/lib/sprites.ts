export function idFromUrl(url: string): number {
  const match = /\/(\d+)\/?$/.exec(url)
  if (!match) throw new Error(`Missing resource id in ${url}`)
  return Number(match[1])
}

export function dexNumber(id: number): string {
  return String(id).padStart(4, '0')
}

export function artworkUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
}
