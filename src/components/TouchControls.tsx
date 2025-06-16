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

  const handleTouch = (event: React.TouchEvent | React.MouseEvent, direction: Direction) => {
    event.preventDefault();
    console.log('TouchControls: Touch for direction:', direction);
    setActiveDirection(direction);
    onDirectionPress(direction);
    
    // Clear active state after a short delay for visual feedback
    setTimeout(() => setActiveDirection(null), 150);
  };

  const getTouchDirection = (event: React.TouchEvent | React.MouseEvent): Direction => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const touch = 'touches' in event ? event.touches[0] : event;
    
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    // Convert to relative coordinates (0-1)
    const relX = x / rect.width;
    const relY = y / rect.height;
    
    // Define regions with some overlap for better UX
    // Create diamond-shaped regions that prioritize corners
    const centerX = 0.5;
    const centerY = 0.5;
    const deltaX = relX - centerX;
    const deltaY = relY - centerY;
    
    // Use Manhattan distance to determine direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  };

  const DirectionalRegion: React.FC<{
    direction: Direction;
    style: React.CSSProperties;
  }> = ({ direction, style }) => {
    const isActive = activeDirection === direction;
    
    return (
      <div
        style={{
          position: 'absolute',
          backgroundColor: isActive ? 'rgba(155, 122, 168, 0.15)' : 'transparent',
          transition: 'background-color 0.1s ease',
          cursor: 'pointer',
          userSelect: 'none',
          ...style,
        }}
        onMouseDown={(e) => {
          const detectedDirection = getTouchDirection(e);
          if (detectedDirection === direction) {
            handleTouch(e, direction);
          }
        }}
        onTouchStart={(e) => {
          const detectedDirection = getTouchDirection(e);
          if (detectedDirection === direction) {
            handleTouch(e, direction);
          }
        }}
      >
        {/* Optional: Add subtle directional indicator */}
        {isActive && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: 'clamp(16px, 3vw, 24px)',
              color: 'rgba(155, 122, 168, 0.8)',
              pointerEvents: 'none',
            }}
          >
            {direction === 'up' && '↑'}
            {direction === 'right' && '→'}
            {direction === 'down' && '↓'}
            {direction === 'left' && '←'}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: svgWidth,
        height: svgHeight,
        pointerEvents: 'auto',
      }}
      onMouseDown={(e) => {
        const direction = getTouchDirection(e);
        handleTouch(e, direction);
      }}
      onTouchStart={(e) => {
        const direction = getTouchDirection(e);
        handleTouch(e, direction);
      }}
    >
      {/* Top region */}
      <DirectionalRegion
        direction="up"
        style={{
          top: 0,
          left: '25%',
          width: '50%',
          height: '40%',
          clipPath: 'polygon(20% 0%, 80% 0%, 60% 100%, 40% 100%)',
        }}
      />

      {/* Right region */}
      <DirectionalRegion
        direction="right"
        style={{
          top: '25%',
          right: 0,
          width: '40%',
          height: '50%',
          clipPath: 'polygon(0% 20%, 100% 0%, 100% 80%, 0% 60%)',
        }}
      />

      {/* Bottom region */}
      <DirectionalRegion
        direction="down"
        style={{
          bottom: 0,
          left: '25%',
          width: '50%',
          height: '40%',
          clipPath: 'polygon(40% 0%, 60% 0%, 80% 100%, 20% 100%)',
        }}
      />

      {/* Left region */}
      <DirectionalRegion
        direction="left"
        style={{
          top: '25%',
          left: 0,
          width: '40%',
          height: '50%',
          clipPath: 'polygon(0% 0%, 100% 20%, 100% 60%, 0% 80%)',
        }}
      />

      {/* Fallback: Full maze overlay for any missed touches */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'auto',
          zIndex: -1, // Behind the directional regions
        }}
        onMouseDown={(e) => {
          const direction = getTouchDirection(e);
          handleTouch(e, direction);
        }}
        onTouchStart={(e) => {
          const direction = getTouchDirection(e);
          handleTouch(e, direction);
        }}
      />

      {/* Mobile hint text */}
      <div
        style={{
          position: 'absolute',
          bottom: -40,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: 'clamp(10px, 2vw, 12px)',
          color: '#9B7AA8',
          opacity: 0.7,
          pointerEvents: 'none',
        }}
      >
        Tap maze to move
      </div>
    </div>
  );
};
