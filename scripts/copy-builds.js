const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`  SKIP (not found): ${path.relative(root, src)}`);
    return;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('Copying builds to public/...');

// Admin Web
console.log('\n- Admin Web');
copyRecursive(
  path.join(root, 'admin-web', 'dist'),
  path.join(publicDir, 'admin')
);

// Landing Page
console.log('- Landing Page');
copyRecursive(
  path.join(root, 'landing-page'),
  publicDir
);

console.log('\nDone!');
