#!/usr/bin/env node
/* =============================================================================
   BANDE-SON — Pilotaction demo video (76 s, 44.1 kHz stéréo)
   Tout est synthétisé en code (déterministe) et aligné sur la timeline du
   studio : SFX (clics, whooshs, pops, chimes) + musique minimaliste
   (pads doux + plucks pentatoniques, ~88 BPM, style épuré).

   Usage : node audio.js            → soundtrack.wav
============================================================================= */
"use strict";
const fs = require("fs");
const path = require("path");

const SR = 44100;
const DUR = 76.0;
const N = Math.round(SR * DUR);
const L = new Float64Array(N);
const R = new Float64Array(N);

const TAU = Math.PI * 2;
const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;
const midi = m => 440 * Math.pow(2, (m - 69) / 12);

/* ---------- écriture stéréo avec pan (-1..1) ---------- */
function add(i, s, pan = 0) {
  if (i < 0 || i >= N) return;
  const pl = Math.min(1, 1 - pan), pr = Math.min(1, 1 + pan);
  L[i] += s * pl; R[i] += s * pr;
}

/* ============================ GÉNÉRATEURS ============================ */
function pluck(t0, freq, { dur = 1.3, gain = 0.06, pan = 0, bright = 1 } = {}) {
  const n0 = Math.round(t0 * SR), nd = Math.round(dur * SR);
  for (let n = 0; n < nd; n++) {
    const t = n / SR;
    const atk = Math.min(1, t / 0.004);
    const e1 = Math.exp(-t * 4.2 / dur), e2 = Math.exp(-t * 9 / dur), e3 = Math.exp(-t * 14 / dur);
    const s = (Math.sin(TAU * freq * t) * e1
             + 0.42 * bright * Math.sin(TAU * freq * 2 * t) * e2
             + 0.16 * bright * Math.sin(TAU * freq * 3 * t) * e3) * atk * gain;
    add(n0 + n, s, pan);
  }
}

function pad(t0, freq, { dur = 8, gain = 0.03, pan = 0, detune = 1 } = {}) {
  const n0 = Math.round(t0 * SR), nd = Math.round(dur * SR);
  const fL = freq * (1 - 0.0007 * detune), fR = freq * (1 + 0.0007 * detune);
  const rel = 1.6, atk = 1.0;
  for (let n = 0; n < nd; n++) {
    const t = n / SR;
    let env = Math.min(1, t / atk);
    const tr = dur - t;
    if (tr < rel) env *= clamp01(tr / rel);
    env = env * env * (3 - 2 * env); // smooth
    const wob = 1 + 0.07 * Math.sin(TAU * 0.13 * t + freq);
    const sl = (Math.sin(TAU * fL * t) + 0.22 * Math.sin(TAU * fL * 2 * t)) * env * wob * gain;
    const sr = (Math.sin(TAU * fR * t) + 0.22 * Math.sin(TAU * fR * 2 * t)) * env * wob * gain;
    const i = n0 + n;
    if (i >= 0 && i < N) { L[i] += sl * (1 - pan * .5); R[i] += sr * (1 + pan * .5); }
  }
}

/* bruit déterministe (LCG) */
let seed = 1234567;
function rnd() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 * 2 - 1; }

function whoosh(t0, { dur = 0.62, gain = 0.16, dir = 1, pan = 0 } = {}) {
  const n0 = Math.round(t0 * SR), nd = Math.round(dur * SR);
  let lp = 0, hp = 0, px = 0;
  for (let n = 0; n < nd; n++) {
    const p = n / nd;
    // enveloppe en cloche adoucie
    const env = Math.pow(Math.sin(Math.PI * p), 1.6);
    // cutoff qui glisse (montée puis retombée, inversé si dir<0)
    const sweep = dir > 0 ? p : 1 - p;
    const fc = 260 + 2400 * Math.pow(Math.sin(Math.PI * Math.min(sweep * 1.15, 1)), 1.4);
    const a = 1 - Math.exp(-TAU * fc / SR);
    const x = rnd() * 0.6 + (rnd() + rnd()) * 0.2;
    lp += a * (x - lp);
    // passe-haut ~180Hz pour enlever le grondement
    const ah = 1 - Math.exp(-TAU * 180 / SR);
    hp += ah * (lp - hp);
    const s = (lp - hp * 0.9) * env * gain;
    add(n0 + n, s, pan);
    px = x;
  }
}

function click(t0, { gain = 0.30, pan = 0 } = {}) {
  const n0 = Math.round(t0 * SR), nd = Math.round(0.030 * SR);
  let prev = 0;
  for (let n = 0; n < nd; n++) {
    const t = n / SR;
    const x = rnd();
    const hf = (x - prev); prev = x;         // bruit différencié (aigu)
    const e = Math.exp(-t / 0.0055);
    const body = Math.sin(TAU * 1850 * t) * Math.exp(-t / 0.0075);
    add(n0 + n, (hf * 0.5 + body * 0.55) * e * gain, pan);
  }
}

