/**
 * Netlify Function Entry Point — JustBot API (CommonJS)
 *
 * Menggunakan CommonJS require (bukan ESM import) karena:
 * - dist/lambda.js adalah output CommonJS (module: "commonjs" di tsconfig)
 * - nft bundler mengemas file ini + dist/ bersama ke Lambda package
 * - Tidak ada konflik ESM/CJS
 */
const { handler } = require('../dist/lambda');

exports.handler = handler;
