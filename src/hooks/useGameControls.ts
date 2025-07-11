import { useEffect, useRef, useCallback } from 'react';
import type { Position, Maze } from '../types/maze';

interface UseGameControlsProps {
  playerPosition: Position;
  setPlayerPosition: (position: Position) => void;
  maze: Maze;
  goalPosition: Position;
  onWin: () => void;
  onMove?: () => void;
  isAnimating: boolean;
  setIsAnimating: (animating: boolean) => void;
  setAnimatedPosition: (position: Position) => void;
}

interface UseGameControlsReturn {
  handleDirectionInput: (direction: Direction) => void;
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
  onComplete: () => void,
  cancelRef: { current: boolean }
) => {
  const startTime = Date.now();
  const duration = 400; // Animation duration in milliseconds
  
  const animate = () => {
    if (cancelRef.current) {
      onComplete();
      return;
    }
    
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
  onMove,
  isAnimating,
  setIsAnimating,
  setAnimatedPosition,
}: UseGameControlsProps): UseGameControlsReturn => {
  const inputQueueRef = useRef<Direction[]>([]);
  const isProcessingRef = useRef(false);
  const currentPositionRef = useRef<Position>(playerPosition);
  const mazeRef = useRef(maze);
  const goalPositionRef = useRef(goalPosition);
  const animationCancelRef = useRef(false);
  const onMoveRef = useRef(onMove);
  
  // Keep refs up to date
  currentPositionRef.current = playerPosition;
  mazeRef.current = maze;
  goalPositionRef.current = goalPosition;
  onMoveRef.current = onMove;
  
  const processAllInputsCallback = useCallback(() => {
    console.log('useGameControls: processAllInputs called');
    if (isProcessingRef.current) {
      console.log('useGameControls: Already processing, skipping');
      return;
    }
    
    if (inputQueueRef.current.length === 0) {
      console.log('useGameControls: No inputs to process');
      return;
    }
    
    console.log('useGameControls: Processing', inputQueueRef.current.length, 'inputs');
    
    // Process all inputs to find final destination
    let currentPos = currentPositionRef.current;
    let finalPosition = currentPos;
    const validMoves: Position[] = [];
    
    while (inputQueueRef.current.length > 0) {
      const direction = inputQueueRef.current.shift()!;
      console.log('useGameControls: Processing direction:', direction, 'from position:', currentPos);
      const newPosition = findNextIntersection(mazeRef.current, currentPos.x, currentPos.y, direction);
      console.log('useGameControls: Found next position:', newPosition);
      
      if (newPosition.x !== currentPos.x || newPosition.y !== currentPos.y) {
        validMoves.push(newPosition);
        currentPos = newPosition;
        finalPosition = newPosition;
        console.log('useGameControls: Valid move to:', newPosition);
      } else {
        console.log('useGameControls: Invalid move, staying at:', currentPos);
      }
    }
    
    if (validMoves.length === 0) {
      return;
    }
    
    // Notify that a move was made
    onMoveRef.current?.();
    
    isProcessingRef.current = true;
    setIsAnimating(true);
    
    if (validMoves.length === 1) {
      // Only one move, animate it
      animatePlayerMovement(
        currentPositionRef.current,
        finalPosition,
        setAnimatedPosition,
        () => {
          currentPositionRef.current = finalPosition;
          setPlayerPosition(finalPosition);
          setAnimatedPosition(finalPosition);
          setIsAnimating(false);
          isProcessingRef.current = false;
          
          console.log('useGameControls: Checking victory condition - Final position:', finalPosition, 'Goal position:', goalPositionRef.current);
          if (finalPosition.x === goalPositionRef.current.x && finalPosition.y === goalPositionRef.current.y) {
            console.log('useGameControls: Victory condition met! Calling onWin');
            onWin();
          } else {
            console.log('useGameControls: Victory condition not met');
          }
        },
        animationCancelRef
      );
    } else {
      // Multiple moves, jump to second-to-last immediately, then animate to final
      const secondToLast = validMoves[validMoves.length - 2];
      currentPositionRef.current = secondToLast;
      setPlayerPosition(secondToLast);
      setAnimatedPosition(secondToLast);
      
      // Short delay then animate to final position
      setTimeout(() => {
        animatePlayerMovement(
          secondToLast,
          finalPosition,
          setAnimatedPosition,
          () => {
            currentPositionRef.current = finalPosition;
            setPlayerPosition(finalPosition);
            setAnimatedPosition(finalPosition);
            setIsAnimating(false);
            isProcessingRef.current = false;
            
            console.log('useGameControls: Checking victory condition (multi-move) - Final position:', finalPosition, 'Goal position:', goalPositionRef.current);
            if (finalPosition.x === goalPositionRef.current.x && finalPosition.y === goalPositionRef.current.y) {
              console.log('useGameControls: Victory condition met (multi-move)! Calling onWin');
              onWin();
            } else {
              console.log('useGameControls: Victory condition not met (multi-move)');
            }
          },
          animationCancelRef
        );
      }, 50);
    }
  }, [setPlayerPosition, onWin, setIsAnimating, setAnimatedPosition]);

  const handleDirectionInput = useCallback((direction: Direction) => {
    console.log('useGameControls: Direction input received:', direction);
    console.log('useGameControls: Current position:', currentPositionRef.current);
    console.log('useGameControls: Is processing:', isProcessingRef.current);
    
    // If currently animating, cancel current animation
    if (isProcessingRef.current) {
      console.log('useGameControls: Cancelling current animation');
      animationCancelRef.current = true;
    }
    
    // Add to queue (limit queue size to prevent spam)
    if (inputQueueRef.current.length < 5) {
      inputQueueRef.current.push(direction);
      console.log('useGameControls: Added to queue, queue length:', inputQueueRef.current.length);
    } else {
      console.log('useGameControls: Queue full, ignoring input');
    }
    
    // Process all queued inputs
    setTimeout(() => {
      animationCancelRef.current = false;
      processAllInputsCallback();
    }, 10);
  }, [processAllInputsCallback]);



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
      handleDirectionInput(direction);
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleDirectionInput]);

  return { handleDirectionInput };
};