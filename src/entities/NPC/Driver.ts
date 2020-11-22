
import { Direction } from '../../state/Direction';

const sample = (vals = []) =>
  vals[Math.floor(Math.random() * vals.length)];

enum NPCDirection {
  Left,
  Right,
  None
};

export interface NPCDriver {
  getDirection: () => Direction;
  go: (NPCDirection) => void;
  change: () => void;
};

const Driver: () => NPCDriver = () => {
  let direction = NPCDirection.None;

  const getDirection: () => Direction = () => ({
    up: false,
    down: false,
    left: direction === NPCDirection.Left,
    right: direction === NPCDirection.Right,
    timeDown: () => 0,
  });

  const go = (newDirection: NPCDirection) =>
    direction = newDirection;

  const randomNewDirection = (direction: NPCDirection) => {
    const otherDirections = Object.values(NPCDirection).filter(dir => dir !== direction);
    return sample(otherDirections);
  };

  const change = () => {
    go(randomNewDirection(direction));
  };

  return {
    getDirection,
    go,
    change,
  };
};

export default Driver;
