// terminal.js - Cyberpunk Interactive CLI

class TerminalApp {
  static init() {
    this.history = [];
    this.historyIndex = -1;
    this.isActive = false;
    this.matrixInterval = null;
    this.matrixCanvas = null;
    this.matrixCtx = null;
  }

  static open() {
    openWindow('terminal');
    this.isActive = true;

    const body = document.getElementById('terminalbody');
    if (!body) return;

    // Check if initialized already
    if (body.querySelector('.terminal-container')) {
      // Focus input
      const input = body.querySelector('.terminal-input-field');
      if (input) input.focus();
      return;
    }

    body.innerHTML = `
      <div class="terminal-container">
        <div class="terminal-output" id="term-output">
          <div class="terminal-line system-line">ASTRA OS [VERSION 2.4.92-PROD]</div>
          <div class="terminal-line system-line">(C) 2026 ASTRA SYSTEMS CORP. ALL RIGHTS RESERVED.</div>
          <div class="terminal-line system-line">TYPE 'help' FOR A LIST OF AVAILABLE COMMANDS.</div>
          <br>
        </div>
        <div class="terminal-input-line">
          <span class="terminal-prompt">user@astra:~$</span>
          <input type="text" class="terminal-input-field" autofocus autocomplete="off" spellcheck="false">
        </div>
        <canvas id="terminal-matrix" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: auto; z-index: 10; background: #000;"></canvas>
      </div>
    `;

    const input = body.querySelector('.terminal-input-field');
    const container = body.querySelector('.terminal-container');

    // Click anywhere in terminal to focus input
    container.addEventListener('click', (e) => {
      if (this.matrixCanvas && this.matrixCanvas.style.display !== 'none') {
        this.stopMatrix();
        return;
      }
      input.focus();
    });

    // Handle keypresses
    input.addEventListener('keydown', (e) => this.handleInput(e, input, body));
    input.focus();
  }

  static handleInput(e, input, body) {
    if (e.key === 'Enter') {
      const commandString = input.value.trim();
      input.value = '';

      if (commandString) {
        this.history.push(commandString);
        this.historyIndex = this.history.length;
      }

      this.executeCommand(commandString, body);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (this.history.length > 0 && this.historyIndex > 0) {
        this.historyIndex--;
        input.value = this.history[this.historyIndex];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.history.length > 0 && this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        input.value = this.history[this.historyIndex];
      } else {
        this.historyIndex = this.history.length;
        input.value = '';
      }
    }
  }

  static printLine(text, type = '', body) {
    const output = body.querySelector('#term-output');
    if (!output) return;

    const line = document.createElement('div');
    line.className = `terminal-line ${type}`;
    line.textContent = text;
    output.appendChild(line);

    // Auto-scroll to bottom of the window body
    const winBody = document.getElementById('terminalbody');
    if (winBody) {
      winBody.scrollTop = winBody.scrollHeight;
    }
  }

  static printRawHTML(html, body) {
    const output = body.querySelector('#term-output');
    if (!output) return;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    output.appendChild(wrapper);

    const winBody = document.getElementById('terminalbody');
    if (winBody) {
      winBody.scrollTop = winBody.scrollHeight;
    }
  }

  static executeCommand(cmdStr, body) {
    this.printLine(`user@astra:~$ ${cmdStr}`, 'input-echo', body);
    const parts = cmdStr.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (!cmd) return;

    switch (cmd) {
      case 'help':
        this.printLine('AVAILABLE COMMANDS:', 'system-line', body);
        this.printLine('  help      - Display this information menu', '', body);
        this.printLine('  matrix    - Launch digital rain telemetry system', '', body);
        this.printLine('  hack      - Initialize simulated network exploit suite', '', body);
        this.printLine('  clear     - Wipe buffer screen', '', body);
        this.printLine('  exit      - Close terminal application', '', body);
        break;

      case 'clear':
        const output = body.querySelector('#term-output');
        if (output) output.innerHTML = '';
        break;

      case 'matrix':
        this.startMatrix(body);
        break;

      case 'hack':
        this.runHackSequence(body);
        break;

      case 'exit':
        closeWindow('terminal');
        break;

      default:
        this.printLine(`COMMAND NOT FOUND: '${cmd}'. Type 'help' for suggestions.`, 'error-line', body);
    }
  }

