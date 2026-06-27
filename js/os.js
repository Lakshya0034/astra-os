// os.js - OS / Desktop environment manager

// Global Window Manager variables and functions
let biggestIndex = 1000;

function openWindow(id) {
  const win = document.getElementById(id);
  if (win) {
    win.style.display = 'flex';
    biggestIndex++;
    win.style.zIndex = biggestIndex;
    
    document.querySelectorAll('.window').forEach(w => w.classList.remove('active-window'));
    win.classList.add('active-window');
  }
}

function closeWindow(id) {
  const win = document.getElementById(id);
  if (win) {
    win.style.display = 'none';
    win.classList.remove('active-window');
  }
}

function dragElement(elmnt) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  const header = document.getElementById(elmnt.id + "header");
  
  if (header) {
    header.onmousedown = dragMouseDown;
  } else {
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    if (elmnt.classList.contains('maximized')) return;
    
    e = e || window.event;
    if (e.target.classList.contains('control-btn')) return;

    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

function initializeWindow(id) {
  const win = document.getElementById(id);
  if (!win) return;

  dragElement(win);

  win.addEventListener('mousedown', () => {
    biggestIndex++;
    win.style.zIndex = biggestIndex;
    
    document.querySelectorAll('.window').forEach(w => w.classList.remove('active-window'));
    win.classList.add('active-window');
  });

  // Close Control
  const closeBtn = document.getElementById(id + "close") || win.querySelector('.control-close');
  if (closeBtn) {
    closeBtn.onclick = () => {
      closeWindow(id);
      if (id === 'launchtracker' && window.LaunchTrackerApp && window.LaunchTrackerApp.timerInterval) {
        clearInterval(window.LaunchTrackerApp.timerInterval);
      }
      if (id === 'terminal' && window.TerminalApp) {
        window.TerminalApp.close();
      }
      if (id === 'starmap' && window.StarMapApp) {
        window.StarMapApp.close();
      }
    };
  }

  // Minimize Control
  const minimizeBtn = win.querySelector('.control-minimize');
  if (minimizeBtn) {
    minimizeBtn.onclick = () => {
      closeWindow(id); // Minimizing hides the window
    };
  }

  // Maximize / Restore Control
  const maximizeBtn = win.querySelector('.control-maximize');
  if (maximizeBtn) {
    maximizeBtn.onclick = () => {
      if (win.classList.contains('maximized')) {
        // Restore
        win.classList.remove('maximized');
        win.style.top = win.dataset.preMaxTop || '15%';
        win.style.left = win.dataset.preMaxLeft || '20%';
        win.style.width = win.dataset.preMaxWidth || '480px';
        win.style.height = win.dataset.preMaxHeight || '380px';
      } else {
        // Save current bounds
        win.dataset.preMaxTop = win.style.top || '15%';
        win.dataset.preMaxLeft = win.style.left || '20%';
        win.dataset.preMaxWidth = win.style.width || win.clientWidth + 'px';
        win.dataset.preMaxHeight = win.style.height || win.clientHeight + 'px';

        // Maximize
        win.classList.add('maximized');
        win.style.top = '40px'; // directly below top bar
        win.style.left = '0';
        win.style.width = '100vw';
        win.style.height = 'calc(100vh - 40px)';
      }
    };
  }
}

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

  // Initialize Windows
  initializeWindow('launchtracker');
  initializeWindow('terminal');
  initializeWindow('starmap');

  // App Dropdown Logic
  const appTrigger = document.getElementById('app-dropdown-trigger');
  const appDropdown = document.getElementById('app-dropdown');
  
  if (appTrigger && appDropdown) {
    appTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      appDropdown.classList.toggle('show');
    });

    document.addEventListener('click', () => {
      appDropdown.classList.remove('show');
    });

    document.getElementById('dropdown-launch-tracker').addEventListener('click', (e) => {
      e.stopPropagation();
      appDropdown.classList.remove('show');
      if (window.LaunchTrackerApp) window.LaunchTrackerApp.open();
    });

    document.getElementById('dropdown-terminal').addEventListener('click', (e) => {
      e.stopPropagation();
      appDropdown.classList.remove('show');
      if (window.TerminalApp) window.TerminalApp.open();
    });

    document.getElementById('dropdown-starmap').addEventListener('click', (e) => {
      e.stopPropagation();
      appDropdown.classList.remove('show');
      if (window.StarMapApp) window.StarMapApp.open();
    });
  }

  // Desktop Shortcut Handlers
  const bindShortcut = (elemId, openFn) => {
    const el = document.getElementById(elemId);
    if (el) {
      el.addEventListener('dblclick', openFn);
      // Touch support or fallback single click with a delay/hint if user prefers:
      el.addEventListener('click', (e) => {
        // Highlight effect
        document.querySelectorAll('.shortcut-icon').forEach(x => x.classList.remove('selected'));
        el.classList.add('selected');
      });
    }
  };

  bindShortcut('shortcut-launch-tracker', () => {
    if (window.LaunchTrackerApp) window.LaunchTrackerApp.open();
  });
  bindShortcut('shortcut-terminal', () => {
    if (window.TerminalApp) window.TerminalApp.open();
  });
  bindShortcut('shortcut-starmap', () => {
    if (window.StarMapApp) window.StarMapApp.open();
  });

  // Open Launch Tracker by default on startup
  setTimeout(() => {
    if (window.LaunchTrackerApp) {
      window.LaunchTrackerApp.open();
    }
  }, 500);
});
