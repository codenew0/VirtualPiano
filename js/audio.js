// -------------------------------------------------------
//  Web Audio
// -------------------------------------------------------
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const masterComp = audioCtx.createDynamicsCompressor();
masterComp.threshold.value = -12;
masterComp.knee.value      = 8;
masterComp.ratio.value     = 4;
masterComp.attack.value    = 0.002;
masterComp.release.value   = 0.2;
masterComp.connect(audioCtx.destination);

function playNote(midi) {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const now  = audioCtx.currentTime;
  const freq = 440 * Math.pow(2, (midi - 69) / 12);
  const inst = currentInst;

  const mg = audioCtx.createGain();
  mg.connect(masterComp);

  // ---- helper: add one oscillator partial ----
  function addOsc(type, f, amp, detune, attackT, decayT, stopT) {
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type;
    o.frequency.value = f;
    o.detune.value = detune || 0;
    g.gain.setValueAtTime(amp, now);
    g.gain.setTargetAtTime(0.0001, now + attackT, decayT);
    o.connect(g); g.connect(mg);
    o.start(now); o.stop(now + stopT);
  }

  // ---- helper: noise burst ----
  function addNoise(ampVal, bpFreq, Q, dur) {
    const bufLen = Math.floor(audioCtx.sampleRate * dur);
    const buf    = audioCtx.createBuffer(1, bufLen, audioCtx.sampleRate);
    const data   = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
    const ns = audioCtx.createBufferSource(); ns.buffer = buf;
    const bp = audioCtx.createBiquadFilter(); bp.type = 'bandpass';
    bp.frequency.value = bpFreq; bp.Q.value = Q;
    const ng = audioCtx.createGain();
    ng.gain.setValueAtTime(ampVal, now);
    ng.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    ns.connect(bp); bp.connect(ng); ng.connect(masterComp);
    ns.start(now); ns.stop(now + dur + 0.005);
  }

  if (inst === 'piano') {
    const decay = 3.5 * Math.pow(0.94, midi - 48);
    mg.gain.setValueAtTime(0.001, now);
    mg.gain.linearRampToValueAtTime(0.55, now + 0.004);
    mg.gain.setTargetAtTime(0.0001, now + 0.004, decay * 0.33);
    const B = 0.00015 * Math.pow(2, (midi - 48) / 12);
    [[1,.70,0],[2,.30,2],[3,.18,-2],[4,.10,3],[5,.06,-3],[6,.04,4],[7,.025,-4],[8,.015,5]].forEach(([n,a,d]) => {
      const fp = freq * n * Math.sqrt(1 + B * n * n);
      addOsc('sine', fp, a, d, 0.004, decay * 0.3 / Math.pow(n, 0.7), decay * 2.5);
    });
    addNoise(0.06 * (1 - (midi-48)/80), Math.min(freq*3,4000), 0.8, 0.025);

  } else if (inst === 'epiano') {
    // Rhodes-ish: carrier + modulator FM-style via gain modulation
    const decay = 2.0 * Math.pow(0.96, midi - 48);
    mg.gain.setValueAtTime(0, now);
    mg.gain.linearRampToValueAtTime(0.5, now + 0.005);
    mg.gain.setTargetAtTime(0.0001, now + 0.005, decay * 0.35);
    [[1,.65,0],[2,.22,2],[3,.10,-1],[4,.04,3],[6,.015,4]].forEach(([n,a,d]) => {
      addOsc('sine', freq*n, a, d, 0.005, decay*0.35/Math.pow(n,.65), decay*3);
    });
    // metallic tine noise
    addNoise(0.04, freq * 4, 2, 0.015);

  } else if (inst === 'honky') {
    // Two slightly detuned pianos
    const decay = 2.8 * Math.pow(0.93, midi - 48);
    mg.gain.setValueAtTime(0.001, now);
    mg.gain.linearRampToValueAtTime(0.45, now + 0.004);
    mg.gain.setTargetAtTime(0.0001, now + 0.004, decay * 0.33);
    [-18, 18].forEach(detShift => {
      [[1,.60,0],[2,.25,2],[3,.14,-2],[4,.07,3]].forEach(([n,a,d]) => {
        addOsc('sine', freq*n, a, d + detShift, 0.004, decay*0.3/Math.pow(n,.7), decay*2);
      });
    });
    addNoise(0.07, Math.min(freq*3,3500), 0.7, 0.02);

  } else if (inst === 'organ') {
    // Pipe organ: slow attack, sustained
    const susTime = 2.5;
    mg.gain.setValueAtTime(0, now);
    mg.gain.linearRampToValueAtTime(0.5, now + 0.06);
    mg.gain.setTargetAtTime(0.0001, now + 0.06, susTime * 0.5);
    [[1,.8,0],[2,.45,0],[3,.30,0],[4,.20,0],[6,.08,0],[8,.05,0]].forEach(([n,a,d]) => {
      addOsc('sine', freq*n, a, d, 0.06, susTime*0.5, susTime*4);
    });
    // pipe wind breath
    addNoise(0.015, freq*2, 0.5, 0.08);

  } else if (inst === 'hammond') {
    // Hammond tonewheel: fast attack, held drawbars
    const susTime = 2.0;
    mg.gain.setValueAtTime(0.48, now);
    mg.gain.setTargetAtTime(0.0001, now + 0.06, susTime * 0.4);
    [[1,.85,0],[2,.60,1],[3,.40,-1],[4,.20,0],[6,.10,2],[8,.06,-2],[16,.03,1]].forEach(([n,a,d]) => {
      addOsc('sine', freq*n, a, d + (Math.random()-0.5), 0.006, susTime*0.35, susTime*3);
    });
    // rotary effect: slow LFO on a side osc
    const rotHz = 6.0;
    const rotO  = audioCtx.createOscillator();
    const rotG  = audioCtx.createGain();
    rotO.frequency.value = rotHz;
    rotG.gain.value = 0.04;
    rotO.connect(rotG); rotG.connect(mg);
    rotO.start(now); rotO.stop(now + susTime * 2.5);

  } else if (inst === 'strings') {
    const rise = 0.18;
    const decay = 2.5;
    mg.gain.setValueAtTime(0, now);
    mg.gain.linearRampToValueAtTime(0.42, now + rise);
    mg.gain.setTargetAtTime(0.0001, now + rise, decay * 0.6);
    const lp = audioCtx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = freq * 5; lp.Q.value = 0.4;
    lp.connect(mg);
    [-10, -4, 4, 10].forEach(det => {
      const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
      o.type = 'sawtooth'; o.frequency.value = freq; o.detune.value = det;
      g.gain.setValueAtTime(0.25, now);
      g.gain.setTargetAtTime(0.0001, now + rise, decay * 0.6);
      o.connect(g); g.connect(lp);
      o.start(now); o.stop(now + (rise + decay) * 2.5);
    });

  } else if (inst === 'choir') {
    const rise = 0.22;
    const decay = 2.0;
    mg.gain.setValueAtTime(0, now);
    mg.gain.linearRampToValueAtTime(0.45, now + rise);
    mg.gain.setTargetAtTime(0.0001, now + rise, decay * 0.5);
    // vowel formants (simplified)
    const formants = [800, 1200, 2600];
    formants.forEach((fmFreq, fi) => {
      const bp = audioCtx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = fmFreq; bp.Q.value = 5;
      bp.connect(mg);
      [-8, 0, 8].forEach(det => {
        const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
        o.type = 'sawtooth'; o.frequency.value = freq; o.detune.value = det;
        g.gain.value = 0.3 / (fi + 1);
        o.connect(g); g.connect(bp);
        o.start(now); o.stop(now + (rise + decay) * 3);
      });
    });

  } else if (inst === 'marimba') {
    const decay = 1.0 * Math.pow(0.97, midi - 48);
    mg.gain.setValueAtTime(0, now);
    mg.gain.linearRampToValueAtTime(0.65, now + 0.003);
    mg.gain.setTargetAtTime(0.0001, now + 0.003, decay * 0.22);
    [[1,.90,0],[4,.28,2],[10,.06,-2]].forEach(([n,a,d]) => {
      addOsc('sine', freq*n, a, d, 0.003, decay*0.22/Math.pow(n,.5), decay*3);
    });
    addNoise(0.05, freq*3, 1.5, 0.01);

  } else if (inst === 'vibes') {
    // Vibraphone: slightly longer decay, metallic shimmer
    const decay = 1.8 * Math.pow(0.97, midi - 48);
    mg.gain.setValueAtTime(0, now);
    mg.gain.linearRampToValueAtTime(0.55, now + 0.004);
    mg.gain.setTargetAtTime(0.0001, now + 0.004, decay * 0.28);
    [[1,.80,0],[3.93,.30,3],[10.2,.06,-2]].forEach(([n,a,d]) => {
      addOsc('sine', freq*n, a, d, 0.004, decay*0.28/Math.pow(n,.5), decay*3.5);
    });
    // tremolo motor LFO
    const lfoO = audioCtx.createOscillator(); const lfoG = audioCtx.createGain();
    lfoO.frequency.value = 6.5; lfoG.gain.value = 0.03;
    lfoO.connect(lfoG); lfoG.connect(mg);
    lfoO.start(now); lfoO.stop(now + decay*3);

  } else if (inst === 'xylophone') {
    const decay = 0.55 * Math.pow(0.96, midi - 48);
    mg.gain.setValueAtTime(0, now);
    mg.gain.linearRampToValueAtTime(0.70, now + 0.002);
    mg.gain.setTargetAtTime(0.0001, now + 0.002, decay * 0.2);
    [[1,.85,0],[3.0,.20,1],[6.0,.05,-1]].forEach(([n,a,d]) => {
      addOsc('sine', freq*n, a, d, 0.002, decay*0.2/n, decay*2.5);
    });
    addNoise(0.06, freq*5, 2, 0.008);

  } else if (inst === 'celesta') {
    const decay = 1.4 * Math.pow(0.96, midi - 48);
    mg.gain.setValueAtTime(0, now);
    mg.gain.linearRampToValueAtTime(0.50, now + 0.003);
    mg.gain.setTargetAtTime(0.0001, now + 0.003, decay * 0.25);
    [[1,.75,0],[2,.30,1],[5.4,.12,-2],[8.9,.04,2]].forEach(([n,a,d]) => {
      addOsc('sine', freq*n, a, d, 0.003, decay*0.25/Math.pow(n,.6), decay*3);
    });
    addNoise(0.03, freq*6, 3, 0.006);

  } else if (inst === 'harp') {
    const decay = 2.5 * Math.pow(0.96, midi - 48);
    mg.gain.setValueAtTime(0, now);
    mg.gain.linearRampToValueAtTime(0.55, now + 0.005);
    mg.gain.setTargetAtTime(0.0001, now + 0.005, decay * 0.28);
    [[1,.70,0],[2,.32,1],[3,.16,-1],[4,.08,2],[6,.03,-2]].forEach(([n,a,d]) => {
      addOsc('sine', freq*n, a, d, 0.005, decay*0.28/Math.pow(n,.7), decay*2.5);
    });
    addNoise(0.04, Math.min(freq*4,5000), 1.2, 0.012);

  } else if (inst === 'guitar') {
    // Plucked string with Karplus-Strong-ish character
    const decay = 1.6 * Math.pow(0.97, midi - 48);
    mg.gain.setValueAtTime(0, now);
    mg.gain.linearRampToValueAtTime(0.55, now + 0.004);
    mg.gain.setTargetAtTime(0.0001, now + 0.004, decay * 0.30);
    [[1,.70,0],[2,.28,-2],[3,.16,2],[4,.08,-3],[5,.04,3],[6,.02,-4]].forEach(([n,a,d]) => {
      addOsc('sine', freq*n, a, d, 0.004, decay*0.30/Math.pow(n,.8), decay*2.2);
    });
    addNoise(0.07, Math.min(freq*3,4500), 1.0, 0.018);

  } else if (inst === 'bass') {
    const decay = 2.2 * Math.pow(0.97, midi - 36);
    mg.gain.setValueAtTime(0, now);
    mg.gain.linearRampToValueAtTime(0.75, now + 0.005);
    mg.gain.setTargetAtTime(0.0001, now + 0.005, decay * 0.32);
    [[1,.80,0],[2,.35,1],[3,.18,-1],[4,.08,2]].forEach(([n,a,d]) => {
      addOsc(n===1?'triangle':'sine', freq*n, a, d, 0.005, decay*0.32/n, decay*2.5);
    });

  } else if (inst === 'synth') {
    const decay = 1.2;
    mg.gain.setValueAtTime(0, now);
    mg.gain.linearRampToValueAtTime(0.42, now + 0.008);
    mg.gain.setTargetAtTime(0.0001, now + 0.008, decay * 0.4);
    const lp = audioCtx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 2800; lp.Q.value = 3.5;
    lp.connect(mg);
    [['sawtooth',-8],['sawtooth',8],['square',0]].forEach(([t,det]) => {
      const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
      o.type = t; o.frequency.value = freq; o.detune.value = det;
      g.gain.value = 0.35;
      g.gain.setTargetAtTime(0.0001, now + 0.008, decay * 0.4);
      o.connect(g); g.connect(lp); o.start(now); o.stop(now + decay * 3.5);
    });

  } else if (inst === 'pad') {
    const rise = 0.3;
    const decay = 3.5;
    mg.gain.setValueAtTime(0, now);
    mg.gain.linearRampToValueAtTime(0.38, now + rise);
    mg.gain.setTargetAtTime(0.0001, now + rise, decay * 0.6);
    const lp = audioCtx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = freq * 4; lp.Q.value = 0.6;
    lp.connect(mg);
    [-14,-7,0,7,14].forEach(det => {
      const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
      o.type = 'sawtooth'; o.frequency.value = freq; o.detune.value = det;
      g.gain.value = 0.22;
      g.gain.setTargetAtTime(0.0001, now + rise, decay * 0.55);
      o.connect(g); g.connect(lp); o.start(now); o.stop(now + (rise+decay)*2.5);
    });

  } else if (inst === 'bells') {
    const decay = 3.0 * Math.pow(0.96, midi - 48);
    mg.gain.setValueAtTime(0, now);
    mg.gain.linearRampToValueAtTime(0.55, now + 0.003);
    mg.gain.setTargetAtTime(0.0001, now + 0.003, decay * 0.25);
    // Inharmonic bell partials
    [[1,.70,0],[2.756,.30,2],[5.404,.12,-2],[8.933,.05,3],[13.35,.02,-3]].forEach(([n,a,d]) => {
      addOsc('sine', freq*n, a, d, 0.003, decay*0.25/Math.pow(n,.5), decay*3.5);
    });
    addNoise(0.04, freq*8, 3, 0.008);

  } else if (inst === 'flute') {
    const rise = 0.04;
    const decay = 2.0;
    mg.gain.setValueAtTime(0, now);
    mg.gain.linearRampToValueAtTime(0.40, now + rise);
    mg.gain.setTargetAtTime(0.0001, now + rise, decay * 0.55);
    [[1,.80,0],[2,.22,1],[3,.08,-1],[4,.03,2]].forEach(([n,a,d]) => {
      addOsc('sine', freq*n, a, d, rise, decay*0.55/Math.pow(n,.7), (rise+decay)*2.5);
    });
    // breath noise
    addNoise(0.018, freq*2, 0.4, rise + 0.06);

  } else if (inst === 'oboe') {
    const rise = 0.03;
    const decay = 1.8;
    mg.gain.setValueAtTime(0, now);
    mg.gain.linearRampToValueAtTime(0.42, now + rise);
    mg.gain.setTargetAtTime(0.0001, now + rise, decay * 0.5);
    // oboe has strong odd harmonics
    [[1,.65,0],[2,.30,1],[3,.45,-1],[4,.25,2],[5,.14,-2],[6,.08,3],[7,.04,-3],[8,.02,4]].forEach(([n,a,d]) => {
      addOsc('sine', freq*n, a, d, rise, decay*0.5/Math.pow(n,.6), (rise+decay)*2.5);
    });
    addNoise(0.012, freq*3, 0.6, rise + 0.04);

  } else if (inst === 'brass') {
    const rise = 0.025;
    const decay = 1.5;
    mg.gain.setValueAtTime(0, now);
    mg.gain.linearRampToValueAtTime(0.50, now + rise);
    mg.gain.setTargetAtTime(0.0001, now + rise, decay * 0.45);
    // trumpet-ish: even harmonics prominent
    const hp = audioCtx.createBiquadFilter();
    hp.type = 'peaking'; hp.frequency.value = freq * 3; hp.Q.value = 1; hp.gain.value = 4;
    hp.connect(mg);
    [[1,.60,0],[2,.40,1],[3,.35,-1],[4,.28,2],[5,.18,-2],[6,.10,3],[7,.05,-3],[8,.02,4]].forEach(([n,a,d]) => {
      const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
      o.type = 'sine'; o.frequency.value = freq*n; o.detune.value = d;
      g.gain.setValueAtTime(a, now);
      g.gain.setTargetAtTime(0.0001, now + rise, decay*0.45/Math.pow(n,.6));
      o.connect(g); g.connect(hp);
      o.start(now); o.stop(now + (rise+decay)*2.5);
    });
    addNoise(0.02, freq*4, 0.8, 0.03);

  } else if (inst === 'violin') {
    const rise = 0.08, decay = 2.2;
    mg.gain.setValueAtTime(0, now);
    mg.gain.linearRampToValueAtTime(0.44, now + rise);
    mg.gain.setTargetAtTime(0.0001, now + rise, decay * 0.55);
    const lpV = audioCtx.createBiquadFilter();
    lpV.type = 'lowpass'; lpV.frequency.value = freq * 8; lpV.Q.value = 0.5;
    lpV.connect(mg);
    [[1,.70,0],[2,.50,1],[3,.38,-1],[4,.26,2],[5,.16,-2],[6,.09,3],[7,.04,-3],[8,.02,4]].forEach(([n,a,d]) => {
      const o = audioCtx.createOscillator(); const gv = audioCtx.createGain();
      o.type = 'sawtooth'; o.frequency.value = freq*n; o.detune.value = d;
      gv.gain.setValueAtTime(a*0.28, now);
      gv.gain.setTargetAtTime(0.0001, now+rise, decay*0.55/Math.pow(n,0.5));
      o.connect(gv); gv.connect(lpV); o.start(now); o.stop(now+(rise+decay)*2.5);
    });
    const vibV = audioCtx.createOscillator(); const vibVG = audioCtx.createGain();
    vibV.frequency.value = 5.5; vibVG.gain.value = 5;
    vibV.connect(vibVG);
    [1,2,3].forEach(n => {
      const o = audioCtx.createOscillator(); const gv = audioCtx.createGain();
      o.type = 'sine'; o.frequency.value = freq*n; gv.gain.value = 0.10/n;
      vibVG.connect(o.frequency);
      o.connect(gv); gv.connect(lpV); o.start(now); o.stop(now+(rise+decay)*2.5);
    });
    vibV.start(now); vibV.stop(now+(rise+decay)*2.5);

  } else if (inst === 'cello') {
    const rise = 0.12, decay = 2.8;
    mg.gain.setValueAtTime(0, now);
    mg.gain.linearRampToValueAtTime(0.50, now + rise);
    mg.gain.setTargetAtTime(0.0001, now + rise, decay * 0.6);
    const lpC = audioCtx.createBiquadFilter();
    lpC.type = 'lowpass'; lpC.frequency.value = freq * 5; lpC.Q.value = 0.4;
    lpC.connect(mg);
    [[1,.80,0],[2,.55,1],[3,.38,-1],[4,.22,2],[5,.12,-2],[6,.06,3],[7,.03,-3]].forEach(([n,a,d]) => {
      const o = audioCtx.createOscillator(); const gc = audioCtx.createGain();
      o.type = 'sawtooth'; o.frequency.value = freq*n; o.detune.value = d;
      gc.gain.setValueAtTime(a*0.30, now);
      gc.gain.setTargetAtTime(0.0001, now+rise, decay*0.6/Math.pow(n,0.45));
      o.connect(gc); gc.connect(lpC); o.start(now); o.stop(now+(rise+decay)*2.5);
    });
    const vibC = audioCtx.createOscillator(); const vibCG = audioCtx.createGain();
    vibC.frequency.value = 4.8; vibCG.gain.value = 4;
    vibC.connect(vibCG);
    [1,2].forEach(n => {
      const o = audioCtx.createOscillator(); const gc = audioCtx.createGain();
      o.type = 'sine'; o.frequency.value = freq*n; gc.gain.value = 0.13/n;
      vibCG.connect(o.frequency);
      o.connect(gc); gc.connect(lpC); o.start(now); o.stop(now+(rise+decay)*2.5);
    });
    vibC.start(now); vibC.stop(now+(rise+decay)*2.5);

  } else if (inst === 'clarinet') {
    const rise = 0.025, decay = 2.0;
    mg.gain.setValueAtTime(0, now);
    mg.gain.linearRampToValueAtTime(0.44, now + rise);
    mg.gain.setTargetAtTime(0.0001, now + rise, decay * 0.5);
    [[1,.75,0],[2,.08,1],[3,.50,-1],[4,.06,2],[5,.28,-2],[6,.04,3],[7,.14,-3],[8,.02,4],[9,.06,4]].forEach(([n,a,d]) => {
      addOsc('sine', freq*n, a, d, rise, decay*0.5/Math.pow(n,.6), (rise+decay)*2.5);
    });
    addNoise(0.010, freq*3, 0.5, rise+0.03);

  } else if (inst === 'saxophone') {
    const rise = 0.022, decay = 1.9;
    mg.gain.setValueAtTime(0, now);
    mg.gain.linearRampToValueAtTime(0.48, now + rise);
    mg.gain.setTargetAtTime(0.0001, now + rise, decay * 0.48);
    const pkS = audioCtx.createBiquadFilter();
    pkS.type = 'peaking'; pkS.frequency.value = freq*2.5; pkS.Q.value = 1.2; pkS.gain.value = 5;
    pkS.connect(mg);
    [[1,.62,0],[2,.45,1],[3,.38,-1],[4,.28,2],[5,.18,-2],[6,.10,3],[7,.06,-3],[8,.03,4]].forEach(([n,a,d]) => {
      const o = audioCtx.createOscillator(); const gs = audioCtx.createGain();
      o.type = 'sine'; o.frequency.value = freq*n; o.detune.value = d;
      gs.gain.setValueAtTime(a, now);
      gs.gain.setTargetAtTime(0.0001, now+rise, decay*0.48/Math.pow(n,.6));
      o.connect(gs); gs.connect(pkS); o.start(now); o.stop(now+(rise+decay)*2.5);
    });
    addNoise(0.022, freq*2.5, 0.7, rise+0.05);

  } else if (inst === 'trumpet') {
    const rise = 0.012, decay = 1.6;
    mg.gain.setValueAtTime(0, now);
    mg.gain.linearRampToValueAtTime(0.50, now + rise);
    mg.gain.setTargetAtTime(0.0001, now + rise, decay * 0.44);
    const pkT = audioCtx.createBiquadFilter();
    pkT.type = 'peaking'; pkT.frequency.value = freq*4; pkT.Q.value = 1.5; pkT.gain.value = 6;
    pkT.connect(mg);
    [[1,.55,0],[2,.50,1],[3,.45,-1],[4,.38,2],[5,.28,-2],[6,.18,3],[7,.10,-3],[8,.05,4],[9,.02,-4]].forEach(([n,a,d]) => {
      const o = audioCtx.createOscillator(); const gt = audioCtx.createGain();
      o.type = 'sine'; o.frequency.value = freq*n; o.detune.value = d;
      gt.gain.setValueAtTime(a, now);
      gt.gain.setTargetAtTime(0.0001, now+rise, decay*0.44/Math.pow(n,.55));
      o.connect(gt); gt.connect(pkT); o.start(now); o.stop(now+(rise+decay)*2.5);
    });
    addNoise(0.018, freq*5, 1.0, 0.02);

  } else if (inst === 'trombone') {
    const rise = 0.03, decay = 1.8;
    mg.gain.setValueAtTime(0, now);
    mg.gain.linearRampToValueAtTime(0.52, now + rise);
    mg.gain.setTargetAtTime(0.0001, now + rise, decay * 0.48);
    const lpTb = audioCtx.createBiquadFilter();
    lpTb.type = 'lowpass'; lpTb.frequency.value = freq*6; lpTb.Q.value = 0.6;
    lpTb.connect(mg);
    [[1,.72,0],[2,.52,1],[3,.38,-1],[4,.24,2],[5,.14,-2],[6,.08,3],[7,.04,-3]].forEach(([n,a,d]) => {
      const o = audioCtx.createOscillator(); const gtb = audioCtx.createGain();
      o.type = 'sine'; o.frequency.value = freq*n; o.detune.value = d;
      gtb.gain.setValueAtTime(a, now);
      gtb.gain.setTargetAtTime(0.0001, now+rise, decay*0.48/Math.pow(n,.6));
      o.connect(gtb); gtb.connect(lpTb); o.start(now); o.stop(now+(rise+decay)*2.5);
    });
    addNoise(0.015, freq*3, 0.7, 0.03);

  } else if (inst === 'tuba') {
    const rise = 0.04, decay = 2.2;
    mg.gain.setValueAtTime(0, now);
    mg.gain.linearRampToValueAtTime(0.60, now + rise);
    mg.gain.setTargetAtTime(0.0001, now + rise, decay * 0.52);
    const lpTu = audioCtx.createBiquadFilter();
    lpTu.type = 'lowpass'; lpTu.frequency.value = freq*4; lpTu.Q.value = 0.4;
    lpTu.connect(mg);
    [[1,.85,0],[2,.45,1],[3,.25,-1],[4,.12,2],[5,.06,-2],[6,.03,3]].forEach(([n,a,d]) => {
      const o = audioCtx.createOscillator(); const gtu = audioCtx.createGain();
      o.type = n===1?'triangle':'sine'; o.frequency.value = freq*n; o.detune.value = d;
      gtu.gain.setValueAtTime(a, now);
      gtu.gain.setTargetAtTime(0.0001, now+rise, decay*0.52/Math.pow(n,.6));
      o.connect(gtu); gtu.connect(lpTu); o.start(now); o.stop(now+(rise+decay)*2.5);
    });
    addNoise(0.012, freq*2, 0.6, 0.04);

  } else if (inst === 'accordion') {
    const rise = 0.04, decay = 2.5;
    mg.gain.setValueAtTime(0, now);
    mg.gain.linearRampToValueAtTime(0.44, now + rise);
    mg.gain.setTargetAtTime(0.0001, now + rise, decay * 0.55);
    const lpA = audioCtx.createBiquadFilter();
    lpA.type = 'lowpass'; lpA.frequency.value = freq*5; lpA.Q.value = 0.5;
    lpA.connect(mg);
    [-10,0,10].forEach(det => {
      [[1,.65,0],[2,.30,1],[3,.22,-1],[4,.12,2],[5,.06,-2],[6,.03,3]].forEach(([n,a,d]) => {
        const o = audioCtx.createOscillator(); const ga = audioCtx.createGain();
        o.type = 'sawtooth'; o.frequency.value = freq*n; o.detune.value = d+det;
        ga.gain.setValueAtTime(a*0.38, now);
        ga.gain.setTargetAtTime(0.0001, now+rise, decay*0.55/Math.pow(n,.6));
        o.connect(ga); ga.connect(lpA); o.start(now); o.stop(now+(rise+decay)*2.5);
      });
    });

  } else if (inst === 'harmonica') {
    const rise = 0.018, decay = 1.8;
    mg.gain.setValueAtTime(0, now);
    mg.gain.linearRampToValueAtTime(0.46, now + rise);
    mg.gain.setTargetAtTime(0.0001, now + rise, decay * 0.5);
    const pkH = audioCtx.createBiquadFilter();
    pkH.type = 'peaking'; pkH.frequency.value = 1800; pkH.Q.value = 1.5; pkH.gain.value = 4;
    pkH.connect(mg);
    [[1,.68,0],[2,.20,1],[3,.42,-1],[4,.14,2],[5,.22,-2],[6,.08,3],[7,.10,-3]].forEach(([n,a,d]) => {
      const o = audioCtx.createOscillator(); const gh = audioCtx.createGain();
      o.type = 'sawtooth'; o.frequency.value = freq*n; o.detune.value = d;
      gh.gain.setValueAtTime(a*0.32, now);
      gh.gain.setTargetAtTime(0.0001, now+rise, decay*0.5/Math.pow(n,.65));
      o.connect(gh); gh.connect(pkH); o.start(now); o.stop(now+(rise+decay)*2.5);
    });
    addNoise(0.014, freq*2, 0.6, rise+0.04);
  }
}



