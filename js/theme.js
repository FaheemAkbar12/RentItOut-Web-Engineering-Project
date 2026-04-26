/**
 * Dark Mode Theme Toggle
 * Manages light/dark theme switching across all pages
 */

(function() {
  'use strict';
  
  // Initialize theme on page load
  function initTheme() {
    const htmlElement = document.documentElement;
    const currentTheme = localStorage.getItem('theme') || 'light';
    htmlElement.classList.toggle('dark', currentTheme === 'dark');
    return currentTheme;
  }
  
  // Setup theme toggle button
  function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;
    
    const htmlElement = document.documentElement;
    const currentTheme = initTheme();
    
    // Set initial icon
    const icon = themeToggle.querySelector('.material-symbols-outlined');
    if (icon) {
      icon.textContent = currentTheme === 'dark' ? 'dark_mode' : 'light_mode';
    }
    
    // Add click handler
    themeToggle.addEventListener('click', function() {
      const isDark = htmlElement.classList.toggle('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      
      // Update icon
      if (icon) {
        icon.textContent = isDark ? 'dark_mode' : 'light_mode';
      }
      
      // Dispatch custom event for other components
      window.dispatchEvent(new CustomEvent('themeChanged', { 
        detail: { theme: isDark ? 'dark' : 'light' } 
      }));
    });
  }
  
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      initTheme();
      setupThemeToggle();
    });
  } else {
    initTheme();
    setupThemeToggle();
  }
})();
