// -------------------------------------------------------
//  Range controls (C1 - C6, octave steps only)
// -------------------------------------------------------
const rangeLow  = document.getElementById('range-low');
const rangeHigh = document.getElementById('range-high');
const lvEl      = document.getElementById('lv');
const hvEl      = document.getElementById('hv');
const kcEl      = document.getElementById('key-count');

function updateRange(event) {
  let lo = Number(rangeLow.value);
  let hi = Number(rangeHigh.value);

  // Keep at least one octave between the lowest and highest C.
  if (lo >= hi) {
    if (event?.target === rangeLow) {
      lo = Math.max(24, hi - 12);
      rangeLow.value = lo;
    } else {
      hi = Math.min(84, lo + 12);
      rangeHigh.value = hi;
    }
  }

  lvEl.textContent = noteName(lo);
  hvEl.textContent = noteName(hi);
  kcEl.textContent = (hi - lo + 1) + ' keys';
  buildPiano();
}

rangeLow.addEventListener('input', updateRange);
rangeHigh.addEventListener('input', updateRange);
