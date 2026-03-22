#!/usr/bin/env node
/**
 * generate-icons.js
 * Generates all PWA icon sizes for NeoTerm
 * Run: node generate-icons.js
 *
 * Uses sharp (if installed) or falls back to HTML Canvas SVG export
 */

const fs   = require("fs");
const path = require("path");

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const OUT   = path.join(__dirname, "public", "icons");

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

// Generate SVG icon (used as source)
const svgIcon = (size) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"
     xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#0a0e1a"/>

  <!-- Outer glow ring -->
  <circle cx="${size/2}" cy="${size/2}" r="${size*0.42}"
    fill="none" stroke="#63b3ed" stroke-width="${size*0.025}" opacity="0.3"/>

  <!-- ◈ Diamond symbol -->
  <polygon
    points="${size/2},${size*0.18} ${size*0.82},${size/2} ${size/2},${size*0.82} ${size*0.18},${size/2}"
    fill="none" stroke="#63b3ed" stroke-width="${size*0.04}"
    stroke-linejoin="round"/>

  <!-- Inner diamond -->
  <polygon
    points="${size/2},${size*0.32} ${size*0.68},${size/2} ${size/2},${size*0.68} ${size*0.32},${size/2}"
    fill="#63b3ed" opacity="0.85"/>

  <!-- Terminal prompt line bottom left -->
  <rect x="${size*0.15}" y="${size*0.87}" width="${size*0.12}" height="${size*0.04}"
    rx="${size*0.01}" fill="#68d391" opacity="0.8"/>
  <rect x="${size*0.3}"  y="${size*0.87}" width="${size*0.55}" height="${size*0.04}"
    rx="${size*0.01}" fill="#4a5568" opacity="0.6"/>
</svg>`;

// Write SVG icons (can be used directly or converted)
SIZES.forEach(size => {
  const svg  = svgIcon(size);
  const file = path.join(OUT, `icon-${size}.svg`);
  fs.writeFileSync(file, svg);
  console.log(`✓ Generated icon-${size}.svg`);
});

// Also write a combined SVG as favicon
fs.writeFileSync(path.join(__dirname, "public", "favicon.svg"), svgIcon(512));

console.log("\n✅ All icons generated in public/icons/");
console.log("\n📌 To convert SVG → PNG (install sharp first):");
console.log("   npm install sharp");
console.log("   node convert-icons.js\n");
console.log("📌 Or use online tool:");
console.log("   https://realfavicongenerator.net");
console.log("   Upload public/icons/icon-512.svg → download pack\n");
