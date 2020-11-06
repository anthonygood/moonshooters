type State = {
  name: string;
  transitions: PredicateTransition[];
}

type StateDict    = { [Key: string]: State }
type Predicate<T> = { (data: T): boolean   }

type PredicateTransition = {
  predicate: Predicate<any>,
  state: string, // could be State rather than string?
}

export const StateMachine = (initialState: string) => {
  const states: StateDict = {
    [initialState]: {
      transitions: [],
      name: initialState,
    },
  };

  // states used by the monad when building state graph
  let homeState = states[initialState];
  let destState: State;
  let currentStateName = initialState;

  const machine = {
    transitions: (...transitions: PredicateTransition[]) => {
      homeState.transitions = transitions;
      return machine;
    },
    transitionTo: (stateName: string) => {
      if (stateName === homeState.name) {
        throw new TypeError(`Cannot transition to same state: '${stateName}'`)
      }

      destState = states[stateName] = states[stateName] || {
        name: stateName,
        transitions: [],
      };

      return machine;
    },
    when: (...predicates: Predicate<any>[]) => {
      homeState.transitions = homeState.transitions.concat(
        predicates.map(
          predicate => ({ predicate, state: destState.name })
        )
      );
      return machine;
    },
    or: (predicate: Predicate<any>) => {
      homeState.transitions.push({ predicate, state: destState.name });
      return machine;
    },
    state: (stateName: string) => {
      const nominatedState = states[stateName];
      if (!nominatedState) {
        throw new TypeError(`'${stateName}' not found in states: ${Object.keys(states)}`)
      }
      homeState = nominatedState;
      return machine;
    },
    process: (data: any) => {
      const transitions: PredicateTransition[] = states[currentStateName].transitions;
      const transition = transitions.find(transition => transition.predicate(data));
      if (transition) {
        currentStateName = transition.state;
      }
      return machine;
    },
    currentState: () => currentStateName,
  };

  return machine;
};

export const transitionTo = (state: string) => {
  return {
    when: (...predicates: Predicate<any>[]): PredicateTransition[] => {
      return predicates.map(predicate => ({
        predicate,
        state,
      }))
    }
  }
};
