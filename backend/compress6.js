const sharp = require('sharp');
async function run() {
  await sharp('resources/loadingscreentouse.webp')
    .webp({ quality: 20 })
    .toFile('frontend/public/loadingscreentouse.webp');
    
  await sharp('resources/loadingscreenphones.webp')
    .webp({ quality: 20 })
    .toFile('frontend/public/loadingscreenphones.webp');
  
  console.log('done');
}
run();
