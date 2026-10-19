const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPng(width, height) {
  const rowSize = width * 4 + 1;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      // Distance from center
      const cx = width / 2;
      const cy = height / 2;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Cyberpunk rounded badge
      const radius = width * 0.44;

      if (dist <= radius) {
        // Border glow
        if (dist >= radius - 6) {
          rawData[pxOffset] = 0;      // R
          rawData[pxOffset + 1] = 240;// G
          rawData[pxOffset + 2] = 255;// B
          rawData[pxOffset + 3] = 255;// A
        } else {
          // Inside lightning bolt shape approximation
          const isLightning = (
            (x > width * 0.45 && x < width * 0.58 && y > height * 0.25 && y < height * 0.52) ||
            (x > width * 0.38 && x < width * 0.62 && y >= height * 0.48 && y <= height * 0.56) ||
            (x > width * 0.40 && x < width * 0.52 && y > height * 0.52 && y < height * 0.75)
          );

          if (isLightning) {
            rawData[pxOffset] = 0;
            rawData[pxOffset + 1] = 240;
            rawData[pxOffset + 2] = 255;
            rawData[pxOffset + 3] = 255;
          } else {
            // Dark gradient
            const dark = Math.max(10, Math.min(30, 20 + Math.floor(y / 10)));
            rawData[pxOffset] = dark;
            rawData[pxOffset + 1] = dark + 5;
            rawData[pxOffset + 2] = dark + 15;
            rawData[pxOffset + 3] = 255;
          }
        }
      } else {
        // Transparent
        rawData[pxOffset + 3] = 0;
      }
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(8 + len + 4);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);
    // CRC
    const crc = crc32(buf.slice(4, 8 + len));
    buf.writeInt32BE(crc, 8 + len);
    return buf;
  }

  function crc32(buf) {
    let c = -1;
    for (let i = 0; i < buf.length; i++) {
      c = (c >>> 8) ^ table[(c ^ buf[i]) & 0xFF];
    }
    return c ^ -1;
  }

  const table = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const pngBuf = createPng(256, 256);
const outPath = path.join(__dirname, 'icon.png');
fs.writeFileSync(outPath, pngBuf);
console.log('Icon written to:', outPath);
