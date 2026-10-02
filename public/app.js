* {
  box-sizing: border-box;
}

:root {
  --bg-image: url('https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=1600&q=80');
  --logo-school: 'https://placehold.co/120x120/0d1b2a/ffffff?text=Logo+Sekolah';
  --logo-dept: 'https://placehold.co/120x120/1d3557/ffffff?text=Logo+Jurusan';
  --bg-dark: rgba(4, 9, 18, 0.82);
  --glass: rgba(13, 19, 34, 0.55);
  --glass-border: rgba(255, 255, 255, 0.12);
  --primary: #3ec8ff;
  --secondary: #7ef0c0;
  --danger: #ff4d5a;
  --warning: #ffb703;
  --text: #edf6ff;
  --muted: #b3c6d9;
  --card-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
}

html, body {
  margin: 0;
  min-height: 100%;
  font-family: 'Inter', sans-serif;
  background:
    linear-gradient(rgba(1, 6, 15, 0.7), rgba(1, 6, 15, 0.7)),
    var(--bg-image) center/cover no-repeat fixed;
  color: var(--text);
}

body {
  min-height: 100vh;
}

img {
  max-width: 100%;
  display: block;
}

button, input {
  font: inherit;
}

.page-shell {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
}

.hidden {
  display: none !important;
}

