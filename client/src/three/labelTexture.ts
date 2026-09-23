import * as THREE from 'three';

const cache = new Map<string, THREE.CanvasTexture>();

/**
 * A foil-printed label drawn to a canvas: thin double border, NB monogram,
 * fragrance name and concentration. Drawn in gold (or ink for light glass).
 */
export const labelTexture = (name: string, tone: 'gold' | 'ink', aspect: number) => {
  const key = `${name}|${tone}|${aspect.toFixed(2)}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const W = 1024;
  const H = Math.round(W / aspect);
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const color = tone === 'gold' ? '#D9C48F' : '#0D0E10';
  const serif = '"Cormorant Garamond", Georgia, "Times New Roman", serif';
  const sans = 'Jost, "Helvetica Neue", Arial, sans-serif';

  ctx.clearRect(0, 0, W, H);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;
  ctx.strokeRect(10, 10, W - 20, H - 20);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(26, 26, W - 52, H - 52);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.font = `400 ${Math.round(H * 0.12)}px ${serif}`;
  ctx.fillText('N B', W / 2, H * 0.2);

  ctx.fillRect(W / 2 - 40, H * 0.3, 80, 2);

  const display = name.toUpperCase();
  let size = Math.round(H * 0.2);
  ctx.font = `300 ${size}px ${serif}`;
  while (ctx.measureText(display).width > W * 0.78 && size > 20) {
    size -= 4;
    ctx.font = `300 ${size}px ${serif}`;
  }
  // letter-spaced name
  const spaced = display.split('').join(' ');
  ctx.fillText(spaced, W / 2, H * 0.52);

  ctx.font = `400 ${Math.round(H * 0.058)}px ${sans}`;
  ctx.fillText('C L A S S I C   S C E N T S', W / 2, H * 0.72);
  ctx.font = `300 ${Math.round(H * 0.048)}px ${sans}`;
  ctx.fillText('E A U   D E   P A R F U M', W / 2, H * 0.84);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  cache.set(key, texture);
  return texture;
};
