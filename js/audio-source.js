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

const NOTE_LENGTHS = {
  organ: 1800,
  hammond: 1800,
  strings: 1800,
  violin: 1800,
  cello: 1800,
  choir: 1800,
  pad: 2200,
  guitar: 2400,
  harp: 2400,
};

const audioContext = new (window.AudioContext || window.webkitAudioContext)({
  sampleRate: 44100,
});

let synthesizer = null;
let setupPromise = null;
const releaseTimers = new Map();

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
    return synth;
  })().catch((error) => {
    setupPromise = null;
    const status = document.getElementById("last-note");
    if (status) status.textContent = `音源エラー: ${error.message}`;
    throw error;
  });

  return setupPromise;
}

async function playNote(midi) {
  await audioContext.resume();

  try {
    const synth = await setupSynthesizer();
    const instrument = window.getCurrentInstrument();
    const program = PROGRAMS[instrument] ?? PROGRAMS.piano;
    const timerKey = `${program}:${midi}`;

    if (releaseTimers.has(timerKey)) {
      clearTimeout(releaseTimers.get(timerKey));
      synth.noteOff(0, midi);
    }

    synth.programChange(0, program);
    synth.noteOn(0, midi, 100);

    const releaseTimer = setTimeout(() => {
      synth.noteOff(0, midi);
      releaseTimers.delete(timerKey);
    }, NOTE_LENGTHS[instrument] ?? 1400);

    releaseTimers.set(timerKey, releaseTimer);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

window.playNote = playNote;
window.resumeAudio = () => audioContext.resume();