  static startMatrix(body) {
    this.matrixCanvas = body.querySelector('#terminal-matrix');
    if (!this.matrixCanvas) return;

    this.matrixCanvas.style.display = 'block';
    this.matrixCtx = this.matrixCanvas.getContext('2d');
    
    // Fit canvas dimensions
    const resizeCanvas = () => {
      this.matrixCanvas.width = this.matrixCanvas.offsetWidth;
      this.matrixCanvas.height = this.matrixCanvas.offsetHeight;
    };
    resizeCanvas();

    const columns = Math.floor(this.matrixCanvas.width / 14) + 1;
    const ypos = Array(columns).fill(0);

    const drawMatrix = () => {
      this.matrixCtx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      this.matrixCtx.fillRect(0, 0, this.matrixCanvas.width, this.matrixCanvas.height);

      this.matrixCtx.fillStyle = '#0f0';
      this.matrixCtx.font = '12px monospace';

      for (let i = 0; i < ypos.length; i++) {
        const text = String.fromCharCode(Math.random() * 128);
        const x = i * 14;
        const y = ypos[i];
        
        // Give some random characters a brighter/cyan color
        if (Math.random() > 0.98) {
          this.matrixCtx.fillStyle = '#00f0ff';
        } else {
          this.matrixCtx.fillStyle = '#0f0';
        }

        this.matrixCtx.fillText(text, x, y);

        if (y > 100 + Math.random() * 10000) {
          ypos[i] = 0;
        } else {
          ypos[i] += 14;
        }
      }
    };

    if (this.matrixInterval) clearInterval(this.matrixInterval);
    this.matrixInterval = setInterval(drawMatrix, 35);

    // Bind event handlers to class so we can detach them on exit
    this.exitHandler = (e) => {
      this.stopMatrix();
    };
    
    // Add both keydown and click/tap listeners to exit
    window.addEventListener('keydown', this.exitHandler);
    this.matrixCanvas.addEventListener('click', this.exitHandler);

    this.printLine("Press any key or click to exit telemetry streams.", 'system-line', body);
  }

  static stopMatrix() {
    if (this.matrixInterval) {
      clearInterval(this.matrixInterval);
      this.matrixInterval = null;
    }
    if (this.matrixCanvas) {
      this.matrixCanvas.style.display = 'none';
      if (this.exitHandler) {
        window.removeEventListener('keydown', this.exitHandler);
        this.matrixCanvas.removeEventListener('click', this.exitHandler);
        this.exitHandler = null;
      }
    }
    // Focus back on the input field
    const input = document.querySelector('#terminalbody .terminal-input-field');
    if (input) {
      input.focus();
    }
  }

  static runHackSequence(body) {
    const lines = [
      "CRACKING FIREWALL GATEWAY 882B...",
      "STAGED PAYLOAD INJECTED (OFFSET 0x7FFA204B)...",
      "BYPASSING KERNEL MEMORY LOCKS...",
      "DOWNLOADING SECURE CLASSIFIED ORBITAL DATA...",
      "SYSTEM DECRYPTED. TELEMETRY EXTRACTED SUCCESSFULLY."
    ];

    let current = 0;
    const interval = setInterval(() => {
      if (current < lines.length) {
        this.printLine(lines[current], current === lines.length - 1 ? 'system-line' : 'warning-line', body);
        current++;
      } else {
        clearInterval(interval);
      }
    }, 800);
  }

  static close() {
    this.isActive = false;
    this.stopMatrix();
    closeWindow('terminal');
  }
}

TerminalApp.init();
window.TerminalApp = TerminalApp;
