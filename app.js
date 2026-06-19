const CONFIG = {
  appName: 'Deb&Lopers',
  deepLinkBase: 'deblopers://',
  qrApiBase: 'https://api.qrserver.com/v1/create-qr-code/',
  qrSizeLarge: '320x320',
  qrSize: '260x260',
  qrSizeSmall: '220x220',
};

const TABLES = [
  { number: 1, capacity: 4, type: 'Estándar', tagClass: 'standard', icon: '🍽️' },
  { number: 2, capacity: 2, type: 'Estándar', tagClass: 'standard', icon: '🍽️' },
  { number: 3, capacity: 6, type: 'VIP', tagClass: 'vip', icon: '⭐' },
  { number: 4, capacity: 4, type: 'Accesibilidad', tagClass: 'accessibility', icon: '🦽' },
  { number: 5, capacity: 8, type: 'VIP', tagClass: 'vip', icon: '⭐' },
];

const TIPS = [
  { label: 'Malo', emoji: '😞', percent: 0 },
  { label: 'Regular', emoji: '😐', percent: 5 },
  { label: 'Bueno', emoji: '🙂', percent: 10 },
  { label: 'Muy bueno', emoji: '😊', percent: 15 },
  { label: 'Excelente', emoji: '😍', percent: 20 },
];

function deepLink(path) {
  return `${CONFIG.deepLinkBase}${path}`;
}

function qrUrl(value, size = CONFIG.qrSize) {
  return `${CONFIG.qrApiBase}?size=${size}&data=${encodeURIComponent(value)}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function qrImageMarkup({ value, alt, size = CONFIG.qrSize }) {
  return `
    <div class="qr-img-wrap">
      <img class="qr-image" src="${qrUrl(value, size)}" alt="${escapeHtml(alt)}" loading="lazy" width="260" height="260" />
    </div>
  `;
}

function codePill(value) {
  return `<div class="code-pill"><span>${escapeHtml(value)}</span></div>`;
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
    el.textContent = isLight ? '☀️' : '🌙';
  });
  document.querySelectorAll('[data-theme-label]').forEach((el) => {
    el.textContent = isLight ? 'Claro' : 'Oscuro';
  });
}

function renderHome() {
  const summary = document.getElementById('deepLinksSummary');
  if (summary) {
    const rows = [
      { label: 'Entrada', value: deepLink('entrance') },
      ...TABLES.map((table) => ({ label: `Mesa ${table.number}`, value: deepLink(`table/${table.number}`) })),
      ...TIPS.map((tip) => ({ label: `Propina ${tip.percent}%`, value: deepLink(`tip/${tip.percent}`) })),
    ];

    summary.innerHTML = rows.map((row) => `
      <div class="deep-link-item">
        <strong>${escapeHtml(row.label)}</strong>
        <span>${escapeHtml(row.value)}</span>
      </div>
    `).join('');
  }

  const totalQr = document.getElementById('totalQr');
  const totalTables = document.getElementById('totalTables');
  if (totalQr) totalQr.textContent = String(1 + TABLES.length + TIPS.length);
  if (totalTables) totalTables.textContent = String(TABLES.length);
}

function renderEntrance() {
  const container = document.getElementById('entranceQr');
  if (!container) return;

  const value = deepLink('entrance');
  container.innerHTML = `
    <div class="qr-single__image-wrap">
      <img class="qr-image" src="${qrUrl(value, CONFIG.qrSizeLarge)}" alt="QR de entrada al restaurante" width="320" height="320" />
    </div>
    ${codePill(value)}
    <a class="btn btn--primary" href="${value}">Probar deep link en este dispositivo</a>
  `;
}

function renderTables() {
  const grid = document.getElementById('tablesGrid');
  if (!grid) return;

  grid.innerHTML = TABLES.map((table) => {
    const value = deepLink(`table/${table.number}`);
    return `
      <article class="qr-card">
        <div>
          <h2 class="qr-card__title">${table.icon} Mesa ${table.number}</h2>
          <div class="qr-card__meta">
            <span class="tag">${table.capacity} personas</span>
            <span class="tag tag--${table.tagClass}">${escapeHtml(table.type)}</span>
          </div>
        </div>
        ${qrImageMarkup({ value, alt: `QR Mesa ${table.number}` })}
        ${codePill(value)}
        <a class="btn btn--small" href="${value}">Probar link</a>
      </article>
    `;
  }).join('');
}

function renderTips() {
  const levels = document.getElementById('tipLevels');
  if (levels) {
    levels.innerHTML = TIPS.slice().reverse().map((tip) => `
      <div class="tip-level">
        <span><strong>${tip.emoji} ${escapeHtml(tip.label)}</strong></span>
        <span class="tip-percent">${tip.percent}%</span>
      </div>
    `).join('');
  }

  const grid = document.getElementById('tipsGrid');
  if (!grid) return;

  grid.innerHTML = TIPS.map((tip) => {
    const value = deepLink(`tip/${tip.percent}`);
    return `
      <article class="qr-card">
        <div>
          <h2 class="qr-card__title">${tip.emoji} Propina ${tip.percent}%</h2>
          <p>${escapeHtml(tip.label)}</p>
        </div>
        ${qrImageMarkup({ value, alt: `QR Propina ${tip.percent}%`, size: CONFIG.qrSizeSmall })}
        ${codePill(value)}
        <a class="btn btn--small" href="${value}">Probar link</a>
      </article>
    `;
  }).join('');
}

function initPage() {
  initTheme();

  const page = document.body.dataset.page;
  if (page === 'home') renderHome();
  if (page === 'entrance') renderEntrance();
  if (page === 'tables') renderTables();
  if (page === 'tips') renderTips();
}

document.addEventListener('DOMContentLoaded', initPage);
