import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { GIFEncoder, quantize, applyPalette } from 'gifenc';
import { renderSlash, pixelsToSvg } from '../src/renderer';
import { IDS, type StyleId } from '../src/styles';

type Config = {
  username: string;
  platform?: 'github' | 'gitlab' | 'custom';
  styles?: StyleId[];
  maxContributions?: number;
  contributions?: number;
  resolution?: number;
  frames?: number;
  fps?: number;
  powerCurve?: number;
  background?: 'transparent' | 'dark';
  seed?: string;
  styleWeights?: Partial<Record<StyleId, number>>;
  styleColors?: Partial<Record<StyleId, string[]>>;
  effects?: { glow?: boolean; particles?: boolean; secondaryCuts?: boolean; motion?: boolean; particleDensity?: number; strokeScale?: number };
  outputDir?: string;
};

const configPath = process.env.GITBREATHING_CONFIG || 'gitbreathing.json';
const config = JSON.parse(await fs.readFile(configPath, 'utf8')) as Config;
const username = (config.username || process.env.GITBREATHING_USERNAME || 'anonymous').trim();
const contributions = Number(process.env.CONTRIBUTIONS ?? config.contributions ?? 0);
if (!Number.isFinite(contributions) || contributions < 0) throw new Error('CONTRIBUTIONS must be a non-negative number.');
const max = Math.max(1, Number(config.maxContributions ?? 5000));
const curve = Math.max(0.1, Math.min(4, Number(config.powerCurve ?? 1)));
const power = Math.pow(Math.min(1, contributions / max), curve);
const styles = (config.styles ?? ['sun']).filter((value): value is StyleId => IDS.includes(value));
if (!styles.length) throw new Error(`Choose at least one supported style: ${IDS.join(', ')}.`);
const maxSize = Math.max(8, Math.min(128, Math.round(Number(config.resolution ?? 128))));
// Contribution power also controls effective pixel resolution, not just visual density.
const size = Math.max(8, Math.min(maxSize, Math.round(8 + (maxSize - 8) * Math.sqrt(power))));
const frames = Math.max(4, Math.min(60, Math.round(Number(config.frames ?? 24))));
const fps = Math.max(4, Math.min(30, Math.round(Number(config.fps ?? 12))));
const background = config.background === 'dark' ? 'dark' : 'transparent';
const seed = config.seed || `${config.platform || 'custom'}:${username.toLowerCase()}:${styles.join(',')}`;
const outputDir = config.outputDir || 'dist';
await fs.mkdir(outputDir, { recursive: true });

const renderOptions = { size, styles, power, background, seed, styleWeights: config.styleWeights, styleColors: config.styleColors, effects: config.effects };
const still = renderSlash({ ...renderOptions, phase: 0 });
const svg = pixelsToSvg(still, size, `GitBreathing slash for ${username}`);
await fs.writeFile(path.join(outputDir, 'slash.svg'), svg, 'utf8');
await sharp(Buffer.from(still), { raw: { width: size, height: size, channels: 4 } }).png().toFile(path.join(outputDir, 'slash.png'));

const framePixels: Uint8ClampedArray[] = [];
const combined = new Uint8Array(size * size * 4 * frames);
for (let frame = 0; frame < frames; frame++) {
  const pixels = renderSlash({ ...renderOptions, phase: frame / frames, background: 'dark' });
  framePixels.push(pixels);
  combined.set(pixels, frame * size * size * 4);
}
// A shared palette prevents frame-to-frame palette shifts and color flicker.
const palette = quantize(combined, 256);
const gif = GIFEncoder();
for (const pixels of framePixels) {
  gif.writeFrame(applyPalette(new Uint8Array(pixels), palette), size, size, { palette, delay: Math.round(1000 / fps), repeat: 0 });
}
gif.finish();
await fs.writeFile(path.join(outputDir, 'slash.gif'), Buffer.from(gif.bytes()));

const metadata = {
  generator: 'GitBreathing', version: '1.0.0', username, platform: config.platform || 'custom',
  contributions, power: Number(power.toFixed(4)), styles, resolution: size, maxResolution: maxSize, frames, fps,
  seed, outputs: ['slash.svg', 'slash.gif', 'slash.png'],
};
await fs.writeFile(path.join(outputDir, 'metadata.json'), `${JSON.stringify(metadata, null, 2)}\n`);
console.log(`GitBreathing rendered ${styles.join(' + ')} for ${username}: ${contributions} contributions, ${Math.round(power * 100)}% power, ${size}x${size}.`);
console.log(`Wrote ${path.join(outputDir, 'slash.svg')}, slash.gif, slash.png and metadata.json.`);
