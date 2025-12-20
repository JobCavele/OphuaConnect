import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: "./", // Isso força o Vite a procurar configuração PostCSS na raiz
  },
});
