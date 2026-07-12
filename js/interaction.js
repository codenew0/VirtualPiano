// -------------------------------------------------------
//  Interaction
// -------------------------------------------------------
async function pressKey(midi, el) {
  el.classList.add('active');
  lastNote.textContent = noteName(midi) + '  (MIDI ' + midi + ')';

  const played = await startNote(midi);
  if (played) {
    lastNote.textContent = noteName(midi) + '  (MIDI ' + midi + ')';
  }
}

function releaseKey(midi, el) {
  stopNote(midi);
  el?.classList.remove('active');
}

container.addEventListener('pointerdown', e => {
  const el = e.target.closest('[data-midi]');
  if (!el) return;

  e.preventDefault();
  el.setPointerCapture(e.pointerId);
  pressKey(Number(el.dataset.midi), el);
});

function releasePointer(e) {
  const el = e.target.closest('[data-midi]');
  if (el) releaseKey(Number(el.dataset.midi), el);
}

container.addEventListener('pointerup', releasePointer);
container.addEventListener('pointercancel', releasePointer);

const pressedKeys = new Set();
document.addEventListener('keydown', e => {
  if (e.repeat) return;
  const ch = e.key.toLowerCase();
  if (ch in CHAR_MAP) {
    e.preventDefault();
    const midi = CHAR_MAP[ch];
    if (pressedKeys.has(ch)) return;
    pressedKeys.add(ch);
    const el = whiteEls[midi] || blackEls[midi];
    if (el) pressKey(midi, el);
  }
});

document.addEventListener('keyup', e => {
  const ch = e.key.toLowerCase();
  if (!(ch in CHAR_MAP)) return;

  const midi = CHAR_MAP[ch];
  pressedKeys.delete(ch);
  releaseKey(midi, whiteEls[midi] || blackEls[midi]);
});

