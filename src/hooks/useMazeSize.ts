import { useState, useEffect } from 'react';

interface UseMazeSizeProps {
  mazeWidth: number;
  mazeHeight: number;
}

interface MazeSizeResult {
  cellSize: number;
  containerPadding: number;
}

export const useMazeSize = ({ mazeWidth, mazeHeight }: UseMazeSizeProps): MazeSizeResult => {
  const [dimensions, setDimensions] = useState<MazeSizeResult>({
    cellSize: 50,
    containerPadding: 20,
  });

  useEffect(() => {
    const calculateOptimalSize = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Account for UI elements
      const headerHeight = 120; // Approximate header height (with wrapping on mobile)
      const footerHeight = 80; // Approximate footer/instructions height
      const mobilePadding = 10; // Base padding
      const touchControlsSpace = 100; // Space needed for touch controls around maze
      
      // Available space for maze content
      const availableWidth = viewportWidth - (mobilePadding * 2) - (touchControlsSpace * 2);
      const availableHeight = viewportHeight - headerHeight - footerHeight - (mobilePadding * 2) - (touchControlsSpace * 2);
      
      // Calculate cell sizes based on constraints
      const cellSizeFromWidth = Math.floor(availableWidth / mazeWidth);
      const cellSizeFromHeight = Math.floor(availableHeight / mazeHeight);
      
      // Use the smaller constraint to ensure maze fits in both dimensions
      const optimalCellSize = Math.min(cellSizeFromWidth, cellSizeFromHeight);
      
      // Set reasonable bounds
      const minCellSize = 12; // Minimum for playability
      const maxCellSize = 60; // Maximum for aesthetics
      const finalCellSize = Math.max(minCellSize, Math.min(maxCellSize, optimalCellSize));
      
      // Calculate container padding based on remaining space
      const mazePixelWidth = mazeWidth * finalCellSize;
      const mazePixelHeight = mazeHeight * finalCellSize;
      const remainingWidth = viewportWidth - mazePixelWidth - (touchControlsSpace * 2);
      const remainingHeight = viewportHeight - mazePixelHeight - headerHeight - footerHeight - (touchControlsSpace * 2);
      
      // Use smaller of the remaining spaces for symmetric padding, but ensure minimum
      const calculatedPadding = Math.max(mobilePadding, Math.min(remainingWidth, remainingHeight) / 4);
      
      console.log('Maze sizing calculation:', {
        viewport: { width: viewportWidth, height: viewportHeight },
        maze: { width: mazeWidth, height: mazeHeight },
        available: { width: availableWidth, height: availableHeight },
        cellSizes: { fromWidth: cellSizeFromWidth, fromHeight: cellSizeFromHeight },
        finalCellSize,
        calculatedPadding: Math.floor(calculatedPadding),
      });
      
      setDimensions({
        cellSize: finalCellSize,
        containerPadding: Math.floor(calculatedPadding),
      });
    };

    // Calculate initial size
    calculateOptimalSize();

    // Recalculate on window resize
    const handleResize = () => calculateOptimalSize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [mazeWidth, mazeHeight]);

  return dimensions;
};