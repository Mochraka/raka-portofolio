# RAKA Portofolio — Panduan Deploy

## Struktur Folder
```
portofolio/
├── index.html
├── firebase.json
├── firestore.rules
├── css/
│   └── style.css
├── js/
│   ├── firebase.js   (koneksi Firestore, gallery, reviews)
│   └── main.js       (UI, theme, admin panel, experience data)
└── images/
    └── hero-bg.jpg   ← taruh foto background kamu di sini
```

---

## Langkah Deploy ke Firebase

### 1. Pasang foto background
- Taruh foto kamu di folder `images/` dengan nama `hero-bg.jpg`
- Atau ganti URL di `index.html` baris `background-image: url('images/hero-bg.jpg')`

### 2. Edit data magang
- Buka `js/main.js`
- Cari bagian `// ===== EXPERIENCE DATA =====`
- Edit array `experiences` dengan data magang kamu yang asli

### 3. Ganti password admin
- Di `js/main.js` cari: `const ADMIN_PASSWORD = "raka2025";`
- Ganti dengan password pilihanmu

### 4. Login Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### 5. Init project (kalau belum)
```bash
cd portofolio
firebase use reviews-1aeab
```

### 6. Update Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### 7. Deploy website
```bash
firebase deploy --only hosting
```

---

## Cara Upload Foto ke Gallery
1. Buka website kamu
2. Klik ikon 🔒 di pojok kanan bawah
3. Masukkan password admin
4. Pilih kategori (Sertifikat / Project)
5. Masukkan judul dan URL foto
   - Upload foto dulu ke **Firebase Storage** atau **Imgur.com**
   - Copy URL-nya, paste di form

## Cara Upload ke Firebase Storage (buat URL foto)
1. Buka Firebase Console → Storage
2. Upload foto
3. Klik foto → copy "Download URL"
4. Paste di admin panel portofolio

---

## Fitur
- ✅ Dark / Light mode
- ✅ Background header custom
- ✅ Gallery 2 kategori (Sertifikat & Project)
- ✅ Section Experience / Magang
- ✅ Comment system (Firebase Firestore)
- ✅ Admin panel (password protected)
- ✅ Upload & hapus foto dari admin panel
- ✅ Lightbox untuk preview foto
- ✅ Responsive (mobile friendly)
