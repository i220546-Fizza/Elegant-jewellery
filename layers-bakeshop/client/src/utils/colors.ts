/**
 * JS-readable mirror of the CSS custom properties in `index.css`.
 * Three.js materials and canvas-based charts can't consume CSS vars directly,
 * so these hex values must be kept in sync with the `--layers-*` tokens.
 */
export const layersColors = {
  primary: '#6e1e2c',
  primaryHover: '#591723',
  primaryLight: '#8c3341',
  ink: '#2b1b14',
  inkSoft: '#5a4a3f',
  muted: '#8a7a6d',
  background: '#fbf7f1',
  surface: '#ffffff',
  surfaceAlt: '#f4ecdf',
  accent: '#c9a24b',
  accentSoft: '#ecdcb2',
  accentHover: '#b38a36',
  border: '#e7ddd0',
  success: '#4c7a5b',
  warning: '#c67c2e',
  error: '#b3372c',
} as const;
