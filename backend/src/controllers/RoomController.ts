/**
 * Room Controller
 * Handles room creation, joining, leaving, and management
 */

import { v4 as uuidv4 } from 'uuid';
import { Room, Player, GameState, PieceColor } from '../types/chess';
import { chessEngine } from '../utils/chessEngine';

export class RoomController {
  private rooms: Map<string, Room> = new Map();
  private playerRooms: Map<string, string> = new Map(); // socketId -> roomId

  /**
   * Create a new room
   */
  async createRoom(playerId: string): Promise<Room> {
    const roomCode = this.generateRoomCode();
    const room: Room = {
      id: uuidv4(),
      code: roomCode,
      players: [{
        id: playerId,
        name: `Player 1`,
        color: 'white',
        isReady: false,
        isConnected: true,
      }],
      gameState: chessEngine.initializeGame(),
      createdAt: Date.now(),
      maxPlayers: 2,
    };

    this.rooms.set(room.id, room);
    this.playerRooms.set(playerId, room.id);
    
    return room;
  }

  /**
   * Join an existing room
   */
  async joinRoom(roomCode: string, playerId: string): Promise<Room> {
    const room = this.findRoomByCode(roomCode);
    
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.players.length >= room.maxPlayers) {
      throw new Error('Room is full');
    }

    // Check if player is already in the room
    const existingPlayer = room.players.find((p: Player) => p.id === playerId);
    if (existingPlayer) {
      existingPlayer.isConnected = true;
      return room;
    }

    // Add new player
    const newPlayer: Player = {
      id: playerId,
      name: `Player ${room.players.length + 1}`,
      color: room.players.length === 0 ? 'white' : 'black',
      isReady: false,
      isConnected: true,
    };

    room.players.push(newPlayer);
    this.playerRooms.set(playerId, room.id);
    
    return room;
  }

  /**
   * Leave a room
   */
  async leaveRoom(playerId: string): Promise<Room | null> {
    const roomId = this.playerRooms.get(playerId);
    if (!roomId) return null;

    const room = this.rooms.get(roomId);
    if (!room) return null;

    // Remove player from room
    room.players = room.players.filter((p: Player) => p.id !== playerId);
    this.playerRooms.delete(playerId);

    // Delete room if empty
    if (room.players.length === 0) {
      this.rooms.delete(roomId);
      console.log(`Room ${room.code} deleted - no players remaining`);
    } else {
      // Reset game if one player left during game
      if (room.gameState.gameStatus === 'playing') {
        room.gameState = chessEngine.initializeGame();
        room.players.forEach((p: Player) => p.isReady = false);
      }
    }

    return room;
  }

  /**
   * Set player ready status
   */
  async setPlayerReady(playerId: string, isReady: boolean): Promise<{ room: Room; player: Player } | null> {
    const roomId = this.playerRooms.get(playerId);
    if (!roomId) return null;

    const room = this.rooms.get(roomId);
    if (!room) return null;

    const player = room.players.find((p: Player) => p.id === playerId);
    if (!player) return null;

    player.isReady = isReady;
    return { room, player };
  }

  /**
   * Handle player disconnection
   */
  async handleDisconnection(playerId: string): Promise<Room | null> {
    const roomId = this.playerRooms.get(playerId);
    if (!roomId) return null;

    const room = this.rooms.get(roomId);
    if (!room) return null;

    const player = room.players.find((p: Player) => p.id === playerId);
    if (player) {
      player.isConnected = false;
      // Could implement reconnection logic here
    }

    return room;
  }

  /**
   * Get room by player ID
   */
  getRoomByPlayerId(playerId: string): Room | null {
    const roomId = this.playerRooms.get(playerId);
    if (!roomId) return null;
    return this.rooms.get(roomId) || null;
  }

  /**
   * Get all active rooms
   */
  getActiveRooms(): Room[] {
    return Array.from(this.rooms.values()).filter(room => 
      room.players.some((p: Player) => p.isConnected)
    );
  }

  /**
   * Generate a unique room code
   */
  private generateRoomCode(): string {
    let code: string;
    do {
      code = Math.random().toString(36).substring(2, 8).toUpperCase();
    } while (this.findRoomByCode(code));
    return code;
  }

  /**
   * Find room by code
   */
  private findRoomByCode(code: string): Room | undefined {
    return Array.from(this.rooms.values()).find(room => room.code === code);
  }

  /**
   * Clean up inactive rooms (call periodically)
   */
  public cleanupInactiveRooms(): void {
    const now = Date.now();
    const roomsToDelete: string[] = [];

    this.rooms.forEach((room, roomId) => {
      // Delete rooms older than 2 hours with no active players
      if (
        now - room.createdAt > 2 * 60 * 60 * 1000 && // 2 hours
        room.players.every((p: Player) => !p.isConnected)
      ) {
        roomsToDelete.push(roomId);
      }
    });

    roomsToDelete.forEach(roomId => {
      const room = this.rooms.get(roomId);
      if (room) {
        // Clean up player room mappings
        room.players.forEach((p: Player) => {
          this.playerRooms.delete(p.id);
        });
        this.rooms.delete(roomId);
        console.log(`Cleaned up inactive room: ${room.code}`);
      }
    });
  }
}