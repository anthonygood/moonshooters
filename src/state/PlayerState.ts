import { StateMachine, TStateMachine } from './StateMachine';

function Helpers({ sprite, velocities }: PlayerState.Config) {
  const isOnGround = () => sprite.body.touching.down || sprite.body.blocked.down;
  return {
    isOnGround,
    noDirectionPressed: (data: PlayerState.ProcessParams) => !data.cursors.right.isDown && !data.cursors.left.isDown && !data.cursors.up.isDown,
    shouldJump: (data: PlayerState.ProcessParams) => data.cursors.up.isDown && isOnGround(),
    leftOrRightIsPressed: (data: PlayerState.ProcessParams) => data.cursors.right.isDown || data.cursors.left.isDown,
    onGroundAnd: (fn: (any) => boolean) => (data: PlayerState.ProcessParams) => isOnGround() && fn(data),
    moveLeftRight: (data: PlayerState.ProcessParams) => {
      const change = isOnGround() ? velocities.run : velocities.jump / 2;
      let velocity = 0;
      if (data.cursors.right.isDown) velocity += change;
      if (data.cursors.left.isDown) velocity -= change;
      sprite.setAccelerationX(velocity);
    },
  };
};

class PlayerState {
  private direction: PlayerState.Machine;
  private action: PlayerState.Machine;

  constructor(config: PlayerState.Config) {
    const helpers = Helpers(config);
    const { sprite, velocities } = config;

    this.direction = <PlayerState.Machine>StateMachine('right')
      .transitionTo('left').when(helpers.onGroundAnd(data => data.cursors.left.isDown))
      .andThen(() => sprite.flipX = true)
      .state('left').transitionTo('right').when(helpers.onGroundAnd(data => data.cursors.left.isDown))
      .andThen(() => sprite.flipX = false);

    // Idle state
    this.action = <PlayerState.Machine>StateMachine('idle')
      .andThen(() => {
        sprite.anims.play('idle');
        sprite.setAccelerationX(0);
      })
      .tick(() => sprite.setVelocityX(0))
      .transitionTo('jump').when(helpers.shouldJump)
      .transitionTo('walk').when(helpers.leftOrRightIsPressed)

    // Walk state
      .state('walk').andThen(() => sprite.anims.play('walk'))
      .tick(helpers.moveLeftRight)
      .transitionTo('idle').when(helpers.noDirectionPressed)
      .transitionTo('jump').when(helpers.shouldJump)

    // Jump state
      .state('jump').andThen(() => {
        sprite.setVelocityY(-velocities.jump);
        sprite.anims.play('jump', true);
      })
      .tick(helpers.moveLeftRight)
      .transitionTo('idle').when(helpers.onGroundAnd(helpers.noDirectionPressed))
      .transitionTo('walk').when(helpers.onGroundAnd(helpers.leftOrRightIsPressed))
      .init();
  }

  process(data: PlayerState.ProcessParams) {
    this.direction.process(data);
    this.action.process(data);
  }
}

namespace PlayerState {
  export interface ProcessParams {
    cursors: Phaser.Types.Input.Keyboard.CursorKeys
  };

  export type Machine = TStateMachine<ProcessParams>;

  export interface Config {
    sprite: Phaser.Physics.Arcade.Sprite;
    velocities: {
      run: number;
      jump: number;
    }
  }

  export interface Helpers {
    isOnGround: Function;
    noDirectionPressed: Function;
    shouldJump: Function;
    leftOrRightIsPressed: Function;
    onGroundAnd: Function;
  }
}

export default PlayerState;
