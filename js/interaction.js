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

const activePointers = new Map();

container.addEventListener('pointerdown', e => {
  const el = e.target.closest('[data-midi]');
  if (!el) return;

  e.preventDefault();
  const midi = Number(el.dataset.midi);
  activePointers.set(e.pointerId, { midi, el });
  el.setPointerCapture(e.pointerId);
  pressKey(midi, el);
});

function releasePointer(e) {
  const activePointer = activePointers.get(e.pointerId);
  if (!activePointer) return;

  activePointers.delete(e.pointerId);
  releaseKey(activePointer.midi, activePointer.el);
}

container.addEventListener('pointerup', releasePointer);
container.addEventListener('pointercancel', releasePointer);
container.addEventListener('lostpointercapture', releasePointer);

const pressedKeys = new Map();

document.addEventListener('keydown', e => {
  if (e.repeat) return;
  const midi = midiForKeyboardEvent(e);
  if (midi === null || pressedKeys.has(e.code)) return;

  const el = whiteEls[midi] || blackEls[midi];
  if (!el) return;

  e.preventDefault();
  pressedKeys.set(e.code, { midi, el });
  pressKey(midi, el);
});

document.addEventListener('keyup', e => {
  const pressedKey = pressedKeys.get(e.code);
  if (!pressedKey) return;

  pressedKeys.delete(e.code);
  releaseKey(pressedKey.midi, pressedKey.el);
});

function releaseEverything() {
  pressedKeys.clear();
  activePointers.clear();
  document.querySelectorAll('[data-midi].active').forEach(el => {
    el.classList.remove('active');
  });
  stopAllNotes();
}

window.addEventListener('blur', releaseEverything);
window.addEventListener('pagehide', releaseEverything);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) releaseEverything();
});
