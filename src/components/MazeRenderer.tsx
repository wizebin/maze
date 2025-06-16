import React from 'react';
import type { Maze, Position } from '../types/maze';
import { MazeCell } from './MazeCell';

interface MazeRendererProps {
  maze: Maze;
  playerPosition: Position;
  goalPosition: Position;
  cellSize: number;
}

export const MazeRenderer: React.FC<MazeRendererProps> = ({
  maze,
  playerPosition,
  goalPosition,
  cellSize,
}) => {
  const svgWidth = maze.width * cellSize;
  const svgHeight = maze.height * cellSize;

  return (
    <svg
      width={svgWidth}
      height={svgHeight}
      style={{
        backgroundColor: '#FFF5E6',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      }}
    >
      {maze.cells.map((row, y) =>
        row.map((cell, x) => (
          <MazeCell
            key={`${x}-${y}`}
            cell={cell}
            cellSize={cellSize}
            isPlayer={playerPosition.x === x && playerPosition.y === y}
            isGoal={goalPosition.x === x && goalPosition.y === y}
          />
        ))
      )}
    </svg>
  );
};