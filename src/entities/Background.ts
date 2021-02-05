import Fog from '../entities/Fog';
import { MAP_SCALE } from '../scenes/TheCity';

const DEFAULT_BKG_KEY = 'default-background-scrapers';
const GREY_BKG_KEY = 'grey-background-scrapers';
const TURQUOISE_BKG_KEY = 'turqouise-background-scrapers';
const YELLOW_BKG_KEY = 'yellow-background-scrapers';
const PINK_BKG_KEY = 'pink-background-scrapers';
const GREEN_BKG_KEY = 'green-background-scrapers';
const ORANGE = 'orange-background-scrapers';
const RED = 'red-background-scrapers';

const DEFAULT_CLOUD_KEY = 'clouds';
const CLOUD_PINK_KEY = 'clouds-pink';
const CLOUD_RED_KEY = 'clouds-red';
const CLOUD_TURQOUISE_KEY = 'clouds-turqouise';
const CLOUD_WHITE_KEY = 'clouds-white';
const CLOUD_GREY_KEY = 'clouds-grey';

const asset = (path: string) => `./assets/${path}`;

// Create additional layers that just alias the background layer.
// Everything is the same (including tile GIDS) except the name.
// The different name allows you to add a different tileset image
// for the same layer data, so you can apply a 'theme' per layer.
const addAlternativeCityTilesets = (
	json,
	altCount = 1
) => {
  const [skyscrapers, _platforms, longClouds] = json.tilesets;

	for (let i = 1; i <= altCount; i++) {
		json.tilesets.push({
			...skyscrapers,
			name: `Skyscrapers_alt_${i}`,
    });

    longClouds && json.tilesets.push({
      ...longClouds,
      name: `Long clouds_alt_${i}`,
    })
	}
};

class Background {
  private scene: Phaser.Scene;
  private optimised: boolean;
  private clouds: {
    front: Phaser.Tilemaps.TilemapLayer;
    back: Phaser.Tilemaps.TilemapLayer;
  };
  protected variants: { [key: string]: Phaser.Tilemaps.Tileset; }
  protected cloudVariants: { [key: string]: Phaser.Tilemaps.Tileset; }

	constructor(
		scene: Phaser.Scene
	) {
    this.scene = scene;
	}

	preload(json: JSON) {
		const { scene } = this;

		addAlternativeCityTilesets(json, 7);

    scene.load.image(DEFAULT_BKG_KEY, asset('tilemaps/skyscraper_tiles_extruded.png'));

    // Skyscraper variants
		scene.load.image(TURQUOISE_BKG_KEY, asset('tilemaps/skyscraper_tiles_extruded.turquoise.png'));
		scene.load.image(PINK_BKG_KEY, asset('tilemaps/skyscraper_tiles_extruded.pink.png'));
		scene.load.image(YELLOW_BKG_KEY, asset('tilemaps/skyscraper_tiles_extruded.yellow.png'));
		scene.load.image(GREEN_BKG_KEY, asset('tilemaps/skyscraper_tiles_extruded.green.png'));
    scene.load.image(GREY_BKG_KEY, asset('tilemaps/skyscraper_tiles_extruded.grey.png'));
    scene.load.image(ORANGE, asset('tilemaps/skyscraper_tiles_extruded.orange.png'));
    scene.load.image(RED, asset('tilemaps/skyscraper_tiles_extruded.red.png'));

    // Clouds
    scene.load.image(DEFAULT_CLOUD_KEY, asset('tilemaps/long clouds sheet.png'));
    scene.load.image(CLOUD_PINK_KEY, asset('tilemaps/long clouds sheet.lightpink.png'));
    scene.load.image(CLOUD_RED_KEY, asset('tilemaps/long clouds sheet.red.png'));
    scene.load.image(CLOUD_TURQOUISE_KEY, asset('tilemaps/long clouds sheet.turquoise.png'));
    scene.load.image(CLOUD_WHITE_KEY, asset('tilemaps/long clouds sheet.white.png'));
    scene.load.image(CLOUD_GREY_KEY, asset('tilemaps/long clouds sheet.grey.png'));
	}

