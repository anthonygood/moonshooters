import { asset } from '../util';

export const sound = (name: string, ext = 'mp3') =>
  asset(`sound/${name}.${ext}`);
