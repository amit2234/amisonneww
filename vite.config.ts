import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      {
        name: 'copy-static-site-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(__dirname, 'dist');
          for (const folder of ['css', 'js', 'images']) {
            const srcFolder = path.resolve(__dirname, folder);
            const distFolder = path.resolve(distDir, folder);
            if (fs.existsSync(distDir) && fs.existsSync(srcFolder)) {
              fs.cpSync(srcFolder, distFolder, {recursive: true, force: true});
            }
          }
        },
      },
    ],
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
