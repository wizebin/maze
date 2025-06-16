import { useEffect, useRef, useCallback } from 'react';
import type { Position, Maze } from '../types/maze';

interface UseGameControlsProps {
  playerPosition: Position;
  setPlayerPosition: (position: Position) => void;
  maze: Maze;
  goalPosition: Position;
  onWin: () => void;
  isAnimating: boolean;
  setIsAnimating: (animating: boolean) => void;
  setAnimatedPosition: (position: Position) => void;
}

type Direction = 'up' | 'right' | 'down' | 'left';

const findNextIntersection = (maze: Maze, startX: number, startY: number, direction: Direction): Position => {
  let currentX = startX;
  let currentY = startY;
  
  while (true) {
    const currentCell = maze.cells[currentY][currentX];
    let canMove = false;
    let nextX = currentX;
    let nextY = currentY;
    
    // Check if we can move in the requested direction
    switch (direction) {
      case 'up':
        if (!currentCell.walls.top && currentY > 0) {
          nextY = currentY - 1;
          canMove = true;
        }
        break;
      case 'right':
        if (!currentCell.walls.right && currentX < maze.width - 1) {
          nextX = currentX + 1;
          canMove = true;
        }
        break;
      case 'down':
        if (!currentCell.walls.bottom && currentY < maze.height - 1) {
          nextY = currentY + 1;
          canMove = true;
        }
        break;
      case 'left':
        if (!currentCell.walls.left && currentX > 0) {
          nextX = currentX - 1;
          canMove = true;
        }
        break;
    }
    
    if (!canMove) {
      break;
    }
    
    currentX = nextX;
    currentY = nextY;
    
    // Check if we've reached an intersection (more than 2 open paths)
    const cell = maze.cells[currentY][currentX];
    const openPaths = [
      !cell.walls.top && currentY > 0,
      !cell.walls.right && currentX < maze.width - 1,
      !cell.walls.bottom && currentY < maze.height - 1,
      !cell.walls.left && currentX > 0
    ].filter(Boolean).length;
    
    // Stop at intersections (3+ paths) or dead ends (1 path), but continue through corridors (2 paths)
    if (openPaths !== 2) {
      break;
    }
  }
  
  return { x: currentX, y: currentY };
};

const animatePlayerMovement = (
  startPos: Position,
  endPos: Position,
  setAnimatedPosition: (pos: Position) => void,
  onComplete: () => void
) => {
  const startTime = Date.now();
  const duration = 400; // Animation duration in milliseconds
  
  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function (ease-out)
    const easeOut = 1 - Math.pow(1 - progress, 3);
    
    const currentX = startPos.x + (endPos.x - startPos.x) * easeOut;
    const currentY = startPos.y + (endPos.y - startPos.y) * easeOut;
    
    setAnimatedPosition({ x: currentX, y: currentY });
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      onComplete();
    }
  };
  
  requestAnimationFrame(animate);
};

export const useGameControls = ({
  playerPosition,
  setPlayerPosition,
  maze,
  goalPosition,
  onWin,
  isAnimating,
  setIsAnimating,
  setAnimatedPosition,
}: UseGameControlsProps) => {
  const inputQueueRef = useRef<Direction[]>([]);
  const isProcessingRef = useRef(false);
  const currentPositionRef = useRef<Position>(playerPosition);
  const mazeRef = useRef(maze);
  const goalPositionRef = useRef(goalPosition);
  
  // Keep refs up to date
  currentPositionRef.current = playerPosition;
  mazeRef.current = maze;
  goalPositionRef.current = goalPosition;
  
  const processNextInput = useCallback(() => {
    if (isProcessingRef.current || inputQueueRef.current.length === 0) {
      return;
    }
    
    const direction = inputQueueRef.current.shift()!;
    const currentPos = currentPositionRef.current;
    const newPosition = findNextIntersection(mazeRef.current, currentPos.x, currentPos.y, direction);
    
    if (newPosition.x !== currentPos.x || newPosition.y !== currentPos.y) {
      isProcessingRef.current = true;
      setIsAnimating(true);
      
      animatePlayerMovement(
        currentPos,
        newPosition,
        setAnimatedPosition,
        () => {
          currentPositionRef.current = newPosition;
          setPlayerPosition(newPosition);
          setAnimatedPosition(newPosition);
          setIsAnimating(false);
          isProcessingRef.current = false;
          
          if (newPosition.x === goalPositionRef.current.x && newPosition.y === goalPositionRef.current.y) {
            onWin();
          } else {
            // Process next queued input
            setTimeout(processNextInput, 50);
          }
        }
      );
    } else {
      // If no movement possible, try next input immediately
      setTimeout(processNextInput, 10);
    }
  }, [setPlayerPosition, onWin, setIsAnimating, setAnimatedPosition]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      let direction: Direction | null = null;
      
      switch (event.key) {
        case 'ArrowUp':
          direction = 'up';
          break;
        case 'ArrowRight':
          direction = 'right';
          break;
        case 'ArrowDown':
          direction = 'down';
          break;
        case 'ArrowLeft':
          direction = 'left';
          break;
        default:
          return;
      }
      
      event.preventDefault();
      
      // Add to queue (limit queue size to prevent spam)
      if (inputQueueRef.current.length < 5) {
        inputQueueRef.current.push(direction);
      }
      
      // Process queue
      processNextInput();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [processNextInput]);
};