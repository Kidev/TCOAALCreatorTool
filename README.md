# kidev's TCOAAL Creator Tool

A powerful, feature-rich dialog system for creating visual novel-style dialogs inspired by [_The Coffin of Andy and Leyley_](https://store.steampowered.com/app/2378900/The_Coffin_of_Andy_and_Leyley/) (by _Nemlei_). Features an asset explorer, integrated visual editor, advanced effects, and smooth transitions. Written in pure JavaScript.

## Demo

The beginning of the game recreated as animation [here](https://tcoaal.kidev.org/index.html?mode=viewer&use=N4BgXMAsYC4E4FcCmAaArLRSC+KCMEARAIIB2AJnEgO6EQAcYhAxAGysCcH7hKHYAbRIUAnrxIBjCQEtySUjHEARaQGcAhgAdNAe2kKAtvMUphcuKsIBdUwgSy6hCQAt1cdRJhI4AWgBGrJAA7EgSfpA+kEhoaJHq5PQ+3CAAZj6ceADMKXgATJn0uaz04i5uHl5wAMIANuqqqgBy6kaOqppI6gDW3j41+kg+Ze6evQHBoeGR0bGQ8YnJaRnZeQVFJbgkqs41SGIMTMxc7Fy8-EIAMnu7YqYAogZ+bu4NRgriALJqMN1I1rb2ciOYYVXpoFJIPCsEDkDiRPxBViRYoSHzqPCQPw+bJoCTkVjkPx4kASUquEaVWr1JotP5MdqdHq+fqkQYg0a+cGQ6Gw+GI5H0VHozHYlK4-GE4mkzZKHQIADmdUsBxYaG49A4eDOgkISninzgADoAAQAcXcADckJZTAAxdQwZzef6EOwOJjsypJPCFDiZEDqHy41hpSCZIK5fzZOFoEB+cj+4LQ1ha0ye7xUhrNVr0jq-ZkDIbk0G+TW+-2B4Oh8ORvzRoNxhMgJMgFOETYAJXkSDpwEYLHUrHU9FYfz4Oo+OgMBtUJvN6itNsIk8dzpsrsBwOLHJ8eDQrFyHA8kYkQXUmUiID9SXxWLQZ-IaEf5CCeBSrDJ5Q5mZpOcIDPzPpC3TXw9wPI8JBPM8L0gK8Lw4W8gwfJ8n1fd921MAApBB+nUOg+0OQdh1HbUhBdN0gQ9bcvTQehIHvCR6HIHxyAkZtIn3VEOHvQM-D8MVuHUJBmxANBPwpDMlV-Ol-zzJkgNZIsvxouiGKYli2IiejWC4nj-H4tUh2E2CxM2C4dDgchjQAVVILpSB0ahSHw-sjhibTSMIABlKckEdfR5WNAAVbw4GkFIRAC8QfKMfzSECgBpfQgTtBAJC6ALjS8hydE0cjNyo5TekyGJIMgcgInUVtEkxYc0QPWJR3oTIpFYTJ6KCDhxJLH9sxkgD5JZNlqOK0rcnKyrqvhOrB1yRqkGa1r2vvLrNgAfmNDa1pcw5uLQDzxyEIKnWNYxpBgMR1worcit8NiMT8EAQESXFxsiDgex8Ji338JA5kHCRgg4XJUycEbqikvq2jk3ohqUiS7pAB6npesr3s+760j8P71ABoGQYwwh5woAw8JVZg6I4II608-L3TB26vpSegkCCVIQDRCQOGrdr-DFBYz34kBsmbfFuu-SHaWhxlYeA8GmZZtmUg5jxuciTJeYMgX1CFkXyo-TZifITQyYI1U-DQC2-Fpq6CoZhGhiCKJIAQwMOAtmrlaxEd6EDXIUnjdRch7PEz3FylJb-AbZcUkDHed12kg9yIva+4o-YD8gg5Dl88M2AB5VcLGNEQkBqGpHJ2gchxHMdzhIY1Sec0wqhwmBvnEVuanb1QYCXC54luQgkvISxbfpuO31YAJyGF7EgktyJg45qmkAvX3MjwCRhJBlm8LTcHeql3MZYLWP5anme5-DRfIGXpIQnX88t53n1OkJwunWLvwamQKvmEMhqVM9cADqbg5DN0IEFAAatFBAcB5RIB0M5celF7YliGOoFIcwkApBjCkFIgZMRyDRPkRIQQF4BzQOGZ6IAgjh0ktSKGJ9AJwzjhILBOC8FBgIUQ+Mgwg4FB8BQ8EFsaH0Doe2XAuQIDqEOE9BRIBeB+F2kgbmR5eASDALGFA5BtEoCQJgZAKAUhMGIAAISqEoO4tpTQAAkACSmEEoXA+I0fOAAFAAih2LyQVrLQJAQADQAJoAC0dZ4lwfKZw0gABWXQagGAcpoAAjhYGACALTUAAB4iAAF5I3yNpIIGoMKZEEMAVgTB5TqHLt4EQYBzEeC6PKOAcoKDGlUMg+UqgAD0cTOgVwQKoAA+uQHQ5dDQ6HlPKXgQQwB4BQPKGpdTdhwEaR46Qnh4HWj6ZobZmSqBjMRBwQ0mh4q8GcGY0QvBpBMCuCIG4KBjQOONBM0gAByGAPgfCGn+caag6gFDGhgDoQ0vA4lMF4F0MAuQnooBqHChFBhkUgBQKQMAPh4Xop0NohFmgwDotSUSlAcBSWqDAKQHCNQUAwEWSgBApL-wdPIOYiufhrJwBqHQal5dTBPHSm01lHwRnbPZToTl3LHA-0lVSmlfT2rZzZsxLmpTLwYiSMzZim9hSQDomooIKULRgEITUVQqAcnyv5Y0vltL8nMukKTRBEqpU8qYLKlRdq+nNT8MDUpeBsSJmRCSNEIAijejQHgD6j4xTkFyOIPwIyYBXBSDAV1XL3V2oFcmjs0gYnpo5Zm3lNKUDEFNXUi1KBzGkqqAypQ+KQC4Cqas+pGymktOFQgTp3T4r9MGXUuUYyJlTJmXMlACylkrMILUttjSviqAkH04F5AnnXD2Ocy5KBrmEEeTcO5TAQFl1pa8954LIXQpQLCnFiLSWouxQizFuLG0oEJcS0l5L0WUuzfSpZTL0Usu7Wyot0rrW0sIIK1p7SgOitUOKkD7qIMcrA4quYwcVVDCpjVJGERubqV1RifVUQqbGoreay1YGUC2tLQ6gDTr1AuoQzK5D3qijcQ+lgnwAdWCzHfBebGsY0TYISBIS29B6AhETcm1NhbJXFsoxB3N+bnCybdSW-l5azVVpreiutSyG2xibSgFtM61kNI7UK6DPaen9qGUO8ZkyajTNmfMhl07Z3rPnWoJdK611+c3eOnde69gHsINhXuxp5Q6GNDoK0cBjQruNMaUZoyuhJdGUgUZSWwXpZS1l5LozHRJZEHKCFKAoWEBhaSpF6LUXoqfSgPF6K30oBJeiz9KBv2lt-Yy5l3SgMZtA9miDnarPkFg-BuToGkNyu9Uq9DMJMPqtgpqvDOq8B6oNSR3gJqtMUezdR-ltHTD0cY1NxDnqUNsbVJ0NI3HeNtV+oJzhImxMSbHIp3uMnBtZtLZ9mAeaC0-fU7SzTlbUA6ZQHplABmnrNuqaZudFmoOsq6TZgZdmRkOdHS5idbnW2ebAAunzogbg3AC1cm5q7QtvMdHKAtXSnSfNUCXOU8WUhhXkOQba5XL2wvRTVlAdWMWkqa6+0lbWyUUsoz1-9ph+sUGBwpyDXaKATYkErmbXqFXzdZottV2HVvauxBtwjW2jU7bI1Wq1B3KPHcIKdpAmvLusc4Ddzj92U6PYEyrYTgo3uSZzV93Bqn5PDaTb3QHKmlfZrB+R6ttb62NvhwT8zzTLOo97b0jHg6scjqc2O1zU7U-tuJ8u0n66RAU+3Q8yvoXJwGC6eoWQrOECfKsk6GomhG5IEBedZwCXSAiDivKAAhBeyrV7qtoqF6SzFN6xctclx1rr-LZd9dZTHv7Kuxvq+dyxnXaG9eqqwxq3DxuCOQCI4a0je2UA29LYd+1jrnVO6Yx6g-5c+nXY43dgID3+Nohfdyp-c-BxNA9-tvt39w8lMgdoDS049tNE99Nk9jMEcPM09RtM90cB1hlh1HNnNx1J1llKMd0yBqcUB7lCAj1Ply5Is-JjR9BQVoMf4kB-kysKsqsb0kUb1UUb158EU8VDNxd312tpcf0GU5dANFd4D+URsM8YMxUNd38tcUNdcMMDcz8tV8NTcr9zdb9wd79KMn8UB7dHct85CI8U0Q8LDwMrCo9Q8hsECrcIdkCYdUCW1s1iD3MzN20tkdljl9lDldkxkUw8Bq8d1QsJ8uCEUeCUUZ9MV0hBCX0l8P1pdEdCcfIgNToCFQg+4+kLVRk8BwjC86VJCN8BsVCXcddHpRw0B1AggfAFoOAtJYQOY-VCEeFRMzwjxRI-VE0sDFC4NlDzsQcUBdtDCH8bU7cX8GM39RiP9ZsFVchOoPBMg+JIg8hA1MQkAkRBQ2Y0R4xchcgGiIRnwpNg801bCg8AdlNHDfsNMXCE9dMk9DMU8vD8cMjzN-Cjk9kDkAjrRRl9VMgIjL0qDoip9uCZ971oR6sZ8hCCUJc0iv0ZdyiAMFdgMFjw9Bi1clDriJj48pjaUTCzDX998liv9ij-Y2I8RdwghwxkQ-BIwWi0BBgNYs48RuZWY8APsrCoCsTt9YDo9ZDQcnjIdodYcjMTMMD2108Udsis9+lKBOgDAApRl9BBlPBpBkFCCi8SCvjS9vM+l+gLQAp2kpxQTJ8qDTQdBbSdAfA7SrIDALJSAAoXliBtgbhR9x9edJ9r1Yi70EjRcUikSxCUSJC-0KiZCBTLCcTxs8SqjP8ag+kkBZ46wIRBgmIYgl4VivokY-ZMgdZcg5AigYRSRxiniiSqMZi6MyTEyKTky4wSQVgsQhI8AsQXZNQvpSyg0g59whxw1CgLjrCriRSbiHDrjy14BjEa0F4XiUC3i0CS9Gk5TVcrJFS+llSWg1SNS8jtTSBdS8di8DSvNF1jTpBTT4pzSDBLSPSdgQtKCmBrIYl2DXz2CIT+db1as59gzmtQypdwzus0T5dN8xz5D5TcThjyTtcv9Uy4xsgMZHxZhjjGiJENtsVCymSSyeRyyCTrdjDlywAPELJ4Bm98j6h7yRBRl6Bq9SS5joKUMmyJAWy0RIQOyuBA1ChoRey5p2Aqpcghybj+S1NlchT7jmMGy+kUgBKSQNtIxAhWZ4RAgkh2BBgIR-QJAdIkZAgPwy0xS3DJSU8Tzkc1y0c+1NyqBtz4p1TSBNT24dTSjvDCKy8TSzTbSbyLlAswSzEWcDA0oB96hW9jQK4rRjQMyWRApuk4ANkwqLJW8LAy4UhTBfTzpGCWd24jBYr4t1BgrzoYBdhGCFBvBf45B3yp8BdAy4Tn0-zRCALOtUTIz0TQKYy7C4y996yYLky4L0zELsy75cy0KCyizsKyzLc78qySTZizsRLVDvUmKWK2z2KuyuKOYNY+y+LByE0hKbCwL7C7jJz9L5z3DFzpTfCVy4yzLs8tzVTrLdytSHLccnLjKXKLy3KLTPLKcrSmAHEYA0rQVzpdg9FjQAAdQgW0ZKY0RoBAeAaQYwFnIKaLRoHQX6lQNg0Gj86fb8qqxrUlVIsM+qiM3rJqyolqgVNqhMhY2ahVbqhCzMpCnM1C-MjC4apAUs1iMayYgi7NOi6a+TKmr-eanIVsti96Zansta3igcgSrayAna0m-7CcscxA1wo6wypc4y1csbS6pUyym6+UGyuy-cw8p6mU08pdVyq89yy00LLsQeF5C1GAF5KLH0zg8q29Xgn86qkQ1rZEgmoCxqkCkmkS7EhQyCybGa6o2CtM2mr6em-qxm9C-IFmtm3CysrmmjKa+YiOpMvpQW9s1i-Ozszi8WwsyW-iwS2W0c+WvauA0m5W54qHV4uHGwO4SpW0D0KcTQIoxEPINmK-CMKNUZC0BCfJOAbgHJC0XgU0JgXzMnB8uxRZQ8VgFABxMACMdFTCSpBKD1OM3gC4Qin4kIoIgEk5TgavD4UlRoUlBevIbgFete+FFAfOIxVADxIlZtbe8Ctcveg+4IwI-434sZPAK8c+y+6+xeu+1e9ep+l+lAN+vAbAKwZtdupwTu7ulMFYrIdqNmTIailwVJHJEALoO+KepgC24VKcXgG+pe++6BzegQYAT+nfVlH+jWuM-pZhoDMZIoEEj6lAC+9FK+9FahyBh+9FZ+6c1+9+4zT+9oMKLwVh02sAU0WkLpTQeRvZOR86a0bYHsGAIo3IHJegUZECMZGivhi+g8SAFAK+goaxhe-Ve+u+iRrAOBhlLxQQEAGwDsJ4ryOFHRWSDR6BNwaQYFRQIgCQSZZUPIUwdpagZUegbAD+3MDRxRs65R1RrRrwfpLJnRp0PyAxoxkx8Gbh0BxEegGxxZYGFABxip1exxlx4xN+3IFADxgQVgbx3x-x9E9R7R4JsKMJ-CVB81OgGJwgOJhJpJmRlJ7RtJpHFRzK3JnJ3p7J3RgpvIIp0x0ZXIUB+8Zeq+gSip2p++hp2Bt+zIVpwQH0Tpu-PxuaHpoJkJwZiJqJ0Zlp8ZxySZ5JwJ2ZlAfe4yhZ3vJZgolZvJvRwp4xrZnZix7RRESpjWZe45+pipxpqR6xtp6NG5wwu5gJ3J-p0J94F5kZxe2Jz5ugRJ753JuZwnQFtRjR5Z+ltZ-RjZyFkp7Z0B-VQRuFcTGpsARx5FmByRtxtAS59prF+PHFh5vpp5wl4AYZ6J95iZ8lpJpBpBoAA)

## Features

### Integrated Visual Editor

- **Built-in editor** accessible via the controls menu ('Editor' button)
- **Visual scene builder** with preview
- **Save button** positioned at top right for quick updates
- **Character manager** with color picker
- **Scene organizer** with drag-and-drop reordering
- No manual coding required, everything through the UI (but code possible)

### Composition Editor (New!)

- **Layer-based composition system** for creating custom images and animations
- **Keyframe animation support**:
    - Add multiple keyframes to any layer with independent time and position
    - Animate asset positions over time
    - Convert layers into keyframes of other layers
    - Export as animated GIF with full keyframe support
- **Sprite animation**: Import and animate sprite sheets
- **Mix animations**: Combine sprite animations with keyframe animations
- **Gallery integration**: Use imported game assets in compositions
- **PNG/GIF export**: Export compositions as static PNG or animated GIF

### Asset Management

- **Dual input system**: Upload local files OR use URLs for all assets
- **Background images** with preview thumbnails
- **Character busts** (left and right positions)
- **Sound effects** with inline playback controls
- **Automatic asset handling** that prioritizes uploaded files over URLs
- **Game asset import**: Import and decrypt assets from game installation folder
- **Asset gallery**: Browse, preview, crop, and manage imported assets

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
- **Rich text formatting** with inline tags:
    - Basic formatting: `<b>bold</b>`, `<i>italic</i>`, `<u>underline</u>`
    - Large text: `<l>text</l>` (default 1.3em) or `<l size="2">text</l>` (custom size)
    - Inline glitch effects: `<glitch>text</glitch>` with optional attributes:
        - `color="red"` - Set real text color
        - `scrambled="blue"` - Set scrambled text color
        - `speed="50"` - Set animation speed (ms)
        - Example: `<glitch color="red" scrambled="blue" speed="30">glitchy text</glitch>`
- **Interactive choices** with animated selection:
    - Multiple choice options per scene
    - Customizable selection speed
    - Automatic animation with sound effects
    - Independent from dialog box positioning

### Transition System

- **Independent timing controls** for dialog and images
- **Fade effects**: In/out with millisecond precision
- **Delay controls**: Precise timing choreography
- **Crossfade support**: Smooth image transitions using negative values
- **Instant transitions**: Zero-delay scene changes
- **Bust transitions**: Character sprites with fade effects

### Audio System

- **Sound effects and background music** with separate controls
- **HTML5 Audio** with automatic loading/caching
- **Volume control** (0-1 scale) for each audio type
- **Pitch adjustment** (0.5-2.0 range) for creative effects
- **Playback speed** (0.5-2.0 range) for time manipulation
- **Delayed playback** timing for precise audio choreography
- **Support** for local files and URLs
- **Preview sounds** directly in editor

### Navigation & Controls

- **Keyboard and mouse controls**
- **Control buttons** (with tooltips):
    - ⬅ Previous: previous scene
    - ➡ Next: next scene
    - ⟲ Restart: restart the sequence
    - ▶ Play: auto-play sequence (right-click for settings)
    - 🗂 Presets: load pre-made demo sequences
    - 📷 Screenshot: capture current frame
    - 🎥 Record: record video (right-click for settings)
    - Editor: open the visual editor
- **Scene jumping**: Navigate to any scene directly (code only)
- **Debug info**: Current scene counter

### URL Sharing System

- **Share Link button**: Generate shareable URLs with your entire project encoded
- **Compression**: Advanced key compression + LZ-string compression for smaller URLs
- **Automatic loading**: URLs with `?use=` parameter auto-load projects
- **Import from URL**: Paste shared URLs in the editor to import projects
- **Perfect for**: Sharing creations, backing up work, version control

### Screenshot & Video Export

- **📷 Screenshot button**: Capture current frame as PNG
- **🎥 Record button**: Record sequence as video (WebM format)
- **Video controls**:
    - Start/stop recording with record button
    - Right-click record button for export settings
    - Adjustable FPS (15-60fps)
    - Quality settings (low/medium/high)
- **Audio support**: Only accessible in Tab mode when recording
- **Use cases**: Creating trailers, tutorials, demonstrations

### Auto-Play Feature

- **▶ Play button**: Automatically advances through scenes
- **Configurable settings** (right-click play button):
    - Delay between scenes (100-5000ms)
    - Typing speed (10-100ms per character)
- **Smart timing**: Automatically waits for:
    - Text typing completion
    - Image fade transitions
    - Sound effects
    - Shake animations
    - Choice selection animations
- **Pause/Resume**: Click play button to toggle

## Quick Start

### Running the Application

**For basic use**: Simply open `index.html` in your browser.

**For GIF export** (composition editor animations): You need to run a local web server due to browser security restrictions:

```bash
# Option 1: Python (if installed)
python -m http.server 8000
# Then open: http://localhost:8000

# Option 2: Node.js (if installed)
npx serve
# Follow the URL shown in terminal

# Option 3: PHP (if installed)
php -S localhost:8000
# Then open: http://localhost:8000
```

### Method 1: Visual Editor (Recommended)

1. Open `index.html` in your browser (or via local server)
2. Click the **Editor** button in the controls
3. Add characters with the color picker
4. Build scenes using the visual interface
5. Click **✔ Save** to apply changes
6. Use **Share URL** to share/save your work using the URL system
7. Use **Export** to export your work (_advanced users: uncomment the 'Export' button with your browser Developer tools_)

### Method 2: Code Editor

Edit [`js/sequence.js`](./js/sequence.js) directly:

```javascript
function setupScene() {
    dialogFramework
        .setConfig({
            showControls: false,
            showDebug: false,
        })
        .setCharacters({
            "Ashley": { color: "#e2829a" },
            "Andrew": { color: "#a6de7f" },
        })
        .addScene({
            image: "intro.png",
            speaker: "Ashley",
            text: "Welcome to the story!",
        })
        .start();
}
```

## Composition Editor Guide

### Creating Compositions

1. Open the gallery mode (`?mode=gallery`)
2. Import game assets or use your own
3. Click on an asset to add it to the composition editor
4. Position layers by dragging on the canvas or using X/Y inputs
5. Export as PNG or (if animated) as GIF

### Using Keyframe Animations

1. Add a layer with an asset (e.g., a character sprite)
2. Click the **+ KF** button to add a keyframe
3. Select different keyframe tabs (KF 1, KF 2, etc.) to edit
4. Adjust the **Time** value (in milliseconds) for each keyframe
5. Move the layer to different positions for each keyframe
6. Export as GIF to see the animation

### Converting Layers to Keyframes

1. Add multiple layers with different assets
2. On a layer without keyframes, use the "Move as keyframe of..." dropdown
3. Select the target layer to merge into
4. The source layer becomes a keyframe of the target layer

### Animation Export

- **PNG Export**: Exports the current frame as a static image
- **GIF Export**: Exports the full animation (requires local web server)
    - Automatically calculates duration from keyframes
    - Combines sprite animations with keyframe animations
    - Default ~30fps for smooth playback

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
    - **Choices**: Enable choices with custom options and autoselect

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
    image: "background.png", // Background image (img/ folder or URL)
    bustLeft: "character1.png", // Left character sprite
    bustRight: "character2.png", // Right character sprite
    bustFade: 200, // Bust fade duration (ms)

    // Dialog
    speaker: "Ashley", // Character name
    line1: "First line of dialog", // Supports rich formatting tags
    line2: "Second line of dialog", // Both lines support formatting
    censorSpeaker: true, // Apply glitch to speaker name
    demonSpeaker: false, // Transform text to entity speech

    // Timing: Dialog
    dialogFadeInTime: 200, // Dialog fade in (ms)
    dialogFadeOutTime: 200, // Dialog fade out (ms)
    dialogDelayIn: 500, // Delay before fade in
    dialogDelayOut: 0, // Delay before fade out

    // Timing: Images
    imageFadeInTime: 200, // Image fade in (ms)
    imageFadeOutTime: 200, // Image fade out (ms)
    imageDelayIn: 0, // Delay before fade in
    imageDelayOut: 0, // Delay before fade out

    // Audio: Sound Effects
    sound: "effect.mp3", // Sound file (sounds/ folder or URL)
    soundVolume: 1.0, // Volume (0-1)
    soundDelay: 0, // Delay before playing (ms)
    soundPitch: 1.0, // Pitch adjustment (0.5-2.0, 1.0 = normal)
    soundSpeed: 1.0, // Playback speed (0.5-2.0, 1.0 = normal)

    // Audio: Background Music
    backgroundMusic: "music.mp3", // Background music file
    backgroundMusicVolume: 0.5, // Music volume (0-1)
    backgroundMusicPitch: 1.0, // Pitch adjustment (0.5-2.0)
    backgroundMusicSpeed: 1.0, // Playback speed (0.5-2.0)

    // Effects
    shake: false, // Enable shake effect
    shakeDelay: 0, // Delay before shake (ms)
    shakeIntensity: 1, // Shake strength multiplier
    shakeDuration: 500, // Shake duration (ms)

    // Choices
    choices: true, // Enable choices for this scene
    choicesList: ["Option 1", "Option 2", "Option 3"], // Choice texts
    correctChoice: 1, // Index of the "correct" choice (0-based)
    choiceSpeed: 500, // Animation speed between choices (ms)
});
```

### Special Effects

#### Crossfade Between Images

```javascript
// Scene 1: Prepare for crossfade
.addScene({
    image: 'day.png',
    imageFadeOutTime: -1000  // Negative value signals crossfade
})
// Scene 2: Execute crossfade
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

