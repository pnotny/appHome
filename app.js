// ===== FIREBASE =====
const firebaseConfig = {
  apiKey: "AIzaSyAaqo82z702uWhi39MuxgREqW_m3tKmvpo",
  authDomain: "costs-73862.firebaseapp.com",
  projectId: "costs-73862",
  storageBucket: "costs-73862.firebasestorage.app",
  messagingSenderId: "275384916421",
  appId: "1:275384916421:web:89aa70d99c73796cf053ac",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
db.enablePersistence({ synchronizeTabs: true }).catch(() => {});

// ===== STATE =====
const DEFAULT_CATEGORIES = [
  { id: 'food',      name: 'Jídlo',     emoji: '🛒' },
  { id: 'housing',   name: 'Bydlení',   emoji: '🏠' },
  { id: 'transport', name: 'Doprava',   emoji: '🚗' },
  { id: 'health',    name: 'Zdraví',    emoji: '💊' },
  { id: 'fun',       name: 'Zábava',    emoji: '🎬' },
  { id: 'clothing',  name: 'Oblečení',  emoji: '👕' },
  { id: 'education', name: 'Vzdělání',  emoji: '📚' },
  { id: 'other',     name: 'Ostatní',   emoji: '📦' },
];

const CAT_COLORS = [
  '#34C759','#007AFF','#FF9500','#FF3B30','#AF52DE',
  '#FF2D55','#5AC8FA','#FFCC00','#00C7BE','#30B0C7',
];

const savedNav = JSON.parse(localStorage.getItem('finance_nav') || '{}');
let state = {
  persons: [
    { name: 'Adam', color: '#34C759' },
    { name: 'Bára', color: '#007AFF' },
  ],
  categories: DEFAULT_CATEGORIES,
  expenses: [],
  currentMonth: savedNav.month ?? new Date().getMonth(),
  currentYear:  savedNav.year  ?? new Date().getFullYear(),
};

let householdId  = localStorage.getItem('finance_household');
let unsubSettings = null;
let unsubExpenses  = null;

function saveNav() {
  localStorage.setItem('finance_nav', JSON.stringify({
    month: state.currentMonth,
    year:  state.currentYear,
  }));
}

// ===== FIRESTORE =====
function householdRef() {
  return db.collection('households').doc(householdId);
}

function subscribeToHousehold() {
  if (unsubSettings) unsubSettings();
  if (unsubExpenses)  unsubExpenses();

  unsubSettings = householdRef().onSnapshot(doc => {
    if (doc.exists) {
      const d = doc.data();
      if (d.persons)    state.persons    = d.persons;
      if (d.categories) state.categories = d.categories;
    } else {
      householdRef().set({ persons: state.persons, categories: state.categories });
    }
    updateSidebarPersons();
    renderSettings();
    renderDashboard();
  });

  unsubExpenses = householdRef().collection('expenses').onSnapshot(snap => {
    state.expenses = snap.docs.map(d => d.data());
    renderAll();
  });
}

async function syncExpense(expense) {
  if (!householdId) return;
  await householdRef().collection('expenses').doc(expense.id).set(expense);
}

async function removeExpense(id) {
  if (!householdId) return;
  await householdRef().collection('expenses').doc(id).delete();
}

async function syncSettings() {
  if (!householdId) return;
  await householdRef().set({ persons: state.persons, categories: state.categories }, { merge: true });
}

// ===== UTILS =====
function fmt(n) {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(n);
}
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' });
}
function monthLabel(m, y) {
  return new Date(y, m, 1).toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' });
}
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function catById(id) {
  return state.categories.find(c => c.id === id) || { name: 'Ostatní', emoji: '📦' };
}
function getCatColor(idx) {
  return CAT_COLORS[idx % CAT_COLORS.length];
}
function expensesForMonth(m, y) {
  return state.expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === m && d.getFullYear() === y;
  });
}
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2400);
}
function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ===== SPLIT HELPERS =====
function getPersonShares(exp) {
  const amount = exp.amount || 0;
  const paidBy = exp.paidBy ?? exp.personIdx ?? 0;
  if (!exp.split) {
    return {
      p0share: paidBy === 0 ? amount : 0,
      p1share: paidBy === 1 ? amount : 0,
      p0paid:  paidBy === 0 ? amount : 0,
      p1paid:  paidBy === 1 ? amount : 0,
    };
  }
  const ratio  = exp.splitRatio ?? 50;
  const p0share = Math.round(amount * ratio) / 100;
  return {
    p0share,
    p1share: amount - p0share,
    p0paid:  paidBy === 0 ? amount : 0,
    p1paid:  paidBy === 1 ? amount : 0,
  };
}

