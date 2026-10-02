// Maps a metal colour (by master-data id) to the swatch tone used by PLP and PDP swatches.
export type MetalTone = 'yellow' | 'white' | 'rose' | 'black';

export function metalToneFor(master: any[] | undefined, colorId?: string | null): MetalTone {
  const color = master?.find((item: any) => item.id === colorId);
  const code = String(color?.code ?? '').toUpperCase();
  const name = String(color?.name ?? '').toLowerCase();
  if (code === 'YG' || name.includes('yellow')) {
    return 'yellow';
  }
  if (code === 'RG' || name.includes('rose') || name.includes('pink')) {
    return 'rose';
  }
  if (code === 'BG' || name.includes('black')) {
    return 'black';
  }
  return 'white';
}
