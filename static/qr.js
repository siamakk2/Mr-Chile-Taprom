/**
 * Minimal QR encoder — byte mode, error correction level M, versions 1–6.
 *
 * A ticket serial is 23 characters, so this never needs the larger versions.
 * Written rather than pulled in because the ticket page must keep working when
 * a CDN does not, and because a scanner at the door is the last place to
 * discover a script failed to load.
 *
 * Correctness is verified in test/qr.test.mjs by decoding the output with an
 * independent decoder, which is the only test worth trusting here.
 */
(function (global) {
  'use strict';

  // --- Galois field GF(256), generator 0x11d ---------------------------------
  var EXP = new Uint8Array(512), LOG = new Uint8Array(256);
  (function () {
    for (var i = 0, x = 1; i < 255; i++) {
      EXP[i] = x; LOG[x] = i;
      x <<= 1; if (x & 0x100) x ^= 0x11d;
    }
    for (var j = 255; j < 512; j++) EXP[j] = EXP[j - 255];
  })();

  function mul(a, b) { return a && b ? EXP[LOG[a] + LOG[b]] : 0; }

  function rsGenerator(n) {
    var poly = [1];
    for (var i = 0; i < n; i++) {
      var next = new Array(poly.length + 1).fill(0);
      for (var j = 0; j < poly.length; j++) {
        next[j] ^= poly[j];
        next[j + 1] ^= mul(poly[j], EXP[i]);
      }
      poly = next;
    }
    return poly;
  }

  function rsEncode(data, ecLen) {
    var gen = rsGenerator(ecLen);
    var res = new Uint8Array(data.length + ecLen);
    res.set(data);
    for (var i = 0; i < data.length; i++) {
      var factor = res[i];
      if (!factor) continue;
      for (var j = 0; j < gen.length; j++) res[i + j] ^= mul(gen[j], factor);
    }
    return res.slice(data.length);
  }

  // --- version tables, EC level M --------------------------------------------
  // [ total codewords, ec codewords per block, group1 blocks, group1 data cw,
  //   group2 blocks, group2 data cw ]
  var VERSIONS = {
    1: [26, 10, 1, 16, 0, 0],
    2: [44, 16, 1, 28, 0, 0],
    3: [70, 26, 1, 44, 0, 0],
    4: [100, 18, 2, 32, 0, 0],
    5: [134, 24, 2, 43, 0, 0],
    6: [172, 16, 4, 27, 0, 0]
  };
  var ALIGN = { 1: [], 2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30], 6: [6, 34] };

  // Pre-computed format bits for EC level M, masks 0–7 (BCH 15,5 + 0x5412).
  var FORMAT_M = [
    0x5412, 0x5125, 0x5E7C, 0x5B4B, 0x45F9, 0x40CE, 0x4F97, 0x4AA0
  ];

  function capacity(v) {
    var t = VERSIONS[v];
    return t[2] * t[3] + t[4] * t[5];
  }

  function pickVersion(byteLen) {
    for (var v = 1; v <= 6; v++) {
      // 4 bits mode + 8 bits length (versions 1–9) + payload
      if (capacity(v) * 8 >= 4 + 8 + byteLen * 8) return v;
    }
    throw new Error('payload too long for this encoder');
  }

  // --- bit stream -------------------------------------------------------------
  function BitBuffer() { this.bits = []; }
  BitBuffer.prototype.put = function (val, len) {
    for (var i = len - 1; i >= 0; i--) this.bits.push((val >>> i) & 1);
  };

  function buildCodewords(text, version) {
    var bytes = [];
    for (var i = 0; i < text.length; i++) {
      var c = text.charCodeAt(i);
      if (c < 128) bytes.push(c);
      else throw new Error('this encoder is ASCII only; serials are base32');
    }
    var total = capacity(version);
    var bb = new BitBuffer();
    bb.put(4, 4);                 // byte mode
    bb.put(bytes.length, 8);      // length, versions 1–9
    for (var j = 0; j < bytes.length; j++) bb.put(bytes[j], 8);

    var maxBits = total * 8;
    for (var t = 0; t < 4 && bb.bits.length < maxBits; t++) bb.bits.push(0); // terminator
    while (bb.bits.length % 8) bb.bits.push(0);

    var cw = [];
    for (var k = 0; k < bb.bits.length; k += 8) {
      var b = 0;
      for (var m = 0; m < 8; m++) b = (b << 1) | bb.bits[k + m];
      cw.push(b);
    }
    var pad = [0xEC, 0x11], p = 0;
    while (cw.length < total) cw.push(pad[p++ % 2]);
    return cw;
  }

  /** Interleave data and EC across blocks, as the spec requires. */
  function interleave(cw, version) {
    var t = VERSIONS[version];
    var ecLen = t[1], blocks = [], ecs = [], offset = 0;
    var specs = [];
    for (var i = 0; i < t[2]; i++) specs.push(t[3]);
    for (var j = 0; j < t[4]; j++) specs.push(t[5]);

    specs.forEach(function (len) {
      var data = Uint8Array.from(cw.slice(offset, offset + len));
      offset += len;
      blocks.push(data);
      ecs.push(rsEncode(data, ecLen));
    });

    var out = [];
    var maxData = Math.max.apply(null, specs);
    for (var d = 0; d < maxData; d++) {
      blocks.forEach(function (b) { if (d < b.length) out.push(b[d]); });
    }
    for (var e = 0; e < ecLen; e++) {
      ecs.forEach(function (b) { out.push(b[e]); });
    }
    return out;
  }

  // --- matrix -----------------------------------------------------------------
  function build(text) {
    var version = pickVersion(text.length);
    var size = version * 4 + 17;
    var mod = [], reserved = [];
    for (var i = 0; i < size; i++) {
      mod.push(new Array(size).fill(0));
      reserved.push(new Array(size).fill(false));
    }

    function finder(r, c) {
      for (var dr = -1; dr <= 7; dr++) {
        for (var dc = -1; dc <= 7; dc++) {
          var rr = r + dr, cc = c + dc;
          if (rr < 0 || cc < 0 || rr >= size || cc >= size) continue;
          var on = (dr >= 0 && dr <= 6 && (dc === 0 || dc === 6)) ||
                   (dc >= 0 && dc <= 6 && (dr === 0 || dr === 6)) ||
                   (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4);
          mod[rr][cc] = on ? 1 : 0;
          reserved[rr][cc] = true;
        }
      }
    }
    finder(0, 0); finder(0, size - 7); finder(size - 7, 0);

    // timing patterns
    for (var k = 8; k < size - 8; k++) {
      mod[6][k] = k % 2 === 0 ? 1 : 0; reserved[6][k] = true;
      mod[k][6] = k % 2 === 0 ? 1 : 0; reserved[k][6] = true;
    }

    // alignment patterns
    var centres = ALIGN[version];
    for (var a = 0; a < centres.length; a++) {
      for (var b = 0; b < centres.length; b++) {
        var ar = centres[a], ac = centres[b];
        if (reserved[ar][ac]) continue;
        for (var dr2 = -2; dr2 <= 2; dr2++) {
          for (var dc2 = -2; dc2 <= 2; dc2++) {
            mod[ar + dr2][ac + dc2] =
              (Math.abs(dr2) === 2 || Math.abs(dc2) === 2 || (dr2 === 0 && dc2 === 0)) ? 1 : 0;
            reserved[ar + dr2][ac + dc2] = true;
          }
        }
      }
    }

    // dark module + reserved format areas
    mod[size - 8][8] = 1; reserved[size - 8][8] = true;
    for (var f = 0; f < 9; f++) {
      if (!reserved[8][f]) { reserved[8][f] = true; }
      if (!reserved[f][8]) { reserved[f][8] = true; }
    }
    for (var g = 0; g < 8; g++) {
      reserved[8][size - 1 - g] = true;
      reserved[size - 1 - g][8] = true;
    }

    // place data, zigzag from bottom right
    var bits = [];
    interleave(buildCodewords(text, version), version).forEach(function (byte) {
      for (var z = 7; z >= 0; z--) bits.push((byte >>> z) & 1);
    });

    var idx = 0, upward = true;
    for (var col = size - 1; col > 0; col -= 2) {
      if (col === 6) col--; // skip the vertical timing column
      for (var n = 0; n < size; n++) {
        var row = upward ? size - 1 - n : n;
        for (var s = 0; s < 2; s++) {
          var cc2 = col - s;
          if (reserved[row][cc2]) continue;
          mod[row][cc2] = idx < bits.length ? bits[idx++] : 0;
        }
      }
      upward = !upward;
    }

    // choose the mask with the lowest penalty, as the spec intends
    var best = null, bestScore = Infinity;
    for (var m = 0; m < 8; m++) {
      var cand = applyMask(mod, reserved, size, m);
      placeFormat(cand, size, m);
      var sc = penalty(cand, size);
      if (sc < bestScore) { bestScore = sc; best = cand; }
    }
    return best;
  }

  function maskFn(m, r, c) {
    switch (m) {
      case 0: return (r + c) % 2 === 0;
      case 1: return r % 2 === 0;
      case 2: return c % 3 === 0;
      case 3: return (r + c) % 3 === 0;
      case 4: return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0;
      case 5: return ((r * c) % 2) + ((r * c) % 3) === 0;
      case 6: return (((r * c) % 2) + ((r * c) % 3)) % 2 === 0;
      default: return (((r + c) % 2) + ((r * c) % 3)) % 2 === 0;
    }
  }

  function applyMask(mod, reserved, size, m) {
    var out = mod.map(function (row) { return row.slice(); });
    for (var r = 0; r < size; r++) {
      for (var c = 0; c < size; c++) {
        if (!reserved[r][c] && maskFn(m, r, c)) out[r][c] ^= 1;
      }
    }
    return out;
  }

  function placeFormat(mod, size, mask) {
    var bits = FORMAT_M[mask];
    for (var i = 0; i < 15; i++) {
      var bit = (bits >>> (14 - i)) & 1;
      // top-left
      if (i < 6) mod[8][i] = bit;
      else if (i === 6) mod[8][7] = bit;
      else if (i === 7) mod[8][8] = bit;
      else if (i === 8) mod[7][8] = bit;
      else mod[14 - i][8] = bit;
      // duplicate around the other two finders
      if (i < 8) mod[size - 1 - i][8] = bit;
      else mod[8][size - 15 + i] = bit;
    }
    mod[size - 8][8] = 1;
  }

  function penalty(mod, size) {
    var score = 0, r, c, run, i;
    // rule 1: runs of five or more
    for (r = 0; r < size; r++) {
      run = 1;
      for (c = 1; c < size; c++) {
        if (mod[r][c] === mod[r][c - 1]) { run++; } else { if (run >= 5) score += 3 + (run - 5); run = 1; }
      }
      if (run >= 5) score += 3 + (run - 5);
    }
    for (c = 0; c < size; c++) {
      run = 1;
      for (r = 1; r < size; r++) {
        if (mod[r][c] === mod[r - 1][c]) { run++; } else { if (run >= 5) score += 3 + (run - 5); run = 1; }
      }
      if (run >= 5) score += 3 + (run - 5);
    }
    // rule 2: 2x2 blocks
    for (r = 0; r < size - 1; r++) {
      for (c = 0; c < size - 1; c++) {
        var v = mod[r][c];
        if (v === mod[r][c + 1] && v === mod[r + 1][c] && v === mod[r + 1][c + 1]) score += 3;
      }
    }
    // rule 3: finder-like patterns
    var pat = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0];
    for (r = 0; r < size; r++) {
      for (c = 0; c + 11 <= size; c++) {
        var okH = true, okV = true;
        for (i = 0; i < 11; i++) {
          if (mod[r][c + i] !== pat[i]) okH = false;
          if (mod[c + i] && mod[c + i][r] !== pat[i]) okV = false;
        }
        if (okH) score += 40;
        if (okV) score += 40;
      }
    }
    // rule 4: balance of dark modules
    var dark = 0;
    for (r = 0; r < size; r++) for (c = 0; c < size; c++) dark += mod[r][c];
    var pct = (dark * 100) / (size * size);
    score += Math.floor(Math.abs(pct - 50) / 5) * 10;
    return score;
  }

  // --- rendering ---------------------------------------------------------------
  function render(canvas, text, opts) {
    var o = opts || {};
    var m = build(text);
    var size = m.length;
    var quiet = o.quiet == null ? 4 : o.quiet;
    var total = size + quiet * 2;
    var px = Math.max(1, Math.floor((o.width || canvas.width || 240) / total));
    canvas.width = canvas.height = total * px;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = o.light || '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = o.dark || '#000';
    for (var r = 0; r < size; r++) {
      for (var c = 0; c < size; c++) {
        if (m[r][c]) ctx.fillRect((c + quiet) * px, (r + quiet) * px, px, px);
      }
    }
    return canvas;
  }

  global.QR = { build: build, render: render };
})(typeof window !== 'undefined' ? window : globalThis);
