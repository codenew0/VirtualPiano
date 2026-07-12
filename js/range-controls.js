// -------------------------------------------------------
//  Real-world keyboard size presets
// -------------------------------------------------------
const keyboardPreset = document.getElementById('keyboard-preset');
const rangeLow       = document.getElementById('range-low');
const rangeHigh      = document.getElementById('range-high');
const lvEl           = document.getElementById('lv');
const hvEl           = document.getElementById('hv');
const kcEl           = document.getElementById('key-count');

function updateRange() {
  const [lo, hi] = keyboardPreset.value.split(',').map(Number);

  window.stopAllNotes?.();
  rangeLow.value = lo;
  rangeHigh.value = hi;
  lvEl.textContent = noteName(lo);
  hvEl.textContent = noteName(hi);
  kcEl.textContent = (hi - lo + 1) + ' keys';
  buildPiano();
}

keyboardPreset.addEventListener('change', updateRange);
