# SmartThermo IoT Dashboard

Dashboard monitoring suhu ruangan (DHT22), suhu mesin (PT100), kelembaban, aktuator, RS485 Modbus, threshold, grafik, riwayat, dan export CSV.

## Menjalankan lokal

```bash
cp .env.example .env
# Wajib ubah JWT_SECRET, IOT_API_KEY, dan ADMIN_PASSWORD
npm install
npm start
```

Buka `http://localhost:3000`. Login menggunakan `ADMIN_USERNAME` dan `ADMIN_PASSWORD` dari `.env`. Penyimpanan default memakai `data/store.json`; struktur ini mudah dipindahkan ke MySQL/SQLite untuk skala lebih besar.

## API ESP32

Endpoint `POST /api/update-data` memakai header `x-api-key`.

```json
{
  "temp_mesin": 45.2,
  "temp_ruangan": 28.5,
  "hum_ruangan": 65.0,
  "kipas_ruangan": 1,
  "kipas_mesin": 0,
  "buzzer": 0,
  "modbus_status": "OK"
}
```

Contoh:

```bash
curl -X POST https://domain-anda.com/api/update-data \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: ganti-dengan-api-key-esp32' \
  -d '{"temp_mesin":45.2,"temp_ruangan":28.5,"hum_ruangan":65,"kipas_ruangan":1,"kipas_mesin":0,"buzzer":0,"modbus_status":"OK"}'
```

## Deploy Cloud Panel / VPS

1. Upload repository ke server dan pastikan Node.js 18+ aktif.
2. Jalankan `npm install --omit=dev`.
3. Salin `.env.example` menjadi `.env`, isi secret kuat dan password admin.
4. Jalankan `npm start` menggunakan Node Application (cPanel/AaPanel/CyberPanel), PM2, atau systemd.
5. Arahkan reverse proxy/domain ke port `PORT` (default 3000), aktifkan HTTPS, dan izinkan hanya endpoint yang diperlukan.
6. Pastikan direktori `data/` writable oleh user aplikasi dan lakukan backup berkala.

### PM2

```bash
npm install -g pm2
pm2 start server.js --name smartthermo
pm2 save
pm2 startup
```

## Catatan keamanan

- Jangan commit `.env` atau `data/store.json`.
- Gunakan HTTPS dan `IOT_API_KEY` panjang/acak.
- Cookie sesi HTTP-only, validasi payload, Helmet, dan pembatasan ukuran JSON sudah aktif.
- Untuk deployment multi-instance, ganti JSON storage dengan database terpusat dan tambahkan rate limiting/WAF.
- Kontrol keselamatan utama tetap berada di ATmega328P/ESP32; dashboard cloud bukan pengganti interlock hardware.
