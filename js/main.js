// ===== THEME TOGGLE =====
const html = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

const savedTheme = localStorage.getItem("theme") || "dark";
html.setAttribute("data-theme", savedTheme);
updateThemeIcon(savedTheme);

themeToggle.addEventListener("click", () => {
  const current = html.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  html.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
  updateThemeIcon(next);
});

function updateThemeIcon(theme) {
  themeIcon.className = theme === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
}

// ===== NAVBAR SCROLL =====
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 60);
});

// ===== HAMBURGER =====
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobileMenu");
hamburger.addEventListener("click", () => {
  mobileMenu.classList.toggle("open");
});
mobileMenu.querySelectorAll("a").forEach(a => {
  a.addEventListener("click", () => mobileMenu.classList.remove("open"));
});

// ===== GALLERY TABS =====
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    if (window.firebaseFetchGallery) {
      window.firebaseFetchGallery(btn.dataset.tab);
    }
  });
});

// ===== STAR RATING =====
const stars = document.querySelectorAll("#starRating span");
const ratingInput = document.getElementById("rating");
let selectedRating = 5;

// Default semua bintang aktif
stars.forEach(s => s.classList.add("active"));

stars.forEach(star => {
  star.addEventListener("mouseenter", () => {
    const val = Number(star.dataset.val);
    stars.forEach(s => s.classList.toggle("active", Number(s.dataset.val) <= val));
  });
  star.addEventListener("mouseleave", () => {
    stars.forEach(s => s.classList.toggle("active", Number(s.dataset.val) <= selectedRating));
  });
  star.addEventListener("click", () => {
    selectedRating = Number(star.dataset.val);
    ratingInput.value = selectedRating;
    stars.forEach(s => s.classList.toggle("active", Number(s.dataset.val) <= selectedRating));
  });
});

// ===== COMMENT FORM =====
document.getElementById("reviewForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector("button[type=submit]");
  const username = document.getElementById("name").value.trim();
  const rating = document.getElementById("rating").value;
  const review = document.getElementById("message").value.trim();

  if (!username || !review) return;

  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengirim...';

  try {
    await window.firebaseAddReview(username, rating, review);
    e.target.reset();
    selectedRating = 5;
    ratingInput.value = 5;
    stars.forEach(s => s.classList.add("active"));
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Terkirim!';
    setTimeout(() => {
      btn.innerHTML = 'Kirim <i class="fa-solid fa-paper-plane"></i>';
      btn.disabled = false;
    }, 2000);
  } catch (err) {
    console.error(err);
    btn.innerHTML = 'Gagal. Coba lagi.';
    btn.disabled = false;
  }
});

// ===== EXPERIENCE DATA =====
// Ganti/tambah data magang kamu di sini
const experiences = [
  {
    company: "PT. TELKOM INDONESIA",
    role: "Network Engineer Intern",
    period: "Juli – September 2024",
    desc: "Melakukan konfigurasi jaringan, monitoring trafik, dan maintenance infrastruktur jaringan perusahaan. Belajar routing OSPF dan konfigurasi VLAN pada perangkat Cisco.",
    tags: ["Cisco", "OSPF", "VLAN", "Network Monitoring"]
  },
  {
    company: "CV. DIGITAL CREATIVE",
    role: "Web Developer Intern",
    period: "Oktober – Desember 2024",
    desc: "Membantu pengembangan website company profile dan landing page untuk klien. Menggunakan HTML, CSS, JavaScript, dan berkolaborasi dengan tim menggunakan Git.",
    tags: ["HTML", "CSS", "JavaScript", "Git"]
  }
  // Tambah data magang lain di sini
];

const timeline = document.getElementById("expTimeline");
experiences.forEach((exp, i) => {
  const card = document.createElement("div");
  card.className = "exp-card";
  card.style.animationDelay = `${i * 0.1}s`;
  card.innerHTML = `
    <div class="exp-dot">${i + 1}</div>
    <div class="exp-body">
      <div class="exp-meta">
        <span class="exp-company">${exp.company}</span>
        <span class="exp-period">${exp.period}</span>
      </div>
      <div class="exp-role">${exp.role}</div>
      <p class="exp-desc">${exp.desc}</p>
      <div class="exp-tags">${exp.tags.map(t => `<span class="exp-tag">${t}</span>`).join("")}</div>
    </div>
  `;
  timeline.appendChild(card);
});

