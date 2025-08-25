// ===== Royal Travel - Hotel Detail Data Binder (NO HTML/STYLE CHANGE) =====
(() => {
  // ===== CONFIG =====
  const API_BASE = window.APP_CONFIG?.API_BASE || "";
  // depth=2 agar upload di dalam array facilities ikut ter-populate
  const HOTEL_ENDPOINT = (id) => `${API_BASE}/api/hotels/${id}?depth=2`;
  const ROOMS_ENDPOINT = (hotelId) =>
    `${API_BASE}/api/hotel-rooms?where[parentHotel][equals]=${encodeURIComponent(
      hotelId
    )}&depth=1&limit=50&sort=price`;

  // ===== HELPERS =====
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const isAbs = (u) => /^https?:\/\//i.test(u);

  const mediaUrl = (m) => {
    if (!m) return "";
    const u =
      m?.sizes?.medium?.url ||
      m?.sizes?.small?.url ||
      m?.url ||
      m?.thumbnailURL ||
      "";
    if (!u) return "";
    return isAbs(u) ? u : API_BASE + u;
  };

  const toTextFromLexical = (lex) => {
    try {
      const paras = lex?.root?.children || [];
      return paras
        .map((p) => (p.children || []).map((t) => t.text || "").join(" "))
        .join("\n");
    } catch {
      return "";
    }
  };

  const setText = (sel, val) => {
    const el = $(sel);
    if (el && typeof val === "string") el.textContent = val;
  };

  const currency = (n) => {
    if (n == null) return "";
    try {
      return Number(n).toLocaleString("en-US");
    } catch {
      return String(n);
    }
  };

  async function fetchJSON(url) {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`HTTP ${r.status} - ${url}`);
    return r.json();
  }

  function getHotelIdFromURL() {
    const sp = new URLSearchParams(window.location.search);
    return sp.get("id") || sp.get("hotelId") || "1";
  }

  // ===== HERO IMAGE =====
  function setHeroImage(hotel) {
    const section = $("section.hero.jarallax") || $("section.hero");
    if (!section) return;

    const src = mediaUrl(hotel?.media?.hero);
    if (!src) return;

    let img = section.querySelector(".jarallax-img");
    if (!img) {
      img = document.createElement("img");
      img.className = "jarallax-img";
      section.prepend(img);
    }
    img.src = src;
    img.alt = hotel?.name || "Hero";

    // fallback background inline supaya tetap tampak walau jarallax belum re-init
    section.style.backgroundImage = `url('${src}')`;
    section.style.backgroundSize = "cover";
    section.style.backgroundPosition = "center";

    // optional re-init jarallax bila tersedia
    try {
      if (window.jarallax && typeof window.jarallax === "function") {
        window.jarallax(section, "destroy");
        window.jarallax(section, { speed: 1 });
      }
    } catch (_) {}
  }

  // ===== OVERVIEW IMAGES =====
  function fillOverviewImages(hotel) {
    const imgs = $$("#overviewImagesContainer img");
    if (!imgs.length) return;

    const sources = [
      mediaUrl(hotel?.media?.overview_1),
      mediaUrl(hotel?.media?.overview_2),
      mediaUrl(hotel?.media?.overview_3),
    ];

    imgs.forEach((imgEl, i) => {
      const s = sources[i];
      if (s) {
        imgEl.src = s;
        imgEl.setAttribute("onerror", "this.src='img/resort/default-3.jpg'");
      }
    });
  }

  // ===== FACILITIES =====
  function findFacilitiesRow() {
    const section = $$("section.bg_gray.pattern").find((sec) => {
      const title = sec.querySelector("h2");
      return title && /resort\s+facilities/i.test(title.textContent || "");
    });
    if (!section) return null;
    return section.querySelector(".row.mt-5");
  }

  // pakai gambar upload jika ada; jika tidak, fallback ke default berdasarkan nama
  function resolveFacilityImage(facilityItem) {
    const uploaded = mediaUrl(facilityItem?.image);
    if (uploaded) return uploaded;
    const name = (facilityItem?.facility || "").toLowerCase();
    if (name.includes("pool")) return "img/facilities/pool.jpg";
    if (name.includes("spa")) return "img/facilities/spa.jpg";
    if (name.includes("dining") || name.includes("restaurant"))
      return "img/facilities/dining.jpg";
    if (name.includes("beach")) return "img/facilities/beach.jpg";
    if (name.includes("concierge")) return "img/facilities/concierge.jpg";
    if (name.includes("activity") || name.includes("activities"))
      return "img/facilities/activities.jpg";
    return "img/facilities/concierge.jpg";
  }

  function renderFacilities(list = []) {
    const row = findFacilitiesRow();
    if (!row) return;

    row.innerHTML = "";

    if (!list.length) {
      const empty = document.createElement("div");
      empty.className = "col-12 text-center text-muted";
      empty.innerHTML = "<p>No facilities listed.</p>";
      row.appendChild(empty);
      return;
    }

    list.forEach((item) => {
      const imgSrc = resolveFacilityImage(item);
      const title = item?.facility || "";
      const col = document.createElement("div");
      col.className = "col-lg-4 col-md-6 mb-4";
      col.innerHTML = `
        <div class="card h-100 border-0 shadow-sm rounded-3 overflow-hidden">
          <div class="position-relative facility-card">
            <img src="${imgSrc}" class="card-img-top" alt="${title}">
            <div class="facility-overlay d-flex flex-column justify-content-end p-4">
              <h3 class="text-white mb-2">${title}</h3>
              <p class="text-white mb-0"></p>
            </div>
          </div>
        </div>
      `;
      row.appendChild(col);
    });
  }

  // ===== ROOMS =====
  function renderRoomCard(room) {
    const price = currency(room?.price);
    const img = mediaUrl(room?.media?.hero) || "img/rooms/1.jpg";

    // build URL ke hotel-detail.html + query ?roomId=<id>
    const detailURL = new URL("hotel-detail.html", window.location.href);
    if (room?.id) detailURL.searchParams.set("roomId", room.id);

    const col = document.createElement("div");
    col.className = "col-md-6";
    col.innerHTML = `
    <a href="${detailURL.toString()}" class="box_cat_rooms">
      <figure>
        <div class="background-image" data-background="url(${img})" style="background-image:url('${img}')"></div>
      </figure>
      <div class="info">
        <small>${price ? `From $${price}/night` : ""}</small>
        <h3>${room?.name || ""}</h3>
        <span>View Details</span>
      </div>
    </a>
  `;
    return col;
  }

  function renderRooms(rooms = []) {
    const section = $("#rooms_section");
    if (!section) return;
    const row = section.querySelector(".row");
    if (!row) return;

    row.innerHTML = "";

    if (!rooms.length) {
      const empty = document.createElement("div");
      empty.className = "col-12 text-center text-muted";
      empty.innerHTML = "<p>No rooms available.</p>";
      row.appendChild(empty);
      return;
    }

    rooms.forEach((r) => row.appendChild(renderRoomCard(r)));

    // jika theme punya inisialisasi ulang untuk data-background
    if (window.Common && typeof window.Common.initBackground === "function") {
      window.Common.initBackground();
    }
  }

  // ===== LOAD FLOW =====
  async function load() {
    const id = getHotelIdFromURL();

    // 1) HOTEL DETAIL
    const hotel = await fetchJSON(HOTEL_ENDPOINT(id));

    // teks hero & overview
    setText(".hotel-hero-title", hotel?.name || "");
    setText(".hotel-hero-description", hotel?.short_description || "");
    setText(".hotel-overview-caption", hotel?.overview?.caption || "");
    setText(".hotel-overview-title", hotel?.overview?.title || "");
    setText(".hotel-overview-subtitle", hotel?.overview?.subtitle || "");
    setText(
      ".hotel-overview-description",
      toTextFromLexical(hotel?.overview?.description) || ""
    );

    // gambar hero
    setHeroImage(hotel);

    // overview images
    fillOverviewImages(hotel);

    // facilities (pakai upload jika ada)
    renderFacilities(hotel?.facilities || []);

    // 2) ROOMS
    const roomsPayload = await fetchJSON(ROOMS_ENDPOINT(id));
    renderRooms(roomsPayload?.docs || []);
  }

  document.addEventListener("DOMContentLoaded", () => {
    load().catch((err) => {
      console.error("[hotel-detail] Error:", err);
      setText(".hotel-hero-title", "Hotel not found");
      setText(".hotel-hero-description", "");
    });
  });
})();
