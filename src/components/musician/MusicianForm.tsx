import React, { useState } from 'react';
import { Musician, InstrumentKey, MusicStyle, VocalRange, SkillLevel, DEFAULT_BAND_SLOTS_CONFIG } from '../../types';

interface MusicianFormProps {
  onSubmit: (musician: Omit<Musician, 'id'>) => void;
  initialData?: Musician; // 用於編輯
}

const musicStyles: MusicStyle[] = ['rock', 'pop', 'jazz', 'blues', 'acoustic', 'metal', 'funk', 'ballad', 'reggae', 'country', 'electronic', 'folk'];
const vocalRanges: VocalRange[] = ['high', 'medium', 'low', 'versatile'];
const skillLevels: SkillLevel[] = [1, 2, 3, 4, 5];
const instrumentKeys = DEFAULT_BAND_SLOTS_CONFIG.map(slot => slot.id);

const MusicianForm: React.FC<MusicianFormProps> = ({ onSubmit, initialData }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [primaryInstrument, setPrimaryInstrument] = useState<InstrumentKey>(initialData?.primaryInstrument || instrumentKeys[0]);
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(initialData?.skillLevel || 3);
  const [styles, setStyles] = useState<MusicStyle[]>(initialData?.styles || []);
  const [vocalRange, setVocalRange] = useState<VocalRange | undefined>(initialData?.vocalRange);
  const [description, setDescription] = useState(initialData?.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !primaryInstrument) {
      alert('請填寫音樂家名稱和主要樂器！');
      return;
    }
    onSubmit({
      name,
      primaryInstrument,
      skillLevel,
      styles,
      vocalRange: primaryInstrument.includes('vocal') ? vocalRange : undefined,
      description,
    });
    // 重設表單 (可選)
    setName('');
    setPrimaryInstrument(instrumentKeys[0]);
    setSkillLevel(3);
    setStyles([]);
    setVocalRange(undefined);
    setDescription('');
  };

  const handleStyleChange = (style: MusicStyle) => {
    setStyles(prev => 
      prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
    );
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px', margin: '20px auto' }}>
      <h3>{initialData ? '編輯音樂家' : '新增音樂家'}</h3>
      <div>
        <label htmlFor="name">名稱: </label>
        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div>
        <label htmlFor="primaryInstrument">主要樂器: </label>
        <select id="primaryInstrument" value={primaryInstrument} onChange={e => setPrimaryInstrument(e.target.value as InstrumentKey)} required>
          {instrumentKeys.map(key => (
            <option key={key} value={key}>{DEFAULT_BAND_SLOTS_CONFIG.find(s => s.id === key)?.label || key}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="skillLevel">技能等級 (1-5): </label>
        <select id="skillLevel" value={skillLevel} onChange={e => setSkillLevel(Number(e.target.value) as SkillLevel)}>
          {skillLevels.map(level => <option key={level} value={level}>{level}</option>)}
        </select>
      </div>
      <div>
        <label>擅長風格: </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px'}}>
          {musicStyles.map(style => (
            <label key={style} style={{ display: 'flex', alignItems: 'center'}}>
              <input 
                type="checkbox" 
                checked={styles.includes(style)} 
                onChange={() => handleStyleChange(style)} 
              /> {style}
            </label>
          ))}
        </div>
      </div>
      {primaryInstrument.includes('vocal') && (
        <div>
          <label htmlFor="vocalRange">音域 (僅限聲樂): </label>
          <select id="vocalRange" value={vocalRange || ''} onChange={e => setVocalRange(e.target.value as VocalRange)}>
            <option value="">選擇音域</option>
            {vocalRanges.map(range => <option key={range} value={range}>{range}</option>)}
          </select>
        </div>
      )}
      <div>
        <label htmlFor="description">描述 (可選): </label>
        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} />
      </div>
      <button type="submit">{initialData ? '更新' : '新增'}</button>
    </form>
  );
};

export default MusicianForm; 