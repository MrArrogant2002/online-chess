/**
 * Chess Game Type Definitions
 * Defines all the core types used throughout the chess application
 */

export type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
export type PieceColor = 'white' | 'black';
export type GameStatus = 'waiting' | 'playing' | 'finished' | 'draw';
export type GameResult = 'white-wins' | 'black-wins' | 'draw' | null;

export interface Position {
  row: number;
  col: number;
}

export interface ChessPiece {
  id: string;
  type: PieceType;
  color: PieceColor;
  position: Position;
  hasMoved?: boolean; // For castling and en passant
}

export interface Move {
  from: Position;
  to: Position;
  piece: ChessPiece;
  capturedPiece?: ChessPiece;
  isEnPassant?: boolean;
  isCastling?: boolean;
  promotionPiece?: PieceType;
  timestamp: number;
}

export interface GameState {
  board: (ChessPiece | null)[][];
  currentTurn: PieceColor;
  moves: Move[];
  gameStatus: GameStatus;
  gameResult: GameResult;
  isInCheck: boolean;
  validMoves: Position[];
  selectedPiece: ChessPiece | null;
  lastMove: Move | null;
  castlingRights: {
    whiteKingSide: boolean;
    whiteQueenSide: boolean;
    blackKingSide: boolean;
    blackQueenSide: boolean;
  };
  enPassantTarget: Position | null;
}

export interface Player {
  id: string;
  name: string;
  color: PieceColor;
  isReady: boolean;
  isConnected: boolean;
}

export interface Room {
  id: string;
  code: string;
  players: Player[];
  gameState: GameState;
  createdAt: number;
  maxPlayers: 2;
}

export interface SocketEvents {
  // Room management
  'create-room': () => void;
  'join-room': (code: string) => void;
  'leave-room': () => void;
  'room-created': (room: Room) => void;
  'room-joined': (room: Room) => void;
  'room-error': (error: string) => void;
  'player-joined': (player: Player) => void;
  'player-left': (playerId: string) => void;
  'player-ready': (playerId: string, isReady: boolean) => void;
  
  // Game events
  'game-start': (gameState: GameState) => void;
  'make-move': (move: Move) => void;
  'move-made': (move: Move, gameState: GameState) => void;
  'invalid-move': (error: string) => void;
  'game-over': (result: GameResult, gameState: GameState) => void;
  'game-reset': () => void;
  
  // Connection events
  'disconnect': () => void;
  'reconnect': () => void;
}