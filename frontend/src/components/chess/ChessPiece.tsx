/**
 * Chess Piece Component
 * Renders individual chess pieces with drag and drop functionality
 */

'use client';

import React from 'react';
import { ChessPiece as ChessPieceType } from '@/types/chess';

interface ChessPieceProps {
  piece: ChessPieceType;
  isSelected: boolean;
  isDragging: boolean;
  onPieceClick: (piece: ChessPieceType) => void;
  onDragStart: (piece: ChessPieceType, event: React.DragEvent) => void;
  onDragEnd: (event: React.DragEvent) => void;
}

// Unicode chess piece symbols
const PIECE_SYMBOLS: Record<string, string> = {
  'white-king': '♔',
  'white-queen': '♕',
  'white-rook': '♖',
  'white-bishop': '♗',
  'white-knight': '♘',
  'white-pawn': '♙',
  'black-king': '♚',
  'black-queen': '♛',
  'black-rook': '♜',
  'black-bishop': '♝',
  'black-knight': '♞',
  'black-pawn': '♟',
};

export const ChessPiece: React.FC<ChessPieceProps> = ({
  piece,
  isSelected,
  isDragging,
  onPieceClick,
  onDragStart,
  onDragEnd,
}) => {
  const pieceKey = `${piece.color}-${piece.type}`;
  const symbol = PIECE_SYMBOLS[pieceKey];

  return (
    <div
      className={`
        absolute inset-0 flex items-center justify-center
        cursor-pointer select-none transition-all duration-200
        ${isSelected ? 'z-20 scale-110' : 'z-10'}
        ${isDragging ? 'opacity-50' : 'opacity-100'}
        hover:scale-105 active:scale-95
      `}
      onClick={() => onPieceClick(piece)}
      onDragStart={(e) => onDragStart(piece, e)}
      onDragEnd={onDragEnd}
      draggable
    >
      <span
        className={`
          text-4xl md:text-5xl lg:text-6xl font-bold
          ${piece.color === 'white' 
            ? 'text-[#FFE3D8] drop-shadow-[2px_2px_4px_rgba(0,0,0,0.6)]' 
            : 'text-[#150016] drop-shadow-[2px_2px_4px_rgba(255,255,255,0.3)]'
          }
          ${isSelected ? 'text-[#E38681]' : ''}
          transition-all duration-200
        `}
      >
        {symbol}
      </span>
    </div>
  );
};