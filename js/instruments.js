// -------------------------------------------------------
//  Build instrument select
// -------------------------------------------------------
const instSel = document.getElementById('inst-sel');
INSTRUMENTS.forEach(inst => {
  const opt = document.createElement('option');
  opt.value = inst.id;
  opt.textContent = inst.label;
  if (inst.id === currentInst) opt.selected = true;
  instSel.appendChild(opt);
});
instSel.addEventListener('change', () => { currentInst = instSel.value; });



