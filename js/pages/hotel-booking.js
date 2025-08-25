document.addEventListener("DOMContentLoaded", function () {
  // ========= i18n helper =========
  const translations = {
    en: {
      bookingFormHeaderPrefix: "Booking for: ",
      roomOptionPriceSuffix: "/night",
      detailsNotAvailable: "Details not available.",
      errorHotelOrRoomNotFound:
        "Error: Could not load booking details. Please try again from the hotel page.",
      errorInvalidBookingLink:
        "Error: Invalid booking link. Please try again from the hotel page.",
      pleaseSelectDates: "Please select valid check-in and check-out dates",
      night: "Night",
      nights: "Nights",
      alertBookingDetailsNotLoaded:
        "Error: Booking details not loaded. Cannot add to cart.",
      alertFillRequiredFields:
        "Please fill in all required fields and ensure dates are valid.",
      alertBookingAddedToCart:
        "Booking added to cart! You will be redirected to the cart page.",
      alertCartNotAvailable: "Error: Cart functionality is not available.",
      room: "room",
      rooms: "rooms",
      specialRequestsNone: "None",
    },
    es: {
      // bisa ditambah sesuai kebutuhan
    },
  };
  function getCurrentLanguage() {
    return localStorage.getItem("selectedLanguage") || "en";
  }
  function t(key, fallback) {
    const lang = getCurrentLanguage();
    const v = translations[lang]?.[key] ?? translations.en?.[key];
    return v ?? fallback ?? key;
  }

  // ========= Payload CMS helpers =========
  const API_BASE = window.APP_CONFIG?.API_BASE || "";
  const ROOM_ENDPOINT = (id) => `${API_BASE}/api/hotel-rooms/${id}?depth=2`;
  const HOTEL_ENDPOINT = (id) => `${API_BASE}/api/hotels/${id}?depth=1`;

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
  async function fetchJSON(url) {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`HTTP ${r.status} - ${url}`);
    return r.json();
  }
  function qp(name) {
    const s = new URLSearchParams(location.search);
    return s.get(name) || "";
  }
  function toTextFromLexical(lex) {
    try {
      if (typeof lex === "string") return lex;
      const paras = lex?.root?.children || [];
      return paras
        .map((p) => (p.children || []).map((t) => t.text || "").join(" "))
        .join("\n");
    } catch {
      return "";
    }
  }
  function formatDate(date) {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = [
      "Jan","Feb","Mar","Apr","May","Jun",
      "Jul","Aug","Sep","Oct","Nov","Dec",
    ];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }

  // ========= Bootstrap Datepicker =========
  $(".datepicker").datepicker({
    format: "mm/dd/yyyy",
    autoclose: true,
    todayHighlight: true,
    startDate: new Date(),
  });
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  $("#check_in_date").datepicker("setDate", today);
  $("#check_out_date").datepicker("setDate", tomorrow);

  // ========= Booking data dari CMS =========
  let currentHotel = null;
  let currentRoom = null;
  let baseRoomPrice = 0;

  (async function initFromCMS() {
    try {
      const hotelId = qp("hotelId");
      const roomId = qp("roomId");
      if (!roomId) throw new Error("roomId missing");

      const room = await fetchJSON(ROOM_ENDPOINT(roomId));
      currentRoom = room;

      let hotel = room?.parentHotel;
      const parentHotelId =
        typeof hotel === "object"
          ? hotel?.id
          : typeof hotel === "string"
          ? hotel
          : null;
      const effectiveHotelId = hotelId || parentHotelId;
      if (!hotel || (hotelId && parentHotelId && parentHotelId !== hotelId)) {
        hotel = effectiveHotelId
          ? await fetchJSON(HOTEL_ENDPOINT(effectiveHotelId))
          : null;
      }
      currentHotel = hotel;
      if (!currentHotel || !currentRoom) throw new Error("missing room or hotel");

      // hero
      const heroImgUrl =
        mediaUrl(currentRoom?.media?.hero) ||
        mediaUrl(currentHotel?.media?.hero) ||
        "img/rooms/1.jpg";
      $("#bookingHeroImage").attr("src", heroImgUrl);
      if ($.jarallax) {
        $("#bookingHeroImage").parent().jarallax("destroy").jarallax({
          speed: 0.2,
          imgSrc: heroImgUrl,
        });
      }
      $("#bookingHeroSubTitle").text(currentHotel?.name || "Finalize Your Stay");
      $("#bookingHeroTitle").text(currentRoom?.name || "Room Booking");
      $("#bookingHeroDescription").text(
        currentRoom?.overview?.title_main || currentHotel?.short_description || ""
      );

      $("#bookingFormHeader").text(
        t("bookingFormHeaderPrefix") + (currentRoom?.name || "")
      );

      baseRoomPrice = Number(currentRoom?.price || 0);
      $("#roomOptionName").text(currentRoom?.name || "");
      $("#roomOptionPrice").text(
        `$${baseRoomPrice.toLocaleString()}${t("roomOptionPriceSuffix")}`
      );

      const desc =
        toTextFromLexical(currentRoom?.overview?.description) ||
        currentRoom?.overview_description ||
        "";
      $("#roomOptionDescription").html(
        (desc && desc.replace(/\n/g, "<br>")) || t("detailsNotAvailable")
      );

      $("#summaryRoomName").text(currentRoom?.name || "");
      $("#summaryRoomDescription").text(
        currentRoom?.overview?.title_small || currentHotel?.short_description || ""
      );
      $("#summaryRoomImage").attr("src", heroImgUrl);

      updateStayDurationAndSummary();
    } catch (err) {
      console.error(err);
      $(".booking-container").first().html(
        `<p class="text-danger">${t("errorHotelOrRoomNotFound")}</p>`
      );
      $(".booking-container").last().hide();
    }
  })();

  // ========= Perubahan tanggal & qty =========
  $("#check_in_date").datepicker().on("changeDate", function (e) {
    const minOut = new Date(e.date);
    minOut.setDate(minOut.getDate() + 1);
    $("#check_out_date").datepicker("setStartDate", minOut);
    const out = $("#check_out_date").datepicker("getDate");
    if (!out || out <= e.date) {
      $("#check_out_date").datepicker("setDate", minOut);
    }
    updateStayDurationAndSummary();
  });
  $("#check_out_date").datepicker().on("changeDate", function () {
    updateStayDurationAndSummary();
  });
  $(".qtyplus").click(function () {
    const v = (parseInt($("#roomQuantity").val()) || 0) + 1;
    $("#roomQuantity").val(v);
    updateStayDurationAndSummary();
  });
  $(".qtyminus").click(function () {
    let v = parseInt($("#roomQuantity").val()) || 1;
    if (v > 1) {
      v--;
      $("#roomQuantity").val(v);
      updateStayDurationAndSummary();
    }
  });
  $("#roomQuantity").on("change", function () {
    let v = parseInt($(this).val()) || 1;
    if (v < 1) v = 1;
    $(this).val(v);
    updateStayDurationAndSummary();
  });

  function updateStayDurationAndSummary() {
    const inD = $("#check_in_date").datepicker("getDate");
    const outD = $("#check_out_date").datepicker("getDate");
    let nights = 0;
    if (inD && outD && outD > inD) {
      nights = Math.ceil(Math.abs(outD - inD) / (1000 * 60 * 60 * 24));
      $("#stayDurationText").html(
        `${nights} ${nights > 1 ? t("nights") : t("night")} (${formatDate(
          inD
        )} - ${formatDate(outD)})`
      );
    } else {
      $("#stayDurationText").html(t("pleaseSelectDates"));
    }
    $("#nightsValue").text(nights);

    const rooms = parseInt($("#roomQuantity").val()) || 1;
    const subtotal = baseRoomPrice * rooms * nights;
    const taxes = Math.round(subtotal * 0.1);
    const total = subtotal + taxes;

    $("#roomPriceValue").text(
      `$${baseRoomPrice.toLocaleString()} × ${nights} ${
        nights !== 1 ? t("nights") : t("night")
      }`
    );
    $("#numRoomsValue").text(rooms);
    $("#taxesValue").text("$" + taxes.toLocaleString());
    $("#totalValue").text("$" + total.toLocaleString());
  }

  // ========= Submit ➜ Cart =========
  $("#bookingForm").on("submit", function (e) {
    e.preventDefault();
    if (!currentHotel || !currentRoom) {
      alert(t("alertBookingDetailsNotLoaded"));
      return;
    }

    const firstName = $("#firstName").val().trim();
    const lastName = $("#lastName").val().trim();
    const emailVal = $("#email").val().trim();
    const phoneVal = $("#phone").val().trim();
    const inD = $("#check_in_date").datepicker("getDate");
    const outD = $("#check_out_date").datepicker("getDate");
    const numRooms = parseInt($("#roomQuantity").val()) || 1;
    const special = ($("#specialRequests").val() || "").trim();

    if (
      !firstName ||
      !lastName ||
      !emailVal ||
      !phoneVal ||
      !inD ||
      !outD ||
      outD <= inD
    ) {
      alert(t("alertFillRequiredFields"));
      return;
    }

    if (typeof BookingUserInfo !== "undefined" && BookingUserInfo.save) {
      BookingUserInfo.save({
        firstName,
        lastName,
        email: emailVal,
        phone: phoneVal,
      });
    }

    const nights = Math.ceil(Math.abs(outD - inD) / (1000 * 60 * 60 * 24));
    const totalAmount =
      Number(($("#totalValue").text() || "").replace(/[^0-9.]/g, "")) || 0;

    const heroImg =
      mediaUrl(currentRoom?.media?.hero) ||
      mediaUrl(currentHotel?.media?.hero) ||
      "img/rooms/1.jpg";

    const item = {
      id: `hotel-${currentHotel?.id || "h"}-room-${currentRoom?.id || "r"}-${Date.now()}`,
      type: "hotel",
      name: `${currentRoom?.name || "Room"} at ${currentHotel?.name || "Hotel"}`,
      description: `Stay at ${currentHotel?.name || ""}`,
      price: totalAmount,
      image: heroImg,
      details: {
        dates: `${formatDate(inD)} - ${formatDate(outD)} (${nights} ${
          nights !== 1 ? t("nights") : t("night")
        })`,
        roomType: currentRoom?.name || "",
        hotel: currentHotel?.name || "",
        rooms: `${numRooms} ${numRooms !== 1 ? t("rooms") : t("room")}`,
        guestName: `${firstName} ${lastName}`,
        specialRequests: special || t("specialRequestsNone"),
      },
    };

    if (typeof Cart !== "undefined" && Cart.add) {
      Cart.add(item);
      alert(t("alertBookingAddedToCart"));
      window.location.href = "cart.html";
    } else {
      alert(t("alertCartNotAvailable"));
    }
  });

  // init badge
  if (typeof Cart !== "undefined" && Cart.updateCount) Cart.updateCount();
});