function calcBalance(expenses) {
  let p0paid = 0, p1paid = 0, p0eff = 0, p1eff = 0;
  expenses.forEach(exp => {
    const { p0share, p1share, p0paid: pp0, p1paid: pp1 } = getPersonShares(exp);
    p0paid += pp0; p1paid += pp1; p0eff += p0share; p1eff += p1share;
  });
  return { p0paid, p1paid, p0eff, p1eff, p0net: p0paid - p0eff };
}

// ===== NAVIGATION =====
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => switchView(btn.dataset.view));
});
document.querySelectorAll('.btn-link[data-view]').forEach(btn => {
  btn.addEventListener('click', () => switchView(btn.dataset.view));
});
document.querySelectorAll('.bottom-nav-item').forEach(btn => {
  btn.addEventListener('click', () => switchView(btn.dataset.view));
});

function switchView(view) {
  document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  document.querySelectorAll('.bottom-nav-item').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === 'view-' + view));
  if (view === 'dashboard') renderDashboard();
  if (view === 'expenses')  renderExpenses();
  if (view === 'analytics') renderAnalytics();
  if (view === 'settings')  renderSettings();
}

// ===== MONTH NAV =====
document.getElementById('prev-month-btn').addEventListener('click', () => {
  state.currentMonth--;
  if (state.currentMonth < 0) { state.currentMonth = 11; state.currentYear--; }
  saveNav(); renderDashboard();
});
document.getElementById('next-month-btn').addEventListener('click', () => {
  state.currentMonth++;
  if (state.currentMonth > 11) { state.currentMonth = 0; state.currentYear++; }
  saveNav(); renderDashboard();
});

// ===== MODAL =====
let editingId = null;
let selectedPerson = 0;
let splitEnabled = false;
let splitRatio = 50;

function setRatioPreset(ratio) {
  if (ratio === 'custom') {
    document.getElementById('ratio-slider-wrap').style.display = '';
    document.querySelectorAll('.ratio-btn').forEach(b => b.classList.toggle('active', b.dataset.ratio === 'custom'));
    return;
  }
  splitRatio = parseInt(ratio);
  document.getElementById('ratio-slider').value = splitRatio;
  document.getElementById('ratio-p0-pct').textContent = splitRatio + ' %';
  document.getElementById('ratio-p1-pct').textContent = (100 - splitRatio) + ' %';
  document.getElementById('ratio-slider-wrap').style.display = 'none';
  document.querySelectorAll('.ratio-btn').forEach(b => b.classList.toggle('active', b.dataset.ratio == ratio));
  updateRatioPreview();
}

function updateRatioPreview() {
  const amount  = parseFloat(document.getElementById('expense-amount').value) || 0;
  const preview = document.getElementById('ratio-preview');
  if (!amount) { preview.textContent = 'Zadejte částku pro náhled'; return; }
  const p0 = Math.round(amount * splitRatio) / 100;
  const p1 = amount - p0;
  preview.textContent = `${state.persons[0].name} hradí ${fmt(p0)} · ${state.persons[1].name} hradí ${fmt(p1)}`;
}

