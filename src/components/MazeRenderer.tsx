import React from 'react';
import type { Maze, Position } from '../types/maze';
import { StaticMaze } from './StaticMaze';
import { Player } from './Player';

interface MazeRendererProps {
  maze: Maze;
  playerPosition: Position;
  animatedPosition: Position;
  goalPosition: Position;
  cellSize: number;
  isAnimating?: boolean;
}

export const MazeRenderer: React.FC<MazeRendererProps> = ({
  maze,
  playerPosition,
  animatedPosition,
  goalPosition,
  cellSize,
  isAnimating,
}) => {
  // console.log('MazeRenderer: Rendering container (should be infrequent)');

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
      }}
    >
      {/* Static maze structure - memoized and rarely re-renders */}
      <StaticMaze
        maze={maze}
        goalPosition={goalPosition}
        cellSize={cellSize}
      />
      
      {/* Dynamic player overlay - only re-renders when position changes */}
      <Player
        animatedPosition={animatedPosition}
        cellSize={cellSize}
        isAnimating={isAnimating}
      />
    </div>
  );
};