export interface FontOption {
  id: string;
  name: string;
  family: string;
  googleFamily: string; // for loading from Google Fonts
  category: 'serif' | 'sans-serif' | 'monospace';
}

export const FONTS: FontOption[] = [
  { id: 'merriweather', name: 'Merriweather', family: "'Merriweather', Georgia, serif", googleFamily: 'Merriweather:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700', category: 'serif' },
  { id: 'lora', name: 'Lora', family: "'Lora', Georgia, serif", googleFamily: 'Lora:ital,wght@0,400;0,600;0,700;1,400;1,700', category: 'serif' },
  { id: 'playfair', name: 'Playfair Display', family: "'Playfair Display', Georgia, serif", googleFamily: 'Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,700', category: 'serif' },
  { id: 'eb-garamond', name: 'EB Garamond', family: "'EB Garamond', Georgia, serif", googleFamily: 'EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500', category: 'serif' },
  { id: 'crimson-pro', name: 'Crimson Pro', family: "'Crimson Pro', Georgia, serif", googleFamily: 'Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400', category: 'serif' },
  { id: 'source-serif', name: 'Source Serif 4', family: "'Source Serif 4', Georgia, serif", googleFamily: 'Source+Serif+4:ital,wght@0,300;0,400;0,600;1,300;1,400', category: 'serif' },
  { id: 'inter', name: 'Inter', family: "'Inter', system-ui, sans-serif", googleFamily: 'Inter:wght@300;400;500;600;700', category: 'sans-serif' },
  { id: 'nunito', name: 'Nunito', family: "'Nunito', system-ui, sans-serif", googleFamily: 'Nunito:ital,wght@0,300;0,400;0,600;0,700;1,400', category: 'sans-serif' },
  { id: 'open-sans', name: 'Open Sans', family: "'Open Sans', system-ui, sans-serif", googleFamily: 'Open+Sans:ital,wght@0,300;0,400;0,600;0,700;1,400', category: 'sans-serif' },
  { id: 'literata', name: 'Literata', family: "'Literata', Georgia, serif", googleFamily: 'Literata:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400', category: 'serif' },
  { id: 'ibm-plex-mono', name: 'IBM Plex Mono', family: "'IBM Plex Mono', monospace", googleFamily: 'IBM+Plex+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400', category: 'monospace' },
  { id: 'jetbrains-mono', name: 'JetBrains Mono', family: "'JetBrains Mono', monospace", googleFamily: 'JetBrains+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400', category: 'monospace' },
];

const loadedFonts = new Set<string>();

export function loadFont(font: FontOption): void {
  if (loadedFonts.has(font.id)) return;
  // Merriweather and Inter are already loaded in index.html
  if (font.id === 'merriweather' || font.id === 'inter') {
    loadedFonts.add(font.id);
    return;
  }

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${font.googleFamily}&display=swap`;
  document.head.appendChild(link);
  loadedFonts.add(font.id);
}

export function applyEditorFont(fontId: string | null): void {
  const font = FONTS.find((f) => f.id === fontId) || FONTS[0];
  loadFont(font);
  document.documentElement.style.setProperty('--editor-font', font.family);
}

export function getFontById(fontId: string | null): FontOption {
  return FONTS.find((f) => f.id === fontId) || FONTS[0];
}
