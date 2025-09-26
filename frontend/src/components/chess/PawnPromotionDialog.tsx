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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#29104A] border-2 border-[#522C5D] rounded-xl p-6 max-w-md w-full shadow-2xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[#FFE3D8] mb-2">
            Pawn Promotion
          </h2>
          <p className="text-[#845162]">
            Choose which piece to promote your pawn to:
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {promotionOptions.map((pieceType) => (
            <button
              key={pieceType}
              onClick={() => onSelect(pieceType)}
              className="
                aspect-square bg-[#522C5D] hover:bg-[#845162] 
                border-2 border-[#845162] hover:border-[#E38681]
                rounded-lg p-3 transition-all duration-200
                hover:scale-105 active:scale-95
                focus:outline-none focus:ring-2 focus:ring-[#E38681]
              "
            >
              <div className="w-full h-full">
                <PieceSvg 
                  type={pieceType} 
                  color={color}
                  className="filter drop-shadow-md"
                />
              </div>
              <div className="text-xs text-[#FFE3D8] mt-2 capitalize font-semibold">
                {pieceType}
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={onCancel}
          className="
            w-full py-3 bg-[#522C5D] hover:bg-[#845162]
            border border-[#845162] hover:border-[#E38681]
            text-[#FFE3D8] rounded-lg transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-[#E38681]
          "
        >
          Cancel
        </button>
      </div>
    </div>
  );
};