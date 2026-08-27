/* ==========================================================================
   CrossFit Coach — UI vrstva (stav, rendering, event handling)
   ========================================================================== */

(function () {
  const $ = sel => document.querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const DAY_LABELS = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
  const DAY_TYPE_OPTIONS = ['strength', 'gymnastics', 'monostructural', 'chipper', 'rest'];
  const FORMAT_OPTIONS = ['emom', 'amrap', 'for-time', 'chipper', 'tabata', 'intervals', 'steady'];
  const DURATION_OPTIONS = [20, 30, 45, 60, 75];

  const TEST_PROFILE = {
    name: 'Testovací profil', gender: 'M', bodyweight: 95, level: 'advanced',
    oneRM: { backSquat: null, frontSquat: 110, deadlift: null, clean: 100, snatch: 60, press: null },
    equipment: ['barbell', 'rack', 'kettlebell', 'dumbbell', 'box', 'bike-erg', 'rower', 'ski-erg'],
    excludedPatterns: ['olympic'],
    goal: 'condition', timeAvailable: 45, preferredFormats: ['emom', 'amrap'],
    weeklyTemplate: window.CFStorage.DEFAULT_WEEKLY_TEMPLATE.slice()
  };

  const state = {
    tab: 'today',
    profile: window.CFStorage.getProfile(),
    profileDraft: null,
    history: window.CFStorage.getHistory(),
    viewDate: todayISO(),
    currentWorkout: null,
    editMode: false,
    library: { search: '', category: 'all' },
    historySubTab: 'workouts',
    prForm: false
  };

  function todayISO() {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.remove('hidden');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.add('hidden'), 2200);
  }

  function weekDatesAround(dateStr) {
    const idx = window.CFGenerator.weekdayIndex(dateStr);
    const d = new Date(dateStr + 'T12:00:00');
    d.setDate(d.getDate() - idx);
    const out = [];
    for (let i = 0; i < 7; i++) {
      const dd = new Date(d);
      dd.setDate(d.getDate() + i);
      out.push(dd.toISOString().slice(0, 10));
    }
    return out;
  }

  function formatDateNice(dateStr) {
    const d = new Date(dateStr + 'T12:00:00');
    const s = d.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' });
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  /* ---------------------------- NAVIGATION ---------------------------- */

  function switchTab(tab) {
    state.tab = tab;
    $$('.tab-item').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    render();
    $('#screen').scrollTop = 0;
  }

  function render() {
    const subtitleMap = {
      today: formatDateNice(state.viewDate), history: 'Historie a maxima',
      library: 'Databáze cviků', profile: 'Profil cvičence'
    };
    $('#topbar-subtitle').textContent = subtitleMap[state.tab] || '';
    if (state.tab === 'today') renderToday();
    else if (state.tab === 'history') renderHistory();
    else if (state.tab === 'library') renderLibrary();
    else if (state.tab === 'profile') renderProfile();
  }

  /* ------------------------------ TODAY -------------------------------- */

  function ensureWorkoutForViewDate() {
    const saved = window.CFStorage.getWorkoutByDate(state.viewDate);
    if (saved) {
      state.currentWorkout = clone(saved);
      state.currentWorkout._saved = true;
    } else if (!state.currentWorkout || state.currentWorkout.date !== state.viewDate) {
      state.currentWorkout = window.CFGenerator.generateWorkout(state.profile, state.viewDate, state.history);
      state.currentWorkout._saved = false;
    }
  }

  // Přegeneruje trénink pro aktuálně zobrazený den s nejnovějším profilem —
  // volá se po uložení profilu, aby se změny (vybavení, 1RM, délka…) hned projevily,
  // i když už pro daný den existuje uložený trénink z historie.
  function regenerateForCurrentProfile() {
    state.currentWorkout = window.CFGenerator.generateWorkout(state.profile, state.viewDate, state.history);
    state.currentWorkout._saved = false;
    state.editMode = false;
  }

  function renderWeekStrip() {
    const dates = weekDatesAround(state.viewDate);
    const today = todayISO();
    return `<div class="week-strip">${dates.map((d, i) => {
      const dayType = state.profile.weeklyTemplate[i] || 'rest';
      const selected = d === state.viewDate ? ' selected' : '';
      const isToday = d === today ? ' is-today' : '';
      return `<div class="week-day${selected}${isToday}" data-date="${d}">
        <span class="wd-label">${DAY_LABELS[i]}</span>
        <span class="wd-dot dot-${dayType}"></span>
      </div>`;
    }).join('')}</div>`;
  }

  function exRowHtml(ex, bIdx, eIdx, editable) {
    const weightStr = ex.weight ? `${ex.weight} ${ex.unit}` : (ex.loadable === false ? '' : '');
    const metaParts = [];
    if (ex.reps) metaParts.push(escapeHtml(String(ex.reps)));
    if (weightStr) metaParts.push(`<strong>${weightStr}</strong>`);
    const patternLabel = window.CF_PATTERN_LABELS[ex.pattern] || ex.pattern;

    if (!editable) {
      return `<div class="ex-row">
        <div class="ex-main">
          <div class="ex-name">${escapeHtml(ex.name)}</div>
          <div class="ex-meta">${metaParts.join(' · ') || '—'}</div>
          <div class="ex-pattern-tag">${patternLabel}</div>
        </div>
        <div class="ex-actions">
          <button class="ex-icon-btn" data-action="info" data-exid="${ex.exerciseId}" title="Info">ℹ️</button>
        </div>
      </div>`;
    }

    return `<div class="ex-row">
      <div class="ex-main">
        <div class="ex-name">${escapeHtml(ex.name)}</div>
        <div class="ex-pattern-tag">${patternLabel}</div>
        <div class="field-row mt-8" style="gap:8px;">
          <input type="text" data-role="reps" data-b="${bIdx}" data-e="${eIdx}" value="${escapeHtml(ex.reps || '')}"
            placeholder="reps/schéma" style="flex:1;padding:8px 10px;border-radius:8px;border:1px solid var(--border);background:var(--surface-2);color:var(--text);font-size:13px;" />
          ${ex.weight != null ? `<input type="number" step="0.5" data-role="weight" data-b="${bIdx}" data-e="${eIdx}" value="${ex.weight}"
            style="width:78px;padding:8px 10px;border-radius:8px;border:1px solid var(--border);background:var(--surface-2);color:var(--text);font-size:13px;" />` : ''}
        </div>
      </div>
      <div class="ex-actions">
        <button class="ex-icon-btn" data-action="info" data-exid="${ex.exerciseId}" title="Info">ℹ️</button>
        <button class="ex-icon-btn" data-action="swap" data-b="${bIdx}" data-e="${eIdx}" title="Vyměnit cvik">🔄</button>
      </div>
    </div>`;
  }

  function blockHtml(block, bIdx, editable) {
    const exercisesHtml = (block.exercises || []).map((ex, eIdx) => exRowHtml(ex, bIdx, eIdx, editable)).join('')
      || `<p class="text-2" style="font-size:13.5px;padding:6px 0;">Bez cviků — ${escapeHtml(block.notes || '')}</p>`;
    return `<div class="card">
      <div class="block-title-row">
        <span class="block-title">${escapeHtml(block.title)}</span>
        <span class="badge badge-${state.currentWorkout.dayType}">${escapeHtml(block.formatLabel)}</span>
      </div>
      <div class="block-scheme">${escapeHtml(block.scheme || '')}${block.timeCap ? ` · Time cap ${escapeHtml(block.timeCap)}` : ''}</div>
      ${exercisesHtml}
      ${block.notes ? `<div class="block-notes">${escapeHtml(block.notes)}</div>` : ''}
    </div>`;
  }

  function renderToday() {
    ensureWorkoutForViewDate();
    const w = state.currentWorkout;
    const totalMin = (w.blocks || []).reduce((s, b) => s + (b.durationMin || 0), 0);

    let html = renderWeekStrip();

    html += `<div class="card workout-hero">
      <div class="workout-hero-top">
        <span class="workout-hero-date">${formatDateNice(w.date)}</span>
        <span class="badge badge-${w.dayType}">${escapeHtml(w.dayTypeLabel)}</span>
      </div>
      <div class="workout-hero-title">${w.blocks.length ? w.blocks.map(b => b.formatLabel).join(' + ') : 'Odpočinek'}</div>
      <div class="workout-hero-stats">
        <div class="hero-stat"><b>~${w.estKcal}</b><span>kcal</span></div>
        <div class="hero-stat"><b>${totalMin}</b><span>minut</span></div>
        <div class="hero-stat"><b>${w.blocks.length}</b><span>bloky</span></div>
      </div>
    </div>`;

    html += `<div class="card">
      <div class="block-title-row" style="margin-bottom:10px;">
        <span class="block-title">Délka tréninku</span>
        <span class="text-2" style="font-size:12.5px;">cíl: ${state.profile.timeAvailable} min</span>
      </div>
      <div class="segmented" id="duration-picker">
        ${DURATION_OPTIONS.map(d => `<button type="button" class="${state.profile.timeAvailable === d ? 'active' : ''}" data-duration="${d}">${d} min</button>`).join('')}
      </div>
    </div>`;

    w.blocks.forEach((b, i) => { html += blockHtml(b, i, state.editMode); });

    html += `<div class="btn-row mt-16">
      <button class="btn btn-secondary" id="btn-regenerate">🔁 Přegenerovat</button>
      <button class="btn btn-secondary" id="btn-edit">${state.editMode ? '✅ Hotovo' : '✏️ Upravit'}</button>
    </div>
    <div class="btn-row mt-8">
      <button class="btn btn-primary" id="btn-save">${w._saved ? '💾 Uložit změny' : '💾 Uložit trénink'}</button>
      <button class="btn btn-secondary" id="btn-export">📤 Export</button>
    </div>`;
    if (w._saved) {
      html += `<button class="btn btn-danger btn-block" id="btn-delete">🗑 Smazat z historie</button>`;
    }

    $('#screen').innerHTML = html;
    bindTodayEvents();
  }

  function bindTodayEvents() {
    $$('[data-duration]', $('#duration-picker')).forEach(btn => btn.addEventListener('click', () => {
      const minutes = parseInt(btn.dataset.duration, 10);
      if (state.profile.timeAvailable === minutes) return;
      state.profile.timeAvailable = minutes;
      window.CFStorage.saveProfile(state.profile);
      regenerateForCurrentProfile();
      render();
    }));

    $$('.week-day').forEach(el => el.addEventListener('click', () => {
      state.viewDate = el.dataset.date;
      state.editMode = false;
      state.currentWorkout = null;
      render();
    }));

    const btnRegen = $('#btn-regenerate');
    if (btnRegen) btnRegen.addEventListener('click', () => {
      state.currentWorkout = window.CFGenerator.generateWorkout(state.profile, state.viewDate, state.history);
      state.currentWorkout._saved = false;
      toast('Trénink přegenerován');
      render();
    });

    const btnEdit = $('#btn-edit');
    if (btnEdit) btnEdit.addEventListener('click', () => { state.editMode = !state.editMode; render(); });

    const btnSave = $('#btn-save');
    if (btnSave) btnSave.addEventListener('click', () => {
      const w = state.currentWorkout;
      w._saved = true;
      const toStore = clone(w);
      delete toStore._saved;
      state.history = window.CFStorage.saveWorkoutToHistory(toStore);
      toast('Trénink uložen do historie');
      render();
    });

    const btnDelete = $('#btn-delete');
    if (btnDelete) btnDelete.addEventListener('click', () => {
      state.history = window.CFStorage.deleteWorkout(state.viewDate);
      state.currentWorkout = null;
      state.editMode = false;
      toast('Trénink smazán');
      render();
    });

    const btnExport = $('#btn-export');
    if (btnExport) btnExport.addEventListener('click', openShareModal);

    $$('[data-role="reps"]').forEach(inp => inp.addEventListener('change', () => {
      const b = +inp.dataset.b, e = +inp.dataset.e;
      state.currentWorkout.blocks[b].exercises[e].reps = inp.value;
    }));
    $$('[data-role="weight"]').forEach(inp => inp.addEventListener('change', () => {
      const b = +inp.dataset.b, e = +inp.dataset.e;
      state.currentWorkout.blocks[b].exercises[e].weight = parseFloat(inp.value) || 0;
    }));

    $$('[data-action="info"]').forEach(btn => btn.addEventListener('click', () => openExerciseSheet(btn.dataset.exid)));
    $$('[data-action="swap"]').forEach(btn => btn.addEventListener('click', () => openSwapSheet(+btn.dataset.b, +btn.dataset.e)));
  }

  /* --------------------------- SWAP CVIKU ------------------------------- */

  function openSwapSheet(bIdx, eIdx) {
    const block = state.currentWorkout.blocks[bIdx];
    const current = block.exercises[eIdx];
    const usedIds = block.exercises.map(e => e.exerciseId);
    const pool = window.CFGenerator.filterPool(state.profile, null).filter(ex =>
      ex.pattern === current.pattern && !usedIds.includes(ex.id));
    const poolFallback = pool.length ? pool
      : window.CFGenerator.filterPool(state.profile, [current.category]).filter(ex => !usedIds.includes(ex.id));

    const html = `<h3 style="font-size:17px;font-weight:800;margin-bottom:4px;">Vyměnit cvik</h3>
      <p class="text-2" style="font-size:13px;margin-bottom:14px;">Náhrada za „${escapeHtml(current.name)}“ se stejným vybavením a úrovní</p>
      ${poolFallback.length ? poolFallback.map(ex => `
        <div class="swap-item" data-swap-id="${ex.id}">
          <div>
            <div style="font-weight:700;font-size:14.5px;">${escapeHtml(ex.name)}</div>
            <div class="text-2" style="font-size:12px;">${window.CF_PATTERN_LABELS[ex.pattern]} · ${window.CF_CATEGORY_LABELS[ex.category]}</div>
          </div>
          <span class="lib-item-chevron">›</span>
        </div>`).join('') : '<p class="text-2">Žádná vhodná náhrada s aktuálním vybavením.</p>'}`;

    $('#sheet-swap-content').innerHTML = html;
    $('#sheet-swap').classList.remove('hidden');
    $$('[data-swap-id]', $('#sheet-swap-content')).forEach(el => el.addEventListener('click', () => {
      const newEx = window.CF_EXERCISES.find(x => x.id === el.dataset.swapId);
      const purpose = block.format === 'strength' ? 'strength' : 'metcon';
      const load = window.CFGenerator.computeLoad(newEx, state.profile, purpose);
      const lvl = window.CFGenerator.levelTier(state.profile.level);
      block.exercises[eIdx] = {
        exerciseId: newEx.id, name: newEx.name, category: newEx.category, pattern: newEx.pattern,
        equipment: newEx.equipment, levelTier: lvl, levelInfo: newEx.levels[lvl],
        reps: current.reps, weight: load ? load.weight : null, unit: load ? load.unit : null,
        loadSource: load ? load.source : null, cues: newEx.cues, mistakes: newEx.mistakes, note: current.note
      };
      closeSheets();
      render();
      toast('Cvik vyměněn');
    }));
  }

  /* ------------------------- DETAIL CVIKU SHEET -------------------------- */

  function exerciseDetailHtml(ex, activeTier) {
    const tiers = ['beginner', 'intermediate', 'rx'];
    const tierLabels = { beginner: 'Beginner', intermediate: 'Intermediate', rx: 'RX' };
    const lvl = ex.levels[activeTier];
    return `<div class="ex-detail-header">
      <div class="ex-detail-name">${escapeHtml(ex.name)}</div>
      <div class="ex-detail-tags">
        <span class="badge badge-outline">${window.CF_CATEGORY_LABELS[ex.category]}</span>
        <span class="badge badge-outline">${window.CF_PATTERN_LABELS[ex.pattern]}</span>
        ${ex.equipment.map(e => `<span class="badge badge-outline">${window.CF_EQUIPMENT_LABELS[e] || e}</span>`).join('')}
      </div>
    </div>
    <div class="level-tabs">
      ${tiers.map(t => `<div class="level-tab${t === activeTier ? ' active' : ''}" data-tier="${t}">${tierLabels[t]}</div>`).join('')}
    </div>
    <div class="detail-block">
      <h4>Popis úrovně</h4>
      <p>${escapeHtml(lvl.desc)}</p>
    </div>
    <div class="detail-block">
      <h4>Kritérium postupu na další úroveň</h4>
      <p>${escapeHtml(lvl.criteria)}</p>
    </div>
    <div class="detail-block">
      <h4>Zapojené svaly</h4>
      <p>${ex.muscles.join(', ')}</p>
    </div>
    <div class="detail-block">
      <h4>Coaching cues</h4>
      <ul class="cue-list">${ex.cues.map(c => `<li>${escapeHtml(c)}</li>`).join('')}</ul>
    </div>
    <div class="detail-block">
      <h4>Časté chyby</h4>
      <ul class="cue-list mistake-list">${ex.mistakes.map(c => `<li>${escapeHtml(c)}</li>`).join('')}</ul>
    </div>`;
  }

  function openExerciseSheet(exId) {
    const ex = window.CF_EXERCISES.find(x => x.id === exId);
    if (!ex) return;
    let tier = window.CFGenerator.levelTier(state.profile.level);
    $('#sheet-exercise-content').innerHTML = exerciseDetailHtml(ex, tier);
    $('#sheet-exercise').classList.remove('hidden');
    $('#sheet-exercise-content').addEventListener('click', function handler(e) {
      const t = e.target.closest('.level-tab');
      if (!t) return;
      tier = t.dataset.tier;
      $('#sheet-exercise-content').innerHTML = exerciseDetailHtml(ex, tier);
    });
  }

  function closeSheets() {
    $('#sheet-exercise').classList.add('hidden');
    $('#sheet-swap').classList.add('hidden');
  }

  /* ------------------------------ EXPORT -------------------------------- */

  async function openShareModal() {
    $('#modal-share').classList.remove('hidden');
    $('#share-preview').innerHTML = '<p style="color:#999;padding:40px;font-size:13px;">Generuji náhled…</p>';
    const canvas = await window.CFShare.renderShareCard(state.currentWorkout, state.profile);
    $('#share-preview').innerHTML = '';
    $('#share-preview').appendChild(canvas);
    $('#modal-share')._canvas = canvas;
  }

  /* ------------------------------ HISTORY -------------------------------- */

  function renderHistory() {
    state.history = window.CFStorage.getHistory();
    let html = `<div class="segmented mt-8" style="margin-bottom:18px;">
      <button class="${state.historySubTab === 'workouts' ? 'active' : ''}" data-sub="workouts">Tréninky</button>
      <button class="${state.historySubTab === 'pr' ? 'active' : ''}" data-sub="pr">PR &amp; maxima</button>
    </div>`;

    if (state.historySubTab === 'workouts') {
      if (!state.history.length) {
        html += `<div class="empty-state"><div class="es-icon">📭</div><p>Zatím žádné uložené tréninky.<br>Vygeneruj a ulož trénink v záložce Dnes.</p></div>`;
      } else {
        html += `<div class="card">` + state.history.map(w => {
          const totalMin = (w.blocks || []).reduce((s, b) => s + (b.durationMin || 0), 0);
          const formats = (w.blocks || []).map(b => b.formatLabel).join(' + ');
          return `<div class="history-item" data-date="${w.date}">
            <div class="history-item-left">
              <span class="history-dot dot-${w.dayType}"></span>
              <div>
                <div class="history-date">${formatDateNice(w.date)}</div>
                <div class="history-sub">${escapeHtml(w.dayTypeLabel)} · ${escapeHtml(formats)} · ${totalMin} min</div>
              </div>
            </div>
            <div class="history-kcal">${w.estKcal} kcal</div>
          </div>`;
        }).join('') + `</div>`;
      }
    } else {
      html += renderPrSection();
    }

    $('#screen').innerHTML = html;
    $$('[data-sub]').forEach(b => b.addEventListener('click', () => { state.historySubTab = b.dataset.sub; render(); }));
    $$('.history-item').forEach(el => el.addEventListener('click', () => {
      state.viewDate = el.dataset.date; state.editMode = false; state.currentWorkout = null;
      switchTab('today');
    }));
    if (state.historySubTab === 'pr') bindPrEvents();
  }

  const PR_LIFTS = [
    { key: 'backSquat', label: 'Back Squat' }, { key: 'frontSquat', label: 'Front Squat' },
    { key: 'deadlift', label: 'Deadlift' }, { key: 'clean', label: 'Clean' },
    { key: 'snatch', label: 'Snatch' }, { key: 'press', label: 'Shoulder Press' }
  ];

  function sparklineSvg(values) {
    if (values.length < 2) return '';
    const w = 140, h = 32, min = Math.min(...values), max = Math.max(...values);
    const range = (max - min) || 1;
    const pts = values.map((v, i) => {
      const x = (i / (values.length - 1)) * (w - 6) + 3;
      const y = h - 4 - ((v - min) / range) * (h - 8);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
    return `<svg class="pr-sparkline" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
      <polyline points="${pts}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>`;
  }

  function renderPrSection() {
    const log = window.CFStorage.getPrLog();
    let html = `<div class="card">`;
    PR_LIFTS.forEach(l => {
      const current = state.profile.oneRM[l.key];
      const entries = log.filter(e => e.lift === l.key).map(e => e.value);
      html += `<div class="pr-row">
        <div>
          <div class="pr-name">${l.label}</div>
          ${sparklineSvg(entries)}
        </div>
        <div class="pr-value">${current ? current + ' kg' : '—'}</div>
      </div>`;
    });
    html += `</div>
    <button class="btn btn-primary btn-block" id="btn-add-pr">${state.prForm ? '✕ Zavřít' : '➕ Přidat nový PR'}</button>`;
    if (state.prForm) {
      html += `<div class="card mt-16">
        <div class="field"><label>Zvedák</label>
          <select id="pr-lift">${PR_LIFTS.map(l => `<option value="${l.key}">${l.label}</option>`).join('')}</select>
        </div>
        <div class="field-row">
          <div class="field"><label>Váha (kg)</label><input type="number" id="pr-value" step="0.5" /></div>
          <div class="field"><label>Datum</label><input type="text" id="pr-date" value="${todayISO()}" /></div>
        </div>
        <button class="btn btn-primary" id="pr-submit">Uložit PR</button>
      </div>`;
    }
    return html;
  }

  function bindPrEvents() {
    const btn = $('#btn-add-pr');
    if (btn) btn.addEventListener('click', () => { state.prForm = !state.prForm; render(); });
    const submit = $('#pr-submit');
    if (submit) submit.addEventListener('click', () => {
      const lift = $('#pr-lift').value;
      const value = parseFloat($('#pr-value').value);
      const date = $('#pr-date').value || todayISO();
      if (!value || value <= 0) { toast('Zadej platnou váhu'); return; }
      window.CFStorage.addPrEntry({ lift, value, date });
      const profile = clone(state.profile);
      profile.oneRM[lift] = value;
      window.CFStorage.saveProfile(profile);
      state.profile = profile;
      state.prForm = false;
      toast('PR uložen');
      render();
    });
  }

  /* ------------------------------ LIBRARY -------------------------------- */

  function renderLibrary() {
    const cats = [{ id: 'all', label: 'Vše' }].concat(
      Object.keys(window.CF_CATEGORY_LABELS).map(id => ({ id, label: window.CF_CATEGORY_LABELS[id] })));

    let list = window.CF_EXERCISES.filter(ex => {
      if (state.library.category !== 'all' && ex.category !== state.library.category) return false;
      if (state.library.search && !ex.name.toLowerCase().includes(state.library.search.toLowerCase())) return false;
      return true;
    }).sort((a, b) => a.name.localeCompare(b.name));

    let html = `<div class="search-bar">
      <span>🔍</span>
      <input type="text" id="lib-search" placeholder="Hledat cvik…" value="${escapeHtml(state.library.search)}" />
    </div>
    <div class="filter-scroll">
      ${cats.map(c => `<button class="chip${state.library.category === c.id ? ' active' : ''}" data-cat="${c.id}">${c.label}</button>`).join('')}
    </div>
    <p class="screen-subheading" style="margin:0 4px 12px;">${list.length} cviků</p>
    <div class="card" style="padding:0 16px;">
      ${list.map(ex => `<div class="lib-item" data-exid="${ex.id}">
        <div>
          <div class="lib-item-name">${escapeHtml(ex.name)}</div>
          <div class="lib-item-meta">${window.CF_PATTERN_LABELS[ex.pattern]} · ${ex.equipment.map(e => window.CF_EQUIPMENT_LABELS[e] || e).join(', ')}</div>
        </div>
        <span class="lib-item-chevron">›</span>
      </div>`).join('')}
    </div>`;

    $('#screen').innerHTML = html;
    $('#lib-search').addEventListener('input', e => { state.library.search = e.target.value; renderLibraryList(); });
    $$('[data-cat]').forEach(b => b.addEventListener('click', () => { state.library.category = b.dataset.cat; render(); }));
    $$('[data-exid]').forEach(el => el.addEventListener('click', () => openExerciseSheet(el.dataset.exid)));
  }

  function renderLibraryList() {
    // lehký re-render jen seznamu při psaní do vyhledávání (zachová focus)
    render();
    setTimeout(() => { const inp = $('#lib-search'); if (inp) { inp.focus(); inp.selectionStart = inp.selectionEnd = inp.value.length; } }, 0);
  }

  /* ------------------------------ PROFILE -------------------------------- */

  function segmented(name, options, value) {
    return `<div class="segmented" data-field="${name}">
      ${options.map(o => `<button type="button" class="${o.value === value ? 'active' : ''}" data-value="${o.value}">${o.label}</button>`).join('')}
    </div>`;
  }

  function chipGroup(name, options, values, danger) {
    return `<div class="chip-group" data-field="${name}">
      ${options.map(o => `<button type="button" class="chip${danger ? ' chip-danger' : ''}${values.includes(o.value) ? ' active' : ''}" data-value="${o.value}">${o.label}</button>`).join('')}
    </div>`;
  }

  function renderProfile() {
    if (!state.profileDraft) state.profileDraft = clone(state.profile);
    const p = state.profileDraft;

    const equipmentOptions = Object.keys(window.CF_EQUIPMENT_LABELS).filter(k => k !== 'none')
      .map(k => ({ value: k, label: window.CF_EQUIPMENT_LABELS[k] }));
    const patternOptions = Object.keys(window.CF_PATTERN_LABELS).filter(k => k !== 'monostructural')
      .map(k => ({ value: k, label: window.CF_PATTERN_LABELS[k] }));
    const formatOptions = FORMAT_OPTIONS.map(f => ({ value: f, label: window.CFGenerator.FORMAT_LABELS[f] || f }));

    let html = `
    <div class="screen-section">
      <p class="section-title">Osobní údaje</p>
      <div class="card">
        <div class="field"><label>Pohlaví</label>${segmented('gender', [{ value: 'M', label: 'Muž' }, { value: 'F', label: 'Žena' }], p.gender)}</div>
        <div class="field"><label>Tělesná hmotnost (kg)</label><input type="number" id="f-bodyweight" value="${p.bodyweight}" /></div>
        <div class="field"><label>Úroveň</label>${segmented('level', [{ value: 'beginner', label: 'Beginner' }, { value: 'intermediate', label: 'Intermediate' }, { value: 'advanced', label: 'Advanced' }, { value: 'rx', label: 'RX' }], p.level)}</div>
      </div>
    </div>

    <div class="screen-section">
      <p class="section-title">1RM klíčových zvedů (kg, volitelné)</p>
      <div class="card">
        <div class="grid-2">
          <div class="field"><label>Back Squat</label><input type="number" id="rm-backSquat" value="${p.oneRM.backSquat ?? ''}" /></div>
          <div class="field"><label>Front Squat</label><input type="number" id="rm-frontSquat" value="${p.oneRM.frontSquat ?? ''}" /></div>
          <div class="field"><label>Deadlift</label><input type="number" id="rm-deadlift" value="${p.oneRM.deadlift ?? ''}" /></div>
          <div class="field"><label>Clean</label><input type="number" id="rm-clean" value="${p.oneRM.clean ?? ''}" /></div>
          <div class="field"><label>Snatch</label><input type="number" id="rm-snatch" value="${p.oneRM.snatch ?? ''}" /></div>
          <div class="field"><label>Press</label><input type="number" id="rm-press" value="${p.oneRM.press ?? ''}" /></div>
        </div>
        <p class="field-hint">Bez zadání se použijí oficiální RX/Scaled standardní váhy dle úrovně a pohlaví.</p>
      </div>
    </div>

    <div class="screen-section">
      <p class="section-title">Dostupné vybavení</p>
      <div class="card">${chipGroup('equipment', equipmentOptions, p.equipment)}</div>
    </div>

    <div class="screen-section">
      <p class="section-title">Omezení — vynechat pohybové vzory</p>
      <div class="card">${chipGroup('excludedPatterns', patternOptions, p.excludedPatterns, true)}</div>
    </div>

    <div class="screen-section">
      <p class="section-title">Cíl a čas</p>
      <div class="card">
        <div class="field"><label>Cíl</label>${segmented('goal', [{ value: 'strength', label: 'Síla' }, { value: 'condition', label: 'Kondice' }, { value: 'weight-loss', label: 'Hubnutí' }, { value: 'skill', label: 'Skill' }], p.goal)}</div>
        <div class="field"><label>Dostupný čas na trénink: <strong id="time-val">${p.timeAvailable} min</strong></label>
          <input type="range" id="f-time" min="15" max="90" step="5" value="${p.timeAvailable}" />
        </div>
      </div>
    </div>

    <div class="screen-section">
      <p class="section-title">Preferované formáty</p>
      <div class="card">${chipGroup('preferredFormats', formatOptions, p.preferredFormats)}</div>
    </div>

    <div class="screen-section">
      <p class="section-title">Týdenní programming</p>
      <div class="card">
        ${DAY_LABELS.map((d, i) => `<div class="weekly-row">
          <span class="weekly-row-label">${d}</span>
          <select data-weekday="${i}">
            ${DAY_TYPE_OPTIONS.map(t => `<option value="${t}" ${p.weeklyTemplate[i] === t ? 'selected' : ''}>${window.CFGenerator.DAY_TYPE_LABELS[t]}</option>`).join('')}
          </select>
        </div>`).join('')}
        <p class="field-hint">Doporučení: 2–3× síla, 2× gymnastika+EMOM, 1× objemový metcon, 1× engine, 1× odpočinek.</p>
      </div>
    </div>

    <button class="btn btn-primary" id="btn-save-profile">💾 Uložit profil</button>
    <button class="btn btn-secondary btn-block" id="btn-test-profile">🧪 Načíst testovací profil</button>
    `;

    $('#screen').innerHTML = html;
    bindProfileEvents();
  }

  function bindProfileEvents() {
    const p = state.profileDraft;

    $$('.segmented').forEach(seg => seg.addEventListener('click', e => {
      const btn = e.target.closest('button'); if (!btn) return;
      const field = seg.dataset.field;
      p[field] = btn.dataset.value;
      $$('button', seg).forEach(b => b.classList.toggle('active', b === btn));
    }));

    $$('.chip-group').forEach(group => group.addEventListener('click', e => {
      const btn = e.target.closest('button'); if (!btn) return;
      const field = group.dataset.field;
      const val = btn.dataset.value;
      const arr = p[field];
      const idx = arr.indexOf(val);
      if (idx >= 0) arr.splice(idx, 1); else arr.push(val);
      btn.classList.toggle('active');
    }));

    $('#f-bodyweight').addEventListener('change', e => { p.bodyweight = parseFloat(e.target.value) || 0; });
    ['backSquat', 'frontSquat', 'deadlift', 'clean', 'snatch', 'press'].forEach(k => {
      $('#rm-' + k).addEventListener('change', e => { p.oneRM[k] = e.target.value ? parseFloat(e.target.value) : null; });
    });
    $('#f-time').addEventListener('input', e => { p.timeAvailable = parseInt(e.target.value, 10); $('#time-val').textContent = p.timeAvailable + ' min'; });

    $$('[data-weekday]').forEach(sel => sel.addEventListener('change', e => {
      p.weeklyTemplate[parseInt(sel.dataset.weekday, 10)] = e.target.value;
    }));

    $('#btn-save-profile').addEventListener('click', () => {
      window.CFStorage.saveProfile(p);
      state.profile = clone(p);
      regenerateForCurrentProfile();
      toast('Profil uložen');
      switchTab('today');
    });

    $('#btn-test-profile').addEventListener('click', () => {
      const tp = clone(TEST_PROFILE);
      window.CFStorage.saveProfile(tp);
      state.profile = clone(tp);
      state.profileDraft = clone(tp);
      regenerateForCurrentProfile();
      toast('Testovací profil načten a uložen');
      switchTab('today');
    });
  }

  /* ------------------------------- THEME ---------------------------------- */

  function applyTheme(theme) {
    if (theme === 'auto') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', theme);
  }

  function cycleTheme() {
    const cur = window.CFStorage.getTheme();
    const next = cur === 'auto' ? 'dark' : (cur === 'dark' ? 'light' : 'auto');
    window.CFStorage.setTheme(next);
    applyTheme(next);
    toast('Motiv: ' + (next === 'auto' ? 'Automaticky' : next === 'dark' ? 'Tmavý' : 'Světlý'));
  }

  /* -------------------------------- INIT ----------------------------------- */

  function init() {
    applyTheme(window.CFStorage.getTheme());

    $$('.tab-item').forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));
    $('#theme-toggle').addEventListener('click', cycleTheme);

    $('#sheet-exercise').addEventListener('click', e => { if (e.target === e.currentTarget) closeSheets(); });
    $('#sheet-swap').addEventListener('click', e => { if (e.target === e.currentTarget) closeSheets(); });
    $('#modal-share').addEventListener('click', e => { if (e.target === e.currentTarget) $('#modal-share').classList.add('hidden'); });
    $('#share-close').addEventListener('click', () => $('#modal-share').classList.add('hidden'));
    $('#share-download').addEventListener('click', () => {
      const c = $('#modal-share')._canvas;
      if (c) window.CFShare.downloadCard(c, `crossfit-${state.currentWorkout.date}.png`);
    });
    $('#share-native').addEventListener('click', async () => {
      const c = $('#modal-share')._canvas;
      if (c) {
        const result = await window.CFShare.shareOrDownload(c, state.currentWorkout);
        if (result === 'shared') toast('Sdíleno');
      }
    });

    render();

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(() => {});
      });
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
