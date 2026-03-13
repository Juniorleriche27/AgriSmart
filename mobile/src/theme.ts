export const DEFAULT_API_URL = 'https://juniorleriche-agrismart-api.hf.space';


export const palette = {
  screenGradient: ['#F6F1E8', '#E5EBD9', '#D9E3CC'] as const,
  heroGradient: ['#163025', '#1D4734', '#2F6A4B'] as const,
  heroTitle: '#FBF8F0',
  heroText: '#E8F0E3',
  heroSubtle: '#C8D7C4',
  kicker: '#B6D8A8',
  loadingBackground: '#F5EFE6',
  card: '#FFF8EE',
  border: '#D9CCBA',
  input: '#FFFCF7',
  inputBorder: '#D4C7B5',
  inputHint: '#9A8D7E',
  text: '#1E1913',
  subtleText: '#615447',
  leafDark: '#224933',
  leafBright: '#8CC766',
  actionPale: '#E4EED7',
  darkShell: '#101A15',
  darkShellBorder: 'rgba(255, 255, 255, 0.16)',
  cameraGradient: ['#122019', '#0D1712'] as const,
  cameraOverlay: ['rgba(8, 12, 10, 0.02)', 'rgba(8, 12, 10, 0.42)', 'rgba(8, 12, 10, 0.74)'] as const,
  primaryButtonGradient: ['#406D46', '#244C35'] as const,
  captureInner: '#2E5F44',
  metricCard: '#F4EEE3',
  track: '#E5DAC8',
  sectionEyebrow: '#7E6E5A',
} as const;


export const diseaseThemes: Record<string, { accent: string; surface: string; border: string; badge: string; tag: string }> = {
  common_rust: {
    accent: '#B35637',
    surface: '#FFF1E9',
    border: '#EAC2B4',
    badge: '#F7DACF',
    tag: 'Rouille commune',
  },
  healthy: {
    accent: '#2D7A4A',
    surface: '#EEF8EE',
    border: '#BDD9C2',
    badge: '#D8EEDB',
    tag: 'Feuille saine',
  },
  northern_leaf_blight: {
    accent: '#8E6B24',
    surface: '#FBF2DA',
    border: '#E8D69E',
    badge: '#F4E6B5',
    tag: 'Brulure septentrionale',
  },
  default: {
    accent: '#406D46',
    surface: '#F2F4EA',
    border: '#D4DCC7',
    badge: '#E2EBD8',
    tag: 'Diagnostic',
  },
};
