// ===== FIREBASE CONFIG =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, serverTimestamp,
  onSnapshot, orderBy, query, deleteDoc, doc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDczelrrthjduPoMdwCh155IgrR3oE2xOk",
  authDomain: "reviews-1aeab.firebaseapp.com",
  projectId: "reviews-1aeab",
  databaseURL: "https://reviews-1aeab-default-rtdb.firebaseio.com/",
  storageBucket: "reviews-1aeab.firebasestorage.app",
  messagingSenderId: "789047344632",
  appId: "1:789047344632:web:a6a6a67621b20bc9e0ea0d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===== REVIEWS =====
export const fetchReviews = () => {
  const container = document.getElementById("reviews-container");
  const q = query(collection(db, "reviews"), orderBy("timestamp", "desc"));

  onSnapshot(q, (snapshot) => {
    container.innerHTML = "";
    if (snapshot.empty) {
      container.innerHTML = `<p style="color:var(--text3);font-family:var(--font-mono);font-size:.85rem;text-align:center;padding:2rem;">Belum ada komentar. Jadilah yang pertama!</p>`;
      return;
    }
    snapshot.forEach((docSnap) => {
      const d = docSnap.data();
      const stars = "★".repeat(Number(d.rating)) + "☆".repeat(5 - Number(d.rating));
      const date = d.timestamp?.seconds
        ? new Date(d.timestamp.seconds * 1000).toLocaleString("id-ID")
        : "Baru saja";

      const card = document.createElement("div");
      card.className = "review-card";
      card.innerHTML = `
        <div class="review-header">
          <span class="review-name">${escapeHtml(d.username)}</span>
          <span class="review-stars">${stars}</span>
        </div>
        <p class="review-text">${escapeHtml(d.review)}</p>
        <span class="review-date">${date}</span>
      `;
      container.appendChild(card);
    });
  });
};

export const addReview = async (username, rating, review) => {
  await addDoc(collection(db, "reviews"), {
    username, rating: Number(rating), review,
    timestamp: serverTimestamp()
  });
};

// ===== GALLERY =====
let currentTab = "sertif";

export const fetchGallery = (tab = "sertif") => {
  currentTab = tab;
  const grid = document.getElementById("galleryGrid");
  grid.innerHTML = `<div class="gallery-loading"><i class="fa-solid fa-spinner fa-spin"></i> Memuat foto...</div>`;

  const q = query(
    collection(db, "gallery"),
    orderBy("createdAt", "desc")
  );

  onSnapshot(q, (snapshot) => {
    grid.innerHTML = "";
    const items = [];
    snapshot.forEach(d => {
      const data = { id: d.id, ...d.data() };
      if (data.category === tab) items.push(data);
    });

    if (items.length === 0) {
      grid.innerHTML = `<div class="gallery-empty">Belum ada foto di kategori ini.</div>`;
      return;
    }

    items.forEach(item => {
      const div = document.createElement("div");
      div.className = "gallery-item";
      div.onclick = () => openLightbox(item.url);
      div.innerHTML = `
        <img src="${item.url}" alt="${escapeHtml(item.title)}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x600?text=Foto+tidak+tersedia'"/>
        <div class="gallery-item-label">${escapeHtml(item.title)}</div>
      `;
      grid.appendChild(div);
    });
  });
};

export const addGalleryItem = async (category, title, url) => {
  await addDoc(collection(db, "gallery"), {
    category, title, url,
    createdAt: serverTimestamp()
  });
};

export const deleteGalleryItem = async (id) => {
  await deleteDoc(doc(db, "gallery", id));
};

export const fetchManageList = (renderFn) => {
  const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
  onSnapshot(q, (snapshot) => {
    const items = [];
    snapshot.forEach(d => items.push({ id: d.id, ...d.data() }));
    renderFn(items);
  });
};

// ===== HELPERS =====
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function openLightbox(url) {
  const lb = document.getElementById("lightbox");
  const img = document.getElementById("lightboxImg");
  img.src = url;
  lb.classList.remove("hidden");
}

window.closeLightbox = () => {
  document.getElementById("lightbox").classList.add("hidden");
  document.getElementById("lightboxImg").src = "";
};

// Expose untuk main.js
window.firebaseAddReview = addReview;
window.firebaseAddGallery = addGalleryItem;
window.firebaseDeleteGallery = deleteGalleryItem;
window.firebaseFetchManage = fetchManageList;
window.firebaseFetchGallery = fetchGallery;
window.openLightbox = openLightbox;

// Auto init
document.addEventListener("DOMContentLoaded", () => {
  fetchReviews();
  fetchGallery("sertif");
});
