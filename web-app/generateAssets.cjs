const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'public', 'assets');
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

let SOURCE = path.join(assetsDir, 'store_app_icon.jpg');
if (!fs.existsSync(SOURCE)) {
  SOURCE = path.join(assetsDir, 'coinburst_logo.png');
}
if (!fs.existsSync(SOURCE)) {
  SOURCE = path.join(__dirname, '..', 'store_app_icon.jpg');
}

const DEST_LOGO = path.join(assetsDir, 'coinburst_logo.png');

async function main() {
  console.log('Generating Android, Web & PWA logo assets from:', SOURCE);

  if (!fs.existsSync(SOURCE)) {
    throw new Error(`Source logo file not found at ${SOURCE}`);
  }

  // 0. Ensure high-resolution coinburst_logo.png exists in /public/assets & /src/assets
  const srcAssetsDir = path.join(__dirname, 'src', 'assets');
  if (!fs.existsSync(srcAssetsDir)) fs.mkdirSync(srcAssetsDir, { recursive: true });

  await sharp(SOURCE)
    .resize(512, 512, { fit: 'contain', background: { r: 11, g: 15, b: 25, alpha: 1 } })
    .png({ quality: 80, compressionLevel: 9 })
    .toFile(DEST_LOGO + '.tmp');
  
  if (fs.existsSync(DEST_LOGO)) fs.unlinkSync(DEST_LOGO);
  fs.renameSync(DEST_LOGO + '.tmp', DEST_LOGO);
  fs.copyFileSync(DEST_LOGO, path.join(srcAssetsDir, 'coinburst_logo.png'));
  console.log('Generated /public/assets/coinburst_logo.png & /src/assets/coinburst_logo.png');

  // 1. Mipmap icons (launcher & launcher round)
  const RES_DIR = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');
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
    await sharp(DEST_LOGO)
      .resize(item.iconSize, item.iconSize, { fit: 'contain', background: { r: 11, g: 15, b: 25, alpha: 1 } })
      .toFile(path.join(targetDir, 'ic_launcher.png'));

    // ic_launcher_round.png (Circular masked icon)
    const circleSvg = Buffer.from(
      `<svg width="${item.iconSize}" height="${item.iconSize}"><circle cx="${item.iconSize/2}" cy="${item.iconSize/2}" r="${item.iconSize/2}" fill="#fff"/></svg>`
    );
    const resizedLogo = await sharp(DEST_LOGO)
      .resize(item.iconSize, item.iconSize, { fit: 'contain', background: { r: 11, g: 15, b: 25, alpha: 1 } })
      .toBuffer();

    await sharp(resizedLogo)
      .composite([{ input: circleSvg, blend: 'dest-in' }])
      .toFile(path.join(targetDir, 'ic_launcher_round.png'));

    // ic_launcher_foreground.png
    const fgLogoSize = Math.round(item.fgSize * 0.72);
    const fgLogoBuffer = await sharp(DEST_LOGO)
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

    const logoMax = Math.round(Math.min(splash.width, splash.height) * 0.45);
    const logoBuffer = await sharp(DEST_LOGO)
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
        background: { r: 11, g: 15, b: 25, alpha: 1 }
      }
    })
      .composite([{ input: logoBuffer, top, left }])
      .toFile(path.join(targetDir, 'splash.png'));
  }

  // 3. Web & PWA Favicons
  const publicDir = path.join(__dirname, 'public');
  await sharp(DEST_LOGO).resize(32, 32).toFile(path.join(publicDir, 'favicon.ico'));
  await sharp(DEST_LOGO).resize(192, 192).toFile(path.join(publicDir, 'icon-192.png'));
  await sharp(DEST_LOGO).resize(512, 512).toFile(path.join(publicDir, 'icon-512.png'));
  await sharp(DEST_LOGO).resize(192, 192).toFile(path.join(publicDir, 'pwa-192x192.png'));
  await sharp(DEST_LOGO).resize(512, 512).toFile(path.join(publicDir, 'pwa-512x512.png'));

  console.log('All icons and splash screens successfully generated!');
}

main().catch(console.error);

