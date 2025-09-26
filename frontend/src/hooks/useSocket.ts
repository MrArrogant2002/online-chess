/**
 * Custom Hook for WebSocket Communication
 * Manages connection to the game server and handles real-time events
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from "socket.io-client";
import { Room, GameState, Move, Player, SocketEvents } from '@/types/chess';

interface UseSocketReturn {
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

export const useSocket = (): UseSocketReturn => {
  console.log('🔄 useSocket hook initialized');
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Debug currentRoom changes
  useEffect(() => {
    console.log('📦 currentRoom state changed:', currentRoom ? { code: currentRoom.code, players: currentRoom.players.length } : null);
  }, [currentRoom]);

  // Initialize socket connection
  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    console.log('🔌 Attempting to connect to:', backendUrl);

    // Set a connection timeout
    const connectionTimeout = setTimeout(() => {
      if (!socketRef.current?.connected) {
        console.error('Connection timeout - server may not be running');
        setError('Connection timeout. Please check if the server is running and try again.');
      }
    }, 10000);

    const socketInstance = io(backendUrl, {
      transports: ['polling'],
      upgrade: false,
      timeout: 20000,
      forceNew: false,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketRef.current = socketInstance;

    // Connection events
    socketInstance.on('connect', () => {
      console.log('✅ Connected to server via HTTP polling (reliable connection)');
      clearTimeout(connectionTimeout);
      setIsConnected(true);
      setError(null);
    });

    socketInstance.on('disconnect', (reason: string) => {
      console.log('Disconnected from server:', reason);
      setIsConnected(false);
      if (reason === 'io server disconnect') {
        // the disconnection was initiated by the server, you need to reconnect manually
        socketInstance.connect();
      }
    });

    socketInstance.on('connect_error', (error: Error) => {
      console.error('Connection error:', error);
      console.log('Error details:', error.message);
      setIsConnected(false);
      setError(`Failed to connect to server: ${error.message}. Please check your connection and try again.`);
    });

    socketInstance.on('reconnect', (attemptNumber: number) => {
      console.log('Reconnected to server after', attemptNumber, 'attempts');
      setIsConnected(true);
      setError(null);
    });

    socketInstance.on('reconnect_error', (error: Error) => {
      console.error('Reconnection failed:', error);
      setError('Connection lost. Attempting to reconnect...');
    });

    // Room events
    socketInstance.on('room-created', (room: Room) => {
      console.log('🎮 Room created:', room.code, '(Real-time communication active)');
      console.log('Room data:', room);
      console.log('Setting currentRoom state...');
      setCurrentRoom(room);
      setGameState(room.gameState);
      setError(null);
    });

    socketInstance.on('room-joined', (room: Room) => {
      console.log('Room joined:', room.code);
      console.log('Room data:', room);
      setCurrentRoom(room);
      setGameState(room.gameState);
      setError(null);
    });

    socketInstance.on('room-error', (errorMessage: string) => {
      console.error('Room error:', errorMessage);
      setError(errorMessage);
    });

    socketInstance.on('player-joined', (player: Player) => {
      console.log('Player joined:', player.name);
      setCurrentRoom(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          players: [...prev.players, player],
        };
      });
    });

    socketInstance.on('player-left', (playerId: string) => {
      console.log('Player left:', playerId);
      setCurrentRoom(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          players: prev.players.filter(p => p.id !== playerId),
        };
      });
    });

    socketInstance.on('player-ready', (playerId: string, isReady: boolean) => {
      console.log(`Player ${playerId} ready: ${isReady}`);
      setCurrentRoom(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          players: prev.players.map(p => 
            p.id === playerId ? { ...p, isReady } : p
          ),
        };
      });
    });

    // Game events
    socketInstance.on('game-start', (newGameState: GameState) => {
      console.log('Game started');
      setGameState(newGameState);
      setCurrentRoom(prev => prev ? { ...prev, gameState: newGameState } : prev);
    });

    socketInstance.on('move-made', (move: Move, newGameState: GameState) => {
      console.log('Move made:', move);
      setGameState(newGameState);
      setCurrentRoom(prev => prev ? { ...prev, gameState: newGameState } : prev);
    });

    socketInstance.on('invalid-move', (errorMessage: string) => {
      console.error('Invalid move:', errorMessage);
      setError(errorMessage);
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
    });

    socketInstance.on('game-over', (result: string, newGameState: GameState) => {
      console.log('Game over:', result);
      setGameState(newGameState);
      setCurrentRoom(prev => prev ? { ...prev, gameState: newGameState } : prev);
    });

    socketInstance.on('game-reset', () => {
      console.log('Game reset');
      setCurrentRoom(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          players: prev.players.map(p => ({ ...p, isReady: false })),
        };
      });
    });

    return () => {
      clearTimeout(connectionTimeout);
      socketInstance.disconnect();
    };
  }, []);

  // Room management functions
  const createRoom = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('create-room');
    }
  }, []);

  const joinRoom = useCallback((code: string) => {
    if (socketRef.current) {
      setError(null);
      socketRef.current.emit('join-room', code);
    }
  }, []);

  const leaveRoom = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('leave-room');
      setCurrentRoom(null);
      setGameState(null);
    }
  }, []);

  const makeMove = useCallback((move: Move) => {
    if (socketRef.current) {
      socketRef.current.emit('make-move', move);
    }
  }, []);

  const setPlayerReady = useCallback((isReady: boolean) => {
    if (socketRef.current && currentRoom) {
      const currentPlayer = currentRoom.players.find(p => p.id === socketRef.current?.id);
      if (currentPlayer) {
        socketRef.current.emit('player-ready', currentPlayer.id, isReady);
      }
    }
  }, [currentRoom]);

  const resetGame = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('game-reset');
    }
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    currentRoom,
    gameState,
    createRoom,
    joinRoom,
    leaveRoom,
    makeMove,
    setPlayerReady,
    resetGame,
    error,
  };
};