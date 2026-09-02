export const fields = [
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

export const requiredFields = ['q1', 'q2', 'q3', 'q11', 'q13'];
export const responsePrefix = 'questionnaire/responses/';

export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extraHeaders },
  });
}

export function csvEscape(value) {
  const text = String(value ?? '').replaceAll('\r\n', '\n').replaceAll('\r', '\n');
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function isStorageConfigured() {
  return Boolean((process.env.BLOB_STORE_ID && process.env.VERCEL_OIDC_TOKEN) || process.env.BLOB_READ_WRITE_TOKEN);
}

export function isAdminRequest(request) {
  const key = new URL(request.url).searchParams.get('key');
  return Boolean(process.env.ADMIN_KEY && key && key === process.env.ADMIN_KEY);
}
