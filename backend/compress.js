const sharp = require('sharp');
async function run() {
  await sharp('frontend/public/loadingscreentouse.webp').webp({ quality: 30 }).toFile('frontend/public/loadingscreentouse_new.webp');
  await sharp('frontend/public/loadingscreenphones.webp').webp({ quality: 30 }).toFile('frontend/public/loadingscreenphones_new.webp');
  console.log('done');
}
run();
