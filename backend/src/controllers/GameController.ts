/**
 * Game Controller
 * Handles chess game logic, moves, and state management
 */

import { GameState, Move, Position, Room, Player } from '../types/chess';
import { chessEngine } from '../utils/chessEngine';

import { RoomController } from './RoomController';

export class GameController {
  private games: Map<string, GameState> = new Map(); // roomId -> GameState
  private roomController: RoomController | null = null;

  /**
   * Set room controller reference
   */
  setRoomController(roomController: RoomController): void {
    this.roomController = roomController;
  }

  /**
   * Start a new game
   */
  startGame(roomId: string): GameState {
    const gameState = chessEngine.initializeGame();
    gameState.gameStatus = 'playing';
    this.games.set(roomId, gameState);
    return gameState;
  }

  /**
   * Make a move in the game
   */
  async makeMove(
    playerId: string, 
    moveData: { from: Position; to: Position; promotionPiece?: string }
  ): Promise<{ room: Room; move: Move; gameState: GameState } | null> {
    // Get room from room controller (we'll need to inject this)
    const room = this.getRoomByPlayerId(playerId);
    if (!room) {
      throw new Error('Player not in any room');
    }

    const gameState = this.games.get(room.id);
    if (!gameState) {
      throw new Error('No active game found');
    }

    if (gameState.gameStatus !== 'playing') {
      throw new Error('Game is not in progress');
    }

    // Find player and validate turn
    const player = room.players.find((p: Player) => p.id === playerId);
    if (!player) {
      throw new Error('Player not found in room');
    }

    if (gameState.currentTurn !== player.color) {
      throw new Error('Not your turn');
    }

    try {
      console.log('🎯 Backend GameController makeMove called:', {
        playerId,
        from: moveData.from,
        to: moveData.to,
        promotionPiece: moveData.promotionPiece,
        pieceType: gameState.board[moveData.from.row][moveData.from.col]?.type,
        isPromotionMove: gameState.board[moveData.from.row][moveData.from.col]?.type === 'pawn' && 
                        (moveData.to.row === 0 || moveData.to.row === 7)
      });
      
      // Make the move using the chess engine
      const newGameState = chessEngine.makeMove(
        gameState, 
        moveData.from, 
        moveData.to, 
        moveData.promotionPiece as any
      );
      
      // Update stored game state
      this.games.set(room.id, newGameState);
      room.gameState = newGameState;

      // Create move object for response
      const move: Move = {
        from: moveData.from,
        to: moveData.to,
        piece: newGameState.board[moveData.to.row][moveData.to.col]!,
        timestamp: Date.now(),
      };

      return { room, move, gameState: newGameState };
    } catch (error) {
      throw new Error(`Invalid move: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Reset game
   */
  async resetGame(playerId: string): Promise<{ room: Room; gameState: GameState } | null> {
    const room = this.getRoomByPlayerId(playerId);
    if (!room) return null;

    const newGameState = chessEngine.initializeGame();
    newGameState.gameStatus = 'waiting';
    
    // Reset player ready states
    room.players.forEach((p: Player) => p.isReady = false);
    room.gameState = newGameState;
    
    this.games.set(room.id, newGameState);
    
    return { room, gameState: newGameState };
  }

  /**
   * Get game state by room ID
   */
  getGameState(roomId: string): GameState | null {
    return this.games.get(roomId) || null;
  }

  /**
   * End game
   */
  endGame(roomId: string): void {
    const gameState = this.games.get(roomId);
    if (gameState) {
      gameState.gameStatus = 'finished';
    }
  }

  /**
   * Get room by player ID
   */
  private getRoomByPlayerId(playerId: string): Room | null {
    if (!this.roomController) return null;
    return this.roomController.getRoomByPlayerId(playerId);
  }

  /**
   * Validate move before processing
   */
  private validateMove(gameState: GameState, from: Position, to: Position, playerColor: string): boolean {
    const piece = gameState.board[from.row][from.col];
    
    if (!piece) {
      throw new Error('No piece at source position');
    }

    if (piece.color !== playerColor) {
      throw new Error('Cannot move opponent\'s piece');
    }

    return chessEngine.isValidMove(gameState, from, to);
  }

  /**
   * Get valid moves for a piece
   */
  getValidMoves(roomId: string, position: Position): Position[] {
    const gameState = this.games.get(roomId);
    if (!gameState) return [];

    const piece = gameState.board[position.row][position.col];
    if (!piece) return [];

    return chessEngine.getValidMovesForPiece(gameState, piece);
  }

  /**
   * Check if game is over
   */
  isGameOver(roomId: string): boolean {
    const gameState = this.games.get(roomId);
    return gameState ? gameState.gameStatus === 'finished' : false;
  }

  /**
   * Get game statistics
   */
  getGameStats(roomId: string): any {
    const gameState = this.games.get(roomId);
    if (!gameState) return null;

    return {
      totalMoves: gameState.moves.length,
      currentTurn: gameState.currentTurn,
      gameStatus: gameState.gameStatus,
      gameResult: gameState.gameResult,
      isInCheck: gameState.isInCheck,
    };
  }

  /**
   * Clean up finished games
   */
  cleanupFinishedGames(): void {
    const finishedGames: string[] = [];
    
    this.games.forEach((gameState, roomId) => {
      if (gameState.gameStatus === 'finished') {
        // Keep finished games for a while for stats/replay
        const finishedTime = gameState.moves[gameState.moves.length - 1]?.timestamp || Date.now();
        const hoursSinceFinished = (Date.now() - finishedTime) / (1000 * 60 * 60);
        
        if (hoursSinceFinished > 24) { // Clean up after 24 hours
          finishedGames.push(roomId);
        }
      }
    });

    finishedGames.forEach(roomId => {
      this.games.delete(roomId);
      console.log(`Cleaned up finished game: ${roomId}`);
    });
  }
}
