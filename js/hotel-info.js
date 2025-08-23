document.addEventListener("DOMContentLoaded", async () => {
  const API_BASE = window.APP_CONFIG?.API_BASE || "";
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    alert("ID hotel tidak ditemukan di URL");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/hotels/${id}?depth=2`);
    const { doc: hotel } = await res.json();

    if (!hotel) {
      alert("Data hotel tidak ditemukan.");
      return;
    }

    // === Hero Section ===
    document.getElementById("hotel-title").textContent = hotel.name;
    document.getElementById("hotel-short-description").textContent = hotel.short_description || "";
    if (hotel.media?.hero?.url) {
      document.getElementById("hero-image").src = API_BASE + hotel.media.hero.url;
    }

    // === Overview Section ===
    document.getElementById("overview-title").textContent = hotel.overview?.title || "";
    document.getElementById("overview-subtitle").textContent = hotel.overview?.subtitle || "";
    document.getElementById("overview-caption").textContent = hotel.overview?.caption || "";

    // Lexical Description
    const overviewDescContainer = document.getElementById("overview-description");
    const desc = hotel.overview?.description?.root?.children?.[0]?.children?.[0]?.text || "";
    overviewDescContainer.innerHTML = `<p>${desc}</p>`;

    // Overview Images
    const imageContainer = document.getElementById("overview-images");
    const images = [
      hotel.media?.overview_1?.url,
      hotel.media?.overview_2?.url,
      hotel.media?.overview_3?.url
    ].filter(Boolean);
    images.forEach((imgUrl) => {
      const img = document.createElement("img");
      img.src = API_BASE + imgUrl;
      img.style.width = "30%";
      img.style.marginRight = "10px";
      imageContainer.appendChild(img);
    });

    // === Facilities ===
    const facilityList = document.getElementById("facility-list");
    hotel.facilities?.forEach((f) => {
      const li = document.createElement("li");
      li.textContent = f.facility;
      facilityList.appendChild(li);
    });

  } catch (err) {
    console.error("Gagal memuat data:", err);
  }
});
