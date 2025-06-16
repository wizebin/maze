export interface Cell {
  x: number;
  y: number;
  walls: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  };
  visited: boolean;
}

export interface Maze {
  cells: Cell[][];
  width: number;
  height: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  maze: Maze;
  playerPosition: Position;
  goalPosition: Position;
  gameWon: boolean;
}