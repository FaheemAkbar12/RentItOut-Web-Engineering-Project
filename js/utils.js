// Shared Utility Functions

// Pakistani Cities
const PAKISTANI_CITIES = [
    'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
    'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
    'Hyderabad', 'Abbottabad', 'Murree', 'Gilgit', 'Skardu'
];

// Pakistani Provinces
const PAKISTANI_PROVINCES = [
    'Sindh', 'Punjab', 'Khyber Pakhtunkhwa', 'Balochistan',
    'Gilgit-Baltistan', 'Azad Kashmir'
];

// Categories
const ITEM_CATEGORIES = [
    'Electronics', 'Cameras & Photography', 'Tools & Equipment',
    'Sports & Outdoor', 'Vehicles', 'Party & Events',
    'Books & Education', 'Fashion & Accessories', 'Other'
];

// Toast Notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white font-medium z-50 transform transition-all duration-300 ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 
        type === 'warning' ? 'bg-yellow-500' : 
        'bg-blue-500'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Loading Spinner
function showLoading(target) {
    const spinner = document.createElement('div');
    spinner.className = 'flex items-center justify-center p-8';
    spinner.innerHTML = `
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
    `;
    target.innerHTML = '';
    target.appendChild(spinner);
}

// Format Currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Format Date
function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(date));
}

// Debounce Function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Email Validation
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Phone Validation (Pakistan)
function isValidPhone(phone) {
    const re = /^(\+92|0)?3[0-9]{9}$/;
    return re.test(phone.replace(/\s/g, ''));
}

// Image File Validation
function isValidImage(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
        showToast('Please upload a valid image file (JPG, PNG, GIF, WebP)', 'error');
        return false;
    }
    
    if (file.size > maxSize) {
        showToast('Image size must be less than 5MB', 'error');
        return false;
    }
    
    return true;
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PAKISTANI_CITIES,
        PAKISTANI_PROVINCES,
        ITEM_CATEGORIES,
        showToast,
        showLoading,
        formatCurrency,
        formatDate,
        debounce,
        isValidEmail,
        isValidPhone,
        isValidImage
    };
}
