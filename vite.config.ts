import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    // GitHub Pages usually requires a base path matching the repo name.
    // If your repo is https://github.com/user/my-app, base should be '/my-app/'
    // We default to './' to make it relative, which works for most static deployments.
    base: './', 
    define: {
      // API Key injection removed
    }
  };
});
