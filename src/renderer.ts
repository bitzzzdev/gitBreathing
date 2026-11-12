import { STYLES, type StyleId } from './styles';

export type Background = 'transparent' | 'dark';
export type RenderOptions = {
  size: number;
  styles: StyleId[];
  power: number;
  phase?: number;
  background?: Background;
  seed?: string;
  styleWeights?: Partial<Record<StyleId, number>>;
  styleColors?: Partial<Record<StyleId, string[]>>;
  effects?: { glow?: boolean; particles?: boolean; secondaryCuts?: boolean; motion?: boolean; particleDensity?: number; strokeScale?: number };
};

type RGB = [number, number, number];
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const rgb = (hex: string): RGB => {
  const value = hex.replace('#', '');
  const full = value.length === 3 ? value.split('').map((x) => x + x).join('') : value;
  const n = Number.parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const hash = (text: string) => {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
};
const randomAt = (seed: number, index: number) => {
  let x = (seed + Math.imul(index + 1, 0x9e3779b1)) >>> 0;
  x ^= x >>> 16; x = Math.imul(x, 0x7feb352d); x ^= x >>> 15; x = Math.imul(x, 0x846ca68b); x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
};

export function renderSlash(options: RenderOptions): Uint8ClampedArray {
  const size = clamp(Math.round(options.size), 8, 128);
  const power = clamp(options.power, 0, 1);
  const phase = options.phase ?? 0;
  const effects = options.effects ?? {};
  const particleDensity = clamp(effects.particleDensity ?? 1, 0, 3);
  const strokeScale = clamp(effects.strokeScale ?? 1, 0.5, 3);
  const background = options.background ?? 'transparent';
  const styles: StyleId[] = options.styles.length ? options.styles : ['sun'];
  const seed = hash(options.seed ?? 'gitbreathing');
  const out = new Uint8ClampedArray(size * size * 4);
  if (background === 'dark') {
    for (let i = 0; i < size * size; i++) {
      out[i * 4] = 9; out[i * 4 + 1] = 11; out[i * 4 + 2] = 18; out[i * 4 + 3] = 255;
    }
  }

  const put = (x: number, y: number, color: RGB, alpha = 255) => {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= size || y >= size || alpha <= 0) return;
    const i = (y * size + x) * 4;
    const oldA = out[i + 3] / 255;
    const a = clamp(alpha / 255, 0, 1);
    const nextA = a + oldA * (1 - a);
    if (nextA <= 0) return;
    out[i] = Math.round((color[0] * a + out[i] * oldA * (1 - a)) / nextA);
    out[i + 1] = Math.round((color[1] * a + out[i + 1] * oldA * (1 - a)) / nextA);
    out[i + 2] = Math.round((color[2] * a + out[i + 2] * oldA * (1 - a)) / nextA);
    out[i + 3] = Math.round(nextA * 255);
  };
  const line = (x0: number, y0: number, x1: number, y1: number, radius: number, color: RGB, alpha = 255) => {
    const steps = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 1.5));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps; const x = x0 + (x1 - x0) * t; const y = y0 + (y1 - y0) * t;
      for (let yy = -radius; yy <= radius; yy++) for (let xx = -radius; xx <= radius; xx++) {
        if (xx * xx + yy * yy <= radius * radius + 0.8) put(x + xx, y + yy, color, alpha);
      }
    }
  };

  // The activity curve controls both the slash body and the amount of surrounding detail.
  const bodyRadius = Math.max(1, Math.round((0.7 + power * size * 0.025) * strokeScale));
  styles.forEach((id, layer) => {
    const definition = STYLES[id];
    if (!definition) return;
    const palette = (options.styleColors?.[id]?.length ? options.styleColors[id]! : [...definition.colors]).map(rgb);
    const weight = clamp(options.styleWeights?.[id] ?? 1, 0, 3);
    if (weight === 0) return;
    const layerScale = 1 / (1 + layer * 0.22);
    const startX = size * (0.12 - layer * 0.012);
    const endX = size * (0.88 + layer * 0.012);
    const baseY = size * (0.78 - layer * 0.025);
    const amplitude = size * (0.12 + 0.15 * power) * layerScale * weight;
    const thickness = Math.max(1, Math.round(bodyRadius * layerScale * Math.min(1.35, weight)));
    const point = (t: number): [number, number] => {
      const diagonal = -t * size * 0.52;
      const wave = Math.sin(t * Math.PI * (definition.shape === 'wave' ? 2.2 : 1.15) + layer * 0.7) * amplitude * 0.23;
      const bend = Math.sin(t * Math.PI) * amplitude;
      const motion = effects.motion === false ? 0 : Math.sin(t * 10 + phase * Math.PI * 2 + layer) * size * 0.012 * power;
      return [startX + (endX - startX) * t, baseY + diagonal - bend + wave + motion];
    };
    const samples = Math.max(12, Math.round(size * (0.18 + power * 0.82)));
    for (let i = 0; i < samples; i++) {
      const a = point(i / samples); const b = point((i + 1) / samples);
      if (effects.glow !== false) line(a[0], a[1], b[0], b[1], thickness + 1, palette[2] ?? palette[0], 65);
      line(a[0], a[1], b[0], b[1], thickness, palette[0]);
      if (power > 0.12) line(a[0], a[1] - 1, b[0], b[1] - 1, Math.max(1, thickness - 1), palette[1] ?? palette[0], 220);
    }

    const particleCount = effects.particles === false ? 0 : Math.floor((2 + power * 46 * layerScale * weight) * particleDensity);
    for (let i = 0; i < particleCount; i++) {
      const r1 = randomAt(seed ^ hash(id), i + layer * 97);
      const r2 = randomAt(seed ^ hash(id), i + 991 + layer * 97);
      const t = 0.04 + r1 * 0.92;
      const [x, y] = point(t);
      const spread = size * (0.012 + power * 0.12);
      const px = x + (r2 - 0.5) * spread * 1.8;
      const py = y + (randomAt(seed, i + 1777 + layer * 31) - 0.5) * spread * 1.5;
      const length = Math.max(1, size * (0.008 + power * (0.018 + r1 * 0.065)));
      const radius = power > 0.72 && r2 > 0.72 ? 2 : 1;
      if (definition.shape === 'crescent') line(px, py, px + length * 0.42, py - length, radius, palette[i % palette.length]);
      else if (definition.shape === 'wave') line(px - length * 0.5, py + length * 0.15, px + length * 0.6, py - length * 0.2, radius, palette[i % palette.length]);
      else if (definition.shape === 'mist') line(px - length * 0.35, py, px + length * 0.5, py - length * 0.12, radius, palette[i % palette.length], 180);
      else line(px, py, px + length * 0.22, py - length, radius, palette[i % palette.length]);
    }

    // Higher activity reveals secondary parallel cuts and detached sparks.
    if (effects.secondaryCuts !== false && power > 0.35) {
      const cuts = Math.floor(1 + power * 5 * weight);
      for (let i = 0; i < cuts; i++) {
        const t = 0.12 + randomAt(seed, i + layer * 211 + 4000) * 0.76;
        const [x, y] = point(t);
        const len = size * (0.025 + power * 0.055);
        line(x - len * 0.35, y + len * 0.18, x + len * 0.45, y - len * 0.65, 1, palette[(i + 1) % palette.length], 210);
      }
    }
  });
  return out;
}

export function pixelsToSvg(pixels: Uint8ClampedArray, size: number, title = 'GitBreathing generated slash'): string {
  const rects: string[] = [];
  for (let y = 0; y < size; y++) {
    let x = 0;
    while (x < size) {
      const i = (y * size + x) * 4; const alpha = pixels[i + 3];
      if (!alpha) { x++; continue; }
      const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
      let end = x + 1;
      while (end < size) {
        const j = (y * size + end) * 4;
        if (pixels[j + 3] !== alpha || pixels[j] !== r || pixels[j + 1] !== g || pixels[j + 2] !== b) break;
        end++;
      }
      rects.push(`<rect x="${x}" y="${y}" width="${end - x}" height="1" fill="rgb(${r},${g},${b})"${alpha === 255 ? '' : ` opacity="${(alpha / 255).toFixed(3)}"`}/>`);
      x = end;
    }
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" shape-rendering="crispEdges" role="img" aria-label="${title.replace(/[&<>\"]/g, '')}">\n<title>${title.replace(/[&<>]/g, '')}</title>\n${rects.join('\n')}\n</svg>\n`;
}
