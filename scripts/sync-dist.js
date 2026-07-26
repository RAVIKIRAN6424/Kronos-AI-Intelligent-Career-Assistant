import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function patchHtmlForFileProtocol(filePath, distAssetsDir) {
  if (!fs.existsSync(filePath)) return;
  let html = fs.readFileSync(filePath, 'utf8');

  // Remove source template redirect from compiled output files
  html = html.replace(/<script id="__kronos_src_redirect__">[\s\S]*?<\/script>/gi, '');

  let legacyJsName = 'index-legacy-BBH8HwjI.js';
  if (distAssetsDir && fs.existsSync(distAssetsDir)) {
    const files = fs.readdirSync(distAssetsDir);
    const found = files.find(f => f.startsWith('index-legacy-') && f.endsWith('.js'));
    if (found) legacyJsName = found;
  }

  if (!html.includes('__kronos_file_protocol_loader__')) {
    const loaderScript = `
    <!-- Universal Lightweight SystemJS Execution Engine -->
    <script id="__kronos_file_protocol_loader__">
      (function() {
        var modules = {};
        window.System = window.System || {
          register: function(name, deps, declare) {
            if (typeof name !== 'string') {
              declare = deps;
              deps = name;
              name = 'main';
            }
            window.__lastRegister = { deps: deps, declare: declare };
          },
          import: function(name) {
            return new Promise(function(resolve, reject) {
              var s = document.createElement('script');
              s.src = name;
              s.onload = function() {
                var reg = window.__lastRegister;
                if (reg && reg.declare) {
                  var exports = {};
                  var context = { id: name, meta: { url: window.location.href } };
                  var exec = reg.declare(function(k, v) {
                    if (typeof k === 'object') {
                      for (var key in k) exports[key] = k[key];
                    } else {
                      exports[k] = v;
                    }
                  }, context);
                  if (exec && exec.setters) {
                    exec.setters.forEach(function(sFn) { if (sFn) sFn({}); });
                  }
                  if (exec && exec.execute) {
                    try {
                      exec.execute();
                    } catch(e) {
                      console.error('[Kronos SystemJS Execute Error]:', e);
                    }
                  }
                  resolve(exports);
                } else {
                  resolve({});
                }
              };
              s.onerror = function(err) {
                console.warn('[Kronos SystemJS Load Warning]:', name, err);
                resolve({});
              };
              document.head.appendChild(s);
            });
          }
        };

        if (window.location.protocol === 'file:') {
          console.log('⚡ File Protocol detected: Launching Kronos Standalone Engine...');
          window.__vite_is_modern_browser = false;

          document.addEventListener('DOMContentLoaded', function() {
            setTimeout(function() {
              var rootEl = document.getElementById('root');
              if (rootEl && (!rootEl.children || rootEl.children.length === 0)) {
                var polyfill = document.getElementById('vite-legacy-polyfill');
                var entry = document.getElementById('vite-legacy-entry');
                var pSrc = polyfill ? polyfill.getAttribute('src') : './assets/polyfills-legacy-DJs1nuYO.js';
                var eSrc = entry ? (entry.getAttribute('data-src') || entry.getAttribute('src')) : './assets/${legacyJsName}';

                var sPoly = document.createElement('script');
                sPoly.src = pSrc;
                sPoly.onload = function() {
                  window.System.import(eSrc);
                };
                sPoly.onerror = function() {
                  window.System.import(eSrc);
                };
                document.head.appendChild(sPoly);
              }
            }, 100);
          });
        }
      })();
    </script>
    `;
    html = html.replace('</head>', `${loaderScript}\n</head>`);
    fs.writeFileSync(filePath, html, 'utf8');
  }
}

try {
  console.log('🔄 Synchronizing build outputs for Frontend & Dist...');

  const frontendDist = path.join(rootDir, 'frontend', 'dist');
  const rootDist = path.join(rootDir, 'dist');
  const deploymentWebConfig = path.join(rootDir, 'deployment', 'web.config');

  if (!fs.existsSync(frontendDist)) {
    console.error('❌ frontend/dist directory does not exist. Run vite build first.');
    process.exit(1);
  }

  const distAssets = path.join(frontendDist, 'assets');

  // 1. Patch frontend/dist/index.html
  patchHtmlForFileProtocol(path.join(frontendDist, 'index.html'), distAssets);

  // 2. Copy frontend/dist to root/dist
  copyDirRecursive(frontendDist, rootDist);

  // 3. Update frontend/index.html with production asset hashes
  const frontendSourceIndex = path.join(rootDir, 'frontend', 'index.html');
  if (fs.existsSync(frontendSourceIndex) && fs.existsSync(distAssets)) {
    let srcHtml = fs.readFileSync(frontendSourceIndex, 'utf8');
    const assetFiles = fs.readdirSync(distAssets);
    const modernJs = assetFiles.find(f => f.startsWith('index-') && !f.includes('legacy') && f.endsWith('.js')) || 'index-BZTC8CmI.js';
    const mainCss = assetFiles.find(f => f.startsWith('index-') && f.endsWith('.css')) || 'index-ClO9OIkj.css';

    srcHtml = srcHtml.replace(/['"](?:\.\/|\.\.\/|\/)*assets\/index-[^'"]+\.js['"]/g, `'./assets/${modernJs}'`);
    srcHtml = srcHtml.replace(/['"](?:\.\/|\.\.\/|\/)*assets\/index-[^'"]+\.css['"]/g, `'./assets/${mainCss}'`);
    fs.writeFileSync(frontendSourceIndex, srcHtml, 'utf8');
    console.log('✅ Synchronized frontend/index.html asset hashes.');
  }

  // 4. Ensure deployment/web.config is synchronized to dist/ & frontend/
  if (fs.existsSync(deploymentWebConfig)) {
    fs.copyFileSync(deploymentWebConfig, path.join(rootDist, 'web.config'));
    fs.copyFileSync(deploymentWebConfig, path.join(frontendDist, 'web.config'));
    fs.copyFileSync(deploymentWebConfig, path.join(rootDir, 'frontend', 'web.config'));
    console.log('✅ Synchronized deployment/web.config to dist/ and frontend/.');
  }

  console.log('🎉 Build sync complete!');
} catch (err) {
  console.error('❌ Error during dist sync:', err);
  process.exit(1);
}
