import React, { useState, useCallback, useEffect } from 'react';
import { generateMaze } from '../utils/mazeGenerator';
import type { Position } from '../types/maze';
import { MazeRenderer } from './MazeRenderer';
import { Minimap } from './Minimap';
import { useGameControls } from '../hooks/useGameControls';

export const MazeGame: React.FC = () => {
  const [mazeSize] = useState({ width: 15, height: 10 });
  const [maze, setMaze] = useState(() => generateMaze(mazeSize.width, mazeSize.height));
  const [playerPosition, setPlayerPosition] = useState<Position>({ x: 0, y: 0 });
  const [goalPosition] = useState<Position>({ 
    x: mazeSize.width - 1, 
    y: mazeSize.height - 1 
  });
  const [gameWon, setGameWon] = useState(false);

  const handleWin = useCallback(() => {
    setGameWon(true);
  }, []);

  const resetGame = useCallback(() => {
    setMaze(generateMaze(mazeSize.width, mazeSize.height));
    setPlayerPosition({ x: 0, y: 0 });
    setGameWon(false);
  }, [mazeSize.width, mazeSize.height]);

  useGameControls({
    playerPosition,
    setPlayerPosition,
    maze,
    goalPosition,
    onWin: handleWin,
  });

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'r' || event.key === 'R') {
        resetGame();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [resetGame]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#FFE5F1',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <h1
        style={{
          color: '#9B7AA8',
          marginBottom: '24px',
          fontSize: '36px',
          fontWeight: '300',
          letterSpacing: '2px',
        }}
      >
        Maze Game
      </h1>
      
      <div style={{ position: 'relative' }}>
        <MazeRenderer
          maze={maze}
          playerPosition={playerPosition}
          goalPosition={goalPosition}
          cellSize={50}
        />
        
        <Minimap
          maze={maze}
          playerPosition={playerPosition}
          goalPosition={goalPosition}
        />
      </div>

      <div
        style={{
          marginTop: '24px',
          textAlign: 'center',
          color: '#9B7AA8',
        }}
      >
        <p style={{ marginBottom: '8px' }}>Use arrow keys to navigate</p>
        <p style={{ marginBottom: '16px' }}>Press R to generate a new maze</p>
        
        {gameWon && (
          <div
            style={{
              padding: '16px 32px',
              backgroundColor: '#BAFFC9',
              borderRadius: '8px',
              color: '#4A7C59',
              fontWeight: 'bold',
              fontSize: '20px',
              animation: 'fadeIn 0.5s ease-in',
            }}
          >
            🎉 You Won! Press R for a new maze
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};