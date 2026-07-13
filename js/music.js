// -------------------------------------------------------
//  Key mapping
// -------------------------------------------------------
const KEY_MAP = {
  48:'1', 49:'2', 50:'3', 51:'4', 52:'5', 53:'6', 54:'7',
  55:'8', 56:'9', 57:'0', 58:'q', 59:'w',
  60:'e', 61:'r', 62:'t', 63:'y', 64:'u', 65:'i', 66:'o',
  67:'p', 68:'a', 69:'s', 70:'d', 71:'f',
  72:'g', 73:'h', 74:'j', 75:'k', 76:'l', 77:'z', 78:'x',
  79:'c', 80:'v', 81:'b', 82:'n', 83:'m', 84:','
};
const CHAR_MAP = {};
for (const [midi, ch] of Object.entries(KEY_MAP)) CHAR_MAP[ch] = Number(midi);

const PHYSICAL_CODES = [
  'Digit1','Digit2','Digit3','Digit4','Digit5','Digit6','Digit7','Digit8','Digit9','Digit0',
  'KeyQ','KeyW','KeyE','KeyR','KeyT','KeyY','KeyU','KeyI','KeyO','KeyP',
  'KeyA','KeyS','KeyD','KeyF','KeyG','KeyH','KeyJ','KeyK','KeyL',
  'KeyZ','KeyX','KeyC','KeyV','KeyB','KeyN','KeyM','Comma'
];

const LOW_CODE_MAP = {};
const HIGH_CODE_MAP = {};
const LOW_LABEL_MAP = {};
const HIGH_LABEL_MAP = {};
const LOW_LABELS = [
  '!','"','#','$','%','&',"'",'(',')','⇧0',
  '⇧Q','⇧W','⇧E','⇧R','⇧T','⇧Y','⇧U','⇧I','⇧O','⇧P',
  '⇧A','⇧S','⇧D','⇧F','⇧G','⇧H','⇧J'
];

PHYSICAL_CODES.slice(0, 27).forEach((code, index) => {
  const midi = 21 + index;
  LOW_CODE_MAP[code] = midi;
  LOW_LABEL_MAP[midi] = LOW_LABELS[index];
});

PHYSICAL_CODES.slice(12, 36).forEach((code, index) => {
  const midi = 85 + index;
  HIGH_CODE_MAP[code] = midi;
  HIGH_LABEL_MAP[midi] = 'Sp+' + code.replace('Key', '');
});

function midiForKeyboardEvent(event, spaceModifier = false) {
  if (event.altKey || event.metaKey) return null;
  if (spaceModifier && !event.ctrlKey && !event.shiftKey) {
    return HIGH_CODE_MAP[event.code] ?? null;
  }
  if (event.shiftKey && !event.ctrlKey) return LOW_CODE_MAP[event.code] ?? null;
  if (!spaceModifier && !event.ctrlKey && !event.shiftKey) {
    return CHAR_MAP[event.key.toLowerCase()] ?? null;
  }
  return null;
}

function shortcutLabel(midi) {
  return KEY_MAP[midi]?.toUpperCase() || LOW_LABEL_MAP[midi] || HIGH_LABEL_MAP[midi] || '';
}

const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
function noteName(midi) {
  return NOTE_NAMES[midi % 12] + (Math.floor(midi / 12) - 1);
}
function isBlack(midi) { return [1,3,6,8,10].includes(midi % 12); }

// -------------------------------------------------------
//  Instruments definition
// -------------------------------------------------------
const INSTRUMENTS = [
  { id:'piano',     label:'Grand Piano'    },
  { id:'epiano',    label:'Electric Piano 1' },
  { id:'epiano2',   label:'Electric Piano 2 (FM)' },
  { id:'honky',     label:'Honky-tonk'     },
  { id:'organ',     label:'Pipe Organ'     },
  { id:'hammond',   label:'Hammond'        },
  { id:'accordion', label:'Accordion'      },
  { id:'harmonica', label:'Harmonica'      },
  { id:'strings',   label:'Strings'        },
  { id:'violin',    label:'Violin'         },
  { id:'cello',     label:'Cello'          },
  { id:'choir',     label:'Choir'          },
  { id:'marimba',   label:'Marimba'        },
  { id:'vibes',     label:'Vibraphone'     },
  { id:'xylophone', label:'Xylophone'      },
  { id:'celesta',   label:'Celesta'        },
  { id:'harp',      label:'Harp'           },
  { id:'guitar',    label:'Guitar'         },
  { id:'bass',      label:'Electric Bass'  },
  { id:'synth',     label:'Synth Lead'     },
  { id:'pad',       label:'Synth Pad'      },
  { id:'bells',     label:'Bells'          },
  { id:'flute',     label:'Flute'          },
  { id:'clarinet',  label:'Clarinet'       },
  { id:'oboe',      label:'Oboe'           },
  { id:'saxophone', label:'Saxophone'      },
  { id:'trumpet',   label:'Trumpet'        },
  { id:'trombone',  label:'Trombone'       },
  { id:'tuba',      label:'Tuba'           },
  { id:'brass',     label:'Brass Section'  },
];

let currentInst = 'piano';
