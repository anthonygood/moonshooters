
import { StateMachine, TStateMachine } from './StateMachine';
import PlayerState from './PlayerState';
import { NPCDirection } from '../entities/NPC/Driver';

function Helpers({ container, stopAnimation }: NPCState.Config) {
  const touched = (data: NPCState.ProcessParams) =>
    data.containerData && data.containerData.touchedByPlayer;

  const onFreeze = () => {
    const body = container.body as Phaser.Physics.Arcade.Body;
    stopAnimation();
    body.setVelocityX(0);
    body.setAccelerationX(0);
  };

  return {
    touched,
    onFreeze,
  };
}
class NPCState extends PlayerState {
  public touch: NPCState.Machine;
  constructor(config: NPCState.Config) {
    super(config);

    const { touched, onFreeze } = Helpers(config);

    if (!config.modifiers || !config.modifiers.moveOnTouch) {
      this.action
        .state('walk').transitionTo('frozen').when(touched).andThen(onFreeze)
        .state('idle').transitionTo('frozen').when(touched).andThen(onFreeze);
    }

    this.touch = StateMachine<NPCState.ProcessParams>('untouched').transitionTo('touched').when(touched)
  }

  process(data: NPCState.ProcessParams) {
    super.process(data);
    this.touch.process(data);
  }
}

namespace NPCState {
  export interface ProcessParams extends PlayerState.ProcessParams {
    containerData: {
      touchedByPlayer?: boolean;
    }
  }

  export type Modifiers = {
    idle?: boolean;
    moveOnTouch?: NPCDirection;
  };
  export interface Config extends PlayerState.Config {
    stopAnimation: () => void;
    modifiers?: Modifiers;
  }

  export type Machine = TStateMachine<ProcessParams>;
}

export default NPCState;
