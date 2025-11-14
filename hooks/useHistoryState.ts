import { useState, useCallback } from 'react';

export const useHistoryState = <T>(initialState: T) => {
  const [history, setHistory] = useState<T[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const setState = useCallback((newState: T | ((prevState: T) => T), overwrite = false) => {
    setHistory(prevHistory => {
      const currentState = prevHistory[currentIndex];
      const nextState = typeof newState === 'function' 
        // @ts-ignore
        ? newState(currentState) 
        : newState;

      // Prevent adding a new state if it's identical to the current one
      if (!overwrite && JSON.stringify(nextState) === JSON.stringify(currentState)) {
          return prevHistory;
      }

      const newHistory = prevHistory.slice(0, currentIndex + 1);
      newHistory.push(nextState);
      setCurrentIndex(newHistory.length - 1);
      return newHistory;
    });
  }, [currentIndex]);
  
  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prevIndex => prevIndex - 1);
    }
  }, [currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prevIndex => prevIndex + 1);
    }
  }, [currentIndex, history.length]);

  return {
    state: history[currentIndex],
    setState,
    undo,
    redo,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
  };
};