function openModal(expenseId) {
  editingId = expenseId || null;
  selectedPerson = 0;
  splitEnabled   = false;
  splitRatio     = 50;

  document.getElementById('modal-title').textContent = editingId ? 'Upravit výdaj' : 'Nový výdaj';
  document.getElementById('expense-name').value   = '';
  document.getElementById('expense-amount').value = '';
  document.getElementById('expense-date').value   = todayISO();
  document.getElementById('expense-note').value   = '';

  const sel = document.getElementById('expense-category');
  sel.innerHTML = state.categories.map(c => `<option value="${c.id}">${c.emoji} ${c.name}</option>`).join('');

  document.getElementById('toggle-p1').textContent = state.persons[0].name;
  document.getElementById('toggle-p2').textContent = state.persons[1].name;

  // reset split UI
  document.getElementById('expense-split').checked          = false;
  document.getElementById('split-ratio-group').style.display = 'none';
  document.getElementById('split-toggle-label').textContent  = 'Platí pouze jedna osoba';
  document.getElementById('ratio-slider').value              = 50;
  document.getElementById('ratio-p0-pct').textContent        = '50 %';
  document.getElementById('ratio-p1-pct').textContent        = '50 %';
  document.getElementById('ratio-slider-wrap').style.display = 'none';
  document.getElementById('ratio-preview').textContent       = 'Zadejte částku pro náhled';
  document.querySelectorAll('.ratio-btn').forEach((b, i) => b.classList.toggle('active', i === 0));
  document.querySelectorAll('.modal-p0-name').forEach(el => el.textContent = state.persons[0].name);
  document.querySelectorAll('.modal-p1-name').forEach(el => el.textContent = state.persons[1].name);

  if (editingId) {
    const exp = state.expenses.find(e => e.id === editingId);
    if (exp) {
      document.getElementById('expense-name').value   = exp.name;
      document.getElementById('expense-amount').value = exp.amount;
      document.getElementById('expense-date').value   = exp.date;
      document.getElementById('expense-note').value   = exp.note || '';
      sel.value      = exp.categoryId;
      selectedPerson = exp.paidBy ?? exp.personIdx ?? 0;

      if (exp.split) {
        splitEnabled = true;
        splitRatio   = exp.splitRatio ?? 50;
        document.getElementById('expense-split').checked          = true;
        document.getElementById('split-ratio-group').style.display = '';
        document.getElementById('split-toggle-label').textContent  = 'Výdaj bude rozdělen';
        document.getElementById('ratio-slider').value              = splitRatio;
        document.getElementById('ratio-p0-pct').textContent        = splitRatio + ' %';
        document.getElementById('ratio-p1-pct').textContent        = (100 - splitRatio) + ' %';
        const knownPreset = ['50','60','70','33'].includes(String(splitRatio));
        document.querySelectorAll('.ratio-btn').forEach(b => {
          b.classList.toggle('active', knownPreset ? b.dataset.ratio == splitRatio : b.dataset.ratio === 'custom');
        });
        if (!knownPreset) document.getElementById('ratio-slider-wrap').style.display = '';
        updateRatioPreview();
      }
    }
  }

  updatePersonToggle();
  document.getElementById('modal-overlay').classList.add('open');
  document.getElementById('expense-name').focus();
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  editingId = null;
}

function updatePersonToggle() {
  const p1 = document.getElementById('toggle-p1');
  const p2 = document.getElementById('toggle-p2');
  p1.classList.toggle('active', selectedPerson === 0);
  p2.classList.toggle('active', selectedPerson === 1);
  p1.style.background = selectedPerson === 0 ? state.persons[0].color : '';
  p2.style.background = selectedPerson === 1 ? state.persons[1].color : '';
}

document.getElementById('toggle-p1').addEventListener('click', () => { selectedPerson = 0; updatePersonToggle(); });
document.getElementById('toggle-p2').addEventListener('click', () => { selectedPerson = 1; updatePersonToggle(); });
document.getElementById('add-expense-btn').addEventListener('click',   () => openModal());
document.getElementById('add-expense-btn-2').addEventListener('click', () => openModal());
document.getElementById('fab-btn').addEventListener('click',           () => openModal());
document.getElementById('modal-close').addEventListener('click',   closeModal);
document.getElementById('modal-cancel').addEventListener('click',  closeModal);
document.getElementById('modal-overlay').addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });

// split toggle
document.getElementById('expense-split').addEventListener('change', e => {
  splitEnabled = e.target.checked;
  document.getElementById('split-ratio-group').style.display = splitEnabled ? '' : 'none';
  document.getElementById('split-toggle-label').textContent  = splitEnabled ? 'Výdaj bude rozdělen' : 'Platí pouze jedna osoba';
  if (splitEnabled) updateRatioPreview();
});

// ratio preset buttons
document.querySelectorAll('.ratio-btn').forEach(btn => {
  btn.addEventListener('click', () => setRatioPreset(btn.dataset.ratio));
});

