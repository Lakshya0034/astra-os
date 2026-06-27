// os.js - OS / Desktop environment manager

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Background
  if (window.System && window.System.initBackground) {
    window.System.initBackground('bg-canvas');
  }

  // Clock Update
  const clockElement = document.getElementById('system-clock');
  if (clockElement) {
    const updateClock = () => {
      const now = new Date();
      const options = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      clockElement.textContent = now.toLocaleDateString('en-US', options).replace(',', '');
    };

    updateClock();
    setInterval(updateClock, 1000);
  }

  // App Launcher Triggers
  const menuItems = document.querySelectorAll('.menu-item');
  menuItems.forEach(item => {
    if (item.textContent.trim() === 'Applications') {
      item.addEventListener('click', () => {
        if (window.LaunchTrackerApp) {
          window.LaunchTrackerApp.open();
        }
      });
    }
  });

  // Open Launch Tracker by default on startup
  setTimeout(() => {
    if (window.LaunchTrackerApp) {
      window.LaunchTrackerApp.open();
    }
  }, 500);
});
