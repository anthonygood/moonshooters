export * as TileData from './TileData';
export * as DynamicAtlas from './dynamicSpriteAtlas';

export const asset = (path: string) => `./assets/${path}`;

// Return a whole number between 1 and val, inclusive
export const upto = (val: number) => 1 + Math.floor(Math.random() * val);

export const sample = (vals = []) =>
  vals[Math.floor(Math.random() * vals.length)];
