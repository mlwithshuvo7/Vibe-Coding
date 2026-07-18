// Background Service Worker - State Management
class BackgroundController {
  constructor() {
    this.workflowStates = [
      'Home',
      'Login',
      'OTP Verification',
      'Applicant Information',
      'Mission Selection',
      'IVAC Center Selection',
      'Instructions',
      'Appointment Selection',
      'Payment',
      'Confirmation',
      'Completed'
    ];
    
    this.currentState = 'Home';
    this.isRunning = false;
    this.config = null;
    this.suggestions = [];
    this.currentTabId = null;
    
    this.init();
  }

  init() {
    // Listen for extension installation
    chrome.runtime.onInstalled.addListener(() => {
      this.log('Extension installed', 'info');
    });

    // Listen for messages from popup and content scripts
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep message channel open for async response
    });

    // Listen for tab updates
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url) {
        this.handleTabUpdate(tabId, tab);
      }
    });

    // Load saved state
    this.loadState();
  }

  async handleMessage(message, sender, sendResponse) {
    switch (message.action) {
      case 'startAutomation':
        await this.startAutomation(message.config, sender.tab?.id);
        sendResponse({ success: true });
        break;
        
      case 'stopAutomation':
        await this.stopAutomation();
        sendResponse({ success: true });
        break;
        
      case 'getStatus':
        sendResponse({
          status: this.isRunning ? 'Running' : 'Stopped',
          isActive: this.isRunning,
          currentStep: this.currentState,
          suggestions: this.suggestions
        });
        break;
        
      case 'updateStatus':
        await this.updateStatus(message.currentStep, message.isRunning);
        sendResponse({ success: true });
        break;
        
      case 'showSuggestion':
        this.addSuggestion(message.suggestion);
        sendResponse({ success: true });
        break;
        
      case 'log':
        await this.log(message.message, message.type, message.step);
        sendResponse({ success: true });
        break;
        
      case 'getConfig':
        sendResponse({ config: this.config });
        break;
        
      default:
        sendResponse({ success: false, error: 'Unknown action' });
    }
  }

  async startAutomation(config, tabId) {
    try {
      this.config = config;
      this.isRunning = true;
      this.currentState = 'Home';
      this.suggestions = [];
      this.currentTabId = tabId;
      
      await this.saveState();
      await this.log('Automation started', 'success', 'Home');
      
      // Inject content script if needed
      if (tabId) {
        await chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ['content.js']
        });
      }
      
      // Notify all tabs
      const tabs = await chrome.tabs.query({});
      for (const tab of tabs) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            action: 'startAutomation',
            config: this.config
          });
        } catch (error) {
          // Tab might not be loaded, ignore
        }
      }
      
    } catch (error) {
      await this.log('Error starting automation: ' + error.message, 'error', 'Home');
      this.isRunning = false;
    }
  }

  async stopAutomation() {
    try {
      this.isRunning = false;
      this.suggestions = [];
      
      await this.saveState();
      await this.log('Automation stopped', 'info', this.currentState);
      
      // Notify all tabs
      const tabs = await chrome.tabs.query({});
      for (const tab of tabs) {
        try {
          await chrome.tabs.sendMessage(tab.id, { action: 'stopAutomation' });
        } catch (error) {
          // Tab might not be loaded, ignore
        }
      }
      
    } catch (error) {
      await this.log('Error stopping automation: ' + error.message, 'error', this.currentState);
    }
  }

  async updateStatus(currentStep, isRunning) {
    this.currentState = currentStep;
    this.isRunning = isRunning;
    
    await this.saveState();
    
    // Update badge
    this.updateBadge();
  }

  addSuggestion(suggestion) {
    this.suggestions.push(suggestion);
    
    // Keep only last 5 suggestions
    if (this.suggestions.length > 5) {
      this.suggestions = this.suggestions.slice(-5);
    }
    
    // Show notification
    this.showNotification('💡 Suggestion', suggestion);
  }

  async handleTabUpdate(tabId, tab) {
    if (!this.isRunning) return;
    
    // Content script will handle page detection
    try {
      await chrome.tabs.sendMessage(tabId, { action: 'pageUpdated' });
    } catch (error) {
      // Content script might not be loaded yet
    }
  }

  updateBadge() {
    const stepIndex = this.workflowStates.indexOf(this.currentState);
    const badgeText = this.isRunning ? (stepIndex + 1).toString() : '';
    const badgeColor = this.isRunning ? '#28a745' : '#6c757d';
    
    chrome.action.setBadgeText({ text: badgeText });
    chrome.action.setBadgeBackgroundColor({ color: badgeColor });
  }

  showNotification(title, message) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: title,
      message: message,
      priority: 2
    });
  }

  async log(message, type = 'info', step = 'General') {
    const timestamp = new Date().toLocaleString();
    const logEntry = {
      timestamp,
      message,
      type,
      step,
      url: this.currentTabId ? (await chrome.tabs.get(this.currentTabId)).url : 'N/A'
    };
    
    try {
      const result = await chrome.storage.local.get(['activityLogs']);
      const logs = result.activityLogs || [];
      logs.push(logEntry);
      
      // Keep only last 200 logs
      if (logs.length > 200) {
        logs.splice(0, logs.length - 200);
      }
      
      await chrome.storage.local.set({ activityLogs: logs });
      
      // Also log to console for debugging
      console.log(`[${type.toUpperCase()}] ${step}: ${message}`);
      
    } catch (error) {
      console.error('Error logging:', error);
    }
  }

  async saveState() {
    try {
      await chrome.storage.local.set({
        workflowState: {
          currentState: this.currentState,
          isRunning: this.isRunning,
          config: this.config,
          suggestions: this.suggestions
        }
      });
    } catch (error) {
      console.error('Error saving state:', error);
    }
  }

  async loadState() {
    try {
      const result = await chrome.storage.local.get(['workflowState']);
      if (result.workflowState) {
        this.currentState = result.workflowState.currentState || 'Home';
        this.isRunning = result.workflowState.isRunning || false;
        this.config = result.workflowState.config || null;
        this.suggestions = result.workflowState.suggestions || [];
        
        this.updateBadge();
      }
    } catch (error) {
      console.error('Error loading state:', error);
    }
  }

  async resetState() {
    this.currentState = 'Home';
    this.isRunning = false;
    this.config = null;
    this.suggestions = [];
    
    await this.saveState();
    await this.log('State reset', 'info', 'Home');
    this.updateBadge();
  }
}

// Initialize background controller
const backgroundController = new BackgroundController();

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
  backgroundController.loadState();
});
