/** design-system.md §2.2: Lusion's palette. Values marked derived there have no Lusion source. */
export const colors = {
  background: '#F0F1FA',
  surface: '#FFFFFF',
  surfaceMuted: '#E4E6EF',
  textPrimary: '#000000',
  textSecondary: 'rgba(0, 0, 0, 0.5)',
  textPlaceholder: 'rgba(0, 0, 0, 0.3)',
  textOnPrimary: '#FFFFFF',
  primary: '#2B2E3A',
  primaryPressed: '#0016EC',
  accent: '#1A2FFB',
  /** Lime. Only on dark, or as a fill behind black text. */
  highlight: '#C1FF00',
  /** Tinted backgrounds for badges and highlights, one per accent. */
  primarySurface: 'rgba(0, 22, 236, 0.1)',
  successSurface: '#C1FF00',
  dangerSurface: 'rgba(233, 0, 0, 0.08)',
  disabled: '#E4E6EF',
  /** Lime, like `highlight`: a fill with black text on it, never text on a light screen. */
  success: '#C1FF00',
  danger: '#E90000',
  dangerAccent: '#FF4C41',
  darkBackground: '#000000',
  darkSurface: '#121416',
  darkPanel: '#141515',
  darkTrack: '#34393F',
  textOnDark: '#FFFFFF',
  textOnDarkMuted: 'rgba(255, 255, 255, 0.3)',
  overlayOnLight: 'rgba(0, 0, 0, 0.1)',
  overlayOnDark: 'rgba(255, 255, 255, 0.1)',
  scrim: 'rgba(0, 0, 0, 0.9)',
  /** Derived: dims the screen behind a bottom sheet without hiding it. */
  backdrop: 'rgba(0, 0, 0, 0.5)',
  crossMark: '#999999',
} as const
