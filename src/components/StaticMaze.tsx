import React from 'react';
import type { Maze, Position } from '../types/maze';
import { MazeCell } from './MazeCell';

interface StaticMazeProps {
  maze: Maze;
  goalPosition: Position;
  cellSize: number;
}

const StaticMazeComponent: React.FC<StaticMazeProps> = ({
  maze,
  goalPosition,
  cellSize,
}) => {
  const svgWidth = maze.width * cellSize;
  const svgHeight = maze.height * cellSize;

  console.log('StaticMaze: Rendering static maze structure');

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
            isPlayer={false}
            isGoal={goalPosition.x === x && goalPosition.y === y}
            isAnimating={false}
          />
        ))
      )}
    </svg>
  );
};

export const StaticMaze = React.memo(StaticMazeComponent, (prevProps, nextProps) => {
  // Only re-render if maze structure, goal position, or cell size changes
  return (
    prevProps.maze === nextProps.maze &&
    prevProps.goalPosition.x === nextProps.goalPosition.x &&
    prevProps.goalPosition.y === nextProps.goalPosition.y &&
    prevProps.cellSize === nextProps.cellSize
  );
});

StaticMaze.displayName = 'StaticMaze';