import { put } from '@vercel/blob';
import { randomUUID } from 'node:crypto';
import { fields, json, requiredFields, responsePrefix, isStorageConfigured } from './_shared.mjs';

async function fetchHandler(request) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204 });
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

  try {
    if (!isStorageConfigured()) return json({ error: 'Response storage is not configured.' }, 503);
    const payload = await request.json();
    if (payload.website) return new Response(null, { status: 204 });
    const answers = payload.answers || {};
    const validAnswers = Object.fromEntries(fields.map(([key]) => [key, typeof answers[key] === 'string' ? answers[key].trim().slice(0, 10000) : '']));
    if (requiredFields.some((key) => !validAnswers[key])) return json({ error: 'Required answers are missing.' }, 400);

    const response = {
      responseId: randomUUID(),
      submittedAt: new Date().toISOString(),
      answers: validAnswers,
    };
    await put(`${responsePrefix}${response.responseId}.json`, JSON.stringify(response), {
      access: 'private',
      contentType: 'application/json',
      addRandomSuffix: false,
    });
    return json({ ok: true }, 201);
  } catch (error) {
    console.error('Response submission failed', error);
    return json({ error: 'The response could not be saved.' }, 500);
  }
}

export default { fetch: fetchHandler };