// ratio slider
document.getElementById('ratio-slider').addEventListener('input', e => {
  splitRatio = parseInt(e.target.value);
  document.getElementById('ratio-p0-pct').textContent = splitRatio + ' %';
  document.getElementById('ratio-p1-pct').textContent = (100 - splitRatio) + ' %';
  document.querySelectorAll('.ratio-btn').forEach(b => b.classList.toggle('active', b.dataset.ratio === 'custom'));
  updateRatioPreview();
});

// amount change updates preview
document.getElementById('expense-amount').addEventListener('input', () => {
  if (splitEnabled) updateRatioPreview();
});

document.getElementById('modal-save').addEventListener('click', async () => {
  const name      = document.getElementById('expense-name').value.trim();
  const amountRaw = document.getElementById('expense-amount').value;
  const date      = document.getElementById('expense-date').value;
  const categoryId = document.getElementById('expense-category').value;
  const note      = document.getElementById('expense-note').value.trim();

  if (!name) { document.getElementById('expense-name').focus(); return; }
  const amount = parseFloat(amountRaw);
  if (!amount || amount <= 0) { document.getElementById('expense-amount').focus(); return; }
  if (!date) return;

  const expense = {
    id: editingId || Date.now().toString(),
    name, amount, date, categoryId, note,
    paidBy:     selectedPerson,
    personIdx:  selectedPerson,
    split:      splitEnabled,
    splitRatio: splitEnabled ? splitRatio : null,
  };

  const wasEditing = !!editingId;
  closeModal();
  await syncExpense(expense);
  showToast(wasEditing ? 'Výdaj upraven' : 'Výdaj přidán');
});

// ===== CONFIRM DIALOG =====
let confirmCallback = null;
function openConfirm(title, message, cb) {
  document.getElementById('confirm-title').textContent   = title;
  document.getElementById('confirm-message').textContent = message;
  document.getElementById('confirm-overlay').classList.add('open');
  confirmCallback = cb;
}
document.getElementById('confirm-cancel').addEventListener('click', () => {
  document.getElementById('confirm-overlay').classList.remove('open');
  confirmCallback = null;
});
document.getElementById('confirm-ok').addEventListener('click', () => {
  document.getElementById('confirm-overlay').classList.remove('open');
  if (confirmCallback) { confirmCallback(); confirmCallback = null; }
});
document.getElementById('confirm-overlay').addEventListener('click', e => {
  if (e.target === e.currentTarget) document.getElementById('confirm-overlay').classList.remove('open');
});

// ===== RENDER EXPENSE ITEM =====
function renderExpenseItem(exp) {
  const cat    = catById(exp.categoryId);
  const paidBy = exp.paidBy ?? exp.personIdx ?? 0;
  const person = state.persons[paidBy] || state.persons[0];
  const div    = document.createElement('div');
  div.className = 'expense-item';

  let splitBadge = '';
  if (exp.split) {
    const r  = exp.splitRatio ?? 50;
    splitBadge = `<span class="split-chip">⚡ ${r}/${100 - r}</span>`;
  }

  div.innerHTML = `
    <div class="expense-cat-icon">${cat.emoji}</div>
    <div class="expense-info">
      <div class="expense-name">${escHtml(exp.name)} ${splitBadge}</div>
      <div class="expense-meta">
        <span class="expense-person-badge" style="background:${person.color}">${escHtml(person.name)}</span>
        <span class="expense-meta-dot">·</span>
        <span>${cat.name}</span>
        <span class="expense-meta-dot">·</span>
        <span>${fmtDate(exp.date)}</span>
        ${exp.note ? `<span class="expense-meta-dot">·</span><span>${escHtml(exp.note)}</span>` : ''}
      </div>
    </div>
    <div class="expense-amount">${fmt(exp.amount)}</div>
    <div class="expense-actions">
      <button class="action-btn edit" title="Upravit">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </button>
      <button class="action-btn delete" title="Smazat">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6"/><path d="M14 11v6"/>
        </svg>
      </button>
    </div>`;
  div.querySelector('.action-btn.edit').addEventListener('click', () => openModal(exp.id));
  div.querySelector('.action-btn.delete').addEventListener('click', () => {
    openConfirm('Smazat výdaj?', `"${exp.name}" – ${fmt(exp.amount)}`, async () => {
      await removeExpense(exp.id);
      showToast('Výdaj smazán');
    });
  });
  return div;
}

