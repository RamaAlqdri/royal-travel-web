/* ===== Royal Travel — ROOM DETAIL Data Binder (NO HTML/STYLE CHANGE) ===== */
(() => {
  /* ====== CONFIG ====== */
  const API_BASE = window.APP_CONFIG?.API_BASE || "";
  const ROOM_ENDPOINT = (id) => `${API_BASE}/api/hotel-rooms/${id}?depth=2`;
  const HOTEL_ENDPOINT = (id) => `${API_BASE}/api/hotels/${id}?depth=1`;

  /* ====== HELPERS ====== */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const isAbs = (u) => /^https?:\/\//i.test(u);
  const mediaUrl = (m) => {
    if (!m) return "";
    const u =
      m?.sizes?.large?.url ||
      m?.sizes?.medium?.url ||
      m?.sizes?.small?.url ||
      m?.url ||
      m?.thumbnailURL ||
      "";
    return u ? (isAbs(u) ? u : API_BASE + u) : "";
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
  const currency = (n) => (n == null ? "" : Number(n).toLocaleString("en-US"));
  const fetchJSON = async (url) => {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`HTTP ${r.status} - ${url}`);
    return r.json();
  };
  const getRoomIdFromURL = () =>
    new URLSearchParams(location.search).get("roomId");

  /* ====== HERO IMAGE ====== */
  function setHeroImage(src) {
    const hero =
      document.querySelector(".hero.jarallax") ||
      document.querySelector(".hero");
    if (!hero || !src) return;
    let img = hero.querySelector(".jarallax-img");
    if (!img) {
      img = document.createElement("img");
      img.className = "jarallax-img";
      hero.prepend(img);
    }
    img.src = src;
    img.alt = "Room Hero";

    // fallback background supaya langsung terlihat
    hero.style.backgroundImage = `url('${src}')`;
    hero.style.backgroundSize = "cover";
    hero.style.backgroundPosition = "center";

    // re-init jarallax kalau ada
    try {
      if (window.jarallax && typeof window.jarallax === "function") {
        window.jarallax(hero, "destroy");
        window.jarallax(hero, { speed: 1 });
      }
    } catch {}
  }

  function bindGallery(images) {
    // Normalisasi: terima array mediaDoc ATAU {image: mediaDoc}
    const urls = (images || [])
      .map((m) => mediaUrl(m?.image || m))
      .filter(Boolean);

    const carousel = document.querySelector(
      ".owl-carousel.owl-theme.carousel_item_centered.kenburns.rounded-img"
    );
    const fsWrap = document.querySelector(
      ".bg_white.add_bottom_120 .text-center.mt-5"
    );
    const fsMain = document.querySelector(
      '.btn_1.outline[data-fslightbox="gallery_1"]'
    );

    // === OWL CAROUSEL ===
    if (carousel) {
      // Bangun HTML item sesuai data (tanpa placeholder)
      const html = urls
        .map((u) => `<div class="item"><img src="${u}" alt=""></div>`)
        .join("");

      if (window.jQuery && window.jQuery.fn && window.jQuery.fn.owlCarousel) {
        const $c = window.jQuery(carousel);

        // Jika sudah ter-init, pakai API replace & refresh
        if ($c.data("owl.carousel")) {
          $c.trigger("replace.owl.carousel", [html]).trigger(
            "refresh.owl.carousel"
          );
        } else {
          // Belum init: set HTML lalu init
          carousel.innerHTML = html;
          if (urls.length) {
            $c.owlCarousel({
              items: 1,
              loop: urls.length > 1,
              center: true,
              margin: 10,
              dots: true,
              nav: false,
              autoplay: false,
            });
          }
        }
      } else {
        // Tanpa jQuery/Owl: minimal set isi DOM saja
        carousel.innerHTML = html;
      }
    }

    // === FULLSCREEN (FsLightbox) ===
    if (fsWrap) {
      // arahkan tombol utama ke gambar pertama; kalau tidak ada data, sembunyikan tombol
      if (fsMain) {
        if (urls[0]) {
          fsMain.setAttribute("href", urls[0]);
          fsMain.style.display = ""; // pastikan terlihat
        } else {
          fsMain.style.display = "none";
        }
      }

      // Bersihkan semua anchor tambahan, lalu buat sesuai data (mulai dari index 1)
      fsWrap
        .querySelectorAll(
          'a[data-fslightbox="gallery_1"][data-type="image"]:not(.btn_1)'
        )
        .forEach((a) => a.remove());
      urls.slice(1).forEach((u) => {
        const a = document.createElement("a");
        a.setAttribute("data-fslightbox", "gallery_1");
        a.setAttribute("data-type", "image");
        a.href = u;
        fsWrap.appendChild(a);
      });

      // Refresh lightbox kalau lib sudah ada
      try {
        if (window.refreshFsLightbox) window.refreshFsLightbox();
      } catch (_) {}
    }
  }

  /* ====== TEXTS ====== */
  function bindRoomTexts(room, hotel) {
    // nama hotel kecil
    const hotelName = typeof hotel === "object" ? hotel?.name : "";
    const smallHotel = $(".hotel-name-placeholder");
    if (smallHotel)
      smallHotel.textContent = hotelName || "Luxury Hotel Experience";

    // judul/desc di hero
    const heroTitle = room?.name || room?.overview?.title_main || "";
    const heroDesc = toTextFromLexical(room?.overview?.description) || "";
    const price = currency(room?.price);

    const titleEl = $(".room-hero-title");
    if (titleEl) titleEl.textContent = heroTitle;

    const descEl = $(".room-hero-description");
    if (descEl && heroDesc) descEl.textContent = heroDesc;

    const priceEl = $(".room-hero-price");
    if (priceEl) priceEl.textContent = price ? `From $${price}/night` : "";

    // section overview
    const smallEl = $(".room-overview-title-small");
    if (smallEl) smallEl.textContent = room?.overview?.title_small || "";
    const mainEl = $(".room-overview-title-main");
    if (mainEl) mainEl.textContent = room?.overview?.title_main || heroTitle;

    const ovDesc = $(".room-overview-description");
    if (ovDesc)
      ovDesc.innerHTML = (
        toTextFromLexical(room?.overview?.description) || ""
      ).replace(/\n/g, "<br>");
  }

  /* ====== FACILITIES (ICON ONLY) ====== */
  /* ====== FACILITIES (ICON ONLY) ====== */
  const ICON_MAP = [
    { test: /king|double|bed/i, cls: "icon-hotel-double_bed_2" },
    { test: /safe|safety box/i, cls: "icon-hotel-safety_box" },
    { test: /balcony|patio/i, cls: "icon-hotel-patio" },
    { test: /tv/i, cls: "icon-hotel-tv" },
    { test: /disable|wheel/i, cls: "icon-hotel-disable" },
    { test: /bottle|welcome/i, cls: "icon-hotel-bottle" },
    { test: /wifi|netflix/i, cls: "icon-hotel-wifi" },
    { test: /dryer|hair/i, cls: "icon-hotel-hairdryer" },
    { test: /air\s?cond/i, cls: "icon-hotel-condition" },
    { test: /laundr/i, cls: "icon-hotel-loundry" },
  ];

  function pickIconClass(item) {
    const n = item?.name || item?.facility || "";
    const hit = ICON_MAP.find((m) => m.test.test(n));
    if (hit) return hit.cls; // auto-mapping MENANG
    if (item?.icon) return item.icon; // fallback: icon dari CMS
    return "icon-hotel-bottle";
  }

  function enableCuesIfHidden(ul) {
    if (!ul) return;

    // 1) lepas kunci plugin
    ul.removeAttribute("data-disabled");

    // 2) pastikan kelihatan walau plugin tidak re-init
    ul.style.opacity = "1";
    ul.style.visibility = "visible";
    ul.style.transform = "none";

    ul.querySelectorAll("li").forEach((li) => {
      li.style.opacity = "1";
      li.style.visibility = "visible";
      li.style.transform = "none";
    });

    // 3) coba re-init berbagai kemungkinan plugin yang dipakai tema
    try {
      if (window.scrollCue && typeof window.scrollCue.update === "function") {
        window.scrollCue.update();
      } else if (window.Common && typeof window.Common.cueInit === "function") {
        window.Common.cueInit();
      } else if (window.Cue && typeof window.Cue.refresh === "function") {
        window.Cue.refresh();
      }
    } catch (_) {}
  }

  // -- letakkan menggantikan renderRoomFacilities() lama
  function renderRoomFacilities(list = []) {
    const ul = document.querySelector(".room_facilities_list ul");
    if (!ul) return;

    // Jika CMS kosong, biarkan default HTML
    if (!Array.isArray(list) || list.length === 0) {
      console.debug(
        "[room-detail] no room facilities in CMS — keep default HTML"
      );
      // tapi tetap pastikan UL tidak 'disabled' agar defaultnya terlihat
      enableCuesIfHidden(ul);
      return;
    }

    // Render dari CMS
    ul.innerHTML = "";
    list.forEach((f) => {
      const label = f?.name || f?.facility || "";
      if (!label) return;
      const li = document.createElement("li");
      li.innerHTML = `<i class="${pickIconClass(f)}"></i> ${label}`;
      ul.appendChild(li);
    });

    // pastikan tampil
    enableCuesIfHidden(ul);
    console.log("[room-detail] facilities rendered:", list);
  }

  /* ====== REVIEWS (opsional, jika ada di CMS) ====== */
  function renderReviews(reviews = []) {
    if (!reviews.length) return;
    const col = document.querySelector("#reviews .col-lg-7.order-lg-1");
    if (!col) return;
    col.innerHTML = ""; // replace konten dummy

    reviews.forEach((rv) => {
      const rating = Number(rv?.rating ?? 0).toFixed(1);
      const dateStr = rv?.publishedAt
        ? new Date(rv.publishedAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "";
      const avatar = mediaUrl(rv?.avatar) || "img/avatar.jpg";
      const title = rv?.title || "";
      const body = toTextFromLexical(rv?.body) || "";

      const card = document.createElement("div");
      card.className = "review_card";
      card.innerHTML = `
        <div class="row">
          <div class="col-md-2 user_info">
            <figure><img src="${avatar}" alt=""></figure>
            <h5>${rv?.authorName || ""}</h5>
          </div>
          <div class="col-md-10 review_content">
            <div class="clearfix mb-3">
              <span class="rating">${rating}<small>/10</small> <strong>Rating average</strong></span>
              <em>${dateStr ? `Published ${dateStr}` : ""}</em>
            </div>
            <h4>${title ? `"${title}"` : ""}</h4>
            <p>${body}</p>
          </div>
        </div>`;
      col.appendChild(card);
    });
  }

  /* ====== MAIN LOAD ====== */
  async function load() {
    const roomId = getRoomIdFromURL();
    if (!roomId) throw new Error("roomId missing in URL");

    // Ambil room
    const room = await fetchJSON(ROOM_ENDPOINT(roomId));

    // Pastikan hotel ada (kalau parentHotel masih ID)
    let hotel = room?.parentHotel;
    if (hotel && typeof hotel === "string") {
      hotel = await fetchJSON(HOTEL_ENDPOINT(hotel));
    }

    // Hero image (prioritas room, fallback hotel)
    const heroSrc =
      mediaUrl(room?.media?.hero) || mediaUrl(hotel?.media?.hero) || "";
    if (heroSrc) setHeroImage(heroSrc);

    // Teks
    bindRoomTexts(room, hotel);

    // Facilities
    renderRoomFacilities(room?.facilities || []);

    // Gallery
    const galleryItems = (room?.media?.gallery || [])
      .map((g) => g?.image)
      .filter(Boolean);
    bindGallery(galleryItems);

    // Reviews (jika ada di CMS)
    renderReviews(room?.reviews || []);

    // ...di akhir fungsi load() setelah room & hotel sukses diambil
    const bookBtn = document.querySelector("a.floating-cart-btn");
    if (bookBtn && room?.id) {
      const hid = (typeof hotel === "object" ? hotel?.id : hotel) || "";
      bookBtn.href = `hotel-booking.html?hotelId=${encodeURIComponent(
        hid
      )}&roomId=${encodeURIComponent(room.id)}`;
    }

    // <title>
    try {
      if (room?.name) document.title = `${room.name} — Royal Travel Agency`;
    } catch {}
  }

  document.addEventListener("DOMContentLoaded", () => {
    load().catch((err) => {
      console.error("[room-detail] Error:", err);
      const t = $(".room-hero-title");
      if (t) t.textContent = "Room not found";
      const d = $(".room-hero-description");
      if (d) d.textContent = "";
    });
  });
})();
