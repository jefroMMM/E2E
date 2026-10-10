export function normalizeFlavorText(text: string): string {
  return text.replace(/\u00ad/g, '').replace(/pok[eé]mon/gi, 'Pokémon').replace(/\s+/g, ' ').trim()
}
