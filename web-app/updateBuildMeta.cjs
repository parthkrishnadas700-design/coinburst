const fs = require('fs');
const path = require('path');

const pkgPath = path.join(__dirname, 'package.json');
const metaPath = path.join(__dirname, 'public', 'build-meta.json');

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

const meta = {
  version: pkg.version || '2.23.0',
  versionCode: 36,
  buildTime: Date.now(),
  timestamp: new Date().toISOString(),
  appName: 'CoinBurst Wealth Hub'
};

fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
console.log(`[CoinBurst] Auto Update Meta Generated: v${meta.version} (Code ${meta.versionCode}) at ${meta.timestamp}`);
