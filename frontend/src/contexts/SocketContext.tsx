/**
 * Socket Context Provider
 * Provides a single socket instance throughout the app
 */

'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useSocket } from '@/hooks/useSocket';
import type { Room, GameState, Move } from '@/types/chess';
import type { Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  currentRoom: Room | null;
  gameState: GameState | null;
  createRoom: () => void;
  joinRoom: (code: string) => void;
  leaveRoom: () => void;
  makeMove: (move: Move) => void;
  setPlayerReady: (isReady: boolean) => void;
  resetGame: () => void;
  error: string | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const socketData = useSocket();
  
  return (
    <SocketContext.Provider value={socketData}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
};