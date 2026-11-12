import type { Frame, Meta, Piece } from 'ascii.rest';
import { STYLES, type StyleId } from './styles';

export type BreathingOptions = {
  styles: StyleId[];
  power: number;
  seed: string;
  styleWeights?: Partial<Record<StyleId, number>>;
  styleColors?: Partial<Record<StyleId, string[]>>;
};

const COLS = 64;
const ROWS = 30;
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const hash = (value: string) => {
  let result = 2166136261;
  for (let i = 0; i < value.length; i++) result = Math.imul(result ^ value.charCodeAt(i), 16777619);
  return result >>> 0;
};
const randomAt = (seed: number, index: number) => {
  let value = (seed + Math.imul(index + 1, 0x9e3779b1)) >>> 0;
  value ^= value >>> 16;
  value = Math.imul(value, 0x7feb352d);
  value ^= value >>> 15;
  value = Math.imul(value, 0x846ca68b);
  value ^= value >>> 16;
  return (value >>> 0) / 4294967296;
};

type Grid = { chars: string[][]; colors: number[][] };
type Plot = (x: number, y: number, glyph: string, color: number) => void;

function makeGrid(): Grid {
  return {
    chars: Array.from({ length: ROWS }, () => Array(COLS).fill(' ')),
    colors: Array.from({ length: ROWS }, () => Array(COLS).fill(0)),
  };
}

function line(plot: Plot, x1: number, y1: number, x2: number, y2: number, glyph: string, color: number, weight = 1) {
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)) * 1.8));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = Math.round(x1 + (x2 - x1) * t);
    const y = Math.round(y1 + (y2 - y1) * t);
    for (let oy = -weight + 1; oy < weight; oy++) for (let ox = -weight + 1; ox < weight; ox++) {
      if (ox * ox + oy * oy <= weight * weight) plot(x + ox, y + oy, glyph, color);
    }
  }
}

function curve(plot: Plot, point: (t: number) => [number, number], glyph: string, color: number, steps = 100, weight = 1) {
  let previous = point(0);
  for (let i = 1; i <= steps; i++) {
    const next = point(i / steps);
    line(plot, previous[0], previous[1], next[0], next[1], glyph, color, weight);
    previous = next;
  }
}

