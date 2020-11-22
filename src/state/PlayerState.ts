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

class PlayerState {
  private direction: PlayerState.Machine;
  private action: PlayerState.Machine;

  constructor(config: PlayerState.Config) {
    const helpers = Helpers(config);
    const { container, velocities } = config;

    const flipX = (bool = false) => () => {
      container.iterate(sprite => sprite.flipX = bool)
    };

    const onlyLeft = data => data.direction.left && !data.direction.right;
    const onlyRight = data => !data.direction.left && data.direction.right;

    const direction = this.direction = <PlayerState.Machine>StateMachine('right')
      .transitionTo('left').when(helpers.onGroundAnd(onlyLeft))
      .andThen(flipX(true))
      .state('left').transitionTo('right').when(helpers.onGroundAnd(onlyRight))
      .andThen(flipX(false));

    // Idle state
    this.action = <PlayerState.Machine>StateMachine('idle')
      .andThen(() => {
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
      .transitionTo('idle').when((data: PlayerState.ProcessParams) => !data.direction.left && !data.direction.right)
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

export class NPCState extends PlayerState {
  private playerTouch: PlayerState.Machine;
  constructor(config: NPCState.Config) {
    super(config);

    this.playerTouch = <NPCState.Machine>StateMachine('untouched')
      .transitionTo('touched').when((data: NPCState.ProcessParams) => data.containerData && data.containerData.touchedByPlayer)
      .andThen(config.onTouch)
      .init();
  }

  process(data: NPCState.ProcessParams) {
    super.process(data);
    this.playerTouch.process(data);
  }
}

namespace NPCState {
  export interface ProcessParams extends PlayerState.ProcessParams {
    containerData: {
      touchedByPlayer?: boolean;
    }
  }

  export interface Config extends PlayerState.Config {
    onTouch: () => void;
  }

  export type Machine = TStateMachine<ProcessParams>;
}

export default PlayerState;
