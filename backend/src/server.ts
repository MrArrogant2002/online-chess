/**
 * Chess Royale Backend Server
 * Express + Socket.IO server for multiplayer chess game
 */

import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { GameController } from './controllers/GameController';
import { RoomController } from './controllers/RoomController';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  methods: ["GET", "POST"],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Socket.IO server setup
const io = new SocketIOServer(httpServer, {
  cors: corsOptions,
  transports: ['polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
});

// Controllers
const gameController = new GameController();
const roomController = new RoomController();

// Inject room controller into game controller
gameController.setRoomController(roomController);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'chess-royale-backend'
  });
});

// API Routes
app.get('/api/rooms/active', (req, res) => {
  const activeRooms = roomController.getActiveRooms();
  res.json({ rooms: activeRooms });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Room management events
  socket.on('create-room', async () => {
    try {
      const room = await roomController.createRoom(socket.id);
      socket.join(room.id);
      socket.emit('room-created', room);
      console.log(`Room created: ${room.code} by ${socket.id}`);
    } catch (error) {
      console.error('Error creating room:', error);
      socket.emit('room-error', 'Failed to create room');
    }
  });

  socket.on('join-room', async (roomCode: string) => {
    try {
      const room = await roomController.joinRoom(roomCode, socket.id);
      socket.join(room.id);
      socket.emit('room-joined', room);
      socket.to(room.id).emit('player-joined', room.players.find((p: any) => p.id === socket.id));
      console.log(`Player ${socket.id} joined room ${roomCode}`);
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('room-error', error instanceof Error ? error.message : 'Failed to join room');
    }
  });

  socket.on('leave-room', async () => {
    try {
      const room = await roomController.leaveRoom(socket.id);
      if (room) {
        socket.leave(room.id);
        socket.to(room.id).emit('player-left', socket.id);
        console.log(`Player ${socket.id} left room ${room.code}`);
      }
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  });

  socket.on('player-ready', async (isReady: boolean) => {
    try {
      const result = await roomController.setPlayerReady(socket.id, isReady);
      if (result) {
        const { room, player } = result;
        io.to(room.id).emit('player-ready', player.id, isReady);
        
        // Check if both players are ready to start the game
        if (room.players.length === 2 && room.players.every((p: any) => p.isReady)) {
          const gameState = gameController.startGame(room.id);
          room.gameState = gameState;
          io.to(room.id).emit('game-start', gameState);
          console.log(`Game started in room ${room.code}`);
        }
      }
    } catch (error) {
      console.error('Error setting player ready:', error);
      socket.emit('room-error', 'Failed to update ready status');
    }
  });

  // Game events
  socket.on('make-move', async (moveData: any) => {
    try {
      const result = await gameController.makeMove(socket.id, moveData);
      if (result) {
        const { room, move, gameState } = result;
        io.to(room.id).emit('move-made', move, gameState);
        
        // Check if game is over
        if (gameState.gameStatus === 'finished') {
          io.to(room.id).emit('game-over', gameState.gameResult, gameState);
          console.log(`Game ended in room ${room.code}: ${gameState.gameResult}`);
        }
      }
    } catch (error) {
      console.error('Error making move:', error);
      socket.emit('invalid-move', error instanceof Error ? error.message : 'Invalid move');
    }
  });

  socket.on('game-reset', async () => {
    try {
      const result = await gameController.resetGame(socket.id);
      if (result) {
        const { room, gameState } = result;
        io.to(room.id).emit('game-reset', gameState);
        console.log(`Game reset in room ${room.code}`);
      }
    } catch (error) {
      console.error('Error resetting game:', error);
      socket.emit('room-error', 'Failed to reset game');
    }
  });

  // Handle disconnection
  socket.on('disconnect', async () => {
    console.log(`Player disconnected: ${socket.id}`);
    try {
      const room = await roomController.handleDisconnection(socket.id);
      if (room) {
        socket.to(room.id).emit('player-disconnected', socket.id);
      }
    } catch (error) {
      console.error('Error handling disconnection:', error);
    }
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🚀 Chess Royale Backend Server running on port ${PORT}`);
  console.log(`🎮 WebSocket server ready for connections`);
  console.log(`🌐 CORS enabled for: ${corsOptions.origin}`);
});
