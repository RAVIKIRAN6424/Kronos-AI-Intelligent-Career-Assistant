import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

function patchHtmlForFileProtocol(filePath) {
  if (!fs.existsSync(filePath)) return;
  let html = fs.readFileSync(filePath, 'utf8');

  if (!html.includes('__kronos_file_protocol_loader__')) {
    const loaderScript = `
    <!-- Universal Lightweight SystemJS & File-Protocol Execution Engine -->
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
                var eSrc = entry ? (entry.getAttribute('data-src') || entry.getAttribute('src')) : './assets/index-legacy-JOFvYokB.js';

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
  console.log('🔄 Synchronizing build outputs for Root, Dist, and IIS...');

  const frontendDist = path.join(__dirname, 'frontend', 'dist');
  const rootDist = path.join(__dirname, 'dist');
  const rootDir = __dirname;
  const webConfigPath = path.join(__dirname, 'web.config');

  if (!fs.existsSync(frontendDist)) {
    console.error('❌ frontend/dist directory does not exist. Run vite build first.');
    process.exit(1);
  }

  // 1. Patch frontend/dist/index.html first
  patchHtmlForFileProtocol(path.join(frontendDist, 'index.html'));

  // 2. Copy frontend/dist to root/dist
  copyDirRecursive(frontendDist, rootDist);

  // 3. Copy frontend/dist/index.html to root/index.html
  const distIndexHtml = path.join(frontendDist, 'index.html');
  const rootIndexHtml = path.join(rootDir, 'index.html');
  if (fs.existsSync(distIndexHtml)) {
    fs.copyFileSync(distIndexHtml, rootIndexHtml);
    patchHtmlForFileProtocol(rootIndexHtml);
    console.log('✅ Synchronized root index.html with file-protocol support.');
  }

  // 4. Copy frontend/dist/assets to root/assets and frontend/assets
  const distAssets = path.join(frontendDist, 'assets');
  const rootAssets = path.join(rootDir, 'assets');
  const frontendAssets = path.join(__dirname, 'frontend', 'assets');

  if (fs.existsSync(distAssets)) {
    copyDirRecursive(distAssets, rootAssets);
    copyDirRecursive(distAssets, frontendAssets);
    console.log('✅ Synchronized root and frontend assets directories with production build.');
  }

  // 5. Copy production index.html to frontend/index.html (so IIS pointed to frontend works!)
  const frontendIndexHtml = path.join(__dirname, 'frontend', 'index.html');
  if (fs.existsSync(distIndexHtml)) {
    fs.copyFileSync(distIndexHtml, frontendIndexHtml);
    patchHtmlForFileProtocol(frontendIndexHtml);
    console.log('✅ Synchronized frontend/index.html with production build.');
  }

  // 6. Ensure web.config exists in root, dist, frontend, and frontend/dist
  if (fs.existsSync(webConfigPath)) {
    fs.copyFileSync(webConfigPath, path.join(rootDist, 'web.config'));
    fs.copyFileSync(webConfigPath, path.join(frontendDist, 'web.config'));
    fs.copyFileSync(webConfigPath, path.join(__dirname, 'frontend', 'web.config'));
    console.log('✅ Synchronized web.config to dist/, frontend/, and frontend/dist/.');
  }

  console.log('🎉 Production build sync complete! Ready for IIS, EC2, Localhost:8080, and Direct Double-Click.');
} catch (err) {
  console.error('❌ Error during dist sync:', err);
  process.exit(1);
}

