import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { askOpenAI, getAIConfig } from './openai.mjs';
import { containsPersonalInformation, privacyMessage } from './public/privacy.js';
import { goalTypes, validGoal } from './public/goals.js';

const root = new URL('./', import.meta.url);
const staticFiles = new Map([
  ['/', ['index.html', 'text/html']],
  ['/style.css', ['style.css', 'text/css']],
  ...['app', 'goals', 'storage', 'privacy', 'articles'].map(name => [`/${name}.js`, [`${name}.js`, 'text/javascript']]),
  ['/favicon.svg', ['favicon.svg', 'image/svg+xml']],
]);
const unavailable = 'The AI could not answer. Please ask a trusted adult to check the key in .env, the model in NOTES.md, and your internet connection, then try again.';
const setupNeeded = missing => `The AI is switched off because ${missing} ${missing.includes(' and ') ? 'are' : 'is'} still empty. Ask a trusted adult to add the value, save that file, then refresh this page. Your question was not sent and nothing was charged.`;

export function createApp({ projectRoot = root, ai = askOpenAI, configReader = getAIConfig } = {}) {
  const sessions = new Map();
  const server = createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    const json = (status, value) => {
      res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(value));
    };
    const host = req.headers.host || '';
    if (!/^(localhost|127\.0\.0\.1):\d+$/.test(host)) return json(403, { error: 'This app is available on this computer only.' });
    const path = new URL(req.url, `http://${host}`).pathname;
    try {
      if (req.method === 'GET' && staticFiles.has(path)) {
        const [file, type] = staticFiles.get(path);
        const body = await readFile(new URL(`public/${file}`, projectRoot));
        res.writeHead(200, { 'Content-Type': `${type}; charset=utf-8` });
        return res.end(body);
      }
      if (!path.startsWith('/api/')) return json(404, { error: 'Page not found.' });
      const now = Date.now();
      for (const [id, session] of sessions) if (session.expires < now) sessions.delete(id);
      const cookie = req.headers.cookie?.match(/(?:^|;\s*)dp_session=([a-f0-9-]{36})(?:;|$)/)?.[1];
      let session = sessions.get(cookie);
      if (req.method === 'GET' && path === '/api/config') {
        if (!session) {
          if (sessions.size >= 200) return json(503, { error: 'Please try again a little later.' });
          const id = randomUUID();
          session = { strikes: 0, busy: false, requests: 0, window: now, expires: now + 86400000 };
          sessions.set(id, session);
          res.setHeader('Set-Cookie', `dp_session=${id}; HttpOnly; SameSite=Strict; Path=/; Max-Age=86400`);
        }
        const config = configReader(projectRoot);
        return json(200, { ready: config.ready, model: config.model, privacyStrikes: session.strikes });
      }
      if (req.method !== 'POST') return json(405, { error: 'That action is not available.' });
      if (req.headers.origin !== `http://${host}`) return json(403, { error: 'Please use the De-Pollution page on this computer.' });
      if (!session) return json(401, { error: 'Please refresh the page and try again.' });
      if (path === '/api/privacy-warning') {
        session.strikes = Math.min(2, session.strikes + 1);
        return json(200, { privacyStrikes: session.strikes, error: privacyMessage(session.strikes) });
      }
      if (path !== '/api/ask') return json(404, { error: 'Page not found.' });
      if (session.strikes >= 2) return json(423, { error: privacyMessage(2), privacyStrikes: 2 });
      if (session.busy) return json(429, { error: 'Your guide is already thinking. Please wait for its answer.' });
      if (!req.headers['content-type']?.startsWith('application/json')) return json(415, { error: 'Please send your question using the check mark.' });
      let length = 0;
      const chunks = [];
      for await (const chunk of req) {
        length += chunk.length;
        if (length > 8192) return json(413, { error: 'Please ask a shorter question.' });
        chunks.push(chunk);
      }
      let data;
      try { data = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
      catch { return json(400, { error: 'Please try typing your question again.' }); }
      if (typeof data?.question !== 'string' || !data.question.trim() || data.question.length > 600 || !validGoal(data.goal)) {
        return json(400, { error: 'Choose a goal and enter a question of 1–600 characters.' });
      }
      if (containsPersonalInformation(data.question)) {
        session.strikes = Math.min(2, session.strikes + 1);
        return json(422, { error: privacyMessage(session.strikes), privacyStrikes: session.strikes });
      }
      if (now - session.window > 600000) { session.requests = 0; session.window = now; }
      if (session.requests >= 20) return json(429, { error: 'Let’s take a short break. You can ask again in about ten minutes.' });
      const aiConfig = configReader(projectRoot);
      if (!aiConfig.ready) {
        const missing = [!aiConfig.key && 'the key in .env', !aiConfig.model && 'the model in NOTES.md'].filter(Boolean).join(' and ') || 'the AI setup';
        return json(503, { error: setupNeeded(missing) });
      }
      if (session.busy) return json(429, { error: 'Your guide is already thinking. Please wait for its answer.' });
      session.busy = true;
      session.requests += 1;
      try {
        const type = goalTypes[data.goal.kind];
        const goal = { kind: data.goal.kind, target: data.goal.target, completed: data.goal.completed, unit: type.unit };
        const result = await ai({
          root: projectRoot, goal, question: data.question.trim(),
          goalContext: { label: type.label, hint: type.hint },
        });
        if (result.safety === 'personal_info') {
          session.strikes = Math.min(2, session.strikes + 1);
          const error = session.strikes >= 2 ? privacyMessage(2) : 'The AI noticed possible personal information. Please remove it. If it happens again, the AI space will close.';
          return json(422, { error, privacyStrikes: session.strikes });
        }
        if (!['goal', 'off_topic'].includes(result.classification)) return json(502, { error: 'The guide could not safely categorize that question. Please try asking about your goal again.' });
        if (containsPersonalInformation(result.answer)) return json(502, { error: 'The reply did not pass our privacy check. Please ask a different question without personal details.' });
        return json(200, { answer: result.answer, sources: result.sources, classification: result.classification });
      } catch {
        return json(503, { error: unavailable });
      } finally {
        session.busy = false;
      }
    } catch {
      if (!res.headersSent) json(500, { error: 'Something went wrong. Please refresh the page and try again.' });
    }
  });
  server.requestTimeout = 40000;
  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const server = createApp();
  server.on('error', error => {
    console.error(error.code === 'EADDRINUSE'
      ? 'De-Pollution may already be running. Open http://127.0.0.1:4317 in your browser.'
      : 'De-Pollution could not start. Please ask an adult to help check the local server.');
    process.exitCode = 1;
  });
  server.listen(4317, '127.0.0.1', () => {
    console.log('De-Pollution is running at http://127.0.0.1:4317');
    console.log('Your API key stays on the server. Press Ctrl+C to stop.');
  });
}
