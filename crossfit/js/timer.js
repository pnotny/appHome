/* ==========================================================================
   CrossFit Coach — tréninkový timer (EMOM / AMRAP / For Time / Tabata / obecný)
   Self-contained modul: vykresluje do #modal-timer, zvuk přes Web Audio API.
   ========================================================================== */

window.CFTimer = (function () {
  const $ = sel => document.querySelector(sel);

  let audioCtx = null;
  let intervalId = null;
  let elapsed = 0; // sekundy
  let running = false;
  let muted = false;
  let rounds = 0; // ruční počítadlo kol (AMRAP)
  let cfg = null;

  function beep(freq, durationMs) {
    if (muted) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + durationMs / 1000);
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + durationMs / 1000);
    } catch (e) { /* ticho, pokud Web Audio není dostupné */ }
  }

  function fmt(sec) {
    sec = Math.max(0, Math.round(sec));
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function parseCapSeconds() {
    if (cfg.timeCapLabel) {
      const m = /(\d+)/.exec(cfg.timeCapLabel);
      if (m) return parseInt(m[1], 10) * 60;
    }
    return (cfg.durationMin || 10) * 60;
  }

  function render() {
    if (!cfg) return;
    const display = $('#timer-display');
    const phase = $('#timer-phase');
    const sub = $('#timer-sub');
    const extra = $('#timer-extra');
    const format = cfg.format;

    if (format === 'emom') {
      const totalSec = (cfg.durationMin || 10) * 60;
      const minuteIdx = Math.min(Math.floor(elapsed / 60), (cfg.durationMin || 10) - 1);
      const secIntoMin = elapsed % 60;
      const secLeft = elapsed >= totalSec ? 0 : 60 - secIntoMin;
      display.textContent = elapsed >= totalSec ? '00:00' : String(secLeft).padStart(2, '0');
      phase.textContent = elapsed >= totalSec ? '✅ Hotovo' : `Minuta ${minuteIdx + 1} / ${cfg.durationMin}`;
      phase.className = 'timer-phase';
      const exNames = cfg.exercises && cfg.exercises.length ? cfg.exercises : null;
      sub.textContent = exNames ? `Na řadě: ${exNames[minuteIdx % exNames.length]}` : '';
      extra.innerHTML = '';
      if (elapsed >= totalSec && running) stop();
      else if (running && secIntoMin === 0 && elapsed > 0) beep(880, 150);
      else if (running && secLeft <= 3 && secLeft > 0) beep(440, 90);
      return;
    }

    if (format === 'amrap') {
      const totalSec = (cfg.durationMin || 10) * 60;
      const left = totalSec - elapsed;
      display.textContent = fmt(left);
      phase.textContent = left <= 0 ? '✅ Čas vypršel' : 'AMRAP';
      phase.className = 'timer-phase';
      sub.textContent = `Cíl: ${cfg.durationMin} min`;
      extra.innerHTML = `
        <div class="timer-rounds">
          <button class="btn btn-secondary btn-sm" id="timer-round-minus">−</button>
          <span class="timer-rounds-val">${rounds} kol</span>
          <button class="btn btn-secondary btn-sm" id="timer-round-plus">+1 kolo</button>
        </div>`;
      bindRoundButtons();
      if (left <= 0 && running) { beep(220, 500); stop(); }
      return;
    }

    if (format === 'for-time' || format === 'chipper') {
      const capSec = parseCapSeconds();
      display.textContent = fmt(elapsed);
      const overCap = elapsed >= capSec;
      phase.textContent = overCap ? '⏰ Time cap' : 'FOR TIME';
      phase.className = overCap ? 'timer-phase timer-phase-warn' : 'timer-phase';
      sub.textContent = `Time cap: ${fmt(capSec)}`;
      extra.innerHTML = '';
      if (overCap && running) { beep(220, 600); stop(); }
      return;
    }

    if (format === 'tabata') {
      const cycle = 30; // 20s práce + 10s odpočinek
      const totalSec = 8 * cycle;
      if (elapsed >= totalSec) {
        display.textContent = '00:00';
        phase.textContent = '✅ Hotovo';
        phase.className = 'timer-phase';
        sub.textContent = '8/8 kol';
        extra.innerHTML = '';
        if (running) stop();
        return;
      }
      const round = Math.floor(elapsed / cycle) + 1;
      const posInCycle = elapsed % cycle;
      const isWork = posInCycle < 20;
      const left = isWork ? 20 - posInCycle : 30 - posInCycle;
      display.textContent = String(left).padStart(2, '0');
      phase.textContent = isWork ? '🔥 PRÁCE' : '😮‍💨 ODPOČINEK';
      phase.className = 'timer-phase ' + (isWork ? 'timer-phase-work' : 'timer-phase-rest');
      sub.textContent = `Kolo ${round} / 8`;
      extra.innerHTML = '';
      if (running && left === 1) beep(isWork ? 440 : 660, 120);
      return;
    }

    // obecný stopwatch (síla, technika, engine, steady, odpočinek…)
    const targetSec = (cfg.durationMin || 0) * 60;
    display.textContent = fmt(elapsed);
    phase.textContent = cfg.format === 'rest' ? 'ODPOČINEK' : 'STOPKY';
    phase.className = 'timer-phase';
    sub.textContent = targetSec ? `Cíl: ${fmt(targetSec)}` : '';
    extra.innerHTML = '';
    if (targetSec && elapsed === targetSec && running) beep(660, 300);
  }

  function bindRoundButtons() {
    const plus = $('#timer-round-plus');
    const minus = $('#timer-round-minus');
    if (plus) plus.onclick = () => { rounds++; render(); };
    if (minus) minus.onclick = () => { rounds = Math.max(0, rounds - 1); render(); };
  }

  function tick() {
    elapsed += 1;
    render();
  }

  function start() {
    if (running) return;
    running = true;
    $('#timer-toggle').textContent = '⏸ Pauza';
    intervalId = setInterval(tick, 1000);
  }

  function stop() {
    running = false;
    if (intervalId) clearInterval(intervalId);
    intervalId = null;
    const btn = $('#timer-toggle');
    if (btn) btn.textContent = '▶️ Start';
  }

  function toggle() {
    if (running) stop(); else start();
  }

  function reset() {
    stop();
    elapsed = 0;
    rounds = 0;
    render();
  }

  function configure(config) {
    cfg = config;
    reset();
    $('#timer-title').textContent = config.title || '';
    $('#timer-format-badge').textContent = (config.formatLabel || '').toUpperCase();
    $('#timer-format-badge').className = `badge badge-${config.dayType || 'strength'}`;
    render();
  }

  function destroy() {
    stop();
    if (audioCtx) { try { audioCtx.close(); } catch (e) {} audioCtx = null; }
  }

  function toggleMute() {
    muted = !muted;
    const btn = $('#timer-mute');
    if (btn) btn.textContent = muted ? '🔇' : '🔈';
  }

  return { configure, toggle, reset, destroy, toggleMute };
})();
