import React from 'react';
import type { Maze, Position } from '../types/maze';
import { MazeCell } from './MazeCell';

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
            isPlayer={false}
            isGoal={goalPosition.x === x && goalPosition.y === y}
            isAnimating={false}
          />
        ))
      )}
      
      {/* Render animated player separately */}
      <g transform={`translate(${animatedPosition.x * cellSize}, ${animatedPosition.y * cellSize})`}>
        <circle
          cx={cellSize / 2}
          cy={cellSize / 2}
          r={cellSize / 3}
          fill="#FFB3BA"
          stroke="#FF6B7A"
          strokeWidth="2"
        />
        <ellipse
          cx={cellSize / 2 + 2}
          cy={cellSize / 2 + cellSize / 3 + 2}
          rx={cellSize / 4}
          ry={cellSize / 8}
          fill="#00000030"
        />
      </g>
    </svg>
  );
};