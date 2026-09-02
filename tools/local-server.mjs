import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const serverDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(serverDir, '..');
const dataDir = path.join(root, 'data');
const csvPath = path.join(dataDir, 'responses.csv');
const port = Number(process.env.PORT || 4173);
const adminKey = process.env.ADMIN_KEY || '';

const fields = [
  ['q1', 'Age range'],
  ['q2', 'Major or field'],
  ['q3', 'Digital media for learning'],
  ['q4', 'Most-used learning tools'],
  ['q5', 'Self-learning apps and resources'],
  ['q6', 'Resource organisation'],
  ['q7', 'Information retention'],
  ['q8', 'Essential learning tool'],
  ['q9', 'Learning style'],
  ['q10', 'Platform switching and focus'],
  ['q11', 'Difficult concepts'],
  ['q12', 'AI explanations and independent reproduction'],
  ['q13', 'Identifying knowledge gaps'],
  ['q14', 'Tracking mastery and review'],
  ['q15', 'Notifications and consistency'],
];

const csvEscape = (value) => {
  const text = String(value ?? '').replaceAll('\r\n', '\n').replaceAll('\r', '\n');
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};
const csvHeader = ['Response ID', 'Submitted (UTC)', ...fields.map(([, label]) => label)].map(csvEscape).join(',');

async function ensureDataFile() {
  await fs.mkdir(dataDir, { recursive: true });
  try { await fs.access(csvPath); } catch { await fs.writeFile(csvPath, `\uFEFF${csvHeader}\n`, 'utf8'); }
}

function send(res, status, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(body);
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  if (raw.length > 100_000) throw new Error('Payload too large');
  return JSON.parse(raw || '{}');
}

async function handleApi(req, res, url) {
  if (req.method === 'GET' && url.pathname === '/health') return send(res, 200, JSON.stringify({ ok: true }), 'application/json');
  if (req.method === 'POST' && url.pathname === '/api/responses') {
    try {
      const payload = await readBody(req);
      if (payload.website) return send(res, 204, '');
      const answers = payload.answers || {};
      const missing = ['q1', 'q2', 'q3', 'q11', 'q13'].some((key) => typeof answers[key] !== 'string' || !answers[key].trim());
      if (missing) return send(res, 400, JSON.stringify({ error: 'Required answers are missing.' }), 'application/json');
      const row = [crypto.randomUUID(), new Date().toISOString(), ...fields.map(([key]) => answers[key] || '')].map(csvEscape).join(',');
      await ensureDataFile();
      await fs.appendFile(csvPath, `${row}\n`, 'utf8');
      return send(res, 201, JSON.stringify({ ok: true }), 'application/json');
    } catch {
      return send(res, 400, JSON.stringify({ error: 'Invalid submission.' }), 'application/json');
    }
  }
  if (req.method === 'GET' && url.pathname === '/admin/download') {
    if (!adminKey || url.searchParams.get('key') !== adminKey) return send(res, 404, 'Not found');
    await ensureDataFile();
    const csv = await fs.readFile(csvPath);
    res.writeHead(200, { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="responses.csv"', 'Cache-Control': 'no-store' });
    return res.end(csv);
  }
  return false;
}

async function serveStatic(req, res, url) {
  let requestPath;
  try {
    requestPath = decodeURIComponent(url.pathname);
  } catch {
    return send(res, 400, 'Bad request');
  }
  const routes = { '/': 'index.html', '/admin': 'admin.html' };
  const relativePath = routes[requestPath] || requestPath.replace(/^\/+/, '');
  const publicFiles = new Set(['index.html', 'admin.html', 'app.js', 'admin.js', 'styles.css']);
  if (!publicFiles.has(relativePath)) return send(res, 404, 'Not found');
  const safePath = path.resolve(root, relativePath);
  if (!safePath.startsWith(`${root}${path.sep}`)) return send(res, 403, 'Forbidden');
  try {
    const body = await fs.readFile(safePath);
    const ext = path.extname(safePath);
    const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };
    return send(res, 200, body, types[ext] || 'application/octet-stream');
  } catch { return send(res, 404, 'Not found'); }
}

await ensureDataFile();
http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const handled = await handleApi(req, res, url);
  if (handled !== false) return;
  if (req.method !== 'GET') return send(res, 405, 'Method not allowed');
  return serveStatic(req, res, url);
}).listen(port, '0.0.0.0', () => {
  console.log(`How We Learn Now is running at http://localhost:${port}`);
  console.log(`Response log: ${csvPath}`);
  if (adminKey) console.log(`Admin export: http://localhost:${port}/admin/download?key=${adminKey}`);
});
