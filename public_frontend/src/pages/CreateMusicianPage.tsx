import React, { useState, useEffect } from 'react';
import MusicianForm from '../components/musician/MusicianForm';
import type { Musician, InstrumentDetail } from '../types';
import { MUSICIAN_ROLE_LABELS, SKILL_LEVEL_OPTIONS, VOCAL_RANGE_LABELS, MUSIC_STYLE_LABELS } from '../types';

interface CreateMusicianPageProps {
  musicians: Musician[];
  addMusician: (musician: Musician) => void;
  updateMusician: (musician: Musician) => void;
  deleteMusician: (musicianId: string) => void;
}

const CreateMusicianPage: React.FC<CreateMusicianPageProps> = ({ 
  musicians,
  addMusician,
  updateMusician,
  deleteMusician
}) => {
  const [editingMusician, setEditingMusician] = useState<Musician | null>(null);

  const handleFormSubmit = (data: Musician) => {
    if (editingMusician) {
      updateMusician({ ...data, id: editingMusician.id });
      setEditingMusician(null); 
      console.log('Updated musician via App state:', data);
    } else {
      addMusician(data);
      console.log('Added musician via App state:', data);
    }
  };

  const handleEditMusician = (musician: Musician) => {
    setEditingMusician(musician);
  };

  const handleDeleteMusicianInternal = (musicianId: string) => {
    if (window.confirm("確定要刪除這位音樂家嗎？此操作無法復原。")) {
      deleteMusician(musicianId);
      if (editingMusician && editingMusician.id === musicianId) {
        setEditingMusician(null); 
      }
      console.log('Deleted musician via App state with ID:', musicianId);
    }
  };
  
  const handleCancelEdit = () => {
    setEditingMusician(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="bg-card shadow-DEFAULT rounded-lg p-6 md:p-8 w-full lg:max-w-2xl lg:flex-shrink-0">
          <MusicianForm 
            key={editingMusician ? editingMusician.id : 'new'}
            onSubmit={handleFormSubmit} 
            initialData={editingMusician || undefined}
            onCancelEdit={handleCancelEdit}
          />
        </div>
        <div className="bg-card shadow-DEFAULT rounded-lg p-6 md:p-8 w-full lg:flex-1 max-h-[calc(100vh-180px)] overflow-y-auto">
          <h2 className="text-2xl font-serif font-bold text-secondary text-center mb-6">
            已建立的音樂家 ({musicians.length})
          </h2>
          {musicians.length === 0 ? (
            <p className="text-text-main text-center italic">尚未建立任何音樂家。請在左方表單新增。</p>
          ) : (
            <ul className="space-y-6">
              {musicians.map((musician: Musician) => (
                <li key={musician.id} className="bg-card-slot p-5 rounded-lg shadow-md hover:shadow-hover transition-shadow duration-200 transform hover:-translate-y-1">
                  <div className="musician-info">
                    <h3 className="text-xl font-serif font-semibold text-primary mb-2">{musician.name}</h3>
                    {musician.description && <p className="text-sm text-text-main italic mb-3">{musician.description}</p>}
                    {musician.overallPrimaryStyle && (
                        <p className="text-sm text-text-main mb-1">
                            <strong className="font-medium text-secondary">整體風格:</strong> {MUSIC_STYLE_LABELS[musician.overallPrimaryStyle]}
                        </p>
                    )}
                    <h4 className="text-md font-serif font-semibold text-secondary mt-4 mb-2 pb-1 border-b border-border-main">專長:</h4>
                    <ul className="space-y-1 pl-4 list-disc list-inside text-sm text-text-main">
                      {musician.instruments.map((inst: InstrumentDetail, index: number) => {
                        const skillLabel = inst.skillLevel ? SKILL_LEVEL_OPTIONS.find(opt => opt.value === inst.skillLevel)?.label : '';
                        return (
                          <li key={index}>
                            <strong className="font-medium text-primary">{MUSICIAN_ROLE_LABELS[inst.role]}</strong>
                            {inst.primaryStyle && ` - 風格: ${MUSIC_STYLE_LABELS[inst.primaryStyle]}`}
                            {skillLabel && ` (等級: ${skillLabel})`}
                            {inst.vocalType && ` - 性別: ${inst.vocalType === 'male' ? '男' : '女'}`}
                            {inst.vocalRange && ` - 音域: ${VOCAL_RANGE_LABELS[inst.vocalRange]}`}
                            {(inst.role === 'guitarist' || inst.role === 'electric_guitarist' || inst.role === 'bassist') && (
                              <>
                                {inst.canPlayLead !== undefined && <span className="ml-2">- 主音: {inst.canPlayLead ? '是' : '否'}</span>}
                                {inst.canPlayRhythm !== undefined && <span className="ml-2">- 節奏: {inst.canPlayRhythm ? '是' : '否'}</span>}
                              </>
                            )}
                            {inst.role === 'drummer' && inst.preferredDrumKit && <span className="ml-2">- 鼓組: {inst.preferredDrumKit}</span>}
                            {inst.role === 'keyboardist' && inst.keyboardSounds && inst.keyboardSounds.length > 0 && <span className="ml-2">- 音色: {inst.keyboardSounds.join(', ')}</span>}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  <div className="mt-4 flex justify-end space-x-3">
                    <button 
                      onClick={() => handleEditMusician(musician)} 
                      className="px-4 py-2 text-xs font-medium uppercase tracking-wider border border-tertiary text-tertiary rounded-md hover:bg-tertiary hover:text-text-inverted transition-colors duration-150 shadow-sm hover:shadow-md"
                    >
                      編輯
                    </button>
                    <button 
                      onClick={() => handleDeleteMusicianInternal(musician.id)} 
                      className="px-4 py-2 text-xs font-medium uppercase tracking-wider border border-error text-error rounded-md hover:bg-error hover:text-white transition-colors duration-150 shadow-sm hover:shadow-md"
                    >
                      刪除
                    </button>
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