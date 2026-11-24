const CONFIG = {
  deepLinkBase: 'deblopers://',
  qrApiBase: 'https://api.qrserver.com/v1/create-qr-code/',
  tablesApiUrl: 'https://qaudgvxidpevlebivjdd.supabase.co/functions/v1/public-table-qr-codes',
  // Publishable Supabase key: safe to use in a public, read-only frontend.
  supabasePublishableKey: 'sb_publishable_sqsgXju7bObWWUCng5oQrg_YXL09KA6',
  qrSize: '260x260',
};

const TIPS = [
  { label: 'Malo', percent: 0 },
  { label: 'Regular', percent: 5 },
  { label: 'Bueno', percent: 10 },
  { label: 'Muy bueno', percent: 15 },
  { label: 'Excelente', percent: 20 },
];

const tableState = {
  tables: [],
  hasSuccessfulLoad: false,
  updatedAt: null,
  lastAttemptAt: null,
  pendingRequest: null,
  isLoading: false,
  loadFailed: false,
};

function deepLink(path) {
  return `${CONFIG.deepLinkBase}${path}`;
}

function qrUrl(value) {
  return `${CONFIG.qrApiBase}?size=${CONFIG.qrSize}&data=${encodeURIComponent(value)}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function qrImageMarkup({ value, alt }) {
  return `
    <div class="qr-img-wrap">
      <img class="qr-image" src="${qrUrl(value)}" alt="${escapeHtml(alt)}" loading="lazy" width="260" height="260" />
    </div>
  `;
}

function codePill(value) {
  return `<div class="code-pill"><span>${escapeHtml(value)}</span></div>`;
}

function qrCardMarkup({ title, description = '', value, alt }) {
  return `
    <article class="qr-card">
      <div class="qr-card__heading">
        <h2 class="qr-card__title">${escapeHtml(title)}</h2>
        ${description ? `<p class="qr-card__meta">${escapeHtml(description)}</p>` : ''}
      </div>
      ${qrImageMarkup({ value, alt })}
      ${codePill(value)}
      <a class="btn btn--small" href="${value}">Probar QR</a>
    </article>
  `;
}

function initTheme() {
  const savedTheme = localStorage.getItem('deblopers-theme') || 'dark';
  setTheme(savedTheme);

  document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      setTheme(current === 'light' ? 'dark' : 'light');
    });
  });
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('deblopers-theme', theme);

  const isLight = theme === 'light';
  document.querySelectorAll('[data-theme-icon]').forEach((el) => {
    el.textContent = isLight ? '🌙' : '☀️';
  });
  document.querySelectorAll('[data-theme-label]').forEach((el) => {
    el.textContent = isLight ? 'Oscuro' : 'Claro';
  });
}

function renderHome() {
  const summary = document.getElementById('deepLinksSummary');
  if (summary) {
    const groups = [
      {
        section: 'Ingreso',
        rows: [{ label: 'Entrada al restaurante', value: deepLink('entrance') }],
      },
      {
        section: 'Mesas',
        rows: tableState.hasSuccessfulLoad && tableState.tables.length
          ? tableState.tables.map((table) => ({ label: `Mesa ${table.number}`, value: deepLink(`table/${table.id}`) }))
          : [{ label: 'Mesas', value: tableState.loadFailed ? 'No disponibles' : 'Todavía no hay mesas registradas.' }],
      },
      {
        section: 'Propinas',
        rows: TIPS.map((tip) => ({ label: `Propina ${tip.percent}% · ${tip.label}`, value: deepLink(`tip/${tip.percent}`) })),
      },
    ];
    summary.innerHTML = groups.map((group) => `
      <tr class="report-section-row"><th colspan="2" scope="colgroup">${escapeHtml(group.section)}</th></tr>
      ${group.rows.map((row) => `
        <tr class="report-data-row"><th scope="row">${escapeHtml(row.label)}</th><td class="report-link">${escapeHtml(row.value)}</td></tr>
      `).join('')}
    `).join('');
  }

  const count = document.getElementById('tableCountReport');
  const qrCount = document.getElementById('qrCountReport');
  if (count) count.textContent = tableState.hasSuccessfulLoad ? String(tableState.tables.length) : '—';
  if (qrCount) qrCount.textContent = tableState.hasSuccessfulLoad ? String(1 + tableState.tables.length + TIPS.length) : '—';
  updateApiReport();
}

function updateApiReport() {
  const status = document.getElementById('apiReportStatus');
  const updated = document.getElementById('updatedAtReport');
  const attempted = document.getElementById('lastAttemptReport');
  if (status) {
    const label = tableState.isLoading
      ? (tableState.hasSuccessfulLoad ? 'Actualizando…' : 'Consultando…')
      : tableState.hasSuccessfulLoad
      ? (tableState.loadFailed ? 'Fallida; datos previos conservados' : 'Correcta')
      : (tableState.loadFailed ? 'Fallida' : 'Consultando…');
    const state = tableState.isLoading ? 'loading' : (tableState.hasSuccessfulLoad && !tableState.loadFailed ? 'success' : (tableState.loadFailed ? 'error' : 'loading'));
    status.innerHTML = `<span class="status-badge" data-state="${state}">${escapeHtml(label)}</span>`;
  }
  if (updated) updated.textContent = tableState.updatedAt ? formatUpdatedAt(tableState.updatedAt) : '—';
  if (attempted) attempted.textContent = tableState.lastAttemptAt ? formatUpdatedAt(tableState.lastAttemptAt) : 'En curso…';
}

function renderEntrance() {
  const container = document.getElementById('entranceQr');
  if (!container) return;
  const value = deepLink('entrance');
  container.innerHTML = qrCardMarkup({ title: 'Entrada', description: 'Ingreso al local', value, alt: 'QR de ingreso al local' });
}

function renderTables() {
  const grid = document.getElementById('tablesGrid');
  if (!grid) return;

  if (!tableState.hasSuccessfulLoad) {
    grid.innerHTML = `<p class="empty-state">${tableState.loadFailed ? 'No se pudieron cargar las mesas. Revisá el estado y volvé a intentar.' : 'Cargando códigos de mesas…'}</p>`;
    return;
  }

  if (tableState.tables.length === 0) {
    grid.innerHTML = '<p class="empty-state">Todavía no hay mesas registradas.</p>';
    return;
  }

  grid.innerHTML = tableState.tables.map((table) => {
    const value = deepLink(`table/${table.id}`);
    return qrCardMarkup({ title: `Mesa ${table.number}`, description: `Identificador ${table.id}`, value, alt: `QR Mesa ${table.number}` });
  }).join('');
}

function renderTips() {
  const grid = document.getElementById('tipsGrid');
  if (!grid) return;

  grid.innerHTML = TIPS.map((tip) => {
    const value = deepLink(`tip/${tip.percent}`);
    return qrCardMarkup({ title: `Propina ${tip.percent}%`, description: tip.label, value, alt: `QR Propina ${tip.percent}%` });
  }).join('');
}

function validateTablesResponse(payload) {
  if (!payload || !Array.isArray(payload.tables)) {
    throw new Error('La respuesta de la API no contiene una lista válida de mesas.');
  }

  const ids = new Set();
  const numbers = new Set();
  return payload.tables.map((table) => {
    if (!table || !Number.isSafeInteger(table.id) || !Number.isSafeInteger(table.number)) {
      throw new Error('La API devolvió una mesa con identificador o número inválido.');
    }
    if (ids.has(table.id) || numbers.has(table.number)) {
      throw new Error('La API devolvió identificadores o números de mesa duplicados.');
    }
    ids.add(table.id);
    numbers.add(table.number);
    return { id: table.id, number: table.number };
  });
}

function formatUpdatedAt(date) {
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' }).format(date);
}

function updateTableStatus(message, state = 'info') {
  const status = document.getElementById('tablesStatus');
  if (status) {
    status.textContent = message;
    status.dataset.state = state;
  }
  updateApiReport();
}

function updateRefreshControls(isLoading) {
  const button = document.getElementById('refreshTables');
  if (button) {
    button.disabled = isLoading;
    button.setAttribute('aria-busy', String(isLoading));
  }
  const indicator = document.getElementById('tablesLoading');
  if (indicator) indicator.hidden = !isLoading;
}

async function loadTables() {
  if (tableState.pendingRequest) return tableState.pendingRequest;

  updateRefreshControls(true);
  tableState.isLoading = true;
  tableState.lastAttemptAt = new Date();
  tableState.loadFailed = false;
  updateTableStatus(tableState.hasSuccessfulLoad ? 'Actualizando las mesas…' : 'Cargando las mesas…', 'loading');

  tableState.pendingRequest = (async () => {
    try {
      const response = await fetch(CONFIG.tablesApiUrl, {
        method: 'GET',
        headers: { apikey: CONFIG.supabasePublishableKey },
        cache: 'no-store',
      });
      if (!response.ok) throw new Error(`La API respondió con el estado ${response.status}.`);

      tableState.tables = validateTablesResponse(await response.json());
      tableState.hasSuccessfulLoad = true;
      tableState.loadFailed = false;
      tableState.updatedAt = new Date();
      renderTables();
      renderHome();
      const updateLabel = `Última actualización exitosa: ${formatUpdatedAt(tableState.updatedAt)}.`;
      updateTableStatus(tableState.tables.length ? updateLabel : `Todavía no hay mesas registradas. ${updateLabel}`, 'success');
    } catch (error) {
      tableState.loadFailed = true;
      const detail = error instanceof TypeError
        ? 'No se pudo conectar con el servicio. Revisá la conexión e intentá actualizar de nuevo.'
        : error.message || 'Ocurrió un error al cargar las mesas.';
      const warning = tableState.hasSuccessfulLoad
        ? `No se pudieron actualizar las mesas. Se conservan los últimos datos válidos; podrían estar desactualizados. ${detail}`
        : `No se pudieron cargar las mesas. ${detail}`;
      updateTableStatus(warning, 'error');
      renderTables();
      renderHome();
    } finally {
      tableState.isLoading = false;
      tableState.pendingRequest = null;
      updateRefreshControls(false);
      updateApiReport();
    }
  })();

  return tableState.pendingRequest;
}

function initPage() {
  initTheme();
  const page = document.body.dataset.page;
  if (page === 'home') {
    renderHome();
    loadTables();
  }
  if (page === 'entrance') renderEntrance();
  if (page === 'tables') {
    renderTables();
    document.getElementById('refreshTables')?.addEventListener('click', loadTables);
    loadTables();
  }
  if (page === 'tips') renderTips();
}

document.addEventListener('DOMContentLoaded', initPage);
