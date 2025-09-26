/**
 * Game Screen Component
 * Main game interface with chessboard and game controls
 */

'use client';

import React, { useState, useCallback } from 'react';
import { ChessBoard } from './ChessBoard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { GameState, Room, Player, Position, Move } from '@/types/chess';

interface GameScreenProps {
  room: Room;
  gameState: GameState;
  currentPlayerId: string;
  onMove: (from: Position, to: Position) => void;
  onLeaveRoom: () => void;
  onResetGame: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  room,
  gameState,
  currentPlayerId,
  onMove,
  onLeaveRoom,
  onResetGame,
}) => {
  const [showMoveHistory, setShowMoveHistory] = useState(false);
  
  const currentPlayer = room.players.find(p => p.id === currentPlayerId);
  const opponent = room.players.find(p => p.id !== currentPlayerId);
  const isPlayerTurn = currentPlayer && gameState.currentTurn === currentPlayer.color;
  const playerColor = currentPlayer?.color || 'white';

  // Handle move with validation
  const handleMove = useCallback((from: Position, to: Position) => {
    if (!isPlayerTurn) return;
    onMove(from, to);
  }, [isPlayerTurn, onMove]);

  // Format move for display
  const formatMove = (move: Move, index: number): string => {
    const fromSquare = `${String.fromCharCode(97 + move.from.col)}${8 - move.from.row}`;
    const toSquare = `${String.fromCharCode(97 + move.to.col)}${8 - move.to.row}`;
    const piece = move.piece.type === 'knight' ? 'N' : move.piece.type.charAt(0).toUpperCase();
    const capture = move.capturedPiece ? 'x' : '';
    const check = gameState.isInCheck && index === gameState.moves.length - 1 ? '+' : '';
    
    return `${Math.floor(index / 2) + 1}${index % 2 === 0 ? '.' : '...'} ${piece}${capture}${toSquare}${check}`;
  };

  // Get game status message
  const getGameStatusMessage = (): { message: string; color: string } => {
    if (gameState.gameStatus === 'finished') {
      if (gameState.gameResult === 'draw') {
        return { message: 'Game ended in a draw', color: 'text-yellow-400' };
      } else if (gameState.gameResult === 'white-wins') {
        return { 
          message: playerColor === 'white' ? 'You won!' : 'You lost!', 
          color: playerColor === 'white' ? 'text-green-400' : 'text-red-400' 
        };
      } else if (gameState.gameResult === 'black-wins') {
        return { 
          message: playerColor === 'black' ? 'You won!' : 'You lost!', 
          color: playerColor === 'black' ? 'text-green-400' : 'text-red-400' 
        };
      }
    }
    
    if (gameState.isInCheck) {
      return { 
        message: isPlayerTurn ? 'You are in check!' : 'Opponent is in check!', 
        color: 'text-red-400' 
      };
    }
    
    return { 
      message: isPlayerTurn ? 'Your turn' : 'Opponent\'s turn', 
      color: 'text-[#FFE3D8]' 
    };
  };

  const statusInfo = getGameStatusMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#150016] via-[#29104A] to-[#522C5D] p-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Game Board - Takes up most space */}
          <div className="lg:col-span-3 flex items-center justify-center">
            <div className="w-full max-w-2xl">
              <ChessBoard
                gameState={gameState}
                isPlayerTurn={Boolean(isPlayerTurn)}
                playerColor={playerColor}
                onMove={handleMove}
              />
            </div>
          </div>

          {/* Game Info Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Game Status */}
            <Card>
              <div className="text-center">
                <h2 className="text-lg font-semibold text-[#FFE3D8] mb-2">
                  Game Status
                </h2>
                <p className={`font-medium ${statusInfo.color}`}>
                  {statusInfo.message}
                </p>
                {gameState.gameStatus === 'playing' && (
                  <div className="mt-2 text-sm text-[#845162]">
                    Move #{gameState.moves.length + 1}
                  </div>
                )}
              </div>
            </Card>

            {/* Players */}
            <Card>
              <h3 className="font-semibold text-[#FFE3D8] mb-3">Players</h3>
              <div className="space-y-2">
                {/* Current Player */}
                {currentPlayer && (
                  <div className={`
                    p-3 rounded-lg border
                    ${isPlayerTurn 
                      ? 'border-[#E38681] bg-[#E38681]/10' 
                      : 'border-[#522C5D] bg-[#522C5D]/20'
                    }
                  `}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#FFE3D8]">
                          {currentPlayer.name} (You)
                        </p>
                        <p className="text-sm text-[#845162] capitalize">
                          {currentPlayer.color}
                        </p>
                      </div>
                      <div className="text-2xl">
                        {currentPlayer.color === 'white' ? '♔' : '♚'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Opponent */}
                {opponent && (
                  <div className={`
                    p-3 rounded-lg border
                    ${!isPlayerTurn 
                      ? 'border-[#E38681] bg-[#E38681]/10' 
                      : 'border-[#522C5D] bg-[#522C5D]/20'
                    }
                  `}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#FFE3D8]">
                          {opponent.name}
                        </p>
                        <p className="text-sm text-[#845162] capitalize">
                          {opponent.color}
                        </p>
                      </div>
                      <div className="text-2xl">
                        {opponent.color === 'white' ? '♔' : '♚'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Move History */}
            <Card>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-[#FFE3D8]">Move History</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowMoveHistory(!showMoveHistory)}
                >
                  {showMoveHistory ? 'Hide' : 'Show'}
                </Button>
              </div>
              
              {showMoveHistory && (
                <div className="max-h-48 overflow-y-auto">
                  {gameState.moves.length === 0 ? (
                    <p className="text-[#845162] text-sm text-center py-4">
                      No moves yet
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {gameState.moves.map((move, index) => (
                        <div 
                          key={index}
                          className="text-sm font-mono text-[#FFE3D8] py-1 px-2 rounded hover:bg-[#522C5D]/30"
                        >
                          {formatMove(move, index)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Game Controls */}
            <Card>
              <h3 className="font-semibold text-[#FFE3D8] mb-3">Game Controls</h3>
              <div className="space-y-3">
                {gameState.gameStatus === 'finished' && (
                  <Button
                    onClick={onResetGame}
                    variant="primary"
                    className="w-full"
                  >
                    Play Again
                  </Button>
                )}
                
                <Button
                  onClick={onLeaveRoom}
                  variant="danger"
                  className="w-full"
                >
                  Leave Game
                </Button>
              </div>
            </Card>

            {/* Room Info */}
            <Card padding="sm">
              <div className="text-center">
                <p className="text-sm text-[#845162]">
                  Room: <span className="font-mono font-bold text-[#E38681]">{room.code}</span>
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};