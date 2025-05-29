import React from 'react';
import { Musician } from '../../types';
import MusicianCard from './MusicianCard';

interface MusicianPoolProps {
  availableMusicians: Musician[];
}

const MusicianPool: React.FC<MusicianPoolProps> = ({ availableMusicians }) => {
  if (availableMusicians.length === 0) {
    return <p>沒有可用的音樂家。請先到「音樂家管理」頁面新增音樂家。</p>;
  }

  return (
    <div style={{ 
      padding: '15px', 
      border: '1px dashed #aaa', 
      borderRadius: '8px', 
      marginRight: '20px', 
      minWidth: '200px', 
      maxWidth: '250px', 
      height: 'calc(100vh - 150px)', // 示例高度，使其可滾動
      overflowY: 'auto' 
    }}>
      <h3>音樂家庫 (可拖曳)</h3>
      {availableMusicians.map(musician => (
        // 使用 musician.id 作為 draggableId，假設一個音樂家在池中只有一個實例
        // 如果要實現一個音樂家多種樂器技能卡牌，draggableId 需要更複雜的生成邏輯，
        // 例如 musician.id + '-' + skill.instrument
        <MusicianCard 
          key={musician.id} 
          musician={musician} 
          draggableId={`musician-${musician.id}-${musician.primaryInstrument}`} // 確保 ID 唯一性
        />
      ))}
    </div>
  );
};

export default MusicianPool; 