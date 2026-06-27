// star_map.js - Star Map and Planetary System Explorer

class StarMapApp {
  static init() {
    this.isActive = false;
    this.animationId = null;
    this.canvas = null;
    this.ctx = null;
    
    this.planets = [
      {
        name: "Mercury",
        distance: 50,
        radius: 4,
        speed: 0.03,
        angle: Math.random() * Math.PI * 2,
        color: "#9e9e9e",
        classification: "TERRESTRIAL PLANET",
        temp: "430°C to -180°C",
        atmosphere: "EXOSPHERE (O, Na, H)",
        customLore: "The smallest planet in our Solar System and the closest to the Sun. It has no moons and experiences extreme temperature fluctuations.",
        scanStatus: "UNSCANNED"
      },
      {
        name: "Venus",
        distance: 75,
        radius: 7,
        speed: 0.02,
        angle: Math.random() * Math.PI * 2,
        color: "#e3bb76",
        classification: "TERRESTRIAL PLANET",
        temp: "462°C (AVERAGE)",
        atmosphere: "CO2, N2 (EXTREMELY DENSE)",
        customLore: "The second planet from the Sun. It has a runaway greenhouse effect making it the hottest planet, with clouds of sulfuric acid.",
        scanStatus: "UNSCANNED"
      },
      {
        name: "Earth",
        distance: 105,
        radius: 8,
        speed: 0.015,
        angle: Math.random() * Math.PI * 2,
        color: "#2f80ed",
        classification: "TERRESTRIAL PLANET",
        temp: "15°C (AVERAGE)",
        atmosphere: "N2, O2, Ar (BREATHABLE)",
        customLore: "Our home planet. The only known celestial body to support life, with liquid surface water covering 70.8% of its crust.",
        scanStatus: "UNSCANNED"
      },
      {
        name: "Mars",
        distance: 135,
        radius: 5,
        speed: 0.012,
        angle: Math.random() * Math.PI * 2,
        color: "#e27f6f",
        classification: "TERRESTRIAL PLANET",
        temp: "-62°C (AVERAGE)",
        atmosphere: "CO2, N2, Ar (THIN)",
        customLore: "The Red Planet. Iron oxide on its surface gives it a reddish appearance. Home to Olympus Mons, the largest volcano in the Solar System.",
        scanStatus: "UNSCANNED"
      },
      {
        name: "Jupiter",
        distance: 175,
        radius: 14,
        speed: 0.008,
        angle: Math.random() * Math.PI * 2,
        color: "#d4a373",
        classification: "GAS GIANT",
        temp: "-108°C (AVERAGE)",
        atmosphere: "H2, He (DENSE)",
        customLore: "The largest planet in the Solar System. It has a Great Red Spot (a giant storm wider than Earth) and dozens of moons.",
        scanStatus: "UNSCANNED"
      },
      {
        name: "Saturn",
        distance: 215,
        radius: 12,
        speed: 0.006,
        angle: Math.random() * Math.PI * 2,
        color: "#f4e2bb",
        classification: "GAS GIANT",
        temp: "-139°C (AVERAGE)",
        atmosphere: "H2, He",
        customLore: "Famous for its spectacular, extensive planetary ring system composed mostly of ice particles, rocky debris, and dust.",
        scanStatus: "UNSCANNED"
      },
      {
        name: "Uranus",
        distance: 255,
        radius: 10,
        speed: 0.004,
        angle: Math.random() * Math.PI * 2,
        color: "#a1e5f0",
        classification: "ICE GIANT",
        temp: "-197°C (AVERAGE)",
        atmosphere: "H2, He, CH4",
        customLore: "An ice giant with a unique pale blue-green color due to methane. It rotates on its side, nearly 90 degrees from its plane of orbit.",
        scanStatus: "UNSCANNED"
      },
      {
        name: "Neptune",
        distance: 295,
        radius: 10,
        speed: 0.003,
        angle: Math.random() * Math.PI * 2,
        color: "#4b70dd",
        classification: "ICE GIANT",
        temp: "-201°C (AVERAGE)",
        atmosphere: "H2, He, CH4",
        customLore: "The most distant planet from the Sun. It is a dark, cold ice giant whipped by supersonic winds exceeding 2,100 km/h.",
        scanStatus: "UNSCANNED"
      }
    ];

    this.selectedPlanet = this.planets[2]; // Earth default
    this.isScanning = false;
    this.scanProgress = 0;
  }

