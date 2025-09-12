# kidev's TCOAAL Creator Tool

A powerful, feature-rich dialog system for creating visual novel-style dialogs inspired by [_The Coffin of Andy and Leyley_](https://store.steampowered.com/app/2378900/The_Coffin_of_Andy_and_Leyley/) (by *Nemlei*). Features an asset explorer, integrated visual editor, advanced effects, and smooth transitions. Written in pure JavaScript.

## Features

### Integrated Visual Editor
- **Built-in editor** accessible via the controls menu ('Editor' button)
- **Visual scene builder** with preview
- **Save button** positioned at top right for quick updates
- **Character manager** with color picker
- **Scene organizer** with drag-and-drop reordering
- No manual coding required, everything through the UI (but code possible)

### Asset Management
- **Dual input system**: Upload local files OR use URLs for all assets
- **Background images** with preview thumbnails
- **Character busts** (left and right positions)
- **Sound effects** with inline playback controls
- **Automatic asset handling** that prioritizes uploaded files over URLs

### Character System
- Define unlimited characters with custom colors
- Automatic CSS generation for character styling
- Speaker names with optional glitch censoring effect
- Automatic quote marks for character dialog
- Visual character management in editor

### Advanced Visual Effects
- **Glitch text effects** with customizable parameters:
  - Scrambled/real colors
  - Change speed and probability
  - Custom character sets
- **Screen shake effects** with adjustable:
  - Intensity levels
  - Duration
  - Delay timing
- **Smooth typing animation** with variable speed
- (WIP) **Text formatting** support: `<b>bold</b>`, `<i>italic</i>`, `<u>underline</u>`

### Transition System
- **Independent timing controls** for dialog and images
- **Fade effects**: In/out with millisecond precision
- **Delay controls**: Precise timing choreography
- **Crossfade support**: Smooth image transitions using negative values
- **Instant transitions**: Zero-delay scene changes
- **Bust transitions**: Character sprites with fade effects

### Audio System
- HTML5 Audio with automatic loading/caching
- Volume control (0-1 scale)
- Delayed playback timing
- Support for local files and URLs
- Preview sounds directly in editor

### Navigation & Controls
- **Keyboard and mouse controls**
- **Control buttons** (with tooltips):
  - ⬅ Previous: previous scene
  - ➡ Next: next scene
  - ⟲ Restart: restart the sequence
  - Editor: open the visual editor
- **Scene jumping**: Navigate to any scene directly (code only)
- **Debug info**: Current scene counter

## Quick Start

### Method 1: Visual Editor (Recommended)

1. Open `index.html` in your browser
2. Click the **Editor** button in the controls
3. Add characters with the color picker
4. Build scenes using the visual interface
5. Click **✔ Save** to apply changes
6. Use **Download sequence.js** to export your work (advanced users)

### Method 2: Code Editor

Edit [`js/sequence.js`](./js/sequence.js) directly:

```javascript
function setupScene() {
    dialogFramework
        .setConfig({
            showControls: false,
            showDebug: false
        })
        .setCharacters({
            'Ashley': { color: '#e2829a' },
            'Andrew': { color: '#a6de7f' }
        })
        .addScene({
            image: 'intro.png',
            speaker: 'Ashley',
            text: 'Welcome to the story!'
        })
        .start();
}
```

## Visual Editor Guide

### Character Management
1. Enter character name and pick a color
2. Click **Add Character** 
3. Edit colors anytime with the color picker
4. Delete characters with the **Delete** button

### Scene Creation
1. Click **Add New Scene**
2. Configure:
   - **Speaker**: Select from character list
   - **Text**: Enter dialog (supports formatting)
   - **Assets**: Upload files or enter URLs
   - **Timing**: Fine-tune all transitions
   - **Effects**: Add shake or glitch effects

### Asset Input Options
Each asset field (images/sounds) offers two input methods:
- **File Upload**: Click to browse local files
- **URL Input**: Enter direct URLs (http:// or https://)

Priority: Uploaded file > URL > null

### Scene Controls
- **↑/↓**: Reorder scenes
- **Duplicate**: Copy scene with all settings
- **Delete**: Remove scene
- **Expand/Collapse**: Toggle scene details

## Scene Configuration

### Complete Scene Options

```javascript
dialogFramework.addScene({
    // Visual Assets
    image: 'background.png',        // Background image (img/ folder or URL)
    bustLeft: 'character1.png',     // Left character sprite
    bustRight: 'character2.png',    // Right character sprite
    bustFade: 200,                  // Bust fade duration (ms)

    // Dialog
    speaker: 'Ashley',              // Character name
    text: 'Dialog text here',       // Supports <b>, <i>, <u> tags
    censorSpeaker: true,           // Apply glitch to speaker name

    // Timing - Dialog
    dialogFadeInTime: 200,         // Dialog fade in (ms)
    dialogFadeOutTime: 200,        // Dialog fade out (ms)
    dialogDelayIn: 500,            // Delay before fade in
    dialogDelayOut: 0,             // Delay before fade out

    // Timing - Images
    imageFadeInTime: 200,          // Image fade in (ms)
    imageFadeOutTime: 200,         // Image fade out (ms)
    imageDelayIn: 0,               // Delay before fade in
    imageDelayOut: 0,              // Delay before fade out

    // Audio
    sound: 'effect.mp3',           // Sound file (sounds/ folder or URL)
    soundVolume: 1.0,              // Volume (0-1)
    soundDelay: 0,                 // Delay before playing (ms)

    // Effects
    shake: false,                  // Enable shake effect
    shakeDelay: 0,                 // Delay before shake (ms)
    shakeIntensity: 1,             // Shake strength multiplier
    shakeDuration: 500             // Shake duration (ms)
});
```

### Special Effects

#### Crossfade Between Images
```javascript
// Scene 1 - Prepare for crossfade
.addScene({
    image: 'day.png',
    imageFadeOutTime: -1000  // Negative value signals crossfade
})
// Scene 2 - Execute crossfade
.addScene({
    image: 'night.png',
    imageFadeInTime: -1000   // Matches previous scene's value
})
```

#### Dramatic Shake Effect
```javascript
.addScene({
    text: 'EARTHQUAKE!',
    shake: true,
    shakeIntensity: 2.5,     // 2.5x normal intensity
    shakeDuration: 1000      // 1 second shake
})
```

#### Glitched Introduction
```javascript
.addScene({
    speaker: 'Lord Unknown',
    text: 'TaR SouL?',
    censorSpeaker: true,     // Glitch the speaker name
    dialogFadeInTime: 2000   // Slow, creepy fade
})
```

### Text Formatting (WIP)

```javascript
.addScene({
    text: 'This is <b>bold</b>, <i>italic</i>, and <u>underlined</u> text.'
})
```

### Null Values
Use `null` to explicitly disable features:

```javascript
.addScene({
    image: null,      // No background change
    speaker: '',      // No speaker (narrator mode)
    sound: null,      // No sound
    bustLeft: null,   // Remove left bust
    bustRight: null   // Remove right bust
})
```

## File Structure

```
project/
├── index.html           # Main application
├── viewer.css          # Game viewer styles
├── editor.css          # Editor interface styles
├── js/
│   ├── dialog.js       # Core framework
│   ├── editor.js       # Visual editor logic
│   ├── interface.js    # UI management
│   └── sequence.js     # Your scene definitions
├── img/                # Image assets
├── sounds/             # Audio files
└── fonts/      # Fonts assets
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Click | Next scene / Skip typing |
| `Space` | Next scene / Skip typing |
| `RightArrow` | Next scene / Skip typing |
| `LeftArrow` | Previous scene |
| `Tab` | Show/Hide controls |

## Advanced Features

### Glitch Configuration

```javascript
dialogFramework.setGlitchConfig({
    scrambledColor: '#ff0000',     // Red for scrambled text
    realColor: '#00ff00',          // Green for real text
    changeSpeed: 30,               // Faster changes
    realProbability: 10,           // 10% chance of real char
    autoStart: true,
    charsAllowed: '01'             // Binary-style glitch
});
```

### Scene Navigation

```javascript
// Jump to specific scene
dialogFramework.jumpToScene(5);

// Get current position
let currentScene = dialogFramework.getCurrentScene();

// Programmatic control
dialogFramework.previous();  // Go back one scene
```

### Dynamic Scene Building

```javascript
// Build scenes from data
const storyData = [
    { speaker: 'Ashley', text: 'Hello!' },
    { speaker: 'Andrew', text: 'Hi there!' }
];

storyData.forEach(scene => dialogFramework.addScene(scene));
```

## Tips & Best Practices

1. **Performance**: Use reasonable fade times (100-2000ms)
2. **Accessibility**: Keep text on screen long enough to read
3. **Audio**: Keep volumes balanced (0.7-0.8 for background)
4. **Images**: Optimize file sizes for web delivery
5. **Testing**: Use debug mode during development
6. **Saving**: Use the Download button to backup your work
7. **Dialog box**: You can edit `viewer.css` and change `.dialog-container { background-image: url('') }` to change the dialog box background png

## Browser Requirements

- Modern browser with ES6 support
- HTML5 Audio capability
- CSS3 transitions
- Local file access (for editor uploads)

## Troubleshooting

**Can't see controls**: Press `Tab` to toggle visibility
**Audio not playing**: Check browser autoplay policies
**Glitch not working**: Verify glitch config and `censorSpeaker: true`

## Credits

Dialog system and assets inspired by _The Coffin of Andy and Leyley_ by Nemlei.  
Faustina font by Google.  
Created by Kidev as a fan tool for the community.
