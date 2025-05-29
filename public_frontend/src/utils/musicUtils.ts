/**
 * Music theory utility functions.
 */

// Defines the mapping of note names (pitch classes) to their numerical value (0-11)
// Using sharps for accidentals for consistency with current types.
export const NOTE_TO_PITCH_CLASS: Record<string, number> = {
  'C': 0,
  'C#': 1,
  'Db': 1,
  'D': 2,
  'D#': 3,
  'Eb': 3,
  'E': 4,
  'F': 5,
  'F#': 6,
  'Gb': 6,
  'G': 7,
  'G#': 8,
  'Ab': 8,
  'A': 9,
  'A#': 10,
  'Bb': 10,
  'B': 11,
};

const PITCH_CLASS_TO_NOTE: Record<number, { sharp: string; flat: string }> = {
  0: { sharp: 'C',  flat: 'C' },
  1: { sharp: 'C#', flat: 'Db' },
  2: { sharp: 'D',  flat: 'D' },
  3: { sharp: 'D#', flat: 'Eb' },
  4: { sharp: 'E',  flat: 'E' },
  5: { sharp: 'F',  flat: 'F' },
  6: { sharp: 'F#', flat: 'Gb' },
  7: { sharp: 'G',  flat: 'G' },
  8: { sharp: 'G#', flat: 'Ab' },
  9: { sharp: 'A',  flat: 'A' },
  10: { sharp: 'A#',flat: 'Bb' },
  11: { sharp: 'B', flat: 'B' },
};

/**
 * Parses a note string (e.g., "C4", "F#5", "Bb3") into its MIDI pitch value.
 * MIDI C4 is 60.
 * @param noteString The note string to parse.
 * @returns The MIDI pitch value, or null if parsing fails.
 */
