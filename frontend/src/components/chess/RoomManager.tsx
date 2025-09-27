/**
 * Room Management Component
 * Displays room information, player status, and ready controls
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { Room, Player } from '@/types/chess';

interface RoomManagerProps {
  room: Room;
  currentPlayerId: string;
  onPlayerReady: (isReady: boolean) => void;
  onLeaveRoom: () => void;
}

export const RoomManager: React.FC<RoomManagerProps> = ({
  room,
  currentPlayerId,
  onPlayerReady,
  onLeaveRoom,
}) => {
  const currentPlayer = room.players.find(p => p.id === currentPlayerId);
  const _otherPlayer = room.players.find(p => p.id !== currentPlayerId);
  const isRoomFull = room.players.length === 2;
  const allPlayersReady = room.players.every(p => p.isReady);
  const canStartGame = isRoomFull && allPlayersReady;

  const copyRoomCode = () => {
    navigator.clipboard.writeText(room.code);
  };

  const PlayerCard: React.FC<{ player: Player; isCurrentPlayer: boolean }> = ({ 
    player, 
    isCurrentPlayer 
  }) => (
    <div className={`
      glass border-2 rounded-lg p-4 transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)
      ${player.isReady 
        ? 'border-green-500/80 bg-green-500/10 shadow-lg shadow-green-500/20' 
        : 'border-slate-600/50 bg-slate-600/10'
      }
      ${isCurrentPlayer ? 'ring-2 ring-purple-500/50 shadow-lg shadow-purple-500/20' : ''}
      hover:scale-[1.02] hover:shadow-xl
    `}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white">
            {player.name} {isCurrentPlayer && '(You)'}
          </h3>
          <p className="text-sm text-slate-300 capitalize">
            Playing as {player.color}
          </p>
        </div>
        <div className="text-right">
          <div className={`
            inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-200
            ${player.isConnected 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }
          `}>
            <div className={`
              w-2 h-2 rounded-full mr-1 animate-pulse
              ${player.isConnected ? 'bg-green-400' : 'bg-red-400'}
            `} />
            {player.isConnected ? 'Connected' : 'Disconnected'}
          </div>
          <div className={`
            mt-2 text-xs font-medium transition-colors duration-200
            ${player.isReady ? 'text-green-400' : 'text-slate-400'}
          `}>
            {player.isReady ? 'Ready ✓' : 'Not Ready'}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2 animate-scale-in">
            Room Created
          </h1>
          <p className="text-slate-300 text-lg">
            Share the room code with your opponent to start playing
          </p>
        </div>

        {/* Room Code */}
        <Card className="text-center">
          <h2 className="text-lg font-semibold text-white mb-4">
            Room Code
          </h2>
          <div 
            className="inline-flex items-center glass-strong border border-purple-500/50 rounded-lg px-6 py-4 cursor-pointer hover:glass transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
            onClick={copyRoomCode}
          >
            <span className="text-3xl font-mono font-bold text-purple-400 tracking-widest">
              {room.code}
            </span>
            <span className="ml-3 text-sm text-slate-300">
              Click to copy
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-2">
            Share this code with your friend to invite them
          </p>
        </Card>

        {/* Players */}
        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">
            Players ({room.players.length}/{room.maxPlayers})
          </h2>
          
          <div className="space-y-3">
            {room.players.map(player => (
              <PlayerCard 
                key={player.id} 
                player={player} 
                isCurrentPlayer={player.id === currentPlayerId}
              />
            ))}
            
            {!isRoomFull && (
              <div className="border-2 border-dashed border-slate-600/50 rounded-lg p-4 text-center glass">
                <div className="text-slate-300">
                  <Loading message="Waiting for opponent to join..." size="sm" />
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Game Status */}
        {isRoomFull && (
          <Card>
            <div className="text-center">
              {canStartGame ? (
                <div className="space-y-4">
                  <div className="text-green-400 font-semibold text-lg animate-pulse">
                    🎉 Ready to start the game!
                  </div>
                  <p className="text-slate-400 text-sm">
                    The game will begin automatically...
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-white font-semibold">
                    Waiting for all players to be ready
                  </p>
                  {currentPlayer && !currentPlayer.isReady && (
                    <p className="text-slate-400 text-sm">
                      Click the ready button when you&apos;re prepared to play
                    </p>
                  )}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Controls */}
        <div className="flex space-x-4">
          {currentPlayer && isRoomFull && (
            <Button
              onClick={() => onPlayerReady(!currentPlayer.isReady)}
              variant={currentPlayer.isReady ? 'outline' : 'primary'}
              size="lg"
              className="flex-1"
            >
              {currentPlayer.isReady ? 'Not Ready' : 'Ready to Play'}
            </Button>
          )}
          
          <Button
            onClick={onLeaveRoom}
            variant="danger"
            size="lg"
            className={isRoomFull ? 'flex-1' : 'w-full'}
          >
            Leave Room
          </Button>
        </div>

        {/* Instructions */}
        <Card padding="sm">
          <div className="text-center text-sm text-slate-400">
            <p className="mb-2 font-medium text-slate-300">How to play:</p>
            <ul className="space-y-1">
              <li>• Share the room code with your opponent</li>
              <li>• Both players must click &quot;Ready to Play&quot;</li>
              <li>• The game will start automatically</li>
              <li>• White moves first</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
};