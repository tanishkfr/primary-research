import { get, list } from '@vercel/blob';
import { fields, csvEscape, isAdminRequest, isStorageConfigured, json, responsePrefix } from './_shared.mjs';

async function readResponse(pathname) {
  const result = await get(pathname, { access: 'private', useCache: false });
  if (!result || result.statusCode !== 200 || !result.stream) return null;
  return JSON.parse(await new Response(result.stream).text());
}

async function fetchHandler(request) {
  if (request.method !== 'GET') return json({ error: 'Method not allowed.' }, 405);
  if (!isAdminRequest(request)) return new Response('Not found', { status: 404 });
  if (!isStorageConfigured()) return json({ error: 'Response storage is not configured.' }, 503);

  try {
    const blobs = [];
    let cursor;
    do {
      const page = await list({ prefix: responsePrefix, limit: 1000, cursor });
      blobs.push(...page.blobs);
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);

    const records = (await Promise.all(blobs.map((blob) => readResponse(blob.pathname))))
      .filter(Boolean)
      .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
    const header = ['Response ID', 'Submitted (UTC)', ...fields.map(([, label]) => label)].map(csvEscape).join(',');
    const rows = records.map((record) => [record.responseId, record.submittedAt, ...fields.map(([key]) => record.answers?.[key] || '')].map(csvEscape).join(','));
    const csv = `\uFEFF${header}\n${rows.join('\n')}${rows.length ? '\n' : ''}`;
    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="primary-research-responses.csv"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Response export failed', error);
    return json({ error: 'The response export could not be generated.' }, 500);
  }
}

export default { fetch: fetchHandler };
