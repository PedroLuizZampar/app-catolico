const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir);

const files = [
  { name: 'icon.png', size: 1024 },
  { name: 'adaptive-icon.png', size: 1024 },
  { name: 'splash.png', size: 2732 },
  { name: 'favicon.png', size: 32 },
  { name: 'splashscreen_logo.png', size: 512 }
];

// Create a minimal PNG using a simple 1x1 transparent PNG binary to keep dependencies minimal
const transparentPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=',
  'base64'
);

files.forEach(f => {
  const filePath = path.join(assetsDir, f.name);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, transparentPng);
    console.log('Created', filePath);
  } else {
    console.log('Exists', filePath);
  }
});

console.log('Assets creation done.');
