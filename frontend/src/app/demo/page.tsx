/**
 * Demo Page - Showcase the improved chess board and pieces
 * Demonstrates the new SVG pieces and color theme
 */

'use client';

import React, { useState } from 'react';
import { ChessBoard } from '@/components/chess/ChessBoard';
import { chessEngine } from '@/utils/chessEngine';
import { GameState, Position, PieceType } from '@/types/chess';
import { Button } from '@/components/ui/Button';

export default function DemoPage() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const initialState = chessEngine.initializeGame();
    return {
      ...initialState,
      gameStatus: 'playing' // Set to playing so we can interact with pieces
    };
  });

  const handleMove = (from: Position, to: Position, promotionPiece?: PieceType) => {
    try {
      const newGameState = chessEngine.makeMove(gameState, from, to, promotionPiece);
      setGameState(newGameState);
    } catch (error) {
      console.error('Invalid move:', error);
    }
  };

  const resetGame = () => {
    const newState = chessEngine.initializeGame();
    setGameState({
      ...newState,
      gameStatus: 'playing'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#150016] via-[#29104A] to-[#522C5D] flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#FFE3D8] mb-2">
            Chess Board Demo
          </h1>
          <p className="text-[#845162] text-lg">
            New SVG pieces with improved design & color theme
          </p>
        </div>

        {/* Game Info */}
        <div className="text-center space-y-2">
          <p className="text-[#FFE3D8] text-lg">
            Current Turn: <span className="font-bold capitalize text-[#E38681]">
              {gameState.currentTurn}
            </span>
          </p>
          {gameState.isInCheck && (
            <p className="text-red-400 font-bold text-lg">
              CHECK!
            </p>
          )}
          {gameState.gameStatus === 'finished' && (
            <p className="text-[#E38681] font-bold text-xl">
              Game Over: {gameState.gameResult}
            </p>
          )}
        </div>

        {/* Chess Board */}
        <div className="flex justify-center">
          <div className="w-full max-w-lg">
            <ChessBoard
              gameState={gameState}
              isPlayerTurn={true}
              playerColor={gameState.currentTurn}
              onMove={handleMove}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4">
          <Button onClick={resetGame} variant="outline">
            Reset Game
          </Button>
          <Button onClick={() => window.history.back()} variant="secondary">
            Back to Home
          </Button>
        </div>

        {/* Features Showcase */}
        <div className="text-center text-sm text-[#845162] space-y-2">
          <p>✨ Features Demonstrated:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <p>• Clean SVG-based chess pieces</p>
            <p>• Improved color contrast on squares</p>
            <p>• Modern theme with provided palette</p>
            <p>• Enhanced visual feedback</p>
            <p>• Proper check/checkmate detection</p>
            <p>• All chess rules implemented</p>
          </div>
        </div>
      </div>
    </div>
  );
}