#### Interactive Choices

```javascript
.addScene({
    speaker: 'Ashley',
    text: 'What should we do?',
    choices: true,
    choicesList: [
        'Investigate the noise',
        'Stay hidden',
        'Run away'
    ],
    correctChoice: 1,        // "Stay hidden" is highlighted
    choiceSpeed: 500         // 500ms between each choice animation
})
```

### Text Formatting

Rich text formatting is fully supported with inline tags:

#### Basic Formatting

```javascript
.addScene({
    speaker: 'Ashley',
    line1: 'This is <b>bold</b>, <i>italic</i>, and <u>underlined</u> text.'
})
```

#### Large Text with Custom Sizes

```javascript
.addScene({
    speaker: 'Ashley',
    line1: 'This is <l>large text</l> with default size.',
    line2: 'This is <l size="2">REALLY BIG</l> text!'
})
```

#### Inline Glitch Effects

```javascript
.addScene({
    speaker: '???',
    line1: 'My name is <glitch>REDACTED</glitch>.',
    line2: '<glitch color="#ff0000" scrambled="#00ff00" speed="30">01010111 01001000 01001111</glitch>'
})
```

**Glitch tag attributes:**
- `color` - Color of the real text (default: uses glitchConfig.realColor)
- `scrambled` - Color of the scrambled characters (default: uses glitchConfig.scrambledColor)
- `speed` - Animation speed in milliseconds (default: uses glitchConfig.changeSpeed)

