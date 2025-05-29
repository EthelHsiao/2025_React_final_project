import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Musician, InstrumentKey, DEFAULT_BAND_SLOTS_CONFIG } from '../../types';

interface BandSlotProps {
  slotId: InstrumentKey; // 此插槽的唯一標識 e.g. 'electric_guitar'
  label: string;        // UI 顯示的標籤 e.g. "電吉他"
  accepts: InstrumentKey[]; // 此插槽接受的樂器類型
  currentMusician: Musician | null; // 當前放置在此插槽的音樂家
  onRemoveMusician: (slotId: InstrumentKey) => void; // 新增移除音樂家的 callback
}

const BandSlot: React.FC<BandSlotProps> = ({ slotId, label, accepts, currentMusician, onRemoveMusician }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `slot-${slotId}`, // Droppable ID，必須唯一
    data: {
      accepts: accepts, // 讓拖曳事件知道此插槽接受哪些樂器
      slotId: slotId,
    },
  });

  const style = {
    border: isOver ? '2px solid green' : '2px dashed #ccc',
    padding: '20px',
    margin: '10px',
    minHeight: '120px',
    minWidth: '150px',
    maxWidth: '180px',
    borderRadius: '8px',
    backgroundColor: isOver ? '#e6ffe6' : (currentMusician ? '#f0f8ff' : '#fafafa'),
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center' as 'center',
    transition: 'border-color 0.2s ease-in-out, background-color 0.2s ease-in-out',
  };

  return (
    <div ref={setNodeRef} style={style}>
      <strong>{label}</strong>
      {currentMusician ? (
        <div style={{ marginTop: '10px', fontSize: '0.9em' }}>
          <p><strong>{currentMusician.name}</strong></p>
          <p style={{ fontSize: '0.8em', color: '#333' }}>
            {DEFAULT_BAND_SLOTS_CONFIG.find(s => s.id === currentMusician.primaryInstrument)?.label || currentMusician.primaryInstrument}
            {' '}(技能: {currentMusician.skillLevel})
          </p>
          <p style={{ fontSize: '0.7em', color: '#666' }}>風格: {currentMusician.styles.join(', ')}</p>
          {currentMusician.primaryInstrument.includes('vocal') && currentMusician.vocalRange && (
            <p style={{ fontSize: '0.7em', color: '#666' }}>音域: {currentMusician.vocalRange}</p>
          )}
          <button 
            onClick={() => onRemoveMusician(slotId)}
            style={{ fontSize: '0.7em', padding: '3px 6px', marginTop: '5px', cursor: 'pointer' }}
          >
            移除
          </button>
        </div>
      ) : (
        <p style={{ color: '#888', marginTop: '10px' }}>將音樂家拖放到此處</p>
      )}
    </div>
  );
};

export default BandSlot; 