// Understanding Functions Through Graphs — Data Storytelling Light Theme (dataviz)
// Warm cream editorial paper (#FAF8F4), dark warm ink (#1C2127), royal blue (#1D4ED8) inputs, crimson red (#D9381E) outputs.
import { clamp, lerp, seg, E, snap } from './ease.js';

export const W = 1920, H = 1080;
const C = {
  paper: '#FAF8F4',
  card: '#FFFFFF',
  ink: '#1C2127',
  mute: '#6B7280',
  grid: '#E6E3DC',
  dot: '#D8D4CA',
  blue: '#1D4ED8',
  blueSoft: 'rgba(29, 78, 216, 0.10)',
  red: '#D9381E',
  redSoft: 'rgba(217, 56, 30, 0.12)',
  green: '#047857'
};

let WORDS = {}, LINES = [], SCENE_DURS = { s1: 28, s2: 38, s3: 38, s4: 55, s5: 48, s6: 35 };
const INTRO_DUR = 4.0, OUTRO_DUR = 6.0;
export let DUR = INTRO_DUR + 242 + OUTRO_DUR;
let TEX = {};

export function setTexImages(m) { TEX = m || {}; }
export function setDurations(d) {
  if (d && Object.keys(d).length >= 6) {
    SCENE_DURS = d;
    updateSceneBoundaries();
  }
}

export let SCENES = [];
function updateSceneBoundaries() {
  const d = SCENE_DURS;
  let cur = 0;
  const defs = [
    { id: 's0', num: '00', title: 'Introduction', tex: 'tex_s1', dur: INTRO_DUR },
    { id: 's1', num: '01', title: 'Hook & Introduction', tex: 'tex_s1', dur: d.s1 },
    { id: 's2', num: '02', title: 'What Is a Function?', tex: 'tex_s2', dur: d.s2 },
    { id: 's3', num: '03', title: 'Understanding the Graph', tex: 'tex_s3', dur: d.s3 },
    { id: 's4', num: '04', title: 'Worked Example: f(x) = 2x + 1', tex: 'tex_s2', dur: d.s4 },
    { id: 's5', num: '05', title: 'Real-Life Interpretation: C(x) = 20x', tex: 'tex_s5', dur: d.s5 },
    { id: 's6', num: '06', title: 'Summary & Conclusion', tex: 'tex_s6', dur: d.s6 },
    { id: 's7', num: '07', title: 'Takeaways, Credits & AI Disclosure', tex: 'tex_s6', dur: OUTRO_DUR },
  ];
  SCENES = defs.map(df => {
    const sc = { ...df, t0: cur, t1: cur + df.dur };
    cur += df.dur;
    return sc;
  });
  DUR = cur;
  if (typeof window !== 'undefined') window.DUR = DUR;
}
updateSceneBoundaries();

export function setWords(w) { WORDS = w || {}; }
export function setLines(lines, dur) {
  LINES = (lines || []).map(L => ({ ...L, t: L.t + INTRO_DUR, end: L.end + INTRO_DUR }));
  if (dur && Object.keys(dur).length >= 6) setDurations(dur);
}
export const subs = () => LINES.map(L => ({ t0: L.t, t1: L.end, text: L.text }));

export function buildEvents() {
  const ev = [];
  SCENES.forEach(sc => ev.push({ t: sc.t0, sound: 'pop', gain: 0.3 }));
  return ev;
}

function drawTex(g, key, x, y, targetH, reveal = 1.0) {
  const img = TEX[key];
  if (!img || reveal <= 0.01) return 0;
  const sc = targetH / img.height, w = img.width * sc;
  g.save();
  if (reveal < 0.999) {
    g.beginPath(); g.rect(x, y - 4, w * reveal, targetH + 8); g.clip();
  }
  g.drawImage(img, x, y, w, targetH);
  g.restore();
  return w;
}