#### Combining Formatting

```javascript
.addScene({
    speaker: 'Ashley',
    line1: 'You can <b>combine</b> <i>multiple</i> <u>tags</u>!',
    line2: 'Even <l><b>large bold</b></l> and <glitch color="red">glitchy stuff</glitch>!'
})
```

#### Demon/Entity Speaker

The `demonSpeaker` option transforms text into entity speech by replacing words with special characters:

```javascript
.addScene({
    speaker: '???',
    line1: 'your soul',
    line2: 'belongs to me',
    demonSpeaker: true  // Transforms text to entity-style symbols
})
```

This creates an otherworldly effect by replacing recognizable words with cryptic symbols while preserving formatting tags.

#### Notification Mode

Use the special speaker name `"Notification"` to display centered text without character styling:

```javascript
.addScene({
    speaker: 'Notification',
    line1: 'Chapter 1',
    line2: 'The Beginning'
})
```

This is perfect for events like when receiving an object.

### Null Values

Use `null` to explicitly disable features:

```javascript
.addScene({
    image: null,      // No background change
    speaker: '',      // No speaker (narrator mode)
    sound: null,      // No sound
    bustLeft: null,   // Remove left bust
    bustRight: null,  // Remove right bust
    choices: null     // No choices (default)
})
```

### Choices System

