/**
 * Performance optimizations and utilities
 */

import { useCallback, useRef, useMemo } from 'react';
import { GameState, ChessPiece, Position } from '@/types/chess';

/**
 * Debounce hook for performance optimization
 */
export const useDebounce = (callback: (...args: unknown[]) => void, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: unknown[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    },
    [callback, delay]
  );
};

/**
 * Memoized board state for preventing unnecessary re-renders
 */
export const useMemoizedBoard = (gameState: GameState) => {
  return useMemo(() => {
    return {
      board: gameState.board,
      currentTurn: gameState.currentTurn,
      isInCheck: gameState.isInCheck,
      lastMove: gameState.lastMove,
    };
  }, [
    gameState.board,
    gameState.currentTurn,
    gameState.isInCheck,
    gameState.lastMove,
  ]);
};

/**
 * Optimized piece movement validation
 */
export const usePieceValidation = (gameState: GameState) => {
  return useMemo(() => {
    const validMovesCache = new Map<string, Position[]>();
    
    return {
      getValidMoves: (piece: ChessPiece) => {
        const cacheKey = `${piece.id}-${gameState.moves.length}`;
        if (validMovesCache.has(cacheKey)) {
          return validMovesCache.get(cacheKey)!;
        }
        
        // Calculate valid moves (this would use the chess engine)
        const validMoves: Position[] = []; // Placeholder
        validMovesCache.set(cacheKey, validMoves);
        return validMoves;
      },
      clearCache: () => validMovesCache.clear(),
    };
  }, [gameState.moves.length]);
};

/**
 * Throttle function for limiting rapid function calls
 */
export const throttle = (func: (...args: unknown[]) => void, limit: number) => {
  let inThrottle: boolean;
  return function(this: unknown, ...args: unknown[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Check if device is mobile for responsive optimizations
 */
export const useIsMobile = () => {
  return useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  }, []);
};

/**
 * Responsive breakpoint hook
 */
export const useBreakpoint = () => {
  return useMemo(() => {
    if (typeof window === 'undefined') {
      return { isMobile: false, isTablet: false, isDesktop: true };
    }
    
    const width = window.innerWidth;
    return {
      isMobile: width < 640,
      isTablet: width >= 640 && width < 1024,
      isDesktop: width >= 1024,
    };
  }, []);
};