function drawPaperBackground(g) {
  g.fillStyle = C.paper;
  g.fillRect(0, 0, W, H);

  // Faint editorial dot grid (Data Storytelling signature)
  g.fillStyle = C.dot;
  for (let x = 60; x < W; x += 40) {
    for (let y = 60; y < H; y += 40) {
      g.fillRect(x, y, 2, 2);
    }
  }
}

function drawHeader(g, sc, relT) {
  // Top-left chapter badge + headline
  g.fillStyle = C.blue;
  g.font = '700 15px "SF Mono", Menlo, monospace';
  g.fillText(`SCENE ${sc.num}  //  SINGLE-VARIABLE FUNCTIONS`, 96, 62);

  g.fillStyle = C.ink;
  g.font = '700 34px Georgia, "Times New Roman", serif';
  g.fillText(sc.title, 96, 106);

  // Top-right LaTeX formula card
  const rev = snap(relT, 0.7, 0.6);
  const img = TEX[sc.tex];
  if (img) {
    const th = 48, tw = img.width * (th / img.height);
    const bx = W - 96 - tw - 40, by = 44;
    g.fillStyle = C.card;
    g.strokeStyle = C.grid;
    g.lineWidth = 1.5;
    g.beginPath(); g.roundRect(bx, by, tw + 40, 74, 8); g.fill(); g.stroke();
    drawTex(g, sc.tex, bx + 20, by + 13, th, rev);
  }

  g.strokeStyle = C.grid;
  g.lineWidth = 1.2;
  g.beginPath(); g.moveTo(96, 134); g.lineTo(W - 96, 134); g.stroke();
}

function drawSubtitles(g, t) {
  const active = LINES.find(L => t >= L.t && t <= L.end + 0.35);
  if (!active) return;

  const x = 96, maxW = W - 192;
  const words = active.text.split(' ');
  const wTimes = WORDS[active.id] || [];

  g.font = 'italic 500 28px Georgia, "Times New Roman", serif';
  const lines = [];
  let curLine = [], curW = 0;
  words.forEach((wd, idx) => {
    const ww = g.measureText(wd + ' ').width;
    if (curW + ww > maxW && curLine.length > 0) {
      lines.push(curLine); curLine = [{ wd, idx, ww }]; curW = ww;
    } else {
      curLine.push({ wd, idx, ww }); curW += ww;
    }
  });
  if (curLine.length > 0) lines.push(curLine);

  const lineH = 38, totalH = lines.length * lineH;
  const topY = H - 110;

  // Hairline rule above figure-caption subtitle (dataviz style)
  g.fillStyle = 'rgba(250, 248, 244, 0.92)';
  g.fillRect(0, topY - 26, W, 140);
  g.strokeStyle = C.dot; g.lineWidth = 1.5;
  g.beginPath(); g.moveTo(x, topY - 18); g.lineTo(W - 96, topY - 18); g.stroke();

  lines.forEach((ln, li) => {
    let cx = x;
    const cy = topY + 18 + li * lineH;
    ln.forEach(item => {
      const wt = active.t + (wTimes[item.idx] || (item.idx * (active.dur / words.length)));
      const isCur = t >= wt && t < wt + 0.45;
      const isSpoken = t >= wt;
      g.fillStyle = isCur ? C.red : (isSpoken ? C.ink : '#9CA3AF');
      g.fillText(item.wd, cx, cy);
      cx += item.ww;
    });
  });
}

// ---------------- MAIN RENDER ----------------
export function renderFilm(g, t, options = {}) {
  t = clamp(t, 0, DUR);
  drawPaperBackground(g);

  const sc = SCENES.find(s => t >= s.t0 && t < s.t1) || SCENES[SCENES.length - 1];
  const relT = t - sc.t0;

  if (sc.id !== 's0' && sc.id !== 's7') {
    drawHeader(g, sc, relT);
    if (!options.nosub) drawSubtitles(g, t);
  }

  switch (sc.id) {
    case 's0': renderS0(g, relT); break;
    case 's1': renderS1(g, relT); break;
    case 's2': renderS2(g, relT); break;
    case 's3': renderS3(g, relT); break;
    case 's4': renderS4(g, relT); break;
    case 's5': renderS5(g, relT); break;
    case 's6': renderS6(g, relT); break;
    case 's7': renderS7(g, relT); break;
  }
}

