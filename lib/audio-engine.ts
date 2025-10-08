import * as Tone from 'tone';
import type { Note, InstrumentSettings, ChordInstance } from './types';
import { toToneNotation } from './notes';

export class AudioEngine {
  private synth: Tone.PolySynth | null = null;
  private reverb: Tone.Reverb | null = null;
  private delay: Tone.FeedbackDelay | null = null;
  private volume: Tone.Volume | null = null;
  private isInitialized = false;

  /**
   * Initialize the audio context and effects chain
   * Must be called after a user interaction
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await Tone.start();

      // Create effects
      this.reverb = new Tone.Reverb({
        decay: 2,
        wet: 0.3,
      });

      this.delay = new Tone.FeedbackDelay({
        delayTime: '8n',
        feedback: 0.3,
        wet: 0,
      });

      this.volume = new Tone.Volume(-3);

      // Create synth with piano-like envelope
      // Piano notes decay naturally over time, even when held
      this.synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
          type: 'triangle',
        },
        envelope: {
          attack: 0.005,      // Quick attack (5ms) - hammer hits string
          decay: 5.0,         // Extended decay (5s) - longer string vibration
          sustain: 0,         // No sustain - complete silence after decay (true piano behavior)
          release: 0.3,       // Short release (300ms) - damper stops string
        },
      });

      // Connect effects chain: synth -> delay -> reverb -> volume -> destination
      this.synth.chain(this.delay, this.reverb, this.volume, Tone.Destination);

      await this.reverb.ready;

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize audio engine:', error);
      throw error;
    }
  }

  /**
   * Play a single note
   */
  playNote(note: Note, duration: string = '8n'): void {
    if (!this.synth) {
      console.warn('Audio engine not initialized');
      return;
    }

    const noteString = toToneNotation(note);
    this.synth.triggerAttackRelease(noteString, duration);
  }

  /**
   * Start a note without automatic release (for sustain pedal)
   */
  attackNote(note: Note): void {
    if (!this.synth) {
      console.warn('Audio engine not initialized');
      return;
    }

    const noteString = toToneNotation(note);
    this.synth.triggerAttack(noteString);
  }

  /**
   * Release a specific note that was started with attackNote
   */
  releaseNote(note: Note): void {
    if (!this.synth) {
      console.warn('Audio engine not initialized');
      return;
    }

    const noteString = toToneNotation(note);
    this.synth.triggerRelease(noteString);
  }

  /**
   * Play multiple notes simultaneously (chord)
   */
  playChord(notes: Note[], duration: string = '2n'): void {
    if (!this.synth) {
      console.warn('Audio engine not initialized');
      return;
    }

    const noteStrings = notes.map(toToneNotation);
    this.synth.triggerAttackRelease(noteStrings, duration);
  }

  /**
   * Play a scale as a sequence
   */
  async playScale(notes: Note[], tempo: number = 120, direction: 'ascending' | 'descending' | 'both' = 'ascending'): Promise<void> {
    if (!this.synth) {
      console.warn('Audio engine not initialized');
      return;
    }

    const noteSequence = this.buildScaleSequence(notes, direction);

    return new Promise((resolve) => {
      const sequence = new Tone.Sequence(
        (time, note) => {
          this.synth!.triggerAttackRelease(toToneNotation(note), '8n', time);
        },
        noteSequence,
        '8n'
      );

      Tone.getTransport().bpm.value = tempo;

      sequence.start(0);
      Tone.getTransport().start();

      // Calculate duration and stop
      const duration = (noteSequence.length / 2) * (60 / tempo);
      setTimeout(() => {
        Tone.getTransport().stop();
        sequence.dispose();
        resolve();
      }, duration * 1000);
    });
  }

  /**
   * Build scale sequence based on direction
   */
  private buildScaleSequence(notes: Note[], direction: 'ascending' | 'descending' | 'both'): Note[] {
    switch (direction) {
      case 'ascending':
        return notes;
      case 'descending':
        return [...notes].reverse();
      case 'both':
        return [...notes, ...[...notes].reverse().slice(1, -1)];
      default:
        return notes;
    }
  }

