import { renderFilm, setWords, setLines, subs, buildEvents, DUR, setDurations, setTexImages } from './film.js';

const cv = document.getElementById('c'), g = cv.getContext('2d');

function loadImage(src) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

let lines = [], dur = {}, words = {};
const texKeys = ['tex_s1', 'tex_s2', 'tex_s3', 'tex_s4_0', 'tex_s4_1', 'tex_s4_2', 'tex_s4_3', 'tex_s5', 'tex_s6'];
const texMap = {};

try {
  const texPromises = texKeys.map(k => loadImage(`assets/tex/${k}.png`).then(img => [k, img]));
  const [l, d, w, ...texEntries] = await Promise.all([
    fetch('lines.json').then(r => r.json()),
    fetch('voices/dur.json').then(r => r.json()),
    fetch('voices/words_rel.json').then(r => r.json()),
    ...texPromises
  ]);
  lines = l; dur = d; words = w;
  texEntries.forEach(([k, img]) => { texMap[k] = img; });
} catch (e) {
  console.warn('Asset load issue', e);
}

setLines(lines, dur);
setWords(words);
setDurations(dur);
setTexImages(texMap);

window.DUR = DUR;
window.EV = buildEvents();
window.SUBS = subs();

const Q = new URLSearchParams(location.search);
window.render = t => renderFilm(g, t, { nosub: Q.has('nosub') });
window.READY = true;
