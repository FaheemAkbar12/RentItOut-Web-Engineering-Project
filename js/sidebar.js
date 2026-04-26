// Shared Sidebar Functionality
(function() {
    'use strict';
    
    // Initialize sidebar on DOM load
    document.addEventListener('DOMContentLoaded', initSidebar);
    
    function initSidebar() {
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        const menuToggle = document.getElementById('menuToggle');
        const closeSidebarBtn = document.getElementById('closeSidebar');
        
        if (!sidebar) return;
        
        // Set active link based on current page
        setActiveNavLink();
        
        // Mobile menu toggle
        if (menuToggle) {
            menuToggle.addEventListener('click', openSidebar);
        }
        
        // Close sidebar
        if (closeSidebarBtn) {
            closeSidebarBtn.addEventListener('click', closeSidebar);
        }
        
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', closeSidebar);
        }
        
        // Close sidebar on navigation (mobile)
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 768) {
                    closeSidebar();
                }
            });
        });
        
        // Handle window resize
        window.addEventListener('resize', handleResize);
        
        // Initialize sidebar state
        initializeSidebarState();
    }
    
    function setActiveNavLink() {
        const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'home';
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const page = link.getAttribute('data-page');
            if (page === currentPage) {
                link.classList.add('active', 'bg-primary/10', 'text-primary', 'font-bold');
                link.classList.remove('text-gray-700', 'dark:text-gray-300', 'font-medium');
            } else {
                link.classList.remove('active', 'bg-primary/10', 'text-primary', 'font-bold');
                link.classList.add('text-gray-700', 'dark:text-gray-300', 'font-medium');
            }
        });
    }
    
    function openSidebar() {
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        
        sidebar.classList.remove('sidebar-hidden');
        sidebarOverlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
    
    function closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        
        sidebar.classList.add('sidebar-hidden');
        sidebarOverlay.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
    
    function handleResize() {
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        
        if (window.innerWidth >= 768) {
            sidebar.classList.remove('sidebar-hidden');
            sidebarOverlay.classList.add('hidden');
            document.body.style.overflow = 'auto';
        } else {
            if (!sidebarOverlay.classList.contains('hidden')) {
                return; // Keep sidebar open if user opened it
            }
            sidebar.classList.add('sidebar-hidden');
        }
    }
    
    function initializeSidebarState() {
        const sidebar = document.getElementById('sidebar');
        if (window.innerWidth < 768) {
            sidebar.classList.add('sidebar-hidden');
        }
    }
})();
