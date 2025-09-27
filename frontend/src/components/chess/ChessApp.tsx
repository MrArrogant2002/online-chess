/**
 * Chess App Component
 * Main application component that manages game flow and screen transitions
 */

'use client';

import React from 'react';
import { useSocketContext } from '@/contexts/SocketContext';
import { RoomManager } from '@/components/chess/RoomManager';
import { GameScreen } from '@/components/chess/GameScreen';
import { ResultScreen } from '@/components/chess/ResultScreen';
import { Loading } from '@/components/ui/Loading';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PieceType, Position } from '@/types/chess';

interface ChessAppProps {
  initialMode?: 'home' | 'room' | 'game' | 'result';
}

export const ChessApp: React.FC<ChessAppProps> = ({ initialMode: _initialMode = 'home' }) => {
  const {
    socket,
    isConnected,
    currentRoom,
    gameState,
    leaveRoom,
    makeMove,
    setPlayerReady,
    resetGame,
    error,
  } = useSocketContext();

  // Determine current screen based on app state
  const getCurrentScreen = () => {
    const state = { 
      isConnected, 
      currentRoom: currentRoom ? { code: currentRoom.code, players: currentRoom.players.length } : null, 
      gameState: gameState ? { status: gameState.gameStatus } : null 
    };
    console.log('ChessApp state:', state);
    
    if (!isConnected) {
      console.log('→ Screen: connecting (not connected)');
      return 'connecting';
    }
    if (!currentRoom) {
      console.log('→ Screen: home (no current room)');
      return 'home';
    }
    
    if (gameState) {
      if (gameState.gameStatus === 'finished') {
        console.log('→ Screen: result (game finished)');
        return 'result';
      }
      if (gameState.gameStatus === 'playing') {
        console.log('→ Screen: game (game playing)');
        return 'game';
      }
    }
    
    console.log('→ Screen: room (in room, waiting)');
    return 'room';
  };

  const currentScreen = getCurrentScreen();

  // Handle move making
  const handleMove = (from: Position, to: Position, promotionPiece?: PieceType) => {
    if (!gameState || !currentRoom) return;
    
    console.log('🎯 ChessApp handleMove called:', {
      from,
      to,
      promotionPiece,
      piece: gameState.board[from.row][from.col]?.type
    });
    
    const move = {
      from,
      to,
      piece: gameState.board[from.row][from.col]!,
      timestamp: Date.now(),
      ...(promotionPiece && { promotionPiece }),
    };
    
    console.log('📨 Sending move to socket:', move);
    makeMove(move);
  };

  // Handle player ready toggle
  const handlePlayerReady = (isReady: boolean) => {
    setPlayerReady(isReady);
  };

  // Handle leaving room
  const handleLeaveRoom = () => {
    leaveRoom();
  };

  // Handle game reset
  const handleResetGame = () => {
    resetGame();
  };

  // Handle return to home
  const handleReturnHome = () => {
    leaveRoom();
  };

  // Get current player ID
  const getCurrentPlayerId = (): string => {
    return socket?.id || '';
  };

  // Loading screen
  if (currentScreen === 'connecting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#150016] via-[#29104A] to-[#522C5D] flex items-center justify-center p-4">
        <Card className="text-center">
          <Loading message="Connecting to game server..." />
          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500 rounded-lg">
              <p className="text-red-400">{error}</p>
            </div>
          )}
        </Card>
      </div>
    );
  }

  // Room management screen
  if (currentScreen === 'room' && currentRoom) {
    return (
      <RoomManager
        room={currentRoom}
        currentPlayerId={getCurrentPlayerId()}
        onPlayerReady={handlePlayerReady}
        onLeaveRoom={handleLeaveRoom}
      />
    );
  }

  // Game screen
  if (currentScreen === 'game' && currentRoom && gameState) {
    return (
      <GameScreen
        room={currentRoom}
        gameState={gameState}
        currentPlayerId={getCurrentPlayerId()}
        onMove={handleMove}
        onLeaveRoom={handleLeaveRoom}
        onResetGame={handleResetGame}
      />
    );
  }

  // Result screen
  if (currentScreen === 'result' && currentRoom && gameState) {
    return (
      <ResultScreen
        room={currentRoom}
        gameState={gameState}
        currentPlayerId={getCurrentPlayerId()}
        onPlayAgain={handleResetGame}
        onReturnHome={handleReturnHome}
      />
    );
  }

  // Default: Show error state if something goes wrong
  console.error('ChessApp: Unknown screen state', { currentScreen, isConnected, currentRoom: !!currentRoom, gameState: !!gameState });
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#150016] via-[#29104A] to-[#522C5D] flex items-center justify-center p-4">
      <Card className="text-center max-w-md">
        <h1 className="text-2xl font-bold text-[#FFE3D8] mb-4">Something went wrong</h1>
        <p className="text-[#845162] mb-4">
          Unable to determine the current screen state. Please refresh the page.
        </p>
        <p className="text-sm text-[#845162]">
          Debug: Screen={currentScreen}, Connected={isConnected}, Room={!!currentRoom}, Game={!!gameState}
        </p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Refresh Page
        </Button>
      </Card>
    </div>
  );
};

export default ChessApp;