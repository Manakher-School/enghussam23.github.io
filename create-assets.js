const sharp = require("sharp");
const path = require("path");

// Create placeholder images
const assetsDir = path.join(__dirname, "assets");

// Create icon (1024x1024)
sharp({
  create: {
    width: 1024,
    height: 1024,
    channels: 4,
    background: { r: 33, g: 150, b: 243, alpha: 1 },
  },
})
  .png()
  .toFile(path.join(assetsDir, "icon.png"))
  .then(() => console.log("✓ icon.png created"))
  .catch((err) => console.error("Error creating icon:", err));

// Create adaptive icon (1024x1024)
sharp({
  create: {
    width: 1024,
    height: 1024,
    channels: 4,
    background: { r: 33, g: 150, b: 243, alpha: 1 },
  },
})
  .png()
  .toFile(path.join(assetsDir, "adaptive-icon.png"))
  .then(() => console.log("✓ adaptive-icon.png created"))
  .catch((err) => console.error("Error creating adaptive-icon:", err));

// Create splash (1284x2778)
sharp({
  create: {
    width: 1284,
    height: 2778,
    channels: 4,
    background: { r: 255, g: 255, b: 255, alpha: 1 },
  },
})
  .png()
  .toFile(path.join(assetsDir, "splash.png"))
  .then(() => console.log("✓ splash.png created"))
  .catch((err) => console.error("Error creating splash:", err));

// Create favicon (48x48)
sharp({
  create: {
    width: 48,
    height: 48,
    channels: 4,
    background: { r: 33, g: 150, b: 243, alpha: 1 },
  },
})
  .png()
  .toFile(path.join(assetsDir, "favicon.png"))
  .then(() => console.log("✓ favicon.png created"))
  .catch((err) => console.error("Error creating favicon:", err));