.glass-panel {
  background: rgba(12, 19, 33, 0.55);
  border: 1px solid var(--glass-border);
  border-radius: 22px;
  box-shadow: var(--card-shadow);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.login-screen {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(4, 7, 15, 0.42);
}

.login-card {
  position: relative;
  z-index: 1;
  width: min(92vw, 480px);
  padding: 28px 24px 22px;
  animation: fadeInUp 0.8s ease;
}

.brand-row {
  display: grid;
  grid-template-columns: 90px 1fr 90px;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.brand-row img {
  width: 90px;
  height: 90px;
  border-radius: 18px;
  object-fit: contain;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 8px;
}

.brand-text {
  text-align: center;
}

.mini-label {
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--muted);
}

.brand-text h1 {
  margin: 4px 0 0;
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(1.7rem, 2vw, 2.3rem);
  color: var(--text);
}

.badge-pill {
  display: inline-flex;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(62, 200, 255, 0.12);
  border: 1px solid rgba(62, 200, 255, 0.34);
  color: var(--primary);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 700;
}

.login-title-wrap {
  margin: 18px 0 18px;
}

.login-title-wrap h2 {
  margin: 10px 0 0;
  font-size: clamp(1.6rem, 2vw, 2rem);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.login-form label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: var(--muted);
  font-size: 0.95rem;
}

.login-form input {
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  border-radius: 14px;
  padding: 0.98rem 1rem;
  color: var(--text);
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.login-form input:focus {
  border-color: rgba(62, 200, 255, 0.7);
  box-shadow: 0 0 0 4px rgba(62, 200, 255, 0.12);
}

.primary-btn, .ghost-btn, .range-btn {
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.primary-btn {
  background: linear-gradient(135deg, #3ec8ff, #4b6bff);
  color: #fff;
  padding: 0.9rem 1rem;
  font-weight: 700;
  box-shadow: 0 12px 28px rgba(59, 113, 255, 0.35);
}

.primary-btn:hover, .ghost-btn:hover, .range-btn:hover {
  transform: translateY(-1px);
}

.login-hint {
  margin: 18px 0 0;
  text-align: center;
  color: var(--muted);
  font-size: 0.88rem;
}

.dashboard {
  width: min(1400px, 100%);
  padding: 22px 20px 32px;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 18px 24px;
}

.brand-group {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-group img {
  width: 64px;
  height: 64px;
  object-fit: contain;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
  padding: 8px;
}

.eyebrow {
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
}

.brand-group h1 {
  margin: 4px 0 0;
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(1.8rem, 2vw, 2.5rem);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-status {
  display: inline-flex;
  align-items: center;
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(114, 255, 176, 0.12);
  color: var(--secondary);
  font-size: 0.82rem;
  font-weight: 700;
}

.header-status::before {
  content: '';
  width: 9px;
  height: 9px;
  background: var(--secondary);
  border-radius: 50%;
  display: inline-block;
  margin-right: 8px;
  box-shadow: 0 0 16px rgba(126, 240, 192, 0.8);
}

.ghost-btn {
  background: rgba(255, 255, 255, 0.06);
  color: var(--text);
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 0.75rem 1rem;
  font-weight: 700;
}

.dashboard-content {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(220px, 1fr));
  gap: 18px;
}

.stat-card {
  padding: 18px 18px 14px;
  position: relative;
  overflow: hidden;
}

.stat-card::after {
  content: '';
  position: absolute;
  inset: auto -25px -40px auto;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
}

.stat-header, .stat-meta {
  position: relative;
  z-index: 1;
}

.stat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: var(--muted);
  font-weight: 600;
}

.small-tag {
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: rgba(255,255,255,0.06);
  padding: 5px 8px;
  border-radius: 999px;
}

.stat-value {
  position: relative;
  z-index: 1;
  font-size: clamp(2rem, 3vw, 3rem);
  font-weight: 800;
  margin: 16px 0 12px;
  font-family: 'Orbitron', sans-serif;
}

.stat-meta {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  color: var(--muted);
  font-size: 0.82rem;
}

.accent-blue { background: linear-gradient(135deg, rgba(30, 87, 171, 0.78), rgba(11, 18, 29, 0.72)); }
.accent-teal { background: linear-gradient(135deg, rgba(10, 144, 154, 0.8), rgba(13, 18, 30, 0.72)); }
.accent-gold { background: linear-gradient(135deg, rgba(157, 105, 3, 0.88), rgba(13, 18, 30, 0.72)); }

.main-grid {
  display: grid;
  grid-template-columns: 1.3fr 0.9fr;
  gap: 18px;
}

.panel {
  padding: 18px 18px 20px;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.panel-head h3 {
  margin: 0;
  font-size: 1.1rem;
}

.chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.45rem 0.7rem;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 700;
}

.chip-warning {
  background: rgba(255, 183, 3, 0.15);
  border: 1px solid rgba(255, 183, 3, 0.4);
  color: #ffd46d;
}

.chip-info {
  background: rgba(62, 200, 255, 0.12);
  border: 1px solid rgba(62, 200, 255, 0.32);
  color: #8ad7ff;
}

.gauge-wrap {
  display: grid;
  place-items: center;
  min-height: 280px;
}

.gauge-ring {
  width: min(78vw, 260px);
  aspect-ratio: 1;
  padding: 20px;
  border-radius: 50%;
  background: conic-gradient(from 220deg, #3fe0a5 0 30%, #ffca3a 30% 65%, #ff4d5a 65% 100%);
  box-shadow: inset 0 0 30px rgba(255,255,255,0.1), 0 18px 35px rgba(0,0,0,0.35);
  display: grid;
  place-items: center;
  animation: pulse 2s ease-in-out infinite alternate;
}

.gauge-inner {
  width: 80%;
  height: 80%;
  border-radius: 50%;
  background: rgba(8, 12, 20, 0.82);
  border: 1px solid rgba(255,255,255,0.07);
  display: grid;
  place-items: center;
  text-align: center;
}

.gauge-value {
  font-size: clamp(1.8rem, 2.5vw, 2.7rem);
  font-weight: 800;
  font-family: 'Orbitron', sans-serif;
}

.gauge-range {
  margin-top: 6px;
  font-size: 0.75rem;
  color: var(--muted);
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.gauge-scale {
  display: flex;
  justify-content: space-between;
  width: 100%;
  color: var(--muted);
  font-size: 0.72rem;
}

.status-list {
  display: grid;
  gap: 14px;
}

.status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 12px 14px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 76px;
  padding: 7px 10px;
  background: rgba(95, 161, 255, 0.12);
  color: #b5d4ff;
  border-radius: 999px;
  border: 1px solid rgba(95, 161, 255, 0.2);
  font-weight: 700;
  font-size: 0.75rem;
}

.buzzer-pill {
  background: rgba(255, 77, 90, 0.12);
  border-color: rgba(255, 77, 90, 0.38);
  color: #ff9aa4;
  animation: alarmBlink 1s ease-in-out infinite alternate;
}

.last-update {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid rgba(255,255,255,0.06);
  display: flex;
  gap: 12px;
  justify-content: space-between;
  color: var(--muted);
}

.chart-panel {
  padding: 18px 18px 10px;
}

.range-switcher {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.range-btn {
  background: rgba(255,255,255,0.04);
  color: var(--text);
  padding: 0.56rem 0.8rem;
  font-size: 0.78rem;
  border: 1px solid rgba(255,255,255,0.06);
}

.range-btn.active {
  background: linear-gradient(135deg, #3ec8ff, #4d75ff);
  border-color: transparent;
}

.lower-grid {
  display: grid;
  grid-template-columns: 0.8fr 1.4fr;
  gap: 18px;
}

.threshold-form {
  display: grid;
  gap: 14px;
}

.threshold-form label {
  display: grid;
  gap: 8px;
  color: var(--muted);
}

.threshold-form input {
  width: 100%;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  color: var(--text);
  padding: 0.8rem 0.9rem;
}

.table-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.table-toolbar input {
  flex: 1 1 130px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  color: var(--text);
  padding: 0.72rem 0.8rem;
}

.table-wrap {
  overflow: auto;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.06);
}

table {
  width: 100%;
  border-collapse: collapse;
  background: rgba(6, 11, 20, 0.2);
}

th, td {
  padding: 0.82rem 0.8rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  text-align: left;
  font-size: 0.9rem;
}

th {
  background: rgba(255,255,255,0.04);
  color: var(--muted);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

tbody tr:hover {
  background: rgba(255,255,255,0.03);
}

.pagination {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 12px;
  flex-wrap: wrap;
}

.page-btn {
  background: rgba(255,255,255,0.04);
  color: var(--text);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  padding: 0.5rem 0.8rem;
  cursor: pointer;
}

.page-btn.active {
  background: linear-gradient(135deg, #3ec8ff, #4b6bff);
  border-color: transparent;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes alarmBlink {
  from { opacity: 1; box-shadow: 0 0 0 rgba(255, 77, 90, 0); }
  to { opacity: 0.7; box-shadow: 0 0 18px rgba(255, 77, 90, 0.75); }
}

@keyframes pulse {
  from { transform: scale(1); }
  to { transform: scale(1.02); }
}

@media (max-width: 980px) {
  .stats-grid,
  .main-grid,
  .lower-grid {
    grid-template-columns: 1fr;
  }

  .topbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .nav-actions {
    width: 100%;
    justify-content: space-between;
  }
}

@media (max-width: 620px) {
  .page-shell {
    padding: 18px;
  }

  .dashboard {
    padding: 14px;
  }

  .brand-row {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .brand-row img {
    margin: 0 auto;
  }
}
