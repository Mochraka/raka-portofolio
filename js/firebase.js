import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDczelrrthjduPoMdwCh155IgrR3oE2xOk",
  authDomain: "reviews-1aeab.firebaseapp.com",
  databaseURL: "https://reviews-1aeab-default-rtdb.firebaseio.com/", 
  projectId: "reviews-1aeab",
  storageBucket: "reviews-1aeab.firebasestorage.app",
  messagingSenderId: "789047344632",
  appId: "1:789047344632:web:a6a6a67621b20bc9e0ea0d"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 1. Simpan Foto Baru (Teks Base64)
window.firebaseAddGallery = function(category, title, base64Url) {
  return push(ref(db, 'gallery'), {
    category: category,
    title: title,
    url: base64Url,
    createdAt: Date.now()
  });
};

// 2. Ambil Foto Galeri Utama
// Global state untuk melacak indeks foto yang sedang aktif di lightbox
let currentGalleryItems = [];
let currentActiveIndex = 0;

// 1. Ambil Foto Galeri Utama
window.firebaseFetchGallery = function(currentTab) {
  const galleryRef = ref(db, 'gallery');
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;

  onValue(galleryRef, (snapshot) => {
    grid.innerHTML = "";
    const data = snapshot.val();
    if (!data) {
      grid.innerHTML = '<div class="gallery-loading">Belum ada foto di kategori ini.</div>';
      return;
    }

    const items = Object.keys(data).map(key => ({ id: key, ...data[key] }));
    currentGalleryItems = items.filter(item => item.category === currentTab);

    if (currentGalleryItems.length === 0) {
      grid.innerHTML = '<div class="gallery-loading">Belum ada foto di kategori ini.</div>';
      return;
    }

    currentGalleryItems.forEach((item, index) => {
      const el = document.createElement('div');
      el.className = 'gallery-item';
      el.innerHTML = `
        <img src="${item.url}" alt="${item.title}" />
        <div class="gallery-overlay">
          <h5>${item.title}</h5>
          <p>${item.category === 'sertif' ? 'Sertifikat' : 'Project'}</p>
        </div>
      `;
      
      el.addEventListener('click', () => {
        const lb = document.getElementById('lightbox');
        const lbImg = document.getElementById('lightboxImg');
        if (lb && lbImg) {
          currentActiveIndex = index;
          lbImg.src = item.url;
          lb.classList.remove('hidden');
        }
      });
      grid.appendChild(el);
    });
  });
};

// 2. Fungsi Navigasi Geser Gambar
function navigateLightbox(direction) {
  if (currentGalleryItems.length === 0) return;
  
  if (direction === 'next') {
    currentActiveIndex = (currentActiveIndex + 1) % currentGalleryItems.length;
  } else if (direction === 'prev') {
    currentActiveIndex = (currentActiveIndex - 1 + currentGalleryItems.length) % currentGalleryItems.length;
  }
  
  const lbImg = document.getElementById('lightboxImg');
  if (lbImg) {
    lbImg.src = currentGalleryItems[currentActiveIndex].url;
  }
}

// 3. EVENT LISTENER ANTI-GAGAL UNTUK HP DAN LAPTOP
// Menggunakan 'pointerdown' agar instan merespon sentuhan jari/touch di HP sebelum delay click terjadi
document.addEventListener('pointerdown', (e) => {
  const lb = document.getElementById('lightbox');
  if (!lb || lb.classList.contains('hidden')) return;

  // Jika yang diklik adalah tombol close (X) atau ikon di dalamnya
  if (e.target.id === 'lightboxClose' || e.target.closest('#lightboxClose')) {
    lb.classList.add('hidden');
    return;
  }

  // Jika yang diklik adalah tombol Kiri
  if (e.target.id === 'lightboxPrev' || e.target.closest('#lightboxPrev')) {
    e.stopPropagation();
    navigateLightbox('prev');
    return;
  }

  // Jika yang diklik adalah tombol Kanan
  if (e.target.id === 'lightboxNext' || e.target.closest('#lightboxNext')) {
    e.stopPropagation();
    navigateLightbox('next');
    return;
  }

  // Jika yang diklik adalah area latar belakang kosong di luar gambar, ikut tutup lightbox
  if (e.target === lb) {
    lb.classList.add('hidden');
  }
});
// 3. Ambil Foto untuk Kelola Admin
window.firebaseFetchManage = function(callback) {
  onValue(ref(db, 'gallery'), (snapshot) => {
    const data = snapshot.val();
    if (!data) { callback([]); return; }
    callback(Object.keys(data).map(key => ({ id: key, ...data[key] })));
  });
};

// 4. Hapus Foto
window.firebaseDeleteGallery = function(id) {
  return remove(ref(db, `gallery/${id}`));
};

// 5. Tambah Komentar Baru
window.firebaseAddReview = function(username, rating, review) {
  return push(ref(db, 'reviews'), {
    name: username,
    rating: parseInt(rating),
    message: review,
    createdAt: Date.now()
  });
};

// 6. Jalankan Pemantauan Komentar Secara Global
window.listenToReviews = function() {
  const container = document.getElementById('reviews-container');
  if (!container) return;

  onValue(ref(db, 'reviews'), (snapshot) => {
    container.innerHTML = "";
    const data = snapshot.val();
    if (!data) {
      container.innerHTML = '<p style="color:var(--text-muted); font-size:0.9rem;">Belum ada komentar.</p>';
      return;
    }

    const list = Object.keys(data).map(key => data[key]);
    list.sort((a, b) => b.createdAt - a.createdAt);

    list.forEach(item => {
      const card = document.createElement('div');
      card.className = 'review-card';
      const stars = '★'.repeat(item.rating) + '☆'.repeat(5 - item.rating);
      card.innerHTML = `
        <div class="review-header">
          <span class="review-name">${item.name}</span>
          <span class="review-stars" style="color:#ffcc00;">${stars}</span>
        </div>
        <p class="review-msg">${item.message}</p>
      `;
      container.appendChild(card);
    });
  });
};

// Jalankan otomatis begitu modul siap
window.listenToReviews();
window.firebaseFetchGallery('sertif');