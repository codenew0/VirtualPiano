// -------------------------------------------------------
//  Free lowest/highest note controls (A0 - C8)
// -------------------------------------------------------
const rangeLow  = document.getElementById('range-low');
const rangeHigh = document.getElementById('range-high');
const lvEl      = document.getElementById('lv');
const hvEl      = document.getElementById('hv');
const kcEl      = document.getElementById('key-count');

function updateRange(event) {
  let lo = Number(rangeLow.value);
  let hi = Number(rangeHigh.value);

  // Keep at least two notes and never exceed the 88-key piano range.
  if (lo >= hi) {
    if (event?.target === rangeLow) {
      lo = Math.max(21, hi - 1);
      rangeLow.value = lo;
    } else {
      hi = Math.min(108, lo + 1);
      rangeHigh.value = hi;
    }
  }

  window.stopAllNotes?.();
  lvEl.textContent = noteName(lo);
  hvEl.textContent = noteName(hi);
  kcEl.textContent = (hi - lo + 1) + ' keys';
  buildPiano();
}

rangeLow.addEventListener('input', updateRange);
rangeHigh.addEventListener('input', updateRange);
