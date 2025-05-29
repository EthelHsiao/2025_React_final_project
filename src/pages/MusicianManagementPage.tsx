import React, { useState, useEffect } from 'react';
import MusicianForm from '../components/musician/MusicianForm';
import MusicianList from '../components/musician/MusicianList';
import { Musician } from '../types';

// 簡單的假數據，實際應用中可能從 localStorage 或 API 加載
const initialMusicians: Musician[] = [
  {
    id: 'm1',
    name: '艾力克斯',
    primaryInstrument: 'electric_guitar',
    skillLevel: 5,
    styles: ['rock', 'blues'],
    description: '搖滾吉他手，技巧純熟'
  },
  {
    id: 'm2',
    name: '貝拉',
    primaryInstrument: 'female_vocal',
    skillLevel: 4,
    styles: ['pop', 'ballad'],
    vocalRange: 'high',
    description: '流行女歌手，高音清亮'
  }
];

const MusicianManagementPage: React.FC = () => {
  const [musicians, setMusicians] = useState<Musician[]>(() => {
    const savedMusicians = localStorage.getItem('musicians');
    return savedMusicians ? JSON.parse(savedMusicians) : initialMusicians;
  });
  const [editingMusician, setEditingMusician] = useState<Musician | undefined>(undefined);

  useEffect(() => {
    localStorage.setItem('musicians', JSON.stringify(musicians));
  }, [musicians]);

  const generateId = () => `m-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const handleAddMusician = (musicianData: Omit<Musician, 'id'>) => {
    setMusicians(prev => [...prev, { ...musicianData, id: generateId() }]);
    setEditingMusician(undefined); // 清除編輯狀態
  };

  const handleUpdateMusician = (musicianData: Omit<Musician, 'id'>) => {
    if (!editingMusician) return;
    setMusicians(prev => 
      prev.map(m => m.id === editingMusician.id ? { ...musicianData, id: editingMusician.id } : m)
    );
    setEditingMusician(undefined);
  };

  const handleEditMusician = (musician: Musician) => {
    setEditingMusician(musician);
  };

  const handleDeleteMusician = (musicianId: string) => {
    if (window.confirm('確定要刪除這位音樂家嗎？')) {
      setMusicians(prev => prev.filter(m => m.id !== musicianId));
      if(editingMusician && editingMusician.id === musicianId) {
        setEditingMusician(undefined); // 如果刪除的是正在編輯的音樂家，則清除編輯狀態
      }
    }
  };

  const handleFormSubmit = (data: Omit<Musician, 'id'>) => {
    if (editingMusician) {
      handleUpdateMusician(data);
    } else {
      handleAddMusician(data);
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>音樂家管理</h1>
      <nav style={{ marginBottom: '20px'}}>
        <a href="/assemble" style={{ padding: '8px 15px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
          前往樂隊組建頁面
        </a>
      </nav>
      
      <MusicianForm 
        key={editingMusician ? editingMusician.id : 'new'} // 透過 key 改變來重置表單狀態
        onSubmit={handleFormSubmit} 
        initialData={editingMusician} 
      />
      
      <MusicianList 
        musicians={musicians} 
        onEdit={handleEditMusician} 
        onDelete={handleDeleteMusician} 
      />
    </div>
  );
};

export default MusicianManagementPage; 