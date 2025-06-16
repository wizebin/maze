import { useState, useEffect, useRef, useCallback } from 'react';

interface UseGameTimerReturn {
  time: number;
  moves: number;
  isRunning: boolean;
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  incrementMoves: () => void;
  resetMoves: () => void;
}

export const useGameTimer = (): UseGameTimerReturn => {
  const [time, setTime] = useState(0);
  const [moves, setMoves] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const startTimer = useCallback(() => {
    if (!isRunning) {
      startTimeRef.current = Date.now() - time;
      setIsRunning(true);
    }
  }, [isRunning, time]);

  const stopTimer = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resetTimer = useCallback(() => {
    setTime(0);
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const incrementMoves = useCallback(() => {
    setMoves(prev => prev + 1);
  }, []);

  const resetMoves = useCallback(() => {
    setMoves(0);
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(Date.now() - startTimeRef.current);
      }, 10);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  return {
    time,
    moves,
    isRunning,
    startTimer,
    stopTimer,
    resetTimer,
    incrementMoves,
    resetMoves,
  };
};