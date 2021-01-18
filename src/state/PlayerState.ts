import { Physics } from 'phaser';
import { StateMachine, TStateMachine } from './StateMachine';
import { Direction } from './Direction';
import { NPCDirection } from '../entities/NPC/Driver';

function Helpers({ container, velocities, setAnimation }: PlayerState.Config) {
  const roadkill = () => container.getData('roadkill');
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
    roadkill,
    noDirectionPressed: (data: PlayerState.ProcessParams) => !data.direction.right && !data.direction.left && !data.direction.up,
    shouldJump: (data: PlayerState.ProcessParams) => {
      return data.direction.up && isOnGround() && !canClimb(data) && justPressed('up', data);
    },
    leftOrRightJustPressed: (data: PlayerState.ProcessParams) => justPressed('right', data) || justPressed('left', data),
    onGroundAnd: (fn: (any) => boolean) => (data: PlayerState.ProcessParams) => isOnGround() && fn(data),
    moveLeftRight: (data: PlayerState.ProcessParams, velocity = velocities.run) => {
      const { left, right } = data.direction;
      if ((left && right) || (!left && !right)) return;

      const currentVelocity = body().velocity.x;
      const currentDirection: Direction = body().velocity.x > 0 ? { right: true } : { left: true };

      const changedDirection =
        (currentVelocity && left && currentDirection.right) ||
        (currentVelocity && right && currentDirection.left);

      changedDirection && body().setVelocityX(0);
      body().setAccelerationX(right ? velocity : -velocity);
    },
    airControl: (data: PlayerState.ProcessParams) => {
      const velocity = velocities.airControl;
      let acceleration = 0;
      if (data.direction.right) acceleration += velocity;
      if (data.direction.left) acceleration -= velocity;
      body().setAccelerationX(acceleration);
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
    },
  };
};
class PlayerState {
  public direction: PlayerState.Machine;
  public action: PlayerState.Machine;

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
      .transitionTo('direction:roadkill').when(helpers.roadkill)
      .state('left').transitionTo('right').when(helpers.onGroundAnd(onlyRight))
      .andThen(flipX(false))
      .transitionTo('direction:roadkill').when(helpers.roadkill);

    // Idle state
    const action = this.action = <PlayerState.Machine>StateMachine('idle')
      .andThen(() => {
        helpers.setAnimation('idle');
        helpers.body().setAccelerationX(0);
      })
      .tick((data: PlayerState.ProcessParams) => {
        helpers.body().setVelocityX(0);
      })
      .transitionTo('roadkill').when(helpers.roadkill)
      .transitionTo('jump').when(helpers.shouldJump)
      .transitionTo('walk').when(data => onlyLeft(data) || onlyRight(data))
      .transitionTo('climb').when(helpers.shouldClimb)

    // Walk state
      .state('walk').andThen(() => helpers.setAnimation('walk'))
      .tick(helpers.moveLeftRight)
      .transitionTo('idle').when((data: PlayerState.ProcessParams) => !data.direction.left && !data.direction.right)
      .transitionTo('jump').when(helpers.shouldJump)
      .transitionTo('climb').when(helpers.shouldClimb)
      .transitionTo('roadkill').when(helpers.roadkill)

    // Jump state
      .state('jump').andThen(() => {
        helpers.body().setVelocityY(-velocities.jump);
        helpers.setAnimation('jump');
      })
      .tick(helpers.airControl)
      .transitionTo('roadkill').when(helpers.roadkill)
      .transitionTo('walk').when(helpers.onGroundAnd(data => onlyLeft(data) || onlyRight(data)))
      .transitionTo('idle').when(helpers.isOnGround)

      .state('roadkill')
      .andThen(() => {
        const direction = helpers.roadkill();
        const rotation = direction === NPCDirection.Left ? -1.5 : 1.5;
        const velocityX = direction === NPCDirection.Left ? -1000 : 1000;
        container.iterate((sprite: Phaser.GameObjects.Sprite) => {
          sprite.anims.stop();
          sprite.setFrame('idle_1.png');
        });
        container.setRotation(rotation);
        helpers.body().setSize(helpers.body().height, 20)
          .stop()
          .setVelocityX(velocityX)
          .setVelocityY(-1000);
      })

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
      });
  }

  init() {
    this.direction.init();
    this.action.init();
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
      airControl: number;
    };
    setAnimation: (name) => void;
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
