import { StateMachine, TStateMachine } from '../state/StateMachine';

const PLAYER_KEY = 'player';
const asset = (path: string) => `/assets/${path}`;

const RUN_VELOCITY = 1600;
const JUMP_VELOCITY = 1000;

type PlayerStateData = {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys
};

class Player {
  // TODO: Define in map
  readonly spawn = [150, 50];
  public scene: Phaser.Scene;
  public sprite: Phaser.Physics.Arcade.Sprite;
  public state: {
    direction?: TStateMachine<PlayerStateData>;
    action?: TStateMachine<PlayerStateData>;
    movement?: TStateMachine<PlayerStateData>;
  }

  constructor(scene) {
    this.scene = scene;
    this.state = {};
  }

  preload(): void {
		this.scene.load.multiatlas(PLAYER_KEY, asset('sprites/bojo_frames.json'), asset('sprites'));
  }

  create(): void {
    const sprite = this.sprite = this.scene.physics.add.sprite(...this.spawn, PLAYER_KEY, 'idle_1.png');
    sprite.setDebug(true, true, 1);;
    sprite.setScale(3);
    sprite.setMaxVelocity(700, 1000);
    sprite.body.setSize(20, 32);

    this.scene.anims.create({
      key: 'walk',
      frameRate: 6,
      repeat: -1,
      frames: this.getFrames('walk_', 4),
    });
    this.scene.anims.create({
      key: 'idle',
      frameRate: 2,
      repeat: -1,
      frames: this.getFrames('idle_', 2),
    });
    this.scene.anims.create({
      key: 'jump',
      frameRate: 3,
      repeat: -1,
      frames: this.getFrames('jump_', 2),
    });

    const isOnGround = () => sprite.body.touching.down || sprite.body.blocked.down;
    this.state.direction = <TStateMachine<PlayerStateData>>StateMachine('right')
      .transitionTo('left').when((data: PlayerStateData) => isOnGround() && data.cursors.left.isDown)
      .andThen(() => sprite.flipX = true)
      .state('left').transitionTo('right').when((data: PlayerStateData) => isOnGround() && data.cursors.right.isDown)
      .andThen(() => sprite.flipX = false);

    const noDirectionPressed = (data: PlayerStateData) => !data.cursors.right.isDown && !data.cursors.left.isDown && !data.cursors.up.isDown;
    const shouldJump = (data: PlayerStateData) => data.cursors.up.isDown && isOnGround();
    const leftOrRightIsPressed = (data: PlayerStateData) => data.cursors.right.isDown || data.cursors.left.isDown;
    const moveLeftRight = (data: PlayerStateData) => {
      const change = isOnGround() ? RUN_VELOCITY : RUN_VELOCITY / 2;
      let velocity = 0;
      if (data.cursors.right.isDown) velocity += change;
      if (data.cursors.left.isDown) velocity -= change;
      this.sprite.setAccelerationX(velocity);
    };

    this.state.action = <TStateMachine<PlayerStateData>>StateMachine('idle')
      .andThen(() => {
        sprite.anims.play('idle');
        sprite.setAccelerationX(0);
      })
      .tick(() => this.sprite.setVelocityX(0))
      .transitionTo('jump').when(shouldJump)
      .transitionTo('walk').when(leftOrRightIsPressed)

      .state('walk').andThen((data) => {
        sprite.anims.play('walk');
      })
      .tick(moveLeftRight)
      .transitionTo('idle').when(noDirectionPressed)
      .transitionTo('jump').when(shouldJump)

      .state('jump').andThen(() => {
        sprite.setVelocityY(-JUMP_VELOCITY);
        this.sprite.anims.play('jump', true);
      })
      .tick(moveLeftRight)
      .transitionTo('idle').when((data: PlayerStateData) => noDirectionPressed(data) && isOnGround())
      .transitionTo('walk').when((data: PlayerStateData) => leftOrRightIsPressed(data) && isOnGround())
      .init();
  }

  private getFrames(prefix, end) {
    return this.scene.anims.generateFrameNames(
      PLAYER_KEY,
      {
        prefix,
        suffix: '.png',
        start: 1,
        end,
      }
    )
  }

	update(
    time: number,
    delta: number,
    cursors: Phaser.Types.Input.Keyboard.CursorKeys
  ) {
    this.state.direction.process({ cursors });
    this.state.action.process({ cursors });
	}
}

export default Player;
