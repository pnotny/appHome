/**
 * CrossFit Coach — Strava OAuth proxy (Cloudflare Worker)
 *
 * Drží STRAVA_CLIENT_SECRET bezpečně na serveru (nikdy neopouští tento Worker)
 * a dělá za appku tři věci, které prohlížeč sám bezpečně udělat nemůže:
 *   1. GET  /authorize        → přesměruje na Stravu k souhlasu (OAuth)
 *   2. GET  /callback         → vymění authorization code za tokeny a pošle je zpět appce
 *   3. POST /refresh          → obnoví access token z refresh tokenu
 *   4. POST /create-activity  → založí WOD jako aktivitu na Stravě
 *
 * Env proměnné (nastav přes `wrangler secret put` / dashboard):
 *   STRAVA_CLIENT_ID      (var)    — Client ID tvé Strava API aplikace
 *   STRAVA_CLIENT_SECRET  (secret) — Client Secret tvé Strava API aplikace
 *   ALLOWED_ORIGIN        (var)    — origin appky, např. https://pnotny.github.io
 */

const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token';
const STRAVA_AUTHORIZE_URL = 'https://www.strava.com/oauth/authorize';
const STRAVA_API_BASE = 'https://www.strava.com/api/v3';

function corsHeaders(env) {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin'
  };
}

function json(data, env, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: Object.assign({ 'Content-Type': 'application/json' }, corsHeaders(env))
  });
}

function callbackUrl(request) {
  const u = new URL(request.url);
  return `${u.protocol}//${u.host}/callback`;
}

async function exchangeToken(env, body) {
  const params = new URLSearchParams(Object.assign({
    client_id: env.STRAVA_CLIENT_ID,
    client_secret: env.STRAVA_CLIENT_SECRET
  }, body));
  const res = await fetch(STRAVA_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Strava token endpoint ${res.status}`);
  return data;
}

async function handleAuthorize(request, env) {
  const u = new URL(request.url);
  const appRedirect = u.searchParams.get('app_redirect') || env.ALLOWED_ORIGIN || '';
  const authUrl = new URL(STRAVA_AUTHORIZE_URL);
  authUrl.searchParams.set('client_id', env.STRAVA_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', callbackUrl(request));
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('approval_prompt', 'auto');
  authUrl.searchParams.set('scope', 'activity:write,read');
  authUrl.searchParams.set('state', appRedirect);
  return Response.redirect(authUrl.toString(), 302);
}

async function handleCallback(request, env) {
  const u = new URL(request.url);
  const code = u.searchParams.get('code');
  const state = u.searchParams.get('state') || env.ALLOWED_ORIGIN || '';
  const error = u.searchParams.get('error');
  const back = new URL(state);

  if (error || !code) {
    back.hash = `strava_error=${encodeURIComponent(error || 'missing_code')}`;
    return Response.redirect(back.toString(), 302);
  }

  try {
    const data = await exchangeToken(env, { code, grant_type: 'authorization_code' });
    const athleteName = data.athlete ? `${data.athlete.firstname || ''} ${data.athlete.lastname || ''}`.trim() : '';
    back.hash = [
      'strava_connected=1',
      `refresh_token=${encodeURIComponent(data.refresh_token)}`,
      `athlete_id=${encodeURIComponent(data.athlete ? data.athlete.id : '')}`,
      `athlete_name=${encodeURIComponent(athleteName)}`
    ].join('&');
    return Response.redirect(back.toString(), 302);
  } catch (e) {
    back.hash = `strava_error=${encodeURIComponent(e.message || 'token_exchange_failed')}`;
    return Response.redirect(back.toString(), 302);
  }
}

async function handleRefresh(request, env) {
  const body = await request.json().catch(() => ({}));
  if (!body.refresh_token) return json({ error: 'missing refresh_token' }, env, 400);
  try {
    const data = await exchangeToken(env, { refresh_token: body.refresh_token, grant_type: 'refresh_token' });
    return json({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at
    }, env);
  } catch (e) {
    return json({ error: e.message || 'refresh_failed' }, env, 400);
  }
}

async function handleCreateActivity(request, env) {
  const body = await request.json().catch(() => ({}));
  if (!body.access_token) return json({ error: 'missing access_token' }, env, 400);
  const payload = {
    name: body.name || 'CrossFit WOD',
    sport_type: body.sport_type || 'Crossfit',
    start_date_local: body.start_date_local,
    elapsed_time: body.elapsed_time,
    description: body.description || '',
  };
  if (body.distance) payload.distance = body.distance;

  const res = await fetch(`${STRAVA_API_BASE}/activities`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${body.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return json({ error: data.message || `Strava API ${res.status}`, details: data }, env, res.status);
  return json(data, env);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(env) });
    }

    if (url.pathname === '/authorize' && request.method === 'GET') {
      return handleAuthorize(request, env);
    }
    if (url.pathname === '/callback' && request.method === 'GET') {
      return handleCallback(request, env);
    }
    if (url.pathname === '/refresh' && request.method === 'POST') {
      return handleRefresh(request, env);
    }
    if (url.pathname === '/create-activity' && request.method === 'POST') {
      return handleCreateActivity(request, env);
    }

    return json({ error: 'not found', routes: ['/authorize', '/callback', '/refresh', '/create-activity'] }, env, 404);
  }
};
