# Understanding Functions Through Graphs
**M3 Linear Algebra & Calculus — Internal Assessment (Animation Video)**

- **Student Name:** Sunny Pandey
- **URN:** `E35B070885`
- **Batch / Lab:** Hopper Batch • Debugger Lab
- **Topic (M3 Calculus):** Single-Variable Functions & Graphs ($f(x) = 2x + 1$, $C(x) = 20x$)
- **Duration:** ~5 minutes (`1920×1080`, 16:9, 24 fps)

---

## Repository Contents

- [`_Video.mp4`](./_Video.mp4) — Final rendered 1080p MP4 video in Light Theme (`dataviz` Data Storytelling style) with narration, synced subtitles, opening title frame, and closing summary/credits frame.
- [`Storyboard.pdf`](./Storyboard.pdf) — Complete 6-scene storyboard, learning objective, worked example verification, references, and AI disclosure.
- [`_Code/`](./_Code/) — Complete runnable animation source code and assets:
  - `index.html`, `main.js`, `film.js`, `ease.js` — Custom HTML5 Canvas Data Storytelling rendering engine and mathematical animations.
  - `render_sunny_latex.py` — `pdflatex` + `pdftoppm` compiler for high-DPI Light-Theme LaTeX formulas (`assets/tex/`).
  - `generate_sunny_audio.py` — Sentence-by-sentence Voicebox TTS (`SUNNY_VOICE`) synthesis and cue alignment (`lines.json`, `voices/dur.json`, `voices/words_rel.json`).
  - `mix.py` — Audio mixer combining voice-over, low-volume ambient music bed, and subtle mark pops.
  - `assets/` — Compiled Light-Theme LaTeX formula PNGs.

---

## How to Preview `_Code/` Locally

```bash
cd _Code
python3 -m http.server 8000
# Open http://localhost:8000 in browser
```

---

## References & Music Credit

- **Reference:** M3 Calculus & Linear Algebra Syllabus (Single-Variable Functions & Graphs).
- **Music Credit:** Ambient Synth Score (Original / Royalty-Free, low-volume narration bed).
