// -------------------------------------------------------
//  Range controls
// -------------------------------------------------------
const rangeLow  = document.getElementById('range-low');
const rangeHigh = document.getElementById('range-high');
const lvEl      = document.getElementById('lv');
const hvEl      = document.getElementById('hv');
const kcEl      = document.getElementById('key-count');

function snapWhite(midi, dir) {
  if (!isBlack(midi)) return midi;
  return dir < 0 ? midi - 1 : midi + 1;
}

function updateRange() {
  let lo = Number(rangeLow.value);
  let hi = Number(rangeHigh.value);
  lo = snapWhite(lo, -1); rangeLow.value = lo;
  hi = snapWhite(hi,  1); rangeHigh.value = hi;
  if (lo + 2 > hi) { hi = lo + 2; rangeHigh.value = hi; }
  lvEl.textContent = noteName(lo);
  hvEl.textContent = noteName(hi);
  kcEl.textContent = (hi - lo + 1) + ' keys';
  buildPiano();
}

rangeLow.addEventListener('input',  updateRange);
rangeHigh.addEventListener('input', updateRange);



