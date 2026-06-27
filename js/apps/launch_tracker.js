// launch_tracker.js - Launch Tracker Desktop Application

class LaunchTrackerApp {
  static init() {
    this.launches = [
      {
        rocket: "Starship (IFT-5)",
        mission: "Starship Flight 5 Test",
        site: "Starbase, Boca Chica, TX",
        countdown: "01d : 14h : 05m",
        status: "GO FOR LAUNCH",
        statusCode: "status-go"
      },
      {
        rocket: "Falcon 9",
        mission: "Crew-9 Astronaut Launch",
        site: "LC-39A, Kennedy Space Center",
        countdown: "05d : 08h : 12m",
        status: "GO FOR LAUNCH",
        statusCode: "status-go"
      },
      {
        rocket: "SLS Block 1",
        mission: "Artemis II Crewed Lunar Orbit",
        site: "LC-39B, Kennedy Space Center",
        countdown: "94d : 11h : 45m",
        status: "STANDBY",
        statusCode: "status-standby"
      },
      {
        rocket: "Falcon Heavy",
        mission: "Europa Clipper Astrobiology Probe",
        site: "LC-39A, Kennedy Space Center",
        countdown: "HOLD",
        status: "SYSTEM CHECK",
        statusCode: "status-hold"
      }
    ];
  }

  static open() {
    let win = document.getElementById('win-launch-tracker');
    if (win) {
      this.bringToFront(win);
      return;
    }

    win = document.createElement('div');
    win.id = 'win-launch-tracker';
    win.className = 'window active-window';
    win.style.left = '120px';
    win.style.top = '100px';

    win.innerHTML = `
      <div class="window-header">
        <div class="window-title">LAUNCH TRACKER</div>
        <div class="window-controls">
          <button class="control-btn control-minimize" title="Minimize"></button>
          <button class="control-btn control-maximize" title="Maximize"></button>
          <button class="control-btn control-close" title="Close"></button>
        </div>
      </div>
      <div class="window-body">
        <div class="launch-tracker">
          <div class="tracker-title">UPCOMING SPACE MISSIONS</div>
          <div class="launch-cards-container">
            ${this.launches.map(launch => `
              <div class="launch-card ${launch.statusCode}">
                <div class="launch-info-left">
                  <div class="launch-rocket">${launch.rocket}</div>
                  <div class="launch-mission">${launch.mission}</div>
                  <div class="launch-site">${launch.site}</div>
                </div>
                <div class="launch-info-right">
                  <div class="launch-countdown">${launch.countdown}</div>
                  <div class="launch-status">${launch.status}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    document.querySelector('.desktop-container').appendChild(win);
    this.makeDraggable(win);
    this.setupWindowEvents(win);
    this.bringToFront(win);
  }

  static setupWindowEvents(win) {
    const closeBtn = win.querySelector('.control-close');
    closeBtn.addEventListener('click', () => win.remove());

    win.addEventListener('mousedown', () => this.bringToFront(win));
  }

  static makeDraggable(win) {
    const header = win.querySelector('.window-header');
    let isDragging = false;
    let startX, startY;
    let initialX, initialY;

    header.addEventListener('mousedown', (e) => {
      // Don't drag if clicking buttons
      if (e.target.classList.contains('control-btn')) return;

      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      
      const rect = win.getBoundingClientRect();
      initialX = rect.left;
      initialY = rect.top;

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      // Restrict dragging slightly inside boundaries if wanted, or basic position updates:
      const newX = initialX + dx;
      const newY = initialY + dy;

      win.style.left = `${newX}px`;
      win.style.top = `${newY}px`;
    };

    const onMouseUp = () => {
      isDragging = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }

  static bringToFront(win) {
    // Deactivate other windows
    document.querySelectorAll('.window').forEach(w => {
      w.classList.remove('active-window');
      w.style.zIndex = '999';
    });
    
    // Activate this window
    win.classList.add('active-window');
    win.style.zIndex = '1000';
  }
}

// Initialize on load
LaunchTrackerApp.init();

// Export to system namespace
window.LaunchTrackerApp = LaunchTrackerApp;
