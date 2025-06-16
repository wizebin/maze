import React from 'react';
import type { Cell } from '../types/maze';

interface MazeCellProps {
  cell: Cell;
  cellSize: number;
  isPlayer: boolean;
  isGoal: boolean;
}

export const MazeCell: React.FC<MazeCellProps> = ({ cell, cellSize, isPlayer, isGoal }) => {
  const wallThickness = 4;
  const shadowOffset = 3;
  const wallHeight = 8;

  return (
    <g transform={`translate(${cell.x * cellSize}, ${cell.y * cellSize})`}>
      <rect
        x={0}
        y={0}
        width={cellSize}
        height={cellSize}
        fill="#F5E6FF"
        stroke="none"
      />

      {cell.walls.top && (
        <>
          <rect
            x={0}
            y={0}
            width={cellSize}
            height={wallThickness}
            fill="#9B7AA8"
          />
          <rect
            x={shadowOffset}
            y={wallThickness}
            width={cellSize}
            height={wallHeight}
            fill="#00000020"
          />
        </>
      )}

      {cell.walls.right && (
        <>
          <rect
            x={cellSize - wallThickness}
            y={0}
            width={wallThickness}
            height={cellSize}
            fill="#9B7AA8"
          />
          <rect
            x={cellSize}
            y={shadowOffset}
            width={wallHeight}
            height={cellSize}
            fill="#00000020"
          />
        </>
      )}

      {cell.walls.bottom && (
        <>
          <rect
            x={0}
            y={cellSize - wallThickness}
            width={cellSize}
            height={wallThickness}
            fill="#9B7AA8"
          />
          <rect
            x={shadowOffset}
            y={cellSize}
            width={cellSize}
            height={wallHeight}
            fill="#00000020"
          />
        </>
      )}

      {cell.walls.left && (
        <>
          <rect
            x={0}
            y={0}
            width={wallThickness}
            height={cellSize}
            fill="#9B7AA8"
          />
          <rect
            x={wallThickness}
            y={shadowOffset}
            width={wallHeight}
            height={cellSize}
            fill="#00000020"
          />
        </>
      )}

      {isPlayer && (
        <g>
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
      )}

      {isGoal && (
        <g>
          <rect
            x={cellSize / 4}
            y={cellSize / 4}
            width={cellSize / 2}
            height={cellSize / 2}
            fill="#BAFFC9"
            stroke="#7FE896"
            strokeWidth="2"
            transform={`rotate(45, ${cellSize / 2}, ${cellSize / 2})`}
          />
          <polygon
            points={`${cellSize / 2 + 2},${cellSize / 2 + cellSize / 4 + 2} ${cellSize / 2 + cellSize / 4 + 2},${cellSize / 2 + cellSize / 4 + 2} ${cellSize / 2 + cellSize / 8 + 2},${cellSize / 2 + cellSize / 3 + 2}`}
            fill="#00000030"
          />
        </g>
      )}
    </g>
  );
};