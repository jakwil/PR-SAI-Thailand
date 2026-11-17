import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';

/**
 * Downlevel CSS Media Queries Level 4 range syntax (`(width >= 64rem)`, `(width <= 40rem)`)
 * produced by Tailwind CSS v4 to classic Level 3 `(min-width: ...)` / `(max-width: ...)`,
 * ensuring responsive Desktop breakpoints (`sm:`, `md:`, `lg:`, `xl:`) work properly on
 * older macOS Safari versions (< 16.4) as well as all modern browsers.
 */
function downlevelMediaRangeSyntax(css: string): string {
  return css
    .replace(/\(\s*width\s*>=\s*([^)]+?)\s*\)/g, '(min-width: $1)')
    .replace(/\(\s*width\s*<=\s*([^)]+?)\s*\)/g, '(max-width: $1)')
    .replace(/@media\s*\(\s*width\s*<(?!=)\s*([^)]+?)\s*\)/g, '@media not all and (min-width: $1)')
    .replace(/@media\s*\(\s*width\s*>(?!=)\s*([^)]+?)\s*\)/g, '@media not all and (max-width: $1)');
}

function safariMediaCompatPlugin(): Plugin {
  return {
    name: 'safari-media-compat',
    enforce: 'post',
    transform(code, id) {
      if (id.split('?')[0].endsWith('.css') && /\(\s*width\s*(?:>=|<=|>|<)/.test(code)) {
        return {
          code: downlevelMediaRangeSyntax(code),
          map: null,
        };
      }
      return null;
    },
    generateBundle(_options, bundle) {
      for (const asset of Object.values(bundle)) {
        if (asset.type === 'asset' && asset.fileName.endsWith('.css') && typeof asset.source === 'string') {
          asset.source = downlevelMediaRangeSyntax(asset.source);
        }
      }
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), safariMediaCompatPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    build: {
      cssTarget: ['safari15', 'chrome98'],
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
