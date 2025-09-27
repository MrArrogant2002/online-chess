/**
 * Pawn Promotion Dialog Component
 * Allows player to choose which piece to promote pawn to
 */

'use client';

import React from 'react';
import { PieceType, PieceColor } from '@/types/chess';
import { PieceSvg } from './pieces/PieceSvg';

interface PawnPromotionDialogProps {
  isOpen: boolean;
  color: PieceColor;
  onSelect: (pieceType: PieceType) => void;
  onCancel: () => void;
}

const promotionOptions: PieceType[] = ['queen', 'rook', 'bishop', 'knight'];

export const PawnPromotionDialog: React.FC<PawnPromotionDialogProps> = ({
  isOpen,
  color,
  onSelect,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 glass-strong flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="card-modern max-w-md w-full shadow-2xl animate-scale-in">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            Pawn Promotion
          </h2>
          <p className="text-slate-300">
            Choose which piece to promote your pawn to:
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {promotionOptions.map((pieceType) => (
            <button
              key={pieceType}
              onClick={() => onSelect(pieceType)}
              className="
                aspect-square glass hover:glass-strong
                border border-slate-600/50 hover:border-purple-500/80
                rounded-lg p-3 transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)
                hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-purple-500/20
                focus:outline-none focus:ring-2 focus:ring-purple-500
                group
              "
            >
              <div className="w-full h-full">
                <PieceSvg 
                  type={pieceType} 
                  color={color}
                  className="filter drop-shadow-lg group-hover:drop-shadow-xl transition-all duration-300"
                />
              </div>
              <div className="text-xs text-slate-200 mt-2 capitalize font-semibold group-hover:text-white transition-colors duration-200">
                {pieceType}
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={onCancel}
          className="
            w-full py-3 glass hover:glass-strong
            border border-slate-600/50 hover:border-red-400/80
            text-slate-200 hover:text-white rounded-lg 
            transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)
            hover:shadow-lg hover:shadow-red-400/20
            focus:outline-none focus:ring-2 focus:ring-red-400
          "
        >
          Cancel
        </button>
      </div>
    </div>
  );
};