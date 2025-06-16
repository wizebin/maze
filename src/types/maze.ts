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

export interface ChallengeLevel {
  id: string;
  name: string;
  width: number;
  height: number;
  description: string;
  optimalMoves: number;
}

export interface GameScore {
  level: string;
  time: number;
  moves: number;
  score: number;
  timestamp: number;
}

export type GameScreenState = 'menu' | 'playing' | 'finished' | 'settings';