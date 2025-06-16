import { useState, useEffect } from 'react';

interface UseMazeSizeProps {
  mazeWidth: number;
  mazeHeight: number;
}

interface MazeSizeResult {
  cellSize: number;
  containerPadding: number;
}

const calculateMazeSize = (mazeWidth: number, mazeHeight: number): MazeSizeResult => {
  // Get current viewport dimensions
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 768;
  const isMobile = viewportWidth <= 768;
  
  // Account for UI elements - more aggressive on mobile
  const headerHeight = isMobile ? 100 : 120;
  const footerHeight = isMobile ? 60 : 80;
  const basePadding = isMobile ? 8 : 16;
  
  if (isMobile) {
    // On mobile: prioritize full width usage, minimal padding
    const availableWidth = viewportWidth - (basePadding * 2);
    const availableHeight = viewportHeight - headerHeight - footerHeight - (basePadding * 2);
    
    // Calculate cell size from width constraint (prioritize width on mobile)
    const cellSizeFromWidth = Math.floor(availableWidth / mazeWidth);
    const cellSizeFromHeight = Math.floor(availableHeight / mazeHeight);
    
    // On mobile, prefer width-based sizing but ensure it fits height
    let cellSize = cellSizeFromWidth;
    const requiredHeight = mazeHeight * cellSize;
    
    if (requiredHeight > availableHeight) {
      // If width-based size is too tall, fall back to height constraint
      cellSize = cellSizeFromHeight;
    }
    
    // Set mobile-appropriate bounds
    const minCellSize = 10; // Smaller minimum for mobile
    const maxCellSize = 50; // Reasonable maximum for mobile
    const finalCellSize = Math.max(minCellSize, Math.min(maxCellSize, cellSize));
    
    // Minimal padding on mobile
    const containerPadding = basePadding;
    
    return {
      cellSize: finalCellSize,
      containerPadding,
    };
  } else {
    // Desktop: use existing logic with touch controls space
    const touchControlsSpace = 100;
    const availableWidth = viewportWidth - (basePadding * 2) - (touchControlsSpace * 2);
    const availableHeight = viewportHeight - headerHeight - footerHeight - (basePadding * 2) - (touchControlsSpace * 2);
    
    const cellSizeFromWidth = Math.floor(availableWidth / mazeWidth);
    const cellSizeFromHeight = Math.floor(availableHeight / mazeHeight);
    const optimalCellSize = Math.min(cellSizeFromWidth, cellSizeFromHeight);
    
    const minCellSize = 12;
    const maxCellSize = 60;
    const finalCellSize = Math.max(minCellSize, Math.min(maxCellSize, optimalCellSize));
    
    // Calculate padding based on remaining space
    const mazePixelWidth = mazeWidth * finalCellSize;
    const mazePixelHeight = mazeHeight * finalCellSize;
    const remainingWidth = viewportWidth - mazePixelWidth - (touchControlsSpace * 2);
    const remainingHeight = viewportHeight - mazePixelHeight - headerHeight - footerHeight - (touchControlsSpace * 2);
    const calculatedPadding = Math.max(basePadding, Math.min(remainingWidth, remainingHeight) / 4);
    
    return {
      cellSize: finalCellSize,
      containerPadding: Math.floor(calculatedPadding),
    };
  }
};

export const useMazeSize = ({ mazeWidth, mazeHeight }: UseMazeSizeProps): MazeSizeResult => {
  // Calculate initial dimensions synchronously to prevent flash
  const [dimensions, setDimensions] = useState<MazeSizeResult>(() => 
    calculateMazeSize(mazeWidth, mazeHeight)
  );

  useEffect(() => {
    // Recalculate dimensions
    const newDimensions = calculateMazeSize(mazeWidth, mazeHeight);
    
    // console.log('Maze sizing calculation:', {
    //   viewport: { width: window.innerWidth, height: window.innerHeight },
    //   maze: { width: mazeWidth, height: mazeHeight },
    //   isMobile: window.innerWidth <= 768,
    //   result: newDimensions,
    // });
    
    // Only update if dimensions actually changed
    setDimensions(prevDimensions => {
      if (prevDimensions.cellSize !== newDimensions.cellSize || 
          prevDimensions.containerPadding !== newDimensions.containerPadding) {
        return newDimensions;
      }
      return prevDimensions;
    });

    // Recalculate on window resize
    const handleResize = () => {
      const resizedDimensions = calculateMazeSize(mazeWidth, mazeHeight);
      setDimensions(prevDimensions => {
        if (prevDimensions.cellSize !== resizedDimensions.cellSize || 
            prevDimensions.containerPadding !== resizedDimensions.containerPadding) {
          return resizedDimensions;
        }
        return prevDimensions;
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mazeWidth, mazeHeight]);

  return dimensions;
};