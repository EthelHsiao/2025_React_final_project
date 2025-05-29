export type InstrumentKey = 'electric_guitar' | 'drums' | 'male_vocal' | 'female_vocal' | 'guitar' | 'keyboard' | 'bass'; // 新增貝斯

export interface InstrumentSlotLabel {
  electric_guitar: '電吉他';
  drums: '鼓';
  male_vocal: '男主唱';
  female_vocal: '女主唱';
  guitar: '吉他';
  keyboard: '鍵盤';
  bass: '貝斯';
}

// 預設的樂隊位置配置
export const DEFAULT_BAND_SLOTS_CONFIG: Pick<BandSlot, 'id' | 'label'>[] = [
  { id: 'male_vocal', label: '男主唱' },
  { id: 'female_vocal', label: '女主唱' },
  { id: 'electric_guitar', label: '電吉他' },
  { id: 'guitar', label: '吉他' },
  { id: 'bass', label: '貝斯' },
  { id: 'drums', label: '鼓' },
  { id: 'keyboard', label: '鍵盤' },
];


export type VocalType = 'male' | 'female';
export type VocalRange = 'high' | 'medium' | 'low' | 'versatile';
export type MusicStyle =
  | 'rock'
  | 'pop'
  | 'jazz'
  | 'blues'
  | 'acoustic'
  | 'metal'
  | 'funk'
  | 'ballad'
  | 'reggae'
  | 'country'
  | 'electronic'
  | 'folk';

export type SkillLevel = 1 | 2 | 3 | 4 | 5; // 1 (初學者) 到 5 (大師)

// 音樂家擁有的單一樂器技能
export interface MusicianInstrumentSkill {
  instrument: InstrumentKey; // 該技能對應的樂器
  skillLevel: SkillLevel;
  styles: MusicStyle[]; // 在這個樂器上擅長的風格
  // 特定樂器的額外屬性
  vocalRange?: VocalRange; // 僅適用於 vocal 類型
  // 其他例如: canPlayLead (吉他), drumComplexityPreference (鼓) 等可以後續擴展
}

export interface Musician {
  id: string; // 通常是 UUID
  name: string; // 音樂家名字/代號
  // 一個音樂家可以擁有多種樂器技能，每種技能可以作為一張單獨的卡牌
  // 但在我們的簡化模型中，一個 "MusicianCard" 可能代表一個 Musician 的一種 MusicianInstrumentSkill
  // 因此，當我們從 "MusicianPool" 拖曳時，我們實際上是拖曳一個 "Musician" 的特定 "InstrumentSkill"
  // 然而，為了簡化管理，我們先讓一個Musician實體主要關聯一種核心樂器用於卡牌顯示
  // 真正的 "精通多種樂器" 可以在創建Musician時記錄下來，然後決定是否為其生成多張不同樂器卡牌
  primaryInstrument: InstrumentKey; // 主要用於卡牌分類和初始顯示
  skillLevel: SkillLevel;
  styles: MusicStyle[];
  vocalRange?: VocalRange; // 如果 primaryInstrument 是 vocal
  // imageUrl?: string; // 音樂家頭像 (可選)
  description?: string; // 簡單描述
}


export interface Song {
  id: string;
  title: string;
  artist: string;
  primaryGenre: MusicStyle;
  secondaryGenres?: MusicStyle[];
  tempo?: 'slow' | 'medium' | 'fast';
  // 為了前端顯示，即使匹配在後端，也定義結構
}

// 代表樂隊中的一個位置
export interface BandSlot {
  id: InstrumentKey; // Slot 的唯一標識，也代表了該位置期望的樂器類型
  label: string; // UI上顯示的標籤，例如 "電吉他"
  accepts: InstrumentKey[]; // 此插槽能接受的樂器類型 (通常是單一類型，但為擴展性保留數組)
  musician: Musician | null; // 放入此位置的音樂家實體
}

// 發送到後端的樂隊數據結構
export interface BandCompositionPayload {
  slots: Array<{
    slotId: InstrumentKey;
    musicianId: string | null; // 如果該位置有音樂家，則為其ID
  }>;
  // 可以添加其他分析參數
}

// 從後端接收的分析結果
export interface BackendAnalysisData {
  overallStyle: string;
  specialTones: string[];
  suitableSongs: Song[];
}

// 前端使用的完整分析數據，可能包含一些客戶端處理後的資訊
export interface FrontendAnalysisData extends BackendAnalysisData {
  // 可能有額外的前端特定欄位
}

// 用於拖曳的物件類型
export interface DraggableMusician {
  musicianId: string;
  instrument: InstrumentKey; // 指明這張卡代表該音樂家的哪種樂器技能
} 