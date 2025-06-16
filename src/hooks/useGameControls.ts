import { useEffect } from 'react';
import type { Position, Maze } from '../types/maze';

interface UseGameControlsProps {
  playerPosition: Position;
  setPlayerPosition: (position: Position) => void;
  maze: Maze;
  goalPosition: Position;
  onWin: () => void;
}

export const useGameControls = ({
  playerPosition,
  setPlayerPosition,
  maze,
  goalPosition,
  onWin,
}: UseGameControlsProps) => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const { x, y } = playerPosition;
      const cell = maze.cells[y][x];
      let newX = x;
      let newY = y;

      switch (event.key) {
        case 'ArrowUp':
          if (!cell.walls.top && y > 0) {
            newY = y - 1;
          }
          break;
        case 'ArrowRight':
          if (!cell.walls.right && x < maze.width - 1) {
            newX = x + 1;
          }
          break;
        case 'ArrowDown':
          if (!cell.walls.bottom && y < maze.height - 1) {
            newY = y + 1;
          }
          break;
        case 'ArrowLeft':
          if (!cell.walls.left && x > 0) {
            newX = x - 1;
          }
          break;
        default:
          return;
      }

      if (newX !== x || newY !== y) {
        event.preventDefault();
        setPlayerPosition({ x: newX, y: newY });

        if (newX === goalPosition.x && newY === goalPosition.y) {
          onWin();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [playerPosition, setPlayerPosition, maze, goalPosition, onWin]);
};