The choices system allows you to create interactive decision points:

- **Visual presentation**: Choices appear centered at the bottom of the screen (38% width, 5.6% height each)
- **Animation sequence**:
    1. Choices appear after dialog text finishes typing (or immediately if no dialog)
    2. Each choice from index 0 to `correctChoice` gets highlighted in sequence
    3. Plays `gallery:Sound effects/se_53.ogg` (pitch 0.7) sound effect for each choice
    4. Waits `choiceSpeed` milliseconds between each
    5. Final choice remains highlighted, plays `gallery:Sound effects/se_53.ogg` (pitch 0.9)
- **Styling**: Non-selected choices use lighter background, selected choice uses primary button style
- **Independence**: Choices can appear without any dialog text

**Editor tips**:

- Check the "Choices" checkbox to enable
- Type choice text in the input fields
- Press "+" to add more choices (up to 10)
- Select the radio button to mark the "correct" choice
- Empty choices are automatically filtered out

## File Structure

```
project/
├── index.html               # Main application
├── colors.css               # General color styles
├── viewer.css               # Game viewer styles
├── editor.css               # Editor interface styles
├── js/
│   ├── compositionEditor.js # Handle composition of stock assets
│   ├── dialog.js            # Dialog viewer framework
│   ├── editor.js            # Visual dialog editor logic
│   ├── filenameMapper.js    # Map encrypted files to readble names
│   ├── galleryManager.js    # Handles gallery display logic
│   ├── gameImporter.js      # Import game files
│   ├── interface.js         # UI management
│   ├── memoryManager.js     # Stores data in browser memory
│   └── sequence.js          # Your scene definitions
├── img/                     # Image assets
├── sounds/                  # Audio files
└── fonts/                   # Fonts assets
```

