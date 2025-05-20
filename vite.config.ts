import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  base: "/reels-editor-project/", // تعديل المسار الأساسي ليتوافق مع GitHub Pages
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