  static open() {
    openWindow('starmap');
    this.isActive = true;

    const body = document.getElementById('starmapbody');
    if (!body) return;

    body.innerHTML = `
      <div class="starmap-container">
        <!-- Visualization Area -->
        <div class="starmap-visual">
          <canvas id="starmap-canvas"></canvas>
          <div class="visual-overlay-text">THE SOLAR SYSTEM</div>
        </div>

        <!-- Telemetry Panel -->
        <div class="starmap-telemetry">
          <div class="telemetry-header">SYSTEM SENSOR TELEMETRY</div>
          
          <div class="search-container">
            <input type="text" class="starmap-search" placeholder="FILTER CELESTIAL BODIES...">
            <div class="search-results" id="search-results"></div>
          </div>

          <div class="telemetry-body" id="planet-details">
            <!-- Populated Dynamically -->
          </div>

          <button class="scanner-btn" id="scanner-trigger">INITIALIZE DEEP SCAN</button>
        </div>
      </div>
    `;

    this.canvas = body.querySelector('#starmap-canvas');
    this.ctx = this.canvas.getContext('2d');

    // Resize canvas
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Listen to canvas clicks to select planets
    this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));

    // Search/Filter listener
    const searchInput = body.querySelector('.starmap-search');
    searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));

    // Scanner listener
    const scanBtn = body.querySelector('#scanner-trigger');
    scanBtn.addEventListener('click', () => this.startScan(body));

    // Render initial details
    this.updateDetailsPanel();

    // Start animation loop
    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.animate();
  }

  static resizeCanvas() {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement;
    this.canvas.width = parent.clientWidth;
    this.canvas.height = parent.clientHeight;
  }

  static handleCanvasClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    // Check if we clicked any planet
    let clickedAny = false;
    for (const planet of this.planets) {
      const px = centerX + Math.cos(planet.angle) * planet.distance;
      const py = centerY + Math.sin(planet.angle) * planet.distance;

      const dist = Math.sqrt((clickX - px) ** 2 + (clickY - py) ** 2);
      if (dist <= planet.radius + 8) { // buffer click target
        this.selectedPlanet = planet;
        clickedAny = true;
        this.updateDetailsPanel();
        break;
      }
    }
  }

  static handleSearch(query) {
    const results = document.getElementById('search-results');
    if (!results) return;

    if (!query) {
      results.style.display = 'none';
      return;
    }

    const matched = this.planets.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
    if (matched.length === 0) {
      results.innerHTML = `<div class="search-item">NO BODIES FOUND</div>`;
    } else {
      results.innerHTML = matched.map(p => `
        <div class="search-item" data-name="${p.name}">${p.name.toUpperCase()}</div>
      `).join('');

      results.querySelectorAll('.search-item').forEach(item => {
        item.addEventListener('click', () => {
          const name = item.getAttribute('data-name');
          this.selectedPlanet = this.planets.find(p => p.name === name);
          this.updateDetailsPanel();
          results.style.display = 'none';
          document.querySelector('.starmap-search').value = '';
        });
      });
    }
    results.style.display = 'block';
  }

  static startScan(body) {
    if (this.isScanning) return;

    this.isScanning = true;
    this.scanProgress = 0;
    const btn = body.querySelector('#scanner-trigger');
    btn.disabled = true;
    btn.innerText = "SCANNING SYSTEM...";

    const scanInterval = setInterval(() => {
      this.scanProgress += 2;
      this.updateDetailsPanel();

      if (this.scanProgress >= 100) {
        clearInterval(scanInterval);
        this.isScanning = false;
        this.selectedPlanet.scanStatus = "COMPLETED";
        btn.disabled = false;
        btn.innerText = "INITIALIZE DEEP SCAN";
        this.updateDetailsPanel();
      }
    }, 50);
  }

  static updateDetailsPanel() {
    const details = document.getElementById('planet-details');
    if (!details) return;

    const p = this.selectedPlanet;
    
    let scanHTML = '';
    if (this.isScanning) {
      scanHTML = `
        <div class="scanner-status-bar">
          <div class="scanner-progress" style="width: ${this.scanProgress}%"></div>
          <span class="scanner-pct">${this.scanProgress}%</span>
        </div>
        <div style="font-size: 10px; color: var(--accent-cyan); text-align: center; margin-top: 4px;">RECEIVING DEEP SPECTROMETRY TELEMETRY...</div>
      `;
    } else {
      scanHTML = `
        <div class="scan-status-indicator ${p.scanStatus.toLowerCase()}">
          DATA SENSOR LEVEL: ${p.scanStatus}
        </div>
      `;
    }

    details.innerHTML = `
      <div class="planet-name-title" style="color: ${p.color};">${p.name.toUpperCase()}</div>
      <div class="planet-stat-grid">
        <div class="stat-label">CLASSIFICATION:</div>
        <div class="stat-val">${p.classification}</div>

        <div class="stat-label">SURFACE TEMP:</div>
        <div class="stat-val">${p.temp}</div>

        <div class="stat-label">ATMOSPHERE:</div>
        <div class="stat-val">${p.atmosphere}</div>

        <div class="stat-label">DISTANCE FROM STAR:</div>
        <div class="stat-val">${p.distance} Million km</div>
      </div>
      
      <div class="lore-box">
        <div class="lore-header">HISTORICAL OVERVIEW</div>
        <div class="lore-content">${p.scanStatus === 'COMPLETED' ? p.customLore : 'INSUFFICIENT SENSOR DATA. RUN DEEP SCAN TO DECRYPT HISTORICAL OVERVIEW.'}</div>
      </div>

      <div class="scan-section">
        ${scanHTML}
      </div>
    `;
  }

  static animate() {
    if (!this.isActive) return;

    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    this.ctx.fillStyle = "rgba(7, 9, 19, 0.2)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw central star
    const glowGrad = this.ctx.createRadialGradient(centerX, centerY, 2, centerX, centerY, 22);
    glowGrad.addColorStop(0, "#fff5cc");
    glowGrad.addColorStop(0.3, "#ffcc00");
    glowGrad.addColorStop(0.8, "rgba(255, 170, 0, 0.15)");
    glowGrad.addColorStop(1, "rgba(255, 170, 0, 0)");
    
    this.ctx.fillStyle = glowGrad;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, 22, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw Orbits & Planets
    this.planets.forEach(p => {
      // Orbit Line
      this.ctx.strokeStyle = "rgba(0, 240, 255, 0.08)";
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, p.distance, 0, Math.PI * 2);
      this.ctx.stroke();

      // Update angle
      p.angle += p.speed;

      // Planet Position
      const px = centerX + Math.cos(p.angle) * p.distance;
      const py = centerY + Math.sin(p.angle) * p.distance;

      // Highlight Selected Planet
      if (this.selectedPlanet === p) {
        this.ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([2, 2]);
        this.ctx.beginPath();
        this.ctx.arc(px, py, p.radius + 5, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
      }

      // Draw Planet
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(px, py, p.radius, 0, Math.PI * 2);
      this.ctx.fill();

      // Scanner Sweep Visual
      if (this.isScanning && this.selectedPlanet === p) {
        const sweepRad = p.radius + 3 + Math.sin(Date.now() / 100) * 4;
        this.ctx.strokeStyle = "rgba(0, 255, 204, 0.6)";
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.arc(px, py, sweepRad, 0, Math.PI * 2);
        this.ctx.stroke();
      }
    });

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  static close() {
    this.isActive = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    closeWindow('starmap');
  }
}

StarMapApp.init();
window.StarMapApp = StarMapApp;