## Keyboard Shortcuts

| Key          | Action                   |
| ------------ | ------------------------ |
| Click        | Next scene / Skip typing |
| `Space`      | Next scene / Skip typing |
| `RightArrow` | Next scene / Skip typing |
| `LeftArrow`  | Previous scene           |
| `Tab`        | Show/Hide controls       |

## Advanced Features

### Glitch Configuration

```javascript
dialogFramework.setGlitchConfig({
    scrambledColor: "#ff0000", // Red for scrambled text
    realColor: "#00ff00", // Green for real text
    changeSpeed: 30, // Faster changes
    realProbability: 10, // 10% chance of real char
    autoStart: true,
    charsAllowed: "01", // Binary-style glitch
});
```

### Scene Navigation

```javascript
// Jump to specific scene
dialogFramework.jumpToScene(5);

// Get current position
let currentScene = dialogFramework.getCurrentScene();

// Programmatic control
dialogFramework.previous(); // Go back one scene
```

### Dynamic Scene Building

```javascript
// Build scenes from data
const storyData = [
    { speaker: "Ashley", line1: "Hello!" },
    { speaker: "Andrew", line1: "Hi there!" },
];

storyData.forEach((scene) => dialogFramework.addScene(scene));
```

### URL Sharing

```javascript
// In the editor: Click "Share Link" button to generate URL
// The URL contains your entire project compressed

// To load from URL programmatically:
// Add ?use=<encoded_data> to the URL
// The app automatically decodes and loads the project

// Import from URL in editor:
// Paste the shared URL in the import dialog
```

