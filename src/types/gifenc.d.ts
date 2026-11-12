declare module 'gifenc' {
  export type Palette = number[][];

  export function quantize(
    rgba: Uint8Array | Uint8ClampedArray,
    maxColors: number,
    options?: Record<string, unknown>
  ): Palette;

  export function applyPalette(
    rgba: Uint8Array | Uint8ClampedArray,
    palette: Palette,
    options?: Record<string, unknown>
  ): Uint8Array;

  export function GIFEncoder(): {
    writeFrame(
      indexedPixels: Uint8Array,
      width: number,
      height: number,
      options?: {
        palette?: Palette;
        delay?: number;
        repeat?: number;
        transparent?: number;
      }
    ): void;
    finish(): void;
    bytes(): Uint8Array;
  };
}
