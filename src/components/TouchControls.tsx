import React, { useState } from 'react';

type Direction = 'up' | 'right' | 'down' | 'left';

interface TouchControlsProps {
  mazeWidth: number;
  mazeHeight: number;
  cellSize: number;
  onDirectionPress: (direction: Direction) => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  mazeWidth,
  mazeHeight,
  cellSize,
  onDirectionPress,
}) => {
  const [activeDirection, setActiveDirection] = useState<Direction | null>(null);

  const svgWidth = mazeWidth * cellSize;
  const svgHeight = mazeHeight * cellSize;
  const touchZoneSize = Math.min(80, cellSize * 2); // Responsive touch zone size

  const handleTouchStart = (direction: Direction) => {
    setActiveDirection(direction);
    onDirectionPress(direction);
  };

  const handleTouchEnd = () => {
    setActiveDirection(null);
  };

  const getArrowPath = (direction: Direction) => {
    const size = touchZoneSize * 0.3;
    const center = touchZoneSize / 2;
    
    switch (direction) {
      case 'up':
        return `M ${center} ${center - size/2} L ${center + size/2} ${center + size/2} L ${center - size/2} ${center + size/2} Z`;
      case 'right':
        return `M ${center + size/2} ${center} L ${center - size/2} ${center - size/2} L ${center - size/2} ${center + size/2} Z`;
      case 'down':
        return `M ${center} ${center + size/2} L ${center - size/2} ${center - size/2} L ${center + size/2} ${center - size/2} Z`;
      case 'left':
        return `M ${center - size/2} ${center} L ${center + size/2} ${center - size/2} L ${center + size/2} ${center + size/2} Z`;
    }
  };

  const TouchZone: React.FC<{
    direction: Direction;
    x: number;
    y: number;
    style?: React.CSSProperties;
  }> = ({ direction, x, y, style = {} }) => {
    const isActive = activeDirection === direction;
    
    return (
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: touchZoneSize,
          height: touchZoneSize,
          backgroundColor: isActive ? 'rgba(155, 122, 168, 0.3)' : 'rgba(155, 122, 168, 0.15)',
          borderRadius: '50%',
          border: '2px solid rgba(155, 122, 168, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'all 0.1s ease',
          transform: isActive ? 'scale(0.95)' : 'scale(1)',
          boxShadow: isActive 
            ? 'inset 0 2px 4px rgba(0, 0, 0, 0.2)' 
            : '0 2px 8px rgba(0, 0, 0, 0.1)',
          ...style,
        }}
        onMouseDown={() => handleTouchStart(direction)}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
        onTouchStart={(e) => {
          e.preventDefault();
          handleTouchStart(direction);
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          handleTouchEnd();
        }}
      >
        <svg
          width={touchZoneSize * 0.6}
          height={touchZoneSize * 0.6}
          viewBox={`0 0 ${touchZoneSize} ${touchZoneSize}`}
          style={{
            pointerEvents: 'none',
            opacity: isActive ? 0.9 : 0.7,
          }}
        >
          <path
            d={getArrowPath(direction)}
            fill="#9B7AA8"
            stroke="#6B5B73"
            strokeWidth="1"
          />
        </svg>
      </div>
    );
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none', // Allow clicks through to maze
      }}
    >
      {/* Top touch zone */}
      <TouchZone
        direction="up"
        x={(svgWidth - touchZoneSize) / 2}
        y={-touchZoneSize / 2 - 10}
        style={{ pointerEvents: 'auto' }}
      />

      {/* Right touch zone */}
      <TouchZone
        direction="right"
        x={svgWidth + 10}
        y={(svgHeight - touchZoneSize) / 2}
        style={{ pointerEvents: 'auto' }}
      />

      {/* Bottom touch zone */}
      <TouchZone
        direction="down"
        x={(svgWidth - touchZoneSize) / 2}
        y={svgHeight + 10}
        style={{ pointerEvents: 'auto' }}
      />

      {/* Left touch zone */}
      <TouchZone
        direction="left"
        x={-touchZoneSize / 2 - 10}
        y={(svgHeight - touchZoneSize) / 2}
        style={{ pointerEvents: 'auto' }}
      />

      {/* Mobile hint text */}
      <div
        style={{
          position: 'absolute',
          bottom: svgHeight + touchZoneSize + 20,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: '12px',
          color: '#9B7AA8',
          opacity: 0.7,
          pointerEvents: 'none',
        }}
      >
        Tap the circles to move
      </div>
    </div>
  );
};