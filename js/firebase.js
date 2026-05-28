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

// ===== LOGIKA TOMBOL UPLOAD LANGSUNG DI SINI =====
function initUploadFeature() {
  const uploadBtn = document.getElementById("uploadBtn");
  if (!uploadBtn) return;

  // Pasang event listener langsung ke tombol
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

    // ===== AUTO CONVERT LINK GOOGLE DRIVE =====
    if (url.includes("drive.google.com")) {
      let fileId = "";
      if (url.includes("/file/d/")) {
        fileId = url.split("/file/d/")[1].split("/")[0];
      } else if (url.includes("id=")) {
        fileId = url.split("id=")[1].split("&")[0];
      }

      if (fileId) {
        url = `https://docs.google.com/uc?export=download&id=${fileId}`;
      } else {
        msg.textContent = "Format link Drive tidak valid!";
        msg.style.color = "#ff4a4a";
        msg.classList.remove("hidden");
        return;
      }
    }

    // ===== PROSES SIMPAN KE FIREBASE =====
    try {
      const galleryRef = ref(db, 'gallery');
      await push(galleryRef, {
        category: category,
        title: title,
        url: url,
        createdAt: Date.now()
      });

      // Tampilkan status sukses neon cyan khas sysadmin
      msg.textContent = "✓ Foto berhasil ditambahkan!";
      msg.style.color = "#00ffcc";
      msg.classList.remove("hidden");

      // Reset Form
      document.getElementById("uploadTitle").value = "";
      document.getElementById("uploadUrl").value = "";
      setTimeout(() => msg.classList.add("hidden"), 3000);

    } catch (err) {
      console.error(err);
      msg.textContent = "Gagal menyimpan. Pastikan Rules DB sudah true.";
      msg.style.color = "#ff4a4a";
      msg.classList.remove("hidden");
    }
  });
}

// ===== FUNGSI AMBIL GALERI UNTUK HALAMAN UTAMA =====
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

// ===== INTERFACES LAIN UNTUK MAIN.JS =====
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

window.firebaseAddReview = function(username, rating, review) {
  return push(ref(db, 'reviews'), { name: username, rating: parseInt(rating), message: review, createdAt: Date.now() });
};

// Eksekusi saat DOM siap
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => { initUploadFeature(); });
} else {
  initUploadFeature();
}