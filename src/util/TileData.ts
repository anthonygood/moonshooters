import { Modifiers } from '../entities/NPC/NPC';
import { NPCDirection } from '../entities/NPC/Driver';

type Property = {
  name: string;
  value: string;
};

export interface SpawnPoint extends Phaser.GameObjects.GameObject {
	properties: Property[],
	x: number,
	y: number,
};

export type SpawnPointPartial = Partial<SpawnPoint>;

const nameEq = (name: string) => object => object.name === name;

export const getPlayerSpawn = (map: Phaser.Tilemaps.Tilemap): SpawnPointPartial =>
  map.findObject('Objects', nameEq('PlayerSpawn'));

export const getNPCSpawns = (map: Phaser.Tilemaps.Tilemap): SpawnPointPartial[] =>
  map.filterObjects('Objects', nameEq('NPCSpawn'));

export const getModifiersFromProps = (properties: Property[] = []) => {
	const modifier = properties.find(({ name }) => name === 'modifier');
	if (!modifier) return {};

	const moveOnTouch = modifier.value.includes('moveLeftOnTouch') ? NPCDirection.Left :
		modifier.value.includes('moveRightOnTouch') ? NPCDirection.Right :
      null;

  const idle = modifier.value.includes('idle');

	return <Modifiers>{
		idle,
		moveOnTouch
	};
};

type CallbackFn = (spawn: SpawnPointPartial, modifiers: Modifiers, index: number) => void;

export const forEachSpawn = (map: Phaser.Tilemaps.Tilemap, callback: CallbackFn) => {
  getNPCSpawns(map).forEach((spawn: SpawnPointPartial, index) => {
    const modifiers = getModifiersFromProps(spawn.properties);
    callback(spawn, modifiers, index);
  });
};
