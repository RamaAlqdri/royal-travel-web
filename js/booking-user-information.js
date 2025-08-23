/**
 * Booking User Information Manager
 * Handles saving and retrieving user information for booking forms across the website
 * Uses localStorage to persist user data between sessions
 */

const BookingUserInfo = (function() {
    // Storage key for user information
    const STORAGE_KEY = 'royal_travel_user_info';
    
    /**
     * Save user information to localStorage
     * @param {Object} userInfo - User information object containing name, email, phone, etc.
     */
    function saveUserInfo(userInfo) {
        if (!userInfo) return;
        
        try {
            // Get existing data if any
            const currentData = getUserInfo() || {};
            
            // Merge with new data
            const updatedData = {
                ...currentData,
                ...userInfo,
                lastUpdated: new Date().toISOString()
            };
            
            // Save to localStorage
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
            
            return true;
        } catch (error) {
            console.error('Error saving user info:', error);
            return false;
        }
    }
    
    /**
     * Get user information from localStorage
     * @returns {Object|null} User information object or null if not found
     */
    function getUserInfo() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error retrieving user info:', error);
            return null;
        }
    }
    
    /**
     * Clear saved user information
     */
    function clearUserInfo() {
        localStorage.removeItem(STORAGE_KEY);
    }
    
    /**
     * Automatically fill booking form fields with saved user data
     * @param {Object} selectors - Object mapping data fields to form selectors
     */
    function autofillBookingForm(selectors = {}) {
        const userInfo = getUserInfo();
        if (!userInfo) return;
        
        const defaultSelectors = {
            firstName: '#firstName',
            lastName: '#lastName',
            email: '#email',
            phone: '#phone'
        };
        
        // Merge default selectors with provided selectors
        const fieldSelectors = {...defaultSelectors, ...selectors};
        
        // Fill form fields with user data if available
        Object.keys(fieldSelectors).forEach(field => {
            const selector = fieldSelectors[field];
            const value = userInfo[field];
            
            if (value && selector) {
                const element = document.querySelector(selector);
                if (element) {
                    element.value = value;
                }
            }
        });
    }
    
    /**
     * Set up event listeners to save form data on submission
     * @param {string} formSelector - Selector for the booking form
     * @param {Object} fieldMappings - Object mapping form field selectors to data fields
     */
    function setupFormSaving(formSelector, fieldMappings = {}) {
        const form = document.querySelector(formSelector);
        if (!form) return;
        
        const defaultMappings = {
            firstName: '#firstName',
            lastName: '#lastName',
            email: '#email',
            phone: '#phone'
        };
        
        // Merge default mappings with provided mappings
        const mappings = {...defaultMappings, ...fieldMappings};
        
        form.addEventListener('submit', function(e) {
            // Collect data from form
            const userData = {};
            
            Object.keys(mappings).forEach(field => {
                const selector = mappings[field];
                const element = document.querySelector(selector);
                
                if (element && element.value) {
                    userData[field] = element.value;
                }
            });
            
            // Save user data
            if (Object.keys(userData).length > 0) {
                saveUserInfo(userData);
            }
        });
    }
    
    // Public API
    return {
        save: saveUserInfo,
        get: getUserInfo,
        clear: clearUserInfo,
        autofill: autofillBookingForm,
        setupForm: setupFormSaving
    };
})(); 