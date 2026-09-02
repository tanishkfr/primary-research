import { fields, csvEscape, isAdminRequest, isStorageConfigured, json } from './_shared.mjs';
import { loadResponseRecords } from './_response-log.mjs';

async function fetchHandler(request) {
  if (request.method !== 'GET') return json({ error: 'Method not allowed.' }, 405);
  if (!isAdminRequest(request)) return new Response('Not found', { status: 404 });
  if (!isStorageConfigured()) return json({ error: 'Response storage is not configured.' }, 503);

  try {
    const records = await loadResponseRecords();
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
