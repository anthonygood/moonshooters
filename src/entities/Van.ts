import { NPCDirection } from './NPC/Driver';

const VAN_KEY = 'van';
const VELOCITY = 750;

class Van {
  public container: Phaser.GameObjects.GameObject;
  public direction: NPCDirection;
  private scene: Phaser.Scene;
  private spawn: [number, number];
  private boundary: number;

  static preload(scene) {
		scene.load.image(VAN_KEY, './assets/sprites/white van.png');
  }

  constructor(scene) {
    this.scene = scene;
  }

  create(x: number, y: number, boundary: number) {
    this.spawn = [x, y];
    this.boundary = boundary;
    this.direction = boundary < x ? NPCDirection.Left : NPCDirection.Right;

    if (this.container) this.container.destroy();

    const { scene } = this;
		const container = this.container = scene.add.container(x, y);

		const sprite = scene.add.sprite(96, 48, VAN_KEY)
			.setName(VAN_KEY)
      .setScale(3);

    let velocity = VELOCITY

    // move to state
    if (this.direction === NPCDirection.Left) {
      sprite.flipX = true;
      velocity = -velocity;
    }

    container.add(sprite).setDepth(5);

    scene.physics.world.enable(container);
    (container.body as Phaser.Physics.Arcade.Body)
      .setGravity(0, -2500)
      .setVelocityX(velocity)
      .setSize(192, 128);
  }

  update() {
    const { boundary, container, direction, spawn: [spawnX, spawnY] } = this;
    const body = <Phaser.Physics.Arcade.Body>container.body;

    // Determine which 'direction' to perform boundary check for,
    // according to which direction the body is moving.
    const beyondBounds = direction === NPCDirection.Left ?
      body.x < boundary :
      body.x > boundary;

		if (beyondBounds) {
      body.x = spawnX;
      body.y = spawnY;
    }
  }

  // TODO: more cleanup?
  destroy(): void {
    this.container.destroy();
  }
}

export default Van;