// ===== DASHBOARD =====
function renderDashboard() {
  const { currentMonth: m, currentYear: y, persons } = state;
  const expenses = expensesForMonth(m, y);

  document.getElementById('month-label').textContent           = monthLabel(m, y);
  document.getElementById('expenses-month-label').textContent  = monthLabel(m, y);
  document.getElementById('analytics-month-label').textContent = monthLabel(m, y);

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const { p0eff, p1eff, p0paid, p1paid, p0net } = calcBalance(expenses);

  document.getElementById('total-amount').textContent = fmt(total);
  document.getElementById('p1-label').textContent     = persons[0].name;
  document.getElementById('p2-label').textContent     = persons[1].name;
  document.getElementById('p1-amount').textContent    = fmt(p0eff);
  document.getElementById('p2-amount').textContent    = fmt(p1eff);
  document.getElementById('p1-percent').textContent   = total ? Math.round(p0eff / total * 100) + ' %' : '0 %';
  document.getElementById('p2-percent').textContent   = total ? Math.round(p1eff / total * 100) + ' %' : '0 %';

  // balance: positive p0net means p0 overpaid (p1 owes p0)
  const owedAmt = Math.abs(p0net);
  document.getElementById('balance-value').textContent = fmt(owedAmt);
  if (owedAmt < 1) {
    document.getElementById('balance-direction').textContent = 'Vyrovnáno';
  } else if (p0net > 0) {
    document.getElementById('balance-direction').textContent = `${persons[1].name} dluží ${persons[0].name}`;
  } else {
    document.getElementById('balance-direction').textContent = `${persons[0].name} dluží ${persons[1].name}`;
  }

  const p0pct = total ? p0eff / total * 100 : 50;
  const p1pct = total ? p1eff / total * 100 : 50;
  document.getElementById('split-fill-p1').style.width      = p0pct + '%';
  document.getElementById('split-fill-p2').style.width      = p1pct + '%';
  document.getElementById('split-fill-p1').style.background = persons[0].color;
  document.getElementById('split-fill-p2').style.background = persons[1].color;
  document.getElementById('split-p1-pct').textContent  = Math.round(p0pct) + ' %';
  document.getElementById('split-p2-pct').textContent  = Math.round(p1pct) + ' %';
  document.getElementById('split-p1-name').textContent = persons[0].name;
  document.getElementById('split-p2-name').textContent = persons[1].name;

  const list   = document.getElementById('recent-expense-list');
  list.innerHTML = '';
  const recent = [...expenses].sort((a,b) => b.date.localeCompare(a.date)).slice(0, 6);
  if (recent.length === 0) {
    list.innerHTML = `<div class="empty-state">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
      <p>Zatím žádné výdaje</p><p class="empty-sub">Přidejte první výdaj kliknutím na tlačítko výše</p></div>`;
  } else {
    recent.forEach(e => list.appendChild(renderExpenseItem(e)));
  }
  updateSidebarPersons();
}

// ===== EXPENSES VIEW =====
function renderExpenses() {
  let expenses = expensesForMonth(state.currentMonth, state.currentYear);

  const search      = document.getElementById('search-input').value.toLowerCase();
  const personFilter = document.getElementById('filter-person').value;
  const catFilter    = document.getElementById('filter-category').value;

  if (search)               expenses = expenses.filter(e => e.name.toLowerCase().includes(search) || (e.note||'').toLowerCase().includes(search));
  if (personFilter !== 'all') expenses = expenses.filter(e => (e.paidBy ?? e.personIdx) === parseInt(personFilter));
  if (catFilter !== 'all')    expenses = expenses.filter(e => e.categoryId === catFilter);

  const sorted = [...expenses].sort((a,b) => b.date.localeCompare(a.date));
  const list   = document.getElementById('all-expense-list');
  list.innerHTML = '';

  const catSel  = document.getElementById('filter-category');
  const prevCat = catSel.value;
  catSel.innerHTML = `<option value="all">Všechny kategorie</option>` +
    state.categories.map(c => `<option value="${c.id}">${c.emoji} ${c.name}</option>`).join('');
  catSel.value = prevCat;

  const pSel = document.getElementById('filter-person');
  pSel.options[1].text = state.persons[0].name;
  pSel.options[2].text = state.persons[1].name;

  if (sorted.length === 0) {
    list.innerHTML = `<div class="empty-state"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg><p>Žádné výdaje</p></div>`;
  } else {
    sorted.forEach(e => list.appendChild(renderExpenseItem(e)));
  }
}

