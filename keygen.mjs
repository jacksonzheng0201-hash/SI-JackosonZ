import { readFile } from 'node:fs/promises';
import { parseEnv } from 'node:util';

const unfilled = /^(?:paste|your|put|type|enter)[\s_-]/i;
const cache = { url: '', token: '', apiKey: '', expiresAt: 0 };
let queue = Promise.resolve();

export class KeygenError extends Error {
  constructor(message, fix, status) {
    super(message);
    this.name = 'KeygenError';
    this.fix = fix;
    this.status = status;
  }
}

async function readDotEnv(root) {
  try { return parseEnv(await readFile(new URL('.env', root), 'utf8')); }
  catch { return {}; }
}

export async function keygenSetup(root = new URL('./', import.meta.url), env = process.env) {
  const file = root ? await readDotEnv(root) : {};
  const values = { ...file, ...env };
  const url = values.KEYGEN_URL?.trim() || '';
  const token = values.KEYGEN_TOKEN?.trim() || '';
  return {
    url: unfilled.test(url) ? '' : url,
    token: unfilled.test(token) ? '' : token,
    ready: !unfilled.test(url) && !unfilled.test(token) && Boolean(url && token),
  };
}

function errorFields(payload, status) {
  const message = typeof payload?.error?.message === 'string' && payload.error.message.trim()
    ? payload.error.message.trim()
    : 'The AI sign-in service did not answer. Please try again.';
  const fix = typeof payload?.error?.fix === 'string' && payload.error.fix.trim()
    ? payload.error.fix.trim()
    : 'Check KEYGEN_URL and KEYGEN_TOKEN with a trusted adult.';
  return { message, fix, status };
}

async function requestKey(url, token, fetchImpl) {
  let base;
  try { base = new URL(url); }
  catch { throw new KeygenError('The AI sign-in address in .env is not valid. Ask a trusted adult to check KEYGEN_URL.', 'Use the full https:// address supplied by MindDo in KEYGEN_URL.', 503); }
  const endpoint = new URL('api/lookup-key', base.href).href;
  let response;
  try {
    response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: '{}',
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    throw new KeygenError('The AI sign-in service could not be reached. Please check the internet connection.', 'Check KEYGEN_URL and the internet connection with a trusted adult.', 503);
  }
  let payload;
  try { payload = await response.json(); }
  catch { payload = undefined; }
  if (!response.ok) {
    const fields = errorFields(payload, response.status);
    throw new KeygenError(fields.message, fields.fix, fields.status);
  }
  const apiKey = typeof payload?.apiKey === 'string' ? payload.apiKey.trim() : '';
  const expiry = Date.parse(payload?.expiresAt ?? '') || Number(payload?.expiresAt);
  if (!apiKey || !Number.isFinite(expiry) || apiKey.length > 4096) {
    throw new KeygenError('The AI sign-in service sent an unusable reply. Please try again.', 'Ask a trusted adult to check the MindDo lookup-key response.', response.status);
  }
  return { apiKey, expiresAt: Math.max(0, expiry) };
}

export async function getKey({ root = new URL('./', import.meta.url), fetchImpl = fetch, now = () => Date.now(), env = process.env } = {}) {
  const setup = await keygenSetup(root, env);
  if (!setup.ready) throw new KeygenError('The AI is switched off because KEYGEN_URL or KEYGEN_TOKEN is still empty in .env. Ask a trusted adult to add both values, save that file, then refresh this page. Your question was not sent and nothing was charged.', 'Add KEYGEN_URL and KEYGEN_TOKEN to the private .env file or Vercel environment variables; never commit that file.', 503);
  if (cache.url && (cache.url !== setup.url || cache.token !== setup.token)) Object.assign(cache, { apiKey: '', expiresAt: 0 });
  cache.url = setup.url;
  cache.token = setup.token;
  const lookup = queue.then(async () => {
    if (cache.apiKey && cache.expiresAt > now()) return cache.apiKey;
    const result = await requestKey(setup.url, setup.token, fetchImpl);
    Object.assign(cache, { apiKey: result.apiKey, expiresAt: result.expiresAt });
    return result.apiKey;
  });
  queue = lookup.catch(() => {});
  return lookup;
}

export function invalidateKey(rejectedKey) {
  if (cache.apiKey && rejectedKey === cache.apiKey) Object.assign(cache, { apiKey: '', expiresAt: 0 });
  return Boolean(cache.url && cache.token && !cache.apiKey);
}

export function resetKeyCache() {
  Object.assign(cache, { url: '', token: '', apiKey: '', expiresAt: 0 });
  queue = Promise.resolve();
}