function drawMotif(id: StyleId, plot: Plot, color: number, power: number, phase: number, seed: number) {
  const density = Math.round(2 + power * 7);
  const wobble = (t: number, amount = 1) => Math.sin(t * Math.PI * 2 + phase) * amount;
  switch (id) {
    case 'sun': {
      for (let arc = 0; arc < 3; arc++) {
        const radius = 7 + arc * 3;
        curve(plot, (t) => {
          const a = -Math.PI * 0.9 + t * Math.PI * 1.8;
          return [32 + Math.cos(a) * radius, 15 + Math.sin(a) * radius * 0.72];
        }, arc === 1 ? '*' : '.', color + (arc === 2 ? 2 : 1), 70);
      }
      for (let i = 0; i < 12; i++) {
        const a = i * Math.PI / 6;
        const r1 = 11, r2 = 13 + power * 4;
        line(plot, 32 + Math.cos(a) * r1, 15 + Math.sin(a) * r1 * 0.72, 32 + Math.cos(a) * r2, 15 + Math.sin(a) * r2 * 0.72, '+', color + 1);
      }
      break;
    }
    case 'moon': {
      for (let arc = 0; arc < 4; arc++) {
        const radius = 8 + arc * 2.3;
        curve(plot, (t) => {
          const a = -Math.PI * 0.72 + t * Math.PI * 1.42;
          return [34 + Math.cos(a) * radius, 14 + Math.sin(a) * radius * 0.78];
        }, arc % 2 ? ')' : '(', color + (arc % 2), 72);
      }
      break;
    }
    case 'water': {
      for (let row = 0; row < 5 + density; row++) {
        const y = 9 + row * 2;
        curve(plot, (t) => [4 + t * 56, y + Math.sin(t * Math.PI * (2.1 + row * 0.12) + phase + row) * (2 + power * 2)], row % 2 ? '~' : '=', color + (row % 3), 90);
      }
      break;
    }
    case 'flame': {
      for (let tongue = 0; tongue < 7; tongue++) {
        const x = 9 + tongue * 7;
        curve(plot, (t) => [x + Math.sin(t * Math.PI * 2 + tongue) * (1.5 + power * 2), 25 - t * (12 + power * 8) + Math.sin(t * Math.PI * 3 + phase) * 2], tongue % 2 ? '/' : '^', color + (tongue % 3), 42);
      }
      break;
    }
    case 'thunder': {
      for (let bolt = 0; bolt < 4 + density / 2; bolt++) {
        let x = 5 + randomAt(seed, bolt) * 50;
        let y = 3 + randomAt(seed, bolt + 50) * 9;
        for (let part = 0; part < 5; part++) {
          const nx = x + (randomAt(seed, bolt * 9 + part) - 0.25) * 9;
          const ny = y + 2 + randomAt(seed, bolt * 13 + part) * 4;
          line(plot, x, y, nx, ny, part % 2 ? '/' : '\\', color + (part % 3), 1);
          x = nx; y = ny;
        }
      }
      break;
    }
    case 'wind': {
      for (let swirl = 0; swirl < 3; swirl++) {
        curve(plot, (t) => {
          const a = t * Math.PI * (2.2 + swirl * 0.4) + phase;
          const r = 2 + t * (11 + swirl * 3);
          return [32 + Math.cos(a) * r * 1.7, 15 + Math.sin(a) * r * 0.72];
        }, swirl === 1 ? '~' : '-', color + swirl, 100);
      }
      break;
    }
    case 'stone': {
      for (let crack = 0; crack < 7; crack++) {
        let x = 5 + randomAt(seed, crack) * 54;
        let y = 4 + randomAt(seed, crack + 80) * 20;
        for (let segment = 0; segment < 4; segment++) {
          const nx = x + (randomAt(seed, crack * 11 + segment) - 0.5) * 12;
          const ny = y + (randomAt(seed, crack * 17 + segment) - 0.5) * 8;
          line(plot, x, y, nx, ny, segment % 2 ? '#' : '+', color + (segment % 3), 1);
          x = nx; y = ny;
        }
      }
      break;
    }
    case 'insect': {
      for (let wing = 0; wing < 4; wing++) {
        const side = wing % 2 ? 1 : -1;
        const upper = wing < 2;
        curve(plot, (t) => [32 + side * Math.sin(t * Math.PI) * (5 + t * 14), 14 + (upper ? -1 : 1) * t * 10 + Math.sin(t * Math.PI) * (upper ? -1 : 1) * 4], wing % 2 ? ':' : '.', color + (wing % 3), 60);
      }
      break;
    }
    case 'serpent': {
      for (let coil = 0; coil < 3; coil++) {
        curve(plot, (t) => [4 + t * 56, 15 + Math.sin(t * Math.PI * (2.5 + coil * 0.55) + phase + coil) * (4 + coil * 2)], coil === 1 ? 'S' : '~', color + coil, 100);
      }
      break;
    }
    case 'flower': {
      for (let bloom = 0; bloom < 3; bloom++) {
        const cx = 13 + bloom * 19, cy = 13 + (bloom % 2) * 5;
        for (let petal = 0; petal < 8; petal++) {
          const a = petal * Math.PI / 4;
          curve(plot, (t) => [cx + Math.cos(a) * (2 + 7 * Math.sin(t * Math.PI)), cy + Math.sin(a) * (1 + 5 * Math.sin(t * Math.PI))], petal % 2 ? 'o' : '*', color + (petal % 3), 28);
        }
      }
      break;
    }
    case 'love': {
      for (let ribbon = 0; ribbon < 3; ribbon++) {
        curve(plot, (t) => {
          const a = t * Math.PI * 2 + phase + ribbon * 0.8;
          const x = 16 * Math.pow(Math.sin(a), 3);
          const y = 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a);
          return [32 + x * (0.65 + ribbon * 0.13), 15 - y * (0.42 + ribbon * 0.08)];
        }, ribbon === 1 ? '@' : '~', color + ribbon, 100);
      }
      break;
    }
    case 'sound': {
      for (let ring = 0; ring < 6; ring++) {
        const rx = 7 + ring * 4, ry = 3 + ring * 2;
        curve(plot, (t) => {
          const a = t * Math.PI * 2;
          return [32 + Math.cos(a) * rx, 15 + Math.sin(a) * ry];
        }, ring % 2 ? ')' : '(', color + (ring % 3), 72);
      }
      break;
    }
    case 'beast': {
      for (let claw = 0; claw < 5; claw++) {
        const x = 8 + claw * 10;
        line(plot, x, 25, x + 9 + claw, 5 + (claw % 2) * 4, claw % 2 ? '/' : 'X', color + (claw % 3), 1);
        line(plot, x + 2, 24, x + 11 + claw, 7 + (claw % 2) * 4, '\\', color + 1, 1);
      }
      break;
    }
    case 'mist': {
      for (let bank = 0; bank < 8; bank++) {
        const y = 5 + bank * 3;
        curve(plot, (t) => [2 + t * 60, y + Math.sin(t * Math.PI * 2.2 + bank * 0.75 + phase) * (1.5 + power)], bank % 2 ? ':' : '~', color + (bank % 3), 80);
      }
      break;
    }
  }
}

