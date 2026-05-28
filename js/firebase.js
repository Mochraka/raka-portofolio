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

// ===== 1. LOGIKA UTAMA: AMBIL GALERI FOTO (DIOPTIMALKAN DENGAN THUMBNAIL) =====
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
        <img src="${item.url}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/400x300?text=Gambar+Drive+Belum+Publik'"/>
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

// ===== 2. LOGIKA UTAMA: AMBIL & UPDATE KOMENTAR / REVIEWS (LANGSUNG TAMPIL) =====
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

window.firebaseAddReview = function(username, rating, review) {
  return push(ref(db, 'reviews'), {
    name: username,
    rating: parseInt(rating),
    message: review,
    createdAt: Date.now()
  });
};

// ===== 3. LOGIKA PANEL ADMIN: UPLOAD & MANAGE =====
function initUploadFeature() {
  const uploadBtn = document.getElementById("uploadBtn");
  if (!uploadBtn) return;

  uploadBtn.addEventListener("click", async () => {
    const category = document.getElementById("uploadCategory").value;
    const title = document.getElementById("uploadTitle").value.trim();
    let url = document.getElementById("uploadUrl").value.trim();
    const msg = document.getElementById("uploadMsg");

    if (!title || !url) {
      msg.textContent = "Judul dan URL wajib diisi!";
      msg.style.color = "#ff4a4a";
      msg.classList.remove("hidden");
      return;
    }

    // ===== AUTO CONVERT GOOGLE DRIVE KE THUMBNAIL RINGAN (600px) =====
    if (url.includes("drive.google.com")) {
      let fileId = "";
      if (url.includes("/file/d/")) {
        fileId = url.split("/file/d/")[1].split("/")[0];
      } else if (url.includes("id=")) {
        fileId = url.split("id=")[1].split("&")[0];
      }

      if (fileId) {
        // Menggunakan jalur thumbnail agar web tidak berat/loading lama
        url = `https://drive.google.com/thumbnail?sz=w600&id=${fileId}`;
      } else {
        msg.textContent = "Format link Drive tidak valid!";
        msg.style.color = "#ff4a4a";
        msg.classList.remove("hidden");
        return;
      }
    }

    try {
      const galleryRef = ref(db, 'gallery');
      await push(galleryRef, {
        category: category,
        title: title,
        url: url,
        createdAt: Date.now()
      });

      msg.textContent = "✓ Foto berhasil ditambahkan!";
      msg.style.color = "#00ffcc";
      msg.classList.remove("hidden");

      document.getElementById("uploadTitle").value = "";
      document.getElementById("uploadUrl").value = "";
      setTimeout(() => msg.classList.add("hidden"), 3000);

    } catch (err) {
      console.error(err);
      msg.textContent = "Gagal menyimpan. Cek Aturan/Rules DB.";
      msg.style.color = "#ff4a4a";
      msg.classList.remove("hidden");
    }
  });
}

window.firebaseFetchManage = function(callback) {
  onValue(ref(db, 'gallery'), (snapshot) => {
    const data = snapshot.val();
    if (!data) { callback([]); return; }
    callback(Object.keys(data).map(key => ({ id: key, ...data[key] })));
  });
};

window.firebaseDeleteGallery = function(id) {
  return remove(ref(db, `gallery/${id}`));
};

// ===== 4. BAWAAN TRIGGER SAAT HALAMAN DIBUKA =====
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initUploadFeature();
    window.firebaseFetchGallery('sertif');
    window.listenToReviews();
  });
} else {
  initUploadFeature();
  window.firebaseFetchGallery('sertif');
  window.listenToReviews();
}