// ---------------- SCENE 0: OPENING TITLE FRAME ----------------
function renderS0(g, relT) {
  const cx = W / 2, cy = H / 2;
  const p = snap(relT, 1.0, 0.8);

  // Clean editorial card
  const cw = 1200, ch = 420, bx = cx - cw / 2, by = cy - ch / 2;
  g.fillStyle = C.card; g.strokeStyle = C.ink; g.lineWidth = 2.5;
  g.beginPath(); g.roundRect(bx, by, cw, ch, 12); g.fill(); g.stroke();

  g.save(); g.globalAlpha = p;
  g.fillStyle = C.blue; g.font = '700 18px "SF Mono", Menlo, monospace';
  const k = 'M3 LINEAR ALGEBRA & CALCULUS  //  ANIMATION VIDEO';
  g.fillText(k, cx - g.measureText(k).width / 2, by + 68);

  g.fillStyle = C.ink; g.font = '700 48px Georgia, "Times New Roman", serif';
  const ttl = 'Understanding Functions Through Graphs';
  g.fillText(ttl, cx - g.measureText(ttl).width / 2, by + 145);

  g.fillStyle = C.mute; g.font = 'italic 500 25px Georgia, "Times New Roman", serif';
  const sub = 'Concept: Single-Variable Functions, Input-Output Tables & Linear Graphs';
  g.fillText(sub, cx - g.measureText(sub).width / 2, by + 195);

  g.strokeStyle = C.red; g.lineWidth = 2.5;
  g.beginPath(); g.moveTo(cx - 240, by + 235); g.lineTo(cx + 240, by + 235); g.stroke();

  g.fillStyle = C.red; g.font = '700 28px "SF Mono", Menlo, monospace';
  const nm = 'SUNNY PANDEY';
  g.fillText(nm, cx - g.measureText(nm).width / 2, by + 295);

  g.fillStyle = C.ink; g.font = '600 20px "SF Mono", Menlo, monospace';
  const id = 'URN: E35B070885   •   HOPPER BATCH   •   DEBUGGER LAB';
  g.fillText(id, cx - g.measureText(id).width / 2, by + 345);
  g.restore();
}

// ---------------- SCENE 1: HOOK & FUNCTION MACHINE ----------------
function renderS1(g, relT) {
  const cx = W / 2, cy = H / 2 - 10;
  drawFunctionMachine(g, cx, cy, 'f(x)', relT, [
    { inVal: 'x = 1', outVal: 'y = 3' },
    { inVal: 'x = 2', outVal: 'y = 5' },
    { inVal: 'x = 3', outVal: 'y = 7' }
  ]);
}

// ---------------- SCENE 2: WHAT IS A FUNCTION? f(x) = 2x + 1 ----------------
function renderS2(g, relT) {
  const cx = W / 2, cy = H / 2 - 20;
  drawFunctionMachine(g, cx, cy, 'f(x) = 2x + 1', relT, [
    { inVal: '1', outVal: '2(1) + 1 = 3' },
    { inVal: '2', outVal: '2(2) + 1 = 5' },
    { inVal: '3', outVal: '2(3) + 1 = 7' }
  ]);
}

