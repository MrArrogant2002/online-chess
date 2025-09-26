/**
 * Chess Game Engine
 * Handles all chess-related logic including piece movement, validation, check/checkmate detection
 */

import { ChessPiece, GameState, Move, Position, PieceColor, PieceType, GameStatus, GameResult } from '@/types/chess';
import { v4 as uuidv4 } from 'uuid';

export class ChessEngine {
  private static instance: ChessEngine;

  static getInstance(): ChessEngine {
    if (!ChessEngine.instance) {
      ChessEngine.instance = new ChessEngine();
    }
    return ChessEngine.instance;
  }

  /**
   * Initialize a new chess game with starting positions
   */
  initializeGame(): GameState {
    const board = this.createInitialBoard();
    
    return {
      board,
      currentTurn: 'white',
      moves: [],
      gameStatus: 'waiting',
      gameResult: null,
      isInCheck: false,
      validMoves: [],
      selectedPiece: null,
      lastMove: null,
      castlingRights: {
        whiteKingSide: true,
        whiteQueenSide: true,
        blackKingSide: true,
        blackQueenSide: true,
      },
      enPassantTarget: null,
    };
  }

  /**
   * Create the initial chess board with all pieces in starting positions
   */
  private createInitialBoard(): (ChessPiece | null)[][] {
    const board: (ChessPiece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));

    // Helper function to create a piece
    const createPiece = (type: PieceType, color: PieceColor, row: number, col: number): ChessPiece => ({
      id: uuidv4(),
      type,
      color,
      position: { row, col },
      hasMoved: false,
    });

    // Place pawns
    for (let col = 0; col < 8; col++) {
      board[1][col] = createPiece('pawn', 'black', 1, col);
      board[6][col] = createPiece('pawn', 'white', 6, col);
    }

    // Place other pieces
    const pieceOrder: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
    
    for (let col = 0; col < 8; col++) {
      board[0][col] = createPiece(pieceOrder[col], 'black', 0, col);
      board[7][col] = createPiece(pieceOrder[col], 'white', 7, col);
    }

