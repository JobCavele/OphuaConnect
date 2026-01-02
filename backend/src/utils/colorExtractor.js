const { default: Vibrant } = require("node-vibrant/node");
const fs = require("fs");

async function extractColorsFromImage(imagePath) {
  try {
    console.log("🎨 Extraindo cores de:", imagePath);

    if (!fs.existsSync(imagePath)) {
      console.error("❌ Arquivo não encontrado:", imagePath);
      return {
        primaryColor: "#3B82F6",
        secondaryColor: "#1E40AF",
      };
    }

    const vibrant = new Vibrant(imagePath);
    const palette = await vibrant.getPalette();

    return {
      primaryColor: palette.Vibrant?.hex || "#3B82F6",
      secondaryColor:
        palette.Muted?.hex || palette.LightVibrant?.hex || "#1E40AF",
    };
  } catch (error) {
    console.warn("⚠️ Erro na extração de cores, usando padrão:", error.message);
    return {
      primaryColor: "#3B82F6",
      secondaryColor: "#1E40AF",
    };
  }
}

module.exports = { extractColorsFromImage };
