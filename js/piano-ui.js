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
    const kc = KEY_MAP[midi] || '';
    el.innerHTML = `
      <span class="note-label">${noteName(midi)}</span>
      <span class="key-label">${kc.toUpperCase()}</span>
    `;
    container.appendChild(el);
    whiteEls[midi] = el;
  });

  whites.forEach((midi, idx) => {
    const s = midi % 12;
    if ([0,2,5,7,9].includes(s)) {
      const bm = midi + 1;
      if (bm > hi) return;
      const el = document.createElement('div');
      el.className = 'key-black';
      el.dataset.midi = bm;
      const left = 24 + idx * WHITE_W + WHITE_W - 14;
      el.style.left = left + 'px';
      el.style.top  = '20px';
      const kc = KEY_MAP[bm] || '';
      el.innerHTML = `
        <span class="note-label">${noteName(bm)}</span>
        <span class="key-label">${kc.toUpperCase()}</span>
      `;
      container.appendChild(el);
      blackEls[bm] = el;
    }
  });

  container.style.width = (whites.length * WHITE_W + 48) + 'px';
}