### Recording Video

**Recording workflow:**
1. Press `Tab` to show controls (required for audio)
2. Right-click 🎥 Record button to configure settings:
   - FPS: 30fps recommended for smooth playback
   - Quality: Medium balances size and quality
3. Click 🎥 Record to start
4. Play your sequence (manual or auto-play)
5. Click 🎥 Record again to stop and download

**Tips:**
- Higher FPS = smoother video but larger file size
- Use auto-play for consistent timing
- Tab mode must be visible for audio in recording
- WebM format is widely supported

### Auto-Play Configuration

```javascript
// Programmatic control (code only)
dialogFramework.startAutoPlay();
dialogFramework.stopAutoPlay();
dialogFramework.toggleAutoPlay();

// Configure via UI:
// Right-click ▶ Play button for settings dialog
```

## Tips & Best Practices

1. **Performance**: Use reasonable fade times (100-2000ms)
2. **Accessibility**: Keep text on screen long enough to read
3. **Audio**: Keep volumes balanced (0.7-0.8 for background)
4. **Images**: Optimize file sizes for web delivery
5. **Testing**: Use debug mode during development
6. **Saving**:
   - Use "Share Link" for quick saves (stores in URL)
   - Use "Export" for permanent local backups
7. **Recording**:
   - Always show controls (Tab) when recording for audio
   - Use auto-play for consistent video timing
   - 30fps is ideal for most use cases
