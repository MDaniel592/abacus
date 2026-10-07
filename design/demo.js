/* Standalone, synthetic-data prototype. No credentials or API connections. */
const app = document.getElementById('app');
const demoState = {
  screen: 'home',
  previous: 'home',
  month: 9,
  range: 1,
  editingPeriod: null,
  editingOriginalId: null,
  year: 2026,
  editingId: null,
  overrides: new Map(),
  extraEntries: new Map(),
  category: '',
  tag: '',
  account: '',
  type: '',
  search: '',
  theme: 'day',
  privateMode: false,
  categoryView: 'all',
  form: {
    type: 'withdrawal', amount: '', asset: 'Cuenta principal', counterpart: '', description: '', date: '2026-10-07', time: '', showTime: false, category: '', tag: '', budget: '', bill: '', notes: '', details: true,
  },
};
const money = (value) => (demoState.privateMode ? '••••' : new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value));
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]));
const transactions = [
  {
    name: 'Supermercado', amount: -24.5, category: 'Alimentación', tags: ['Casa'], account: 'Cuenta principal', day: 7,
  },
  {
    name: 'Nómina', amount: 1850, category: 'Trabajo', tags: ['Nómina'], account: 'Cuenta principal', day: 6,
  },
  {
    name: 'Café con amigos', amount: -6.8, category: 'Ocio', tags: ['Personal'], account: 'Efectivo', day: 6,
  },
  {
    name: 'Compra semanal', amount: -82, category: 'Alimentación', tags: ['Casa'], account: 'Cuenta principal', day: 5,
  },
  {
    name: 'Gasolina', amount: -45, category: 'Transporte', tags: ['Personal'], account: 'Cuenta principal', day: 4,
  },
  {
    name: 'Alquiler', amount: -450, category: 'Vivienda', tags: ['Casa'], account: 'Cuenta principal', day: 3,
  },
  {
    name: 'Suscripción', amount: -12, category: 'Ocio', tags: ['Personal', 'Suscripción'], account: 'Cuenta principal', day: 2,
  },
  {
    name: 'Pequeña compra', amount: -22, category: '', tags: [], account: 'Efectivo', day: 1,
  },
].map((entry, index) => ({ ...entry, id: String(index + 1), type: entry.amount > 0 ? 'deposit' : 'withdrawal' }));
function icon(name, size = 20) {
  const paths = {
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
    categories: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    movements: '<path d="M4 7h16m-4-4 4 4-4 4M20 17H4m4-4-4 4 4 4"/>',
    settings: '<path d="M4 7h16M4 17h16"/><rect x="7" y="4" width="4" height="6" rx="1.5" fill="var(--surface)"/><rect x="14" y="14" width="4" height="6" rx="1.5" fill="var(--surface)"/>',
    bank: '<path d="m3 8 9-5 9 5H3ZM5 10v8m5-8v8m4-8v8m5-8v8M3 21h18"/>',
    saving: '<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="12" cy="12" r="4"/><path d="M12 8v2m0 4v2m-4-4h2m4 0h2M20 8h1m-1 8h1"/>',
    wallet: '<path d="M20 7H5a2 2 0 0 1-2-2v14a2 2 0 0 0 2 2h15V7ZM3 5a2 2 0 0 1 2-2h13v4"/><path d="M20 11h-5a2 2 0 0 0 0 4h5"/><path d="M15 13h.01"/>',
    food: '<path d="M5 8h14l2 13H3L5 8ZM8 8V6a4 4 0 0 1 8 0v2"/><path d="M8 12h.01M16 12h.01"/>',
    car: '<path d="m5 6 2-3h10l2 3 2 5v7H3v-7l2-5ZM3 11h18M6 14h2m8 0h2M5 18v3m14-3v3M5 6h14"/>',
    coffee: '<path d="M4 8h13v7a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8ZM17 9h2a3 3 0 0 1 0 6h-2M3 22h16M7 2v3m5-3v3"/>',
    tag: '<path d="M3 3h8l10 10-8 8L3 11V3Z"/><circle cx="7.5" cy="7.5" r="1"/>',
    income: '<path d="M18 6 6 18M6 7v11h11"/>',
    expense: '<path d="M6 18 18 6M7 6h11v11"/>',
    moon: '<path d="M20.5 14.5A9 9 0 0 1 9.5 3.5a9 9 0 1 0 11 11Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
    left: '<path d="m15 5-7 7 7 7"/>',
    right: '<path d="m9 5 7 7-7 7"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    upRight: '<path d="M6 18 18 6M7 6h11v11"/>',
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[name] || paths.categories}</svg>`;
}
function periodKey() { return `${demoState.year}-${demoState.month}`; }
function monthTransactions() {
  return [...Array(demoState.range).keys()].map((offset) => {
    const month = demoState.month + offset;
    const key = `${demoState.year}-${month}`;
    const factor = Math.max(0.3, 1 + (month - 9) * 0.08 + (demoState.year - 2026) * 0.03);
    const examples = transactions.map((transaction) => ({ ...transaction, amount: Math.round(transaction.amount * factor * 100) / 100, ...demoState.overrides.get(`${key}:${transaction.id}`) })).filter((entry) => !entry.deleted);
    return [...examples, ...(demoState.extraEntries.get(key) || [])].map((entry) => ({
      ...entry, originalId: entry.id, originalPeriod: key, month, year: demoState.year, id: demoState.range === 1 ? entry.id : `${key}/${entry.id}`,
    }));
  }).flat().sort((left, right) => right.month - left.month || right.day - left.day);
}
function monthAccounts() {
  const difference = (demoState.month + demoState.range - 1 - 9 + (demoState.year - 2026) * 12) * 175;
  return [
    {
      name: 'Cuenta principal', balance: 2948.7 + difference, change: demoState.range * (1207.7 + difference / 5), icon: 'bank',
    },
    {
      name: 'Ahorro', balance: 2400 + difference, change: 150 * demoState.range, icon: 'saving',
    },
    {
      name: 'Efectivo', balance: 300, change: -28.8 * demoState.range, icon: 'wallet',
    },
  ];
}
function monthLabel() {
  if (demoState.range === 12) return String(demoState.year);
  if (demoState.range === 3) return `T${demoState.month / 3 + 1} ${demoState.year}`;
  if (demoState.range === 6) return `S${demoState.month / 6 + 1} ${demoState.year}`;
  return new Date(demoState.year, demoState.month, 1).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }).replace('.', '');
}
function header() {
  if (demoState.screen === 'form') return `<header class="app-header"><div class="compact-back"><button class="icon-button" data-action="back" aria-label="Volver">${icon('left', 20)}</button><div class="app-brand">${demoState.editingId ? 'Editar movimiento' : 'Nuevo movimiento'}</div></div>${demoState.editingId ? `<button class="icon-button" data-action="entry-actions" aria-label="Más acciones del movimiento">${icon('more', 19)}</button>` : ''}</header>`;
  return `<header class="app-header"><div class="app-brand">abacus<span style="color:var(--accent)">.</span></div><div class="month-picker"><button data-action="previous-month" aria-label="Periodo anterior">${icon('left', 15)}</button><button data-action="pick-month" aria-label="Elegir mes y año">${monthLabel()}</button><button data-action="next-month" aria-label="Periodo siguiente">${icon('right', 15)}</button></div></header>`;
}
function navigation() {
  return `<nav class="bottom-nav" aria-label="Navegación principal">${[
    ['home', 'home', 'Inicio'], ['categories', 'categories', 'Categorías'], ['form', 'plus', 'Añadir movimiento'], ['transactions', 'movements', 'Movimientos'], ['settings', 'settings', 'Ajustes'],
  ].map(([screen, iconName, label]) => (screen === 'form'
    ? `<button class="add-nav" data-screen="form" aria-label="Añadir movimiento"><span class="nav-icon" aria-hidden="true">${icon('plus', 25)}</span></button>`
    : `<button data-screen="${screen}" class="${demoState.screen === screen ? 'selected' : ''}" aria-current="${demoState.screen === screen ? 'page' : 'false'}"><span class="nav-icon" aria-hidden="true">${icon(iconName, 21)}</span>${label}</button>`)).join('')}</nav>`;
}
function home() {
  const entries = monthTransactions();
  const accounts = monthAccounts();
  const earned = entries.filter((entry) => entry.type === 'deposit').reduce((total, entry) => total + entry.amount, 0);
  const spent = entries.filter((entry) => entry.type === 'withdrawal').reduce((total, entry) => total - entry.amount, 0);
  return `<div class="screen"><div class="balance"><div class="muted">Saldo neto de tus cuentas</div><div class="balance-value">${money(accounts.reduce((total, account) => total + account.balance, 0))}</div><div class="balance-sub">Al cierre del periodo seleccionado</div></div><div class="two"><div class="metric"><div class="metric-label"><span class="dot"></span>Ingresos</div><div class="metric-value">${money(earned)}</div></div><div class="metric"><div class="metric-label"><span class="dot expense"></span>Gastos</div><div class="metric-value">${money(spent)}</div></div></div><div class="section-title"><h4>Tus cuentas</h4><span class="muted">${monthLabel()}</span></div><div class="account-list">${accounts.map((account) => `<button class="account" data-account="${escapeHtml(account.name)}"><div class="row"><div class="account-logo">${icon(account.icon, 20)}</div><div><div class="account-title">${account.name}</div><div class="tx-meta">EUR</div></div></div><div class="account-right"><div class="account-amount">${money(account.balance)}</div><div class="account-change">${account.change > 0 ? '+' : ''}${money(account.change)} en el periodo</div></div></button>`).join('')}</div><div class="section-title"><h4>Gastos por categoría</h4><button class="text-button" data-screen="categories">Ver todas ↗</button></div>${categoryList(true)}</div>`;
}
function groupedCategories() {
  const groups = new Map();
  monthTransactions().filter((entry) => entry.type === 'withdrawal').forEach((entry) => {
    const name = entry.category || 'Sin categoría';
    groups.set(name, (groups.get(name) || 0) - entry.amount);
  });
  return [...groups].sort((a, b) => b[1] - a[1]);
}
function categoryList(compact = false) {
  const rows = compact ? groupedCategories().slice(0, 3) : groupedCategories();
  return `<div class="category-list">${rows.map(([name, amount]) => `<button class="category-row" data-category="${escapeHtml(name)}"><div class="row"><div class="account-logo">${icon(({
    Vivienda: 'home', Alimentación: 'food', Transporte: 'car', Ocio: 'coffee',
  })[name] || 'categories', 19)}</div><div class="account-title">${name}</div></div><div class="account-amount">${money(amount)} <span class="muted">${icon('right', 13)}</span></div></button>`).join('')}</div>`;
}
function categories() {
  const groups = new Map();
  monthTransactions().filter((entry) => entry.type !== 'transfer').forEach((entry) => {
    const name = entry.category || 'Sin categoría';
    if (!groups.has(name)) groups.set(name, { income: 0, expense: 0 });
    const group = groups.get(name);
    if (entry.type === 'deposit') group.income += entry.amount;
    else group.expense += Math.abs(entry.amount);
  });
  const rows = [...groups].sort((a, b) => b[1].expense - a[1].expense);
  const totalIncome = rows.reduce((sum, [, group]) => sum + group.income, 0);
  const totalExpense = rows.reduce((sum, [, group]) => sum + group.expense, 0);
  const scale = Math.max(...rows.flatMap(([, group]) => [group.income, group.expense]), 1);
  function slider(name, group, total = false) {
    const difference = group.income - group.expense;
    const barScale = total ? Math.max(totalIncome, totalExpense, 1) : scale;
    const incomeWidth = Math.min(100, (group.income / barScale) * 100);
    const expenseWidth = Math.min(100, (group.expense / barScale) * 100);
    const head = `<div class="slider-heading"><span class="slider-name">${escapeHtml(name)}</span><span class="slider-difference ${difference > 0 ? 'ledger-income' : difference < 0 ? 'ledger-expense' : ''}">${difference > 0 ? '+' : ''}${money(difference)}</span></div>`;
    const details = `<div class="slider-values"><span class="ledger-expense">${group.expense ? '−' : ''}${money(group.expense)}</span><span class="ledger-income">${group.income ? '+' : ''}${money(group.income)}</span></div><div class="category-slider" aria-label="Gastos ${money(group.expense)}, ingresos ${money(group.income)}, diferencia ${money(difference)}"><div class="expense-lane"><span class="expense-fill" style="width:${expenseWidth}%"></span></div><div class="income-lane"><span class="income-fill" style="width:${incomeWidth}%"></span></div></div>`;
    return total ? `<div class="slider-row total-slider" data-category-total>${head}${details}</div>` : `<button class="slider-row" data-category="${escapeHtml(name)}" data-category-scope="all">${head}${details}</button>`;
  }
  return `<div class="screen"><h3 class="view-title">Categorías</h3>${slider('Balance total', { income: totalIncome, expense: totalExpense }, true)}<div class="category-sliders">${rows.map(([name, group]) => slider(name, group)).join('')}</div></div>`;
}
function selectFilter(label, key, values) {
  return `<select data-filter="${key}" aria-label="Filtrar por ${label.toLowerCase()}"><option value="">${label}: todas</option>${values.map((value) => `<option value="${escapeHtml(value)}" ${demoState[key] === value ? 'selected' : ''}>${escapeHtml(value)}</option>`).join('')}</select>`;
}
function movementList() {
  const items = monthTransactions().filter((entry) => (!demoState.category || (entry.category || 'Sin categoría') === demoState.category)
    && (!demoState.tag || entry.tags.includes(demoState.tag))
    && (!demoState.account || entry.account === demoState.account)
    && (!demoState.type || entry.type === demoState.type)
    && entry.name.toLocaleLowerCase().includes(demoState.search.toLocaleLowerCase()));
  return { items, html: items.length ? `<div class="list">${items.map((entry) => `<button class="transaction transaction-button" data-entry="${escapeHtml(entry.id)}" aria-label="Editar ${escapeHtml(entry.name)}"><div class="row"><div class="tx-icon">${icon(entry.type === 'transfer' ? 'movements' : entry.amount > 0 ? 'income' : 'expense', 19)}</div><div><div class="tx-title">${entry.name}</div><div class="tx-meta">${entry.day} ${new Date(entry.year, entry.month, 1).toLocaleDateString('es-ES', { month: 'short' }).replace('.', '')} · ${entry.category || 'Sin categoría'} · ${entry.account}</div>${entry.tags.length ? `<span class="tx-tags">${entry.tags.map((tag) => `#${tag}`).join(' · ')}</span>` : ''}</div></div><span class="tx-value" data-movement-type="${entry.type}">${entry.type === 'transfer' ? '' : entry.amount > 0 ? '+' : '−'}${money(Math.abs(entry.amount))}</span></button>`).join('')}</div>` : '<div class="empty-state">No hay movimientos con estos filtros.<br>Prueba a quitar una categoría o etiqueta.</div>' };
}
function movements() {
  const all = monthTransactions();
  const list = movementList();
  return `<div class="screen"><h3 class="view-title">Movimientos</h3><div class="view-subtitle">Filtra sin escribir consultas.</div><div class="filter-row">${selectFilter('Categoría', 'category', [...new Set(all.filter((entry) => entry.type === 'withdrawal').map((entry) => entry.category || 'Sin categoría'))])}${selectFilter('Etiqueta', 'tag', [...new Set(all.flatMap((entry) => entry.tags))])}${selectFilter('Cuenta', 'account', monthAccounts().map((account) => account.name))}<select data-filter="type" aria-label="Tipo de movimiento"><option value="">Todos los tipos</option><option value="withdrawal" ${demoState.type === 'withdrawal' ? 'selected' : ''}>Gastos</option><option value="deposit" ${demoState.type === 'deposit' ? 'selected' : ''}>Ingresos</option></select><button class="filter-reset" data-action="reset-filters">Limpiar</button></div><input class="search-field" data-search placeholder="Buscar un movimiento…" aria-label="Buscar movimientos" value="${escapeHtml(demoState.search)}"><div class="filter-count" id="result-count">${list.items.length} movimientos · ${monthLabel()}</div><div id="movement-list">${list.html}</div></div>`;
}
function formField(label, key, value, type = 'text', placeholder = '') {
  const entries = monthTransactions();
  const values = {
    description: entries.map((entry) => entry.name),
    asset: monthAccounts().map((account) => account.name),
    counterpart: [...monthAccounts().map((account) => account.name), ...entries.map((entry) => entry.counterpart || entry.name)],
    category: entries.map((entry) => entry.category).filter(Boolean),
    budget: ['Casa', 'Personal', 'Transporte'],
    bill: ['Alquiler', 'Electricidad', 'Internet', 'Suscripción'],
    tag: entries.flatMap((entry) => entry.tags),
  };
  const suggestions = values[key];
  return `<div class="field"><label>${label}<input data-form="${key}" type="${type}" ${suggestions ? `data-suggestions="${key}" autocomplete="off"` : ''} value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder)}"></label>${suggestions ? `<div class="suggestion-options" id="suggest-${key}" hidden data-values="${escapeHtml(JSON.stringify([...new Set(suggestions)]))}"></div>` : ''}</div>`;
}
function form() {
  const data = demoState.form;
  const income = data.type === 'deposit';
  const transfer = data.type === 'transfer';
  const label = income ? 'ingreso' : transfer ? 'traspaso' : 'gasto';
  return `<div class="screen"><div class="type-switch">${[['withdrawal', 'Gasto'], ['deposit', 'Ingreso'], ['transfer', 'Traspaso']].map(([type, name]) => `<button data-form-type="${type}" ${demoState.editingId && type !== data.type ? 'disabled' : ''} class="${data.type === type ? 'selected' : ''}" aria-pressed="${data.type === type}">${name}</button>`).join('')}</div><div class="amount-block"><div class="amount-label">Importe del ${label}</div><div class="amount-input" data-amount-type="${data.type}"><input data-form="amount" inputmode="decimal" value="${escapeHtml(data.amount)}" placeholder="0,00" aria-label="Importe"><span>€</span></div><small>EUR · Euro</small></div><div class="entry-date-row"><button data-action="pick-date" aria-label="Fecha del movimiento">${escapeHtml(readableDate(data.date))}</button><input class="picker-input" data-form="date" type="date" tabindex="-1" value="${escapeHtml(data.date)}">${data.showTime ? `<button data-action="pick-time" aria-label="Hora del movimiento">${escapeHtml(data.time || '12:00')}</button>` : '<button data-action="add-time" aria-label="Añadir hora">Hora</button>'}<input class="picker-input" data-form="time" type="time" tabindex="-1" value="${escapeHtml(data.time || '12:00')}"></div><div class="form-group">${formField('Descripción', 'description', data.description, 'text', '¿Qué movimiento es?')}${formField(income ? 'Ingreso en' : transfer ? 'Desde' : 'Pagar desde', 'asset', data.asset)}${transfer ? formField('Cuenta de destino', 'counterpart', data.counterpart, 'text', 'Otra cuenta') : ''}<div class="details">${formField('Categoría', 'category', data.category, 'text', 'Sin categoría')}<div class="field-pair">${formField('Presupuesto', 'budget', data.budget || '', 'text', 'Sin presupuesto')}${formField('Factura', 'bill', data.bill || '', 'text', 'Sin factura')}</div>${formField('Etiqueta', 'tag', data.tag, 'text', 'Ej. Casa')}${formField('Notas', 'notes', data.notes)}</div></div></div><div class="form-footer"><button class="primary" data-action="save">${demoState.editingId ? 'Guardar cambios' : `Guardar ${label}`} ${icon('upRight', 17)}</button></div>`;
}
function settings() {
  return `<div class="screen"><h3 class="view-title">A tu gusto</h3><div class="view-subtitle">Perspectiva, sin gráficos y con tus cuentas siempre a mano.</div><div class="demo-settings"><div class="settings-row"><span>Apariencia</span><button data-action="theme">${demoState.theme === 'day' ? 'Cambiar a oscuro' : 'Cambiar a claro'}</button></div><div class="settings-row"><span>Modo privado</span><button data-action="privacy" aria-pressed="${demoState.privateMode}">${demoState.privateMode ? 'Activado' : 'Desactivado'}</button></div></div></div>`;
}
function render() {
  document.body.classList.toggle('theme-night', demoState.theme === 'night');
  app.classList.toggle('demo-form', demoState.screen === 'form');
  app.classList.toggle('private-mode', demoState.privateMode);
  app.innerHTML = `${header()}${({
    home, categories, transactions: movements, form, settings,
  })[demoState.screen]()}${demoState.screen === 'form' ? '' : navigation()}`;
}
function goTo(screen) {
  if (screen === 'form' && demoState.screen !== 'form') {
    demoState.previous = demoState.screen;
    demoState.editingId = null;
    demoState.form.date = `${demoState.year}-${String(demoState.month + 1).padStart(2, '0')}-07`;
  }
  demoState.screen = screen;
  render();
}
function openEntry(id) {
  const entry = monthTransactions().find((item) => item.id === id);
  if (!entry) return;
  demoState.previous = 'transactions';
  demoState.editingId = id;
  demoState.editingPeriod = entry.originalPeriod;
  demoState.editingOriginalId = entry.originalId;
  demoState.form = {
    type: entry.type,
    amount: String(Math.abs(entry.amount)).replace('.', ','),
    asset: entry.account,
    budget: entry.budget || '',
    bill: entry.bill || '',
    counterpart: entry.counterpart || (entry.amount < 0 ? entry.name : 'Empresa'),
    description: entry.name,
    date: `${entry.year}-${String(entry.month + 1).padStart(2, '0')}-${String(entry.day).padStart(2, '0')}`,
    category: entry.category,
    tag: entry.tags.join(', '),
    notes: entry.notes || '',
    time: entry.time || '',
    showTime: Boolean(entry.time),
    details: true,
  };
  demoState.screen = 'form';
  render();
}
function showMessage(title, message) {
  const dialog = document.getElementById('confirmation');
  dialog.querySelector('h3').textContent = title;
  dialog.querySelector('p').textContent = message;
  dialog.showModal();
}
const shortMonths = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
function readableDate(value) {
  const parts = value.split('-').map(Number);
  return parts.length === 3 && parts.every(Number.isFinite) ? `${parts[2]} ${shortMonths[parts[1] - 1]} ${parts[0]}` : value;
}
function parseDate(value) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const match = value.trim().toLowerCase().match(/^(\d{1,2})[ /-]+([a-záé]+|\d{1,2})[ /-]+(\d{4})$/);
  if (!match) return '';
  const month = /^\d+$/.test(match[2]) ? Number(match[2]) : shortMonths.indexOf(match[2].slice(0, 3)) + 1;
  return `${match[3]}-${String(month).padStart(2, '0')}-${match[1].padStart(2, '0')}`;
}
function saveEntry() {
  const data = demoState.form;
  const amount = Number(data.amount.trim().replace(',', '.'));
  if (!Number.isFinite(amount) || amount <= 0 || !data.description.trim()) {
    showMessage('Revisa el movimiento', 'Añade una descripción y un importe mayor que cero.');
    return;
  }
  const dateParts = parseDate(data.date).split('-').map(Number);
  if (dateParts.length !== 3 || !dateParts.every(Number.isFinite) || dateParts[1] < 1 || dateParts[1] > 12 || dateParts[2] < 1 || dateParts[2] > 31 || new Date(dateParts[0], dateParts[1] - 1, dateParts[2]).getDate() !== dateParts[2]) {
    showMessage('Revisa la fecha', 'Selecciona una fecha válida para el movimiento.');
    return;
  }
  if (data.showTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(data.time || '')) {
    showMessage('Revisa la hora', 'Introduce una hora válida (HH:mm).');
    return;
  }
  const id = (demoState.editingId ? demoState.editingOriginalId : null) || `demo-${Date.now()}`;
  const entry = {
    id,
    name: data.description.trim(),
    budget: data.budget || '',
    bill: data.bill || '',
    amount: data.type === 'withdrawal' ? -amount : amount,
    type: data.type,
    account: data.asset,
    counterpart: data.counterpart,
    category: data.category,
    tags: data.tag.split(',').map((tag) => tag.trim()).filter(Boolean),
    notes: data.notes,
    day: dateParts[2],
    time: data.showTime ? data.time || '12:00' : '',
  };
  const originalPeriod = demoState.editingId ? demoState.editingPeriod : periodKey();
  const targetPeriod = `${dateParts[0]}-${dateParts[1] - 1}`;
  const editing = Boolean(demoState.editingId);
  if (editing) {
    const extra = demoState.extraEntries.get(originalPeriod) || [];
    if (id.startsWith('demo-')) demoState.extraEntries.set(originalPeriod, extra.filter((item) => item.id !== id));
    else demoState.overrides.set(`${originalPeriod}:${id}`, targetPeriod === originalPeriod ? entry : { deleted: true });
  }
  if (editing && targetPeriod !== originalPeriod) entry.id = `demo-moved-${Date.now()}`;
  if (!editing || id.startsWith('demo-') || targetPeriod !== originalPeriod) {
    demoState.extraEntries.set(targetPeriod, [...(demoState.extraEntries.get(targetPeriod) || []).filter((item) => item.id !== id), entry]);
  }
  if (editing) {
    demoState.screen = 'transactions';
    demoState.month = Math.floor((dateParts[1] - 1) / demoState.range) * demoState.range;
    [demoState.year] = dateParts;
  } else {
    demoState.form.amount = '';
    demoState.form.description = '';
  }
  render();
  showMessage(editing ? 'Cambios guardados en la demo' : 'Movimiento añadido en la demo', 'Puedes comprobarlo en Movimientos. Son datos locales de ejemplo; no se envían a Firefly III.');
}
function showSuggestions(input) {
  if (!input.dataset.suggestions) return;
  const options = document.getElementById(`suggest-${input.dataset.suggestions}`);
  const values = JSON.parse(options.dataset.values).filter((value) => value.toLocaleLowerCase().includes(input.value.toLocaleLowerCase()));
  options.innerHTML = values.slice(0, 6).map((value) => `<button type="button" data-suggestion-field="${input.dataset.form}" data-suggestion-value="${escapeHtml(value)}">${escapeHtml(value)}</button>`).join('');
  options.hidden = !values.length;
}
document.addEventListener('focusin', (event) => showSuggestions(event.target));
document.addEventListener('focusout', (event) => {
  if (event.target.dataset.suggestions && !event.relatedTarget?.hasAttribute('data-suggestion-field')) document.getElementById(`suggest-${event.target.dataset.suggestions}`).hidden = true;
});
let pickerYear = demoState.year;
let pickerRange = demoState.range;
function renderMonthPicker() {
  const slots = [...Array(12 / pickerRange).keys()].map((index) => index * pickerRange);
  document.getElementById('month-options').innerHTML = `<div class="year-picker"><button data-action="previous-year" aria-label="Año anterior">${icon('left', 18)}</button><input aria-label="Año" data-picker-year type="number" min="1" max="9999" value="${pickerYear}"><button data-action="next-year" aria-label="Año siguiente">${icon('right', 18)}</button></div><div class="period-types">${[[1, 'Mes'], [3, 'Trimestre'], [6, 'Semestre'], [12, 'Año']].map(([size, name]) => `<button data-picker-range="${size}" class="${pickerRange === size ? 'selected' : ''}">${name}</button>`).join('')}</div><div class="month-grid" data-period-size="${pickerRange}">${slots.map((month) => `<button data-select-month="${month}" class="${month === demoState.month && pickerYear === demoState.year && pickerRange === demoState.range ? 'selected' : ''}">${pickerRange === 12 ? pickerYear : pickerRange === 3 ? `T${month / 3 + 1} · ${shortMonths[month]}–${shortMonths[month + 2]}` : pickerRange === 6 ? `S${month / 6 + 1} · ${shortMonths[month]}–${shortMonths[month + 5]}` : shortMonths[month]}</button>`).join('')}</div><button data-action="cancel-month">Cancelar</button>`;
}
document.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.id === 'close-dialog') { document.getElementById('confirmation').close(); return; }
  if (button.dataset.suggestionField) {
    const field = button.dataset.suggestionField;
    demoState.form[field] = button.dataset.suggestionValue;
    document.querySelector(`[data-form="${field}"]`).value = button.dataset.suggestionValue;
    document.getElementById(`suggest-${field}`).hidden = true;
    return;
  }
  if (button.hasAttribute('data-picker-range')) { pickerRange = Number(button.dataset.pickerRange); renderMonthPicker(); return; }
  if (button.hasAttribute('data-select-month')) { demoState.range = pickerRange; demoState.month = Number(button.dataset.selectMonth); demoState.year = pickerYear; document.getElementById('month-dialog').close(); render(); return; }
  if (button.dataset.entry) { openEntry(button.dataset.entry); return; }
  if (button.dataset.screen) { goTo(button.dataset.screen); return; }
  if (button.dataset.categoryView) { demoState.categoryView = button.dataset.categoryView; render(); return; }
  if (button.dataset.category) { demoState.category = button.dataset.category; demoState.type = button.dataset.categoryScope === 'all' ? '' : 'withdrawal'; demoState.tag = ''; demoState.account = ''; demoState.search = ''; goTo('transactions'); return; }
  if (button.dataset.account) { demoState.account = button.dataset.account; demoState.category = ''; demoState.tag = ''; demoState.type = ''; demoState.search = ''; goTo('transactions'); return; }
  if (button.dataset.formType) { if (demoState.form.type !== button.dataset.formType) { demoState.form.type = button.dataset.formType; demoState.form.counterpart = ''; demoState.form.budget = ''; demoState.form.bill = ''; render(); } return; }
  switch (button.dataset.action) {
    case 'privacy': demoState.privateMode = !demoState.privateMode; render(); break;
    case 'theme': demoState.theme = demoState.theme === 'day' ? 'night' : 'day'; render(); break;
    case 'previous-month': case 'next-month': { const month = new Date(demoState.year, demoState.month + (button.dataset.action === 'next-month' ? demoState.range : -demoState.range), 1); demoState.year = month.getFullYear(); demoState.month = month.getMonth(); render(); break; }
    case 'back': goTo(demoState.previous); break;
    case 'save': saveEntry(); break;
    case 'add-time': demoState.form.showTime = true; demoState.form.time = demoState.form.time || '12:00'; render(); document.querySelector('[data-form="time"]').showPicker(); break;
    case 'pick-month': pickerYear = demoState.year; pickerRange = demoState.range; renderMonthPicker(); document.getElementById('month-dialog').showModal(); break;
    case 'previous-year': pickerYear = Math.max(1, pickerYear - 1); renderMonthPicker(); break;
    case 'next-year': pickerYear = Math.min(9999, pickerYear + 1); renderMonthPicker(); break;
    case 'cancel-month': document.getElementById('month-dialog').close(); break;
    case 'pick-date': document.querySelector('[data-form="date"]').showPicker(); break;
    case 'pick-time': document.querySelector('[data-form="time"]').showPicker(); break;
    case 'entry-actions': document.getElementById('entry-actions').showModal(); break;
    case 'cancel-actions': document.getElementById('entry-actions').close(); break;
    case 'duplicate-entry': document.getElementById('entry-actions').close(); demoState.editingId = null; demoState.form.date = `${demoState.year}-${String(demoState.month + 1).padStart(2, '0')}-07`; render(); break;
    case 'delete-entry': {
      document.getElementById('entry-actions').close();
      document.getElementById('delete-confirmation').showModal();
      break;
    }
    case 'cancel-delete': document.getElementById('delete-confirmation').close(); break;
    case 'confirm-delete': {
      const id = demoState.editingOriginalId;
      const key = demoState.editingPeriod;
      if (id.startsWith('demo-')) demoState.extraEntries.set(key, (demoState.extraEntries.get(key) || []).filter((entry) => entry.id !== id));
      else demoState.overrides.set(`${key}:${id}`, { deleted: true });
      document.getElementById('delete-confirmation').close();
      demoState.editingId = null;
      demoState.screen = 'transactions';
      render();
      break;
    }
    case 'reset-filters': demoState.category = ''; demoState.tag = ''; demoState.account = ''; demoState.type = ''; demoState.search = ''; render(); break;
    case 'reset-demo': demoState.overrides.clear(); demoState.extraEntries.clear(); demoState.month = 9; demoState.year = 2026; demoState.category = ''; demoState.tag = ''; demoState.account = ''; demoState.type = ''; demoState.search = ''; goTo('home'); break;
    default: break;
  }
});
document.addEventListener('change', (event) => {
  if (event.target.hasAttribute('data-picker-year')) { pickerYear = Math.min(9999, Math.max(1, Number(event.target.value) || demoState.year)); renderMonthPicker(); }
  if (event.target.dataset.filter) { demoState[event.target.dataset.filter] = event.target.value; render(); }
  if (event.target.dataset.form) { demoState.form[event.target.dataset.form] = event.target.value; if (['date', 'time'].includes(event.target.dataset.form)) render(); }
});
document.addEventListener('input', (event) => {
  showSuggestions(event.target);
  if (event.target.dataset.form) demoState.form[event.target.dataset.form] = event.target.value;
  if (event.target.hasAttribute('data-search')) { demoState.search = event.target.value; const list = movementList(); document.getElementById('movement-list').innerHTML = list.html; document.getElementById('result-count').textContent = `${list.items.length} movimientos · ${monthLabel()}`; }
});
render();