    return board;
  }

  /**
   * Validate if a move is legal
   */
  isValidMove(gameState: GameState, from: Position, to: Position): boolean {
    const piece = gameState.board[from.row][from.col];
    if (!piece || piece.color !== gameState.currentTurn) return false;

    // Check if the move is within board bounds
    if (to.row < 0 || to.row > 7 || to.col < 0 || to.col > 7) return false;

    // Check if trying to capture own piece
    const targetPiece = gameState.board[to.row][to.col];
    if (targetPiece && targetPiece.color === piece.color) return false;

    // Get valid moves for this piece (without check validation to avoid infinite recursion)
    const validMoves = this.getValidMovesForPiece(gameState, piece, false);
    const isValidMove = validMoves.some(move => move.row === to.row && move.col === to.col);
    
    if (!isValidMove) return false;

    // Now check if this move would leave the king in check
    return !this.wouldMoveCauseCheck(gameState, from, to);
  }

  /**
   * Get all valid moves for a specific piece
   */
  getValidMovesForPiece(gameState: GameState, piece: ChessPiece, skipCheckValidation: boolean = true): Position[] {
    let moves: Position[] = [];
    
    switch (piece.type) {
      case 'pawn':
        moves = this.getPawnMoves(gameState, piece);
        break;
      case 'rook':
        moves = this.getRookMoves(gameState, piece);
        break;
      case 'knight':
        moves = this.getKnightMoves(gameState, piece);
        break;
      case 'bishop':
        moves = this.getBishopMoves(gameState, piece);
        break;
      case 'queen':
        moves = this.getQueenMoves(gameState, piece);
        break;
      case 'king':
        moves = this.getKingMoves(gameState, piece);
        break;
      default:
        return [];
    }

    // Filter out moves that would put own king in check (unless explicitly skipped)
    if (!skipCheckValidation) {
      moves = moves.filter(to => !this.wouldMoveCauseCheck(gameState, piece.position, to));
    }

    return moves;
  }

  /**
   * Get valid moves for a pawn
   */
  private getPawnMoves(gameState: GameState, piece: ChessPiece): Position[] {
    const moves: Position[] = [];
    const { row, col } = piece.position;
    const direction = piece.color === 'white' ? -1 : 1; // White moves up (negative), black moves down (positive)
    const startRow = piece.color === 'white' ? 6 : 1;

    // Forward move
    const oneForward = { row: row + direction, col };
    if (this.isPositionEmpty(gameState.board, oneForward)) {
      moves.push(oneForward);

      // Two squares forward from starting position
      if (row === startRow) {
        const twoForward = { row: row + 2 * direction, col };
        if (this.isPositionEmpty(gameState.board, twoForward)) {
          moves.push(twoForward);
        }
      }
    }

    // Diagonal captures
    const captureLeft = { row: row + direction, col: col - 1 };
    const captureRight = { row: row + direction, col: col + 1 };

    if (this.canCapture(gameState.board, captureLeft, piece.color)) {
      moves.push(captureLeft);
    }
    if (this.canCapture(gameState.board, captureRight, piece.color)) {
      moves.push(captureRight);
    }

    // En passant
    if (gameState.enPassantTarget) {
      if (
        Math.abs(gameState.enPassantTarget.col - col) === 1 &&
        gameState.enPassantTarget.row === row + direction
      ) {
        moves.push(gameState.enPassantTarget);
      }
    }

    return moves.filter(pos => this.isWithinBoard(pos));
  }

  /**
   * Get valid moves for a rook
   */
  private getRookMoves(gameState: GameState, piece: ChessPiece): Position[] {
    const moves: Position[] = [];
    const { row, col } = piece.position;

    // Horizontal and vertical directions
    const directions = [
      { row: 0, col: 1 },   // Right
      { row: 0, col: -1 },  // Left
      { row: 1, col: 0 },   // Down
      { row: -1, col: 0 },  // Up
    ];

    for (const direction of directions) {
      moves.push(...this.getMovesInDirection(gameState.board, piece.position, direction, piece.color));
    }

    return moves;
  }

  /**
   * Get valid moves for a knight
   */
  private getKnightMoves(gameState: GameState, piece: ChessPiece): Position[] {
    const moves: Position[] = [];
    const { row, col } = piece.position;

    const knightMoves = [
      { row: row + 2, col: col + 1 },
      { row: row + 2, col: col - 1 },
      { row: row - 2, col: col + 1 },
      { row: row - 2, col: col - 1 },
      { row: row + 1, col: col + 2 },
      { row: row + 1, col: col - 2 },
      { row: row - 1, col: col + 2 },
      { row: row - 1, col: col - 2 },
    ];

    return knightMoves.filter(pos => 
      this.isWithinBoard(pos) && 
      (this.isPositionEmpty(gameState.board, pos) || this.canCapture(gameState.board, pos, piece.color))
    );
  }

  /**
   * Get valid moves for a bishop
   */
  private getBishopMoves(gameState: GameState, piece: ChessPiece): Position[] {
    const moves: Position[] = [];

    // Diagonal directions
    const directions = [
      { row: 1, col: 1 },   // Down-right
      { row: 1, col: -1 },  // Down-left
      { row: -1, col: 1 },  // Up-right
      { row: -1, col: -1 }, // Up-left
    ];

    for (const direction of directions) {
      moves.push(...this.getMovesInDirection(gameState.board, piece.position, direction, piece.color));
    }

    return moves;
  }

  /**
   * Get valid moves for a queen (combination of rook and bishop)
   */
  private getQueenMoves(gameState: GameState, piece: ChessPiece): Position[] {
    return [
      ...this.getRookMoves(gameState, piece),
      ...this.getBishopMoves(gameState, piece),
    ];
  }

  /**
   * Get valid moves for a king
   */
  private getKingMoves(gameState: GameState, piece: ChessPiece): Position[] {
    const moves: Position[] = [];
    const { row, col } = piece.position;

    // All adjacent squares
    for (let dRow = -1; dRow <= 1; dRow++) {
      for (let dCol = -1; dCol <= 1; dCol++) {
        if (dRow === 0 && dCol === 0) continue;
        
        const newPos = { row: row + dRow, col: col + dCol };
        if (
          this.isWithinBoard(newPos) &&
          (this.isPositionEmpty(gameState.board, newPos) || this.canCapture(gameState.board, newPos, piece.color))
        ) {
          moves.push(newPos);
        }
      }
    }

    // Castling
    if (!piece.hasMoved && !gameState.isInCheck) {
      moves.push(...this.getCastlingMoves(gameState, piece));
    }

    return moves;
  }

  /**
   * Get castling moves for the king
   */
  private getCastlingMoves(gameState: GameState, king: ChessPiece): Position[] {
    const moves: Position[] = [];
    const { row, col } = king.position;

    // King-side castling
    if (
      (king.color === 'white' && gameState.castlingRights.whiteKingSide) ||
      (king.color === 'black' && gameState.castlingRights.blackKingSide)
    ) {
      if (
        this.isPositionEmpty(gameState.board, { row, col: col + 1 }) &&
        this.isPositionEmpty(gameState.board, { row, col: col + 2 }) &&
        !this.isPositionUnderAttack(gameState, { row, col: col + 1 }, king.color === 'white' ? 'black' : 'white') &&
        !this.isPositionUnderAttack(gameState, { row, col: col + 2 }, king.color === 'white' ? 'black' : 'white')
      ) {
        moves.push({ row, col: col + 2 });
      }
    }

    // Queen-side castling
    if (
      (king.color === 'white' && gameState.castlingRights.whiteQueenSide) ||
      (king.color === 'black' && gameState.castlingRights.blackQueenSide)
    ) {
      if (
        this.isPositionEmpty(gameState.board, { row, col: col - 1 }) &&
        this.isPositionEmpty(gameState.board, { row, col: col - 2 }) &&
        this.isPositionEmpty(gameState.board, { row, col: col - 3 }) &&
        !this.isPositionUnderAttack(gameState, { row, col: col - 1 }, king.color === 'white' ? 'black' : 'white') &&
        !this.isPositionUnderAttack(gameState, { row, col: col - 2 }, king.color === 'white' ? 'black' : 'white')
      ) {
        moves.push({ row, col: col - 2 });
      }
    }

    return moves;
  }

  /**
   * Get moves in a specific direction until blocked
   */
  private getMovesInDirection(
    board: (ChessPiece | null)[][],
    start: Position,
    direction: { row: number; col: number },
    color: PieceColor
  ): Position[] {
    const moves: Position[] = [];
    let currentPos = {
      row: start.row + direction.row,
      col: start.col + direction.col,
    };

    while (this.isWithinBoard(currentPos)) {
      if (this.isPositionEmpty(board, currentPos)) {
        moves.push({ ...currentPos });
      } else if (this.canCapture(board, currentPos, color)) {
        moves.push({ ...currentPos });
        break; // Can't move further after capture
      } else {
        break; // Blocked by own piece
      }

      currentPos.row += direction.row;
      currentPos.col += direction.col;
    }

    return moves;
  }

  /**
   * Execute a move and return the new game state
   */
  makeMove(gameState: GameState, from: Position, to: Position): GameState {
    if (!this.isValidMove(gameState, from, to)) {
      throw new Error('Invalid move');
    }

    const newBoard = gameState.board.map(row => [...row]);
    const piece = newBoard[from.row][from.col]!;
    const capturedPiece = newBoard[to.row][to.col];

    // Create the move object
    const move: Move = {
      from,
      to,
      piece: { ...piece },
      capturedPiece: capturedPiece || undefined,
      timestamp: Date.now(),
    };

    // Update piece position
    piece.position = to;
    piece.hasMoved = true;

    // Move the piece
    newBoard[to.row][to.col] = piece;
    newBoard[from.row][from.col] = null;

    // Handle special moves
    this.handleSpecialMoves(newBoard, move, gameState);

    const newGameState: GameState = {
      ...gameState,
      board: newBoard,
      currentTurn: gameState.currentTurn === 'white' ? 'black' : 'white',
      moves: [...gameState.moves, move],
      lastMove: move,
      selectedPiece: null,
      validMoves: [],
    };

    // Update castling rights
    this.updateCastlingRights(newGameState, move);

    // Update en passant target
    this.updateEnPassantTarget(newGameState, move);

    // Check for check, checkmate, or stalemate
    this.updateGameStatus(newGameState);

    return newGameState;
  }

  /**
   * Handle special moves like castling, en passant, and pawn promotion
   */
  private handleSpecialMoves(board: (ChessPiece | null)[][], move: Move, gameState: GameState): void {
    const { piece, from, to } = move;

    // Castling
    if (piece.type === 'king' && Math.abs(to.col - from.col) === 2) {
      move.isCastling = true;
      const rookFromCol = to.col > from.col ? 7 : 0;
      const rookToCol = to.col > from.col ? to.col - 1 : to.col + 1;
      
      const rook = board[from.row][rookFromCol]!;
      rook.position = { row: from.row, col: rookToCol };
      rook.hasMoved = true;
      
      board[from.row][rookToCol] = rook;
      board[from.row][rookFromCol] = null;
    }

    // En passant
    if (
      piece.type === 'pawn' &&
      gameState.enPassantTarget &&
      to.row === gameState.enPassantTarget.row &&
      to.col === gameState.enPassantTarget.col
    ) {
      move.isEnPassant = true;
      const capturedPawnRow = piece.color === 'white' ? to.row + 1 : to.row - 1;
      move.capturedPiece = board[capturedPawnRow][to.col] || undefined;
      board[capturedPawnRow][to.col] = null;
    }

    // Pawn promotion (automatically to queen for now)
    if (piece.type === 'pawn' && (to.row === 0 || to.row === 7)) {
      piece.type = 'queen';
      move.promotionPiece = 'queen';
    }
  }

  /**
   * Update castling rights based on the move
   */
  private updateCastlingRights(gameState: GameState, move: Move): void {
    const { piece, from } = move;

    // King moved
    if (piece.type === 'king') {
      if (piece.color === 'white') {
        gameState.castlingRights.whiteKingSide = false;
        gameState.castlingRights.whiteQueenSide = false;
      } else {
        gameState.castlingRights.blackKingSide = false;
        gameState.castlingRights.blackQueenSide = false;
      }
    }

    // Rook moved or was captured
    if (piece.type === 'rook' || move.capturedPiece?.type === 'rook') {
      const positions = [
        { row: 0, col: 0, right: 'blackQueenSide' as const },
        { row: 0, col: 7, right: 'blackKingSide' as const },
        { row: 7, col: 0, right: 'whiteQueenSide' as const },
        { row: 7, col: 7, right: 'whiteKingSide' as const },
      ];

      for (const pos of positions) {
        if ((from.row === pos.row && from.col === pos.col) || 
            (move.to.row === pos.row && move.to.col === pos.col)) {
          gameState.castlingRights[pos.right] = false;
        }
      }
    }
  }

  /**
   * Update en passant target square
   */
  private updateEnPassantTarget(gameState: GameState, move: Move): void {
    const { piece, from, to } = move;

    gameState.enPassantTarget = null;

    // Check if pawn moved two squares
    if (piece.type === 'pawn' && Math.abs(to.row - from.row) === 2) {
      gameState.enPassantTarget = {
        row: (from.row + to.row) / 2,
        col: to.col,
      };
    }
  }

  /**
   * Update game status (check, checkmate, stalemate)
   */
  private updateGameStatus(gameState: GameState): void {
    const currentPlayerInCheck = this.isInCheck(gameState, gameState.currentTurn);
    const hasValidMoves = this.hasValidMoves(gameState, gameState.currentTurn);

    gameState.isInCheck = currentPlayerInCheck;

    if (currentPlayerInCheck && !hasValidMoves) {
      gameState.gameStatus = 'finished';
      gameState.gameResult = gameState.currentTurn === 'white' ? 'black-wins' : 'white-wins';
    } else if (!hasValidMoves) {
      gameState.gameStatus = 'finished';
      gameState.gameResult = 'draw';
    } else {
      gameState.gameStatus = 'playing';
    }
  }

  /**
   * Check if a player is in check
   */
  private isInCheck(gameState: GameState, color: PieceColor): boolean {
    const king = this.findKing(gameState.board, color);
    if (!king) return false;

    const opponentColor = color === 'white' ? 'black' : 'white';
    return this.isPositionUnderAttack(gameState, king.position, opponentColor);
  }

  /**
   * Check if a move would cause the moving player's king to be in check
   */
  private wouldMoveCauseCheck(gameState: GameState, from: Position, to: Position): boolean {
    // Simulate the move
    const testBoard = gameState.board.map(row => [...row]);
    const piece = testBoard[from.row][from.col];
    if (!piece) return false;

    // Make the move temporarily
    const capturedPiece = testBoard[to.row][to.col];
    testBoard[to.row][to.col] = piece;
    testBoard[from.row][from.col] = null;

    // Find the king of the moving player
    const king = this.findKing(testBoard, piece.color);
    if (!king) return true; // If no king found, consider it check (shouldn't happen)

    // Check if king would be under attack after the move
    const kingPosition = piece.type === 'king' ? to : king.position;
    const opponentColor = piece.color === 'white' ? 'black' : 'white';
    
    // Check if any opponent piece can attack the king position
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const opponentPiece = testBoard[row][col];
        if (opponentPiece && opponentPiece.color === opponentColor) {
          const attackMoves = this.getValidMovesForPiece({
            ...gameState,
            board: testBoard
          }, opponentPiece, true); // Skip check validation to avoid recursion
          
          if (attackMoves.some(move => move.row === kingPosition.row && move.col === kingPosition.col)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * Check if a player has any valid moves
   */
  private hasValidMoves(gameState: GameState, color: PieceColor): boolean {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = gameState.board[row][col];
        if (piece && piece.color === color) {
          const validMoves = this.getValidMovesForPiece(gameState, piece, false); // Include check validation
          if (validMoves.length > 0) {
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * Find the king of a specific color
   */
  private findKing(board: (ChessPiece | null)[][], color: PieceColor): ChessPiece | null {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.type === 'king' && piece.color === color) {
          return piece;
        }
      }
    }
    return null;
  }

  /**
   * Check if a position is under attack by opponent pieces
   */
  private isPositionUnderAttack(gameState: GameState, position: Position, attackerColor: PieceColor): boolean {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = gameState.board[row][col];
        if (piece && piece.color === attackerColor) {
          const validMoves = this.getValidMovesForPiece(gameState, piece, true); // Skip check validation to avoid recursion
          if (validMoves.some(move => move.row === position.row && move.col === position.col)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * Utility functions
   */
  private isWithinBoard(position: Position): boolean {
    return position.row >= 0 && position.row < 8 && position.col >= 0 && position.col < 8;
  }

  private isPositionEmpty(board: (ChessPiece | null)[][], position: Position): boolean {
    if (!this.isWithinBoard(position)) return false;
    return board[position.row][position.col] === null;
  }

  private canCapture(board: (ChessPiece | null)[][], position: Position, attackerColor: PieceColor): boolean {
    if (!this.isWithinBoard(position)) return false;
    const piece = board[position.row][position.col];
    return piece !== null && piece.color !== attackerColor;
  }
}

export const chessEngine = ChessEngine.getInstance();