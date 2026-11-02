import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

// Include all three pages in production builds as well as the development server.
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        shop: fileURLToPath(new URL('./index.html', import.meta.url)),
        adminLogin: fileURLToPath(new URL('./admin-login.html', import.meta.url)),
        adminDashboard: fileURLToPath(new URL('./admin-dashboard.html', import.meta.url)),
      },
    },
  },
});
