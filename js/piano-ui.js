// -------------------------------------------------------
//  Build piano UI
// -------------------------------------------------------
const container = document.getElementById('piano-container');
const lastNote  = document.getElementById('last-note');
const WHITE_W   = 44;

let whiteEls = {}, blackEls = {};

function buildPiano() {
  container.innerHTML = '';
  whiteEls = {}; blackEls = {};

  const lo = Number(rangeLow.value);
  const hi = Number(rangeHigh.value);

  const whites = [];
  for (let m = lo; m <= hi; m++) if (!isBlack(m)) whites.push(m);

  whites.forEach(midi => {
    const el = document.createElement('div');
    el.className = 'key-white';
    el.dataset.midi = midi;
    const kc = shortcutLabel(midi);
    el.innerHTML = `
      <span class="note-label">${noteName(midi)}</span>
      <span class="key-label">${kc}</span>
    `;
    container.appendChild(el);
    whiteEls[midi] = el;
  });

  for (let bm = lo; bm <= hi; bm++) {
    if (isBlack(bm)) {
      const el = document.createElement('div');
      el.className = 'key-black';
      el.dataset.midi = bm;
      const precedingWhites = whites.filter(midi => midi < bm).length;
      const left = 24 + precedingWhites * WHITE_W - 14;
      el.style.left = left + 'px';
      el.style.top  = '20px';
      const kc = shortcutLabel(bm);
      el.innerHTML = `
        <span class="note-label">${noteName(bm)}</span>
        <span class="key-label">${kc}</span>
      `;
      container.appendChild(el);
      blackEls[bm] = el;
    }
  }

  container.style.width = (whites.length * WHITE_W + 48) + 'px';
}