function drawFunctionMachine(g, cx, cy, ruleText, relT, pairs) {
  const bw = 380, bh = 240, bx = cx - bw / 2, by = cy - bh / 2;

  // Input conveyor pipe (left)
  g.fillStyle = C.blueSoft; g.strokeStyle = C.blue; g.lineWidth = 2.5;
  g.beginPath(); g.roundRect(bx - 340, cy - 42, 340, 84, 8); g.fill(); g.stroke();
  g.fillStyle = C.blue; g.font = '700 18px "SF Mono", Menlo, monospace';
  g.fillText('INPUT (x)', bx - 320, cy - 58);

  // Output conveyor pipe (right)
  g.fillStyle = C.redSoft; g.strokeStyle = C.red; g.lineWidth = 2.5;
  g.beginPath(); g.roundRect(bx + bw, cy - 42, 340, 84, 8); g.fill(); g.stroke();
  g.fillStyle = C.red; g.font = '700 18px "SF Mono", Menlo, monospace';
  g.fillText('OUTPUT f(x)', bx + bw + 20, cy - 58);

  // Central Machine Box
  g.fillStyle = C.card; g.strokeStyle = C.ink; g.lineWidth = 3.5;
  g.beginPath(); g.roundRect(bx, by, bw, bh, 16); g.fill(); g.stroke();

  g.fillStyle = C.mute; g.font = '700 15px "SF Mono", Menlo, monospace';
  const lbl = 'FUNCTION MACHINE';
  g.fillText(lbl, cx - g.measureText(lbl).width / 2, by + 40);

  g.fillStyle = C.ink; g.font = '700 40px Georgia, "Times New Roman", serif';
  g.fillText(ruleText, cx - g.measureText(ruleText).width / 2, cy + 16);

  // Animated traveling tokens
  const cycle = 5.0;
  const idx = Math.floor(relT / cycle) % pairs.length;
  const u = (relT % cycle) / cycle;
  const pair = pairs[idx];

  if (u < 0.45) {
    // Entering from left
    const p = E(u / 0.45);
    const tx = lerp(bx - 300, bx - 40, p);
    drawToken(g, tx, cy, pair.inVal, C.blue);
  } else if (u < 0.65) {
    // Processing pulse inside machine
    const p = Math.sin(((u - 0.45) / 0.2) * Math.PI);
    g.strokeStyle = C.red; g.lineWidth = 3 + p * 4;
    g.beginPath(); g.roundRect(bx - 6, by - 6, bw + 12, bh + 12, 20); g.stroke();
  } else {
    // Exiting to right
    const p = E((u - 0.65) / 0.35);
    const tx = lerp(bx + bw + 40, bx + bw + 260, p);
    drawToken(g, tx, cy, pair.outVal, C.red, true);
  }
}

function drawToken(g, x, y, text, color, wide = false) {
  const tw = wide ? Math.max(110, g.measureText(text).width + 36) : 96, th = 54;
  g.fillStyle = C.card; g.strokeStyle = color; g.lineWidth = 3;
  g.beginPath(); g.roundRect(x - tw / 2, y - th / 2, tw, th, 27); g.fill(); g.stroke();
  g.fillStyle = color; g.font = '700 22px "SF Mono", Menlo, monospace';
  g.fillText(text, x - g.measureText(text).width / 2, y + 8);
}

// ---------------- SCENE 3: UNDERSTANDING THE GRAPH y = 2x + 1 ----------------
function renderS3(g, relT) {
  const ox = 560, oy = 780, ux = 180, uy = 68;
  drawAxes(g, ox, oy, 4, 8, ux, uy, 'Input (x)', 'Output (y)');

  const pts = [[1, 3], [2, 5], [3, 7]];
  const lineP = snap(relT, 24.0, 2.5);

  // Draw connecting straight line
  if (lineP > 0.01) {
    g.strokeStyle = C.red; g.lineWidth = 4;
    g.beginPath();
    g.moveTo(ox, oy - 1 * uy);
    g.lineTo(ox + lerp(0, 3.5, lineP) * ux, oy - lerp(1, 8, lineP) * uy);
    g.stroke();
  }

  // Plot points one by one with dashed guides
  pts.forEach(([px, py], i) => {
    const p = snap(relT, 12.0 + i * 3.5, 1.2);
    if (p <= 0.01) return;
    const sx = ox + px * ux, sy = oy - py * uy;

    g.save(); g.globalAlpha = p;
    g.setLineDash([6, 6]); g.lineWidth = 1.8;
    g.strokeStyle = C.blue; g.beginPath(); g.moveTo(sx, oy); g.lineTo(sx, sy); g.stroke();
    g.strokeStyle = C.red; g.beginPath(); g.moveTo(ox, sy); g.lineTo(sx, sy); g.stroke();
    g.setLineDash([]);

    g.fillStyle = C.red; g.strokeStyle = C.ink; g.lineWidth = 2.5;
    g.beginPath(); g.arc(sx, sy, 9, 0, Math.PI * 2); g.fill(); g.stroke();

    g.fillStyle = C.ink; g.font = '700 20px "SF Mono", Menlo, monospace';
    g.fillText(`(${px}, ${py})`, sx + 16, sy - 10);
    g.restore();
  });
}

