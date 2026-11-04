import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

// Include the shop, about, product, and admin pages in development and production builds.
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        shop: fileURLToPath(new URL('./index.html', import.meta.url)),
        about: fileURLToPath(new URL('./about.html', import.meta.url)),
        product: fileURLToPath(new URL('./product.html', import.meta.url)),
        adminLogin: fileURLToPath(new URL('./admin-login.html', import.meta.url)),
        adminDashboard: fileURLToPath(new URL('./admin-dashboard.html', import.meta.url)),
      },
    },
  },
});
