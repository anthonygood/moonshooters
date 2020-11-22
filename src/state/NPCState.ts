
import { StateMachine, TStateMachine } from './StateMachine';
import PlayerState from './PlayerState';

class NPCState extends PlayerState {
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

export default NPCState;
