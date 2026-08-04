/**
 * Netlify Function Entry Point — JustBot API
 *
 * File ini adalah titik masuk untuk Netlify Functions.
 * Import dari `../dist/lambda` (hasil compile TypeScript → JavaScript).
 *
 * Flow:
 * 1. Netlify build: `npm run build` → compile TS ke `dist/`
 * 2. Netlify deploy: file ini di-bundle oleh esbuild
 * 3. Request masuk → Netlify invoke handler ini → NestJS handle
 */
import { handler } from '../dist/lambda';

export { handler };
