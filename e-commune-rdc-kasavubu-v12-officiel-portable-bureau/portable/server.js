const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const root = __dirname;
const host = '127.0.0.1';
const basePort = Number(process.env.PORT || 3000);
const maxPort = basePort + 10;
const appVersion = '12.0.0';

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

function openBrowser(url) {
  if (process.env.NO_BROWSER === '1' || process.platform !== 'win32') return;
  setTimeout(() => exec(`start "" "${url}"`), 500);
}

function sendFile(res, file) {
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Fichier introuvable');
    }
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, {
      'Content-Type': mime[ext] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    res.end(data);
  });
}

function rememberUrl(url, label = 'OK') {
  try {
    fs.mkdirSync(path.join(root, '..', 'logs'), { recursive: true });
    fs.writeFileSync(path.join(root, '..', 'logs', 'url.txt'), url, 'utf8');
    fs.appendFileSync(
      path.join(root, '..', 'logs', 'demarrage-portable.log'),
      `${new Date().toISOString()} ${label} ${url} Node ${process.version}\n`,
      'utf8'
    );
  } catch (_) {}
}

function probe(port) {
  return new Promise((resolve) => {
    const req = http.get({ host, port, path: '/api/health', timeout: 350 }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          resolve(Boolean(data && data.ok && data.app === 'e-Commune RDC' && data.version === appVersion) ? `http://${host}:${port}` : null);
        } catch (_) {
          resolve(null);
        }
      });
    });
    req.on('timeout', () => { req.destroy(); resolve(null); });
    req.on('error', () => resolve(null));
  });
}

async function findExisting() {
  for (let port = basePort; port <= maxPort; port += 1) {
    const url = await probe(port);
    if (url) return url;
  }
  return null;
}

function createServer(port) {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${host}:${port}`);
    if (url.pathname === '/api/health') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ ok: true, app: 'e-Commune RDC', commune: 'Kasa-Vubu', mode: 'portable-node', version: appVersion, port }));
    }
    if (url.pathname === '/api/runtime') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ node: process.version, platform: process.platform, arch: process.arch, pid: process.pid }));
    }

    let relative = decodeURIComponent(url.pathname);
    if (relative === '/' || relative === '/connexion') relative = '/index.html';
    const file = path.join(root, relative.replace(/^\/+/, ''));
    if (!file.startsWith(root)) {
      res.writeHead(403);
      return res.end('Interdit');
    }
    sendFile(res, file);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && port < maxPort) {
      createServer(port + 1);
    } else {
      console.error('\n[ERREUR] Impossible de demarrer e-Commune:', err.message);
      process.exitCode = 1;
    }
  });

  server.listen(port, host, () => {
    const url = `http://${host}:${port}`;
    console.log('============================================================');
    console.log(' e-COMMUNE RDC - KASA-VUBU');
    console.log('============================================================');
    console.log(`[OK] Serveur Node.js demarre sur ${url}`);
    console.log(`[OK] Node.js ${process.version}`);
    console.log(`[OK] Interface officielle V${appVersion}`);
    console.log('[INFO] Aucun npm install, aucun Docker requis pour ce mode.');
    console.log('[INFO] Fermez cette fenetre ou faites Ctrl+C pour arreter.');
    console.log('============================================================\n');
    rememberUrl(url, 'OK');
    openBrowser(url);
  });
}

(async () => {
  const existing = await findExisting();
  if (existing) {
    console.log(`[OK] e-Commune est deja ouvert sur ${existing}`);
    rememberUrl(existing, 'EXISTING');
    openBrowser(existing);
    return;
  }
  createServer(basePort);
})();
