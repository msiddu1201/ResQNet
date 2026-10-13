const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('==============================================');
console.log(' ResQNet Production Build for Vercel');
console.log('==============================================');

try {
  // 1. Install client dependencies
  console.log('[Step 1/3] Installing client dependencies...');
  execSync('npm install --include=dev', { cwd: path.join(__dirname, 'client'), stdio: 'inherit' });

  // 2. Build Vite bundle
  console.log('[Step 2/3] Building client application with Vite...');
  execSync('npm run build', { cwd: path.join(__dirname, 'client'), stdio: 'inherit' });

  // 3. Sync to root dist
  console.log('[Step 3/3] Copying client bundle to root /dist directory...');
  const clientDist = path.join(__dirname, 'client', 'dist');
  const rootDist = path.join(__dirname, 'dist');

  if (!fs.existsSync(clientDist)) {
    throw new Error('client/dist was not found after running vite build!');
  }

  if (fs.existsSync(rootDist)) {
    fs.rmSync(rootDist, { recursive: true, force: true });
  }

  fs.cpSync(clientDist, rootDist, { recursive: true });

  console.log('==============================================');
  console.log(' Build succeeded! Root /dist directory is ready.');
  console.log('==============================================');
} catch (error) {
  console.error('[Build Error]:', error.message);
  process.exit(1);
}
