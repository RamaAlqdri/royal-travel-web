/**
 * Cart Management System
 *
 * Handles cart operations such as adding, removing items, and retrieving cart data.
 * Stores cart data in localStorage for persistence between page loads.
 */

const Cart = (function () {
  // Storage key for cart items
  const STORAGE_KEY = "royal_travel_cart";

  const translations = {
    en: {
      errorRetrievingCart: "Error retrieving cart:",
      errorSavingCart: "Error saving cart:",
      emptyCartTitle: "Your cart is empty",
      emptyCartMessage: "You have no items in your cart. Start adding some!",
      continueShopping: "Continue Shopping",
      guestNameLabel: "Guest Name",
      itemPlaceholderName: "Item",
      itemPlaceholderType: "Item",
      removeButton: "Remove",
      // Labels for item.details keys
      datesLabel: "Dates",
      guestsLabel: "Guests",
      roomTypeLabel: "Room Type",
      packageLabel: "Package",
      dateLabel: "Date",
      includesLabel: "Includes",
      routeLabel: "Route",
      passengersLabel: "Passengers",
      dateTimeLabel: "Date & Time",
      playersLabel: "Players",
    },
    es: {
      errorRetrievingCart: "Error al recuperar el carrito:",
      errorSavingCart: "Error al guardar el carrito:",
      emptyCartTitle: "Tu carrito está vacío",
      emptyCartMessage:
        "No tienes artículos en tu carrito. ¡Empieza a añadir algunos!",
      continueShopping: "Seguir Comprando",
      guestNameLabel: "Nombre del Huésped",
      itemPlaceholderName: "Artículo",
      itemPlaceholderType: "Artículo",
      removeButton: "Eliminar",
      // Labels for item.details keys - Spanish
      datesLabel: "Fechas",
      guestsLabel: "Huéspedes",
      roomTypeLabel: "Tipo de Habitación",
      packageLabel: "Paquete",
      dateLabel: "Fecha",
      includesLabel: "Incluye",
      routeLabel: "Ruta",
      passengersLabel: "Pasajeros",
      dateTimeLabel: "Fecha y Hora",
      playersLabel: "Jugadores",
    },
  };

  function getCurrentLanguage() {
    return localStorage.getItem("selectedLanguage") || "en";
  }

  function getTranslatedText(key, fallback) {
    const lang = getCurrentLanguage();
    const text = translations[lang]?.[key] || translations.en?.[key];
    return text || fallback || key; // Fallback to English, then provided fallback, then key itself
  }

  // Initial mock data to populate the cart
  const mockItems = [
    {
      id: "hotel1",
      type: "hotel",
      name: "Sierra Double Room",
      description: "Luxury Villa",
      price: 275,
      image: "img/rooms/1.jpg",
      details: {
        dates: "Nov 15, 2023 - Nov 16, 2023 (1 night)",
        guests: "2 Adults",
        roomType: "Double Room with King Bed",
        guestName: "John Smith",
      },
    },
    {
      id: "yacht1",
      type: "yacht",
      name: "Sovereign Elegance",
      description: "Private Yacht Charter",
      price: 9500,
      image: "img/yachts/yacht-exterior-1.jpg",
      details: {
        package: "Day Charter (8 Hours)",
        date: "Dec 10, 2023",
        includes: "Gourmet lunch, drinks, water activities",
        guestName: "Michael Johnson",
      },
    },
    {
      id: "jet1",
      type: "jet",
      name: "Gulfstream G650",
      description: "Private Jet Charter",
      price: 42500,
      image: "img/jet/jet-1.jpg",
      details: {
        route: "Jakarta to Singapore",
        date: "Nov 28, 2023",
        passengers: "6 persons",
        guestName: "Robert Wilson",
      },
    },
    {
      id: "golf1",
      type: "golf",
      name: "Bali National Golf Club",
      description: "Premium Golf Experience",
      price: 396,
      image: "img/golf/golf-detail-hero.jpg",
      details: {
        package: "Standard 18-Hole Round",
        dateTime: "Dec 5, 2023 at 10:00 AM",
        players: "2 persons",
        guestName: "David Thompson",
      },
    },
  ];

  /**
   * Initialize the cart
   * Loads existing cart data or sets up mock data if cart is empty
   */
  function initializeCart() {
    // const existingCart = getCart();

    // // If cart is empty, initialize with mock data
    // if (!existingCart || existingCart.length === 0) {
    //     saveCart(mockItems);
    // }

    // Just update the cart count display on load
    updateCartCountDisplay();
  }

  /**
   * Get all items from cart
   * @returns {Array} Array of cart items
   */
  function getCart() {
    try {
      const cartData = localStorage.getItem(STORAGE_KEY);
      return cartData ? JSON.parse(cartData) : [];
    } catch (error) {
      console.error(getTranslatedText("errorRetrievingCart"), error);
      return [];
    }
  }

  /**
   * Save cart items to localStorage
   * @param {Array} items - Array of cart items to save
   */
  function saveCart(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      // Update cart count display after saving
      updateCartCountDisplay();
      return true;
    } catch (error) {
      console.error(getTranslatedText("errorSavingCart"), error);
      return false;
    }
  }

  /**
   * Add item to cart
   * @param {Object} item - Item to add to cart
   * @returns {boolean} Success status
   */
  function addToCart(item) {
    if (!item || !item.id) return false;

    const cart = getCart();

    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex(
      (cartItem) => cartItem.id === item.id
    );

    if (existingItemIndex >= 0) {
      // Item exists, update quantity or other properties
      cart[existingItemIndex] = { ...cart[existingItemIndex], ...item };
    } else {
      // Item doesn't exist, add it
      cart.push(item);
    }

    // Save updated cart
    return saveCart(cart);
  }

  /**
   * Remove item from cart
   * @param {string} itemId - ID of item to remove
   * @returns {boolean} Success status
   */
  function removeFromCart(itemId) {
    if (!itemId) return false;

    const cart = getCart();
    const updatedCart = cart.filter((item) => item.id !== itemId);

    // Save updated cart
    const saved = saveCart(updatedCart);

    // If saved successfully, re-render the cart and update the summary
    if (saved) {
      renderCartItems("cartItems"); // Assuming 'cartItems' is the ID of your cart container
      updateOrderSummary(); // Update the summary totals
    }

    return saved;
  }

  /**
   * Clear all items from cart
   * @returns {boolean} Success status
   */
  function clearCart() {
    return saveCart([]);
  }

  /**
   * Get number of items in cart
   * @returns {number} Item count
   */
  function getCartItemCount() {
    const cart = getCart();
    return cart.length;
  }

  /**
   * Get total price of all items in cart
   * @returns {number} Total price
   */
  function getCartTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.price || 0), 0);
  }

  /**
   * Update cart count display in navbar
   */
  function updateCartCountDisplay() {
    const count = getCartItemCount();
    const cartCountElement = document.querySelector(".cart-count");

    if (cartCountElement) {
      cartCountElement.textContent = count;

      // Show/hide count badge based on count
      if (count > 0) {
        cartCountElement.style.display = "flex";
      } else {
        cartCountElement.style.display = "none";
      }
    }
  }

  /**
   * Render cart items to a container element
   * @param {string} containerId - ID of container element
   */
  function renderCartItems(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const cart = getCart();

    if (cart.length === 0) {
      // Show empty cart message
      container.innerHTML = `
                <div class="empty-cart">
                    <i class="fa-solid fa-cart-shopping"></i>
                    <h4>${getTranslatedText("emptyCartTitle")}</h4>
                    <p>${getTranslatedText("emptyCartMessage")}</p>
                    <a href="index.html" class="btn_1">${getTranslatedText(
                      "continueShopping"
                    )}</a>
                </div>
            `;
      return;
    }

    // Generate HTML for cart items
    let cartHtml = "";

    cart.forEach((item) => {
      // Generate details HTML
      let detailsHtml = "";
      if (item.details) {
        Object.entries(item.details).forEach(([key, value]) => {
          if (key !== "guestName") {
            const labelKey = key + "Label";
            const labelText = getTranslatedText(
              labelKey,
              key.charAt(0).toUpperCase() + key.slice(1)
            );
            detailsHtml += `<p><strong>${labelText}:</strong> ${value}</p>`;
          }
        });
        if (item.details.guestName) {
          detailsHtml += `<p><strong>${getTranslatedText(
            "guestNameLabel"
          )}:</strong> ${item.details.guestName}</p>`;
        }
      }

      cartHtml += `
                <div class="cart-item" data-id="${item.id}">
                    <span class="service-type ${item.type || "general"}">${
        item.type
          ? getTranslatedText(
              item.type + "Type",
              item.type.charAt(0).toUpperCase() + item.type.slice(1)
            )
          : getTranslatedText("itemPlaceholderType")
      }</span>
                    <div class="cart-item-header">
                        <div class="cart-item-title">
                            <h4>${
                              item.name ||
                              getTranslatedText("itemPlaceholderName")
                            }</h4>
                            <p>${item.description || ""}</p>
                        </div>
                        <div class="cart-item-price">$${(
                          item.price || 0
                        ).toLocaleString()}</div>
                    </div>
                    <div class="cart-item-content">
                        <div class="cart-item-image">
                            <img src="${
                              item.image || "img/placeholder.jpg"
                            }" alt="${
        item.name || getTranslatedText("itemPlaceholderName")
      }">
                        </div>
                        <div class="cart-item-details">
                            ${detailsHtml}
                        </div>
                    </div>
                    <div class="cart-item-actions">
                        <button class="remove-btn" onclick="Cart.remove('${
                          item.id
                        }')">
                            <i class="fa-solid fa-trash-can"></i> ${getTranslatedText(
                              "removeButton"
                            )}
                        </button>
                    </div>
                </div>
            `;
    });

    container.innerHTML = cartHtml;
  }

  /**
   * Calculate and update order summary values
   * @param {Object} selectors - Object with selectors for summary elements
   */
  function updateOrderSummary(selectors = {}) {
    const defaultSelectors = {
      subtotal: "#subtotalValue",
      serviceFee: "#serviceFeeValue",
      tax: "#taxValue",
      total: "#totalValue",
      itemCount: "#itemCountValue",
    };

    const finalSelectors = { ...defaultSelectors, ...selectors };

    const cart = getCart();
    const itemCount = cart.length;

    // Calculate subtotal
    const subtotal = getCartTotal();

    // Calculate fees
    const serviceFee = subtotal * 0.05; // 5% service fee
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + serviceFee + tax;

    // Update summary display
    const elements = {
      subtotal: document.querySelector(finalSelectors.subtotal),
      serviceFee: document.querySelector(finalSelectors.serviceFee),
      tax: document.querySelector(finalSelectors.tax),
      total: document.querySelector(finalSelectors.total),
      itemCount: document.querySelector(finalSelectors.itemCount),
    };

    if (elements.subtotal)
      elements.subtotal.textContent = "$" + subtotal.toLocaleString();
    if (elements.serviceFee)
      elements.serviceFee.textContent = "$" + serviceFee.toLocaleString();
    if (elements.tax) elements.tax.textContent = "$" + tax.toLocaleString();
    if (elements.total)
      elements.total.textContent = "$" + total.toLocaleString();
    if (elements.itemCount) elements.itemCount.textContent = itemCount;
  }

  // Initialize cart when script loads
  // document.addEventListener('DOMContentLoaded', initializeCart);
  // Pastikan init tetap jalan walaupun DOM sudah siap
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeCart);
  } else {
    initializeCart();
  }

  // EXPOSE ke global supaya script lain & inline onclick bisa akses
  //   window.Cart = Cart;

  // Public API
  return {
    init: initializeCart,
    get: getCart,
    add: addToCart,
    remove: removeFromCart,
    clear: clearCart,
    count: getCartItemCount,
    total: getCartTotal,
    render: renderCartItems,
    updateSummary: updateOrderSummary,
    updateCount: updateCartCountDisplay,
  };
})();

window.Cart = Cart;