  /**
   * Play a chord progression
   */
  async playProgression(chords: ChordInstance[], tempo: number = 100): Promise<void> {
    if (!this.synth) {
      console.warn('Audio engine not initialized');
      return;
    }

    return new Promise((resolve) => {
      const part = new Tone.Part((time, chord) => {
        const noteStrings = chord.notes.map(toToneNotation);
        this.synth!.triggerAttackRelease(noteStrings, '1n', time);
      }, chords.map((chord, index) => [index * (60 / tempo), chord]));

      part.start(0);
      Tone.getTransport().start();

      const duration = chords.length * (60 / tempo);
      setTimeout(() => {
        Tone.getTransport().stop();
        part.dispose();
        resolve();
      }, duration * 1000 + 1000); // Add buffer
    });
  }

  /**
   * Generate and play a backing track
   */
  async playBackingTrack(
    chords: ChordInstance[],
    tempo: number = 100,
    duration: number = 16 // bars
  ): Promise<void> {
    if (!this.synth) {
      console.warn('Audio engine not initialized');
      return;
    }

    // Create bass synth
    const bass = new Tone.MonoSynth({
      oscillator: { type: 'sawtooth' },
      envelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.3,
        release: 0.5,
      },
      filterEnvelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.5,
        release: 0.5,
        baseFrequency: 200,
        octaves: 2,
      },
    }).toDestination();

    // Create drum synths
    const kick = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 4,
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.001,
        decay: 0.4,
        sustain: 0.01,
        release: 0.4,
      },
    }).toDestination();

    const snare = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: {
        attack: 0.001,
        decay: 0.2,
        sustain: 0,
      },
    }).toDestination();

    const hihat = new Tone.MetalSynth({
      frequency: 200,
      envelope: {
        attack: 0.001,
        decay: 0.1,
        release: 0.01,
      },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5,
    }).toDestination();

    Tone.getTransport().bpm.value = tempo;

    // Chord progression pattern
    const chordPart = new Tone.Part((time, chord) => {
      const noteStrings = chord.notes.map(toToneNotation);
      this.synth!.triggerAttackRelease(noteStrings, '2n', time);
    }, this.generateChordPattern(chords, duration));

    // Bass pattern
    const bassPart = new Tone.Part((time, note) => {
      bass.triggerAttackRelease(toToneNotation(note), '8n', time);
    }, this.generateBassPattern(chords, duration));

    // Drum patterns
    const kickPart = new Tone.Part((time) => {
      kick.triggerAttackRelease('C1', '8n', time);
    }, this.generateKickPattern(duration));

    const snarePart = new Tone.Part((time) => {
      snare.triggerAttackRelease('8n', time);
    }, this.generateSnarePattern(duration));

    const hihatPart = new Tone.Part((time) => {
      hihat.triggerAttackRelease('32n', time);
    }, this.generateHihatPattern(duration));

    // Start all parts
    [chordPart, bassPart, kickPart, snarePart, hihatPart].forEach(part => {
      part.start(0);
      part.loop = true;
      part.loopEnd = `${duration}m`;
    });

    Tone.getTransport().start();

    // Return promise that resolves after specified duration
    return new Promise((resolve) => {
      setTimeout(() => {
        Tone.getTransport().stop();
        [chordPart, bassPart, kickPart, snarePart, hihatPart].forEach(part => part.dispose());
        bass.dispose();
        kick.dispose();
        snare.dispose();
        hihat.dispose();
        resolve();
      }, duration * 4 * (60 / tempo) * 1000);
    });
  }

  /**
   * Generate chord pattern for backing track
   */
  private generateChordPattern(chords: ChordInstance[], bars: number): [string, ChordInstance][] {
    const pattern: [string, ChordInstance][] = [];
    for (let bar = 0; bar < bars; bar++) {
      const chord = chords[bar % chords.length];
      pattern.push([`${bar}:0:0`, chord]);
    }
    return pattern;
  }

  /**
   * Generate bass pattern
   */
  private generateBassPattern(chords: ChordInstance[], bars: number): [string, Note][] {
    const pattern: [string, Note][] = [];
    for (let bar = 0; bar < bars; bar++) {
      const chord = chords[bar % chords.length];
      const bassNote = { ...chord.root, octave: 2 }; // Bass in octave 2

      // Root note on beat 1 and 3
      pattern.push([`${bar}:0:0`, bassNote]);
      pattern.push([`${bar}:2:0`, bassNote]);
    }
    return pattern;
  }

  /**
   * Generate kick drum pattern (beats 1 and 3)
   */
  private generateKickPattern(bars: number): string[] {
    const pattern: string[] = [];
    for (let bar = 0; bar < bars; bar++) {
      pattern.push(`${bar}:0:0`);  // Beat 1
      pattern.push(`${bar}:2:0`);  // Beat 3
    }
    return pattern;
  }

  /**
   * Generate snare pattern (beats 2 and 4)
   */
  private generateSnarePattern(bars: number): string[] {
    const pattern: string[] = [];
    for (let bar = 0; bar < bars; bar++) {
      pattern.push(`${bar}:1:0`);  // Beat 2
      pattern.push(`${bar}:3:0`);  // Beat 4
    }
    return pattern;
  }

  /**
   * Generate hi-hat pattern (8th notes)
   */
  private generateHihatPattern(bars: number): string[] {
    const pattern: string[] = [];
    for (let bar = 0; bar < bars; bar++) {
      for (let beat = 0; beat < 4; beat++) {
        pattern.push(`${bar}:${beat}:0`);
        pattern.push(`${bar}:${beat}:2`);
      }
    }
    return pattern;
  }

  /**
   * Update instrument settings
   */
  updateSettings(settings: Partial<InstrumentSettings>): void {
    if (!this.isInitialized) return;

    if (settings.volume !== undefined && this.volume) {
      this.volume.volume.value = settings.volume;
    }

    if (settings.reverb !== undefined && this.reverb) {
      this.reverb.wet.value = settings.reverb;
    }

    if (settings.delay !== undefined && this.delay) {
      this.delay.wet.value = settings.delay;
    }

    if (settings.attack !== undefined && this.synth) {
      this.synth.set({ envelope: { attack: settings.attack } });
    }

    if (settings.release !== undefined && this.synth) {
      this.synth.set({ envelope: { release: settings.release } });
    }
  }

  /**
   * Stop all sounds
   */
  stopAll(): void {
    if (this.synth) {
      this.synth.releaseAll();
    }
    Tone.getTransport().stop();
    Tone.getTransport().cancel();
  }

  /**
   * Enable sustain mode - notes decay naturally but much more slowly
   * Mimics real piano with dampers lifted - strings vibrate freely but still fade
   */
  enableSustain(): void {
    if (!this.synth) return;

    this.synth.set({
      envelope: {
        attack: 0.005,
        decay: 8.0,       // Moderate decay to sustain level
        sustain: 0.4,     // Hold at 40% volume - keeps note audible
        release: 12.0,    // Very long release brings it to silence gradually
      },
    });
  }

  /**
   * Disable sustain mode - restore natural piano decay
   */
  disableSustain(): void {
    if (!this.synth) return;

    this.synth.set({
      envelope: {
        attack: 0.005,
        decay: 5.0,       // Extended natural decay
        sustain: 0,       // Complete silence - true piano behavior
        release: 0.3,
      },
    });
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.stopAll();

    if (this.synth) {
      this.synth.dispose();
      this.synth = null;
    }

    if (this.reverb) {
      this.reverb.dispose();
      this.reverb = null;
    }

    if (this.delay) {
      this.delay.dispose();
      this.delay = null;
    }

    if (this.volume) {
      this.volume.dispose();
      this.volume = null;
    }

    this.isInitialized = false;
  }

  /**
   * Check if engine is initialized
   */
  get initialized(): boolean {
    return this.isInitialized;
  }
}

// Singleton instance
let audioEngineInstance: AudioEngine | null = null;

export function getAudioEngine(): AudioEngine {
  if (!audioEngineInstance) {
    audioEngineInstance = new AudioEngine();
  }
  return audioEngineInstance;
}