// ===== ADMIN PANEL =====
const ADMIN_PASSWORD = "raka2025"; // Ganti password kamu di sini

const adminOverlay = document.getElementById("adminOverlay");
const adminClose = document.getElementById("adminClose");
const adminLogin = document.getElementById("adminLogin");
const adminDashboard = document.getElementById("adminDashboard");
const adminLoginBtn = document.getElementById("adminLoginBtn");
const adminPass = document.getElementById("adminPass");
const loginError = document.getElementById("loginError");
let adminLoggedIn = false;

adminClose.addEventListener("click", () => {
  adminOverlay.classList.add("hidden");
});

adminLoginBtn.addEventListener("click", () => {
  if (adminPass.value === ADMIN_PASSWORD) {
    adminLoggedIn = true;
    adminLogin.classList.add("hidden");
    adminDashboard.classList.remove("hidden");
    loginError.classList.add("hidden");
    loadManageList();
  } else {
    loginError.classList.remove("hidden");
    adminPass.value = "";
  }
});

adminPass.addEventListener("keydown", e => {
  if (e.key === "Enter") adminLoginBtn.click();
});

// Admin Tabs
document.querySelectorAll(".admin-tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".admin-tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".admin-tab-content").forEach(c => c.classList.add("hidden"));
    document.getElementById(`atab-${btn.dataset.atab}`).classList.remove("hidden");
    if (btn.dataset.atab === "manage") loadManageList();
  });
});

// Upload foto
document.getElementById("uploadBtn").addEventListener("click", async () => {
  const category = document.getElementById("uploadCategory").value;
  const title = document.getElementById("uploadTitle").value.trim();
  const url = document.getElementById("uploadUrl").value.trim();
  const msg = document.getElementById("uploadMsg");

  if (!title || !url) {
    msg.textContent = "Judul dan URL wajib diisi!";
    msg.className = "error";
    msg.classList.remove("hidden");
    return;
  }

  try {
    await window.firebaseAddGallery(category, title, url);
    msg.textContent = "✓ Foto berhasil ditambahkan!";
    msg.className = "success";
    msg.classList.remove("hidden");
    document.getElementById("uploadTitle").value = "";
    document.getElementById("uploadUrl").value = "";
    setTimeout(() => msg.classList.add("hidden"), 3000);
  } catch (err) {
    msg.textContent = "Gagal menyimpan. Cek koneksi.";
    msg.className = "error";
    msg.classList.remove("hidden");
  }
});

// Manage list
function loadManageList() {
  const list = document.getElementById("manageList");
  list.innerHTML = `<p style="color:var(--text3);font-size:.85rem;">Memuat...</p>`;

  window.firebaseFetchManage((items) => {
    list.innerHTML = "";
    if (items.length === 0) {
      list.innerHTML = `<p style="color:var(--text3);font-size:.85rem;text-align:center;">Belum ada foto.</p>`;
      return;
    }
    items.forEach(item => {
      const div = document.createElement("div");
      div.className = "manage-item";
      div.innerHTML = `
        <img src="${item.url}" alt="${item.title}" onerror="this.style.display='none'"/>
        <div class="manage-item-info">
          <p>${item.title}</p>
          <small>${item.category === "sertif" ? "Sertifikat" : "Project"}</small>
        </div>
        <button class="manage-item-del" title="Hapus"><i class="fa-solid fa-trash"></i></button>
      `;
      div.querySelector(".manage-item-del").addEventListener("click", async () => {
        if (!confirm(`Hapus foto "${item.title}"?`)) return;
        await window.firebaseDeleteGallery(item.id);
      });
      list.appendChild(div);
    });
  });
}

// ===== SCROLL ANIMATION =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.animation = "fadeUp 0.6s ease both";
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll(".skill-card, .exp-card, .review-card").forEach(el => {
  observer.observe(el);
});
