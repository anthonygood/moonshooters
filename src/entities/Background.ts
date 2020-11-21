import Fog from '../entities/Fog';

const DEFAULT_BKG_KEY = 'default-background-scrapers';
const GREY_BKG_KEY = 'grey-background-scrapers';
const TURQUOISE_BKG_KEY = 'turqouise-background-scrapers';
const YELLOW_BKG_KEY = 'yellow-background-scrapers';
const PINK_BKG_KEY = 'pink-background-scrapers';
const GREEN_BKG_KEY = 'green-background-scrapers';
const ORANGE = 'orange-background-scrapers';
const RED = 'red-background-scrapers';

const asset = (path: string) => `/assets/${path}`;

// Create additional layers that just alias the background layer.
// Everything is the same (including tile GIDS) except the name.
// The different name allows you to add a different tileset image
// for the same layer data, so you can apply a 'theme' per layer.
const addAlternativeCityTilesets = (
	json,
	altCount = 1
) => {
	const [firstSet] = json.tilesets;

	for (let i = 1; i <= altCount; i++) {
		json.tilesets.push({
			...firstSet,
			name: `Skyscrapers_alt_${i}`,
		});
	}
};

class Background {
	private scene: Phaser.Scene;
  protected variants: { [key: string]: Phaser.Tilemaps.Tileset }
	constructor(
		scene: Phaser.Scene
		// map: Phaser.Tilemaps.Tilemap
	) {
		this.scene = scene;
		// this.map = map;
	}

	preload(json: JSON) {
		const { scene } = this;

		addAlternativeCityTilesets(json, 7);

    scene.load.image(DEFAULT_BKG_KEY, asset('tilemaps/skyscraper_tiles_extruded.png'));

    // Variants
		scene.load.image(TURQUOISE_BKG_KEY, asset('tilemaps/skyscraper_tiles_extruded.turquoise.png'));
		scene.load.image(PINK_BKG_KEY, asset('tilemaps/skyscraper_tiles_extruded.pink.png'));
		scene.load.image(YELLOW_BKG_KEY, asset('tilemaps/skyscraper_tiles_extruded.yellow.png'));
		scene.load.image(GREEN_BKG_KEY, asset('tilemaps/skyscraper_tiles_extruded.green.png'));
    scene.load.image(GREY_BKG_KEY, asset('tilemaps/skyscraper_tiles_extruded.grey.png'));
    scene.load.image(ORANGE, asset('tilemaps/skyscraper_tiles_extruded.orange.png'));
		scene.load.image(RED, asset('tilemaps/skyscraper_tiles_extruded.red.png'));
	}

	create(map: Phaser.Tilemaps.Tilemap, scale) {
    // Blue default
		const blue = map.addTilesetImage('Skyscrapers', DEFAULT_BKG_KEY);

		// Variant skyscraper colours
		const green = map.addTilesetImage('Skyscrapers_alt_1', GREEN_BKG_KEY);
		const yellow = map.addTilesetImage('Skyscrapers_alt_2', YELLOW_BKG_KEY);
		const turqouise = map.addTilesetImage('Skyscrapers_alt_3', TURQUOISE_BKG_KEY);
		const pink = map.addTilesetImage('Skyscrapers_alt_4', PINK_BKG_KEY);
    const grey = map.addTilesetImage('Skyscrapers_alt_5', GREY_BKG_KEY);
    const orange =  map.addTilesetImage('Skyscrapers_alt_6', ORANGE);
    const red =  map.addTilesetImage('Skyscrapers_alt_7', RED);

    this.variants = {
      blue, // blue
      green,
      yellow,
      turqouise,
      pink,
      grey,
      orange,
      red,
    };

    // The entry point for extending this class
    const theme = this.getTheme();

    const {
      wayBackground,
      distantBackground,
      midBackground,
    } = this.applyTheme(map, theme);

		midBackground.scrollFactorX = 0.3;
		midBackground.scrollFactorY = 0.9;
		distantBackground.scrollFactorX = 0.2;
		distantBackground.scrollFactorY = 0.8;
		wayBackground.scrollFactorX = 0.1;
		wayBackground.scrollFactorY = 0.9;

		midBackground.scale =
		distantBackground.scale =
		wayBackground.scale =
			scale;
  }

  applyTheme(map: Phaser.Tilemaps.Tilemap, theme) {
    const { layers: [first, second, third], fog } = theme;

		// TODO: parameterise depth? or at least shallowest depth?
		const wayBackground = map.createStaticLayer('Right back', first, 0, 0).setDepth(1);
		const distantBackground = map.createStaticLayer('Back scrapers', second, 0, 0).setDepth(3);
    const midBackground = map.createStaticLayer('Scrapers', third, 0, 0).setDepth(5);

    midBackground.tilemap.images

    fog(this.scene);

    return {
      wayBackground,
      distantBackground,
      midBackground,
    };
  }

  getTheme() {
    const { blue } = this.variants;
    return { layers: [blue, blue, blue], fog: Fog.day };
  }
}

export class Morning extends Background {
  getTheme() {
    const { blue, red } = this.variants;
    return { layers: [red, blue, blue], fog: Fog.morning };
  }
}

export const Day = Background;

export class Sunset extends Background {
  getTheme() {
    const { turqouise, pink } = this.variants;
    return { layers: [pink, pink, turqouise], fog: Fog.sunset };
  }
}

export class Dusk extends Background {
  getTheme() {
    const { blue, grey } = this.variants;
    return { layers: [grey, blue, blue], fog: Fog.dusk };
  }
}

export class Night extends Background {
  getTheme() {
    const { blue, yellow, orange } = this.variants;
    return { layers: [blue, orange, yellow], fog: Fog.night };
  }
}

export default Background;
