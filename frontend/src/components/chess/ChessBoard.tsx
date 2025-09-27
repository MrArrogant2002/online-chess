/**
 * Chess Board Component
 * Renders the 8x8 chess board with pieces and handles user interactions
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { ChessPiece } from './ChessPiece';
import { PawnPromotionDialog } from './PawnPromotionDialog';
import { ChessPiece as ChessPieceType, Position, GameState, PieceType } from '@/types/chess';
import { chessEngine } from '@/utils/chessEngine';

interface ChessBoardProps {
  gameState: GameState;
  isPlayerTurn: boolean;
  playerColor: 'white' | 'black';
  onMove: (from: Position, to: Position, promotionPiece?: PieceType) => void;
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
  const [pendingPromotion, setPendingPromotion] = useState<{from: Position, to: Position} | null>(null);

  // Debug pendingPromotion state changes
  React.useEffect(() => {
    console.log('🔄 pendingPromotion state changed:', pendingPromotion);
  }, [pendingPromotion]);

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
      // Check if this is a pawn promotion move
      const isPromotion = selectedPiece.type === 'pawn' && (targetPosition.row === 0 || targetPosition.row === 7);
      
      console.log('🔍 Move validation:', {
        piece: selectedPiece.type,
        from: selectedPiece.position,
        to: targetPosition,
        isPromotion
      });
      
      if (isPromotion) {
        console.log('🏰 Showing pawn promotion dialog');
        // Show promotion dialog
        setPendingPromotion({ from: selectedPiece.position, to: targetPosition });
      } else {
        // Regular move
        onMove(selectedPiece.position, targetPosition);
      }
      
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
      // Check if this is a pawn promotion move
      const isPromotion = draggedPiece.type === 'pawn' && (targetPosition.row === 0 || targetPosition.row === 7);
      
      console.log('🔍 Drag move validation:', {
        piece: draggedPiece.type,
        from: draggedPiece.position,
        to: targetPosition,
        isPromotion
      });
      
      if (isPromotion) {
        console.log('🏰 Showing pawn promotion dialog (drag)');
        // Show promotion dialog
        setPendingPromotion({ from: draggedPiece.position, to: targetPosition });
      } else {
        // Regular move
        onMove(draggedPiece.position, targetPosition);
      }
    }

    setDraggedPiece(null);
    setSelectedPiece(null);
    setValidMoves([]);
  }, [draggedPiece, validMoves, onMove]);

  // Handle drag over (required for drop to work)
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  // Handle pawn promotion selection
  const handlePromotionSelect = useCallback((pieceType: PieceType) => {
    console.log('👑 Promotion piece selected:', pieceType);
    if (pendingPromotion) {
      console.log('📤 Sending promotion move:', {
        from: pendingPromotion.from,
        to: pendingPromotion.to,
        promotionPiece: pieceType
      });
      onMove(pendingPromotion.from, pendingPromotion.to, pieceType);
      setPendingPromotion(null);
    }
  }, [pendingPromotion, onMove]);

  // Handle pawn promotion cancel
  const handlePromotionCancel = useCallback(() => {
    setPendingPromotion(null);
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
              relative aspect-square group
              ${isLight 
                ? 'bg-gradient-to-br from-slate-200 to-slate-300' 
                : 'bg-gradient-to-br from-slate-700 to-slate-800'
              }
              ${isSelected 
                ? 'ring-4 ring-purple-500 ring-opacity-80 ring-inset shadow-lg shadow-purple-500/50' 
                : ''
              }
              ${isLastMoveSquare 
                ? 'bg-gradient-to-br from-purple-500/30 to-indigo-500/20 shadow-inner' 
                : ''
              }
              ${isValidMoveTarget ? 'cursor-pointer hover:scale-105' : ''}
              transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)
              border border-slate-600/20
              ${isValidMoveTarget ? 'hover:shadow-lg hover:shadow-purple-500/20' : ''}
              ${isLight ? 'hover:from-slate-100 hover:to-slate-200' : 'hover:from-slate-600 hover:to-slate-700'}
            `}
            onClick={() => handleSquareClick(actualRow, actualCol)}
            onDrop={(e) => handleDrop(actualRow, actualCol, e)}
            onDragOver={handleDragOver}
          >
            {/* Valid move indicator */}
            {isValidMoveTarget && (
              <div className={`
                absolute inset-0 flex items-center justify-center
                ${piece ? 'border-4 border-purple-500 border-opacity-80 rounded-full m-1 shadow-lg shadow-purple-500/50' : ''}
              `}>
                {!piece && (
                  <div className="w-4 h-4 bg-purple-500 rounded-full opacity-80 shadow-lg shadow-purple-500/50 animate-pulse" />
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
              <div className={`
                absolute left-1 top-1 text-xs font-bold opacity-70 select-none transition-opacity duration-200
                ${isLight ? 'text-slate-700' : 'text-slate-300'}
              `}>
                {isFlipped ? row + 1 : 8 - row}
              </div>
            )}
            {row === 7 && (
              <div className={`
                absolute right-1 bottom-1 text-xs font-bold opacity-70 select-none transition-opacity duration-200
                ${isLight ? 'text-slate-700' : 'text-slate-300'}
              `}>
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
      <div className="grid grid-cols-8 gap-0 border-4 border-[#29104A] rounded-xl overflow-hidden shadow-2xl bg-[#29104A] ring-2 ring-[#522C5D]/30">
        {renderSquares}
      </div>

      {/* Check indicator */}
      {gameState.isInCheck && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 glass bg-red-500/90 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg shadow-red-500/50 animate-pulse">
          CHECK!
        </div>
      )}

      {/* Turn indicator */}
      <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-center">
        <div className={`
          px-4 py-2 rounded-lg font-bold text-sm shadow-lg glass transition-all duration-300
          ${isPlayerTurn 
            ? 'bg-purple-500/90 text-white shadow-purple-500/50' 
            : 'bg-slate-600/90 text-slate-200 shadow-slate-600/50'
          }
        `}>
          {isPlayerTurn ? 'Your Turn' : 'Opponent\'s Turn'}
        </div>
      </div>

      {/* Pawn Promotion Dialog */}
      <PawnPromotionDialog
        isOpen={!!pendingPromotion}
        color={playerColor}
        onSelect={handlePromotionSelect}
        onCancel={handlePromotionCancel}
      />
    </div>
  );
};