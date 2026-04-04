// frontend/scripts/generate-assets.js

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#0d0d0d';
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.22);
  ctx.fill();

  // Circle
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.3;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = '#34d39920';
  ctx.fill();
  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = size * 0.03;
  ctx.stroke();

  // ₹ symbol
  ctx.fillStyle = '#34d399';
  ctx.font = `bold ${size * 0.35}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('₹', cx, cy + size * 0.02);

  return canvas;
}

function drawSplash(w, h) {
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#0d0d0d';
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;
  const r = w * 0.18;

  // Circle
  ctx.beginPath();
  ctx.arc(cx, cy - h * 0.04, r, 0, Math.PI * 2);
  ctx.fillStyle = '#34d39918';
  ctx.fill();
  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = w * 0.012;
  ctx.stroke();

  // ₹ symbol
  ctx.fillStyle = '#34d399';
  ctx.font = `bold ${w * 0.22}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('₹', cx, cy - h * 0.04);

  // App name
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${w * 0.09}px sans-serif`;
  ctx.fillText('FlowLedger', cx, cy + h * 0.14);

  // Tagline
  ctx.fillStyle = '#555';
  ctx.font = `${w * 0.045}px sans-serif`;
  ctx.fillText('Track. Settle. Move on.', cx, cy + h * 0.21);

  return canvas;
}

const assetsDir = path.join(__dirname, '..', 'assets');

// icon.png — 1024x1024
const icon = drawIcon(1024);
fs.writeFileSync(path.join(assetsDir, 'icon.png'), icon.toBuffer('image/png'));
console.log('✅ icon.png');

// adaptive-icon.png — 1024x1024
const adaptive = drawIcon(1024);
fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), adaptive.toBuffer('image/png'));
console.log('✅ adaptive-icon.png');

// splash-icon.png — 1284x2778 (iPhone 14 Pro Max size, safe for all)
const splash = drawSplash(1284, 2778);
fs.writeFileSync(path.join(assetsDir, 'splash-icon.png'), splash.toBuffer('image/png'));
console.log('✅ splash-icon.png');

console.log('Done. Assets generated in assets/');