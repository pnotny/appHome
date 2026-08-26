/* ==========================================================================
   CrossFit Coach — localStorage vrstva (profil, historie, PR log)
   ========================================================================== */

window.CFStorage = (function () {
  const KEYS = {
    profile: 'cf_profile_v1',
    history: 'cf_history_v1',
    prLog: 'cf_pr_log_v1',
    theme: 'cf_theme_v1'
  };

  const DEFAULT_WEEKLY_TEMPLATE = ['strength', 'gymnastics', 'monostructural', 'strength', 'gymnastics', 'chipper', 'rest'];
  // index 0 = pondělí ... 6 = neděle

  const DEFAULT_PROFILE = {
    name: '',
    gender: 'M', // M | F
    bodyweight: 80,
    level: 'intermediate', // beginner | intermediate | advanced | rx
    oneRM: { backSquat: null, frontSquat: null, deadlift: null, clean: null, snatch: null, press: null },
    equipment: ['barbell', 'rack', 'dumbbell', 'kettlebell', 'box', 'rower', 'bike-erg', 'ski-erg'],
    excludedPatterns: [],
    goal: 'condition', // strength | condition | weight-loss | skill
    timeAvailable: 30, // minut
    preferredFormats: [], // prázdné = bez preference
    weeklyTemplate: DEFAULT_WEEKLY_TEMPLATE.slice()
  };

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('CFStorage read error', key, e);
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn('CFStorage write error', key, e);
      return false;
    }
  }

  function getProfile() {
    const stored = read(KEYS.profile, null);
    if (!stored) return Object.assign({}, DEFAULT_PROFILE);
    const merged = Object.assign({}, DEFAULT_PROFILE, stored);
    merged.oneRM = Object.assign({}, DEFAULT_PROFILE.oneRM, stored.oneRM || {});
    merged.weeklyTemplate = (stored.weeklyTemplate && stored.weeklyTemplate.length === 7)
      ? stored.weeklyTemplate : DEFAULT_WEEKLY_TEMPLATE.slice();
    return merged;
  }

  function saveProfile(profile) {
    write(KEYS.profile, profile);
  }

  function hasProfile() {
    return !!read(KEYS.profile, null);
  }

  function getHistory() {
    return read(KEYS.history, []);
  }

  function saveWorkoutToHistory(workout) {
    const history = getHistory();
    const idx = history.findIndex(w => w.date === workout.date);
    if (idx >= 0) history[idx] = workout; else history.unshift(workout);
    history.sort((a, b) => (a.date < b.date ? 1 : -1));
    write(KEYS.history, history);
    return history;
  }

  function getWorkoutByDate(date) {
    return getHistory().find(w => w.date === date) || null;
  }

  function deleteWorkout(date) {
    const history = getHistory().filter(w => w.date !== date);
    write(KEYS.history, history);
    return history;
  }

  function getPrLog() {
    return read(KEYS.prLog, []);
  }

  function addPrEntry(entry) {
    const log = getPrLog();
    log.push(entry);
    log.sort((a, b) => (a.date < b.date ? -1 : 1));
    write(KEYS.prLog, log);
    return log;
  }

  function getTheme() {
    return read(KEYS.theme, 'auto');
  }

  function setTheme(theme) {
    write(KEYS.theme, theme);
  }

  return {
    KEYS, DEFAULT_PROFILE, DEFAULT_WEEKLY_TEMPLATE,
    getProfile, saveProfile, hasProfile,
    getHistory, saveWorkoutToHistory, getWorkoutByDate, deleteWorkout,
    getPrLog, addPrEntry,
    getTheme, setTheme
  };
})();
