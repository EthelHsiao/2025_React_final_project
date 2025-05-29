import React, { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, PointerSensor, useSensor, useSensors, Active } from '@dnd-kit/core';
import { Musician, BandSlot as BandSlotType, InstrumentKey, DEFAULT_BAND_SLOTS_CONFIG, DraggableMusician, BandCompositionPayload, FrontendAnalysisData, Song } from '../types';
import MusicianPool from '../components/musician/MusicianPool';
import BandSlotsDisplay from '../components/band/BandSlotsDisplay';
import MusicianCard from '../components/musician/MusicianCard'; // 用於 DragOverlay
import EvaluateButton from '../components/band/EvaluateButton'; // 新增
import AnalysisResultDisplay from '../components/analysis/AnalysisResultDisplay'; // 新增

// 模擬後端 API 服務
const mockApiService = {
  analyzeBand: (payload: BandCompositionPayload): Promise<FrontendAnalysisData> => {
    console.log('Sending to backend:', payload);
    return new Promise(resolve => {
      setTimeout(() => {
        // 基於 payload 進行一些簡單的模擬邏輯
        const filledSlots = payload.slots.filter(s => s.musicianId !== null);
        let overallStyle = '混合風格';
        const specialTones: string[] = [];
        const suitableSongs: Song[] = [];

        if (filledSlots.length === 0) {
          overallStyle = '樂隊尚未組建完整';
        } else if (filledSlots.some(s => s.slotId === 'electric_guitar')) {
          overallStyle = '搖滾樂隊基礎';
          specialTones.push('包含電吉他 riffs!');
          suitableSongs.push({ id: 's1', title: '搖滾國歌', artist: '虛擬樂隊', primaryGenre: 'rock' });
        }
        if (filledSlots.some(s => s.slotId === 'female_vocal' || s.slotId === 'male_vocal')) {
          specialTones.push('有人聲主唱');
          suitableSongs.push({ id: 's2', title: '抒情歌曲', artist: '主唱A', primaryGenre: 'ballad' });
        }
        if (filledSlots.length > 3) {
           specialTones.push('樂隊編制較為完整');
        }

        resolve({
          overallStyle,
          specialTones,
          suitableSongs,
        });
      }, 1500); // 模擬網絡延遲
    });
  },
};

