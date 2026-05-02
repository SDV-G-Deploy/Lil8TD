import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
const root = process.cwd();
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8' };
const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const safe = normalize(url.pathname).replace(/^([/\\]*\.\.[/\\])+/, '');
  const file = join(root, safe === '/' ? 'index.html' : safe);
  if (!file.startsWith(root)) { res.writeHead(403).end('forbidden'); return; }
  try { const st = statSync(file); if (!st.isFile()) throw new Error('not file'); res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' }); createReadStream(file).pipe(res); }
  catch { res.writeHead(404).end('not found'); }
});
const port = Number(process.env.PORT || 4173);
server.listen(port, () => console.log(`Lil8TD local slice: http://localhost:${port}`));
