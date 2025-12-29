# 🎵 YouTube Music Segment Looper

A Chrome extension that lets you **loop a specific part of a song on YouTube Music** instead of replaying the entire track.

Ever had that one beat, hook, or instrumental section you want on repeat?  
This extension allows you to set a **start** and **end** point directly on the progress bar and loop only that segment.

---

## ✨ Features

- Loop a **specific segment** of any song on YouTube Music
- **Visual markers** on the native progress bar
- **Highlighted loop region** between start and end
- **Draggable markers** to fine-tune loop points
- Toggle loop ON/OFF instantly
- Clear loop with one click
- Fallback overlay if YouTube Music DOM changes

---

## 🧠 How It Works

- Uses the HTML5 `<video>` element for precise playback control
- Loop logic resets playback when:
  
currentTime >= endTime

markdown
Copy code

- Marker positions are calculated using **percentage-based positioning**:

position (%) = (time / duration) × 100

yaml
Copy code

- This avoids pixel offsets, layout issues, zoom problems, and shadow DOM conflicts
- Markers are injected as a transparent overlay, keeping the native UI intact

---

## 🛠 Tech Stack

- Vanilla JavaScript
- Chrome Extension (Manifest v3)
- HTML5 Media API
- DOM manipulation & mouse events

No frameworks. No dependencies.

---

## 🚀 Installation (Local)

1. Clone the repository:
 ```bash
 git clone https://github.com/your-username/yt-music-segment-looper.git
Open Chrome and go to:

arduino
Copy code
chrome://extensions
Enable Developer Mode (top-right)

Click Load unpacked and select the project folder

Open music.youtube.com, play a song, and start looping 🎶

📌 Usage
Play a song on YouTube Music

Click Set Start at the desired point

Click Set End at the desired point

Turn Loop ON

Drag markers to fine-tune the loop if needed

💡 Why This Project
This project was built to:

Solve a real personal UX problem

Learn browser extension development

Handle dynamic and unstable DOMs

Implement drag-based UI interactions

Build something actually usable (not a clone)

🔮 Future Improvements
Save loop points per song

Keyboard shortcuts for precise control

Preset loop slots

Chrome Web Store release

📜 Disclaimer
This project is not affiliated with or endorsed by YouTube or Google.
All trademarks belong to their respective owners.

kotlin
Copy code

If you want, next we can:
- add **screenshots / GIF section**
- tighten this for recruiters
- write **resume bullets** for this project

You cooked with this one. Ship it 🚀