const BandAssemblyPage: React.FC = () => {
  const [availableMusicians, setAvailableMusicians] = useState<Musician[]>([]);
  const [bandSlots, setBandSlots] = useState<BandSlotType[]>(() => 
    DEFAULT_BAND_SLOTS_CONFIG.map(config => ({
      ...config,
      accepts: [config.id], // 每個插槽只接受對應的樂器類型
      musician: null,
    }))
  );
  const [activeDragItem, setActiveDragItem] = useState<Active | null>(null);
  const [analysisResult, setAnalysisResult] = useState<FrontendAnalysisData | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

  // 從 localStorage 加載音樂家數據
  useEffect(() => {
    const savedMusicians = localStorage.getItem('musicians');
    if (savedMusicians) {
      setAvailableMusicians(JSON.parse(savedMusicians));
    }
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 拖曳需要移動至少8px才觸發
      },
    })
  );

  const handleDragStart = (event: DragEndEvent) => {
    setActiveDragItem(event.active);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragItem(null);
    const { active, over } = event;

    if (!over) return; // 沒有放到有效的 droppable 上

    const activeIsMusicianCard = active.id.toString().startsWith('musician-');
    const overIsSlot = over.id.toString().startsWith('slot-');

    if (activeIsMusicianCard && overIsSlot) {
      const draggedMusicianData = active.data.current as DraggableMusician | undefined;
      const targetSlotData = over.data.current as { accepts: InstrumentKey[], slotId: InstrumentKey } | undefined;

      if (!draggedMusicianData || !targetSlotData) return;

      const musicianToAdd = availableMusicians.find(m => m.id === draggedMusicianData.musicianId);

      if (musicianToAdd && targetSlotData.accepts.includes(draggedMusicianData.instrument)) {
        const isAlreadyInBand = bandSlots.some(slot => slot.musician?.id === musicianToAdd.id && slot.id !== targetSlotData.slotId);
        if (isAlreadyInBand) {
          alert(`${musicianToAdd.name} 已經在樂隊的其他位置了！`);
          return;
        }
        
        // 更新樂隊位置
        setBandSlots(prevSlots => {
          // 先處理可能被替換的音樂家
          const slotBeingReplaced = prevSlots.find(s => s.id === targetSlotData.slotId);
          const musicianBeingReplaced = slotBeingReplaced?.musician;

          let updatedAvailableMusicians = [...availableMusicians];
          // 如果被替換的音樂家存在且不是當前拖曳的音樂家，則將其"放回"樂池
          // 這裡的"放回"邏輯需要小心，避免重複添加，或與從樂池拖曳的狀態衝突
          // 為簡化，暫時不將被替換者自動移回 availableMusicians
          
          // 從 availableMusicians 中移除 (或標記) 被選中的音樂家
          // updatedAvailableMusicians = updatedAvailableMusicians.filter(m => m.id !== musicianToAdd.id);

          const newSlots = prevSlots.map(slot => {
            // 如果是目標插槽
            if (slot.id === targetSlotData.slotId) return { ...slot, musician: musicianToAdd };
            // 如果是拖曳音樂家原本所在的插槽 (實現從一個位置拖到另一個位置的清空原位)
            if (slot.musician?.id === musicianToAdd.id) return { ...slot, musician: null }; 
            return slot;
          });
          // setAvailableMusicians(updatedAvailableMusicians);
          return newSlots;
        });
        setAnalysisResult(null); // 清空舊的分析結果
      } else {
        alert('該音樂家不適合這個位置 (樂器類型不符)！');
      }
    }
  };
  
  const handleRemoveMusicianFromSlot = (slotIdToRemove: InstrumentKey) => {
    const slotToClear = bandSlots.find(s => s.id === slotIdToRemove);
    if (slotToClear && slotToClear.musician) {
      // const removedMusician = slotToClear.musician;
      setBandSlots(prevSlots => 
        prevSlots.map(s => 
          s.id === slotIdToRemove ? { ...s, musician: null } : s
        )
      );
      // 將音樂家"放回"availableMusicians
      // if (removedMusician && !availableMusicians.find(m => m.id === removedMusician.id)) {
      //   setAvailableMusicians(prev => [...prev, removedMusician]);
      // }
      setAnalysisResult(null); // 清空舊的分析結果
    }
  };
  
  const handleEvaluateBand = async () => {
    setIsLoadingAnalysis(true);
    setAnalysisResult(null);
    const payload: BandCompositionPayload = {
      slots: bandSlots.map(slot => ({
        slotId: slot.id,
        musicianId: slot.musician ? slot.musician.id : null,
      })),
    };
    try {
      const result = await mockApiService.analyzeBand(payload);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Error analyzing band:', error);
      setAnalysisResult({ // 顯示一個錯誤狀態
        overallStyle: '分析出錯',
        specialTones: ['無法獲取分析結果，請稍後再試'],
        suitableSongs: [],
      });
    }
    setIsLoadingAnalysis(false);
  };

  const draggedMusician = activeDragItem && activeDragItem.id.toString().startsWith('musician-') 
    ? availableMusicians.find(m => m.id === (activeDragItem.data.current as DraggableMusician)?.musicianId)
    : null;

  const bandIsReady = bandSlots.some(s => s.musician !== null); // 至少有一個成員

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} autoScroll={false}>
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h1>樂隊組建</h1>
          <nav>
            <a href="/musicians" style={{ padding: '8px 15px', backgroundColor: '#6c757d', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
              返回音樂家管理
            </a>
          </nav>
        </div>

        <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', alignItems: 'flex-start' }}>
          <MusicianPool availableMusicians={availableMusicians} />
          <div style={{flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <BandSlotsDisplay currentBandSetup={bandSlots} onRemoveMusician={handleRemoveMusicianFromSlot} />
            <EvaluateButton onClick={handleEvaluateBand} bandIsReady={bandIsReady} disabled={isLoadingAnalysis} />
          </div>
        </div>
        
        <AnalysisResultDisplay analysisData={analysisResult} isLoading={isLoadingAnalysis} />

      </div>
      <DragOverlay dropAnimation={null}>
        {activeDragItem && draggedMusician ? (
          <MusicianCard 
            musician={draggedMusician} 
            draggableId={activeDragItem.id.toString()} // 保持和拖曳項目一致的ID
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default BandAssemblyPage; 