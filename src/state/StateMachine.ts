type State<Transition> = {
  name: string;
  transitions: Transition[];
  init?: Function;
  tick?: Function;
}

type StateDict<TData> = { [Key: string]: State<TData> }
type Predicate<TData> = { (data: TData): boolean      }

type PredicateTransition<TData> = {
  predicate: Predicate<TData>,
  state: string, // could be State rather than string?
}

export type TStateMachine<TData> = {
  // Builder functions for declaring state graph
  transitionTo: (stateName: string) => TStateMachine<TData>;
  when: (predicate: Predicate<TData>) => TStateMachine<TData>;
  or: (predicate: Predicate<TData>) => TStateMachine<TData>;
  andThen: (init: Function) => TStateMachine<TData>;
  tick: (tick: Function) => TStateMachine<TData>;
  state: (stateName: string) => TStateMachine<TData>;

  // Top-level controls
  currentState: () => string;
  process: (data: TData) => TStateMachine<TData>;
  init: () => TStateMachine<TData>;
};

export const StateMachine = <TData>(initialState: string): TStateMachine<TData> => {
  type Transition = PredicateTransition<TData>;
  const states: StateDict<Transition> = {
    [initialState]: {
      transitions: [],
      name: initialState,
    },
  };

  // states used by the monad when building state graph
  let homeState = states[initialState];
  let destState = homeState;
  let currentStateName = initialState;

  const machine: TStateMachine<TData> = {
    transitionTo: stateName => {
      if (stateName === homeState.name) {
        throw new TypeError(`Cannot transition to same state: '${stateName}'`)
      }

      destState = states[stateName] = states[stateName] || {
        name: stateName,
        transitions: [],
      };

      return machine;
    },
    when: predicate => {
      homeState.transitions.push({ predicate, state: destState.name });
      return machine;
    },
    or: predicate => {
      homeState.transitions.push({ predicate, state: destState.name });
      return machine;
    },
    andThen: (fn: Function) => {
      destState.init = fn;
      return machine;
    },
    tick: (fn: Function) => {
      destState.tick = fn;
      return machine;
    },
    state: stateName => {
      const nominatedState = states[stateName];
      if (!nominatedState) {
        throw new TypeError(`'${stateName}' not found in states: ${Object.keys(states)}`)
      }
      homeState = nominatedState;
      return machine;
    },
    init: () => {
      const { init } = states[currentStateName];
      init();
      return machine;
    },
    process: data => {
      const transitions: PredicateTransition<TData>[] = states[currentStateName].transitions;
      const transition = transitions.find(transition => transition.predicate(data));
      if (transition) {
        currentStateName = transition.state;
        const { init } = states[currentStateName];
        init && init();
      } else {
        const { tick } = states[currentStateName];
        tick && tick();
      }
      return machine;
    },
    currentState: () => currentStateName,
  };

  return machine;
};
