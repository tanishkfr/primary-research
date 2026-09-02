import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = path.join(projectRoot, 'public');
const staticFiles = ['index.html', 'admin.html', 'app.js', 'admin.js', 'styles.css'];

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

await Promise.all(staticFiles.map((file) => cp(path.join(projectRoot, file), path.join(outputDir, file))));
console.log(`Prepared ${staticFiles.length} static files for Vercel.`);
