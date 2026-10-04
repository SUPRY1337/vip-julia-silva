import { promises as fs } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const videosDir = path.join(root, 'public', 'videos');
const output = path.join(videosDir, 'catalog.json');
const extensions = new Set(['.mp4', '.webm', '.mov', '.m4v', '.ogg', '.jpg', '.jpeg', '.png', '.webp', '.gif']);
const mime = { '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime', '.m4v': 'video/x-m4v', '.ogg': 'video/ogg', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif' };

const titleFromFilename = (filename) => path.basename(filename, path.extname(filename)).replace(/[._-]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/\b\w/g, (letter) => letter.toUpperCase()) || 'Vídeo sem título';
const categoryFromPath = (relative) => {
  const folder = relative.split('/').slice(0, -1).join(' ').toLowerCase();
  if (/vip\s*1|vip1/.test(folder)) return 'VIP 1';
  if (/vip\s*2|vip2/.test(folder)) return 'VIP 2';
  if (/vip\s*3|vip3/.test(folder)) return 'VIP 3';
  return 'Coleção';
};

async function collect(directory, prefix = '') {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const videos = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'catalog.json') continue;
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) videos.push(...await collect(absolute, relative));
    else if (extensions.has(path.extname(entry.name).toLowerCase())) {
      const stat = await fs.stat(absolute);
      const extension = path.extname(entry.name).toLowerCase();
      videos.push({ id: Buffer.from(relative).toString('base64url'), title: titleFromFilename(entry.name), category: categoryFromPath(relative), filename: relative, src: `videos/${relative.split('/').map(encodeURIComponent).join('/')}`, type: mime[extension], kind: extension.startsWith('.') && ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(extension) ? 'image' : 'video', size: stat.size, updatedAt: stat.mtime.toISOString() });
    }
  }
  return videos.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

await fs.mkdir(videosDir, { recursive: true });
const videos = await collect(videosDir);
await fs.writeFile(output, JSON.stringify({ videos, generatedAt: new Date().toISOString() }, null, 2) + '\n');
console.log(`Catálogo gerado: ${videos.length} vídeo(s)`);
