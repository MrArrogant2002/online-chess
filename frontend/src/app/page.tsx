/**
 * Landing Page - Welcome Screen
 * Main entry point with Create Room and Join Room options
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ChessApp } from '@/components/chess/ChessApp';
import { useSocketContext } from '@/contexts/SocketContext';

export default function Home() {
  const [mode, setMode] = useState<'menu' | 'join' | 'create'>('menu');
  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { createRoom, joinRoom, currentRoom, isConnected, error } = useSocketContext();

  const handleCreateRoom = () => {
    setIsLoading(true);
    setMode('create');
    createRoom();
  };

  const handleJoinRoom = (code: string) => {
    if (!code.trim()) return;
    setIsLoading(true);
    joinRoom(code.trim().toUpperCase());
  };

  const handleBackToMenu = () => {
    setMode('menu');
    setRoomCode('');
    setIsLoading(false);
  };

  // Redirect to room/game if connected to a room
  React.useEffect(() => {
    if (currentRoom) {
      setIsLoading(false);
    }
  }, [currentRoom]);

  // If connected to a room, show the chess app instead of home screen
  if (currentRoom) {
    console.log('🎮 Rendering ChessApp with room:', currentRoom.code);
    return (
      <ErrorBoundary>
        <ChessApp />
      </ErrorBoundary>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#150016] via-[#29104A] to-[#522C5D] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="text-6xl mb-4">♔♛</div>
          <h1 className="text-4xl font-bold text-[#FFE3D8] mb-2">
            Chess Royale
          </h1>
          <p className="text-[#845162] text-lg">
            Challenge players in real-time multiplayer chess
          </p>
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <Card className="text-center">
            <Loading message="Connecting to server..." />
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Card className="border-red-500 bg-red-500/10">
            <p className="text-red-400 text-center">{error}</p>
          </Card>
        )}

        {/* Main Menu */}
        {mode === 'menu' && isConnected && (
          <Card>
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-[#FFE3D8] text-center">
                Choose Your Adventure
              </h2>
              
              <div className="space-y-4">
                <Button
                  onClick={handleCreateRoom}
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  <span className="text-xl mr-2">👑</span>
                  Create New Room
                </Button>
                
                <Button
                  onClick={() => setMode('join')}
                  variant="secondary"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  <span className="text-xl mr-2">🏰</span>
                  Join Existing Room
                </Button>
              </div>

              <div className="text-center text-sm text-[#845162]">
                <p>Create a room to play with friends, or</p>
                <p>join an existing room with a room code</p>
              </div>
            </div>
          </Card>
        )}

        {/* Join Room Mode */}
        {mode === 'join' && isConnected && (
          <Card>
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-[#FFE3D8] mb-2">
                  Join Room
                </h2>
                <p className="text-[#845162]">
                  Enter the room code to join a game
                </p>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                handleJoinRoom(roomCode);
              }}>
                <div className="space-y-4">
                  <Input
                    label="Room Code"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="Enter room code (e.g., ABC123)"
                    maxLength={6}
                    className="text-center text-lg font-mono tracking-widest"
                    disabled={isLoading}
                  />
                  
                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBackToMenu}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={!roomCode.trim() || isLoading}
                      className="flex-1"
                    >
                      {isLoading ? 'Joining...' : 'Join Room'}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </Card>
        )}

        {/* Creating Room Mode */}
        {mode === 'create' && isLoading && (
          <Card className="text-center">
            <Loading message="Creating room..." />
            <Button
              variant="outline"
              onClick={handleBackToMenu}
              className="mt-4"
            >
              Cancel
            </Button>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-[#845162]">
          <p>Built with Next.js, TypeScript & Socket.IO</p>
          <p className="mt-1">Real-time multiplayer chess experience</p>
        </div>
      </div>
    </div>
  );
}
