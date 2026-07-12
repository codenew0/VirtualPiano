// -------------------------------------------------------
//  Interaction
// -------------------------------------------------------
function triggerKey(midi, el) {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  playNote(midi);
  el.classList.add('active');
  lastNote.textContent = noteName(midi) + '  (MIDI ' + midi + ')';
  setTimeout(() => el.classList.remove('active'), 200);
}

container.addEventListener('mousedown', e => {
  const el = e.target.closest('[data-midi]');
  if (!el) return;
  triggerKey(Number(el.dataset.midi), el);
});

container.addEventListener('touchstart', e => {
  e.preventDefault();
  const t = e.touches[0];
  const el = document.elementFromPoint(t.clientX, t.clientY)?.closest('[data-midi]');
  if (el) triggerKey(Number(el.dataset.midi), el);
}, { passive: false });

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
    if (el) triggerKey(midi, el);
  }
});

document.addEventListener('keyup', e => {
  pressedKeys.delete(e.key.toLowerCase());
});



