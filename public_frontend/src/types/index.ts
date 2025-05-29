// 代表樂隊位置的唯一標識符和顯示名稱
export type InstrumentKey = 'electric_guitar' | 'drums' | 'male_vocal' | 'female_vocal' | 'guitar' | 'keyboard';
export const INSTRUMENT_SLOT_LABELS: Record<InstrumentKey, string> = {
  electric_guitar: '電吉他',
  drums: '鼓',
  male_vocal: '男主唱',
  female_vocal: '女主唱',
  guitar: '吉他',
  keyboard: 'KB',
};

// 音樂家可以精通的樂器/角色類型 (可多選)
export type MusicianRole = 'vocalist' | 'guitarist' | 'bassist' | 'drummer' | 'keyboardist' | 'electric_guitarist';
export const MUSICIAN_ROLE_LABELS: Record<MusicianRole, string> = {
  vocalist: '主唱',
  guitarist: '吉他手',
  bassist: '貝斯手', // 新增貝斯手作為一個可能的角色
  drummer: '鼓手',
  keyboardist: '鍵盤手',
  electric_guitarist: '電吉他手',
};


// 主唱相關屬性
export type VocalType = 'male' | 'female';
export type VocalRange = 'soprano' | 'mezzo-soprano' | 'alto' | 'tenor' | 'baritone' | 'bass' | 'versatile';
export const VOCAL_RANGE_LABELS: Record<VocalRange, string> = {
  soprano: '女高音',
  'mezzo-soprano': '女中音',
  alto: '女低音/中音',
  tenor: '男高音',
  baritone: '男中音',
  bass: '男低音',
  versatile: '通用音域',
};

// 新增：音域標籤到具體音符範圍的映射
// 注意：這些音域範圍是近似值，僅供參考和預設。
// 格式為 NoteNameOctave (例如 C4, F#5)
export const VOCAL_RANGE_NOTE_MAP: Record<VocalRange, { lowest: string; highest: string }> = {
  soprano: { lowest: 'C4', highest: 'C6' },         // 女高音
  'mezzo-soprano': { lowest: 'A3', highest: 'A5' }, // 女中音
  alto: { lowest: 'F3', highest: 'F5' },            // 女低音/中音
  tenor: { lowest: 'C3', highest: 'C5' },           // 男高音
  baritone: { lowest: 'F2', highest: 'F4' },        // 男中音
  bass: { lowest: 'E2', highest: 'E4' },            // 男低音
  versatile: { lowest: 'G2', highest: 'G5' },       // 通用音域 (給一個較寬的範圍)
};

// 通用音樂風格
export type MusicStyle = 'rock' | 'pop' | 'jazz' | 'blues' | 'acoustic' | 'metal' | 'funk' | 'ballad' | 'electronic' | 'classical' | 'reggae' | 'folk';
export const MUSIC_STYLE_LABELS: Record<MusicStyle, string> = {
  rock: '搖滾',
  pop: '流行',
  jazz: '爵士',
  blues: '藍調',
  acoustic: '原聲',
  metal: '金屬',
  funk: '放克',
  ballad: '抒情',
  electronic: '電子',
  classical: '古典',
  reggae: '雷鬼',
  folk: '民謠',
};

// 技能等級
export type SkillLevel = 1 | 2 | 3 | 4 | 5;
export const SKILL_LEVEL_OPTIONS: Array<{ value: SkillLevel; label: string }> = [
  { value: 1, label: '入門' },
  { value: 2, label: '初級' },
  { value: 3, label: '中級' },
  { value: 4, label: '高級' },
  { value: 5, label: '大師' },
];

// 單一樂器的詳細資料
export interface InstrumentDetail {
  role: MusicianRole; // 如 'vocalist', 'guitarist'
  primaryStyle?: MusicStyle; // 該樂器/角色最主要的風格
  skillLevel?: SkillLevel | undefined; // Allow undefined
  // 主唱特有
  vocalType?: VocalType; // 'male' or 'female'
  vocalRange?: VocalRange; // 描述性音域標籤
  preciseLowestNote?: string; // 例如 "C3"
  preciseHighestNote?: string; // 例如 "G5"
  // 樂手特有 (範例)
  canPlayLead?: boolean; // (吉他)
  canPlayRhythm?: boolean; // (吉他)
  preferredDrumKit?: string; // (鼓) 例如 "Standard Rock Kit"
  keyboardSounds?: string[]; // (鍵盤) 例如 ["Piano", "Synth Pad"]
}

// 音樂家資料結構
export interface Musician {
  id: string; // UUID
  name: string; // 音樂家名字
  description?: string; // 簡短描述
  instruments: InstrumentDetail[]; // 音樂家精通的樂器/角色列表 (可多個)
  overallPrimaryStyle?: MusicStyle; // 整體主要風格
  // imageUrl?: string; // 音樂家頭像 (可選)
}

// 歌曲結構 (主要由後端提供，前端僅定義接收的結構)
export interface Song {
  id: string;
  title: string;
  artist: string;
  primaryGenre: MusicStyle;
  secondaryGenres?: MusicStyle[];
  tempo?: 'slow' | 'medium' | 'fast';
  key?: string; // 例如 "C Major"
  songLowestNote?: string; // 例如 "A3"
  songHighestNote?: string; // 例如 "E5"
}

// 新增：用於 react-dnd 的拖曳項目類型
export const ItemTypes = {
  MUSICIAN: 'musician',
};

// 樂隊位置的定義，固定六個
export interface BandSlotDefinition {
  id: InstrumentKey;
  label: string;
  allowedRoles: MusicianRole[]; // 允許放入此位置的角色類型，例如男主唱位置只能放 vocalist
}

// 實際樂隊中一個位置的狀態
export interface BandMemberSlot {
  slotDefinition: BandSlotDefinition; // 改為直接嵌入定義，方便取用 allowedRoles 等
  musician: Musician | null; // 放入此位置的音樂家
  // selectedRole: MusicianRole | null; // 如果音樂家有多重角色，需要指定在此位置扮演的角色 (暫時移除，簡化初期邏輯)
}

// 傳送給後端的樂隊資料結構
export interface BandCompositionPayload {
  members: Array<{
    slotId: InstrumentKey;
    musicianId: string;
    role: MusicianRole;
    // 可以選擇性加入更多前端已知的音樂家屬性，供後端參考
    attributes?: Partial<InstrumentDetail>;
  }>;
}

// 後端回傳的分析結果
export interface BandAnalysisResponse {
  overallStyle?: string; // 例如 "這是一支以流行搖滾為主的樂隊"
  specialTones?: string[]; // 例如 ["主唱音色清亮", "吉他手技巧出色"]
  suitableSongs: Song[];
}

// 用於 dnd-kit 的可拖曳項目
export interface DraggableMusician extends Musician {
  isDraggable: true; // 標識這是可拖曳的音樂家
}

export interface DroppableSlot {
  id: InstrumentKey; // 樂隊位置的 ID
  accepts: MusicianRole[]; // 該位置接受的音樂家角色
  // 新增一個 type 屬性，用於 useDrop 的 accept 參數
  type: string; 
} 