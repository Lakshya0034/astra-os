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

// NASA APOD Background Loader
async function loadNasaApod() {
  const bgDiv = document.getElementById('desktop-bg');
  const infoBtn = document.getElementById('apod-info-btn');
  const infoCard = document.getElementById('apod-info-card');
  const titleEl = document.getElementById('apod-title');
  const dateEl = document.getElementById('apod-date');
  const explanationEl = document.getElementById('apod-explanation');
  const copyrightEl = document.getElementById('apod-copyright');

  if (!bgDiv) return;

  // 1. Try to load cached data instantly
  const cachedApod = localStorage.getItem('nasa_apod_data');
  if (cachedApod) {
    try {
      const data = JSON.parse(cachedApod);
      applyApodData(data, bgDiv, infoBtn, titleEl, dateEl, explanationEl, copyrightEl);
    } catch (e) {
      console.error('Failed to parse cached APOD', e);
    }
  }

  // 2. Fetch the latest from NASA in the background
  try {
    const response = await fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY');
    if (!response.ok) throw new Error('Failed to fetch APOD');
    const data = await response.json();

    if (data.media_type === 'image') {
      const imgUrl = data.url; // Use data.url (web-optimized) instead of hdurl for much faster loading

      // Update cache
      localStorage.setItem('nasa_apod_data', JSON.stringify(data));

      // If the displayed background does not match the newly fetched URL, preload and apply
      const currentBg = bgDiv.style.backgroundImage;
      if (!currentBg || !currentBg.includes(imgUrl)) {
        const tempImg = new Image();
        tempImg.src = imgUrl;
        tempImg.onload = () => {
          applyApodData(data, bgDiv, infoBtn, titleEl, dateEl, explanationEl, copyrightEl);
        };
      }
    } else if (!cachedApod) {
      loadFallbackBackground();
    }
  } catch (error) {
    console.error('Error fetching NASA APOD:', error);
    if (!cachedApod) {
      loadFallbackBackground();
    }
  }
}

function applyApodData(data, bgDiv, infoBtn, titleEl, dateEl, explanationEl, copyrightEl) {
  const imgUrl = data.url;
  bgDiv.style.backgroundImage = `url('${imgUrl}')`;
  
  if (titleEl) titleEl.textContent = data.title;
  if (dateEl) dateEl.textContent = new Date(data.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  if (explanationEl) explanationEl.textContent = data.explanation;
  if (copyrightEl) {
    copyrightEl.textContent = data.copyright ? `© ${data.copyright}` : '';
    copyrightEl.style.display = data.copyright ? 'block' : 'none';
  }

  if (infoBtn) infoBtn.style.display = 'flex';
}

function loadFallbackBackground() {
  const bgDiv = document.getElementById('desktop-bg');
  if (bgDiv) {
    // Beautiful space nebula image from Unsplash as fallback
    bgDiv.style.backgroundImage = `url('https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2048')`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Background
  if (window.System && window.System.initBackground) {
    window.System.initBackground('bg-canvas');
  }

  // Load NASA APOD Desktop Background
  loadNasaApod();

  // APOD Info Card event listeners
  const infoBtn = document.getElementById('apod-info-btn');
  const infoCard = document.getElementById('apod-info-card');
  const closeBtn = document.getElementById('apod-close-btn');

  if (infoBtn && infoCard) {
    infoBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      infoCard.classList.toggle('show');
      if (infoCard.classList.contains('show')) {
        biggestIndex++;
        infoCard.style.zIndex = biggestIndex;
      }
    });
  }

  if (closeBtn && infoCard) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      infoCard.classList.remove('show');
    });
  }

  // Close info card if user clicks elsewhere
  document.addEventListener('click', (e) => {
    if (infoCard && infoCard.classList.contains('show')) {
      if (!infoCard.contains(e.target) && e.target !== infoBtn) {
        infoCard.classList.remove('show');
      }
    }
  });

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
