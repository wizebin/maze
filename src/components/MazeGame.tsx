import React, { useState, useCallback, useEffect } from 'react';
import { generateMaze } from '../utils/mazeGenerator';
import { findOptimalMoves } from '../utils/pathfinding';
import type { Position, ChallengeLevel, GameScreenState } from '../types/maze';
import { MazeRenderer } from './MazeRenderer';
import { StartScreen } from './StartScreen';
import { WinScreen } from './WinScreen';
import { useGameControls } from '../hooks/useGameControls';
import { useGameTimer } from '../hooks/useGameTimer';
import { useScoreHistory } from '../hooks/useScoreHistory';

const CHALLENGE_LEVELS: ChallengeLevel[] = [
  {
    id: 'easy',
    name: 'Easy Explorer',
    width: 8,
    height: 6,
    description: 'Perfect for beginners. A small maze to get you started.',
    optimalMoves: 0, // Will be calculated dynamically
  },
  {
    id: 'medium',
    name: 'Maze Walker',
    width: 12,
    height: 8,
    description: 'A moderate challenge with more twists and turns.',
    optimalMoves: 0, // Will be calculated dynamically
  },
  {
    id: 'hard',
    name: 'Labyrinth Master',
    width: 16,
    height: 12,
    description: 'A complex maze that will test your navigation skills.',
    optimalMoves: 0, // Will be calculated dynamically
  },
  {
    id: 'expert',
    name: 'Maze Legend',
    width: 20,
    height: 15,
    description: 'The ultimate challenge for maze solving experts.',
    optimalMoves: 0, // Will be calculated dynamically
  },
  {
    id: 'nightmare',
    name: 'Nightmare Navigator',
    width: 25,
    height: 20,
    description: 'An enormous maze that will push your skills to the limit.',
    optimalMoves: 0, // Will be calculated dynamically
  },
  {
    id: 'impossible',
    name: 'Impossible Odyssey',
    width: 30,
    height: 25,
    description: 'The ultimate test of patience and pathfinding prowess.',
    optimalMoves: 0, // Will be calculated dynamically
  },
  {
    id: 'godlike',
    name: 'Godlike Gauntlet',
    width: 40,
    height: 30,
    description: 'Reserved for the truly elite. Can you conquer the unconquerable?',
    optimalMoves: 0, // Will be calculated dynamically
  },
];

export const MazeGame: React.FC = () => {
  const [gameScreen, setGameScreen] = useState<GameScreenState>('menu');
  const [currentLevel, setCurrentLevel] = useState<ChallengeLevel | null>(null);
  const [maze, setMaze] = useState(() => generateMaze(8, 6));
  const [playerPosition, setPlayerPosition] = useState<Position>({ x: 0, y: 0 });
  const [goalPosition, setGoalPosition] = useState<Position>({ x: 7, y: 5 });
  const [gameWon, setGameWon] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animatedPosition, setAnimatedPosition] = useState<Position>(playerPosition);
  
  const { scoreHistory, addScore } = useScoreHistory();
  const {
    time,
    moves,
    isRunning,
    startTimer,
    stopTimer,
    resetTimer,
    incrementMoves,
    resetMoves,
  } = useGameTimer();

  const handleStartGame = useCallback((level: ChallengeLevel) => {
    const newMaze = generateMaze(level.width, level.height);
    const startPos = { x: 0, y: 0 };
    const endPos = { x: level.width - 1, y: level.height - 1 };
    
    // Calculate actual optimal moves for this specific maze
    const optimalMoves = findOptimalMoves(newMaze, startPos, endPos);
    const levelWithOptimalMoves = { ...level, optimalMoves };
    
    setCurrentLevel(levelWithOptimalMoves);
    setMaze(newMaze);
    setPlayerPosition(startPos);
    setGoalPosition(endPos);
    setAnimatedPosition(startPos);
    setGameWon(false);
    resetTimer();
    resetMoves();
    setGameScreen('playing');
  }, [resetTimer, resetMoves]);

  const handleWin = useCallback(() => {
    if (!currentLevel) return;
    
    setGameWon(true);
    stopTimer();
    
    // Add score to history
    const score = addScore(currentLevel.id, time, moves, currentLevel.optimalMoves);
    
    // Switch to finished screen after a delay
    setTimeout(() => {
      setGameScreen('finished');
    }, 2000);
  }, [currentLevel, stopTimer, time, moves, addScore]);

  const handleBackToMenu = useCallback(() => {
    setGameScreen('menu');
    setCurrentLevel(null);
    resetTimer();
    resetMoves();
    setGameWon(false);
  }, [resetTimer, resetMoves]);

  const handlePlayAgain = useCallback(() => {
    if (!currentLevel) return;
    handleStartGame(currentLevel);
  }, [currentLevel, handleStartGame]);

  useGameControls({
    playerPosition,
    setPlayerPosition,
    maze,
    goalPosition,
    onWin: handleWin,
    onMove: useCallback(() => {
      incrementMoves();
      if (!isRunning) {
        startTimer();
      }
    }, [incrementMoves, isRunning, startTimer]),
    isAnimating,
    setIsAnimating,
    setAnimatedPosition,
  });

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (gameScreen === 'playing') {
        if (event.key === 'r' || event.key === 'R') {
          handlePlayAgain();
        } else if (event.key === 'Escape') {
          handleBackToMenu();
        }
      } else if (gameScreen === 'finished' && event.key === 'Escape') {
        handleBackToMenu();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameScreen, handlePlayAgain, handleBackToMenu]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (gameScreen === 'menu') {
    return (
      <StartScreen
        challengeLevels={CHALLENGE_LEVELS}
        scoreHistory={scoreHistory}
        onStartGame={handleStartGame}
      />
    );
  }

  if (gameScreen === 'finished' && currentLevel) {
    // Use the same calculation as the score history hook
    const timeInSeconds = time / 1000;
    const currentScore = (currentLevel.optimalMoves / (moves * timeInSeconds)) * 10000;

    return (
      <WinScreen
        level={currentLevel}
        time={time}
        moves={moves}
        currentScore={currentScore}
        scoreHistory={scoreHistory}
        onPlayAgain={handlePlayAgain}
        onBackToMenu={handleBackToMenu}
      />
    );
  }

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
      {/* Header with level info and stats */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          maxWidth: '1000px',
          marginBottom: '20px',
          padding: '0 20px',
        }}
      >
        <div style={{ color: '#9B7AA8', fontSize: '18px', fontWeight: '600' }}>
          {currentLevel?.name}
        </div>
        
        <div style={{ display: 'flex', gap: '32px', color: '#9B7AA8', fontSize: '16px' }}>
          <div>Time: {formatTime(time)}</div>
          <div>Moves: {moves}</div>
          <div>Target: {currentLevel?.optimalMoves}</div>
        </div>

        <button
          onClick={handleBackToMenu}
          style={{
            padding: '8px 16px',
            backgroundColor: '#FFB3BA',
            color: '#8B0000',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          Menu
        </button>
      </div>
      
      <div style={{ position: 'relative' }}>
        <MazeRenderer
          maze={maze}
          playerPosition={playerPosition}
          animatedPosition={animatedPosition}
          goalPosition={goalPosition}
          cellSize={currentLevel ? Math.min(50, Math.max(15, 800 / currentLevel.width)) : 50}
          isAnimating={isAnimating}
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
        <p style={{ marginBottom: '16px' }}>Press R to restart • Escape for menu</p>
        
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
            🎉 You Won! Calculating score...
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