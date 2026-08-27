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

  function dateMinusDays(dateStr, n) {
    const d = new Date(dateStr + 'T12:00:00');
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  }

  function yesterdayPatterns(history, dateStr) {
    const key = dateMinusDays(dateStr, 1);
    const w = (history || []).find(h => h.date === key);
    if (!w) return [];
    const patterns = [];
    (w.blocks || []).forEach(b => (b.exercises || []).forEach(e => patterns.push(e.pattern)));
    return patterns;
  }

  // Zátěž svalových skupin za posledních `daysBack` dní (novější den = vyšší váha),
  // aby týdenní programming dával smysl a stejné partie se netahaly den za dnem.
  function recentMuscleLoad(history, dateStr, daysBack) {
    const loadMap = {};
    for (let i = 1; i <= daysBack; i++) {
      const key = dateMinusDays(dateStr, i);
      const w = (history || []).find(h => h.date === key);
      if (!w) continue;
      const weight = daysBack - i + 1;
      (w.blocks || []).forEach(b => (b.exercises || []).forEach(e => {
        const ex = EX.find(x => x.id === e.exerciseId);
        if (!ex) return;
        ex.muscles.forEach(m => { loadMap[m] = (loadMap[m] || 0) + weight; });
      }));
    }
    return loadMap;
  }

  function muscleOverlapScore(exercise, loadMap) {
    if (!loadMap) return 0;
    return exercise.muscles.reduce((s, m) => s + (loadMap[m] || 0), 0);
  }

  function leastLoadedPick(candidates, muscleLoad) {
    if (!muscleLoad || !candidates.length) return candidates[Math.floor(Math.random() * candidates.length)];
    const scored = candidates.map(ex => ({ ex, score: muscleOverlapScore(ex, muscleLoad) }));
    const minScore = Math.min(...scored.map(s => s.score));
    const best = scored.filter(s => s.score === minScore).map(s => s.ex);
    return best[Math.floor(Math.random() * best.length)];
  }

  function pickExercises(pool, count, opts) {
    opts = opts || {};
    const avoidPatterns = opts.avoidPatterns || [];
    const muscleLoad = opts.muscleLoad || null;
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
      const pick = leastLoadedPick(filtered, muscleLoad);
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
    const muscleLoad = recentMuscleLoad(history, dateStr, 2);
    const pool = filterPool(profile, ['weightlifting']).filter(ex =>
      ['squat', 'hinge', 'push', 'olympic'].includes(ex.pattern));
    const mainCandidates = pool.filter(ex => !avoid.includes(ex.pattern));
    const mainPool = mainCandidates.length ? mainCandidates : pool;
    const main = mainPool.length ? leastLoadedPick(mainPool, muscleLoad) : null;

    const total = profile.timeAvailable || 30;
    const strengthMin = clampTime(Math.round(total * 0.4 / 5) * 5, 12, 30);
    const blocks = [];
    let usedPatterns = [];
    if (main) {
      const scheme = strengthSetsScheme(profile.level);
      const wEx = toWorkoutExercise(main, profile, 'strength', `${scheme.sets} × ${scheme.reps}`, scheme.label);
      usedPatterns.push(main.pattern);
      blocks.push({
        title: 'Blok A · Síla', format: 'strength', formatLabel: FORMAT_LABELS.strength,
        durationMin: strengthMin, timeCap: null,
        scheme: scheme.label,
        exercises: [wEx],
        notes: `Postupné navyšování na pracovní váhu (${wEx.weight ? wEx.weight + ' kg' : 'dle standardu'}), 2–3 min odpočinek mezi sériemi.`
      });
    }

    // Pokud se blok síly nevygeneroval (např. chybí činka), ať metcon vyplní celý zbylý čas.
    const metconMinutes = clampTime(total - (main ? strengthMin : 0), 8, 40);
    const metconPool = filterPool(profile, ['gymnastics', 'monostructural', 'strongman', 'weightlifting'])
      .filter(ex => !usedPatterns.includes(ex.pattern) || ex.category === 'monostructural');
    blocks.push(...buildMetconSegments('Blok B · Metcon', ['amrap', 'emom', 'for-time'], metconPool, profile, metconMinutes, usedPatterns, muscleLoad));

    return blocks;
  }

  function buildGymnasticsDay(profile, dateStr, history) {
    const avoid = yesterdayPatterns(history, dateStr);
    const muscleLoad = recentMuscleLoad(history, dateStr, 2);
    const skillPool = filterPool(profile, ['gymnastics']).filter(ex => !avoid.includes(ex.pattern));
    const skillCandidates = skillPool.length ? skillPool : filterPool(profile, ['gymnastics']);
    const skillPick = skillCandidates.length ? leastLoadedPick(skillCandidates, muscleLoad) : null;

    const total = profile.timeAvailable || 30;
    const skillMin = clampTime(Math.round(total * 0.3 / 5) * 5, 8, 18);
    const blocks = [];
    let usedPatterns = [];

    if (skillPick) {
      usedPatterns.push(skillPick.pattern);
      const lvl = levelBlock(skillPick, profile);
      const wEx = toWorkoutExercise(skillPick, profile, 'technique', '5 × 3–5 kvalitních opakování', 'Technický nácvik');
      blocks.push({
        title: 'Blok A · Skill', format: 'strength', formatLabel: 'Technika',
        durationMin: skillMin, timeCap: null, scheme: '5 sérií, důraz na kvalitu',
        exercises: [wEx],
        notes: `Kritérium postupu: ${lvl.info.criteria}`
      });
    }

    // Pokud se blok skillu nevygeneroval, ať EMOM vyplní celý zbylý čas.
    const emomMinutes = clampTime(total - (skillPick ? skillMin : 0), 8, 40);
    const emomPool = filterPool(profile, ['gymnastics', 'monostructural', 'weightlifting', 'strongman']);
    blocks.push(...buildMetconSegments('Blok B · EMOM', ['emom', 'amrap'], emomPool, profile, emomMinutes, usedPatterns, muscleLoad));

    return blocks;
  }

  function buildMonostructuralDay(profile) {
    const pool = filterPool(profile, ['monostructural']);
    const total = clampTime(profile.timeAvailable || 30, 12, 90);
    if (!pool.length) {
      return [{
        title: 'Engine', format: 'steady', formatLabel: FORMAT_LABELS.steady,
        durationMin: total, timeCap: null,
        scheme: 'Aktivní regenerace', exercises: [],
        notes: 'Nemáš k dispozici žádné monostrukturální vybavení — zvol volnou chůzi/lehký výklus jako aktivní regeneraci.'
      }];
    }
    // Tabata je krátký formát (~4 min) — dává smysl jen jako celá náplň kratšího dne.
    const candidateFormats = total <= 20 ? ['tabata', 'intervals'] : ['intervals', 'steady'];
    const format = pickMetconFormat(candidateFormats, profile);
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
      const rounds = clampTime(Math.round(total / 6), 4, 14);
      wEx.reps = `${rounds} × 500 m (nebo 90 s) / 90 s odpočinek`;
      return [{
        title: 'Engine · Intervaly', format, formatLabel: FORMAT_LABELS.intervals,
        durationMin: total, timeCap: null,
        scheme: `${rounds} intervalů se stálým odpočinkem`,
        exercises: [wEx], notes: 'Udržuj konzistentní tempo/split napříč všemi koly.'
      }];
    }
    wEx.reps = `${total} minut v konstantním tempu (zóna 2–3)`;
    return [{
      title: 'Engine · Steady State', format, formatLabel: FORMAT_LABELS.steady,
      durationMin: total, timeCap: null, scheme: 'Souvislé tempo',
      exercises: [wEx], notes: 'Udržitelné, konverzační tempo po celou dobu.'
    }];
  }

  function buildChipperDay(profile, dateStr, history) {
    const avoid = yesterdayPatterns(history, dateStr);
    const muscleLoad = recentMuscleLoad(history, dateStr, 2);
    const pool = filterPool(profile, ['gymnastics', 'monostructural', 'strongman', 'weightlifting']);
    const timeCap = clampTime(profile.timeAvailable || 30, 15, 60);
    const count = clampTime(Math.round(timeCap / 6), 4, 8);
    const picks = pickExercises(pool, count, { avoidPatterns: avoid, muscleLoad });
    const baseReps = [50, 40, 35, 30, 25, 20, 15, 10];
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

  // Dlouhý metcon/EMOM v jedné neměnné sadě cviků je mentálně (i pohybově)
  // vyčerpávající — nad ~22 min proto rozdělíme na 2–4 kratší segmenty
  // (~15 min každý) s vlastním výběrem cviků/partií, ale stejným formátem.
  function buildMetconSegments(titlePrefix, formatCandidates, pool, profile, totalMinutes, baseAvoidPatterns, muscleLoad, exercisesPerSegment) {
    exercisesPerSegment = exercisesPerSegment || 3;
    const format = pickMetconFormat(formatCandidates, profile);
    const numSegments = totalMinutes > 22 ? clampTime(Math.round(totalMinutes / 15), 2, 4) : 1;
    const segMinutes = clampTime(Math.round(totalMinutes / numSegments / 5) * 5, 8, 20);
    const blocks = [];
    const cumulativePatterns = baseAvoidPatterns.slice();
    const cumulativeIds = [];
    for (let i = 0; i < numSegments; i++) {
      let segPool = pool.filter(ex => !cumulativeIds.includes(ex.id));
      if (segPool.length < exercisesPerSegment) segPool = pool;
      const picks = pickExercises(segPool, exercisesPerSegment, { avoidPatterns: cumulativePatterns, muscleLoad });
      const label = numSegments > 1 ? `${titlePrefix} · ${i + 1}/${numSegments}` : titlePrefix;
      const block = buildMetconBlock(label, format, picks, profile, segMinutes);
      if (numSegments > 1) block.notes += ' Krátký odpočinek (2–3 min) a nová sada cviků na jiné partie.';
      blocks.push(block);
      picks.forEach(p => { cumulativePatterns.push(p.pattern); cumulativeIds.push(p.id); });
    }
    return blocks;
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
