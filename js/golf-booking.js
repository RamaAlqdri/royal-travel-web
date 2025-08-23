/* Royal Travel — Golf Booking (Payload + fallback lokal)
 * - Baca ?id= / ?slug= / ?course= / ?golf=
 * - Jika param non-numeric → perlakukan sebagai slug lebih dulu
 * - Coba bySlug (depth=1), kalau gagal coba byId (depth=1), terakhir fetch list & filter
 * - Paket: ambil dari golf-packages (parentCourse), fallback ke pricing lokal (golf-data.js)
 * - Aman jika tee time disembunyikan
 */
(function ($) {
  "use strict";

  // ========= CONFIG =========
  const API_BASE = window.APP_CONFIG?.API_BASE || "";

  const API = {
    courseById: (id) =>
      `${API_BASE}/api/golf-courses/${encodeURIComponent(id)}?depth=1`,
    courseBySlug: (slug) =>
      `${API_BASE}/api/golf-courses?where[slug][equals]=${encodeURIComponent(
        slug
      )}&depth=1&limit=1`,
    courseList: () =>
      `${API_BASE}/api/golf-courses?depth=0&limit=200&sort=-updatedAt`,
    pkgsByCourse: (cid) =>
      `${API_BASE}/api/golf-packages?where[parentCourse][equals]=${encodeURIComponent(
        cid
      )}&sort=order&depth=1&limit=100`,
  };

  // ========= UTILS =========
  const getParam = (k) => new URLSearchParams(location.search).get(k) || "";
  const looksNumeric = (s) => /^\d+$/.test(String(s || ""));
  const isAbs = (u) => /^https?:\/\//i.test(u);

  async function fetchJSON(url) {
    const r = await fetch(url, { credentials: "include" });
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
    return r.json();
  }

  function mediaUrl(m) {
    if (!m) return "";
    const url =
      m?.sizes?.og?.url ||
      m?.sizes?.large?.url ||
      m?.sizes?.medium?.url ||
      m?.sizes?.small?.url ||
      m?.thumbnailURL ||
      m?.url ||
      (typeof m === "string" ? m : "");
    return url ? (isAbs(url) ? url : API_BASE + url) : "";
  }

  function pickHero(course) {
    return (
      mediaUrl(course?.media?.hero) ||
      course?.hero?.backgroundImage ||
      "img/golf/golf-detail-hero.jpg"
    );
  }

  function fmtMoney(n, ccy = "USD") {
    if (typeof n !== "number" || !isFinite(n)) return "-";
    const locale = ccy === "IDR" ? "id-ID" : "en-US";
    const max = ccy === "IDR" ? 0 : 0;
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: ccy,
        maximumFractionDigits: max,
      }).format(n);
    } catch {
      if (ccy === "IDR") return "Rp " + Number(n).toLocaleString("id-ID");
      return "$" + Number(n).toLocaleString();
    }
  }

  function parsePriceString(s) {
    if (!s) return 0;
    return parseInt(String(s).replace(/[^0-9]/g, ""), 10) || 0;
  }

  function unitLabel(u) {
    const map = {
      per_person: "per person",
      per_hour: "per hour",
      per_round: "per round",
      per_group: "per group",
      contact: "Contact us",
    };
    return map[u || "per_person"] || "";
  }

  function reinitJarallax() {
    try {
      if (window.jarallax && typeof window.jarallax === "function") {
        window.jarallax(document.querySelectorAll(".jarallax"), { speed: 0.2 });
      } else if ($.fn.jarallax) {
        $(".jarallax").jarallax("destroy");
        $(".jarallax").jarallax();
      }
    } catch {}
  }

  // ========= LOADERS =========
  async function loadCourseHybrid() {
    // terima banyak alias query param
    const q =
      getParam("slug") ||
      getParam("course") ||
      getParam("golf") ||
      getParam("id") ||
      "";
    if (!q) return null;

    // 1) Kalau q non-numeric → anggap slug dulu
    if (!looksNumeric(q)) {
      try {
        const rs = await fetchJSON(API.courseBySlug(q));
        if (rs?.docs?.[0]) return rs.docs[0];
      } catch (e) {
        console.warn("[golf-booking] slug fetch failed:", e);
      }
      // kalau slug gagal, coba byId (barangkali ada docId string non-numeric)
      try {
        const ri = await fetchJSON(API.courseById(q));
        if (ri?.id) return ri;
      } catch (e) {
        console.warn("[golf-booking] id fetch (from slug ref) failed:", e);
      }
    } else {
      // 2) Kalau q numeric → coba byId dulu
      try {
        const ri = await fetchJSON(API.courseById(q));
        if (ri?.id) return ri;
      } catch (e) {
        console.warn("[golf-booking] id fetch failed:", e);
      }
    }

    // 3) Fallback: fetch list & cari matching (slug==q OR id==q OR name contains)
    try {
      const list = await fetchJSON(API.courseList());
      const docs = Array.isArray(list?.docs) ? list.docs : [];
      const found =
        docs.find(
          (d) => String(d?.slug || "").toLowerCase() === String(q).toLowerCase()
        ) ||
        docs.find((d) => String(d?.id) === String(q)) ||
        docs.find((d) =>
          (d?.name || "").toLowerCase().includes(String(q).toLowerCase())
        );
      if (found) {
        // kalau kita dapat dokumen dari depth=0, ambil yang lengkap lagi (depth=1) by id
        try {
          const full = await fetchJSON(API.courseById(found.id));
          if (full?.id) return full;
        } catch {
          return found;
        }
      }
    } catch (e) {
      console.warn("[golf-booking] list fallback failed:", e);
    }

    // 4) Terakhir: fallback ke data lokal (hanya jika q numeric yang cocok ke data lokal)
    if (typeof window.getGolfCourseById === "function" && looksNumeric(q)) {
      try {
        const local = window.getGolfCourseById(q);
        if (local) return local;
      } catch {}
    }

    return null;
  }

  async function loadPackages(courseId) {
    if (!courseId) return [];
    try {
      const r = await fetchJSON(API.pkgsByCourse(courseId));
      return Array.isArray(r?.docs) ? r.docs : [];
    } catch (e) {
      console.warn("[golf-booking] packages fetch failed:", e);
      return [];
    }
  }

  // ========= RENDER =========
  let currentCourse = null;

  function renderHeaderAndSummary() {
    const title =
      currentCourse?.hero?.title ||
      currentCourse?.name ||
      "Golf Course Booking";
    const loc = currentCourse?.hero?.location || "N/A";
    const hero = pickHero(currentCourse);

    $("#bookingCourseName").text(title);
    $("#golfCourse").val(currentCourse?.name || title || "N/A");
    $("#location").val(loc);

    $("#summaryCourseName").text(currentCourse?.name || title || "N/A");
    $("#summaryCourseLocation").text(loc);
    $("#bookingHeroImage").attr("src", hero);
    $("#summaryCourseImage").attr("src", hero);

    reinitJarallax();
  }

  function renderPackagesUI(pkgsPayload, pkgsLocal) {
    const $wrap = $("#packageOptionsContainer");
    $wrap.empty();

    if (pkgsPayload?.length) {
      pkgsPayload
        .slice()
        .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
        .forEach((p, i) => {
          const isContact = p.unit === "contact" || p.price == null;
          const unit = unitLabel(p.unit);
          const priceStr = isContact
            ? "Contact us"
            : `${fmtMoney(Number(p.price || 0), p.currency || "USD")} ${unit}`;
          const dataPrice = isContact
            ? ""
            : `data-price-raw="${Number(p.price)}" data-ccy="${
                p.currency || "USD"
              }"`;
          const notes = p.notes
            ? `<div class="text-muted" style="font-size:13px">${p.notes}</div>`
            : "";

          $wrap.append(`
            <div class="package-option ${
              i === 0 ? "selected" : ""
            }" ${dataPrice} data-unit="${p.unit || "per_person"}" data-name="${(
            p.package || "Golf Package"
          ).replace(/"/g, "&quot;")}">
              <div class="package-header">
                <h5>${p.package || "Golf Package"}</h5>
                <div class="package-price">${priceStr}</div>
              </div>
              ${notes}
            </div>
          `);
        });
    } else if (Array.isArray(pkgsLocal) && pkgsLocal.length) {
      pkgsLocal.forEach((pkg, i) => {
        const raw = parsePriceString(pkg.price);
        $wrap.append(`
          <div class="package-option ${
            i === 0 ? "selected" : ""
          }" data-price-raw="${raw}" data-ccy="USD" data-unit="per_person" data-name="${(
          pkg.package || "Golf Package"
        ).replace(/"/g, "&quot;")}">
            <div class="package-header">
              <h5>${pkg.package || "Golf Package"}</h5>
              <div class="package-price">${pkg.price} per person</div>
            </div>
          </div>
        `);
      });
    } else {
      $wrap.html("<p>No pricing packages available for this course.</p>");
    }

    $wrap.off("click.pkg").on("click.pkg", ".package-option", function () {
      $wrap.find(".package-option").removeClass("selected");
      $(this).addClass("selected");
      updateBookingSummary();
    });
  }

  function selectedPkgEl() {
    return $("#packageOptionsContainer .package-option.selected");
  }

  function updateBookingSummary() {
    const $p = selectedPkgEl();
    if (!$p.length) {
      $(
        "#packageValue,#rateValue,#playersValue,#packageSubtotalValue,#additionalServicesValue,#taxesValue,#totalValue"
      ).text("-");
      return;
    }
    const name = $p.find("h5").text() || $p.data("name") || "Golf Package";
    const players = Math.min(
      Math.max(parseInt($("#playerCount").val(), 10) || 1, 1),
      4
    );
    const pricePer = Number($p.data("price-raw")) || 0;
    const ccy = $p.data("ccy") || "USD";

    // Optional services (aman meskipun input tidak ada di DOM)
    let add = 0;
    if ($("#clubRental").length && $("#clubRental").is(":checked"))
      add += 50000 * players;
    if ($("#caddyService").length && $("#caddyService").is(":checked"))
      add += 30000 * players;
    if ($("#golfLesson").length && $("#golfLesson").is(":checked"))
      add += 200000;
    if ($("#luxuryTransfer").length && $("#luxuryTransfer").is(":checked"))
      add += 75000;
    if ($("#lunchPackage").length && $("#lunchPackage").is(":checked"))
      add += 40000 * players;

    const subtotal = pricePer * players;
    const taxes = Math.round((subtotal + add) * 0.1);
    const total = subtotal + add + taxes;

    $("#packageValue").text(name);
    $("#rateValue").text(pricePer ? fmtMoney(pricePer, ccy) : "-");
    $("#playersValue").text(players);
    $("#packageSubtotalValue").text(pricePer ? fmtMoney(subtotal, ccy) : "-");
    $("#additionalServicesValue").text(fmtMoney(add, "IDR"));
    $("#taxesValue").text(
      pricePer ? fmtMoney(taxes, ccy) : fmtMoney(Math.round(add * 0.1), "IDR")
    );
    $("#totalValue").text(
      pricePer
        ? fmtMoney(total, ccy)
        : fmtMoney(add + Math.round(add * 0.1), "IDR")
    );
  }

  // ========= FORM / UI =========
  function bindQty() {
    $(".qtyplus")
      .off("click")
      .on("click", function () {
        const v = parseInt($("#playerCount").val(), 10) || 1;
        if (v < 4) $("#playerCount").val(v + 1);
        updateBookingSummary();
      });
    $(".qtyminus")
      .off("click")
      .on("click", function () {
        const v = parseInt($("#playerCount").val(), 10) || 1;
        if (v > 1) $("#playerCount").val(v - 1);
        updateBookingSummary();
      });
    $("#playerCount").off("change").on("change", updateBookingSummary);
  }

  function initPickersAndUser() {
    try {
      $(".datepicker").datepicker({
        format: "mm/dd/yyyy",
        autoclose: true,
        todayHighlight: true,
        startDate: new Date(),
      });
      const tmr = new Date();
      tmr.setDate(tmr.getDate() + 1);
      $("#golfDate").datepicker("setDate", tmr);
    } catch {}

    if ($(".timepicker").length) {
      try {
        $(".timepicker").timepicker({
          timeFormat: "h:i A",
          interval: 30,
          minTime: "6:00am",
          maxTime: "6:00pm",
          dynamic: false,
          dropdown: true,
          scrollbar: true,
        });
      } catch {}
    }

    try {
      if (window.BookingUserInfo?.autofill) window.BookingUserInfo.autofill();
      if (window.BookingUserInfo?.setupForm)
        window.BookingUserInfo.setupForm("#bookingForm");
    } catch {}
  }

  function optionalTeeTime() {
    return $("#teeTime").length ? $("#teeTime").val() || "" : "";
  }

  function getSummaryTotalNumber() {
    return parsePriceString($("#totalValue").text() || "");
  }

  function handleSubmit() {
    $("#bookingForm")
      .off("submit")
      .on("submit", function (e) {
        e.preventDefault();
        if (!currentCourse) {
          alert("Cannot add to cart: Course data is not loaded.");
          return;
        }
        const $p = selectedPkgEl();
        if (!$p.length) {
          alert("Please select a package.");
          return;
        }
        const firstName = ($("#firstName").val() || "").trim();
        const lastName = ($("#lastName").val() || "").trim();
        const email = ($("#email").val() || "").trim();
        const phone = ($("#phone").val() || "").trim();
        const golfDate = $("#golfDate").val();
        const teeTime = optionalTeeTime();

        if (!firstName || !lastName || !email || !phone || !golfDate) {
          alert("Please fill in all required fields.");
          return;
        }

        try {
          if (window.BookingUserInfo?.save) {
            window.BookingUserInfo.save({ firstName, lastName, email, phone });
          }
        } catch {}

        const players = Math.min(
          Math.max(parseInt($("#playerCount").val(), 10) || 1, 1),
          4
        );
        const packageName =
          $p.find("h5").text() || $p.data("name") || "Golf Package";
        const pricePer = Number($p.data("price-raw")) || 0;
        const ccy = $p.data("ccy") || "USD";
        const subtotal = pricePer * players;

        let add = 0;
        if ($("#clubRental").length && $("#clubRental").is(":checked"))
          add += 50000 * players;
        if ($("#caddyService").length && $("#caddyService").is(":checked"))
          add += 30000 * players;
        if ($("#golfLesson").length && $("#golfLesson").is(":checked"))
          add += 200000;
        if ($("#luxuryTransfer").length && $("#luxuryTransfer").is(":checked"))
          add += 75000;
        if ($("#lunchPackage").length && $("#lunchPackage").is(":checked"))
          add += 40000 * players;

        const taxes = Math.round((subtotal + add) * 0.1);
        const total = subtotal + add + taxes;
        const totalDisplayNumber = getSummaryTotalNumber() || total;

        const dateTime = teeTime ? `${golfDate} at ${teeTime}` : golfDate;
        const hero = pickHero(currentCourse);

        const item = {
          id: `golf-${
            currentCourse.slug || currentCourse.id || "course"
          }-${players}-${golfDate}-${Date.now()}`,
          type: "golf",
          name:
            currentCourse.name || currentCourse?.hero?.title || "Golf Course",
          description: `${packageName} at ${
            currentCourse.name || currentCourse?.hero?.title || ""
          }`,
          price: totalDisplayNumber,
          image: hero,
          details: {
            package: packageName,
            dateTime,
            players: `${players} person(s)`,
            guestName: `${firstName} ${lastName}`,
            currency: pricePer ? ccy : "IDR",
          },
        };

        if (window.Cart && typeof window.Cart.add === "function") {
          //   const added = window.Cart.add(cartItem);
          const added = window.Cart.add(item);
          if (added) {
            alert(`${currentCourse.name} booking added to cart!`);
            window.location.href = "cart.html";
          } else {
            alert("Failed to add item to cart. Please try again.");
          }
        } else {
          console.error(
            "Cart.add not available – check script order & window.Cart export"
          );
          alert("Cart is not ready. Please refresh the page.");
        }
      });
  }

  // ========= BOOT =========
  $(async function () {
    initPickersAndUser();
    bindQty();

    try {
      currentCourse = await loadCourseHybrid();
      if (!currentCourse) {
        $("#bookingError")
          .text("Error: Golf course details not found for the selected ID.")
          .show();
        $("#bookingContent").hide();
        return;
      }

      renderHeaderAndSummary();

      // Ambil paket dari Payload → fallback ke pricing lokal (kalau id lokal tersedia)
      let payloadPkgs = [];
      try {
        if (currentCourse?.id)
          payloadPkgs = await loadPackages(currentCourse.id);
      } catch {}
      const localPricing = Array.isArray(currentCourse?.pricing)
        ? currentCourse.pricing
        : (typeof window.getGolfCourseById === "function" &&
            looksNumeric(getParam("id")) &&
            window.getGolfCourseById(getParam("id"))?.pricing) ||
          [];

      renderPackagesUI(payloadPkgs, localPricing);
      updateBookingSummary();
      handleSubmit();
    } catch (err) {
      console.error("[golf-booking] init failed:", err);
      $("#bookingError").text("Error: Could not load booking data.").show();
      $("#bookingContent").hide();
    }
  });
})(jQuery);
