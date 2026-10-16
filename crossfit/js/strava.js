/* ==========================================================================
   CrossFit Coach — Strava export (přes vlastní Cloudflare Worker proxy)
   Worker drží client_secret bezpečně na serveru, viz /strava-worker v repu.
   ========================================================================== */

window.CFStrava = (function () {

  function isConnected(auth) {
    return !!(auth && auth.workerUrl && auth.refreshToken);
  }

  function connectUrl(workerUrl) {
    const redirect = encodeURIComponent(window.location.href.split('#')[0]);
    return `${workerUrl.replace(/\/$/, '')}/authorize?app_redirect=${redirect}`;
  }

  // Po návratu z OAuth flow appka obdrží tokeny ve fragmentu URL (#strava_connected=1&...).
  // Vrátí info o výsledku a hned fragment z URL odstraní.
  function consumeCallbackFragment() {
    const hash = window.location.hash || '';
    if (!hash.includes('strava_connected') && !hash.includes('strava_error')) return null;
    const params = new URLSearchParams(hash.replace(/^#/, ''));
    history.replaceState(null, '', window.location.pathname + window.location.search);
    if (params.get('strava_error')) {
      return { ok: false, error: params.get('strava_error') };
    }
    return {
      ok: true,
      refreshToken: params.get('refresh_token'),
      athleteId: params.get('athlete_id'),
      athleteName: params.get('athlete_name')
    };
  }

  async function refreshAccessToken(workerUrl, refreshToken) {
    const res = await fetch(`${workerUrl.replace(/\/$/, '')}/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Obnovení tokenu selhalo');
    return data; // { access_token, refresh_token, expires_at }
  }

  function buildDescription(workout) {
    const lines = [];
    workout.blocks.forEach(b => {
      lines.push(`${b.formatLabel.toUpperCase()} · ${b.title}${b.scheme ? ' — ' + b.scheme : ''}`);
      (b.exercises || []).forEach(e => {
        const w = e.weight ? ` · ${e.weight} ${e.unit}` : '';
        const r = e.reps ? ` · ${e.reps}` : '';
        lines.push(`  • ${e.name}${r}${w}`);
      });
      if (b.notes) lines.push(`  (${b.notes})`);
      lines.push('');
    });
    lines.push(`Odhad výdeje: ~${workout.estKcal} kcal`);
    if (workout.rpe != null) lines.push(`RPE: ${workout.rpe}/10`);
    lines.push('Vygenerováno v CrossFit Coach');
    return lines.join('\n');
  }

  async function exportWorkout(workerUrl, accessToken, workout) {
    const totalMin = (workout.blocks || []).reduce((s, b) => s + (b.durationMin || 0), 0);
    const payload = {
      access_token: accessToken,
      name: `CrossFit — ${workout.dayTypeLabel}`,
      sport_type: 'Crossfit',
      start_date_local: `${workout.date}T12:00:00Z`,
      elapsed_time: Math.max(60, totalMin * 60),
      description: buildDescription(workout)
    };
    const res = await fetch(`${workerUrl.replace(/\/$/, '')}/create-activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Export selhal (${res.status})`);
    return data; // obsahuje Strava activity id
  }

  // Zajistí platný access token: zkusí refresh, při úspěchu rovnou uloží rotovaný refresh token.
  async function getValidAccessToken(auth) {
    const data = await refreshAccessToken(auth.workerUrl, auth.refreshToken);
    const updated = Object.assign({}, auth, { refreshToken: data.refresh_token || auth.refreshToken });
    window.CFStorage.saveStravaAuth(updated);
    return { accessToken: data.access_token, auth: updated };
  }

  return { isConnected, connectUrl, consumeCallbackFragment, refreshAccessToken, exportWorkout, getValidAccessToken, buildDescription };
})();