['search-input', 'filter-person', 'filter-category'].forEach(id => {
  document.getElementById(id).addEventListener('input',  renderExpenses);
  document.getElementById(id).addEventListener('change', renderExpenses);
});

// ===== ANALYTICS =====
function renderAnalytics() {
  const expenses = expensesForMonth(state.currentMonth, state.currentYear);
  const catTotals = {};
  expenses.forEach(e => { catTotals[e.categoryId] = (catTotals[e.categoryId] || 0) + e.amount; });
  const total  = expenses.reduce((s, e) => s + e.amount, 0);
  const sorted = Object.entries(catTotals).sort((a,b) => b[1]-a[1]);

  const barsEl = document.getElementById('category-bars');
  barsEl.innerHTML = '';
  if (sorted.length === 0) {
    barsEl.innerHTML = '<p style="color:var(--text-3);font-size:14px">Žádná data pro tento měsíc</p>';
  } else {
    const max = sorted[0][1];
    sorted.forEach(([catId, amt]) => {
      const cat   = catById(catId);
      const pct   = max ? (amt / max * 100) : 0;
      const color = getCatColor(state.categories.findIndex(c => c.id === catId));
      const row   = document.createElement('div');
      row.className = 'cat-bar-row';
      row.innerHTML = `
        <div class="cat-bar-header">
          <span class="cat-bar-name">${cat.emoji} ${cat.name}</span>
          <span class="cat-bar-amount">${fmt(amt)}</span>
        </div>
        <div class="cat-bar-track">
          <div class="cat-bar-fill" style="width:${pct}%;background:${color}"></div>
        </div>`;
      barsEl.appendChild(row);
    });
  }

  renderDonut(sorted, total);

  const topEl  = document.getElementById('top-expenses-list');
  topEl.innerHTML = '';
  const top5 = [...expenses].sort((a,b) => b.amount - a.amount).slice(0, 5);
  if (top5.length === 0) {
    topEl.innerHTML = '<p style="color:var(--text-3);font-size:14px">Žádná data</p>';
  } else {
    top5.forEach((exp, i) => {
      const cat    = catById(exp.categoryId);
      const paidBy = exp.paidBy ?? exp.personIdx ?? 0;
      const person = state.persons[paidBy] || state.persons[0];
      const item   = document.createElement('div');
      item.className = 'top-item';
      item.innerHTML = `
        <div class="top-rank top-rank-${i+1}">${i+1}</div>
        <div style="font-size:20px">${cat.emoji}</div>
        <div class="top-info">
          <div class="top-name">${escHtml(exp.name)}</div>
          <div class="top-meta">${escHtml(person.name)} · ${fmtDate(exp.date)}</div>
        </div>
        <div class="top-amount">${fmt(exp.amount)}</div>`;
      topEl.appendChild(item);
    });
  }
}

