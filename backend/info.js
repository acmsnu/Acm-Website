const sharp = require('sharp');
async function run() {
  const meta1 = await sharp('frontend/public/loadingscreentouse.webp').metadata();
  const meta2 = await sharp('frontend/public/loadingscreenphones.webp').metadata();
  console.log('Desktop:', meta1.width, meta1.height);
  console.log('Mobile:', meta2.width, meta2.height);
}
run();
