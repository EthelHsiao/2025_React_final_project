import React from 'react';
import type { Musician } from '../types'; // Import Musician type
import { MUSICIAN_ROLE_LABELS, SKILL_LEVEL_OPTIONS, VOCAL_RANGE_LABELS, MUSIC_STYLE_LABELS } from '../types'; // For displaying musician details
// import './AssembleBandPage.css'; // Removed, styles will be applied via Tailwind CSS

// Re-using button class definitions from MusicianForm for consistency, or these could be global
const buttonBaseClasses = "py-2 px-4 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 uppercase tracking-wider";
const buttonPrimaryClasses = `${buttonBaseClasses} bg-primary text-text-inverted border-primary hover:bg-tertiary hover:border-tertiary focus:ring-primary`;

interface AssembleBandPageProps {
  musicians: Musician[];
}

const AssembleBandPage: React.FC<AssembleBandPageProps> = ({ musicians }) => {
  return (
    // page-container equivalent
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
            <div className="bg-card-slot border-2 border-dashed border-tertiary rounded-lg p-6 shadow-DEFAULT min-h-[280px]">
              <h3 id="band-assembly-title" className="text-xl font-serif font-semibold text-secondary mb-4">
                角色池 (Band Slots)
              </h3>
              <p className="text-text-main">樂隊成員位置區域 (預計六個卡槽)</p>
            </div>

            {/* content-box musicians-pool-area equivalent */}
            <div className="bg-card rounded-lg p-6 shadow-DEFAULT min-h-[230px]">
              <h4 className="text-lg font-serif font-semibold text-secondary mb-3">
                音樂家池 ({musicians.length > 0 ? `${musicians.length} 位可用` : '尚無音樂家'})
              </h4>
              {musicians.length === 0 ? (
                <p className="text-text-main italic text-center py-4">請先到「建立音樂家」頁面新增音樂家。</p>
              ) : (
                <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto p-2">
                  {musicians.map(musician => (
                    <li key={musician.id} className="bg-card-slot p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-grab active:cursor-grabbing">
                      <h5 className="text-md font-serif font-semibold text-primary truncate">{musician.name}</h5>
                      {musician.overallPrimaryStyle && (
                        <p className="text-xs text-text-main mb-1">
                          風格: {MUSIC_STYLE_LABELS[musician.overallPrimaryStyle]}
                        </p>
                      )}
                      <p className="text-xs text-text-secondary_light">專長:</p>
                      <ul className="text-xs text-text-main list-disc list-inside pl-2">
                        {musician.instruments.slice(0, 2).map((inst, index) => (
                           <li key={index} className="truncate">
                            {MUSICIAN_ROLE_LABELS[inst.role]}
                            {inst.skillLevel && ` (Lvl ${inst.skillLevel})`}
                          </li>
                        ))}
                        {musician.instruments.length > 2 && <li className="text-xs italic">...等 {musician.instruments.length} 項</li>}
                      </ul>
                      {/* TODO: Add drag handle or make entire card draggable */}
                    </li>
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
                </p>
              </div>
              <button className={`${buttonPrimaryClasses} mt-6 self-start`}>
                開始評估！
              </button>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
};

export default AssembleBandPage; 