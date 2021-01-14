export const asset = (path: string) => `./assets/${path}`;

export const sample = (vals = []) =>
  vals[Math.floor(Math.random() * vals.length)];
