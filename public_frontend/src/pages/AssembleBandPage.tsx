import React, { useState, useCallback, useEffect, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import type { ConnectDragSource, ConnectDropTarget, ConnectDragPreview } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import type { Musician, InstrumentDetail, BandSlotDefinition, BandMemberSlot, MusicStyle, MusicianRole, InstrumentKey, SongDataEntry } from '../types';
import { MUSICIAN_ROLE_LABELS, SKILL_LEVEL_OPTIONS, VOCAL_RANGE_LABELS, MUSIC_STYLE_LABELS, ItemTypes, INSTRUMENT_SLOT_LABELS } from '../types';
import { parseNoteToMidi, midiToNoteString, findOptimalTransposition } from '../utils/musicUtils';
import type { TranspositionResult } from '../utils/musicUtils';

const buttonBaseClasses = "py-2 px-4 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 uppercase tracking-wider";
const buttonPrimaryClasses = `${buttonBaseClasses} bg-primary text-text-inverted border-primary hover:bg-tertiary hover:border-tertiary focus:ring-primary`;

interface AssembleBandPageProps {
  musicians: Musician[];
}

const initialBandSlotDefinitions: BandSlotDefinition[] = [
  { id: 'male_vocal', label: INSTRUMENT_SLOT_LABELS.male_vocal, allowedRoles: ['vocalist'] },
  { id: 'electric_guitar', label: INSTRUMENT_SLOT_LABELS.electric_guitar, allowedRoles: ['electric_guitarist', 'guitarist'] },
  { id: 'drums', label: INSTRUMENT_SLOT_LABELS.drums, allowedRoles: ['drummer'] },
  { id: 'keyboard', label: INSTRUMENT_SLOT_LABELS.keyboard, allowedRoles: ['keyboardist'] },
  { id: 'guitar', label: '貝斯', allowedRoles: ['bassist'] }, 
  { id: 'female_vocal', label: INSTRUMENT_SLOT_LABELS.female_vocal, allowedRoles: ['vocalist'] },
];

const LOCAL_STORAGE_BAND_KEY = 'virtualBandComposer_bandSlots';

interface StoredBandSlot {
  slotDefinitionId: InstrumentKey;
  musicianId: string | null;
}

interface DraggableMusicianCardProps {
  musician: Musician;
}

const DraggableMusicianCard: React.FC<DraggableMusicianCardProps> = ({ musician }) => {
  const [{ isDragging }, drag, preview]: [{ isDragging: boolean }, ConnectDragSource, ConnectDragPreview] = useDrag(() => ({
    type: ItemTypes.MUSICIAN,
    item: { ...musician, type: ItemTypes.MUSICIAN },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const firstVocalistInstrument = musician.instruments.find(inst => inst.role === 'vocalist');

  return (
    // @ts-ignore
    <li 
      ref={drag}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className={`bg-card-slot p-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-grab active:cursor-grabbing ${isDragging ? 'ring-2 ring-primary' : ''}`}
    >
      <h5 className="text-md font-serif font-semibold text-primary truncate">{musician.name}</h5>
      {musician.overallPrimaryStyle && (
        <p className="text-xs text-text-main mb-1">
          風格: {MUSIC_STYLE_LABELS[musician.overallPrimaryStyle as MusicStyle]}
        </p>
      )}
      <p className="text-xs text-text-secondary_light">專長 ({musician.instruments.length}):</p>
      <ul className="text-xs text-text-main list-disc list-inside pl-2 space-y-0.5">
        {musician.instruments.slice(0, firstVocalistInstrument ? 1 : 2).map((inst, index) => (
          <li key={index} className="truncate">
            {MUSICIAN_ROLE_LABELS[inst.role as MusicianRole]}
            {inst.skillLevel && <span className="text-text-tertiary_light_md"> (Lvl {inst.skillLevel})</span>}
          </li>
        ))}
        {firstVocalistInstrument && (firstVocalistInstrument.preciseLowestNote || firstVocalistInstrument.preciseHighestNote) && (
            <li className="text-xs text-text-tertiary_light_md truncate">
                音域: {firstVocalistInstrument.preciseLowestNote || '-'} ~ {firstVocalistInstrument.preciseHighestNote || '-'}
            </li>
        )}
        {musician.instruments.length > (firstVocalistInstrument ? 1 : 2) && (
             <li className="text-xs italic text-text-tertiary_light_md">...等更多</li>
        )}
      </ul>
    </li>
  );
};

interface DroppableBandSlotProps {
  slot: BandMemberSlot;
  onDropMusician: (musician: Musician, slotId: InstrumentKey) => void;
  onRemoveMusician: (slotId: InstrumentKey) => void;
}

const DroppableBandSlot: React.FC<DroppableBandSlotProps> = ({ slot, onDropMusician, onRemoveMusician }) => {
  const [{ isOver, canDrop }, drop]: [{ isOver: boolean, canDrop: boolean }, ConnectDropTarget] = useDrop(() => ({
    accept: ItemTypes.MUSICIAN,
    canDrop: (item: Musician) => {
      const musicianItem = item as Musician;
      return slot.slotDefinition.allowedRoles.some(allowedRole => 
        musicianItem.instruments.some(inst => inst.role === allowedRole)
      );
    },
    drop: (item: Musician) => onDropMusician(item, slot.slotDefinition.id),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }), [slot, onDropMusician, onRemoveMusician]);

  const isActive = isOver && canDrop;
  let borderColor = 'border-tertiary';
  if (isActive) {
    borderColor = 'border-green-500';
  } else if (canDrop && isOver && !isActive) {
    borderColor = 'border-red-500';
  } else if (canDrop) {
    borderColor = 'border-yellow-500';
  }

  return (
    // @ts-ignore
    <div 
      ref={drop}
      className={`bg-card p-4 rounded-lg shadow-inner min-h-[120px] flex flex-col justify-between items-center border-2 border-dashed transition-all duration-200
                  ${isActive ? 'ring-2 ring-green-500 scale-105' : ''} 
                  ${!isActive && canDrop && isOver ? 'ring-2 ring-red-500' : ''}
                  ${borderColor}`}
    >
      <h4 className="text-sm font-serif font-semibold text-secondary_light text-center mb-1">{slot.slotDefinition.label}</h4>
      <p className="text-xs text-text-tertiary_light_md text-center mb-2">
        (需: {slot.slotDefinition.allowedRoles.map(role => MUSICIAN_ROLE_LABELS[role as MusicianRole]).join(' / ')})
      </p>
      {slot.musician ? (
        <div className="w-full bg-primary/10 p-2 rounded text-center relative">
          <p className="text-sm font-semibold text-primary truncate">{slot.musician.name}</p>
          <p className="text-xs text-text-main truncate">
            {slot.musician.instruments.find(inst => slot.slotDefinition.allowedRoles.includes(inst.role as MusicianRole))?.role 
              ? MUSICIAN_ROLE_LABELS[slot.musician.instruments.find(inst => slot.slotDefinition.allowedRoles.includes(inst.role as MusicianRole))?.role as MusicianRole]
              : '未知角色'}
          </p>
          <button 
            onClick={() => onRemoveMusician(slot.slotDefinition.id)}
            className="absolute top-0 right-0 mt-1 mr-1 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full hover:bg-red-700 transition-colors"
            title="移除音樂家"
          >
            ✕
          </button>
        </div>
      ) : (
        <p className="text-xs text-text-tertiary_light_md italic">拖曳音樂家至此</p>
      )}
    </div>
  );
};

const AssembleBandPage: React.FC<AssembleBandPageProps> = ({ musicians }) => {
  const [bandSlots, setBandSlots] = useState<BandMemberSlot[]>(() => {
    const storedBandJson = localStorage.getItem(LOCAL_STORAGE_BAND_KEY);
    if (storedBandJson) {
      try {
        const storedBand: StoredBandSlot[] = JSON.parse(storedBandJson);
        return initialBandSlotDefinitions.map(def => {
          const storedSlot = storedBand.find(ss => ss.slotDefinitionId === def.id);
          let musicianInSlot: Musician | null = null;
          if (storedSlot && storedSlot.musicianId) {
            musicianInSlot = musicians.find(m => m.id === storedSlot.musicianId) || null;
          }
          return { slotDefinition: def, musician: musicianInSlot };
        }).filter(slot => slot !== null) as BandMemberSlot[];
      } catch (error) {
        console.error("Error parsing stored band from localStorage:", error);
        return initialBandSlotDefinitions.map(def => ({ slotDefinition: def, musician: null }));
      }
    } 
    return initialBandSlotDefinitions.map(def => ({ slotDefinition: def, musician: null }));
  });

  const [analysisResult, setAnalysisResult] = useState<TranspositionResult | null>(null);
  const [allSongs, setAllSongs] = useState<SongDataEntry[]>([]);
  const [selectedSong, setSelectedSong] = useState<SongDataEntry | null>(null);
  const [songsLoading, setSongsLoading] = useState<boolean>(true);
  const [songsError, setSongsError] = useState<string | null>(null);

  useEffect(() => {
    const storableBand: StoredBandSlot[] = bandSlots.map(bs => ({
      slotDefinitionId: bs.slotDefinition.id,
      musicianId: bs.musician ? bs.musician.id : null,
    }));
    localStorage.setItem(LOCAL_STORAGE_BAND_KEY, JSON.stringify(storableBand));
  }, [bandSlots, musicians]);

  useEffect(() => {
    const fetchSongs = async () => {
      setSongsLoading(true);
      setSongsError(null);
      try {
        const response = await fetch('/song_dataset.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: SongDataEntry[] = await response.json();
        setAllSongs(data);
      } catch (error) {
        console.error("Error fetching songs:", error);
        setSongsError("無法載入歌曲資料。請確認 song_dataset.json 檔案位於 public 資料夾中且格式正確。");
      }
      setSongsLoading(false);
    };
    fetchSongs();
  }, []);

  const handleDropMusician = useCallback((droppedMusician: Musician, targetSlotId: InstrumentKey) => {
    const targetSlotDefinition = initialBandSlotDefinitions.find(def => def.id === targetSlotId);
    if (!targetSlotDefinition || 
        !targetSlotDefinition.allowedRoles.some(role => droppedMusician.instruments.some(inst => inst.role === role))) {
      console.warn("Attempted to drop musician into an incompatible slot or slot not found");
      return;
    }
    setBandSlots(prevSlots => {
      let previousSlotIdOfDroppedMusician: InstrumentKey | null = null;
      let musicianAlreadyInTargetSlot = false;
      for (const s of prevSlots) {
        if (s.musician?.id === droppedMusician.id) {
          previousSlotIdOfDroppedMusician = s.slotDefinition.id;
        }
        if (s.slotDefinition.id === targetSlotId && s.musician?.id === droppedMusician.id) {
          musicianAlreadyInTargetSlot = true;
        }
      }
      if (musicianAlreadyInTargetSlot) {
          return prevSlots;
      }
      return prevSlots.map(slot => {
        if (slot.slotDefinition.id === targetSlotId) {
          return { ...slot, musician: droppedMusician };
        }
        if (slot.slotDefinition.id === previousSlotIdOfDroppedMusician) {
          return { ...slot, musician: null };
        }
        return slot;
      });
    });
  }, []);

  const handleRemoveMusician = useCallback((slotIdToRemove: InstrumentKey) => {
    setBandSlots(prevSlots => 
      prevSlots.map(slot => 
        slot.slotDefinition.id === slotIdToRemove ? { ...slot, musician: null } : slot
      )
    );
    setAnalysisResult(null);
  }, []);

  const availableMusicians = musicians.filter(
    musician => !bandSlots.some(slot => slot.musician?.id === musician.id)
  );

  const handleAnalyzeBand = () => {
    setAnalysisResult(null);
    if (!selectedSong) {
      setAnalysisResult({ message: '請先選擇一首歌曲進行分析。' });
      return;
    }
    const vocalistSlot = bandSlots.find(slot => 
      slot.musician && slot.slotDefinition.allowedRoles.includes('vocalist')
    );
    if (!vocalistSlot || !vocalistSlot.musician) {
      setAnalysisResult({ message: '樂隊中未找到聲樂家或聲樂家資訊不完整。' });
      return;
    }
    const vocalist = vocalistSlot.musician;
    const vocalInstrument = vocalist.instruments.find(inst => inst.role === 'vocalist');
    if (!vocalInstrument || !vocalInstrument.preciseLowestNote || !vocalInstrument.preciseHighestNote) {
      setAnalysisResult({ message: `聲樂家 ${vocalist.name} 未設定精確音域。` });
      return;
    }
    const vocalLowMidi = parseNoteToMidi(vocalInstrument.preciseLowestNote);
    const vocalHighMidi = parseNoteToMidi(vocalInstrument.preciseHighestNote);
    const songLowMidi = parseNoteToMidi(selectedSong.vocal_range.low);
    const songHighMidi = parseNoteToMidi(selectedSong.vocal_range.high);
    if (vocalLowMidi === null || vocalHighMidi === null || songLowMidi === null || songHighMidi === null) {
      let errorMsg = '處理音高資訊時發生錯誤。';
      if (vocalLowMidi === null || vocalHighMidi === null) errorMsg += `歌手 ${vocalist.name} 的音域 (${vocalInstrument.preciseLowestNote} - ${vocalInstrument.preciseHighestNote}) 無法正確解析。`;
      if (songLowMidi === null || songHighMidi === null) errorMsg += `歌曲 ${selectedSong.title} 的音域 (${selectedSong.vocal_range.low} - ${selectedSong.vocal_range.high}) 無法正確解析。`;
      setAnalysisResult({ message: errorMsg });
      return;
    }
    const result = findOptimalTransposition(vocalLowMidi, vocalHighMidi, songLowMidi, songHighMidi);
    setAnalysisResult(result);
  };

  const getSongDisplayName = (song: SongDataEntry) => {
    return `${song.title} (音域: ${song.vocal_range.low} - ${song.vocal_range.high}, 風格: ${song.genre})`;
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-y-5">
          <h2 className="text-3xl font-serif font-bold text-primary text-center mb-4">
            樂隊組建與分析
          </h2>
          <p className="text-center text-text-main text-lg mb-8 max-w-3xl mx-auto">
            在這裡，您可以從您建立的音樂家池中選擇成員，將他們拖曳到下方的樂隊位置中。
          </p>
          
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <section className="flex-[2_1_60%] flex flex-col gap-6">
              <div className="bg-card-slot border-2 border-dashed border-tertiary_light_md rounded-lg p-6 shadow-DEFAULT min-h-[280px]">
                <h3 id="band-assembly-title" className="text-xl font-serif font-semibold text-secondary mb-4 text-center">
                  樂隊席位 (拖曳音樂家至此)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {bandSlots.map(slot => (
                    <DroppableBandSlot 
                      key={slot.slotDefinition.id} 
                      slot={slot} 
                      onDropMusician={handleDropMusician} 
                      onRemoveMusician={handleRemoveMusician}
                    />
                  ))}
                </div>
              </div>
              <div className="bg-card rounded-lg p-6 shadow-DEFAULT min-h-[230px]">
                <h4 className="text-lg font-serif font-semibold text-secondary mb-3">
                  音樂家池 ({availableMusicians.length > 0 ? `${availableMusicians.length} 位可用` : '無可用音樂家'})
                </h4>
                {availableMusicians.length === 0 && bandSlots.every(s => !s.musician) && (
                  <p className="text-text-main italic text-center py-4">請先到「建立音樂家」頁面新增音樂家。</p>
                )}
                {availableMusicians.length === 0 && !bandSlots.every(s => !s.musician) && (
                  <p className="text-text-main italic text-center py-4">所有音樂家都已被選入樂隊，或沒有更多符合條件的音樂家。</p>
                )}
                {availableMusicians.length > 0 && (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto p-1">
                    {availableMusicians.map(musician => (
                      <DraggableMusicianCard key={musician.id} musician={musician} />
                    ))}
                  </ul>
                )}
              </div>
            </section>
            
            <section className="flex-[1_1_35%] flex flex-col gap-6">
              <div className="bg-card rounded-lg p-6 shadow-DEFAULT min-h-[450px] flex flex-col">
                <div>
                  <h3 id="analysis-title" className="text-xl font-serif font-semibold text-secondary mb-4">
                    歌曲音域分析
                  </h3>
                  <div className="mb-4">
                    <label htmlFor="song-select" className="block text-sm font-medium text-text-main mb-1">
                      選擇歌曲:
                    </label>
                    {songsLoading && <p className="text-text-tertiary_light_md italic">歌曲載入中...</p>}
                    {songsError && <p className="text-red-500 text-sm">{songsError}</p>}
                    {!songsLoading && !songsError && allSongs.length > 0 && (
                      <select 
                        id="song-select"
                        value={selectedSong ? selectedSong.title : ""}
                        onChange={(e) => {
                          const songTitle = e.target.value;
                          const newSelectedSong = allSongs.find(s => s.title === songTitle) || null;
                          setSelectedSong(newSelectedSong);
                          setAnalysisResult(null);
                        }}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 bg-background text-text-main focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md shadow-sm"
                      >
                        <option value="" disabled={selectedSong !== null}>-- 請選擇一首歌曲 --</option>
                        {allSongs.map(song => (
                          <option key={song.title} value={song.title}>
                            {getSongDisplayName(song)}
                          </option>
                        ))}
                      </select>
                    )}
                    {!songsLoading && !songsError && allSongs.length === 0 && (
                        <p className="text-text-tertiary_light_md italic">沒有可用的歌曲資料。</p>
                    )}
                  </div>

                  {selectedSong ? (
                    analysisResult ? (
                      <div className="text-sm text-text-main space-y-2 mt-4 pt-4 border-t border-gray-700">
                        <h4 className="text-md font-serif font-semibold text-primary_light mb-1">分析歌曲: {selectedSong.title}</h4>
                        <p className={`font-semibold ${analysisResult.semitones !== undefined && analysisResult.semitones !== null ? (analysisResult.semitones === 0 && !analysisResult.message.includes("挑戰極限音") && !analysisResult.message.includes("無法完整演唱") ? 'text-green-400' : 'text-yellow-400') : 'text-red-400'}`}>
                          {analysisResult.message}
                        </p>
                        {analysisResult.vocalLowMidi !== undefined && analysisResult.vocalHighMidi !== undefined && (
                          <p>歌手音域: {midiToNoteString(analysisResult.vocalLowMidi)} ({analysisResult.vocalLowMidi}) - {midiToNoteString(analysisResult.vocalHighMidi)} ({analysisResult.vocalHighMidi})</p>
                        )}
                        {analysisResult.originalSongLowMidi !== undefined && analysisResult.originalSongHighMidi !== undefined && (
                          <p>歌曲原音域: {midiToNoteString(analysisResult.originalSongLowMidi)} ({analysisResult.originalSongLowMidi}) - {midiToNoteString(analysisResult.originalSongHighMidi)} ({analysisResult.originalSongHighMidi})</p>
                        )}
                        {analysisResult.transposedSongLowMidi !== undefined && analysisResult.transposedSongHighMidi !== undefined && analysisResult.semitones !== 0 && (
                          <p>移調後歌曲音域: {midiToNoteString(analysisResult.transposedSongLowMidi)} ({analysisResult.transposedSongLowMidi}) - {midiToNoteString(analysisResult.transposedSongHighMidi)} ({analysisResult.transposedSongHighMidi})</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-text-main italic mt-4 pt-4 border-t border-gray-700">
                        請組建樂隊並加入一位聲樂家，然後點擊下方按鈕進行評估「{selectedSong.title}」。
                      </p>
                    )
                  ) : (
                     <p className="text-text-main italic mt-4 pt-4 border-t border-gray-700">
                      請先選擇一首歌曲。
                    </p>
                  )}
                </div>
                <button 
                  onClick={handleAnalyzeBand}
                  className={`${buttonPrimaryClasses} mt-auto self-start ${!selectedSong || bandSlots.every(s => !s.musician || !s.slotDefinition.allowedRoles.includes('vocalist')) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!selectedSong || bandSlots.every(s => !s.musician || !s.slotDefinition.allowedRoles.includes('vocalist'))}
                >
                  開始評估！
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default AssembleBandPage;