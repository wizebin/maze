import React, { useState, useCallback, useEffect, useRef } from 'react';
import { generateMaze } from '../utils/mazeGenerator';
import { findOptimalMoves } from '../utils/pathfinding';
import type { Position, ChallengeLevel, GameScreenState } from '../types/maze';
import { MazeRenderer } from './MazeRenderer';
import { TouchControls } from './TouchControls';
import { StartScreen } from './StartScreen';
import { WinScreen } from './WinScreen';
import { SettingsScreen } from './SettingsScreen';
import { useGameControls } from '../hooks/useGameControls';
import { useGameTimer } from '../hooks/useGameTimer';
import { useScoreHistory } from '../hooks/useScoreHistory';
import { useMazeSize } from '../hooks/useMazeSize';

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

  const { scoreHistory, addScore, clearHistory } = useScoreHistory();
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

  // Calculate responsive maze size
  const { cellSize, containerPadding } = useMazeSize({
    mazeWidth: maze.width,
    mazeHeight: maze.height,
  });

  const handleStartGame = useCallback((level: ChallengeLevel) => {
    const newMaze = generateMaze(level.width, level.height);
    const startPos = { x: 0, y: 0 };
    const endPos = { x: level.width - 1, y: level.height - 1 };

    console.log('MazeGame: Starting new game with start pos:', startPos, 'end pos:', endPos);

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
    console.log('MazeGame: handleWin called');
    if (!currentLevel) {
      console.log('MazeGame: No current level, returning');
      return;
    }

    console.log('MazeGame: Setting game won to true');
    setGameWon(true);
    stopTimer();

    // Add score to history
    const score = addScore(currentLevel.id, time, moves, currentLevel.optimalMoves);
    console.log('MazeGame: Score added:', score);

    // Switch to finished screen after a delay
    setTimeout(() => {
      console.log('MazeGame: Switching to finished screen');
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

  const handleOpenSettings = useCallback(() => {
    setGameScreen('settings');
  }, []);

  const handleClearScores = useCallback(() => {
    clearHistory();
  }, [clearHistory]);

  const isRunningRef = useRef(isRunning);
  isRunningRef.current = isRunning;

  const handleMove = useCallback(() => {
    console.log('MazeGame: Move made, incrementing moves');
    incrementMoves();
    if (!isRunningRef.current) {
      console.log('MazeGame: Starting timer');
      startTimer();
    }
  }, [incrementMoves, startTimer]);

  const { handleDirectionInput } = useGameControls({
    playerPosition,
    setPlayerPosition,
    maze,
    goalPosition,
    onWin: handleWin,
    onMove: handleMove,
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
        onOpenSettings={handleOpenSettings}
      />
    );
  }

  if (gameScreen === 'settings') {
    return (
      <SettingsScreen
        scoreHistory={scoreHistory}
        onClearScores={handleClearScores}
        onBackToMenu={handleBackToMenu}
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
        backgroundColor: '#FFE5F1',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        height: '100%',
        width: '100%',
        maxWidth: '100vw',
        overflowY: 'auto',
        overflowX: 'hidden', // Prevent horizontal scrolling
        boxSizing: 'border-box',
      }}
    >
      {/* Header with level info and stats */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          maxWidth: '100vw',
          marginBottom: '20px',
          padding: '0 clamp(10px, 3vw, 20px)',
          boxSizing: 'border-box',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ color: '#9B7AA8', fontSize: 'clamp(14px, 4vw, 18px)', fontWeight: '600' }}>
          {currentLevel?.name}
        </div>

        <div style={{ display: 'flex', gap: 'clamp(8px, 4vw, 32px)', color: '#9B7AA8', fontSize: 'clamp(12px, 3vw, 16px)', flexWrap: 'wrap' }}>
          <div>Time: {formatTime(time)}</div>
          <div>Moves: {moves}</div>
          <div>Target: {currentLevel?.optimalMoves}</div>
        </div>

        <button
          onClick={handleBackToMenu}
          style={{
            padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 3vw, 16px)',
            backgroundColor: '#FFB3BA',
            color: '#8B0000',
            border: 'none',
            borderRadius: 'clamp(4px, 1vw, 6px)',
            fontSize: 'clamp(12px, 2.5vw, 14px)',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          Menu
        </button>
      </div>

      <div 
        style={{ 
          position: 'relative', 
          padding: containerPadding,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '0', // Allow shrinking
        }}
      >
        <div style={{ position: 'relative' }}>
          <MazeRenderer
            maze={maze}
            playerPosition={playerPosition}
            animatedPosition={animatedPosition}
            goalPosition={goalPosition}
            cellSize={cellSize}
            isAnimating={isAnimating}
          />

          {currentLevel && (
            <TouchControls
              mazeWidth={maze.width}
              mazeHeight={maze.height}
              cellSize={cellSize}
              onDirectionPress={(direction) => {
                console.log('MazeGame: TouchControls onDirectionPress called with:', direction);
                console.log('MazeGame: handleDirectionInput is:', handleDirectionInput);
                handleDirectionInput(direction);
              }}
            />
          )}
        </div>
      </div>

      <div
        style={{
          marginTop: 'clamp(12px, 3vw, 24px)',
          textAlign: 'center',
          color: '#9B7AA8',
          padding: '0 clamp(10px, 3vw, 20px)',
          maxWidth: '100vw',
          boxSizing: 'border-box',
        }}
      >
        <p style={{ marginBottom: '8px', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>Use arrow keys or tap the circles to navigate</p>
        <p style={{ marginBottom: '16px', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>Press R to restart • Escape for menu</p>

        {gameWon && (
          <div
            style={{
              padding: 'clamp(12px, 3vw, 16px) clamp(16px, 4vw, 32px)',
              backgroundColor: '#BAFFC9',
              borderRadius: 'clamp(6px, 1.5vw, 8px)',
              color: '#4A7C59',
              fontWeight: 'bold',
              fontSize: 'clamp(16px, 4vw, 20px)',
              animation: 'fadeIn 0.5s ease-in',
              maxWidth: '100%',
              wordWrap: 'break-word',
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
