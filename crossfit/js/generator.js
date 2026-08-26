/* ==========================================================================
   CrossFit Coach — generátor tréninků
   Týdenní periodizace → formát dne → výběr cviků → váhy → rep scheme → kalorie
   ========================================================================== */

window.CFGenerator = (function () {
  const EX = window.CF_EXERCISES;

  const DAY_TYPE_LABELS = {
    strength: 'Vzpírání / síla', gymnastics: 'Gymnastika + EMOM',
    monostructural: 'Engine / monostrukturální', chipper: 'Objemový metcon', rest: 'Odpočinek'
  };

  const FORMAT_LABELS = {
    strength: 'Síla', emom: 'EMOM', amrap: 'AMRAP', 'for-time': 'For Time',
    chipper: 'Chipper', tabata: 'Tabata', intervals: 'Intervaly', steady: 'Steady state', rest: 'Odpočinek'
  };

  const FORMAT_MET = {
    strength: 5, emom: 8, amrap: 10, 'for-time': 10, chipper: 9, tabata: 11, intervals: 9, steady: 7, rest: 2.5
  };

  function weekdayIndex(dateStr) {
    // pondělí = 0 ... neděle = 6
    const d = new Date(dateStr + 'T12:00:00');
    const jsDay = d.getDay(); // ne=0..so=6
    return (jsDay + 6) % 7;
  }

  function levelTier(level) {
    if (level === 'beginner') return 'beginner';
    if (level === 'intermediate') return 'intermediate';
    return 'rx'; // advanced | rx
  }

  function roundToStep(value, step) {
    return Math.round(value / step) * step;
  }

  function equipmentOk(exercise, profileEquipment) {
    return exercise.equipment.every(eq => eq === 'none' || profileEquipment.includes(eq));
  }

  function patternAllowed(exercise, excludedPatterns) {
    return !excludedPatterns.includes(exercise.pattern);
  }

  function filterPool(profile, categories) {
    return EX.filter(ex =>
      (!categories || categories.includes(ex.category)) &&
      equipmentOk(ex, profile.equipment) &&
      patternAllowed(ex, profile.excludedPatterns || [])
    );
  }

  function yesterdayPatterns(history, dateStr) {
    const d = new Date(dateStr + 'T12:00:00');
    d.setDate(d.getDate() - 1);
    const key = d.toISOString().slice(0, 10);
    const w = (history || []).find(h => h.date === key);
    if (!w) return [];
    const patterns = [];
    (w.blocks || []).forEach(b => (b.exercises || []).forEach(e => patterns.push(e.pattern)));
    return patterns;
  }

  function pickExercises(pool, count, opts) {
    opts = opts || {};
    const avoidPatterns = opts.avoidPatterns || [];
    const usedPatterns = new Set();
    const usedIds = new Set();
    const result = [];
    let candidates = pool.slice();

    // 1. kolo: preferuj cviky, jejichž pattern nebyl včera a není zatím dnes použitý
    for (let round = 0; round < count && candidates.length; round++) {
      let filtered = candidates.filter(ex => !usedIds.has(ex.id) && !usedPatterns.has(ex.pattern) && !avoidPatterns.includes(ex.pattern));
      if (!filtered.length) filtered = candidates.filter(ex => !usedIds.has(ex.id) && !usedPatterns.has(ex.pattern));
      if (!filtered.length) filtered = candidates.filter(ex => !usedIds.has(ex.id));
      if (!filtered.length) break;
      const pick = filtered[Math.floor(Math.random() * filtered.length)];
      result.push(pick);
      usedIds.add(pick.id);
      usedPatterns.add(pick.pattern);
    }
    return result;
  }

  function computeLoad(exercise, profile, purpose) {
    if (!exercise.loadable) return null;
    let pct;
    if (purpose === 'strength') pct = 0.85;
    else if (purpose === 'metcon') pct = 0.5;
    else pct = 0.3; // technika

    const key = exercise.oneRMKey;
    const oneRM = key ? profile.oneRM[key] : null;
    const step = exercise.equipment.includes('barbell') ? 2.5 : 1;

    if (oneRM) {
      const mult = exercise.variantMultiplier != null ? exercise.variantMultiplier : 1;
      const weight = roundToStep(oneRM * mult * pct, step);
      return { weight, unit: 'kg', source: '1RM', pct: Math.round(pct * 100) };
    }
    if (exercise.standard) {
      const tier = levelTier(profile.level);
      const table = tier === 'beginner' ? exercise.standard.scaled
        : (tier === 'rx' ? exercise.standard.rx
          : { M: (exercise.standard.rx.M + exercise.standard.scaled.M) / 2, F: (exercise.standard.rx.F + exercise.standard.scaled.F) / 2 });
      const genderKey = profile.gender === 'F' ? 'F' : 'M';
      let weight = table[genderKey];
      if (purpose === 'technique') weight *= 0.6;
      return { weight: roundToStep(weight, step), unit: 'kg', source: tier === 'rx' ? 'RX standard' : 'Scaled standard' };
    }
    return null;
  }

  function levelBlock(exercise, profile) {
    const tier = levelTier(profile.level);
    return { tier, info: exercise.levels[tier] };
  }

  function toWorkoutExercise(exercise, profile, purpose, reps, note) {
    const load = computeLoad(exercise, profile, purpose);
    const lvl = levelBlock(exercise, profile);
    return {
      exerciseId: exercise.id,
      name: exercise.name,
      category: exercise.category,
      pattern: exercise.pattern,
      equipment: exercise.equipment,
      levelTier: lvl.tier,
      levelInfo: lvl.info,
      reps: reps,
      weight: load ? load.weight : null,
      unit: load ? load.unit : null,
      loadSource: load ? load.source : null,
      loadPct: load ? load.pct : null,
      cues: exercise.cues,
      mistakes: exercise.mistakes,
      note: note || ''
    };
  }

  function clampTime(t, min, max) {
    return Math.max(min, Math.min(max, t));
  }

  function pickMetconFormat(candidates, profile) {
    const preferred = candidates.filter(f => (profile.preferredFormats || []).includes(f));
    const pool = preferred.length ? preferred : candidates;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function strengthSetsScheme(level) {
    if (level === 'beginner') return { sets: 3, reps: 5, label: '3 série × 5 opakování' };
    if (level === 'intermediate') return { sets: 4, reps: 4, label: '4 série × 4 opakování' };
    return { sets: 5, reps: 3, label: '5 sérií × 3 opakování' };
  }

  function buildStrengthDay(profile, dateStr, history) {
    const avoid = yesterdayPatterns(history, dateStr);
    const pool = filterPool(profile, ['weightlifting']).filter(ex =>
      ['squat', 'hinge', 'push', 'olympic'].includes(ex.pattern));
    const mainCandidates = pool.filter(ex => !avoid.includes(ex.pattern));
    const mainPool = mainCandidates.length ? mainCandidates : pool;
    const main = mainPool.length ? mainPool[Math.floor(Math.random() * mainPool.length)] : null;

    const blocks = [];
    let usedPatterns = [];
    if (main) {
      const scheme = strengthSetsScheme(profile.level);
      const wEx = toWorkoutExercise(main, profile, 'strength', `${scheme.sets} × ${scheme.reps}`, scheme.label);
      usedPatterns.push(main.pattern);
      blocks.push({
        title: 'Blok A · Síla', format: 'strength', formatLabel: FORMAT_LABELS.strength,
        durationMin: 18, timeCap: null,
        scheme: scheme.label,
        exercises: [wEx],
        notes: `Postupné navyšování na pracovní váhu (${wEx.weight ? wEx.weight + ' kg' : 'dle standardu'}), 2–3 min odpočinek mezi sériemi.`
      });
    }

    const metconFormat = pickMetconFormat(['amrap', 'emom', 'for-time'], profile);
    const metconMinutes = clampTime(profile.timeAvailable - 18, 8, 15);
    const metconPool = filterPool(profile, ['gymnastics', 'monostructural', 'strongman', 'weightlifting'])
      .filter(ex => !usedPatterns.includes(ex.pattern) || ex.category === 'monostructural');
    const picks = pickExercises(metconPool, 3, { avoidPatterns: usedPatterns });
    blocks.push(buildMetconBlock('Blok B · Metcon', metconFormat, picks, profile, metconMinutes));

    return blocks;
  }

  function buildGymnasticsDay(profile, dateStr, history) {
    const avoid = yesterdayPatterns(history, dateStr);
    const skillPool = filterPool(profile, ['gymnastics']).filter(ex => !avoid.includes(ex.pattern));
    const skillCandidates = skillPool.length ? skillPool : filterPool(profile, ['gymnastics']);
    const skillPicks = pickExercises(skillCandidates, 1, {});
    const blocks = [];
    let usedPatterns = [];

    if (skillPicks.length) {
      const s = skillPicks[0];
      usedPatterns.push(s.pattern);
      const lvl = levelBlock(s, profile);
      const wEx = toWorkoutExercise(s, profile, 'technique', '5 × 3–5 kvalitních opakování', 'Technický nácvik');
      blocks.push({
        title: 'Blok A · Skill', format: 'strength', formatLabel: 'Technika',
        durationMin: 10, timeCap: null, scheme: '5 sérií, důraz na kvalitu',
        exercises: [wEx],
        notes: `Kritérium postupu: ${lvl.info.criteria}`
      });
    }

    const emomFormat = pickMetconFormat(['emom', 'amrap'], profile);
    const emomMinutes = clampTime(profile.timeAvailable - 10, 10, 16);
    const emomPool = filterPool(profile, ['gymnastics', 'monostructural', 'weightlifting', 'strongman']);
    const picks = pickExercises(emomPool, 3, { avoidPatterns: usedPatterns });
    blocks.push(buildMetconBlock('Blok B · EMOM', emomFormat, picks, profile, emomMinutes));

    return blocks;
  }

  function buildMonostructuralDay(profile) {
    const pool = filterPool(profile, ['monostructural']);
    if (!pool.length) {
      return [{
        title: 'Engine', format: 'steady', formatLabel: FORMAT_LABELS.steady,
        durationMin: clampTime(profile.timeAvailable, 15, 30), timeCap: null,
        scheme: 'Aktivní regenerace', exercises: [],
        notes: 'Nemáš k dispozici žádné monostrukturální vybavení — zvol volnou chůzi/lehký výklus jako aktivní regeneraci.'
      }];
    }
    const format = pickMetconFormat(['intervals', 'steady', 'tabata'], profile);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    const wEx = toWorkoutExercise(pick, profile, 'metcon', '', '');

    if (format === 'tabata') {
      wEx.reps = '8 kol × 20 s práce / 10 s odpočinek';
      return [{
        title: 'Engine · Tabata', format, formatLabel: FORMAT_LABELS.tabata,
        durationMin: 4, timeCap: null, scheme: '8 × (20s ON / 10s OFF)',
        exercises: [wEx], notes: 'Maximální úsilí v každém 20s intervalu.'
      }];
    }
    if (format === 'intervals') {
      const rounds = 6;
      wEx.reps = `${rounds} × 500 m (nebo 90 s) / 90 s odpočinek`;
      return [{
        title: 'Engine · Intervaly', format, formatLabel: FORMAT_LABELS.intervals,
        durationMin: clampTime(profile.timeAvailable, 18, 30), timeCap: null,
        scheme: `${rounds} intervalů se stálým odpočinkem`,
        exercises: [wEx], notes: 'Udržuj konzistentní tempo/split napříč všemi koly.'
      }];
    }
    const minutes = clampTime(profile.timeAvailable, 15, 35);
    wEx.reps = `${minutes} minut v konstantním tempu (zóna 2–3)`;
    return [{
      title: 'Engine · Steady State', format, formatLabel: FORMAT_LABELS.steady,
      durationMin: minutes, timeCap: null, scheme: 'Souvislé tempo',
      exercises: [wEx], notes: 'Udržitelné, konverzační tempo po celou dobu.'
    }];
  }

  function buildChipperDay(profile, dateStr, history) {
    const avoid = yesterdayPatterns(history, dateStr);
    const pool = filterPool(profile, ['gymnastics', 'monostructural', 'strongman', 'weightlifting']);
    const picks = pickExercises(pool, 6, { avoidPatterns: avoid });
    const timeCap = clampTime(profile.timeAvailable, 18, 30);
    const baseReps = [40, 30, 25, 20, 15, 10];
    const exercises = picks.map((ex, i) => toWorkoutExercise(ex, profile, 'metcon', String(baseReps[i] || 15), ''));
    return [{
      title: 'Chipper', format: 'chipper', formatLabel: FORMAT_LABELS.chipper,
      durationMin: timeCap, timeCap: `${timeCap} min`, scheme: 'For Time — projdi cviky v pořadí, jednou každý',
      exercises,
      notes: 'Dlouhý objemový trénink — rozlož síly, nezačínej zbytečně rychle.'
    }];
  }

  function buildMetconBlock(title, format, picks, profile, minutes) {
    const exercises = picks.map(ex => toWorkoutExercise(ex, profile, 'metcon', '', ''));
    if (format === 'emom') {
      exercises.forEach((e, i) => {
        e.reps = e.category === 'monostructural' ? '12–15 kalorií' : (e.category === 'gymnastics' ? '8–12 opakování' : '5–6 opakování');
        e.note = `Minuta ${i + 1} z každého cyklu`;
      });
      return {
        title, format, formatLabel: FORMAT_LABELS.emom, durationMin: minutes, timeCap: null,
        scheme: `EMOM ${minutes} min — střídej ${exercises.length} cviky po minutách`,
        exercises, notes: 'Cílem je zvládnout práci vždy v první polovině minuty a mít prostor na odpočinek.'
      };
    }
    if (format === 'for-time') {
      exercises.forEach(e => { e.reps = e.category === 'monostructural' ? '15 kalorií' : '15 opakování'; });
      const cap = `${minutes} min`;
      return {
        title, format, formatLabel: FORMAT_LABELS['for-time'], durationMin: minutes, timeCap: cap,
        scheme: `3 kola For Time — ${exercises.map(e => e.name).join(', ')}`, exercises,
        notes: `Time cap ${cap}. Piš si čas dokončení pro sledování progresu.`
      };
    }
    // default: AMRAP
    exercises.forEach(e => { e.reps = e.category === 'monostructural' ? '12 kalorií' : '10 opakování'; });
    return {
      title, format: 'amrap', formatLabel: FORMAT_LABELS.amrap, durationMin: minutes, timeCap: null,
      scheme: `AMRAP ${minutes} min`, exercises,
      notes: 'Co nejvíce kompletních kol v daném čase, technika před rychlostí.'
    };
  }

  function estimateCalories(blocks, bodyweight) {
    let total = 0;
    blocks.forEach(b => {
      const met = FORMAT_MET[b.format] || 7;
      total += met * 3.5 * bodyweight / 200 * (b.durationMin || 10);
    });
    return Math.round(total);
  }

  function generateWorkout(profile, dateStr, history) {
    const dayIdx = weekdayIndex(dateStr);
    const dayType = profile.weeklyTemplate[dayIdx] || 'rest';

    if (dayType === 'rest') {
      return {
        date: dateStr, dayType, dayTypeLabel: DAY_TYPE_LABELS.rest,
        blocks: [{
          title: 'Odpočinek', format: 'rest', formatLabel: FORMAT_LABELS.rest,
          durationMin: 20, timeCap: null, scheme: 'Mobilita / regenerace',
          exercises: [], notes: 'Lehké strečování, mobilita kyčlí a ramen, procházka. Žádná intenzivní zátěž.'
        }],
        estKcal: 60, generatedAt: new Date().toISOString(), edited: false
      };
    }

    let blocks;
    if (dayType === 'strength') blocks = buildStrengthDay(profile, dateStr, history);
    else if (dayType === 'gymnastics') blocks = buildGymnasticsDay(profile, dateStr, history);
    else if (dayType === 'monostructural') blocks = buildMonostructuralDay(profile);
    else blocks = buildChipperDay(profile, dateStr, history);

    return {
      date: dateStr, dayType, dayTypeLabel: DAY_TYPE_LABELS[dayType] || dayType,
      blocks,
      estKcal: estimateCalories(blocks, profile.bodyweight || 75),
      generatedAt: new Date().toISOString(), edited: false
    };
  }

  function regenerateBlock(profile, dateStr, history, blockIndex, workout) {
    const fresh = generateWorkout(profile, dateStr, history);
    if (fresh.blocks[blockIndex]) {
      workout.blocks[blockIndex] = fresh.blocks[blockIndex];
      workout.estKcal = estimateCalories(workout.blocks, profile.bodyweight || 75);
    }
    return workout;
  }

  return {
    DAY_TYPE_LABELS, FORMAT_LABELS,
    generateWorkout, regenerateBlock, filterPool, levelTier, computeLoad, weekdayIndex
  };
})();
