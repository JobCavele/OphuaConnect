// src/utils/themeUtils.js
export const extractThemeFromImage = async (imageUrl) => {
  if (!imageUrl) return fallbackTheme();

  // Fallback simples (se não quiser instalar node-vibrant)
  const dominant = await fakeExtractColor(imageUrl);
  return buildTheme(dominant);
};

/* ---------- helpers ---------- */
const buildTheme = (primary) => ({
  primary,
  primaryDark: darken(primary, 15),
  primaryLight: lighten(primary, 20),
  secondary: "#10b981",
  accent: "#f59e0b",
  background: "#f8fafc",
  surface: "#ffffff",
  text: "#1e293b",
  textLight: "#64748b",
  border: "#e2e8f0",
});

const fallbackTheme = () => buildTheme("#2563eb");

const darken = (hex, p) => adjustColor(hex, -p);
const lighten = (hex, p) => adjustColor(hex, p);

const adjustColor = (hex, percent) => {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return (
    "#" +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
};

// Fake extract (substitua por node-vibrant se quiser)
const fakeExtractColor = (url) =>
  new Promise((res) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      res(`#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`);
    };
    img.onerror = () => res("#2563eb");
  });
