import React from 'react';
import { Player } from '../types';

interface PitchProps {
  players: Player[];
  formation: string;
  onDropPlayer?: (targetIndex: number, draggedPlayerId: string) => void;
}

export const Pitch: React.FC<PitchProps> = ({ players, formation, onDropPlayer }) => {
  const starters = players.slice(0, 11);
  
  // Coordinates are [top%, left%]
  // top: 0 (top of box) -> 100 (GK)
  // left: 0 (left touchline) -> 100 (right touchline)
  const formations: Record<string, { top: string, left: string }[]> = {
    '4-3-3': [
      { top: '90%', left: '50%' }, // GK
      { top: '70%', left: '15%' }, { top: '70%', left: '38%' }, { top: '70%', left: '62%' }, { top: '70%', left: '85%' }, // DEF
      { top: '45%', left: '50%' }, // CDM
      { top: '40%', left: '30%' }, { top: '40%', left: '70%' }, // CM
      { top: '15%', left: '15%' }, { top: '10%', left: '50%' }, { top: '15%', left: '85%' }  // ATT
    ],
    '4-4-2': [
      { top: '90%', left: '50%' },
      { top: '70%', left: '15%' }, { top: '70%', left: '38%' }, { top: '70%', left: '62%' }, { top: '70%', left: '85%' },
      { top: '40%', left: '15%' }, { top: '40%', left: '38%' }, { top: '40%', left: '62%' }, { top: '40%', left: '85%' },
      { top: '10%', left: '35%' }, { top: '10%', left: '65%' }
    ],
    '4-2-3-1': [
      { top: '90%', left: '50%' }, // GK
      { top: '70%', left: '15%' }, { top: '70%', left: '38%' }, { top: '70%', left: '62%' }, { top: '70%', left: '85%' }, // 4 DEF
      { top: '50%', left: '35%' }, { top: '50%', left: '65%' }, // 2 CDM
      { top: '30%', left: '15%' }, { top: '30%', left: '50%' }, { top: '30%', left: '85%' }, // 3 CAM
      { top: '10%', left: '50%' } // ST
    ],
    '3-5-2': [
      { top: '90%', left: '50%' },
      { top: '75%', left: '25%' }, { top: '75%', left: '50%' }, { top: '75%', left: '75%' }, // 3 CB
      { top: '50%', left: '10%' }, { top: '50%', left: '30%' }, { top: '50%', left: '50%' }, { top: '50%', left: '70%' }, { top: '50%', left: '90%' }, // 5 MID
      { top: '15%', left: '35%' }, { top: '15%', left: '65%' } // 2 ST
    ],
    '5-3-2': [
      { top: '90%', left: '50%' },
      { top: '70%', left: '10%' }, { top: '70%', left: '30%' }, { top: '70%', left: '50%' }, { top: '70%', left: '70%' }, { top: '70%', left: '90%' }, // 5 DEF
      { top: '45%', left: '30%' }, { top: '45%', left: '50%' }, { top: '45%', left: '70%' }, // 3 MID
      { top: '15%', left: '35%' }, { top: '15%', left: '65%' } // 2 ST
    ],
    '3-4-3': [
      { top: '90%', left: '50%' },
      { top: '75%', left: '25%' }, { top: '75%', left: '50%' }, { top: '75%', left: '75%' }, // 3 CB
      { top: '50%', left: '15%' }, { top: '50%', left: '38%' }, { top: '50%', left: '62%' }, { top: '50%', left: '85%' }, // 4 MID
      { top: '15%', left: '15%' }, { top: '10%', left: '50%' }, { top: '15%', left: '85%' } // 3 ATT
    ],
    '4-1-4-1': [
      { top: '90%', left: '50%' },
      { top: '70%', left: '15%' }, { top: '70%', left: '38%' }, { top: '70%', left: '62%' }, { top: '70%', left: '85%' },
      { top: '55%', left: '50%' }, // CDM
      { top: '35%', left: '15%' }, { top: '35%', left: '38%' }, { top: '35%', left: '62%' }, { top: '35%', left: '85%' }, // 4 MID
      { top: '10%', left: '50%' }
    ],
    '4-1-2-1-2': [
      { top: '90%', left: '50%' },
      { top: '70%', left: '15%' }, { top: '70%', left: '38%' }, { top: '70%', left: '62%' }, { top: '70%', left: '85%' },
      { top: '55%', left: '50%' }, // CDM
      { top: '40%', left: '25%' }, { top: '40%', left: '75%' }, // 2 CM
      { top: '25%', left: '50%' }, // CAM
      { top: '10%', left: '35%' }, { top: '10%', left: '65%' }
    ]
  };

  const coords = formations[formation] || formations['4-3-3'];

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
      e.preventDefault();
      const draggedId = e.dataTransfer.getData("playerId");
      if (draggedId && onDropPlayer) {
          onDropPlayer(index, draggedId);
      }
  };

  return (
    <div className="relative w-full aspect-[2/3] max-w-md mx-auto bg-green-800 rounded-lg border-2 border-white/20 shadow-inner overflow-hidden">
        {/* Grass Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_40px]"></div>
        
        {/* Pitch Lines */}
        <div className="absolute top-0 left-[20%] right-[20%] h-[15%] border-b-2 border-x-2 border-white/30"></div>
        <div className="absolute bottom-0 left-[20%] right-[20%] h-[15%] border-t-2 border-x-2 border-white/30"></div>
        <div className="absolute top-1/2 left-0 right-0 border-t-2 border-white/30"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white/30 rounded-full"></div>
        <div className="absolute bottom-[11%] left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>

        {coords.map((pos, i) => {
            const p = starters[i];
            if (!p) return null; // Should not happen if data is correct
            
            return (
                <div 
                    key={i}
                    className="absolute flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 w-16 group transition-all duration-500 ease-in-out cursor-pointer"
                    style={{ top: pos.top, left: pos.left }}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, i)}
                >
                    <div className="w-8 h-8 bg-red-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-xs font-bold text-white z-10 group-hover:scale-110 transition-transform relative">
                        {p.position.charAt(0)}
                        {p.isInjured && <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center text-red-500 font-bold text-[8px]">!</div>}
                    </div>
                    <div className="mt-1 bg-black/50 px-2 py-0.5 rounded text-[10px] text-white truncate max-w-full backdrop-blur-sm group-hover:bg-black/80">
                        {p.name.split(' ').pop()}
                    </div>
                </div>
            )
        })}
    </div>
  );
};