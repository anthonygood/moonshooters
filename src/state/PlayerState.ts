import { StateMachine, TStateMachine } from './StateMachine';
import { Physics } from 'phaser';

function Helpers({ container, velocities }: PlayerState.Config) {
  const setAnimation = animName => {
    container.iterate((sprite) => {
      // TODO: validate animation name?
      sprite.play(`${sprite.name}/${animName}`, true);
    });
  };

  const body = (): Physics.Arcade.Body => container.body as Physics.Arcade.Body; // TODO: better?
  const isOnGround = () => body().touching.down || body().blocked.down;
  const canClimb = (data: PlayerState.ProcessParams) => {
    return data.near.climbable
  };

  const justPressed = (button, data, timeAgo = 200) => {
    return data.time - button.timeDown < timeAgo;
  };

  return {
    body,
    setAnimation,
    isOnGround,
    justPressed,
    noDirectionPressed: (data: PlayerState.ProcessParams) => !data.cursors.right.isDown && !data.cursors.left.isDown && !data.cursors.up.isDown,
    shouldJump: (data: PlayerState.ProcessParams) => {
      return data.cursors.up.isDown && isOnGround() && !canClimb(data) && justPressed(data.cursors.up, data);
    },
    leftOrRightJustPressed: (data: PlayerState.ProcessParams) => justPressed(data.cursors.right, data) || justPressed(data.cursors.left, data),
    onGroundAnd: (fn: (any) => boolean) => (data: PlayerState.ProcessParams) => isOnGround() && fn(data),
    moveLeftRight: (data: PlayerState.ProcessParams) => {
      const change = isOnGround() ? velocities.run : velocities.jump / 2;
      let velocity = 0;
      if (data.cursors.right.isDown) velocity += change;
      if (data.cursors.left.isDown) velocity -= change;
      body().setAccelerationX(velocity);
    },
    canClimb,
    shouldClimb: (data: PlayerState.ProcessParams) => {
      return canClimb(data) && data.cursors.up.isDown;
    },
    climb: (data: PlayerState.ProcessParams) => {
      const velocity = velocities.run / 4;
      let change = 0;
      if (data.cursors.up.isDown) change -= velocity;
      if (data.cursors.down.isDown) change += velocity;
      body().setVelocityY(change);
    }
  };
};

class PlayerState {
  private direction: PlayerState.Machine;
  private action: PlayerState.Machine;

  constructor(config: PlayerState.Config) {
    const helpers = Helpers(config);
    const { container, velocities } = config;

    const flipX = (bool = false) => () => {
      container.iterate(sprite => sprite.flipX = bool)
    };

    const onlyLeft = data => data.cursors.left.isDown && !data.cursors.right.isDown;
    const onlyRight = data => !data.cursors.left.isDown && data.cursors.right.isDown;

    const direction = this.direction = <PlayerState.Machine>StateMachine('right')
      .transitionTo('left').when(helpers.onGroundAnd(onlyLeft))
      .andThen(flipX(true))
      .state('left').transitionTo('right').when(helpers.onGroundAnd(onlyRight))
      .andThen(flipX(false));

    // Idle state
    this.action = <PlayerState.Machine>StateMachine('idle')
      .andThen(() => {
        // sprite.anims.play('idle');
        // sprite.setAccelerationX(0);
        console.log('idllle');
        helpers.setAnimation('idle');
        helpers.body().setAccelerationX(0);
      })
      .tick(() => helpers.body().setVelocityX(0))
      .transitionTo('jump').when(helpers.shouldJump)
      .transitionTo('walk').when(data => onlyLeft(data) || onlyRight(data))
      .transitionTo('climb').when(helpers.shouldClimb)

    // Walk state
      .state('walk').andThen(() => helpers.setAnimation('walk'))
      .tick(helpers.moveLeftRight)
      .transitionTo('idle').when((data: PlayerState.ProcessParams) => !data.cursors.left.isDown && !data.cursors.right.isDown)
      .transitionTo('jump').when(helpers.shouldJump)
      .transitionTo('climb').when(helpers.shouldClimb)

    // Jump state
      .state('jump').andThen(() => {
        helpers.body().setVelocityY(-velocities.jump);
        helpers.setAnimation('jump');
      })
      .tick(helpers.moveLeftRight)
      .transitionTo('idle').when(helpers.isOnGround)
      .transitionTo('walk').when(helpers.onGroundAnd(data => onlyLeft(data) || onlyRight(data)))

    // Climb state
      .state('climb')
      .andThen(() => {
        // TODO: play climbing animation...
        helpers.setAnimation('jump');
      })
      .tick(helpers.climb)
      .forAtLeast(1)
      .exit(() => {
        helpers.body().setVelocity(0);
        const forwardOrBack = direction.currentState() === 'right' ? +20 : -20;
        container.setX(container.x + forwardOrBack);
      })
      .transitionTo('idle').when((data: PlayerState.ProcessParams) => {
        if (!helpers.canClimb(data) || helpers.isOnGround()) {
          console.log('!helpers.canClimb(data) || helpers.isOnGround()', !helpers.canClimb(data), helpers.isOnGround());
        }
        return !helpers.canClimb(data) || helpers.isOnGround()
      })
      .init();
  }

  process(data: PlayerState.ProcessParams) {
    this.direction.process(data);
    this.action.process(data);
  }
}

namespace PlayerState {
  export interface ProcessParams {
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    near: {
      climbable: boolean;
    };
    time: number;
  };

  export type Machine = TStateMachine<ProcessParams>;

  export interface Config {
    sprite?: Phaser.Physics.Arcade.Sprite;
    container?: Phaser.GameObjects.Container;
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
