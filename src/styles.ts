export const STYLES = {
  sun: {
    name: 'Sun Breathing', colors: ['#53535d', '#a0a0aa', '#f4f4f5'], shape: 'radiant', parent: null, forms: 13, colour: 'Black',
    motif: 'A radiant solar ring, spokes and a decisive central cut.',
  },
  moon: {
    name: 'Moon Breathing', colors: ['#9b8cff', '#c9baff', '#f4efff'], shape: 'crescent', parent: 'sun', forms: 16, colour: 'Light purple',
    motif: 'Layered crescents and curved lunar cuts.',
  },
  water: {
    name: 'Water Breathing', colors: ['#167bd5', '#42c7ed', '#c4f5ff'], shape: 'wave', parent: 'sun', forms: 11, colour: 'Blue',
    motif: 'Continuous waves, flowing arcs and a rolling current.',
  },
  flame: {
    name: 'Flame Breathing', colors: ['#e43b24', '#ff7a22', '#ffd166'], shape: 'flame', parent: 'sun', forms: 9, colour: 'Orange-red',
    motif: 'Rising flame tongues and sweeping burning arcs.',
  },
  thunder: {
    name: 'Thunder Breathing', colors: ['#d5a900', '#ffe34d', '#fff7bd'], shape: 'lightning', parent: 'sun', forms: 7, colour: 'Yellow',
    motif: 'Explosive angular lightning and high-speed zigzag cuts.',
  },
  wind: {
    name: 'Wind Breathing', colors: ['#278b59', '#83d66b', '#e3ffd0'], shape: 'wind', parent: 'sun', forms: 9, colour: 'Green',
    motif: 'Rotating gusts, sickle-like arcs and turbulent spirals.',
  },
  stone: {
    name: 'Stone Breathing', colors: ['#777b83', '#b5bbc4', '#f0e9dd'], shape: 'fracture', parent: 'sun', forms: 5, colour: 'Gray',
    motif: 'Heavy fractured lines, rock shards and grounded impact marks.',
  },
  insect: {
    name: 'Insect Breathing', colors: ['#7776d9', '#b8a5ff', '#f3dcff'], shape: 'wing', parent: 'water', forms: 5, colour: 'Lavender blue',
    motif: 'Fine wing-like arcs, delicate points and precise stings.',
  },
  serpent: {
    name: 'Serpent Breathing', colors: ['#8771b9', '#c5a8eb', '#f1e5ff'], shape: 'serpent', parent: 'water', forms: 5, colour: 'Lavender',
    motif: 'A winding serpentine path and coiling blade trails.',
  },
  flower: {
    name: 'Flower Breathing', colors: ['#e879aa', '#ffb6cf', '#fff0f5'], shape: 'petal', parent: 'water', forms: 7, colour: 'Light pink',
    motif: 'Petal-shaped loops and graceful circular cuts.',
  },
  love: {
    name: 'Love Breathing', colors: ['#d83d83', '#ff8fbd', '#ffe0ed'], shape: 'ribbon', parent: 'flame', forms: 6, colour: 'Dark pink',
    motif: 'Elastic ribbon-like curves and looping whip trails.',
  },
  sound: {
    name: 'Sound Breathing', colors: ['#bd762b', '#f2b94b', '#fff0b4'], shape: 'sound', parent: 'thunder', forms: 5, colour: 'Amber',
    motif: 'Concentric shock rings, pulses and rhythmic bursts.',
  },
  beast: {
    name: 'Beast Breathing', colors: ['#56627e', '#929db5', '#e2e8f0'], shape: 'claw', parent: 'wind', forms: 11, colour: 'Indigo gray',
    motif: 'Unpredictable claw marks and rough, feral cuts.',
  },
  mist: {
    name: 'Mist Breathing', colors: ['#9ca3af', '#d9e2ea', '#ffffff'], shape: 'mist', parent: 'wind', forms: 7, colour: 'White',
    motif: 'Obscuring fog banks, soft trails and disappearing cuts.',
  },
} as const;

export type StyleId = keyof typeof STYLES;
export const IDS = Object.keys(STYLES) as StyleId[];
export const STYLE_LINEAGE: Record<StyleId, StyleId | null> = Object.fromEntries(
  IDS.map((id) => [id, STYLES[id].parent]),
) as Record<StyleId, StyleId | null>;
