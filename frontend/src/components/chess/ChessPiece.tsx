/**
 * Chess Piece Component
 * Renders individual chess pieces with drag and drop functionality
 */

'use client';

import React from 'react';
import { ChessPiece as ChessPieceType } from '@/types/chess';
import { PieceSvg } from './pieces/PieceSvg';

interface ChessPieceProps {
  piece: ChessPieceType;
  isSelected: boolean;
  isDragging: boolean;
  onPieceClick: (piece: ChessPieceType) => void;
  onDragStart: (piece: ChessPieceType, event: React.DragEvent) => void;
  onDragEnd: (event: React.DragEvent) => void;
}

export const ChessPiece: React.FC<ChessPieceProps> = ({
  piece,
  isSelected,
  isDragging,
  onPieceClick,
  onDragStart,
  onDragEnd,
}) => {
  return (
    <div
      className={`
        absolute inset-0 flex items-center justify-center
        cursor-pointer select-none transition-all duration-200
        ${isSelected ? 'z-20 scale-110' : 'z-10'}
        ${isDragging ? 'opacity-50' : 'opacity-100'}
        hover:scale-105 active:scale-95 p-1
      `}
      onClick={() => onPieceClick(piece)}
      onDragStart={(e) => onDragStart(piece, e)}
      onDragEnd={onDragEnd}
      draggable
    >
      <div
        className={`
          w-full h-full transition-all duration-200
          ${isSelected ? 'drop-shadow-[0_0_12px_rgba(227,134,129,0.8)]' : ''}
          ${piece.color === 'white' 
            ? 'drop-shadow-[2px_2px_4px_rgba(0,0,0,0.6)]' 
            : 'drop-shadow-[2px_2px_4px_rgba(255,255,255,0.3)]'
          }
        `}
      >
        <PieceSvg 
          type={piece.type} 
          color={piece.color}
          className={`
            transition-all duration-200
            ${isSelected ? 'brightness-110' : ''}
          `}
        />
      </div>
    </div>
  );
};