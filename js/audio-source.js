import { WorkletSynthesizer } from "spessasynth_lib";

const SOUNDFONT_URL =
  "https://cdn.jsdelivr.net/gh/ryohey/signal@4569a31/public/A320U.sf2";

// General MIDI program numbers used by Signal's factory SoundFont.
const PROGRAMS = {
  piano: 0,
  epiano: 4,
  honky: 3,
  organ: 19,
  hammond: 16,
  accordion: 21,
  harmonica: 22,
  strings: 48,
  violin: 40,
  cello: 42,
  choir: 52,
  marimba: 12,
  vibes: 11,
  xylophone: 13,
  celesta: 8,
  harp: 46,
  guitar: 24,
  bass: 33,
  synth: 80,
  pad: 88,
  bells: 14,
  flute: 73,
  clarinet: 71,
  oboe: 68,
  saxophone: 65,
  trumpet: 56,
  trombone: 57,
  tuba: 58,
  brass: 61,
};

const audioContext = new (window.AudioContext || window.webkitAudioContext)({
  sampleRate: 44100,
});

let synthesizer = null;
let setupPromise = null;
const requestedNotes = new Set();
const activeNotes = new Set();

async function setupSynthesizer() {
  if (synthesizer) return synthesizer;
  if (setupPromise) return setupPromise;

  setupPromise = (async () => {
    const status = document.getElementById("last-note");
    if (status) status.textContent = "音源を読み込んでいます…";

    await audioContext.audioWorklet.addModule(
      new URL("./js/worklets/spessasynth_processor.min.js", document.baseURI),
    );

    const response = await fetch(SOUNDFONT_URL);
    if (!response.ok) {
      throw new Error(`SoundFontの取得に失敗しました (${response.status})`);
    }

    const soundFont = await response.arrayBuffer();
    const synth = new WorkletSynthesizer(audioContext);
    synth.connect(audioContext.destination);
    await synth.soundBankManager.addSoundBank(soundFont, "signal-factory");
    await synth.isReady;
    synthesizer = synth;
    if (status) status.textContent = "音源の準備ができました";
    return synth;
  })().catch((error) => {
    setupPromise = null;
    const status = document.getElementById("last-note");
    if (status) status.textContent = `音源エラー: ${error.message}`;
    throw error;
  });

  return setupPromise;
}

async function startNote(midi) {
  requestedNotes.add(midi);
  await audioContext.resume();

  try {
    const synth = await setupSynthesizer();
    if (!requestedNotes.has(midi)) return false;

    const instrument = window.getCurrentInstrument();
    const program = PROGRAMS[instrument] ?? PROGRAMS.piano;

    if (activeNotes.has(midi)) {
      synth.noteOff(0, midi);
    }

    synth.programChange(0, program);
    synth.noteOn(0, midi, 100);
    activeNotes.add(midi);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

function stopNote(midi) {
  requestedNotes.delete(midi);
  if (!synthesizer || !activeNotes.has(midi)) return;

  synthesizer.noteOff(0, midi);
  activeNotes.delete(midi);
}

window.startNote = startNote;
window.stopNote = stopNote;
window.resumeAudio = () => audioContext.resume();

// Download the SoundFont early so the first played note has minimal delay.
setupSynthesizer().catch(() => {});
