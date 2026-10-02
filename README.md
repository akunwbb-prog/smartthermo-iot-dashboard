const APP_CONFIG = {
  URL_BG_PABRIK: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=1600&q=80',
  URL_LOGO_SEKOLAH: 'https://placehold.co/120x120/ff8c00/ffffff?text=Logo+Sekolah',
  URL_LOGO_JURUSAN: 'https://placehold.co/120x120/1d3557/ffffff?text=Logo+Jurusan'
};

const root = document.documentElement;
root.style.setProperty('--bg-image', `url('${APP_CONFIG.URL_BG_PABRIK}')`);
document.getElementById('schoolLogo').src = APP_CONFIG.URL_LOGO_SEKOLAH;
document.getElementById('departmentLogo').src = APP_CONFIG.URL_LOGO_JURUSAN;
document.getElementById('headerSchoolLogo').src = APP_CONFIG.URL_LOGO_SEKOLAH;

const loginScreen = document.getElementById('loginScreen');
const dashboardScreen = document.getElementById('dashboardScreen');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const historyTableBody = document.getElementById('historyTableBody');
const historySearch = document.getElementById('historySearch');
const historyFrom = document.getElementById('historyFrom');
const historyTo = document.getElementById('historyTo');
const thresholdForm = document.getElementById('thresholdForm');
const paginationControls = document.getElementById('paginationControls');

let trendChart = null;
let historyData = [];
let currentPage = 1;
const rowsPerPage = 8;

const state = {
  latest: null,
  settings: null
};

function formatDateTime(value) {
  if (!value) return '--';
  const d = new Date(value);
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
}

function showAlert(message) {
  window.alert(message);
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload.error || 'Request gagal.');
  }

  return payload;
}

async function login(username, password) {
  const result = await api('/api/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });

  return result;
}

async function logout() {
  await api('/api/logout', { method: 'POST' });
}

function updateGauge(tempMesin) {
  const gaugeValue = document.getElementById('gaugeValue');
  const ring = document.querySelector('.gauge-ring');
  const value = Number(tempMesin || 0);

  gaugeValue.textContent = `${value.toFixed(1)}°C`;

  let hue = 160;
  if (value >= 80) hue = 0;
  else if (value >= 60) hue = 42;
  else if (value >= 35) hue = 120;

  ring.style.background = `conic-gradient(from 220deg, hsl(${hue}, 80%, 62%) 0 ${Math.min(value / 1.6, 100)}%, rgba(255,255,255,0.08) ${Math.min(value / 1.6, 100)}% 100%)`;
}

function renderMetrics() {
  if (!state.latest) return;

  document.getElementById('roomTempValue').textContent = `${Number(state.latest.temp_ruangan || 0).toFixed(1)}°C`;
  document.getElementById('roomHumidityValue').textContent = `${Number(state.latest.hum_ruangan || 0).toFixed(1)}%`;
  document.getElementById('machineTempValue').textContent = `${Number(state.latest.temp_mesin || 0).toFixed(1)}°C`;
  document.getElementById('lastUpdateText').textContent = formatDateTime(state.latest.received_at);

  const roomFan = Number(state.latest.kipas_ruangan || 0) === 1 ? 'ON' : 'OFF';
  const machineFan = Number(state.latest.kipas_mesin || 0) === 1 ? 'ON' : 'OFF';
  const buzzer = Number(state.latest.buzzer || 0) === 1 ? 'ACTIVE' : 'MUTE';
  const network = String(state.latest.modbus_status || 'OK').toUpperCase();

  document.getElementById('roomFanBadge').textContent = roomFan;
  document.getElementById('machineFanBadge').textContent = machineFan;
  document.getElementById('buzzerBadge').textContent = buzzer;
  document.getElementById('networkBadge').textContent = network;
  document.getElementById('networkStatusChip').textContent = network === 'OK' ? 'Modbus OK' : 'Modbus Alert';

  if (Number(state.latest.temp_mesin || 0) >= Number(state.settings?.alarmThreshold || 80)) {
    document.getElementById('machineStatusChip').textContent = 'DANGER';
    document.getElementById('machineStatusChip').className = 'chip chip-warning';
  } else if (Number(state.latest.temp_mesin || 0) >= Number(state.settings?.machineFanThreshold || 60)) {
    document.getElementById('machineStatusChip').textContent = 'WARNING';
    document.getElementById('machineStatusChip').className = 'chip chip-warning';
  } else {
    document.getElementById('machineStatusChip').textContent = 'NORMAL';
    document.getElementById('machineStatusChip').className = 'chip chip-info';
  }

  document.getElementById('alarmThresholdLabel').textContent = `${Number(state.settings?.alarmThreshold || 80).toFixed(0)}°C`;
  document.getElementById('buzzerBadge').classList.toggle('buzzer-pill', buzzer === 'ACTIVE');
  document.getElementById('roomFanBadge').style.background = roomFan === 'ON' ? 'rgba(42, 201, 125, 0.18)' : 'rgba(95, 161, 255, 0.12)';
  document.getElementById('machineFanBadge').style.background = machineFan === 'ON' ? 'rgba(42, 201, 125, 0.18)' : 'rgba(95, 161, 255, 0.12)';

  updateGauge(Number(state.latest.temp_mesin || 0));
}

function buildChart(labels, tempMesin, tempRuangan, humidity) {
  const ctx = document.getElementById('trendChart');
  if (!ctx) return;

  if (trendChart) {
    trendChart.destroy();
  }

  trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Suhu Mesin',
          data: tempMesin,
          borderColor: '#ff7d5b',
          backgroundColor: 'rgba(255,125,91,0.12)',
          tension: 0.35,
          pointRadius: 0,
          fill: false
        },
        {
          label: 'Suhu Ruangan',
          data: tempRuangan,
          borderColor: '#4ecdc4',
          backgroundColor: 'rgba(78,205,196,0.12)',
          tension: 0.35,
          pointRadius: 0,
          fill: false
        },
        {
          label: 'Kelembaban Ruangan',
          data: humidity,
          borderColor: '#5aa9ff',
          backgroundColor: 'rgba(90,169,255,0.12)',
          tension: 0.35,
          pointRadius: 0,
          fill: false,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { labels: { color: '#eaf4ff' } }
      },
      scales: {
        x: { ticks: { color: '#d7ecff' }, grid: { color: 'rgba(255,255,255,0.06)' } },
        y: { ticks: { color: '#d7ecff' }, grid: { color: 'rgba(255,255,255,0.06)' } },
        y1: {
          position: 'right',
          ticks: { color: '#d7ecff' },
          grid: { drawOnChartArea: false }
        }
      }
    }
  });
}

