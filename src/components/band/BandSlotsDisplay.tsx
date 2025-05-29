import React from 'react';
import BandSlot from './BandSlot';
import { BandSlot as BandSlotType, Musician, InstrumentKey, DEFAULT_BAND_SLOTS_CONFIG } from '../../types';

interface BandSlotsDisplayProps {
  currentBandSetup: BandSlotType[]; // 當前樂隊各位置的狀態 (包含是否有音樂家)
  onRemoveMusician: (slotId: InstrumentKey) => void;
}

const BandSlotsDisplay: React.FC<BandSlotsDisplayProps> = ({ currentBandSetup, onRemoveMusician }) => {
  return (
    <div style={{ 
      display: 'flex', 
      flexWrap: 'wrap', 
      justifyContent: 'center', 
      gap: '10px', 
      padding: '20px', 
      border: '1px solid #ddd', 
      borderRadius: '8px',
      flexGrow: 1, // 佔據剩餘空間
    }}>
      <h3 style={{ width: '100%', textAlign: 'center', marginBottom: '15px' }}>樂隊陣容 (可放置)</h3>
      {currentBandSetup.map(slot => (
        <BandSlot 
          key={slot.id} 
          slotId={slot.id} 
          label={slot.label} 
          accepts={slot.accepts} 
          currentMusician={slot.musician}
          onRemoveMusician={onRemoveMusician}
        />
      ))}
    </div>
  );
};

export default BandSlotsDisplay; 