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

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ===== FUNGSI GLOBAL UNTUK UTILITY =====

// 1. Simpan Foto Baru
window.firebaseAddGallery = function(category, title, base64Url) {
  const galleryRef = ref(db, 'gallery');
  return push(galleryRef, {
    category: category,
    title: title,
    url: base64Url, // Menyimpan string Base64 gambar
    createdAt: Date.now()
  });
};

// 2. Ambil Foto untuk Galeri Utama
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
    const filteredItems = items.filter(item => item.category === currentTab);

    if (filteredItems.length === 0) {
      grid.innerHTML = '<div class="gallery-loading">Belum ada foto di kategori ini.</div>';
      return;
    }

    filteredItems.forEach(item => {
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
        if (lb) {
          document.getElementById('lightboxImg').src = item.url;
          lb.classList.remove('hidden');
        }
      });
      grid.appendChild(el);
    });
  });
};

// 3. Ambil Foto untuk Kelola Admin
window.firebaseFetchManage = function(callback) {
  const galleryRef = ref(db, 'gallery');
  onValue(galleryRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) { callback([]); return; }
    const items = Object.keys(data).map(key => ({ id: key, ...data[key] }));
    callback(items);
  });
};

// 4. Hapus Foto
window.firebaseDeleteGallery = function(id) {
  return remove(ref(db, `gallery/${id}`));
};

// 5. Tambah Komentar
window.firebaseAddReview = function(username, rating, review) {
  return push(ref(db, 'reviews'), {
    name: username,
    rating: parseInt(rating),
    message: review,
    createdAt: Date.now()
  });
};

// 6. Dengarkan Komentar (Realtime)
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

// Jalankan listener pertama kali saat file termuat
window.listenToReviews();
window.firebaseFetchGallery('sertif');