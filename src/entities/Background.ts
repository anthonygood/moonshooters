import Fog from '../entities/Fog';

const DEFAULT_BKG_KEY = 'default-background-scrapers';
const GREY_BKG_KEY = 'grey-background-scrapers';
const TURQUOISE_BKG_KEY = 'turqouise-background-scrapers';
const YELLOW_BKG_KEY = 'yellow-background-scrapers';
const PINK_BKG_KEY = 'pink-background-scrapers';
const GREEN_BKG_KEY = 'green-background-scrapers';

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
	private map: Phaser.Tilemaps.Tilemap;
	constructor(
		scene: Phaser.Scene
		// map: Phaser.Tilemaps.Tilemap
	) {
		this.scene = scene;
		// this.map = map;
	}

	preload(json: JSON) {
		const { scene } = this;

		addAlternativeCityTilesets(json, 5); // TODO: is actually 6

		scene.load.image(DEFAULT_BKG_KEY, asset('tilemaps/skyscraper_tiles_extruded.png'));
		scene.load.image(TURQUOISE_BKG_KEY, asset('tilemaps/skyscraper_tiles_extruded.turquoise.png'));
		scene.load.image(PINK_BKG_KEY, asset('tilemaps/skyscraper_tiles_extruded.pink.png'));
		scene.load.image(YELLOW_BKG_KEY, asset('tilemaps/skyscraper_tiles_extruded.yellow.png'));
		scene.load.image(GREEN_BKG_KEY, asset('tilemaps/skyscraper_tiles_extruded.green.png'));
		scene.load.image(GREY_BKG_KEY, asset('tilemaps/skyscraper_tiles_extruded.grey.png'));
	}

	create(map: Phaser.Tilemaps.Tilemap, scale) {
		const { scene } = this;

		const scrapers = map.addTilesetImage('Skyscrapers', DEFAULT_BKG_KEY);

		// Alternate skyscraper colours
		const green = map.addTilesetImage('Skyscrapers_alt_1', GREEN_BKG_KEY);
		const yellow = map.addTilesetImage('Skyscrapers_alt_2', YELLOW_BKG_KEY);
		const turqouise = map.addTilesetImage('Skyscrapers_alt_3', TURQUOISE_BKG_KEY);
		const pink = map.addTilesetImage('Skyscrapers_alt_4', PINK_BKG_KEY);
		const grey = map.addTilesetImage('Skyscrapers_alt_5', GREY_BKG_KEY);

		// TODO: parameterise depth? or at least shallowest depth?
		const wayBackground = map.createStaticLayer('Right back', pink, 0, 0).setDepth(1);
		const distantBackground = map.createStaticLayer('Back scrapers', pink, 0, 0).setDepth(3);
		const midBackground = map.createStaticLayer('Scrapers', turqouise, 0, 0).setDepth(5);

		Fog.sunset(scene);

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
}

export default Background;
