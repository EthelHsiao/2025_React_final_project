import React, { useState, useEffect } from 'react';
import MusicianForm from '../components/musician/MusicianForm';
import type { Musician, InstrumentDetail } from '../types';
import { MUSICIAN_ROLE_LABELS, SKILL_LEVEL_LABELS, VOCAL_RANGE_LABELS, MUSIC_STYLE_LABELS } from '../types';
import './CreateMusicianPage.css';

const CreateMusicianPage: React.FC = () => {
  const [musicians, setMusicians] = useState<Musician[]>(() => {
    const savedMusicians = localStorage.getItem('musicians');
    return savedMusicians ? JSON.parse(savedMusicians) : [];
  });
  const [editingMusician, setEditingMusician] = useState<Musician | null>(null);

  useEffect(() => {
    localStorage.setItem('musicians', JSON.stringify(musicians));
  }, [musicians]);

  const handleFormSubmit = (data: Musician) => {
    if (editingMusician) {
      // Editing existing musician
      setMusicians(prev => prev.map(m => m.id === editingMusician.id ? { ...data, id: editingMusician.id } : m));
      setEditingMusician(null); // Clear editing state
      console.log('Updated musician:', data);
    } else {
      // Adding new musician
      setMusicians(prev => {
        // Prevent adding musician with duplicate ID (should be rare with UUIDs from form)
        if (prev.find(m => m.id === data.id)) {
          console.warn("Attempted to add musician with duplicate ID:", data.id);
          // If somehow a duplicate ID is submitted for a new musician, generate a new one or handle error
          // For now, we just update if found, or add if not.
          // This case is less likely if form always generates new UUID on reset for non-editing mode.
          const existing = prev.find(m => m.id === data.id);
          if(existing) return prev.map(m => m.id === data.id ? data : m);
        } 
        return [...prev, data];
      });
      console.log('Added musician:', data);
    }
  };

  const handleEditMusician = (musician: Musician) => {
    setEditingMusician(musician);
  };

  const handleDeleteMusician = (musicianId: string) => {
    if (window.confirm("確定要刪除這位音樂家嗎？此操作無法復原。")) {
      setMusicians(prev => prev.filter(m => m.id !== musicianId));
      if (editingMusician && editingMusician.id === musicianId) {
        setEditingMusician(null); // Clear form if deleting the one being edited
      }
      console.log('Deleted musician with ID:', musicianId);
    }
  };
  
  const handleCancelEdit = () => {
    setEditingMusician(null);
  };

  return (
    <div className="page-container">
      <div className="create-musician-page-layout">
        <div className="form-section-container">
          <MusicianForm 
            key={editingMusician ? editingMusician.id : 'new'} // Force re-render of form when editingMusician changes
            onSubmit={handleFormSubmit} 
            initialData={editingMusician || undefined} // Pass initialData for editing
            onCancelEdit={handleCancelEdit} // Pass cancel handler
          />
        </div>
        <div className="list-section-container">
          <h2>已建立的音樂家 ({musicians.length})</h2>
          {musicians.length === 0 ? (
            <p>尚未建立任何音樂家。請在左方表單新增。</p>
          ) : (
            <ul className="musician-list">
              {musicians.map((musician: Musician) => (
                <li key={musician.id} className="musician-list-item">
                  <div className="musician-info">
                    <h3>{musician.name}</h3>
                    {musician.description && <p className="description"><em>{musician.description}</em></p>}
                    {musician.overallPrimaryStyle && <p><strong>整體風格:</strong> {MUSIC_STYLE_LABELS[musician.overallPrimaryStyle]}</p>}
                    <h4>專長:</h4>
                    <ul className="instrument-sublist">
                      {musician.instruments.map((inst: InstrumentDetail, index: number) => (
                        <li key={index} className="instrument-sublist-item">
                          <strong>{MUSICIAN_ROLE_LABELS[inst.role]}</strong>
                          {inst.primaryStyle && ` - 風格: ${MUSIC_STYLE_LABELS[inst.primaryStyle]}`}
                          {inst.skillLevel && ` (等級: ${SKILL_LEVEL_LABELS[inst.skillLevel]})`}
                          {inst.vocalType && ` - 性別: ${inst.vocalType === 'male' ? '男' : '女'}`}
                          {inst.vocalRange && ` - 音域: ${VOCAL_RANGE_LABELS[inst.vocalRange]}`}
                          {(inst.role === 'guitarist' || inst.role === 'electric_guitarist') && (
                            <>
                              {inst.canPlayLead !== undefined && <span> - 主音: {inst.canPlayLead ? '是' : '否'}</span>}
                              {inst.canPlayRhythm !== undefined && <span> - 節奏: {inst.canPlayRhythm ? '是' : '否'}</span>}
                            </>
                          )}
                          {inst.role === 'drummer' && inst.preferredDrumKit && <span> - 鼓組: {inst.preferredDrumKit}</span>}
                          {inst.role === 'keyboardist' && inst.keyboardSounds && inst.keyboardSounds.length > 0 && <span> - 音色: {inst.keyboardSounds.join(', ')}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="musician-actions">
                    <button onClick={() => handleEditMusician(musician)} className="btn btn-secondary btn-small">編輯</button>
                    <button onClick={() => handleDeleteMusician(musician.id)} className="btn btn-danger btn-small">刪除</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateMusicianPage; 