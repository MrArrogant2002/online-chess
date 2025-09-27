/**
 * Game Result Screen Component
 * Shows game outcome with options to replay or return home
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { GameState, Room } from '@/types/chess';

interface ResultScreenProps {
  room: Room;
  gameState: GameState;
  currentPlayerId: string;
  onPlayAgain: () => void;
  onReturnHome: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  room,
  gameState,
  currentPlayerId,
  onPlayAgain,
  onReturnHome,
}) => {
  const currentPlayer = room.players.find(p => p.id === currentPlayerId);
  const opponent = room.players.find(p => p.id !== currentPlayerId);
  const playerColor = currentPlayer?.color || 'white';

  // Determine result message and styling
  const getResultInfo = () => {
    switch (gameState.gameResult) {
      case 'white-wins':
        const whiteWon = playerColor === 'white';
        return {
          title: whiteWon ? '🏆 Victory!' : '💔 Defeat',
          subtitle: whiteWon ? 'Congratulations, you won!' : 'Better luck next time!',
          message: 'White wins by checkmate',
          color: whiteWon ? 'text-green-400' : 'text-red-400',
          bgColor: whiteWon ? 'bg-green-500/10 border-green-500' : 'bg-red-500/10 border-red-500',
        };
      
      case 'black-wins':
        const blackWon = playerColor === 'black';
        return {
          title: blackWon ? '🏆 Victory!' : '💔 Defeat',
          subtitle: blackWon ? 'Congratulations, you won!' : 'Better luck next time!',
          message: 'Black wins by checkmate',
          color: blackWon ? 'text-green-400' : 'text-red-400',
          bgColor: blackWon ? 'bg-green-500/10 border-green-500' : 'bg-red-500/10 border-red-500',
        };
      
      case 'draw':
      default:
        return {
          title: '🤝 Draw',
          subtitle: 'A well-fought game!',
          message: 'Game ended in a draw',
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/10 border-yellow-500',
        };
    }
  };

  const resultInfo = getResultInfo();

  // Calculate game statistics
  const totalMoves = gameState.moves.length;
  const whiteMoves = Math.ceil(totalMoves / 2);
  const blackMoves = Math.floor(totalMoves / 2);
  const capturedPieces = gameState.moves.filter(move => move.capturedPiece).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#150016] via-[#29104A] to-[#522C5D] flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-6">
        {/* Main Result */}
        <Card className={`text-center border-2 ${resultInfo.bgColor}`}>
          <div className="space-y-4">
            <h1 className={`text-4xl font-bold ${resultInfo.color}`}>
              {resultInfo.title}
            </h1>
            <p className="text-xl text-[#FFE3D8]">
              {resultInfo.subtitle}
            </p>
            <p className="text-[#845162]">
              {resultInfo.message}
            </p>
          </div>
        </Card>

        {/* Game Statistics */}
        <Card>
          <h2 className="text-lg font-semibold text-[#FFE3D8] mb-4 text-center">
            Game Statistics
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#E38681]">{totalMoves}</p>
              <p className="text-sm text-[#845162]">Total Moves</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[#E38681]">{capturedPieces}</p>
              <p className="text-sm text-[#845162]">Captures</p>
            </div>
          </div>

          <div className="mt-4 border-t border-[#522C5D] pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[#FFE3D8]">White Moves:</span>
              <span className="font-mono text-[#E38681]">{whiteMoves}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#FFE3D8]">Black Moves:</span>
              <span className="font-mono text-[#E38681]">{blackMoves}</span>
            </div>
          </div>
        </Card>

        {/* Players */}
        <Card>
          <h2 className="text-lg font-semibold text-[#FFE3D8] mb-4 text-center">
            Final Standings
          </h2>
          
          <div className="space-y-3">
            {/* Winner/Current Player */}
            {currentPlayer && (
              <div className={`
                p-4 rounded-lg border-2 transition-all
                ${(gameState.gameResult === 'white-wins' && playerColor === 'white') ||
                  (gameState.gameResult === 'black-wins' && playerColor === 'black')
                  ? 'border-green-500 bg-green-500/10'
                  : gameState.gameResult === 'draw'
                  ? 'border-yellow-500 bg-yellow-500/10'
                  : 'border-red-500 bg-red-500/10'
                }
              `}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[#FFE3D8]">
                      {currentPlayer.name} (You)
                    </p>
                    <p className="text-sm text-[#845162] capitalize">
                      Playing {currentPlayer.color}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl mb-1">
                      {currentPlayer.color === 'white' ? '♔' : '♚'}
                    </div>
                    {gameState.gameResult === 'draw' ? (
                      <span className="text-yellow-400 text-sm font-medium">Draw</span>
                    ) : (
                      <span className={`text-sm font-medium ${
                        (gameState.gameResult === 'white-wins' && playerColor === 'white') ||
                        (gameState.gameResult === 'black-wins' && playerColor === 'black')
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}>
                        {(gameState.gameResult === 'white-wins' && playerColor === 'white') ||
                         (gameState.gameResult === 'black-wins' && playerColor === 'black')
                          ? 'Winner'
                          : 'Defeated'
                        }
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Opponent */}
            {opponent && (
              <div className={`
                p-4 rounded-lg border-2 transition-all
                ${(gameState.gameResult === 'white-wins' && opponent.color === 'white') ||
                  (gameState.gameResult === 'black-wins' && opponent.color === 'black')
                  ? 'border-green-500 bg-green-500/10'
                  : gameState.gameResult === 'draw'
                  ? 'border-yellow-500 bg-yellow-500/10'
                  : 'border-red-500 bg-red-500/10'
                }
              `}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[#FFE3D8]">
                      {opponent.name}
                    </p>
                    <p className="text-sm text-[#845162] capitalize">
                      Playing {opponent.color}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl mb-1">
                      {opponent.color === 'white' ? '♔' : '♚'}
                    </div>
                    {gameState.gameResult === 'draw' ? (
                      <span className="text-yellow-400 text-sm font-medium">Draw</span>
                    ) : (
                      <span className={`text-sm font-medium ${
                        (gameState.gameResult === 'white-wins' && opponent.color === 'white') ||
                        (gameState.gameResult === 'black-wins' && opponent.color === 'black')
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}>
                        {(gameState.gameResult === 'white-wins' && opponent.color === 'white') ||
                         (gameState.gameResult === 'black-wins' && opponent.color === 'black')
                          ? 'Winner'
                          : 'Defeated'
                        }
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Action Buttons */}
        <Card>
          <div className="space-y-3">
            <Button
              onClick={onPlayAgain}
              size="lg"
              className="w-full"
            >
              <span className="text-xl mr-2">🔄</span>
              Play Again
            </Button>
            
            <Button
              onClick={onReturnHome}
              variant="secondary"
              size="lg"
              className="w-full"
            >
              <span className="text-xl mr-2">🏠</span>
              Return Home
            </Button>
          </div>
        </Card>

        {/* Room Code */}
        <Card padding="sm">
          <div className="text-center">
            <p className="text-sm text-[#845162]">
              Room: <span className="font-mono font-bold text-[#E38681]">{room.code}</span>
            </p>
            <p className="text-xs text-[#845162] mt-1">
              Share this code to invite others for the next game
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};