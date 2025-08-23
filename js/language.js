// This function must be in global scope for Google Translate to call it
window.googleTranslateElementInit = function() {
    console.log('Google Translate initialization called');
    try {
        new google.translate.TranslateElement({
            pageLanguage: 'en',
            includedLanguages: 'en,es',
            layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false
        }, 'google_translate_element');
        console.log('Google Translate widget initialized successfully');
    } catch (error) {
        console.error('Error initializing Google Translate widget:', error);
    }
}

function changeLanguage(lang) {
    console.log('Changing language to:', lang);
    // Store selected language
    localStorage.setItem('selectedLanguage', lang);

    // Update display text
    const currentLangTextElements = document.querySelectorAll('[id^="current-lang-text"]');
    currentLangTextElements.forEach(element => {
        if (element) {
            element.textContent = lang.toUpperCase();
        }
    });

    // Highlight active language in the dropdown
    const languageItems = document.querySelectorAll('.language-selector-dropdown .dropdown-item[data-lang]');
    languageItems.forEach(item => {
        item.classList.remove('active-lang');
        if (item.getAttribute('data-lang') === lang) {
            item.classList.add('active-lang');
        }
    });

    // Set cookies for persistence
    try {
        const domain = window.location.hostname;
        document.cookie = `googtrans=/en/${lang}; path=/; domain=${domain}`;
        document.cookie = `googtrans=/en/${lang}; path=/`;
        
        if (domain === 'localhost' || domain === '127.0.0.1') {
            document.cookie = `googtrans=/en/${lang}; path=/`;
        }
        console.log('Language cookies set for persistence.');
    } catch (error) {
        console.error('Error setting language cookies:', error);
    }

    // Trigger translation without page reload
    const translateElement = document.getElementById('google_translate_element');
    const selectElement = translateElement ? translateElement.querySelector('.goog-te-combo') : null;

    if (selectElement) {
        selectElement.value = lang;
        selectElement.dispatchEvent(new Event('change'));
        console.log(`Triggered translation to ${lang} without reloading.`);
    } else {
        console.warn('Google Translate select element not found, falling back to page reload.');
        window.location.reload();
    }
}

function applyStoredLanguage() {
    console.log('Applying stored language');
    const storedLang = localStorage.getItem('selectedLanguage') || 'en';
    console.log('Stored language:', storedLang);

    // Update all language display elements
    const currentLangTextElements = document.querySelectorAll('[id^="current-lang-text"]');
    currentLangTextElements.forEach(element => {
        if (element) {
            element.textContent = storedLang.toUpperCase();
        }
    });

    try {
        // Set cookies
        const domain = window.location.hostname;
        document.cookie = `googtrans=/en/${storedLang}; path=/; domain=${domain}`;
        document.cookie = `googtrans=/en/${storedLang}; path=/`;

        if (domain === 'localhost' || domain === '127.0.0.1') {
            document.cookie = `googtrans=/en/${storedLang}; path=/`;
        }
        console.log('Language cookies applied successfully');
    } catch (error) {
        console.error('Error applying language cookies:', error);
    }

    // Highlight active language
    const languageItems = document.querySelectorAll('.language-selector-dropdown .dropdown-item[data-lang]');
    languageItems.forEach(item => {
        item.classList.remove('active-lang');
        if (item.getAttribute('data-lang') === storedLang) {
            item.classList.add('active-lang');
        }
    });
}

// Hide Google Translate UI elements
function hideGoogleTranslateBar() {
    console.log('Hiding Google Translate UI elements');
    const style = document.createElement('style');
    style.textContent = `
        body { top: 0 !important; }
        .skiptranslate, #goog-gt-tt, .goog-te-banner-frame.skiptranslate {
            display: none !important;
        }
        .goog-te-gadget { font-size: 0 !important; }
        .goog-te-gadget span { display: none !important; }
        .goog-te-gadget div { display: inline !important; }
    `;
    document.head.appendChild(style);
}

// Load Google Translate script with retry mechanism
function loadGoogleTranslate(retries = 3) {
    console.log(`Attempting to load Google Translate (${retries} retries left)`);
    return new Promise((resolve, reject) => {
        if (typeof google !== 'undefined' && google.translate) {
            console.log('Google Translate already loaded');
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;

        script.onerror = () => {
            console.error('Error loading Google Translate script');
            if (retries > 0) {
                console.log(`Retrying Google Translate script load... (${retries} attempts left)`);
                setTimeout(() => {
                    loadGoogleTranslate(retries - 1).then(resolve).catch(reject);
                }, 1000);
            } else {
                reject(new Error('Failed to load Google Translate script'));
            }
        };

        script.onload = () => {
            console.log('Google Translate script loaded successfully');
            resolve();
        };
        document.head.appendChild(script);
    });
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Initializing language system');
    
    // Make sure the Google Translate element exists
    let translateElement = document.getElementById('google_translate_element');
    if (!translateElement) {
        console.log('Creating missing Google Translate element');
        translateElement = document.createElement('div');
        translateElement.id = 'google_translate_element';
        translateElement.style.visibility = 'hidden';
        translateElement.style.height = '0';
        translateElement.style.overflow = 'hidden';
        document.body.insertBefore(translateElement, document.body.firstChild);
    }

    // Try to load Google Translate with retries
    loadGoogleTranslate()
        .then(() => {
            console.log('Google Translate loaded successfully');
            if (!google.translate) {
                console.log('Initializing Google Translate widget');
                window.googleTranslateElementInit();
            }
            applyStoredLanguage();
            hideGoogleTranslateBar();
        })
        .catch(error => {
            console.error('Error in language initialization:', error);
            // Still update the language display even if Google Translate fails
            applyStoredLanguage();
            hideGoogleTranslateBar();
        });
});