function pop(t0, { gain = 0.14, f0 = 540, pan = 0 } = {}) {
  const n0 = Math.round(t0 * SR), nd = Math.round(0.10 * SR);
  for (let n = 0; n < nd; n++) {
    const t = n / SR, p = n / nd;
    const f = f0 * (1 - 0.24 * p);
    const env = Math.min(1, t / 0.003) * Math.exp(-t / 0.028);
    add(n0 + n, Math.sin(TAU * f * t) * env * gain, pan);
  }
}

function tickLow(t0, { gain = 0.13, f = 235, pan = 0 } = {}) {
  const n0 = Math.round(t0 * SR), nd = Math.round(0.06 * SR);
  for (let n = 0; n < nd; n++) {
    const t = n / SR;
    const env = Math.min(1, t / 0.002) * Math.exp(-t / 0.016);
    add(n0 + n, Math.sin(TAU * f * t) * env * gain, pan);
  }
}

function ding(t0, { gain = 0.09, f = 1318, pan = 0 } = {}) {
  const n0 = Math.round(t0 * SR), nd = Math.round(0.7 * SR);
  for (let n = 0; n < nd; n++) {
    const t = n / SR;
    const env = Math.min(1, t / 0.002) * Math.exp(-t / 0.16);
    const s = (Math.sin(TAU * f * t) + 0.35 * Math.sin(TAU * f * 2.756 * t) * Math.exp(-t / 0.08)) * env * gain;
    add(n0 + n, s, pan);
  }
}

function boom(t0, { gain = 0.16 } = {}) {
  const n0 = Math.round(t0 * SR), nd = Math.round(1.6 * SR);
  for (let n = 0; n < nd; n++) {
    const t = n / SR, p = n / nd;
    const f = 58 * (1 - 0.16 * p);
    const env = Math.min(1, t / 0.09) * Math.exp(-t / 0.55);
    add(n0 + n, Math.sin(TAU * f * t) * env * gain, 0);
  }
}

function chimeSuccess(t0) {
  pluck(t0, midi(79), { gain: 0.055, dur: 0.9 });          // G5
  pluck(t0 + 0.10, midi(86), { gain: 0.05, dur: 1.1 });    // D6
}

/* ============================ SFX TIMELINE ============================ */
/* (timings en secondes, alignés sur studio.html) */

// Transitions de scènes (whooshs, sens alterné)
whoosh(5.50, { dir: 1 });
whoosh(24.00, { dir: -1, gain: 0.15 });
whoosh(28.50, { dir: 1 });
whoosh(52.00, { dir: 1, gain: 0.15 });
whoosh(61.00, { dir: -1, gain: 0.14 });
whoosh(69.00, { dir: 1, gain: 0.15 });

// Intro
pop(0.40, { gain: 0.10, f0: 480 });
pluck(1.70, midi(72), { gain: 0.035, dur: 1.4 });          // C5 discret sur le titre

// S1 Excel
click(7.60); click(11.50);
tickLow(8.42, { gain: 0.11 });                              // erreurs qui clignotent
whoosh(12.40, { dur: 0.34, gain: 0.10, dir: -1 });          // suppression (swipe court)
tickLow(12.92, { gain: 0.14, f: 180 });                     // …et le vide
pop(9.20, { gain: 0.11, f0: 430 });                         // cartons rouges
pop(13.10, { gain: 0.11, f0: 430 });
pop(16.10, { gain: 0.11, f0: 430 });
pop(15.30, { gain: 0.07, f0: 620, pan: -0.2 });             // fichiers fantômes
pop(15.56, { gain: 0.07, f0: 700, pan: 0 });
pop(15.82, { gain: 0.07, f0: 780, pan: 0.2 });
tickLow(19.72, { gain: 0.10 }); tickLow(20.17, { gain: 0.10 }); tickLow(20.62, { gain: 0.10 });

// S2 déclic
boom(25.60, { gain: 0.14 });

// S3 app
click(32.50); click(34.60); click(38.60); click(41.10); click(45.10); click(49.30);
whoosh(38.82, { dur: 0.30, gain: 0.09, dir: 1, pan: 0.35 });   // drawer s'ouvre
chimeSuccess(41.32);                                            // action clôturée
pop(36.20, { gain: 0.10, f0: 560 });                            // cartons verts
pop(42.30, { gain: 0.10, f0: 560 });
pop(46.20, { gain: 0.10, f0: 560 });
pop(49.80, { gain: 0.10, f0: 560 });
ding(44.35);                                                    // relance (cloche)
whoosh(45.17, { dur: 0.26, gain: 0.08, dir: 1, pan: 0.3 });     // panneau notifications
pluck(49.55, midi(79), { gain: 0.04, dur: 0.7 });               // export ok