function updateChartFromHistory(rows) {
  if (!rows.length) {
    buildChart(['--'], [0], [0], [0]);
    return;
  }

  const start = rows.slice().reverse();
  const labels = start.map((row) => new Date(row.received_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
  const tempMesin = start.map((row) => Number(row.temp_mesin || 0));
  const tempRuangan = start.map((row) => Number(row.temp_ruangan || 0));
  const humidity = start.map((row) => Number(row.hum_ruangan || 0));
  buildChart(labels, tempMesin, tempRuangan, humidity);
}

function renderPagination(totalRows) {
  paginationControls.innerHTML = '';
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
    btn.textContent = String(i);
    btn.addEventListener('click', () => {
      currentPage = i;
      renderHistoryTable();
    });
    paginationControls.appendChild(btn);
  }
}

function renderHistoryTable() {
  let filtered = [...historyData];
  const search = historySearch.value.trim().toLowerCase();
  if (search) {
    filtered = filtered.filter((row) => JSON.stringify(row).toLowerCase().includes(search));
  }

  const from = historyFrom.value ? new Date(`${historyFrom.value}T00:00:00`).getTime() : null;
  const to = historyTo.value ? new Date(`${historyTo.value}T23:59:59`).getTime() : null;

  if (from) filtered = filtered.filter((row) => new Date(row.received_at).getTime() >= from);
  if (to) filtered = filtered.filter((row) => new Date(row.received_at).getTime() <= to);

  const total = filtered.length;
  const start = (currentPage - 1) * rowsPerPage;
  const pageRows = filtered.slice(start, start + rowsPerPage);

  historyTableBody.innerHTML = pageRows.map((row) => `
    <tr>
      <td>${formatDateTime(row.received_at)}</td>
      <td>${Number(row.temp_mesin || 0).toFixed(1)}°C</td>
      <td>${Number(row.temp_ruangan || 0).toFixed(1)}°C</td>
      <td>${Number(row.hum_ruangan || 0).toFixed(1)}%</td>
      <td>${Number(row.kipas_ruangan || 0) === 1 ? 'ON' : 'OFF'}</td>
      <td>${Number(row.kipas_mesin || 0) === 1 ? 'ON' : 'OFF'}</td>
    </tr>
  `).join('') || '<tr><td colspan="6">Tidak ada data.</td></tr>';

  renderPagination(total);
}

async function loadStatus() {
  try {
    const result = await api('/api/status');
    state.latest = result.latest;
    state.settings = result.settings;
    renderMetrics();
    populateSettingsForm();
  } catch (error) {
    showAlert(error.message);
  }
}

async function loadHistory() {
  try {
    const result = await api('/api/history?limit=500');
    historyData = result.rows || [];
    renderHistoryTable();
    updateChartFromHistory(historyData.slice(0, 24));
  } catch (error) {
    console.error(error);
  }
}

function populateSettingsForm() {
  if (!state.settings) return;
  document.getElementById('roomFanThreshold').value = Number(state.settings.roomFanThreshold || 30);
  document.getElementById('machineFanThreshold').value = Number(state.settings.machineFanThreshold || 60);
  document.getElementById('alarmThreshold').value = Number(state.settings.alarmThreshold || 80);
}

async function handleThresholdSubmit(event) {
  event.preventDefault();
  try {
    const payload = {
      roomFanThreshold: Number(document.getElementById('roomFanThreshold').value),
      machineFanThreshold: Number(document.getElementById('machineFanThreshold').value),
      alarmThreshold: Number(document.getElementById('alarmThreshold').value)
    };

    const result = await api('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });

    state.settings = result.settings;
    populateSettingsForm();
    renderMetrics();
    showAlert('Set point berhasil disimpan.');
  } catch (error) {
    showAlert(error.message);
  }
}

async function checkSession() {
  const ok = await api('/api/me').then(() => true).catch(() => false);
  if (ok) {
    await loadStatus();
    await loadHistory();
    loginScreen.classList.add('hidden');
    dashboardScreen.classList.remove('hidden');
  } else {
    loginScreen.classList.remove('hidden');
    dashboardScreen.classList.add('hidden');
  }
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    await login(username, password);
    await loadStatus();
    await loadHistory();
    loginScreen.classList.add('hidden');
    dashboardScreen.classList.remove('hidden');
  } catch (error) {
    showAlert(error.message);
  }
});