function renderDonut(sorted, total) {
  const svg    = document.getElementById('donut-svg');
  const legend = document.getElementById('donut-legend');
  svg.innerHTML = legend.innerHTML = '';

  if (!total || sorted.length === 0) {
    svg.innerHTML = `<circle cx="80" cy="80" r="55" fill="none" stroke="#E5E5EA" stroke-width="20"/>`;
    return;
  }

  const cx = 80, cy = 80, r = 55, sw = 20;
  let offset = -Math.PI / 2;

  sorted.slice(0, 8).forEach(([catId, amt]) => {
    const cat   = catById(catId);
    const color = getCatColor(state.categories.findIndex(c => c.id === catId));
    const pct   = amt / total;
    const angle = pct * 2 * Math.PI;
    const x1 = cx + r * Math.cos(offset);
    const y1 = cy + r * Math.sin(offset);
    const x2 = cx + r * Math.cos(offset + angle);
    const y2 = cy + r * Math.sin(offset + angle);
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${angle > Math.PI ? 1 : 0},1 ${x2},${y2} Z`);
    path.setAttribute('fill', color);
    path.setAttribute('opacity', '0.9');
    svg.appendChild(path);
    offset += angle;

    const item = document.createElement('div');
    item.className = 'donut-legend-item';
    item.innerHTML = `<div class="donut-legend-dot" style="background:${color}"></div>
      <span class="donut-legend-name">${cat.emoji} ${cat.name}</span>
      <span class="donut-legend-pct">${Math.round(pct*100)}%</span>`;
    legend.appendChild(item);
  });

  const hole = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  hole.setAttribute('cx', cx); hole.setAttribute('cy', cy);
  hole.setAttribute('r', r - sw); hole.setAttribute('fill', 'white');
  svg.appendChild(hole);

  const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  txt.setAttribute('x', cx); txt.setAttribute('y', cy - 4);
  txt.setAttribute('text-anchor', 'middle'); txt.setAttribute('font-size', '10');
  txt.setAttribute('font-weight', '700'); txt.setAttribute('fill', '#1C1C1E');
  txt.setAttribute('font-family', 'Inter, sans-serif');
  txt.textContent = fmt(total);
  svg.appendChild(txt);

  const sub = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  sub.setAttribute('x', cx); sub.setAttribute('y', cy + 12);
  sub.setAttribute('text-anchor', 'middle'); sub.setAttribute('font-size', '8');
  sub.setAttribute('fill', '#636366'); sub.setAttribute('font-family', 'Inter, sans-serif');
  sub.textContent = 'celkem';
  svg.appendChild(sub);
}

// ===== SETTINGS =====
function renderSettings() {
  document.getElementById('settings-p1-name').value  = state.persons[0].name;
  document.getElementById('settings-p2-name').value  = state.persons[1].name;
  document.getElementById('settings-p1-color').value = state.persons[0].color;
  document.getElementById('settings-p2-color').value = state.persons[1].color;
  const codeEl = document.getElementById('household-code-display');
  if (codeEl) codeEl.textContent = householdId || '';
  updateSettingsAvatars();
  renderCategoriesList();
}

function updateSettingsAvatars() {
  const a1 = document.getElementById('settings-p1-avatar');
  const a2 = document.getElementById('settings-p2-avatar');
  a1.textContent = state.persons[0].name.charAt(0).toUpperCase();
  a1.style.background = state.persons[0].color;
  a2.textContent = state.persons[1].name.charAt(0).toUpperCase();
  a2.style.background = state.persons[1].color;
}

document.getElementById('settings-p1-name').addEventListener('input', () => {
  document.getElementById('settings-p1-avatar').textContent =
    document.getElementById('settings-p1-name').value.charAt(0).toUpperCase() || 'A';
});
document.getElementById('settings-p2-name').addEventListener('input', () => {
  document.getElementById('settings-p2-avatar').textContent =
    document.getElementById('settings-p2-name').value.charAt(0).toUpperCase() || 'B';
});
document.getElementById('settings-p1-color').addEventListener('input', e => {
  document.getElementById('settings-p1-avatar').style.background = e.target.value;
});
document.getElementById('settings-p2-color').addEventListener('input', e => {
  document.getElementById('settings-p2-avatar').style.background = e.target.value;
});

document.getElementById('save-persons-btn').addEventListener('click', async () => {
  const n1 = document.getElementById('settings-p1-name').value.trim();
  const n2 = document.getElementById('settings-p2-name').value.trim();
  if (!n1 || !n2) { showToast('Zadejte jména obou osob'); return; }
  state.persons[0].name  = n1; state.persons[1].name  = n2;
  state.persons[0].color = document.getElementById('settings-p1-color').value;
  state.persons[1].color = document.getElementById('settings-p2-color').value;
  document.documentElement.style.setProperty('--p1-color', state.persons[0].color);
  document.documentElement.style.setProperty('--p2-color', state.persons[1].color);
  await syncSettings();
  updateSidebarPersons();
  showToast('Profily uloženy');
});

function renderCategoriesList() {
  const el = document.getElementById('categories-list');
  el.innerHTML = '';
  state.categories.forEach(cat => {
    const item = document.createElement('div');
    item.className = 'category-item';
    item.innerHTML = `<span class="category-item-emoji">${cat.emoji}</span>
      <span class="category-item-name">${escHtml(cat.name)}</span>
      <button class="category-delete-btn" title="Smazat">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>`;
    item.querySelector('.category-delete-btn').addEventListener('click', () => {
      if (state.categories.length <= 1) { showToast('Nelze smazat poslední kategorii'); return; }
      openConfirm('Smazat kategorii?', `"${cat.name}" bude odstraněna.`, async () => {
        state.expenses.forEach(e => { if (e.categoryId === cat.id) e.categoryId = 'other'; });
        state.categories = state.categories.filter(c => c.id !== cat.id);
        await syncSettings();
        renderCategoriesList();
        showToast('Kategorie smazána');
      });
    });
    el.appendChild(item);
  });
}

document.getElementById('add-category-btn').addEventListener('click', async () => {
  const name  = document.getElementById('new-category-name').value.trim();
  const emoji = document.getElementById('new-category-emoji').value.trim() || '📦';
  if (!name) { document.getElementById('new-category-name').focus(); return; }
  const id = name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
  state.categories.push({ id, name, emoji });
  document.getElementById('new-category-name').value  = '';
  document.getElementById('new-category-emoji').value = '';
  await syncSettings();
  renderCategoriesList();
  showToast('Kategorie přidána');
});

document.getElementById('export-btn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'finance-export.json';
  a.click(); URL.revokeObjectURL(url);
  showToast('Data exportována');
});

document.getElementById('clear-data-btn').addEventListener('click', () => {
  openConfirm('Smazat všechna data?', 'Tato akce je nevratná. Všechny výdaje budou smazány.', async () => {
    const snap  = await householdRef().collection('expenses').get();
    const batch = db.batch();
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
    showToast('Všechna data smazána');
  });
});

document.getElementById('copy-code-btn')?.addEventListener('click', () => {
  navigator.clipboard.writeText(householdId || '').then(() => showToast('Kód zkopírován!'));
});

// ===== SIDEBAR PERSONS =====
function updateSidebarPersons() {
  document.getElementById('person1-sidebar-name').textContent = state.persons[0].name;
  document.getElementById('person2-sidebar-name').textContent = state.persons[1].name;
  document.getElementById('person1-avatar').textContent = state.persons[0].name.charAt(0).toUpperCase();
  document.getElementById('person2-avatar').textContent = state.persons[1].name.charAt(0).toUpperCase();
  document.getElementById('person1-avatar').style.background = state.persons[0].color;
  document.getElementById('person2-avatar').style.background = state.persons[1].color;
  document.documentElement.style.setProperty('--p1-color', state.persons[0].color);
  document.documentElement.style.setProperty('--p2-color', state.persons[1].color);
}

function renderAll() {
  renderDashboard();
  renderExpenses();
  renderAnalytics();
}

// ===== SETUP SCREEN =====
function generateCode() {
  const adj  = ['modra','zelena','slunecna','vesela','rychla','ticha','prima','fajn'];
  const noun = ['rodina','domov','hnizdo','parta','dvojka','banda','tymek','squad'];
  const a    = adj[Math.floor(Math.random() * adj.length)];
  const n    = noun[Math.floor(Math.random() * noun.length)];
  const num  = Math.floor(Math.random() * 9000) + 1000;
  return `${a}-${n}-${num}`;
}

document.getElementById('join-btn').addEventListener('click', () => {
  const raw   = document.getElementById('household-input').value.trim();
  const input = raw.toLowerCase().replace(/\s+/g, '-');
  if (!input || input.length < 3) {
    document.getElementById('household-input').focus();
    showToast('Zadejte kód (min. 3 znaky)');
    return;
  }
  householdId = input;
  localStorage.setItem('finance_household', householdId);
  document.getElementById('setup-screen').style.display = 'none';
  subscribeToHousehold();
});

document.getElementById('household-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('join-btn').click();
});

document.getElementById('generate-btn').addEventListener('click', () => {
  const code = generateCode();
  document.getElementById('household-input').value = code;
  document.getElementById('generated-display').textContent = 'Kód vygenerován – sdílejte ho s přítelkyní';
});

// ===== INIT =====
updateSidebarPersons();
renderAll();
renderSettings();

if (!householdId) {
  document.getElementById('setup-screen').style.display = 'flex';
} else {
  subscribeToHousehold();
}
