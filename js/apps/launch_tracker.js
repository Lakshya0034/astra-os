// launch_tracker.js - Launch Tracker Desktop Application

class LaunchTrackerApp {
  static init() {
    this.launches = [];
    this.isLoading = false;
    this.timerInterval = null;
  }

  static async open() {
    // Open the static window using the global function
    openWindow('launchtracker');

    const body = document.getElementById('launchtrackerbody');
    if (!body) return;

    // Inject initial tracker container & loading state
    body.innerHTML = `
      <div class="launch-tracker">
        <div class="tracker-title">UPCOMING SPACE MISSIONS</div>
        <div class="launch-cards-container" id="tracker-cards">
          <div style="text-align: center; color: var(--accent-cyan); font-family: var(--font-display); padding: 40px 0; font-size: 12px; letter-spacing: 2px; animation: pulse 1.5s infinite;">
            CONNECTING TO MISSION CONTROL...
          </div>
        </div>
      </div>
    `;

    // Fetch and populate data
    await this.loadLaunchData(body);
  }

  static async loadLaunchData(body) {
    const container = body.querySelector('#tracker-cards');
    if (!container) return;

    try {
      this.isLoading = true;
      // Fetch from live production API first
      let response;
      try {
        response = await fetch('https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=5');
        if (!response.ok) throw new Error('Production rate limit or error');
      } catch (prodErr) {
        console.warn('Production API failed, falling back to developer sandbox:', prodErr);
        response = await fetch('https://lldev.thespacedevs.com/2.2.0/launch/upcoming/?limit=5');
      }
      
      if (!response.ok) throw new Error('Both APIs failed');
      
      const data = await response.json();
      this.launches = (data.results || []).map(item => {
        const statusName = item.status ? item.status.name.toUpperCase() : 'UNKNOWN';
        let statusCode = 'status-standby';
        if (statusName.includes('GO')) statusCode = 'status-go';
        if (statusName.includes('HOLD') || statusName.includes('DELAY')) statusCode = 'status-hold';

        return {
          rocket: item.rocket?.configuration?.name || 'Unknown Rocket',
          mission: item.mission?.name || 'Classified Payload',
          site: item.pad?.location?.name || 'Unknown Pad',
          net: item.net,
          status: statusName,
          statusCode: statusCode
        };
      });

      if (this.launches.length === 0) {
        container.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 12px; padding: 20px;">NO UPCOMING LAUNCHES FOUND</div>`;
        return;
      }

      this.renderCards(container);
      this.startCountdownTicker(body);

    } catch (err) {
      console.error(err);
      container.innerHTML = `
        <div style="text-align: center; color: var(--accent-magenta); font-size: 11px; padding: 20px; border: 1px dashed rgba(255,0,127,0.3); border-radius: 4px;">
          CONNECTION FAILED. TELEMETRY OFFLINE.
        </div>
      `;
    } finally {
      this.isLoading = false;
    }
  }

  static renderCards(container) {
    container.innerHTML = this.launches.map((launch, idx) => `
      <div class="launch-card ${launch.statusCode}" data-index="${idx}">
        <div class="launch-info-left">
          <div class="launch-rocket">${launch.rocket}</div>
          <div class="launch-mission">${launch.mission}</div>
          <div class="launch-site">${launch.site}</div>
        </div>
        <div class="launch-info-right">
          <div class="launch-countdown" data-net="${launch.net}">Calculating...</div>
          <div class="launch-status">${launch.status}</div>
        </div>
      </div>
    `).join('');
  }

  static startCountdownTicker(body) {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    const updateCountdowns = () => {
      const countdownElements = body.querySelectorAll('.launch-countdown');
      countdownElements.forEach(el => {
        const netTime = el.getAttribute('data-net');
        if (!netTime) return;

        const diff = new Date(netTime) - new Date();
        if (diff <= 0) {
          el.textContent = "LIFTOFF";
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const mins = Math.floor((diff / (1000 * 60)) % 60);
        const secs = Math.floor((diff / 1000) % 60);

        el.textContent = `${days}d : ${String(hours).padStart(2, '0')}h : ${String(mins).padStart(2, '0')}m : ${String(secs).padStart(2, '0')}s`;
      });
    };

    updateCountdowns();
    this.timerInterval = setInterval(updateCountdowns, 1000);
  }
}

// Initialize on load
LaunchTrackerApp.init();

// Export to system namespace
window.LaunchTrackerApp = LaunchTrackerApp;
