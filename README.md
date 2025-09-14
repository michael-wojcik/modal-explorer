# Modal Explorer

An interactive web application for exploring and learning about the seven diatonic modes in music theory. Built with Next.js, TypeScript, Tone.js, and Tailwind CSS.

## Features

### Interactive Learning
- **7 Diatonic Modes**: Explore Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, and Locrian modes
- **Visual Keyboard**: Interactive piano keyboard with scale highlighting
- **Audio Playback**: Play scales, individual notes, and chord progressions
- **Characteristic Notes**: Visual indicators for notes that define each mode's unique sound

### Music Theory Tools
- **Mode Comparison**: Compare modes by brightness and interval patterns
- **Chord Visualization**: See diatonic chords for each mode with Roman numeral analysis
- **Scale Degrees**: Understand interval formulas and scale construction
- **Transposition**: Change keys and octaves on the fly

### Audio Engine
- **Web Audio API**: High-quality sound synthesis using Tone.js
- **Multiple Playback Options**: Play scales ascending, descending, or both
- **Chord Progressions**: Listen to diatonic chord progressions
- **Adjustable Tempo**: Control playback speed (40-200 BPM)
- **Volume Control**: Fine-tune audio levels

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Audio**: Tone.js (Web Audio API)
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd modal-explorer

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

## Project Structure

```
modal-explorer/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main application page
│   └── globals.css         # Global styles
├── components/
│   ├── PianoKey.tsx        # Individual piano key component
│   ├── PianoKeyboard.tsx   # Complete keyboard with interaction
│   ├── ModeSidebar.tsx     # Mode selection sidebar
│   ├── TransportControls.tsx # Playback controls
│   └── ChordDisplay.tsx    # Chord visualization
├── lib/
│   ├── types.ts            # TypeScript type definitions
│   ├── notes.ts            # Note and frequency utilities
│   ├── modes.ts            # Mode definitions and data
│   ├── theory-engine.ts    # Music theory algorithms
│   ├── audio-engine.ts     # Tone.js audio synthesis
│   └── store.ts            # Zustand state management
└── public/                 # Static assets
```

## Key Components

### Music Theory Engine
The theory engine (`lib/theory-engine.ts`) provides:
- Scale generation from root note and mode
- Diatonic chord construction
- Mode analysis and comparison
- Common chord progression patterns

### Audio Engine
The audio engine (`lib/audio-engine.ts`) handles:
- Polyphonic synthesis
- Scale and chord playback
- Effects chain (reverb, delay)
- Backing track generation

### Interactive Keyboard
The piano keyboard component features:
- 88 keys with proper spacing
- Visual highlighting for scale notes
- Color-coded root and characteristic notes
- Click-to-play functionality
- Responsive SVG rendering

## What This Demonstrates

### Technical Skills
1. **Complex State Management**: Multi-layered application state with Zustand
2. **Audio Programming**: Web Audio API and real-time synthesis
3. **Algorithm Design**: Music theory calculations and pattern generation
4. **Type Safety**: Comprehensive TypeScript implementation
5. **Performance**: Optimized rendering with React hooks and memoization

### Software Engineering
1. **Clean Architecture**: Separation of concerns (UI, logic, data)
2. **Reusable Components**: Modular, composable React components
3. **Domain Modeling**: Rich type system for music theory concepts
4. **User Experience**: Intuitive controls and visual feedback
5. **Modern Practices**: Latest React patterns and Next.js features

### Music Theory Knowledge
1. **Modal System**: Deep understanding of diatonic modes
2. **Harmony**: Chord construction and functional harmony
3. **Intervals**: Scale degree relationships
4. **Audio Synthesis**: Sound design and effects

## Usage Tips

1. **Explore Modes**: Click through different modes in the sidebar to hear their unique character
2. **Compare Scales**: Keep the same root note while changing modes to hear parallel mode relationships
3. **Play Chords**: Click individual chord cards to hear how they sound in each mode
4. **Experiment**: Try different keys and tempos to find interesting combinations
5. **Learn Theory**: Pay attention to characteristic notes (purple) that define each mode

## Educational Value

Modal Explorer is designed to help musicians:
- Understand modal theory visually and aurally
- Hear the difference between modes
- Learn scale construction and intervals
- Explore modal chord progressions
- Develop ear training skills

## Future Enhancements

Potential additions:
- MIDI input support for external keyboards
- Recording and loop functionality
- Ear training exercises and games
- Guitar fretboard visualization
- Staff notation display
- Mode quiz and challenges
- Export audio/MIDI files
- Custom scale builder
- Modal interchange examples

## License

This project is built as a portfolio demonstration piece.

## Acknowledgments

- Music theory foundations from traditional harmony texts
- Web Audio API and Tone.js for audio capabilities
- Next.js team for the excellent framework
- The open-source community
