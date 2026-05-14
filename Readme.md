# Musixel 📻

A retro-inspired browser music player with a pixel-art aesthetic, real-time audio visualization, drag-and-drop playlist management, and smooth keyboard-driven controls. Built entirely with vanilla HTML, CSS, and JavaScript — no frameworks, no dependencies, just pure frontend magic. 

---

## ✨ Preview

---

## 🚀 Features

* 🎵 Local audio playback support
* 📂 Drag & drop music uploads
* 📜 Dynamic playlist generation
* ⏯️ Play / Pause / Next / Previous controls
* 🎚️ Seek bar + persistent volume control
* 📊 Real-time audio visualizer using Web Audio API
* ⌨️ Keyboard shortcuts for full control
* 💾 Volume saved with LocalStorage
* 📱 Fully responsive retro UI
* 🌌 Pixel-art inspired cyberpunk aesthetic
* ♻️ Automatic track cleanup with object URL revocation

---

## 🛠️ Built With

* **HTML5**
* **CSS3**
* **Vanilla JavaScript**
* **Web Audio API**
* **Canvas API**
* **LocalStorage API**

---

# 📁 Project Structure

```bash
Musixel/
│
├── musixel.html      # Main HTML structure
├── styles.css        # Retro pixel UI styling
├── script.js         # Music player logic & audio engine
└── README.md
```

---

# 🎧 How It Works

Musixel uses the browser's native `<audio>` element combined with the Web Audio API to create a lightweight but immersive music player experience.

When users upload tracks:

1. Files are validated as audio
2. Temporary object URLs are created
3. Tracks are added into a dynamic playlist
4. Audio data is passed into an `AnalyserNode`
5. Frequency data is visualized on a `<canvas>` in real time

The visualizer continuously renders animated frequency bars using `requestAnimationFrame()` for smooth performance. 

---

# ⌨️ Keyboard Shortcuts

| Key     | Action            |
| ------- | ----------------- |
| `Space` | Play / Pause      |
| `←`     | Rewind 5 seconds  |
| `→`     | Forward 5 seconds |
| `↑`     | Increase volume   |
| `↓`     | Decrease volume   |
| `Esc`   | Stop playback     |

Keyboard interactions are implemented globally for a desktop-player feel. 

---

# 🎨 UI & Design Philosophy

Musixel embraces a nostalgic blend of:

* Retro arcade interfaces
* CRT-inspired visuals
* Pixel typography
* Neon cyberpunk colors
* Soft glow aesthetics
* Game-console inspired controls

The interface is styled using custom CSS variables, gradients, pixel fonts, and responsive layouts. 

---

# ⚡ Performance Highlights

* No external frameworks
* Lightweight and fast
* Efficient canvas rendering
* Lazy audio metadata loading
* Minimal DOM updates
* Responsive rendering across devices

---

# 📦 Installation

Clone the repository:

```bash
git clone https://github.com/your-username/musixel.git
```

Navigate into the project:

```bash
cd musixel
```

Run locally:

```bash
# Simply open musixel.html in your browser
```

Or use VS Code Live Server for a better development experience.

---

# 📸 Core Components

## Audio Engine

* Uses `AudioContext`
* `AnalyserNode` for frequency analysis
* Dynamic playback management

## Playlist System

* Dynamic rendering
* Active track highlighting
* Click-to-play functionality

## Visualizer

* Canvas-powered animated bars
* Responsive scaling
* Neon layered effects

## Upload System

* Drag & drop support
* Multi-file uploads
* Audio format filtering

---

# 🔥 Future Improvements

Some cool upgrades that could make Musixel even crazier:

* 🎼 Music metadata extraction
* 💿 Album artwork display
* 🌈 Theme customization
* 🎛️ Equalizer presets
* 🔁 Shuffle & repeat modes
* ☁️ Cloud playlist sync
* 📡 Spotify / YouTube integration
* 🎤 Visualizer themes
* 🌊 Waveform visualization
* 🧠 AI-generated playlists based on mood

---

# 🧪 Challenges Solved

* Managing real-time audio visualization efficiently
* Synchronizing UI state with audio playback
* Handling drag-and-drop file uploads cleanly
* Creating a retro UI without sacrificing responsiveness
* Preventing memory leaks from object URLs

---

# 📱 Responsive Design

Musixel adapts across:

* Desktop
* Tablets
* Mobile devices

Using CSS Grid, flexible sizing, and responsive breakpoints for smooth scaling. 

---

# 💡 Why This Project Stands Out

Unlike generic music players, Musixel focuses heavily on:

* immersive frontend experience,
* handcrafted UI aesthetics,
* interactive visual feedback,
* and nostalgic design identity.

It feels less like a utility app… and more like booting up a futuristic cassette deck from an alternate 1987 timeline.

---

# 🙌 Acknowledgements

Inspired by:

* Retro gaming consoles
* CRT interfaces
* Synthwave aesthetics
* Classic media players
* Pixel-art UI design

---

# 📄 License

This project is licensed under the MIT License.

---

# ⭐ Support

If you liked this project:

* Star the repository
* Fork it
* Improve it
* Break it
* Rebuild it cooler 😎

---

### Built with pixels, music, and questionable sleep schedules.
