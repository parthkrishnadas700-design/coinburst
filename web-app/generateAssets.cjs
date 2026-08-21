const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SOURCE = path.join(__dirname, 'public', 'assets', 'coinburst_logo.png');
const RES_DIR = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');

async function main() {
  console.log('Generating Android icons and splash screens from', SOURCE);

  // 1. Mipmap icons (launcher & launcher round)
  const mipmaps = [
    { dir: 'mipmap-mdpi', iconSize: 48, fgSize: 108 },
    { dir: 'mipmap-hdpi', iconSize: 72, fgSize: 162 },
    { dir: 'mipmap-xhdpi', iconSize: 96, fgSize: 216 },
    { dir: 'mipmap-xxhdpi', iconSize: 144, fgSize: 324 },
    { dir: 'mipmap-xxxhdpi', iconSize: 192, fgSize: 432 },
  ];

  for (const item of mipmaps) {
    const targetDir = path.join(RES_DIR, item.dir);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    // ic_launcher.png (Full logo scaled to fit square)
    await sharp(SOURCE)
      .resize(item.iconSize, item.iconSize, { fit: 'contain', background: { r: 11, g: 15, b: 25, alpha: 1 } })
      .toFile(path.join(targetDir, 'ic_launcher.png'));

    // ic_launcher_round.png (Circular masked icon)
    const circleSvg = Buffer.from(
      `<svg width="${item.iconSize}" height="${item.iconSize}"><circle cx="${item.iconSize/2}" cy="${item.iconSize/2}" r="${item.iconSize/2}" fill="#fff"/></svg>`
    );
    const resizedLogo = await sharp(SOURCE)
      .resize(item.iconSize, item.iconSize, { fit: 'contain', background: { r: 11, g: 15, b: 25, alpha: 1 } })
      .toBuffer();

    await sharp(resizedLogo)
      .composite([{ input: circleSvg, blend: 'dest-in' }])
      .toFile(path.join(targetDir, 'ic_launcher_round.png'));

    // ic_launcher_foreground.png (Adaptive icon foreground with padding for safe zone)
    // Safe zone is inner 66% (e.g. 72dp inside 108dp canvas)
    const fgLogoSize = Math.round(item.fgSize * 0.72);
    const fgLogoBuffer = await sharp(SOURCE)
      .resize(fgLogoSize, fgLogoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    await sharp({
      create: {
        width: item.fgSize,
        height: item.fgSize,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
      .composite([{ input: fgLogoBuffer, top: Math.round((item.fgSize - fgLogoSize)/2), left: Math.round((item.fgSize - fgLogoSize)/2) }])
      .toFile(path.join(targetDir, 'ic_launcher_foreground.png'));

    console.log(`Generated ${item.dir} icons`);
  }

  // 2. Splash Screens
  const splashes = [
    { dir: 'drawable', width: 480, height: 320 },
    { dir: 'drawable-port-mdpi', width: 320, height: 480 },
    { dir: 'drawable-port-hdpi', width: 480, height: 800 },
    { dir: 'drawable-port-xhdpi', width: 720, height: 1280 },
    { dir: 'drawable-port-xxhdpi', width: 960, height: 1600 },
    { dir: 'drawable-port-xxxhdpi', width: 1280, height: 1920 },
    { dir: 'drawable-land-mdpi', width: 480, height: 320 },
    { dir: 'drawable-land-hdpi', width: 800, height: 480 },
    { dir: 'drawable-land-xhdpi', width: 1280, height: 720 },
    { dir: 'drawable-land-xxhdpi', width: 1600, height: 960 },
    { dir: 'drawable-land-xxxhdpi', width: 1920, height: 1280 },
  ];

  for (const splash of splashes) {
    const targetDir = path.join(RES_DIR, splash.dir);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    // Logo size on splash screen (~40% of smallest dimension)
    const logoMax = Math.round(Math.min(splash.width, splash.height) * 0.45);
    const logoBuffer = await sharp(SOURCE)
      .resize(logoMax, logoMax, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    const logoMeta = await sharp(logoBuffer).metadata();
    const top = Math.round((splash.height - logoMeta.height) / 2);
    const left = Math.round((splash.width - logoMeta.width) / 2);

    await sharp({
      create: {
        width: splash.width,
        height: splash.height,
        channels: 4,
        background: { r: 11, g: 15, b: 25, alpha: 1 } // #0b0f19
      }
    })
      .composite([{ input: logoBuffer, top, left }])
      .toFile(path.join(targetDir, 'splash.png'));

    console.log(`Generated ${splash.dir}/splash.png (${splash.width}x${splash.height})`);
  }

  // 3. Web Favicons
  const publicDir = path.join(__dirname, 'public');
  await sharp(SOURCE).resize(32, 32).toFile(path.join(publicDir, 'favicon.ico'));
  await sharp(SOURCE).resize(192, 192).toFile(path.join(publicDir, 'icon-192.png'));
  await sharp(SOURCE).resize(512, 512).toFile(path.join(publicDir, 'icon-512.png'));

  console.log('All icons and splash screens successfully generated!');
}

main().catch(console.error);