	create(map: Phaser.Tilemaps.Tilemap, scale) {
    this.optimised = !this.scene.game.device.os.desktop;

    // Blue default
    const blue = map.addTilesetImage('Skyscrapers', DEFAULT_BKG_KEY);

		// Variant skyscraper colours
		const green     = map.addTilesetImage('Skyscrapers_alt_1', GREEN_BKG_KEY);
		const yellow    = map.addTilesetImage('Skyscrapers_alt_2', YELLOW_BKG_KEY);
		const turqouise = map.addTilesetImage('Skyscrapers_alt_3', TURQUOISE_BKG_KEY);
		const pink      = map.addTilesetImage('Skyscrapers_alt_4', PINK_BKG_KEY);
    const grey      = map.addTilesetImage('Skyscrapers_alt_5', GREY_BKG_KEY);
    const orange    = map.addTilesetImage('Skyscrapers_alt_6', ORANGE);
    const red       = map.addTilesetImage('Skyscrapers_alt_7', RED);

    this.variants = {
      blue,
      green,
      yellow,
      turqouise,
      pink,
      grey,
      orange,
      red,
    };

    const defaultClouds = map.addTilesetImage('Long clouds', DEFAULT_CLOUD_KEY);
    const pinkClouds = map.addTilesetImage('Long clouds_alt_1', CLOUD_PINK_KEY);
    const turqouiseClouds = map.addTilesetImage('Long clouds_alt_2', CLOUD_TURQOUISE_KEY);
    const redClouds = map.addTilesetImage('Long clouds_alt_3', CLOUD_RED_KEY);
    const whiteClouds = map.addTilesetImage('Long clouds_alt_4', CLOUD_WHITE_KEY);
    const greyClouds = map.addTilesetImage('Long clouds_alt_5', CLOUD_GREY_KEY);

    this.cloudVariants = {
      grey: defaultClouds,
      pink: pinkClouds,
      turqouise: turqouiseClouds,
      red: redClouds,
      white: whiteClouds,
    };

    // The entry point for extending this class
    const theme = this.getTheme();

    const {
      clouds,
      wayBackground,
      distantBackground,
      midBackground,
    } = this.applyTheme(map, theme);

		midBackground.scrollFactorX = 0.3;
    midBackground.scrollFactorY = 0.9;

    clouds.front.scrollFactorX = 0.3;
    clouds.front.scrollFactorY = 1;

		distantBackground.scrollFactorX = 0.2;
    distantBackground.scrollFactorY = 0.8;

    clouds.back.scrollFactorX = 0.1;
    clouds.back.scrollFactorY = 1;

		wayBackground.scrollFactorX = 0.1;
    wayBackground.scrollFactorY = 0.9;

		midBackground.scale =
		distantBackground.scale =
    wayBackground.scale =
    clouds.front.scale =
    clouds.back.scale =
      scale;

    // clouds.front.setScale(2, 2);
    // clouds.back.setScale(2, 1);
  }

  applyTheme(map: Phaser.Tilemaps.Tilemap, theme) {
    const { layers: [first, second, third], fog } = theme;

		// TODO: parameterise depth? or at least shallowest depth?
    const wayBackground = map.createLayer('Right back', first, 0, 0).setDepth(1);
    const distantBackground = map.createLayer('Back scrapers', second, 0, 0).setDepth(3);
    const midBackground = map.createLayer('Scrapers', third, 0, 0).setDepth(5);

    const clouds = this.clouds = this.createClouds(map);

    fog(this.scene);

    return {
      clouds,
      wayBackground,
      distantBackground,
      midBackground,
    };
  }

  createClouds(map: Phaser.Tilemaps.Tilemap) {
    const { ADD, ERASE, SCREEN, MULTIPLY } = Phaser.BlendModes;
    const { grey, pink, turqouise, red, white } = this.cloudVariants;
    const back = map.createLayer('Clouds Back', white, 0, 0)
      .setDepth(3)//.setBlendMode(ADD);
    const front = map.createLayer('Clouds Front', white, 0, 0)//-(map.heightInPixels / 2))
      .setDepth(5)//.setBlendMode(SCREEN);

    return { front, back };
  }

  update(delta: number) {
    const { clouds } = this;

    const frontSpeed = 0.005;
    const backSpeed = 0.002;

    clouds.front.setX(clouds.front.x + (frontSpeed * delta));
    clouds.back.setX(clouds.back.x - (backSpeed * delta));
  }

  getTheme() {
    const { blue, grey } = this.variants;
    return { layers: [blue, grey, blue], fog: Fog.day };
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

export class Smog extends Background {
  getTheme() {
    const {
      yellow,
      grey,
      orange,
    } = this.variants;
    return { layers: [yellow, orange, grey], fog: Fog.smog };
  }
}

export default Background;
