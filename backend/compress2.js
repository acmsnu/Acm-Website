const sharp = require('sharp');
async function run() {
  await sharp('frontend/public/loadingscreentouse.webp')
    .resize({ width: Math.floor(1586 / 2), kernel: sharp.kernel.nearest })
    .webp({ quality: 20 })
    .toFile('frontend/public/loadingscreentouse_sm.webp');
    
  await sharp('frontend/public/loadingscreenphones.webp')
    .resize({ width: Math.floor(853 / 2), kernel: sharp.kernel.nearest })
    .webp({ quality: 20 })
    .toFile('frontend/public/loadingscreenphones_sm.webp');
  
  console.log('done');
}
run();
