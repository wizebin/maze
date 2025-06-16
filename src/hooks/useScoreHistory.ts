import { useState, useEffect, useCallback } from 'react';
import type { GameScore } from '../types/maze';

const STORAGE_KEY = 'maze-game-scores';

export const useScoreHistory = () => {
  const [scoreHistory, setScoreHistory] = useState<GameScore[]>([]);

  // Load scores from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const scores = JSON.parse(stored) as GameScore[];
        setScoreHistory(scores);
      }
    } catch (error) {
      console.warn('Failed to load score history:', error);
    }
  }, []);

  // Save scores to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scoreHistory));
    } catch (error) {
      console.warn('Failed to save score history:', error);
    }
  }, [scoreHistory]);

  const calculateScore = useCallback((time: number, moves: number, optimalMoves: number): number => {
    // Score = (Optimal Moves ÷ (Your Moves × Time in seconds)) × 10,000
    // Multiply by 10,000 to get scores in a more readable range (e.g., 250-5000)
    const timeInSeconds = time / 1000;
    const baseScore = optimalMoves / (moves * timeInSeconds);
    return baseScore * 10000;
  }, []);

  const addScore = useCallback((
    level: string,
    time: number,
    moves: number,
    optimalMoves: number
  ): GameScore => {
    const score = calculateScore(time, moves, optimalMoves);
    const newScore: GameScore = {
      level,
      time,
      moves,
      score,
      timestamp: Date.now(),
    };

    setScoreHistory(prev => {
      const updated = [...prev, newScore];
      // Keep only the last 100 scores per level to prevent storage bloat
      const levelScores = updated.filter(s => s.level === level);
      if (levelScores.length > 100) {
        const otherScores = updated.filter(s => s.level !== level);
        const recentLevelScores = levelScores
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 100);
        return [...otherScores, ...recentLevelScores];
      }
      return updated;
    });

    return newScore;
  }, [calculateScore]);

  const getBestScore = useCallback((level: string): number | null => {
    const levelScores = scoreHistory.filter(score => score.level === level);
    return levelScores.length > 0 
      ? Math.max(...levelScores.map(score => score.score))
      : null;
  }, [scoreHistory]);

  const clearHistory = useCallback(() => {
    setScoreHistory([]);
  }, []);

  return {
    scoreHistory,
    addScore,
    getBestScore,
    calculateScore,
    clearHistory,
  };
};