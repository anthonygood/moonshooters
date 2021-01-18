import EndLevelReport from '../entities/Scoring/EndLevelReport';
import Score from '../entities/Scoring/Score';
import { rate } from '../entities/Scoring/Rater';
import Player from '../entities/Player';
import NPC from '../entities/NPC/NPC';
import { Morning as Background } from '../entities/Background';
import * as json from '../../assets/tilemaps/The City.json';
import Sound from '../sound/LevelSounds';
import { DynamicAtlas, TileData, asset } from '../util';

export const MAP_SCALE = 1;
const LEVEL_KEY = 'level';
const VAN_KEY = 'van';
class TheCity extends Phaser.Scene {
	private score: Score;
	public player: Player;
	public cursors: Phaser.Types.Input.Keyboard.CursorKeys;
	public map: Phaser.Tilemaps.Tilemap;
	public NPCs: NPC[];
	public background: Background; // FIXME
	public levelSound: Sound;
	private disposeReport: () => void;

	constructor(key = 'The City') {
		super({ key });
    this.player = new Player(this);
		this.background = this.getBackground();
		this.score = new Score(this);
		this.levelSound = new Sound(this, this.getMusicName(), this.getMusicVolume());
		this.NPCs = [];
	}

  getBackground() {
    return new Background(this);
  }

  getLevelJson() {
    return json;
	}

	getMapKey() {
		return 'TheCity';
	}

	getMusicName() {
		return 'lazy intro';
	}

	getMusicVolume() {
		return .05;
	}

	preload() {
		const json = this.getLevelJson();
		// @ts-ignore
		this.background.preload(json);
		// @ts-ignore
		this.load.tilemapTiledJSON(this.getMapKey(), json);
		this.load.image(LEVEL_KEY, asset('tilemaps/platforms_extruded.png'));
		this.load.image(VAN_KEY, asset('sprites/white van.png'));

		this.levelSound.preload();
		this.player.preload();
		NPC.preload(this);
	}

	create() {
		const map = this.map = this.make.tilemap({ key: this.getMapKey() });
		const spawnCount = TileData.getNPCSpawns(map).length;
		this.background.create(map, MAP_SCALE);

		// Generate NPC sprite atlas
		DynamicAtlas.renderToTexture(this, spawnCount);
		NPC.createAnimations(this, spawnCount);

		const layer = this.createMapLayer();

		this.cursors = this.input.keyboard.createCursorKeys();

		const playerSpawn = TileData.getPlayerSpawn(map);
		this.player.create(this.cursors, [playerSpawn.x * MAP_SCALE, playerSpawn.y * MAP_SCALE]);
		this.player.container.setDepth(7);
		this.physics.add.collider(this.player.container, layer);

		this.cameras.main.setBounds(0, 0, map.widthInPixels * MAP_SCALE, map.heightInPixels * MAP_SCALE);
		this.cameras.main.startFollow(this.player.container, false);

		this.spawnNPCs(layer);
		this.score.create();

		// TODO: dispose with overlap listeners?
		this.NPCs.forEach(npc => {
			this.physics.add.overlap(npc.container, this.player.container, (npcContainer, _player) => {
				if (!npcContainer.getData('touchedByPlayer')) {
					const wasPass = this.score.pass;
					this.score.increment();
					this.score.update();
					const isPass = this.score.pass;
					const justPassed = !wasPass && isPass;

					justPassed ? this.levelSound.tension() : this.levelSound.playSting();
					justPassed && this.player.sound.success();
					this.player.sound.bark();
					npcContainer.setData('touchedByPlayer', true);
				}

				// TODO: 2 metre penalty radius
				// apparently overlap uses fixed update so should be consistent regardless of framerate
				this.score.penalise();
			});
		});

		this.input.once('pointerdown', this.levelSound.playMusic);
		this.input.keyboard.once('keydown', this.levelSound.playMusic);

		// debug
		// @ts-ignore
		window.game = this;
	}

	createMapLayer() {
		const { map } = this;
		const tileset = map.addTilesetImage('Platforms', LEVEL_KEY);
		return map.createLayer('World', tileset)
			.setDepth(6)
			.setCollisionByProperty({ collides: true })
			.setScale(MAP_SCALE);
	}

	update(time: number, delta: number) {
		const fallenBelowBounds = (<Phaser.Physics.Arcade.Body>this.player.container.body).top > this.map.heightInPixels * MAP_SCALE;
		const roadkill = this.player.container.getData('roadkill');

		if (this.score.end) {
			if (this.cursors.space.isDown || this.input.activePointer.isDown) this.restart();
		} else {
			if (fallenBelowBounds || roadkill) this.end();
		}

		// Don't keep updating player out of level bounds
		if (!fallenBelowBounds) this.player.update(time, delta);

		// TODO: only update NPCs nearby?
		this.NPCs
			.filter(npc => npc.spawned)
			.forEach(npc => npc.update(time, delta));
	}

	end() {
		const { levelSound, player, score } = this;
		score.finish();
		score.pass ? levelSound.release() : levelSound.crisis();
		score.pass ? player.sound.success() : player.sound.fail();
		const ratings = rate(score, player.flightRecorder);
		this.disposeReport = EndLevelReport(this, score, ratings.join('\n'));
	}

	restart() {
		this.disposeReport();
		this.NPCs.forEach(npc => npc.destroy());
		this.NPCs = [];
		this.score.pass ? this.continueToNextLevel() : this.scene.restart();
	}

	spawnNPCs(layer: Phaser.Tilemaps.TilemapLayer) {
		const {
			NPCs,
			cursors,
			map,
			physics,
			score
		} = this;

		const npcCount = TileData.getNPCSpawns(map).length;
		score.setTotal(npcCount);

		TileData.forEachSpawn(map, (spawn, modifiers, index) => {
			const npc = new NPC(this, index)
				.create(cursors, [spawn.x * MAP_SCALE, spawn.y * MAP_SCALE], modifiers);

			npc.container.setDepth((npcCount % 2) + 6);
			physics.add.collider(npc.container, layer);
			NPCs.push(npc);
		});
	}

	_debug(worldLayer) {
		const ladderIndices = worldLayer.filterTiles(_ => _.properties.climbable).map(_ => _.index);
		worldLayer.setTileIndexCallback(ladderIndices, this.player.nearClimbable, this.player)
		const debugGraphics = this.add.graphics().setAlpha(.75);
		worldLayer.renderDebug(debugGraphics, {
			tileColor: null, // Colour of non-colliding tiles
			collidingTileColor: new Phaser.Display.Color(255, 255, 255, 255), // Color of colliding tiles
			faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
		});
	}

	continueToNextLevel() {
		this.levelSound.stopMusic();
		return this.nextScene();
	}

	nextScene() {
		return this.scene.start('The CityII');
	}
}

export default TheCity;
