// -------------------------------------------------------
//  Init
// -------------------------------------------------------
lvEl.textContent  = noteName(Number(rangeLow.value));
hvEl.textContent  = noteName(Number(rangeHigh.value));
kcEl.textContent  = (Number(rangeHigh.value) - Number(rangeLow.value) + 1) + ' keys';
buildPiano();



