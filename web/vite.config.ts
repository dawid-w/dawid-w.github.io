import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Served at grimoai.com/app — base must match so built asset URLs resolve correctly
// under that subpath rather than assuming the site root.
export default defineConfig({
  plugins: [react()],
  base: '/app/',
});
