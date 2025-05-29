import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Musician, DEFAULT_BAND_SLOTS_CONFIG, DraggableMusician } from '../../types';

interface MusicianCardProps {
  musician: Musician; // 完整的音樂家數據
  // id for draggable should be unique string for the draggable item
  // We use musician.id + musician.primaryInstrument to make it unique 
  // if a musician has multiple instrument skills (future enhancement)
  draggableId: string; 
}

const MusicianCard: React.FC<MusicianCardProps> = ({ musician, draggableId }) => {
  const draggableData: DraggableMusician = {
      musicianId: musician.id,
      instrument: musician.primaryInstrument
  };

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: draggableId,
    data: draggableData, // 將音樂家數據附加到拖曳事件
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    marginBottom: '10px',
    backgroundColor: isDragging ? '#f0f0f0' : 'white',
    opacity: isDragging ? 0.7 : 1,
    cursor: 'grab',
    minWidth: '150px',
    boxShadow: isDragging ? '0 4px 8px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.1)',
    transition: 'box-shadow 0.2s ease-in-out, background-color 0.2s ease-in-out',
  };

  // 游標懸浮放大效果 (簡易 CSS)
  const [isHovered, setIsHovered] = React.useState(false);
  const hoverStyle = {
    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
    transition: 'transform 0.2s ease-in-out',
  };

  return (
    <div 
      ref={setNodeRef} 
      style={{...style, ...hoverStyle}} 
      {...listeners} 
      {...attributes}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <strong>{musician.name}</strong>
      <p style={{ margin: '5px 0 0', fontSize: '0.9em' }}>
        {DEFAULT_BAND_SLOTS_CONFIG.find(s => s.id === musician.primaryInstrument)?.label || musician.primaryInstrument}
      </p>
      <p style={{ margin: '2px 0 0', fontSize: '0.8em', color: '#555' }}>
        技能: {musician.skillLevel} | 風格: {musician.styles.slice(0,2).join(', ')}{musician.styles.length > 2 ? '...' : ''}
      </p>
      {musician.primaryInstrument.includes('vocal') && musician.vocalRange && (
         <p style={{ margin: '2px 0 0', fontSize: '0.8em', color: '#555' }}>音域: {musician.vocalRange}</p>
      )}
    </div>
  );
};

export default MusicianCard; 