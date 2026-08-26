const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const sourceIcon = path.join(__dirname, '..', 'store_app_icon.jpg');

async function generateIcons() {
  console.log('Generating web icons from:', sourceIcon);
  
  // 1. Web Public Icons
  const publicDir = path.join(__dirname, 'public');
  await sharp(sourceIcon).resize(512, 512).png().toFile(path.join(publicDir, 'icon-512.png'));
  await sharp(sourceIcon).resize(192, 192).png().toFile(path.join(publicDir, 'icon-192.png'));
  console.log('Updated public/icon-512.png and public/icon-192.png');

  // 2. Android Mipmap Icons
  const resDir = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');
  const mipmaps = [
    { dir: 'mipmap-mdpi', size: 48 },
    { dir: 'mipmap-hdpi', size: 72 },
    { dir: 'mipmap-xhdpi', size: 96 },
    { dir: 'mipmap-xxhdpi', size: 144 },
    { dir: 'mipmap-xxxhdpi', size: 192 },
  ];

  for (const m of mipmaps) {
    const targetFolder = path.join(resDir, m.dir);
    if (fs.existsSync(targetFolder)) {
      await sharp(sourceIcon).resize(m.size, m.size).png().toFile(path.join(targetFolder, 'ic_launcher.png'));
      await sharp(sourceIcon).resize(m.size, m.size).png().toFile(path.join(targetFolder, 'ic_launcher_round.png'));
      await sharp(sourceIcon).resize(m.size, m.size).png().toFile(path.join(targetFolder, 'ic_launcher_foreground.png'));
      console.log(`Updated ${m.dir} (${m.size}x${m.size})`);
    }
  }

  console.log('All icons successfully updated!');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
