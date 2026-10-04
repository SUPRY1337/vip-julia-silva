import { createServer } from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, 'public');
const videosDir = path.join(publicDir, 'videos');
const port = Number(process.env.PORT || 3000);

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.m4v': 'video/x-m4v',
  '.ogg': 'video/ogg'
};
const mediaExtensions = new Set(['.mp4', '.webm', '.mov', '.m4v', '.ogg', '.jpg', '.jpeg', '.png', '.webp', '.gif']);

function titleFromFilename(filename) {
  return path.basename(filename, path.extname(filename))
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase()) || 'Vídeo sem título';
}

function categoryFromRelativePath(relativePath) {
  const folder = relativePath.split('/').slice(0, -1).join(' ').toLowerCase();
  if (/vip\s*1|vip1/.test(folder)) return 'VIP 1';
  if (/vip\s*2|vip2/.test(folder)) return 'VIP 2';
  if (/vip\s*3|vip3/.test(folder)) return 'VIP 3';
  return 'Coleção';
}

async function collectVideos(directory, prefix = '') {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const videos = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const absolute = path.join(directory, entry.name);
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      videos.push(...await collectVideos(absolute, relative));
      continue;
    }
    const extension = path.extname(entry.name).toLowerCase();
    if (!mediaExtensions.has(extension)) continue;
    const stat = await fs.stat(absolute);
    videos.push({
      id: Buffer.from(relative).toString('base64url'),
      title: titleFromFilename(entry.name),
      category: categoryFromRelativePath(relative),
      filename: relative,
      src: `/videos/${relative.split('/').map(encodeURIComponent).join('/')}`,
      type: mimeTypes[extension] || 'video/mp4',
      kind: extension.startsWith('.') && ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(extension) ? 'image' : 'video',
      size: stat.size,
      updatedAt: stat.mtime.toISOString()
    });
  }
  return videos.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function sendJson(response, status, payload) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(payload));
}

async function serveStatic(request, response) {
  const requestPath = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  const target = requestPath === '/' ? '/index.html' : requestPath;
  const resolved = path.resolve(publicDir, `.${target}`);
  if (!resolved.startsWith(`${path.resolve(publicDir)}${path.sep}`)) {
    sendJson(response, 403, { error: 'Acesso negado.' });
    return;
  }
  try {
    const stat = await fs.stat(resolved);
    if (!stat.isFile()) throw new Error('not-file');
    response.writeHead(200, { 'Content-Type': mimeTypes[path.extname(resolved).toLowerCase()] || 'application/octet-stream' });
    createReadStream(resolved).pipe(response);
  } catch {
    sendJson(response, 404, { error: 'Arquivo não encontrado.' });
  }
}

const { createReadStream } = await import('node:fs');
await fs.mkdir(videosDir, { recursive: true });

createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost');
    if (request.method === 'GET' && url.pathname === '/api/videos') {
      const videos = await collectVideos(videosDir);
      sendJson(response, 200, { videos, generatedAt: new Date().toISOString() });
      return;
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      sendJson(response, 405, { error: 'Método não permitido.' });
      return;
    }
    await serveStatic(request, response);
  } catch (error) {
    console.error(error);
    sendJson(response, 500, { error: 'Não foi possível carregar a biblioteca.' });
  }
}).listen(port, '0.0.0.0', () => {
  console.log(`VIP JULIA SILVA disponível em http://0.0.0.0:${port}`);
});
