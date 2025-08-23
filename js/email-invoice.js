/**
 * Email Invoice System
 * 
 * Handles sending email invoices to users upon checkout
 * Uses EmailJS service to send emails directly from client-side
 * 
 * Required: Add EmailJS SDK to your HTML before using this script
 * <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
 */

const EmailInvoice = (function() {
    // Configuration
    const config = {
        // Replace with your own EmailJS credentials
        serviceID: 'royal_travel_service',
        // templateID: 'template_5jovd9w', // Old single template ID
        templateIDs: { // Store multiple template IDs
            en: 'template_5jovd9w', // Default English template
            es: 'template_fk29l48' // Replace with your Spanish template ID
        },
        publicKey: 'x9S1eDLvp6VozR6gm', // Your EmailJS public/API key
        // defaultSubject: 'Royal Travel Booking Invoice' // This can also be part of translations
    };

    const translations = {
        en: {
            defaultSubject: 'Royal Travel Booking Invoice',
            thankYouMessage: 'Thank you for choosing Royal Travel for your luxury travel needs.',
            customerEmailRequired: 'Customer email is required to send invoice',
            noItemsInCart: '<tr><td colspan="4">No items in cart</td></tr>',
            cartEmptyAlert: 'Your cart is empty. Please add items to proceed with checkout.',
            orderSuccessAlert: 'Your order has been placed successfully! An invoice has been sent to your email.',
            orderErrorAlert: 'There was an error processing your order. Please try again or contact support.'
        },
        es: {
            defaultSubject: 'Factura de Reserva de Royal Travel', // Example translation
            thankYouMessage: 'Gracias por elegir Royal Travel para sus necesidades de viajes de lujo.',
            customerEmailRequired: 'Se requiere el correo electrónico del cliente para enviar la factura',
            noItemsInCart: '<tr><td colspan="4">No hay artículos en el carrito</td></tr>',
            cartEmptyAlert: 'Su carrito está vacío. Por favor, agregue artículos para continuar con el pago.',
            orderSuccessAlert: '¡Su pedido se ha realizado con éxito! Se ha enviado una factura a su correo electrónico.',
            orderErrorAlert: 'Hubo un error al procesar su pedido. Por favor, inténtelo de nuevo o contacte a soporte.'
        }
    };

    /**
     * Get translated text by key for the current language
     * @param {string} key - The key for the translation string
     * @returns {string} The translated string
     */
    function getTranslatedText(key) {
        const lang = getCurrentLanguage();
        return translations[lang]?.[key] || translations.en[key]; // Fallback to English
    }

    /**
     * Initialize EmailJS
     */
    function init() {
        // Initialize EmailJS with your public key
        emailjs.init(config.publicKey);
    }

    /**
     * Format currency amount
     * @param {number} amount - Amount to format
     * @param {string} currency - Currency code (default: USD)
     * @returns {string} Formatted currency string
     */
    function formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    /**
     * Format date
     * @param {Date|string} date - Date to format
     * @returns {string} Formatted date string
     */
    function formatDate(date) {
        const dateObj = new Date(date);
        // Get current language for date formatting (optional, as EmailJS template might handle this)
        const lang = getCurrentLanguage();
        return dateObj.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    /**
     * Get user information from localStorage
     * @returns {Object} User information
     */
    function getUserInfo() {
        if (typeof BookingUserInfo !== 'undefined' && BookingUserInfo.get) {
            return BookingUserInfo.get() || {};
        }
        
        // Fallback if BookingUserInfo is not available
        try {
            const userInfo = localStorage.getItem('royal_travel_user_info');
            return userInfo ? JSON.parse(userInfo) : {};
        } catch (error) {
            console.error('Error getting user info:', error);
            return {};
        }
    }

    /**
     * Get current language from localStorage
     * @returns {string} Current language code (e.g., 'en', 'es')
     */
    function getCurrentLanguage() {
        return localStorage.getItem('selectedLanguage') || 'en'; // Default to 'en'
    }

    /**
     * Generate invoice number
     * @returns {string} Invoice number
     */
    function generateInvoiceNumber() {
        const prefix = 'RT';
        const timestamp = new Date().getTime().toString().slice(-8);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${prefix}-${timestamp}-${random}`;
    }

    /**
     * Send invoice email
     * @param {Object} cartItems - Cart items to include in the invoice
     * @param {Object} options - Additional options
     * @returns {Promise} Promise that resolves with the result
     */
    function sendInvoiceEmail(cartItems, options = {}) {
        // Get user info from local storage
        const userInfo = getUserInfo();
        const currentLang = getCurrentLanguage(); // Get current language
        
        // Handle email from options (could be string or function)
        let optionsEmail = options.email;
        if (typeof optionsEmail === 'function') {
            optionsEmail = optionsEmail();
        }
        
        // Create invoice data
        const invoiceData = {
            invoice_number: generateInvoiceNumber(),
            date: formatDate(new Date()),
            customer_name: `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim() || 'Valued Customer',
            customer_email: userInfo.email || optionsEmail || '',
            subject: options.subject || getTranslatedText('defaultSubject'),
            items: formatItemsForEmail(cartItems),
            subtotal: calculateSubtotal(cartItems),
            tax: calculateTax(cartItems),
            total: calculateTotal(cartItems),
            message: options.message || getTranslatedText('thankYouMessage')
        };

        // Ensure recipient email is valid
        if (!invoiceData.customer_email) {
            return Promise.reject(new Error(getTranslatedText('customerEmailRequired')));
        }

        // Prepare template parameters
        const templateParams = {
            to_name: invoiceData.customer_name,
            email: invoiceData.customer_email,
            subject: invoiceData.subject,
            invoice_number: invoiceData.invoice_number,
            invoice_date: invoiceData.date,
            items_html: invoiceData.items,
            subtotal: formatCurrency(invoiceData.subtotal),
            tax: formatCurrency(invoiceData.tax),
            total: formatCurrency(invoiceData.total),
            message: invoiceData.message
        };

        // Select the correct template ID based on language
        const templateID = config.templateIDs[currentLang] || config.templateIDs.en; // Fallback to English

        // Send email using EmailJS
        return emailjs.send(config.serviceID, templateID, templateParams)
            .then(response => {
                console.log('Invoice email sent successfully:', response);
                return {
                    success: true,
                    message: 'Invoice email sent successfully',
                    invoice: invoiceData,
                    response: response
                };
            })
            .catch(error => {
                console.error('Error sending invoice email:', error);
                throw error;
            });
    }

    /**
     * Format cart items for email
     * @param {Array} items - Cart items
     * @returns {string} HTML string of formatted items
     */
    function formatItemsForEmail(items) {
        if (!Array.isArray(items) || items.length === 0) {
            return getTranslatedText('noItemsInCart');
        }

        return items.map(item => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name || 'Item'}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity || 1}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${formatCurrency(item.price || 0)}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${formatCurrency((item.price || 0) * (item.quantity || 1))}</td>
            </tr>
        `).join('');
    }

    /**
     * Calculate subtotal from cart items
     * @param {Array} items - Cart items
     * @returns {number} Subtotal
     */
    function calculateSubtotal(items) {
        if (!Array.isArray(items) || items.length === 0) {
            return 0;
        }

        return items.reduce((total, item) => {
            return total + ((item.price || 0) * (item.quantity || 1));
        }, 0);
    }

    /**
     * Calculate tax from subtotal
     * @param {Array} items - Cart items
     * @param {number} taxRate - Tax rate (default: 0.1 or 10%)
     * @returns {number} Tax amount
     */
    function calculateTax(items, taxRate = 0.1) {
        const subtotal = calculateSubtotal(items);
        return subtotal * taxRate;
    }

    /**
     * Calculate total with tax
     * @param {Array} items - Cart items
     * @param {number} taxRate - Tax rate (default: 0.1 or 10%)
     * @returns {number} Total amount
     */
    function calculateTotal(items, taxRate = 0.1) {
        const subtotal = calculateSubtotal(items);
        const tax = calculateTax(items, taxRate);
        return subtotal + tax;
    }

    /**
     * Get cart items from DOM
     * @returns {Array} Cart items
     */
    function getCartItemsFromDOM() {
        const cartItems = [];
        const itemRows = document.querySelectorAll('.cart-item');
        
        itemRows.forEach(row => {
            const nameElement = row.querySelector('.item-name');
            const priceElement = row.querySelector('.item-price');
            const quantityElement = row.querySelector('.item-quantity input');
            
            if (nameElement && priceElement && quantityElement) {
                const price = parseFloat(priceElement.textContent.replace(/[^0-9.-]+/g, ''));
                const quantity = parseInt(quantityElement.value, 10);
                
                cartItems.push({
                    name: nameElement.textContent.trim(),
                    price: price,
                    quantity: quantity
                });
            }
        });
        
        return cartItems;
    }

    /**
     * Setup checkout button to send invoice
     * @param {string} buttonSelector - CSS selector for checkout button
     * @param {Function} getCartItemsFn - Function to get cart items (optional)
     * @param {Object} options - Additional options
     */
    function setupCheckoutButton(buttonSelector, getCartItemsFn, options = {}) {
        const checkoutButton = document.querySelector(buttonSelector);
        
        if (!checkoutButton) {
            console.error('Checkout button not found with selector:', buttonSelector);
            return;
        }
        
        checkoutButton.addEventListener('click', function(event) {
            // Prevent default form submission if button is in a form
            event.preventDefault();
            
            // Get cart items
            const cartItems = typeof getCartItemsFn === 'function' 
                ? getCartItemsFn() 
                : getCartItemsFromDOM();
            
            // Check if cart has items
            if (!cartItems || cartItems.length === 0) {
                alert(getTranslatedText('cartEmptyAlert'));
                return;
            }
            
            // Send invoice email
            sendInvoiceEmail(cartItems, options)
                .then(result => {
                    alert(getTranslatedText('orderSuccessAlert'));
                    
                    // Call success callback if provided
                    if (typeof options.onSuccess === 'function') {
                        options.onSuccess(result);
                    }
                })
                .catch(error => {
                    console.error('Error during checkout:', error);
                    alert(getTranslatedText('orderErrorAlert'));
                    
                    // Call error callback if provided
                    if (typeof options.onError === 'function') {
                        options.onError(error);
                    }
                });
        });
    }

    // Public API
    return {
        init: init,
        sendInvoice: sendInvoiceEmail,
        setupCheckout: setupCheckoutButton,
        getCartItems: getCartItemsFromDOM,
        formatCurrency: formatCurrency
    };
})(); 