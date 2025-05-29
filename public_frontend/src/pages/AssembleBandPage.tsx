import React, { useState, useCallback, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import type { ConnectDragSource, ConnectDropTarget, ConnectDragPreview } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import type { Musician, InstrumentDetail, BandSlotDefinition, BandMemberSlot, MusicStyle, MusicianRole, InstrumentKey } from '../types';
import { MUSICIAN_ROLE_LABELS, SKILL_LEVEL_OPTIONS, VOCAL_RANGE_LABELS, MUSIC_STYLE_LABELS, ItemTypes, INSTRUMENT_SLOT_LABELS } from '../types';
// import './AssembleBandPage.css'; // Removed, styles will be applied via Tailwind CSS

// Re-using button class definitions from MusicianForm for consistency, or these could be global
const buttonBaseClasses = "py-2 px-4 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 uppercase tracking-wider";
const buttonPrimaryClasses = `${buttonBaseClasses} bg-primary text-text-inverted border-primary hover:bg-tertiary hover:border-tertiary focus:ring-primary`;

interface AssembleBandPageProps {
  musicians: Musician[];
}

// 定義預設的樂隊位置
const initialBandSlotDefinitions: BandSlotDefinition[] = [
  { id: 'male_vocal', label: INSTRUMENT_SLOT_LABELS.male_vocal, allowedRoles: ['vocalist'] },
  { id: 'electric_guitar', label: INSTRUMENT_SLOT_LABELS.electric_guitar, allowedRoles: ['electric_guitarist', 'guitarist'] },
  { id: 'drums', label: INSTRUMENT_SLOT_LABELS.drums, allowedRoles: ['drummer'] },
  { id: 'keyboard', label: INSTRUMENT_SLOT_LABELS.keyboard, allowedRoles: ['keyboardist'] },
  { id: 'guitar', label: '貝斯', allowedRoles: ['bassist'] }, // 假設吉他槽也可以放貝斯手，或新增專用貝斯槽
  { id: 'female_vocal', label: INSTRUMENT_SLOT_LABELS.female_vocal, allowedRoles: ['vocalist'] },
];


// 可拖曳的音樂家卡片元件
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
      <ul className="text-xs text-text-main list-disc list-inside pl-2">
        {musician.instruments.slice(0, 2).map((inst, index) => (
          <li key={index} className="truncate">
            {MUSICIAN_ROLE_LABELS[inst.role as MusicianRole]}
            {inst.skillLevel && ` (Lvl ${inst.skillLevel})`}
          </li>
        ))}
        {musician.instruments.length > 2 && <li className="text-xs italic">...等 {musician.instruments.length - 2} 項</li>}
      </ul>
    </li>
  );
};

// 可放置的樂隊位置元件
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
  const [bandSlots, setBandSlots] = useState<BandMemberSlot[]>(
    initialBandSlotDefinitions.map(def => ({ slotDefinition: def, musician: null }))
  );

  const handleDropMusician = useCallback((droppedMusician: Musician, targetSlotId: InstrumentKey) => {
    const targetSlotDefinition = initialBandSlotDefinitions.find(def => def.id === targetSlotId);
    if (!targetSlotDefinition || 
        !targetSlotDefinition.allowedRoles.some(role => droppedMusician.instruments.some(inst => inst.role === role))) {
      return;
    }

    setBandSlots(prevSlots => {
      let previousSlotIdOfDroppedMusician: InstrumentKey | null = null;
      for (const s of prevSlots) {
        if (s.musician?.id === droppedMusician.id) {
          previousSlotIdOfDroppedMusician = s.slotDefinition.id;
          break;
        }
      }

      if (previousSlotIdOfDroppedMusician === targetSlotId) {
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
  }, []);

  const availableMusicians = musicians.filter(
    musician => !bandSlots.some(slot => slot.musician?.id === musician.id)
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* assemble-band-page-layout equivalent */}
        <div className="flex flex-col gap-y-5">
          <h2 className="text-3xl font-serif font-bold text-primary text-center mb-4">
            樂隊組建與分析
          </h2>
          <p className="text-center text-text-main text-lg mb-8 max-w-3xl mx-auto">
            在這裡，您可以從您建立的音樂家池中選擇成員，將他們拖曳到下方的樂隊位置中。
          </p>
          
          {/* sections-container equivalent */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* assembly-section equivalent */}
            <section className="flex-[2_1_60%] flex flex-col gap-6">
              
              {/* content-box band-slots-area equivalent */}
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

              {/* content-box musicians-pool-area equivalent */}
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
            
            {/* analysis-section equivalent */}
            <section className="flex-[1_1_35%] flex flex-col gap-6">
              {/* content-box analysis-results-area equivalent */}
              <div className="bg-card rounded-lg p-6 shadow-DEFAULT min-h-[380px] flex flex-col justify-between">
                <div>
                  <h3 id="analysis-title" className="text-xl font-serif font-semibold text-secondary mb-4">
                    分析結果
                  </h3>
                  <p className="text-text-main">
                    整體曲風音調、特色音調、適合歌曲等分析結果顯示區域。
                    {/* TODO: Display band analysis based on bandSlots */}
                  </p>
                </div>
                <button 
                  className={`${buttonPrimaryClasses} mt-6 self-start ${bandSlots.every(s => !s.musician) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={bandSlots.every(s => !s.musician)}
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