import { Physics } from 'phaser';
import { StateMachine, TStateMachine } from './StateMachine';
import { Direction } from './Direction';

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

  const justPressed = (direction, data, timeAgo = 200) => {
    return data.time - data.direction.timeDown(direction) < timeAgo;
  };

  return {
    body,
    setAnimation,
    isOnGround,
    justPressed,
    noDirectionPressed: (data: PlayerState.ProcessParams) => !data.direction.right && !data.direction.left && !data.direction.up,
    shouldJump: (data: PlayerState.ProcessParams) => {
      return data.direction.up && isOnGround() && !canClimb(data) && justPressed('up', data);
    },
    leftOrRightJustPressed: (data: PlayerState.ProcessParams) => justPressed('right', data) || justPressed('left', data),
    onGroundAnd: (fn: (any) => boolean) => (data: PlayerState.ProcessParams) => isOnGround() && fn(data),
    moveLeftRight: (data: PlayerState.ProcessParams) => {
      const change = isOnGround() ? velocities.run : velocities.jump / 2;
      let velocity = 0;
      if (data.direction.right) velocity += change;
      if (data.direction.left) velocity -= change;
      body().setAccelerationX(velocity);
    },
    canClimb,
    shouldClimb: (data: PlayerState.ProcessParams) => {
      return canClimb(data) && data.direction.up;
    },
    climb: (data: PlayerState.ProcessParams) => {
      const velocity = velocities.run / 4;
      let change = 0;
      if (data.direction.up) change -= velocity;
      if (data.direction.down) change += velocity;
      body().setVelocityY(change);
    }
  };
};

type Recording = {
  count: number;
  time: number;
  current?: number;
  longest?: number;
};

const Recording = () => ({
  time: 0,
  count: 0,
  current: 0,
  longest: 0,
});

class PlayerState {
  private direction: PlayerState.Machine;
  private action: PlayerState.Machine;

  public flightRecorder: {
    idle: Recording;
    jump: Recording;
    left: Recording;
    right: Recording;
  }

  constructor(config: PlayerState.Config) {
    this.flightRecorder = {
      jump: Recording(),
      idle: Recording(),
      left: Recording(),
      right: Recording(),
    };
    const helpers = Helpers(config);
    const { container, velocities } = config;

    const flipX = (bool = false) => () => {
      container.iterate(sprite => sprite.flipX = bool)
    };

    const onlyLeft = data => data.direction.left && !data.direction.right;
    const onlyRight = data => !data.direction.left && data.direction.right;

    const direction = this.direction = <PlayerState.Machine>StateMachine('right')
      .transitionTo('left').when(helpers.onGroundAnd(onlyLeft))
      .andThen(() => {
        flipX(true)();
        this.flightRecorder.left.count++;
      })
      .tick((data: PlayerState.ProcessParams) => {
        this.flightRecorder.left.time += data.delta;
      })
      .state('left').transitionTo('right').when(helpers.onGroundAnd(onlyRight))
      .andThen(() => {
        flipX(false)();
        this.flightRecorder.right.count++;
      })
      .tick((data: PlayerState.ProcessParams) => {
        this.flightRecorder.right.time += data.delta;
      });

    // Idle state
    this.action = <PlayerState.Machine>StateMachine('idle')
      .andThen(() => {
        helpers.setAnimation('idle');
        helpers.body().setAccelerationX(0);
        this.flightRecorder.idle.count++;
      })
      .tick((data: PlayerState.ProcessParams) => {
        helpers.body().setVelocityX(0);
        this.flightRecorder.idle.time += data.delta;
        this.flightRecorder.idle.current += data.delta;
      })
      .exit(() => {
        this.flightRecorder.idle.longest = Math.max(this.flightRecorder.idle.longest, this.flightRecorder.idle.current);
        this.flightRecorder.idle.current = 0;
      })
      .transitionTo('jump').when(helpers.shouldJump)
      .transitionTo('walk').when(data => onlyLeft(data) || onlyRight(data))
      .transitionTo('climb').when(helpers.shouldClimb)

    // Walk state
      .state('walk').andThen(() => helpers.setAnimation('walk'))
      .tick(helpers.moveLeftRight)
      .transitionTo('idle').when((data: PlayerState.ProcessParams) => !data.direction.left && !data.direction.right)
      .transitionTo('jump').when(helpers.shouldJump)
      .transitionTo('climb').when(helpers.shouldClimb)

    // Jump state
      .state('jump').andThen(() => {
        helpers.body().setVelocityY(-velocities.jump);
        helpers.setAnimation('jump');
        this.flightRecorder.jump.count++;
      })
      .tick((data: PlayerState.ProcessParams) => {
        helpers.moveLeftRight(data);
        this.flightRecorder.jump.time += data.delta;
        this.flightRecorder.jump.current += data.delta;
      })
      .exit(() => {
        this.flightRecorder.jump.longest = Math.max(this.flightRecorder.jump.longest, this.flightRecorder.jump.current);
        this.flightRecorder.jump.current = 0;
      })
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
    delta: number;
    direction: Direction;
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