logoutBtn.addEventListener('click', async () => {
  try {
    await logout();
    loginScreen.classList.remove('hidden');
    dashboardScreen.classList.add('hidden');
    document.getElementById('loginForm').reset();
  } catch (error) {
    console.error(error);
  }
});

thresholdForm.addEventListener('submit', handleThresholdSubmit);

historySearch.addEventListener('input', () => {
  currentPage = 1;
  renderHistoryTable();
});

historyFrom.addEventListener('change', () => {
  currentPage = 1;
  renderHistoryTable();
});

historyTo.addEventListener('change', () => {
  currentPage = 1;
  renderHistoryTable();
});

document.getElementById('exportCsvBtn').addEventListener('click', () => {
  const headers = ['Waktu', 'Temp Mesin', 'Temp Ruangan', 'Humidity', 'Kipas Ruangan', 'Kipas Mesin'];
  const csvRows = [headers.join(',')];

  historyData.forEach((row) => {
    csvRows.push([
      row.received_at,
      Number(row.temp_mesin || 0).toFixed(1),
      Number(row.temp_ruangan || 0).toFixed(1),
      Number(row.hum_ruangan || 0).toFixed(1),
      Number(row.kipas_ruangan || 0) === 1 ? 'ON' : 'OFF',
      Number(row.kipas_mesin || 0) === 1 ? 'ON' : 'OFF'
    ].join(','));
  });

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'smartthermo-history.csv';
  a.click();
  URL.revokeObjectURL(url);
});

document.querySelectorAll('.range-btn').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.range-btn').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');

    const range = button.dataset.range;
    const now = Date.now();
    let from = now - 3600000;

    if (range === '12h') from = now - 43200000;
    if (range === 'today') from = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
    if (range === 'live') from = now - 1800000;

    const filtered = historyData.filter((row) => new Date(row.received_at).getTime() >= from);
    updateChartFromHistory(filtered.slice(-24));
  });
});

checkSession();
