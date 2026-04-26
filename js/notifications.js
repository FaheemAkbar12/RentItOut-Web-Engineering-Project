// Notification System
(function() {
    'use strict';
    
    document.addEventListener('DOMContentLoaded', initNotifications);
    
    // Mock notifications data
    const mockNotifications = [
        {
            id: 1,
            type: 'booking',
            title: 'New Booking Request',
            message: 'Ahmad wants to rent your camera',
            time: '5 minutes ago',
            read: false,
            icon: 'notifications'
        },
        {
            id: 2,
            type: 'message',
            title: 'New Message',
            message: 'Sara sent you a message',
            time: '1 hour ago',
            read: false,
            icon: 'mail'
        },
        {
            id: 3,
            type: 'payment',
            title: 'Payment Received',
            message: 'You received $45 for your booking',
            time: '2 hours ago',
            read: true,
            icon: 'payments'
        }
    ];
    
    function initNotifications() {
        const notificationBtn = document.getElementById('notificationBtn');
        if (!notificationBtn) return;
        
        // Create notification dropdown
        createNotificationDropdown();
        
        // Add click listener
        notificationBtn.addEventListener('click', toggleNotificationDropdown);
        
        // Update badge
        updateNotificationBadge();
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('notificationDropdown');
            if (dropdown && !notificationBtn.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });
    }
    
    function createNotificationDropdown() {
        const notificationBtn = document.getElementById('notificationBtn');
        const dropdown = document.createElement('div');
        dropdown.id = 'notificationDropdown';
        dropdown.className = 'hidden absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50';
        
        dropdown.innerHTML = `
            <div class="p-4 border-b border-gray-200 dark:border-gray-700">
                <div class="flex items-center justify-between">
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white">Notifications</h3>
                    <button id="markAllRead" class="text-sm text-primary hover:text-primary/80">Mark all read</button>
                </div>
            </div>
            <div id="notificationList" class="max-h-96 overflow-y-auto">
                ${renderNotifications()}
            </div>
            <div class="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
                <a href="userddash.html" class="text-sm text-primary hover:text-primary/80 font-medium">View all notifications</a>
            </div>
        `;
        
        notificationBtn.parentElement.style.position = 'relative';
        notificationBtn.parentElement.appendChild(dropdown);
        
        // Mark all as read listener
        document.getElementById('markAllRead').addEventListener('click', markAllAsRead);
    }
    
    function renderNotifications() {
        if (mockNotifications.length === 0) {
            return `
                <div class="p-8 text-center text-gray-500 dark:text-gray-400">
                    <span class="material-symbols-outlined text-4xl mb-2">notifications_off</span>
                    <p>No notifications</p>
                </div>
            `;
        }
        
        return mockNotifications.map(notif => `
            <div class="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-800 ${!notif.read ? 'bg-primary/5' : ''}">
                <div class="flex gap-3">
                    <div class="flex-shrink-0">
                        <span class="material-symbols-outlined text-primary text-2xl">${notif.icon}</span>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-semibold text-gray-900 dark:text-white">${notif.title}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400 truncate">${notif.message}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">${notif.time}</p>
                    </div>
                    ${!notif.read ? '<div class="flex-shrink-0"><div class="w-2 h-2 bg-primary rounded-full"></div></div>' : ''}
                </div>
            </div>
        `).join('');
    }
    
    function toggleNotificationDropdown(e) {
        e.stopPropagation();
        const dropdown = document.getElementById('notificationDropdown');
        if (dropdown) {
            dropdown.classList.toggle('hidden');
        }
    }
    
    function updateNotificationBadge() {
        const unreadCount = mockNotifications.filter(n => !n.read).length;
        const notificationBtn = document.getElementById('notificationBtn');
        
        if (unreadCount > 0) {
            let badge = notificationBtn.querySelector('.notification-badge');
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'notification-badge absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center';
                notificationBtn.style.position = 'relative';
                notificationBtn.appendChild(badge);
            }
            badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
        }
    }
    
    function markAllAsRead() {
        mockNotifications.forEach(n => n.read = true);
        const list = document.getElementById('notificationList');
        if (list) {
            list.innerHTML = renderNotifications();
        }
        updateNotificationBadge();
        showToast('All notifications marked as read', 'success');
    }
})();
