import React from 'react';
import type { Position } from '../types/maze';

interface PlayerProps {
  animatedPosition: Position;
  cellSize: number;
  isAnimating?: boolean;
}

const PlayerComponent: React.FC<PlayerProps> = ({
  animatedPosition,
  cellSize,
  isAnimating,
}) => {
  // console.log('Player: Rendering player at position:', animatedPosition);

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: cellSize,
        height: cellSize,
        transform: `translate(${animatedPosition.x * cellSize}px, ${animatedPosition.y * cellSize}px)`,
        pointerEvents: 'none',
        transition: isAnimating ? 'none' : 'transform 0.1s ease-out',
        zIndex: 10,
        willChange: 'transform', // Optimize for frequent transform changes
      }}
    >
      <svg
        width={cellSize}
        height={cellSize}
        style={{
          overflow: 'visible',
        }}
      >
        {/* Player circle */}
        <circle
          cx={cellSize / 2}
          cy={cellSize / 2}
          r={cellSize / 3}
          fill="#FFB3BA"
          stroke="#FF6B7A"
          strokeWidth="2"
        />
        
        {/* Shadow */}
        <ellipse
          cx={cellSize / 2 + 2}
          cy={cellSize / 2 + cellSize / 3 + 2}
          rx={cellSize / 4}
          ry={cellSize / 8}
          fill="#00000030"
        />
      </svg>
    </div>
  );
};

export const Player = React.memo(PlayerComponent, (prevProps, nextProps) => {
  // Only re-render if position, cell size, or animation state changes
  return (
    prevProps.animatedPosition.x === nextProps.animatedPosition.x &&
    prevProps.animatedPosition.y === nextProps.animatedPosition.y &&
    prevProps.cellSize === nextProps.cellSize &&
    prevProps.isAnimating === nextProps.isAnimating
  );
});

Player.displayName = 'Player';