import TheCity, { MAP_SCALE, SpawnPoint } from './TheCity';
import { Dusk as Background } from '../entities/Background';
import * as json from '../../assets/tilemaps/The CityIV.json';
import Van from '../entities/Van';

const mapScale = num => num * MAP_SCALE;
const id = properites => properites.find(prop => prop.name === 'id').value;

const getBoundaryForVan = (map: Phaser.Tilemaps.Tilemap, van) => {
	const vanId = id(van.properties);
	return map.findObject('Objects', (obj: SpawnPoint) => obj.name === 'VanBoundary' && id(obj.properties) === vanId);
}

export default class TheCityIV extends TheCity {
  public vans: Van[];

  constructor() {
    super('The CityIV');
    this.vans = [];
  }

  preload() {
    super.preload();
		Van.preload(this);
  }

  create() {
    super.create();
    this.spawnVans();
  }

  update(time, delta) {
    super.update(time, delta);
    this.vans.forEach(van => van.update());
  }

  getBackground() {
    return new Background(this);
  }

  // @ts-ignore
  getLevelJson() {
    return json;
  }

  getMapKey() {
		return 'TheCityIV';
	}

	nextScene() {
		return this.scene.start('The City');
  }

  restart() {
    super.restart();
    this.vans.forEach(van => van.destroy());
    this.vans = [];
  }

	spawnVans() {
    const { map } = this;

    const vanSpawns = map.filterObjects('Objects', obj => obj.name === 'VanSpawn');
    vanSpawns.forEach((vanSpawn: SpawnPoint) => {
      const boundary = getBoundaryForVan(map, vanSpawn) as SpawnPoint;
      const van = new Van(this);
      van.create(mapScale(vanSpawn.x), mapScale(vanSpawn.y - 10), mapScale(boundary.x));

      this.physics.add.overlap(van.container, this.player.container, (_van, player) => {
        if (player.getData('roadkill')) return;
        player.setData('roadkill', van.direction);
        this.end();
      });

      this.vans.push(van);
    });
	}
}