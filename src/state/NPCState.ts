
import { StateMachine, TStateMachine } from './StateMachine';
import PlayerState from './PlayerState';

function Helpers({ container, stopAnimation }: NPCState.Config) {
  const touched = (data: NPCState.ProcessParams) =>
    data.containerData && data.containerData.touchedByPlayer;

  const onTouch = () => {
    const body = container.body as Phaser.Physics.Arcade.Body;
    stopAnimation();
    body.setVelocityX(0);
    body.setAccelerationX(0);
  };

  return {
    touched,
    onTouch,
  };
}
class NPCState extends PlayerState {
  public touch: PlayerState.Machine;
  constructor(config: NPCState.Config) {
    super(config);

    const { touched, onTouch } = Helpers(config);

    this.action
      .state('walk').transitionTo('touched').when(touched).andThen(onTouch)
      .state('idle').transitionTo('touched').when(touched).andThen(onTouch)

    // TODO: set event listener from NPC instead
    this.action.on('touched', config.onTouch);
  }

  process(data: NPCState.ProcessParams) {
    super.process(data);
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
    stopAnimation: () => void;
  }

  export type Machine = TStateMachine<ProcessParams>;
}

export default NPCState;