export function createBreathingPiece(options: BreathingOptions): Piece<BreathingOptions> {
  const styles = options.styles.length ? options.styles : ['sun'];
  const palette = styles.flatMap((id) => {
    const custom = options.styleColors?.[id];
    return custom?.length ? custom.slice(0, 3) : [...STYLES[id].colors];
  });
  const meta = {
    name: 'gitbreathing',
    category: 'effects',
    note: 'a contribution-powered breathing slash in animated ascii',
    cols: COLS,
    rows: ROWS,
    fps: 12,
    loop: 2,
    palette,
    ground: '#080a10',
    cell: 1.65,
    options,
  } satisfies Meta<BreathingOptions>;

  const piece: Piece<BreathingOptions> = {
    meta,
    default: (overrides = {}) => {
      const config = { ...options, ...overrides };
      const active = config.styles.length ? config.styles : ['sun'];
      const colors = active.flatMap((id) => {
        const custom = config.styleColors?.[id];
        return custom?.length ? custom.slice(0, 3) : [...STYLES[id].colors];
      });
      const seed = hash(config.seed);
      const power = clamp(config.power, 0, 1);

      return (time, env) => {
        const grid = makeGrid();
        const plot: Plot = (x, y, glyph, color) => {
          const px = Math.round(x), py = Math.round(y);
          if (px < 0 || py < 0 || px >= COLS || py >= ROWS || glyph === ' ') return;
          grid.chars[py][px] = glyph;
          grid.colors[py][px] = clamp(color, 0, colors.length - 1);
        };

        const phase = time * Math.PI * 2;
        const layers = Math.max(1, Math.round(1 + power * 3));
        for (let layer = 0; layer < layers; layer++) {
          const yShift = Math.sin(phase + layer * 0.8) * (0.6 + power);
          line(plot, 7, 24 - layer * 2 + yShift, 57, 5 - layer * 1.4 + yShift, layer === 0 ? '@' : layer === 1 ? '#' : '*', Math.min(colors.length - 1, layer), layer === 0 ? 2 : 1);
        }

        active.forEach((id, index) => {
          const weight = clamp(config.styleWeights?.[id] ?? 1, 0, 3);
          if (weight <= 0) return;
          const colorOffset = active.slice(0, index).reduce((sum, previous) => {
            const custom = config.styleColors?.[previous];
            return sum + (custom?.length ? Math.min(3, custom.length) : 3);
          }, 0);
          drawMotif(id, plot, colorOffset, power * weight / Math.max(1, weight), phase + index * 0.62, seed ^ hash(id));
        });

        const particles = Math.floor(8 + power * 52);
        for (let i = 0; i < particles; i++) {
          const x = Math.floor(randomAt(seed, i) * COLS);
          const y = Math.floor(randomAt(seed, i + 900) * ROWS);
          const pulse = Math.sin(phase * 1.6 + randomAt(seed, i + 1800) * 6);
          if (pulse > 0.35) plot(x, y, i % 4 === 0 ? '*' : i % 3 === 0 ? '+' : '.', Math.floor(randomAt(seed, i + 2700) * colors.length));
        }

        if (env?.color) {
          for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
            env.color[y * COLS + x] = grid.colors[y][x];
          }
        }
        return grid.chars.map((row) => row.join('')).join('\n');
      };
    },
  };
  return piece;
}
