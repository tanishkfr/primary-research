import { get, list } from '@vercel/blob';
import { responsePrefix } from './_shared.mjs';

async function readResponse(pathname) {
  try {
    const result = await get(pathname, { access: 'private', useCache: false });
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    return JSON.parse(await new Response(result.stream).text());
  } catch (error) {
    console.error('Skipping unreadable response blob', pathname, error);
    return null;
  }
}

export async function loadResponseRecords() {
  const blobs = [];
  let cursor;
  do {
    const page = await list({ prefix: responsePrefix, limit: 1000, cursor });
    blobs.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  return (await Promise.all(blobs.map((blob) => readResponse(blob.pathname))))
    .filter(Boolean)
    .sort((a, b) => String(a.submittedAt || '').localeCompare(String(b.submittedAt || '')));
}