8. **URL Sharing**:
   - Shorter projects = shorter URLs
   - URLs work as permalinks - bookmark them
   - Can be shortened further with URL shortening services
9. **Auto-play**: Test with manual navigation first, then fine-tune auto-play timing
10. **Dialog box**: You can edit `viewer.css` and change `.dialog-container { background-image: url('') }` to change the dialog box background png

## Browser Requirements

- Modern browser with ES6 support
- HTML5 Audio capability
- CSS3 transitions
- Local file access (for editor uploads)

## Troubleshooting

**Can't see controls**: Press `Tab` to toggle visibility

**Audio not playing**: Check browser autoplay policies. When recording video, only the 'Tab' mode can access audio.

**Glitch effects not working**: Verify glitch config is set and `censorSpeaker: true` is enabled for speaker name glitching

**Share Link URL too long**:
- Reduce number of scenes or text length
- Use shorter asset paths (relative paths are shorter than full URLs)
- Consider using a URL shortener service for very long URLs
- URLs over ~2000 characters may have compatibility issues with some systems

**Video recording issues**:
- No audio: Make sure controls are visible (press `Tab`) before recording
- Choppy video: Try reducing FPS or closing other applications
- Large file size: Lower quality settings or reduce FPS

**GIF export fails**:

- Error: "Failed to construct 'Worker'" means you're running from `file://` protocol
- Solution: Use a local web server (see "Running the Application" section above)
- The app works fine for everything else without a server, but GIF encoding requires Web Workers which have security restrictions on local files

**Compositions not animating**:

- Make sure layers have keyframes with different time values
- Check that the GIF export button appears (only shows when animations are present)
- Verify assets are loaded (thumbnails should be visible)

## Credits

Dialog system and assets inspired by _[The Coffin of Andy and Leyley](https://store.steampowered.com/app/2378900/The_Coffin_of_Andy_and_Leyley/)_ by **Nemlei** / [**Kit9 Studio**](https://store.steampowered.com/search/?developer=Kit9%20Studio)  
Some assets, theme and inspiration by **Nemlei**
Faustina font by Google.  
[gif.js](https://github.com/jnordberg/gif.js/) by jnordberg.  
[lz-string](https://github.com/pieroxy/lz-string) by pieroxy  
Created by Kidev as a fan tool for the community. The tool requires to own the game to work.  
