// Popup UI Controller
class PopupController {
  constructor() {
    this.config = {
      phoneNumber: '',
      password: '',
      pdfFile: null,
      preferredMission: '',
      preferredCenter: '',
      preferredDate: '',
      preferredTime: ''
    };
    this.isRunning = false;
    this.currentStep = 'Home';
    this.init();
  }

  init() {
    this.loadConfiguration();
    this.bindEvents();
    this.checkStatus();
    this.loadLogs();
  }

  bindEvents() {
    document.getElementById('saveBtn').addEventListener('click', () => this.saveConfiguration());
    document.getElementById('testFillBtn').addEventListener('click', () => this.testFormFill());
    document.getElementById('testDateTimeBtn').addEventListener('click', () => this.testDateTimeDetection());
    document.getElementById('startBtn').addEventListener('click', () => this.startAutomation());
    document.getElementById('stopBtn').addEventListener('click', () => this.stopAutomation());
    document.getElementById('resetBtn').addEventListener('click', () => this.resetConfiguration());
    document.getElementById('pdfFile').addEventListener('change', (e) => this.handleFileSelect(e));
  }

  async loadConfiguration() {
    try {
      const result = await chrome.storage.local.get(['appointmentConfig']);
      if (result.appointmentConfig) {
        this.config = { ...this.config, ...result.appointmentConfig };
        this.populateForm();
      }
    } catch (error) {
      this.log('Error loading configuration', 'error');
    }
  }

  populateForm() {
    document.getElementById('phoneNumber').value = this.config.phoneNumber || '';
    document.getElementById('password').value = this.config.password || '';
    document.getElementById('preferredMission').value = this.config.preferredMission || '';
    document.getElementById('preferredCenter').value = this.config.preferredCenter || '';
    document.getElementById('preferredDate').value = this.config.preferredDate || '';
    document.getElementById('preferredTime').value = this.config.preferredTime || '';
    
    if (this.config.pdfFileName) {
      document.getElementById('fileInfo').textContent = this.config.pdfFileName;
    }
  }

  handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Please select a PDF file');
        event.target.value = '';
        return;
      }
      this.config.pdfFile = file;
      this.config.pdfFileName = file.name;
      document.getElementById('fileInfo').textContent = file.name;
    }
  }

  async saveConfiguration() {
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    const password = document.getElementById('password').value;
    const preferredMission = document.getElementById('preferredMission').value;
    const preferredCenter = document.getElementById('preferredCenter').value;
    const preferredDate = document.getElementById('preferredDate').value;
    const preferredTime = document.getElementById('preferredTime').value;

    if (!phoneNumber || !password) {
      alert('Phone number and password are required');
      return;
    }

    this.config = {
      phoneNumber,
      password,
      pdfFileName: this.config.pdfFileName,
      preferredMission,
      preferredCenter,
      preferredDate,
      preferredTime
    };

    // Handle PDF file
    if (this.config.pdfFile) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        this.config.pdfData = e.target.result;
        await this.persistConfig();
      };
      reader.readAsDataURL(this.config.pdfFile);
    } else {
      await this.persistConfig();
    }
  }

  async persistConfig() {
    try {
      await chrome.storage.local.set({ appointmentConfig: this.config });
      this.log('Configuration saved successfully', 'success');
      alert('Configuration saved successfully!');
    } catch (error) {
      this.log('Error saving configuration', 'error');
      alert('Error saving configuration');
    }
  }

  async startAutomation() {
    if (!this.config.phoneNumber || !this.config.password) {
      alert('Please save your configuration first');
      return;
    }

    this.isRunning = true;
    document.getElementById('startBtn').disabled = true;
    document.getElementById('stopBtn').disabled = false;
    document.getElementById('saveBtn').disabled = true;

    try {
      // Send message to background script
      const response = await chrome.runtime.sendMessage({
        action: 'startAutomation',
        config: this.config
      });

      if (response && response.success) {
        this.log('Automation started', 'success');
        this.updateStatus('Running', 'active');
      } else {
        this.log('Failed to start automation', 'error');
        this.stopAutomation();
      }
    } catch (error) {
      this.log('Error starting automation', 'error');
      this.stopAutomation();
    }
  }

  async stopAutomation() {
    this.isRunning = false;
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
    document.getElementById('saveBtn').disabled = false;

    try {
      await chrome.runtime.sendMessage({ action: 'stopAutomation' });
      this.log('Automation stopped', 'info');
      this.updateStatus('Stopped', 'inactive');
    } catch (error) {
      this.log('Error stopping automation', 'error');
    }
  }

  async resetConfiguration() {
    if (confirm('Are you sure you want to reset all configuration?')) {
      this.config = {
        phoneNumber: '',
        password: '',
        pdfFile: null,
        pdfFileName: '',
        preferredMission: '',
        preferredCenter: '',
        preferredDate: '',
        preferredTime: ''
      };

      await chrome.storage.local.remove(['appointmentConfig']);
      this.populateForm();
      document.getElementById('fileInfo').textContent = 'No file selected';
      this.log('Configuration reset', 'info');
    }
  }

  async testFormFill() {
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    const password = document.getElementById('password').value;

    if (!phoneNumber || !password) {
      alert('Please enter phone number and password first');
      return;
    }

    const testConfig = {
      phoneNumber,
      password
    };

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        const response = await chrome.tabs.sendMessage(tab.id, {
          action: 'fillForms',
          config: testConfig
        });

        if (response && response.success) {
          this.log('Test form fill triggered', 'success');
          alert('Form fill test initiated. Check if fields are filled on the page.');
        } else {
          this.log('Test form fill failed', 'error');
          alert('Failed to trigger form fill. Make sure you are on the login page.');
        }
      }
    } catch (error) {
      this.log('Error in test form fill: ' + error.message, 'error');
      alert('Error: ' + error.message + '. Make sure you are on the IVAC BD website.');
    }
  }

  async testDateTimeDetection() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        const response = await chrome.tabs.sendMessage(tab.id, {
          action: 'testDateTimeDetection'
        });

        if (response && response.success) {
          this.log('Date/Time detection test completed', 'success');
          this.showDebugSection(response.data);
          alert('Date/Time detection completed. Check the debug panel below for details.');
        } else {
          this.log('Date/Time detection test failed', 'error');
          alert('Failed to detect date/time elements. Make sure you are on the appointment page.');
        }
      }
    } catch (error) {
      this.log('Error in date/time detection: ' + error.message, 'error');
      alert('Error: ' + error.message + '. Make sure you are on the IVAC BD appointment page.');
    }
  }

  showDebugSection(data) {
    const debugSection = document.getElementById('debugSection');
    debugSection.style.display = 'block';

    document.getElementById('datesFound').textContent = data.dates?.length || 0;
    document.getElementById('timesFound').textContent = data.times?.length || 0;
    document.getElementById('currentPage').textContent = data.page || 'Unknown';

    const dateElements = document.getElementById('dateElements');
    dateElements.innerHTML = '';
    if (data.dates && data.dates.length > 0) {
      data.dates.forEach(date => {
        const item = document.createElement('div');
        item.className = 'element-item';
        item.textContent = `${date.text} (${date.selector})`;
        dateElements.appendChild(item);
      });
    } else {
      dateElements.innerHTML = '<div class="element-item">No date elements detected</div>';
    }

    const timeElements = document.getElementById('timeElements');
    timeElements.innerHTML = '';
    if (data.times && data.times.length > 0) {
      data.times.forEach(time => {
        const item = document.createElement('div');
        item.className = 'element-item';
        item.textContent = `${time.text} (${time.selector})`;
        timeElements.appendChild(item);
      });
    } else {
      timeElements.innerHTML = '<div class="element-item">No time elements detected</div>';
    }
  }

  async checkStatus() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getStatus' });
      if (response) {
        this.updateStatus(response.status, response.isActive ? 'active' : 'inactive');
        this.currentStep = response.currentStep || 'Home';
        document.getElementById('currentStep').textContent = `Current Step: ${this.currentStep}`;
        
        if (response.suggestions && response.suggestions.length > 0) {
          this.displaySuggestions(response.suggestions);
        }
      }
    } catch (error) {
      this.updateStatus('Ready', 'inactive');
    }
  }

  updateStatus(text, state) {
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    
    statusText.textContent = text;
    statusDot.className = 'status-dot ' + state;
  }

  displaySuggestions(suggestions) {
    const section = document.getElementById('suggestionsSection');
    const container = document.getElementById('suggestions');
    
    container.innerHTML = suggestions.map(s => 
      `<div class="suggestion-item">${s}</div>`
    ).join('');
    
    section.style.display = 'block';
  }

  async loadLogs() {
    try {
      const result = await chrome.storage.local.get(['activityLogs']);
      const logs = result.activityLogs || [];
      this.renderLogs(logs);
    } catch (error) {
      this.log('Error loading logs', 'error');
    }
  }

  renderLogs(logs) {
    const container = document.getElementById('logs');
    const recentLogs = logs.slice(-20).reverse();
    
    container.innerHTML = recentLogs.map(log => 
      `<div class="log-entry ${log.type}">
        <strong>${log.timestamp}</strong>: ${log.message}
      </div>`
    ).join('');
  }

  async log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = { timestamp, message, type };
    
    try {
      const result = await chrome.storage.local.get(['activityLogs']);
      const logs = result.activityLogs || [];
      logs.push(logEntry);
      
      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      await chrome.storage.local.set({ activityLogs: logs });
      this.renderLogs(logs);
    } catch (error) {
      console.error('Error logging:', error);
    }
  }
}

// Initialize popup controller
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});
