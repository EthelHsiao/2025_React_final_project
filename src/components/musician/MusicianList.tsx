import React from 'react';
import { Musician, DEFAULT_BAND_SLOTS_CONFIG } from '../../types';

interface MusicianListProps {
  musicians: Musician[];
  onEdit: (musician: Musician) => void;
  onDelete: (musicianId: string) => void;
}

const MusicianList: React.FC<MusicianListProps> = ({ musicians, onEdit, onDelete }) => {
  if (musicians.length === 0) {
    return <p>目前沒有音樂家，請先新增。</p>;
  }

  return (
    <div style={{ marginTop: '20px' }}>
      <h4>音樂家列表</h4>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {musicians.map(musician => (
          <li key={musician.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}>
            <strong>{musician.name}</strong>
            <p>主要樂器: {DEFAULT_BAND_SLOTS_CONFIG.find(s => s.id === musician.primaryInstrument)?.label || musician.primaryInstrument}</p>
            <p>技能等級: {musician.skillLevel}</p>
            <p>風格: {musician.styles.join(', ') || '未指定'}</p>
            {musician.primaryInstrument.includes('vocal') && musician.vocalRange && (
              <p>音域: {musician.vocalRange}</p>
            )}
            {musician.description && <p>描述: {musician.description}</p>}
            <button onClick={() => onEdit(musician)} style={{ marginRight: '10px' }}>編輯</button>
            <button onClick={() => onDelete(musician.id)}>刪除</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MusicianList; 