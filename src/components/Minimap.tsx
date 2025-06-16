import React from 'react';
import type { Maze, Position } from '../types/maze';

interface MinimapProps {
  maze: Maze;
  playerPosition: Position;
  goalPosition: Position;
}

export const Minimap: React.FC<MinimapProps> = ({ maze, playerPosition, goalPosition }) => {
  const cellSize = 6;
  const svgWidth = maze.width * cellSize;
  const svgHeight = maze.height * cellSize;

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: '#FFF5E6',
        padding: '8px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        border: '2px solid #D4B5FF',
      }}
    >
      <svg width={svgWidth} height={svgHeight}>
        {maze.cells.map((row, y) =>
          row.map((cell, x) => (
            <g key={`${x}-${y}`} transform={`translate(${x * cellSize}, ${y * cellSize})`}>
              <rect
                x={0}
                y={0}
                width={cellSize}
                height={cellSize}
                fill="#F5E6FF"
                stroke="none"
              />
              {cell.walls.top && (
                <line
                  x1={0}
                  y1={0}
                  x2={cellSize}
                  y2={0}
                  stroke="#9B7AA8"
                  strokeWidth="1"
                />
              )}
              {cell.walls.right && (
                <line
                  x1={cellSize}
                  y1={0}
                  x2={cellSize}
                  y2={cellSize}
                  stroke="#9B7AA8"
                  strokeWidth="1"
                />
              )}
              {cell.walls.bottom && (
                <line
                  x1={0}
                  y1={cellSize}
                  x2={cellSize}
                  y2={cellSize}
                  stroke="#9B7AA8"
                  strokeWidth="1"
                />
              )}
              {cell.walls.left && (
                <line
                  x1={0}
                  y1={0}
                  x2={0}
                  y2={cellSize}
                  stroke="#9B7AA8"
                  strokeWidth="1"
                />
              )}
            </g>
          ))
        )}
        
        <rect
          x={goalPosition.x * cellSize + 1}
          y={goalPosition.y * cellSize + 1}
          width={cellSize - 2}
          height={cellSize - 2}
          fill="#BAFFC9"
          stroke="none"
        />
        
        <circle
          cx={playerPosition.x * cellSize + cellSize / 2}
          cy={playerPosition.y * cellSize + cellSize / 2}
          r={cellSize / 3}
          fill="#FFB3BA"
          stroke="none"
        />
      </svg>
    </div>
  );
};