// S4 hub — nodes en petite montée pentatonique
[62, 64, 67, 69, 71, 74].forEach((m, i) => pop(53.72 + i * 0.22, { gain: 0.065, f0: midi(m) / 2, pan: (i % 2 ? 0.25 : -0.25) }));
pop(57.05, { gain: 0.09, f0: 560 });

// S5 comparatif — ✕ grave / ✓ aigu en alternance par ligne
for (let i = 0; i < 4; i++) {
  tickLow(61.95 + i * 0.55, { gain: 0.09, pan: -0.15 });
  pop(62.18 + i * 0.55, { gain: 0.07, f0: 720, pan: 0.25 });
}
chimeSuccess(64.35);

// S6 outro
pop(69.45, { gain: 0.10, f0: 500 });

/* ============================ MUSIQUE ============================ */
/* 88 BPM — Cmaj9 / Am7 / Fmaj7 / G6, pads doux + mélodie pentatonique.
   Tout événement musical dont le départ est ≥ 69 s est remplacé par le final. */
const BEAT = 60 / 88;
const CYCLE = 32 * BEAT; // 4 accords × 8 temps
const CHORDS = [
  [48, 52, 55, 62],  // C3 E3 G3 D4
  [45, 52, 55, 60],  // A2 E3 G3 C4
  [41, 57, 60, 64],  // F2 A3 C4 E4
  [43, 59, 62, 64],  // G2 B3 D4 E4
];
const MELODY = [ // [beat, midi] sur un cycle de 32 temps
  [0, 76], [3, 79], [5.5, 74],
  [8, 72], [11, 76], [13.5, 69],
  [16, 69], [19, 72], [21.5, 76],
  [24, 71], [27, 74], [29.5, 67],
];
const MUSIC_GAIN = 0.85;
function musicEnv(t) { // fade in/out global + léger lift final
  let g = clamp01(t / 2.6) * MUSIC_GAIN;
  if (t > 69) g *= 1.2;
  g *= 1 - clamp01((t - 73.4) / 2.4);
  return g;
}
for (let cyc = 0; cyc * CYCLE < 70; cyc++) {
  const base = cyc * CYCLE;
  CHORDS.forEach((notes, ci) => {
    const t0 = base + ci * 8 * BEAT;
    if (t0 >= 68.6) return;
    const g = musicEnv(t0);
    if (g <= 0.01) { if (t0 > 3) return; }
    notes.forEach((m, ni) => pad(t0, midi(m), {
      dur: 8 * BEAT + 1.2, gain: 0.020 * musicEnv(t0 + 2), detune: 1 + ni * .4, pan: (ni % 2 ? .22 : -.22),
    }));
  });
  MELODY.forEach(([b, m]) => {
    const t0 = base + b * BEAT;
    if (t0 < 2.2 || t0 >= 68.6) return;
    pluck(t0, midi(m), { gain: 0.040 * musicEnv(t0), dur: 1.6, bright: 0.8, pan: 0.12 });
  });
}
// Final : pad Cmaj9 tenu + arpège doux
[48, 52, 55, 62, 64].forEach((m, ni) => pad(69.6, midi(m), { dur: 6.2, gain: 0.022, detune: 1 + ni * .3, pan: (ni % 2 ? .2 : -.2) }));
[72, 76, 79, 86].forEach((m, i) => pluck(70.1 + i * 0.09, midi(m), { gain: 0.05, dur: 2.2 }));

/* ============================ MASTER ============================ */
// soft-clip très léger + normalisation à -3 dBFS
let peak = 0;
for (let i = 0; i < N; i++) {
  L[i] = Math.tanh(L[i] * 1.1);
  R[i] = Math.tanh(R[i] * 1.1);
  const a = Math.max(Math.abs(L[i]), Math.abs(R[i]));
  if (a > peak) peak = a;
}
const target = 0.708; // ≈ -3 dBFS
const scale = peak > 0 ? target / peak : 1;
console.log(`peak avant normalisation: ${peak.toFixed(3)} → scale ${scale.toFixed(3)}`);

/* ---------- WAV 16-bit ---------- */
const bytes = 44 + N * 4;
const buf = Buffer.alloc(bytes);
buf.write("RIFF", 0); buf.writeUInt32LE(bytes - 8, 4); buf.write("WAVE", 8);
buf.write("fmt ", 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28);
buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
buf.write("data", 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * scale)) * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * scale)) * 32767), 44 + i * 4 + 2);
}
const out = path.join(__dirname, "soundtrack.wav");
fs.writeFileSync(out, buf);
console.log(`OK: ${out} (${(bytes / 1024 / 1024).toFixed(1)} MB, ${DUR}s)`);
