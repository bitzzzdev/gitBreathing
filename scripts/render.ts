import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { GIFEncoder, quantize, applyPalette } from 'gifenc';
import { svg } from 'ascii.rest/svg';
import { createBreathingPiece } from '../src/breathing';
import { IDS, STYLES, type StyleId } from '../src/styles';

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
const styles = (config.styles ?? ['sun', 'water', 'mist']).filter((value): value is StyleId => IDS.includes(value));
if (!styles.length) throw new Error(`Choose at least one supported style: ${IDS.join(', ')}.`);
const frames = Math.max(4, Math.min(60, Math.round(Number(config.frames ?? 24))));
const fps = Math.max(4, Math.min(30, Math.round(Number(config.fps ?? 12))));
const seed = config.seed || `${config.platform || 'custom'}:${username.toLowerCase()}:${styles.join(',')}`;
const outputDir = config.outputDir || 'dist';
await fs.mkdir(outputDir, { recursive: true });

const piece = createBreathingPiece({
  styles,
  power,
  seed,
  styleWeights: config.styleWeights,
  styleColors: config.styleColors,
});
const animatedSvg = svg(piece, {
  dark: true,
  seconds: frames / fps,
  fps,
  scale: 9,
  label: `GitBreathing animated ASCII slash for ${username}`,
});
await fs.writeFile(path.join(outputDir, 'slash.svg'), animatedSvg, 'utf8');

const draw = piece.default();
const width = piece.meta.cols * 12;
const height = piece.meta.rows * 19;
const palette = piece.meta.palette;

function escapeXml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function frameSvg(time: number) {
  const colorIndexes = new Uint8Array(piece.meta.cols * piece.meta.rows);
  const text = draw(time, { color: colorIndexes });
  const lines = text.split('\n');
  const spans: string[] = [];
  for (let y = 0; y < lines.length; y++) {
    const row = lines[y] ?? '';
    let x = 0;
    while (x < row.length) {
      const index = colorIndexes[y * piece.meta.cols + x] ?? 0;
      let end = x + 1;
      while (end < row.length && colorIndexes[y * piece.meta.cols + end] === index) end++;
      const content = row.slice(x, end);
      if (content.trim()) {
        spans.push(`<text x="${x * 12}" y="${(y + 1) * 19 - 3}" fill="${palette[index] ?? '#ffffff'}">${escapeXml(content)}</text>`);
      }
      x = end;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#080a10"/><g font-family="ui-monospace,SFMono-Regular,Consolas,monospace" font-size="15" font-weight="600" xml:space="preserve">${spans.join('')}</g></svg>`;
}

const firstFrame = Buffer.from(frameSvg(0));
await sharp(firstFrame).png().toFile(path.join(outputDir, 'slash.png'));
await fs.writeFile(path.join(outputDir, 'slash.txt'), draw(0), 'utf8');

const rgbaFrames: Uint8Array[] = [];
const combined = new Uint8Array(width * height * 4 * frames);
for (let frame = 0; frame < frames; frame++) {
  const { data } = await sharp(Buffer.from(frameSvg(frame / fps)))
    .resize(width, height)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const rgba = new Uint8Array(data);
  rgbaFrames.push(rgba);
  combined.set(rgba, frame * width * height * 4);
}

const gifPalette = quantize(combined, 256);
const gif = GIFEncoder();
for (const rgba of rgbaFrames) {
  gif.writeFrame(applyPalette(rgba, gifPalette), width, height, {
    palette: gifPalette,
    delay: Math.round(1000 / fps),
    repeat: 0,
  });
}
gif.finish();
await fs.writeFile(path.join(outputDir, 'slash.gif'), Buffer.from(gif.bytes()));

const metadata = {
  generator: 'GitBreathing',
  version: '1.1.0',
  username,
  platform: config.platform || 'custom',
  contributions,
  power: Number(power.toFixed(4)),
  styles,
  lineage: Object.fromEntries(styles.map((id) => [id, STYLES[id].parent])),
  resolution: { columns: piece.meta.cols, rows: piece.meta.rows },
  frames,
  fps,
  seed,
  outputs: ['slash.svg', 'slash.gif', 'slash.png', 'slash.txt'],
};
await fs.writeFile(path.join(outputDir, 'metadata.json'), `${JSON.stringify(metadata, null, 2)}\n`);
console.log(`GitBreathing ASCII renderer generated ${styles.join(' + ')} for ${username}: ${contributions} contributions, ${Math.round(power * 100)}% power.`);
console.log(`Wrote ${path.join(outputDir, 'slash.svg')}, slash.gif, slash.png, slash.txt and metadata.json.`);
