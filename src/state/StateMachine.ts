type State<TData> = {
  name: string;
  transitions: PredicateTransition<TData>[];
  init: Function;
  tick: Function;
  exit: Function;
  minTicks: number;
  tickCount: number;
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
  exit: (exit: Function) => TStateMachine<TData>;
  forAtLeast: (count: number) => TStateMachine<TData>;
  state: (stateName: string) => TStateMachine<TData>;

  // Top-level controls
  currentState: () => string;
  process: (data: TData) => TStateMachine<TData>;
  init: () => TStateMachine<TData>;
};

const State = <TData>(name: string, minTicks = 0): State<TData> => {
  return {
    name,
    transitions: [],
    minTicks,
    tickCount: 0,
    init: () => {},
    tick: () => {},
    exit: () => {},
  }
};

export const StateMachine = <TData>(initialState: string): TStateMachine<TData> => {
  const states: StateDict<TData> = {
    [initialState]: State(initialState),
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

      destState = states[stateName] = states[stateName] || State(stateName);

      return machine;
    },
    when: predicate => {
      if (homeState.name === destState.name) {
        throw new TypeError(`Cannot transition to same state: '${destState.name}'`)
      }
      homeState.transitions.push({ predicate, state: destState.name });
      return machine;
    },
    or: predicate => {
      if (homeState.name === destState.name) {
        throw new TypeError(`Cannot transition to same state: '${destState.name}'`)
      }
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
    exit: (fn: Function) => {
      destState.exit = fn;
      return machine;
    },
    forAtLeast: count => {
      destState.minTicks = count;
      return machine;
    },
    state: stateName => {
      const nominatedState = states[stateName];
      if (!nominatedState) {
        throw new TypeError(`'${stateName}' not found in states: ${Object.keys(states)}`)
      }
      homeState = destState = nominatedState;
      return machine;
    },
    init: () => {
      const { init } = states[initialState];
      init();
      return machine;
    },
    process: data => {
      const currentState = states[currentStateName];
      const { tickCount, minTicks } = currentState;
      const transitions: PredicateTransition<TData>[] = states[currentStateName].transitions;
      const transition = transitions.find(transition => transition.predicate(data));

      if (transition && tickCount >= minTicks) {
        currentState.exit(data);
        const nextState = states[transition.state];
        nextState.tickCount = 0; // re-initialise
        nextState.init && nextState.init(data);
        currentStateName = nextState.name;
      } else {
        currentState.tick(data);
        currentState.tickCount++;
      }
      return machine;
    },
    currentState: () => currentStateName,
  };

  return machine;
};