// ---------------- SCENE 4: WORKED EXAMPLE + TABLE + SLOPE ----------------
function renderS4(g, relT) {
  // Left: Input-Output Table + Live LaTeX Evaluation
  const tx = 140, ty = 210, tw = 560, rh = 64;
  const rows = [
    { x: 0, y: 1, tex: 'tex_s4_0', tAt: 6.0 },
    { x: 1, y: 3, tex: 'tex_s4_1', tAt: 13.0 },
    { x: 2, y: 5, tex: 'tex_s4_2', tAt: 19.0 },
    { x: 3, y: 7, tex: 'tex_s4_3', tAt: 24.0 },
  ];

  // Table Header
  g.fillStyle = C.ink; g.fillRect(tx, ty, tw, rh);
  g.fillStyle = C.card; g.font = '700 20px "SF Mono", Menlo, monospace';
  g.fillText('INPUT (x)', tx + 40, ty + 40);
  g.fillText('OUTPUT f(x) = 2x + 1', tx + 240, ty + 40);

  let activeRow = -1;
  rows.forEach((rw, i) => {
    const ry = ty + (i + 1) * rh;
    const isVis = relT >= rw.tAt - 1.0;
    const isActive = relT >= rw.tAt && (i === rows.length - 1 ? relT < 35 : relT < rows[i + 1].tAt);
    if (isActive) activeRow = i;

    g.fillStyle = isActive ? C.redSoft : C.card;
    g.fillRect(tx, ry, tw, rh);
    g.strokeStyle = isActive ? C.red : C.grid; g.lineWidth = isActive ? 2.5 : 1.5;
    g.strokeRect(tx, ry, tw, rh);

    if (isVis) {
      g.fillStyle = C.blue; g.font = '700 24px "SF Mono", Menlo, monospace';
      g.fillText(String(rw.x), tx + 85, ry + 41);
      g.fillStyle = isActive ? C.red : C.ink;
      g.fillText(String(rw.y), tx + 340, ry + 41);
    }
  });

  // Step-by-step LaTeX calculation card below table
  const calcRow = activeRow >= 0 ? rows[activeRow] : (relT > 24 ? rows[3] : rows[0]);
  if (relT > 5) {
    g.fillStyle = C.card; g.strokeStyle = C.blue; g.lineWidth = 2;
    g.beginPath(); g.roundRect(tx, ty + 360, tw, 110, 10); g.fill(); g.stroke();
    g.fillStyle = C.blue; g.font = '700 15px "SF Mono", Menlo, monospace';
    g.fillText('STEP-BY-STEP CALCULATION:', tx + 24, ty + 390);
    drawTex(g, calcRow.tex, tx + 24, ty + 405, 48, 1.0);
  }

  // Right: Coordinate Plane + Slope Step Triangles (+1 right, +2 up)
  const ox = 920, oy = 780, ux = 190, uy = 68;
  drawAxes(g, ox, oy, 4, 8, ux, uy, 'Input (x)', 'Output f(x)');

  const lineP = snap(relT, 38.0, 2.5);
  if (lineP > 0.01) {
    g.strokeStyle = C.red; g.lineWidth = 4;
    g.beginPath();
    g.moveTo(ox, oy - 1 * uy);
    g.lineTo(ox + lerp(0, 3.3, lineP) * ux, oy - lerp(1, 7.6, lineP) * uy);
    g.stroke();
  }

  rows.forEach((rw, i) => {
    if (relT < rw.tAt) return;
    const sx = ox + rw.x * ux, sy = oy - rw.y * uy;
    g.fillStyle = C.red; g.strokeStyle = C.ink; g.lineWidth = 2.5;
    g.beginPath(); g.arc(sx, sy, 9, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = C.ink; g.font = '700 18px "SF Mono", Menlo, monospace';
    g.fillText(`(${rw.x}, ${rw.y})`, sx + 14, sy - 10);

    // Slope step (+1 right, +2 up) shown after relT > 40s
    if (relT > 40 && i < 3) {
      const nx = ox + (rw.x + 1) * ux, ny = oy - (rw.y + 2) * uy;
      g.strokeStyle = C.blue; g.lineWidth = 2; g.setLineDash([4, 4]);
      g.beginPath(); g.moveTo(sx, sy); g.lineTo(nx, sy); g.lineTo(nx, ny); g.stroke();
      g.setLineDash([]);
      g.fillStyle = C.blue; g.font = '700 15px "SF Mono", Menlo, monospace';
      g.fillText('+1', (sx + nx) / 2 - 10, sy + 20);
      g.fillText('+2', nx + 8, (sy + ny) / 2 + 5);
    }
  });
}

// ---------------- SCENE 5: REAL-LIFE NOTEBOOK SHOP C(x) = 20x ----------------
function renderS5(g, relT) {
  // Left: Notebook cards stacking as quantity increases (1 -> 3)
  const qty = relT < 10 ? 1 : (relT < 15 ? 2 : 3);
  const bx = 140, by = 220;

  g.fillStyle = C.card; g.strokeStyle = C.ink; g.lineWidth = 2;
  g.beginPath(); g.roundRect(bx, by, 560, 520, 12); g.fill(); g.stroke();

  g.fillStyle = C.ink; g.font = '700 22px Georgia, serif';
  g.fillText('Stationery Shop: ₹20 per Notebook', bx + 30, by + 48);

  for (let n = 0; n < qty; n++) {
    const nx = bx + 40 + n * 165, ny = by + 95;
    g.fillStyle = C.blueSoft; g.strokeStyle = C.blue; g.lineWidth = 2.5;
    g.beginPath(); g.roundRect(nx, ny, 140, 190, 8); g.fill(); g.stroke();
    g.fillStyle = C.blue; g.fillRect(nx, ny, 18, 190); // notebook spine
    g.fillStyle = C.ink; g.font = '700 20px "SF Mono", Menlo, monospace';
    g.fillText(`BOOK ${n + 1}`, nx + 34, ny + 90);
    g.fillStyle = C.red;
    g.fillText('₹20', nx + 55, ny + 130);
  }

  // Live cost equation readout
  g.fillStyle = C.redSoft; g.strokeStyle = C.red; g.lineWidth = 2;
  g.beginPath(); g.roundRect(bx + 30, by + 340, 500, 130, 10); g.fill(); g.stroke();
  g.fillStyle = C.ink; g.font = '700 26px "SF Mono", Menlo, monospace';
  g.fillText(`Notebooks (x) = ${qty}`, bx + 56, by + 390);
  g.fillStyle = C.red; g.font = '700 32px "SF Mono", Menlo, monospace';
  g.fillText(`Total Cost C(${qty}) = ₹${qty * 20}`, bx + 56, by + 440);

  // Right: Cost Graph C(x) = 20x
  const ox = 920, oy = 780, ux = 190, uy = 6.5; // 80 rupees * 6.5 = 520px
  drawAxes(g, ox, oy, 4, 80, ux, uy, 'Notebooks (x)', 'Total Cost (₹)', 20);

  const lineP = snap(relT, 28.0, 2.0);
  if (lineP > 0.01) {
    g.strokeStyle = C.red; g.lineWidth = 4;
    g.beginPath(); g.moveTo(ox, oy);
    g.lineTo(ox + lerp(0, 3.5, lineP) * ux, oy - lerp(0, 70, lineP) * uy);
    g.stroke();
  }

  for (let k = 1; k <= 3; k++) {
    if (relT < (k === 1 ? 8 : (k === 2 ? 14 : 18))) continue;
    const sx = ox + k * ux, sy = oy - (k * 20) * uy;
    g.fillStyle = C.red; g.strokeStyle = C.ink; g.lineWidth = 2.5;
    g.beginPath(); g.arc(sx, sy, 9, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = C.ink; g.font = '700 18px "SF Mono", Menlo, monospace';
    g.fillText(`(${k}, ₹${k * 20})`, sx + 14, sy - 10);
  }
}

// ---------------- SCENE 6: SUMMARY (FORMULA ≡ TABLE ≡ GRAPH) ----------------
function renderS6(g, relT) {
  const y = 260, cw = 480, ch = 360, gap = 60, startX = (W - (3 * cw + 2 * gap)) / 2;
  const panels = [
    { title: '1. FORMULA', sub: 'f(x) = 2x + 1', desc: 'A precise rule turning input x into output y.' },
    { title: '2. TABLE', sub: '0→1, 1→3, 2→5, 3→7', desc: 'Organized pairs of inputs and outputs.' },
    { title: '3. GRAPH', sub: 'Straight Line', desc: 'Visualizes how output changes with input.' },
  ];

  panels.forEach((pn, i) => {
    const px = startX + i * (cw + gap);
    const rev = snap(relT, 3.0 + i * 3.0, 1.0);
    g.save(); g.globalAlpha = Math.max(0.15, rev);
    g.fillStyle = C.card; g.strokeStyle = i === 2 ? C.red : C.blue; g.lineWidth = 2.5;
    g.beginPath(); g.roundRect(px, y, cw, ch, 12); g.fill(); g.stroke();

    g.fillStyle = i === 2 ? C.red : C.blue; g.font = '700 20px "SF Mono", Menlo, monospace';
    g.fillText(pn.title, px + 32, y + 54);

    g.fillStyle = C.ink; g.font = '700 32px Georgia, serif';
    g.fillText(pn.sub, px + 32, y + 140);

    g.fillStyle = C.mute; g.font = '500 21px Georgia, serif';
    wrapText(g, pn.desc, px + 32, y + 215, cw - 64, 32);
    g.restore();
  });

  // Real-life applications pill bar
  if (relT > 16) {
    const apps = ['PRICES', 'DISTANCE', 'TIME', 'DATA TRENDS'];
    apps.forEach((ap, i) => {
      const ax = 480 + i * 250, ay = 700;
      g.fillStyle = C.blueSoft; g.strokeStyle = C.blue; g.lineWidth = 1.5;
      g.beginPath(); g.roundRect(ax, ay, 210, 48, 24); g.fill(); g.stroke();
      g.fillStyle = C.blue; g.font = '700 18px "SF Mono", Menlo, monospace';
      g.fillText(ap, ax + 105 - g.measureText(ap).width / 2, ay + 31);
    });
  }
}

// ---------------- SCENE 7: CLOSING FRAME (3 TAKEAWAYS & AI DISCLOSURE) ----------------
function renderS7(g, relT) {
  const cx = W / 2, cy = H / 2;
  const rev = snap(relT, 0.7, 0.5);
  const bw = 1280, bh = 560, bx = cx - bw / 2, by = cy - bh / 2;

  g.fillStyle = C.card; g.strokeStyle = C.ink; g.lineWidth = 2.5;
  g.beginPath(); g.roundRect(bx, by, bw, bh, 12); g.fill(); g.stroke();

  g.save(); g.globalAlpha = rev;
  g.fillStyle = C.blue; g.font = '700 20px "SF Mono", Menlo, monospace';
  g.fillText('THREE CORE TAKEAWAYS', bx + 50, by + 56);

  const takeaways = [
    '1. DEFINITION: A function takes an input (x) and produces exactly one output f(x).',
    '2. REPRESENTATIONS: Functions can be shown as a formula, an input-output table, or a graph.',
    '3. REAL-LIFE LINK: Graphs reveal how quantities like cost C(x) = 20x grow steadily with input.'
  ];
  g.fillStyle = C.ink; g.font = '500 21px Georgia, "Times New Roman", serif';
  takeaways.forEach((tk, i) => g.fillText(tk, bx + 50, by + 104 + i * 44));

  g.strokeStyle = C.red; g.lineWidth = 2;
  g.beginPath(); g.moveTo(bx + 50, by + 242); g.lineTo(bx + bw - 50, by + 242); g.stroke();

  g.fillStyle = C.red; g.font = '700 32px "SF Mono", Menlo, monospace';
  g.fillText('SUNNY PANDEY', bx + 50, by + 300);

  g.fillStyle = C.ink; g.font = '600 19px "SF Mono", Menlo, monospace';
  g.fillText('URN: E35B070885   •   HOPPER BATCH   •   DEBUGGER LAB   •   M3 CALCULUS', bx + 50, by + 340);

  g.fillStyle = C.mute; g.font = '500 17px "SF Mono", Menlo, monospace';
  g.fillText('REFERENCE: M3 Calculus & Linear Algebra Syllabus (Single-Variable Functions & Graphs)', bx + 50, by + 420);
  g.fillText('MUSIC CREDIT: Ambient Synth Score (Original / Royalty-Free, low-volume narration bed)', bx + 50, by + 460);
  g.restore();
}

// ---------------- HELPERS ----------------
function drawAxes(g, ox, oy, maxX, maxY, ux, uy, xLbl, yLbl, yStep = 1) {
  const xEnd = ox + maxX * ux + 40, yEnd = oy - maxY * uy - 40;

  // Grid lines
  g.strokeStyle = C.grid; g.lineWidth = 1;
  for (let x = 1; x <= maxX; x++) {
    g.beginPath(); g.moveTo(ox + x * ux, oy); g.lineTo(ox + x * ux, yEnd); g.stroke();
  }
  for (let y = yStep; y <= maxY; y += yStep) {
    g.beginPath(); g.moveTo(ox, oy - y * uy); g.lineTo(xEnd, oy - y * uy); g.stroke();
  }

  // Main Axes
  g.strokeStyle = C.ink; g.lineWidth = 2.5;
  g.beginPath(); g.moveTo(ox - 20, oy); g.lineTo(xEnd, oy); g.stroke();
  g.beginPath(); g.moveTo(ox, oy + 20); g.lineTo(ox, yEnd); g.stroke();

  // Ticks & Numbers
  g.fillStyle = C.ink; g.font = '600 17px "SF Mono", Menlo, monospace';
  for (let x = 0; x <= maxX; x++) {
    g.fillText(String(x), ox + x * ux - 6, oy + 28);
  }
  for (let y = yStep; y <= maxY; y += yStep) {
    g.fillText(String(y), ox - 42, oy - y * uy + 6);
  }

  g.fillStyle = C.blue; g.font = '700 18px "SF Mono", Menlo, monospace';
  g.fillText(xLbl, xEnd - 90, oy + 54);
  g.fillStyle = C.red;
  g.fillText(yLbl, ox - 30, yEnd - 16);
}

function wrapText(g, text, x, y, maxW, lh) {
  const words = text.split(' ');
  let line = '';
  for (let n = 0; n < words.length; n++) {
    const test = line + words[n] + ' ';
    if (g.measureText(test).width > maxW && n > 0) {
      g.fillText(line, x, y); line = words[n] + ' '; y += lh;
    } else { line = test; }
  }
  g.fillText(line, x, y);
}