export function parseNoteToMidi(noteString: string): number | null {
  if (!noteString || typeof noteString !== 'string') {
    return null;
  }

  const match = noteString.trim().match(/^([A-Ga-g])([#b]?)(-?\d+)$/);
  if (!match) {
    // Try matching scientific pitch notation without octave for just pitch class (e.g. C#)
    // This is less common for MIDI conversion but good for other uses.
    // However, for MIDI, octave is essential.
    return null; 
  }

  const noteName = match[1].toUpperCase();
  const accidental = match[2]; // '#', 'b', or ''
  const octave = parseInt(match[3], 10);

  let pitchClassKey = noteName;
  if (accidental) {
    pitchClassKey += accidental;
  }

  const pitchClassValue = NOTE_TO_PITCH_CLASS[pitchClassKey];

  if (pitchClassValue === undefined) {
    console.warn(`Could not parse note: Unknown note name or accidental: ${pitchClassKey}`);
    return null;
  }

  // MIDI formula: (octave + 1) * 12 + pitchClass
  // Assumes C4 is MIDI note 60. In this system, C0 is MIDI note 12.
  // Octave -1 for A0 to B0 (MIDI 21-23), Octave 0 for C1 to B1 (MIDI 24-35), etc.
  // A common convention: (octave + 1) * 12 + pitchClassValue (where C4=60)
  // For C4 = 60: (4+1)*12 + 0 = 60.
  // For C0 = 12: (0+1)*12 + 0 = 12.
  // For A4 = 69: (4+1)*12 + 9 = 69.
  // For A0 = 21: (0+1)*12 + 9 = 21.
  const midiValue = (octave + 1) * 12 + pitchClassValue;

  if (isNaN(midiValue) || midiValue < 0 || midiValue > 127) { // MIDI range 0-127
      console.warn(`Calculated MIDI value out of range (0-127): ${midiValue} for note ${noteString}`);
      return null;
  }

  return midiValue;
}

/**
 * Converts a MIDI pitch value back to a note string.
 * @param midiValue The MIDI pitch value.
 * @param preferSharp If true, prefers sharp notation (e.g., "C#"), otherwise prefers flat (e.g., "Db").
 * @returns The note string (e.g., "C4"), or null if conversion fails.
 */
export function midiToNoteString(midiValue: number, preferSharp: boolean = true): string | null {
  if (midiValue < 0 || midiValue > 127 || !Number.isInteger(midiValue)) {
    return null;
  }

  const pitchClass = midiValue % 12;
  const octave = Math.floor(midiValue / 12) - 1;

  const noteNames = PITCH_CLASS_TO_NOTE[pitchClass];
  if (!noteNames) {
    return null; // Should not happen if pitchClass is always 0-11
  }

  const noteName = preferSharp ? noteNames.sharp : noteNames.flat;
  return `${noteName}${octave}`;
}


/**
 * Calculates the width of a vocal range in semitones.
 * @param lowestNote String representation of the lowest note (e.g., "C3").
 * @param highestNote String representation of the highest note (e.g., "G5").
 * @returns The range width in semitones, or null if either note is invalid.
 */
export function getVocalRangeWidthInSemitones(lowestNote?: string, highestNote?: string): number | null {
  if (!lowestNote || !highestNote) return null;
  
  const lowMidi = parseNoteToMidi(lowestNote);
  const highMidi = parseNoteToMidi(highestNote);

  if (lowMidi === null || highMidi === null) {
    return null;
  }

  if (highMidi < lowMidi) {
    // console.warn('Highest note is lower than lowest note in range calculation.');
    return null; // Or handle as 0 or negative if appropriate for your logic
  }

  return highMidi - lowMidi;
}

// Constants for transposition analysis
const MIN_VOCAL_COMFORT_SEMITONES = 3; // Minimum semitones a vocalist should have beyond song range for comfort
const MAX_TRANSPOSE_SEMITONES = 7; // Max semitones we'd typically suggest transposing (a fifth)

export interface TranspositionResult {
  semitones?: number;
  message: string;
  originalSongLowMidi?: number;
  originalSongHighMidi?: number;
  transposedSongLowMidi?: number;
  transposedSongHighMidi?: number;
  vocalLowMidi?: number;
  vocalHighMidi?: number;
}

/**
 * Finds an optimal transposition for a song to fit a vocalist's range.
 * @param vocalLowMidi Vocalist's lowest MIDI note.
 * @param vocalHighMidi Vocalist's highest MIDI note.
 * @param songLowMidi Song's original lowest MIDI note.
 * @param songHighMidi Song's original highest MIDI note.
 * @returns An object with the suggested transposition in semitones and a message,
 *          or just a message if no suitable transposition is found or if input is invalid.
 */
export const findOptimalTransposition = (
  vocalLowMidi?: number | null, 
  vocalHighMidi?: number | null, 
  songLowMidi?: number | null, 
  songHighMidi?: number | null
): TranspositionResult => {
  if (vocalLowMidi == null || vocalHighMidi == null || songLowMidi == null || songHighMidi == null) {
    return { message: "輸入的音域或歌曲音高資訊不完整。" };
  }

  if (vocalLowMidi >= vocalHighMidi) {
    return { message: "歌手的最低音高於或等於最高音，音域設定無效。" };
  }
  if (songLowMidi >= songHighMidi) {
    return { message: "歌曲的最低音高於或等於最高音，歌曲音高設定無效。" };
  }

  const vocalWidth = vocalHighMidi - vocalLowMidi;
  const songWidth = songHighMidi - songLowMidi;

  // Check if song is already within vocal range comfortably
  if (vocalLowMidi <= songLowMidi && vocalHighMidi >= songHighMidi) {
    if (vocalWidth >= songWidth + MIN_VOCAL_COMFORT_SEMITONES * 2) {
        return {
            semitones: 0,
            message: "歌曲已在歌手的舒適音域內，無需移調。",
            originalSongLowMidi: songLowMidi,
            originalSongHighMidi: songHighMidi,
            transposedSongLowMidi: songLowMidi,
            transposedSongHighMidi: songHighMidi,
            vocalLowMidi,
            vocalHighMidi,
        };
    }
    return {
        semitones: 0,
        message: "歌曲音域在歌手能力範圍內，但可能挑戰極限音。無需移調。",
        originalSongLowMidi: songLowMidi,
        originalSongHighMidi: songHighMidi,
        transposedSongLowMidi: songLowMidi,
        transposedSongHighMidi: songHighMidi,
        vocalLowMidi,
        vocalHighMidi,
    };
  }
  
  // If song is wider than vocal range, it's impossible even with transposition
  if (songWidth > vocalWidth) {
    return { 
        message: `歌曲音域寬度 (${songWidth} 半音) 超過歌手音域寬度 (${vocalWidth} 半音)，無法完整演唱。`,
        originalSongLowMidi: songLowMidi,
        originalSongHighMidi: songHighMidi,
        vocalLowMidi,
        vocalHighMidi,
    };
  }

  let bestTranspose = null;
  let minDifference = Infinity; // Used to find transposition that best centers song in vocal range

  // Try transposing up and down within MAX_TRANSPOSE_SEMITONES
  for (let semitones = -MAX_TRANSPOSE_SEMITONES; semitones <= MAX_TRANSPOSE_SEMITONES; semitones++) {
    const transposedLow = songLowMidi + semitones;
    const transposedHigh = songHighMidi + semitones;

    if (transposedLow >= vocalLowMidi && transposedHigh <= vocalHighMidi) {
      // This transposition fits. Now, check if it's a "good" fit.
      // We prefer a transposition that centers the song in the vocalist's range
      // or at least provides some comfort margin.
      const lowComfort = transposedLow - vocalLowMidi;
      const highComfort = vocalHighMidi - transposedHigh;
      
      // Prioritize fits with at least minimal comfort on both ends
      if (lowComfort >= MIN_VOCAL_COMFORT_SEMITONES && highComfort >= MIN_VOCAL_COMFORT_SEMITONES) {
        const currentDifference = Math.abs((vocalHighMidi - vocalLowMidi) - (transposedHigh - transposedLow)) / 2 - Math.min(lowComfort, highComfort);
        if (bestTranspose === null || currentDifference < minDifference) {
            minDifference = currentDifference;
            bestTranspose = semitones;
        }
      } else if (bestTranspose === null) { 
        // If no comfortable fit found yet, take any fit. 
        // This part can be refined based on how strictly we want to enforce MIN_VOCAL_COMFORT_SEMITONES
        const currentDifference = Math.abs(transposedLow - vocalLowMidi) + Math.abs(vocalHighMidi - transposedHigh);
        if (currentDifference < minDifference) {
            minDifference = currentDifference;
            bestTranspose = semitones;
        }
      }
    }
  }

  if (bestTranspose !== null) {
    const transposedLow = songLowMidi + bestTranspose;
    const transposedHigh = songHighMidi + bestTranspose;
    let message = `建議移調 ${bestTranspose} 半音 (`;
    if (bestTranspose > 0) message += `升 ${bestTranspose} Key`;
    else if (bestTranspose < 0) message += `降 ${-bestTranspose} Key`;
    else message = "無需移調，歌曲已在歌手音域內。"; // Should have been caught earlier, but as a fallback.
    message += ").";
    
    // Additional comfort check message
    const lowComfort = transposedLow - vocalLowMidi;
    const highComfort = vocalHighMidi - transposedHigh;
    if (lowComfort < MIN_VOCAL_COMFORT_SEMITONES || highComfort < MIN_VOCAL_COMFORT_SEMITONES) {
        message += " 注意：此移調可能仍會挑戰歌手的極限音。";
    }

    return { 
        semitones: bestTranspose,
        message,
        originalSongLowMidi: songLowMidi,
        originalSongHighMidi: songHighMidi,
        transposedSongLowMidi: transposedLow,
        transposedSongHighMidi: transposedHigh,
        vocalLowMidi,
        vocalHighMidi,
    };
  }

  return { 
    message: "在合理的移調範圍內，找不到適合歌手音域的歌曲移調方式。可能需要考慮大幅度移調或選擇其他歌曲。",
    originalSongLowMidi: songLowMidi,
    originalSongHighMidi: songHighMidi,
    vocalLowMidi,
    vocalHighMidi,
  };
}; 