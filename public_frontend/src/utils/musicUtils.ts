/**
 * Music theory utility functions.
 */

// Defines the mapping of note names (pitch classes) to their numerical value (0-11)
// Using sharps for accidentals for consistency with current types.
const NOTE_TO_PITCH_CLASS: Record<string, number> = {
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