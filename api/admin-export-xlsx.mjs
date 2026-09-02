import { isAdminRequest, isStorageConfigured, json } from './_shared.mjs';
import { loadResponseRecords } from './_response-log.mjs';
import { buildResponseWorkbook } from './_xlsx.mjs';

async function fetchHandler(request) {
  if (request.method !== 'GET') return json({ error: 'Method not allowed.' }, 405);
  if (!isAdminRequest(request)) return new Response('Not found', { status: 404 });
  if (!isStorageConfigured()) return json({ error: 'Response storage is not configured.' }, 503);

  try {
    const records = await loadResponseRecords();
    const workbook = await buildResponseWorkbook(records);
    const buffer = await workbook.xlsx.writeBuffer();
    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="primary-research-responses.xlsx"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('XLSX export failed', error);
    return json({ error: 'The Excel export could not be generated.' }, 500);
  }
}

export default { fetch: fetchHandler };
