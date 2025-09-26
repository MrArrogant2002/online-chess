/**
 * Chess Board Component
 * Renders the 8x8 chess board with pieces and handles user interactions
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { ChessPiece } from './ChessPiece';
import { ChessPiece as ChessPieceType, Position, GameState } from '@/types/chess';
import { chessEngine } from '@/utils/chessEngine';

interface ChessBoardProps {
  gameState: GameState;
  isPlayerTurn: boolean;
  playerColor: 'white' | 'black';
  onMove: (from: Position, to: Position) => void;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  gameState,
  isPlayerTurn,
  playerColor,
  onMove,
}) => {
  const [selectedPiece, setSelectedPiece] = useState<ChessPieceType | null>(null);
  const [draggedPiece, setDraggedPiece] = useState<ChessPieceType | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);

  // Board orientation - flip for black player
  const isFlipped = playerColor === 'black';

  // Get valid moves for selected piece
  const getValidMovesForPiece = useCallback((piece: ChessPieceType): Position[] => {
    if (!isPlayerTurn || piece.color !== playerColor) return [];
    return chessEngine.getValidMovesForPiece(gameState, piece);
  }, [gameState, isPlayerTurn, playerColor]);

  // Handle piece selection
  const handlePieceClick = useCallback((piece: ChessPieceType) => {
    if (!isPlayerTurn || piece.color !== playerColor) return;

    if (selectedPiece?.id === piece.id) {
      // Deselect if clicking the same piece
      setSelectedPiece(null);
      setValidMoves([]);
    } else {
      // Select new piece
      setSelectedPiece(piece);
      const moves = getValidMovesForPiece(piece);
      setValidMoves(moves);
    }
  }, [selectedPiece, isPlayerTurn, playerColor, getValidMovesForPiece]);

  // Handle square click (for moving pieces)
  const handleSquareClick = useCallback((row: number, col: number) => {
    if (!selectedPiece || !isPlayerTurn) return;

    const targetPosition = { row, col };
    const isValidMove = validMoves.some(move => 
      move.row === targetPosition.row && move.col === targetPosition.col
    );

    if (isValidMove) {
      onMove(selectedPiece.position, targetPosition);
      setSelectedPiece(null);
      setValidMoves([]);
    }
  }, [selectedPiece, validMoves, isPlayerTurn, onMove]);

  // Handle drag start
  const handleDragStart = useCallback((piece: ChessPieceType, event: React.DragEvent) => {
    if (!isPlayerTurn || piece.color !== playerColor) {
      event.preventDefault();
      return;
    }

    setDraggedPiece(piece);
    setSelectedPiece(piece);
    const moves = getValidMovesForPiece(piece);
    setValidMoves(moves);

    // Set drag data
    event.dataTransfer.setData('text/plain', JSON.stringify({
      from: piece.position,
      pieceId: piece.id,
    }));
  }, [isPlayerTurn, playerColor, getValidMovesForPiece]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setDraggedPiece(null);
  }, []);

  // Handle drop
  const handleDrop = useCallback((row: number, col: number, event: React.DragEvent) => {
    event.preventDefault();
    
    if (!draggedPiece) return;

    const targetPosition = { row, col };
    const isValidMove = validMoves.some(move => 
      move.row === targetPosition.row && move.col === targetPosition.col
    );

    if (isValidMove) {
      onMove(draggedPiece.position, targetPosition);
    }

    setDraggedPiece(null);
    setSelectedPiece(null);
    setValidMoves([]);
  }, [draggedPiece, validMoves, onMove]);

  // Handle drag over (required for drop to work)
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  // Render board squares
  const renderSquares = useMemo(() => {
    const squares = [];
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const actualRow = isFlipped ? 7 - row : row;
        const actualCol = isFlipped ? 7 - col : col;
        
        const piece = gameState.board[actualRow][actualCol];
        const isLight = (row + col) % 2 === 0;
        const isSelected = Boolean(selectedPiece && 
          selectedPiece.position.row === actualRow && 
          selectedPiece.position.col === actualCol);
        const isValidMoveTarget = validMoves.some(move => 
          move.row === actualRow && move.col === actualCol
        );
        const isLastMoveSquare = gameState.lastMove && (
          (gameState.lastMove.from.row === actualRow && gameState.lastMove.from.col === actualCol) ||
          (gameState.lastMove.to.row === actualRow && gameState.lastMove.to.col === actualCol)
        );

        squares.push(
          <div
            key={`${actualRow}-${actualCol}`}
            className={`
              relative aspect-square border border-[#29104A]/20
              ${isLight ? 'bg-[#FFE3D8]' : 'bg-[#845162]'}
              ${isSelected ? 'ring-4 ring-[#E38681] ring-opacity-70' : ''}
              ${isLastMoveSquare ? 'bg-[#E38681]/30' : ''}
              ${isValidMoveTarget ? 'cursor-pointer' : ''}
              transition-all duration-200
            `}
            onClick={() => handleSquareClick(actualRow, actualCol)}
            onDrop={(e) => handleDrop(actualRow, actualCol, e)}
            onDragOver={handleDragOver}
          >
            {/* Valid move indicator */}
            {isValidMoveTarget && (
              <div className={`
                absolute inset-0 flex items-center justify-center
                ${piece ? 'border-4 border-[#E38681] border-opacity-70 rounded-full' : ''}
              `}>
                {!piece && (
                  <div className="w-6 h-6 bg-[#E38681] rounded-full opacity-70" />
                )}
              </div>
            )}

            {/* Chess piece */}
            {piece && (
              <ChessPiece
                piece={piece}
                isSelected={isSelected}
                isDragging={draggedPiece?.id === piece.id}
                onPieceClick={handlePieceClick}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              />
            )}

            {/* Coordinate labels */}
            {col === 0 && (
              <div className="absolute left-1 top-1 text-xs font-semibold text-[#29104A] opacity-60">
                {isFlipped ? row + 1 : 8 - row}
              </div>
            )}
            {row === 7 && (
              <div className="absolute right-1 bottom-1 text-xs font-semibold text-[#29104A] opacity-60">
                {String.fromCharCode(97 + (isFlipped ? 7 - col : col))}
              </div>
            )}
          </div>
        );
      }
    }
    
    return squares;
  }, [
    gameState.board,
    gameState.lastMove,
    isFlipped,
    selectedPiece,
    validMoves,
    draggedPiece,
    handlePieceClick,
    handleSquareClick,
    handleDragStart,
    handleDragEnd,
    handleDrop,
    handleDragOver,
  ]);

  return (
    <div className="relative">
      {/* Board container */}
      <div className="grid grid-cols-8 gap-0 border-4 border-[#29104A] rounded-lg overflow-hidden shadow-2xl bg-[#29104A]">
        {renderSquares}
      </div>

      {/* Check indicator */}
      {gameState.isInCheck && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg">
          CHECK!
        </div>
      )}

      {/* Turn indicator */}
      <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-center">
        <div className={`
          px-4 py-2 rounded-lg font-bold text-sm shadow-lg
          ${isPlayerTurn 
            ? 'bg-[#E38681] text-[#150016]' 
            : 'bg-[#29104A] text-[#FFE3D8]'
          }
        `}>
          {isPlayerTurn ? 'Your Turn' : 'Opponent\'s Turn'}
        </div>
      </div>
    </div>
  );
};