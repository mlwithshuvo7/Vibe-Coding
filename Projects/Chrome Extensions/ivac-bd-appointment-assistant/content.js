// Content Script - Page Detection and Automation
class AppointmentAutomation {
  constructor() {
    this.currentStep = 'Home';
    this.config = null;
    this.isRunning = false;
    this.automationInterval = null;
    this.init();
  }

  async init() {
    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sendResponse);
      return true; // Keep message channel open for async response
    });

    // Detect current page and initialize appropriate handlers
    this.detectPage();
  }

  handleMessage(message, sendResponse) {
    this.log(`Received message: ${message.action}`, 'info');
    
    switch (message.action) {
      case 'startAutomation':
        this.config = message.config;
        this.isRunning = true;
        this.log('Starting automation with config', 'info');
        this.startAutomation();
        sendResponse({ success: true });
        break;
      case 'stopAutomation':
        this.isRunning = false;
        this.stopAutomation();
        sendResponse({ success: true });
        break;
      case 'getConfig':
        sendResponse({ config: this.config, currentStep: this.currentStep });
        break;
      case 'fillForms':
        this.log('Manual fill forms triggered', 'info');
        this.config = message.config;
        this.fillPhoneNumber();
        this.fillPassword();
        sendResponse({ success: true });
        break;
      case 'detectPage':
        this.detectPage();
        sendResponse({ success: true, currentStep: this.currentStep });
        break;
      case 'testDateTimeDetection':
        const debugData = this.performDateTimeDebug();
        sendResponse({ success: true, data: debugData });
        break;
      default:
        sendResponse({ success: false });
    }
  }

  detectPage() {
    const url = window.location.href;
    const title = document.title;

    this.log(`Detecting page: ${url}`, 'info');

    // IVAC BD specific page detection - handle SPA
    if (url.includes('appointment.ivacbd.com') || url.includes('ivac.bd.com') || url.includes('visa.gov.bd')) {
      // For IVAC BD SPA, we need to detect based on page content since URL might not change
      this.detectIVACPageByContent();
    } else {
      // Generic detection for other sites
      if (url.includes('login') || title.includes('Sign In')) {
        this.currentStep = 'Login';
        this.initLoginPage();
      } else if (url.includes('otp') || title.includes('OTP') || this.hasOTPFields()) {
        this.currentStep = 'OTP';
        this.initOTPPage();
      } else if (url.includes('applicant') || title.includes('Applicant')) {
        this.currentStep = 'Applicant Information';
        this.initApplicantPage();
      } else if (url.includes('mission') || title.includes('Mission')) {
        this.currentStep = 'Mission Selection';
        this.initMissionPage();
      } else if (url.includes('instruction') || title.includes('Instruction')) {
        this.currentStep = 'Instructions';
        this.initInstructionPage();
      } else if (url.includes('appointment') || title.includes('Appointment')) {
        this.currentStep = 'Appointment Selection';
        this.initAppointmentPage();
      } else if (url.includes('payment') || title.includes('Payment')) {
        this.currentStep = 'Payment';
        this.initPaymentPage();
      } else if (url.includes('confirm') || title.includes('Confirm')) {
        this.currentStep = 'Confirmation';
        this.initConfirmationPage();
      } else {
        this.currentStep = 'Home';
        this.initHomePage();
      }
    }

    this.updateBackgroundStatus();
  }

  detectIVACPageByContent() {
    // Wait for React app to load
    const checkReactLoaded = setInterval(() => {
      const root = document.getElementById('root');
      if (root && root.children.length > 0) {
        clearInterval(checkReactLoaded);
        this.analyzeIVACContent();
      }
    }, 500);

    // Timeout after 10 seconds
    setTimeout(() => {
      clearInterval(checkReactLoaded);
      this.log('React app timeout, defaulting to Home', 'error');
      this.currentStep = 'Home';
      this.initHomePage();
    }, 10000);
  }

  analyzeIVACContent() {
    const bodyText = document.body.innerText.toLowerCase();
    const url = window.location.href;

    this.log('Analyzing IVAC page content...', 'info');

    // Check for login form
    if (this.findPhoneInput() && this.findPasswordInput()) {
      this.log('Detected login page by form fields', 'success');
      this.currentStep = 'Login';
      this.initLoginPage();
      return;
    }

    // Check for OTP fields
    if (this.hasOTPFields()) {
      this.log('Detected OTP page', 'success');
      this.currentStep = 'OTP';
      this.initOTPPage();
      return;
    }

    // Check for appointment/calendar
    if (bodyText.includes('appointment') || bodyText.includes('schedule') || bodyText.includes('calendar') || bodyText.includes('booking')) {
      this.log('Detected appointment page', 'success');
      this.currentStep = 'Appointment Selection';
      this.initAppointmentPage();
      return;
    }

    // Check for mission/center selection
    if (bodyText.includes('mission') || bodyText.includes('center') || bodyText.includes('location')) {
      this.log('Detected mission/center selection page', 'success');
      this.currentStep = 'Mission Selection';
      this.initMissionPage();
      return;
    }

    // Check for payment
    if (bodyText.includes('payment') || bodyText.includes('pay')) {
      this.log('Detected payment page', 'success');
      this.currentStep = 'Payment';
      this.initPaymentPage();
      return;
    }

    // Check for confirmation
    if (bodyText.includes('confirm') || bodyText.includes('review') || bodyText.includes('summary')) {
      this.log('Detected confirmation page', 'success');
      this.currentStep = 'Confirmation';
      this.initConfirmationPage();
      return;
    }

    // Default to home
    this.log('Defaulting to home page', 'info');
    this.currentStep = 'Home';
    this.initHomePage();
  }

  hasOTPFields() {
    const otpInputs = document.querySelectorAll('input[type="text"][maxlength="1"], input[placeholder*="OTP"], input[placeholder*="digit"]');
    return otpInputs.length >= 4;
  }

  initHomePage() {
    this.log('Detected Home Page', 'info');
    // Wait for user to click "Make Your Appointment" button
    this.waitForElement('button, a', (element) => {
      if (element.textContent.includes('Appointment') || element.textContent.includes('Book')) {
        this.log('Appointment button found', 'success');
      }
    });
  }

  initLoginPage() {
    this.log('Detected Login Page', 'info');
    
    if (this.isRunning && this.config) {
      this.log('Automation is running, attempting to fill forms', 'info');
      
      // Wait for forms to be fully loaded in React
      setTimeout(() => {
        // Auto-fill phone number
        this.fillPhoneNumber();
        
        // Auto-fill password
        this.fillPassword();
        
        // Wait for human verification completion
        this.waitForVerification();
      }, 2000);
    } else {
      this.log('Automation not running or config not available', 'info');
    }
  }

  fillPhoneNumber() {
    this.log('Attempting to find phone input...', 'info');
    const phoneInput = this.findPhoneInput();
    
    if (phoneInput) {
      this.log('Phone input found', 'success');
      if (this.config.phoneNumber) {
        this.log(`Filling phone number: ${this.config.phoneNumber}`, 'info');
        
        // React form handling - need to set value and trigger events
        phoneInput.value = this.config.phoneNumber;
        
        // Trigger React's synthetic events
        const events = ['input', 'change', 'blur'];
        events.forEach(eventType => {
          const event = new Event(eventType, { bubbles: true });
          phoneInput.dispatchEvent(event);
        });
        
        // Also try React's internal value setter
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeInputValueSetter.call(phoneInput, this.config.phoneNumber);
        
        this.log('Phone number filled successfully', 'success');
      } else {
        this.log('No phone number in config', 'error');
      }
    } else {
      this.log('Phone input not found', 'error');
    }
  }

  fillPassword() {
    this.log('Attempting to find password input...', 'info');
    const passwordInput = this.findPasswordInput();
    
    if (passwordInput) {
      this.log('Password input found', 'success');
      if (this.config.password) {
        this.log('Filling password', 'info');
        
        // React form handling
        passwordInput.value = this.config.password;
        
        // Trigger React's synthetic events
        const events = ['input', 'change', 'blur'];
        events.forEach(eventType => {
          const event = new Event(eventType, { bubbles: true });
          passwordInput.dispatchEvent(event);
        });
        
        // Also try React's internal value setter
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeInputValueSetter.call(passwordInput, this.config.password);
        
        this.log('Password filled successfully', 'success');
      } else {
        this.log('No password in config', 'error');
      }
    } else {
      this.log('Password input not found', 'error');
    }
  }

  findPhoneInput() {
    const selectors = [
      // IVAC BD specific selectors
      'input[name="mobile_no"]',
      'input[name="contact_no"]',
      'input[name="phone_number"]',
      'input[name="phoneNumber"]',
      'input[name="username"]',
      'input[id="mobile_no"]',
      'input[id="contact_no"]',
      'input[id="phone_number"]',
      'input[id="phoneNumber"]',
      'input[id="username"]',
      'input[placeholder*="Mobile"]',
      'input[placeholder*="Contact"]',
      'input[placeholder*="Phone"]',
      'input[placeholder*="mobile"]',
      'input[placeholder*="contact"]',
      'input[placeholder*="phone"]',
      // Generic selectors
      'input[type="tel"]',
      'input[name*="phone"]',
      'input[name*="mobile"]',
      'input[name*="contact"]',
      'input[placeholder*="phone"]',
      'input[placeholder*="mobile"]',
      'input[id*="phone"]',
      'input[id*="mobile"]',
      'input[id*="contact"]',
      // Try to find any input that might be for phone/contact
      'input[type="text"]'
    ];

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        // Check if element might be a phone input based on context
        const placeholder = element.placeholder?.toLowerCase() || '';
        const name = element.name?.toLowerCase() || '';
        const id = element.id?.toLowerCase() || '';
        const label = element.parentElement?.textContent?.toLowerCase() || '';
        
        if (placeholder.includes('phone') || placeholder.includes('mobile') || placeholder.includes('contact') ||
            name.includes('phone') || name.includes('mobile') || name.includes('contact') ||
            id.includes('phone') || id.includes('mobile') || id.includes('contact') ||
            label.includes('phone') || label.includes('mobile') || label.includes('contact')) {
          this.log(`Found phone input with selector: ${selector}`, 'success');
          return element;
        }
      }
    }
    
    // Fallback: return first text input (might be phone)
    const textInputs = document.querySelectorAll('input[type="text"]');
    if (textInputs.length > 0) {
      this.log('Using first text input as phone input fallback', 'info');
      return textInputs[0];
    }
    
    return null;
  }

  findPasswordInput() {
    const selectors = [
      // IVAC BD specific selectors
      'input[name="password"]',
      'input[name="pass"]',
      'input[name="pwd"]',
      'input[id="password"]',
      'input[id="pass"]',
      'input[id="pwd"]',
      'input[placeholder*="Password"]',
      'input[placeholder*="password"]',
      'input[placeholder*="Pass"]',
      // Generic selectors
      'input[type="password"]',
      'input[name*="password"]',
      'input[placeholder*="password"]',
      'input[id*="password"]'
    ];

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        // Check if element might be a password input
        const placeholder = element.placeholder?.toLowerCase() || '';
        const name = element.name?.toLowerCase() || '';
        const id = element.id?.toLowerCase() || '';
        const label = element.parentElement?.textContent?.toLowerCase() || '';
        
        if (placeholder.includes('password') || placeholder.includes('pass') ||
            name.includes('password') || name.includes('pass') ||
            id.includes('password') || id.includes('pass') ||
            label.includes('password') || label.includes('pass')) {
          this.log(`Found password input with selector: ${selector}`, 'success');
          return element;
        }
      }
    }
    
    // Fallback: return first password input
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    if (passwordInputs.length > 0) {
      this.log('Using first password input fallback', 'info');
      return passwordInputs[0];
    }
    
    return null;
  }

  waitForVerification() {
    this.log('Waiting for human verification...', 'info');
    
    // Check for common verification elements
    const checkVerification = () => {
      const captcha = document.querySelector('.captcha, [class*="captcha"], [id*="captcha"]');
      const recaptcha = document.querySelector('.g-recaptcha, [class*="recaptcha"]');
      const checkbox = document.querySelector('[type="checkbox"][class*="captcha"]');
      
      if (captcha || recaptcha || checkbox) {
        this.log('Human verification detected - waiting for user', 'info');
        
        // Monitor for verification completion
        const observer = new MutationObserver(() => {
          this.checkVerificationComplete();
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
      }
    };

    checkVerification();
  }

  checkVerificationComplete() {
    // Check if verification is complete (implementation depends on the specific site)
    const successIndicator = document.querySelector('.verified, [class*="success"], .captcha-success');
    if (successIndicator) {
      this.log('Human verification completed', 'success');
      this.suggestSignIn();
    }
  }

  suggestSignIn() {
    const signInButton = this.findSignInButton();
    if (signInButton) {
      this.log('Sign In button ready - please click to continue', 'info');
      this.sendSuggestion('Click the Sign In button to proceed');
      
      // Highlight the button
      signInButton.style.boxShadow = '0 0 10px 3px #28a745';
      signInButton.style.transition = 'box-shadow 0.3s';
    }
  }

  findSignInButton() {
    const selectors = [
      'button[type="submit"]',
      'button:contains("Sign In")',
      'button:contains("Login")',
      'button:contains("Sign In Now")',
      'input[type="submit"]',
      'a:contains("Sign In")'
    ];

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        if (element.textContent.includes('Sign In') || 
            element.textContent.includes('Login') ||
            element.textContent.includes('Sign In Now')) {
          return element;
        }
      }
    }
    return null;
  }

  initOTPPage() {
    this.log('Detected OTP Page', 'info');
    this.log('Please enter the OTP manually', 'info');
    
    // Monitor OTP fields
    this.monitorOTPFields();
  }

  monitorOTPFields() {
    const otpInputs = document.querySelectorAll('input[type="text"][maxlength="1"], input[placeholder*="digit"]');
    
    if (otpInputs.length > 0) {
      this.log(`Found ${otpInputs.length} OTP input fields`, 'info');
      
      // Auto-advance between OTP fields
      otpInputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
          if (e.target.value.length === 1 && index < otpInputs.length - 1) {
            otpInputs[index + 1].focus();
          }
        });
        
        // Handle backspace
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Backspace' && !e.target.value && index > 0) {
            otpInputs[index - 1].focus();
          }
        });
      });

      // Check when all OTP fields are filled
      const checkOTPComplete = setInterval(() => {
        const allFilled = Array.from(otpInputs).every(input => input.value.length === 1);
        if (allFilled) {
          clearInterval(checkOTPComplete);
          this.log('OTP entered - please click Verify', 'info');
          this.suggestVerifyOTP();
        }
      }, 500);
    }
  }

  suggestVerifyOTP() {
    const verifyButton = this.findVerifyOTPButton();
    if (verifyButton) {
      this.sendSuggestion('Click Verify OTP to continue');
      verifyButton.style.boxShadow = '0 0 10px 3px #28a745';
    }
  }

  findVerifyOTPButton() {
    const selectors = [
      'button:contains("Verify")',
      'button:contains("Verify OTP")',
      'button[type="submit"]'
    ];

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        if (element.textContent.includes('Verify')) {
          return element;
        }
      }
    }
    return null;
  }

  initApplicantPage() {
    this.log('Detected Applicant Information Page', 'info');
    
    if (this.isRunning && this.config) {
      // Handle PDF upload
      this.handlePDFUpload();
    }
  }

  handlePDFUpload() {
    const fileInput = this.findFileInput();
    
    if (fileInput && this.config.pdfData) {
      this.log('Preparing PDF upload...', 'info');
      
      // Convert base64 back to blob
      fetch(this.config.pdfData)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], this.config.pdfFileName || 'document.pdf', { type: 'application/pdf' });
          
          // Create DataTransfer object to set file
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          fileInput.files = dataTransfer.files;
          
          fileInput.dispatchEvent(new Event('change', { bubbles: true }));
          this.log('PDF file attached', 'success');
          
          // Trigger upload if needed
          this.triggerUpload(fileInput);
        })
        .catch(error => {
          this.log('Error processing PDF: ' + error.message, 'error');
        });
    } else {
      this.log('Please upload your PDF document manually', 'info');
    }
  }

  findFileInput() {
    const selectors = [
      'input[type="file"]',
      'input[accept=".pdf"]',
      'input[name*="file"]',
      'input[id*="file"]'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) return element;
    }
    return null;
  }

  triggerUpload(fileInput) {
    // Look for upload button or trigger change event
    const uploadButton = fileInput.parentElement.querySelector('button, input[type="submit"]');
    if (uploadButton) {
      this.log('Upload button found - click to upload PDF', 'info');
      this.sendSuggestion('Click the upload button to submit your PDF');
    }
  }

  initMissionPage() {
    this.log('Detected Mission Selection Page', 'info');
    
    if (this.isRunning && this.config) {
      this.handleMissionSelection();
    }
  }

  handleMissionSelection() {
    const missionDropdown = this.findMissionDropdown();
    
    if (missionDropdown && this.config.preferredMission) {
      this.log(`Suggesting mission: ${this.config.preferredMission}`, 'info');
      this.sendSuggestion(`Select your preferred mission: ${this.config.preferredMission}`);
      
      // Highlight the dropdown
      missionDropdown.style.boxShadow = '0 0 10px 3px #ffc107';
    }
    
    // Handle IVAC center selection
    this.handleCenterSelection();
  }

  findMissionDropdown() {
    const selectors = [
      // IVAC BD specific selectors
      'select[name="mission"]',
      'select[name="mission_id"]',
      'select[id="mission"]',
      'select[id="mission_id"]',
      'select[name="embassy"]',
      'select[name="embassy_id"]',
      'select[id="embassy"]',
      'select[id="embassy_id"]',
      // Generic selectors
      'select[name*="mission"]',
      'select[id*="mission"]',
      'select[name*="embassy"]',
      'select[id*="embassy"]'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) return element;
    }
    return null;
  }

  handleCenterSelection() {
    const centerDropdown = this.findCenterDropdown();
    
    if (centerDropdown && this.config.preferredCenter) {
      this.log(`Suggesting center: ${this.config.preferredCenter}`, 'info');
      this.sendSuggestion(`Select your preferred IVAC center: ${this.config.preferredCenter}`);
      
      centerDropdown.style.boxShadow = '0 0 10px 3px #ffc107';
    }
  }

  findCenterDropdown() {
    const selectors = [
      // IVAC BD specific selectors
      'select[name="center"]',
      'select[name="center_id"]',
      'select[name="ivac_center"]',
      'select[name="ivac_center_id"]',
      'select[id="center"]',
      'select[id="center_id"]',
      'select[id="ivac_center"]',
      'select[id="ivac_center_id"]',
      'select[name="location"]',
      'select[name="location_id"]',
      // Generic selectors
      'select[name*="center"]',
      'select[name*="ivac"]',
      'select[id*="center"]',
      'select[id*="ivac"]'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) return element;
    }
    return null;
  }

  initInstructionPage() {
    this.log('Detected Instructions Page', 'info');
    this.log('Please review the instructions', 'info');
    
    // Wait for user to continue
    this.waitForContinueButton();
  }

  waitForContinueButton() {
    const continueButton = this.findContinueButton();
    if (continueButton) {
      this.log('Continue button available', 'success');
      this.sendSuggestion('Review instructions and click Continue');
    }
  }

  findContinueButton() {
    const selectors = [
      'button:contains("Continue")',
      'button:contains("Next")',
      'a:contains("Continue")',
      'a:contains("Next")'
    ];

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        if (element.textContent.includes('Continue') || element.textContent.includes('Next')) {
          return element;
        }
      }
    }
    return null;
  }

  initAppointmentPage() {
    this.log('Detected Appointment Selection Page', 'info');
    
    if (this.isRunning && this.config) {
      // This is the main focus - automatic date/time suggestion
      this.handleAppointmentSelection();
    }
  }

  handleAppointmentSelection() {
    this.log('Looking for available appointment slots...', 'info');
    
    // Wait for calendar/dates to load
    this.waitForDates().then(() => {
      this.suggestBestAppointment();
    });
  }

  async waitForDates() {
    return new Promise((resolve) => {
      const checkDates = setInterval(() => {
        const dateElements = this.findDateElements();
        if (dateElements.length > 0) {
          clearInterval(checkDates);
          resolve(dateElements);
        }
      }, 500);

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkDates);
        this.log('Timeout waiting for dates', 'error');
        resolve([]);
      }, 30000);
    });
  }

  findDateElements() {
    const selectors = [
      // IVAC BD specific selectors
      '.calendar-day.available',
      '.date-cell.available',
      '.day.available',
      '[data-available="true"]',
      '.fc-day:not(.fc-day-disabled)',
      '.calendar td:not(.disabled)',
      '.datepicker-day:not(.disabled)',
      'td.available',
      'button.day:not(:disabled)',
      '[class*="calendar-day"][class*="available"]',
      // Generic selectors
      '.calendar-day',
      '.date-cell',
      '[class*="date"]',
      '[class*="calendar"]',
      'td[class*="available"]',
      'button[class*="date"]'
    ];

    let elements = [];
    for (const selector of selectors) {
      elements = document.querySelectorAll(selector);
      if (elements.length > 0) break;
    }
    return Array.from(elements);
  }

  suggestBestAppointment() {
    const dateElements = this.findDateElements();
    
    if (dateElements.length === 0) {
      this.log('No available dates found', 'error');
      return;
    }

    this.log(`Found ${dateElements.length} available dates`, 'success');

    // If user has a preferred date, try to find it
    if (this.config.preferredDate) {
      const preferredDate = new Date(this.config.preferredDate);
      const matchingDate = this.findMatchingDate(dateElements, preferredDate);
      
      if (matchingDate) {
        this.log(`Found preferred date: ${this.config.preferredDate}`, 'success');
        this.highlightDate(matchingDate);
        this.sendSuggestion(`Your preferred date ${this.config.preferredDate} is available!`);
        
        // Click the date and wait for time slots
        this.clickDate(matchingDate);
        return;
      }
    }

    // Find the earliest available date
    const earliestDate = this.findEarliestDate(dateElements);
    if (earliestDate) {
      this.log('Suggesting earliest available date', 'info');
      this.highlightDate(earliestDate);
      this.sendSuggestion('Click the highlighted date to see available times');
      
      // Click the date to load time slots
      this.clickDate(earliestDate);
    }
  }

  findMatchingDate(dateElements, preferredDate) {
    const preferredStr = preferredDate.toISOString().split('T')[0];
    
    for (const element of dateElements) {
      const elementDate = this.extractDateFromElement(element);
      if (elementDate === preferredStr) {
        return element;
      }
    }
    return null;
  }

  extractDateFromElement(element) {
    const text = element.textContent.trim();
    const dateMatch = text.match(/(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) return dateMatch[1];
    
    // Try to parse various date formats
    const date = new Date(text);
    if (!isNaN(date)) {
      return date.toISOString().split('T')[0];
    }
    
    return null;
  }

  findEarliestDate(dateElements) {
    let earliest = null;
    let earliestDateObj = null;

    for (const element of dateElements) {
      const dateStr = this.extractDateFromElement(element);
      if (dateStr) {
        const dateObj = new Date(dateStr);
        if (!earliestDateObj || dateObj < earliestDateObj) {
          earliest = element;
          earliestDateObj = dateObj;
        }
      }
    }

    return earliest;
  }

  highlightDate(element) {
    element.style.boxShadow = '0 0 15px 5px #28a745';
    element.style.border = '2px solid #28a745';
    element.style.transform = 'scale(1.1)';
    element.style.transition = 'all 0.3s';
  }

  clickDate(element) {
    element.click();
    this.log('Date selected, waiting for time slots...', 'info');
    
    // Wait for time slots to load
    setTimeout(() => {
      this.handleTimeSelection();
    }, 1000);
  }

  handleTimeSelection() {
    const timeElements = this.findTimeElements();
    
    if (timeElements.length === 0) {
      this.log('No time slots available for this date', 'info');
      this.sendSuggestion('Try selecting a different date');
      return;
    }

    this.log(`Found ${timeElements.length} time slots`, 'success');

    // If user has a preferred time, try to find matching slot
    if (this.config.preferredTime) {
      const matchingTime = this.findMatchingTime(timeElements, this.config.preferredTime);
      if (matchingTime) {
        this.log(`Found preferred time slot`, 'success');
        this.highlightTime(matchingTime);
        this.sendSuggestion('Your preferred time slot is available!');
        return;
      }
    }

    // Suggest the earliest time slot
    const earliestTime = timeElements[0];
    this.highlightTime(earliestTime);
    this.sendSuggestion('Click the highlighted time slot to book');
  }

  findTimeElements() {
    const selectors = [
      // IVAC BD specific selectors
      '.time-slot.available',
      '.slot.available',
      '.appointment-time:not(.booked)',
      '.time:not(.disabled)',
      '[data-available="true"][class*="time"]',
      '.fc-time:not(.fc-time-disabled)',
      'button.time:not(:disabled)',
      '[class*="time-slot"][class*="available"]',
      '.time-cell:not(.disabled)',
      // Generic selectors
      '.time-slot',
      '[class*="time"]',
      '[class*="slot"]',
      'button[class*="time"]',
      '.appointment-time'
    ];

    let elements = [];
    for (const selector of selectors) {
      elements = document.querySelectorAll(selector);
      if (elements.length > 0) break;
    }
    return Array.from(elements);
  }

  findMatchingTime(timeElements, preferredTime) {
    const timeRanges = {
      'morning': ['9', '10', '11', '12'],
      'afternoon': ['12', '13', '14', '15', '16'],
      'evening': ['16', '17', '18']
    };

    const preferredHours = timeRanges[preferredTime] || [];

    for (const element of timeElements) {
      const text = element.textContent.trim();
      for (const hour of preferredHours) {
        if (text.includes(hour) || text.includes(parseInt(hour))) {
          return element;
        }
      }
    }
    return null;
  }

  highlightTime(element) {
    element.style.boxShadow = '0 0 15px 5px #ffc107';
    element.style.border = '2px solid #ffc107';
    element.style.transform = 'scale(1.05)';
    element.style.transition = 'all 0.3s';
  }

  initPaymentPage() {
    this.log('Detected Payment Page', 'info');
    this.log('Please select your payment method', 'info');
    
    // Wait for payment method selection
    this.waitForPaymentMethod();
  }

  waitForPaymentMethod() {
    const paymentMethods = this.findPaymentMethods();
    if (paymentMethods.length > 0) {
      this.log(`Found ${paymentMethods.length} payment methods`, 'info');
      this.sendSuggestion('Select your preferred payment method');
    }
  }

  findPaymentMethods() {
    const selectors = [
      '[class*="payment-method"]',
      '[class*="payment"] input[type="radio"]',
      'input[name*="payment"]'
    ];

    let elements = [];
    for (const selector of selectors) {
      elements = document.querySelectorAll(selector);
      if (elements.length > 0) break;
    }
    return Array.from(elements);
  }

  initConfirmationPage() {
    this.log('Detected Confirmation Page', 'info');
    this.log('Please review your information', 'info');
    
    // Wait for final confirmation
    this.waitForFinalConfirmation();
  }

  initCompletedPage() {
    this.log('Appointment booking completed!', 'success');
    this.sendSuggestion('Your appointment has been successfully booked!');
    
    // Reset automation state
    this.isRunning = false;
    this.updateBackgroundStatus();
    
    // Show completion notification
    this.showCompletionNotification();
  }

  showCompletionNotification() {
    const successMessage = document.createElement('div');
    successMessage.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #28a745;
      color: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10000;
      font-family: Arial, sans-serif;
      font-size: 14px;
    `;
    successMessage.innerHTML = `
      <h3 style="margin: 0 0 10px 0;">✅ Appointment Booked Successfully!</h3>
      <p style="margin: 0;">Your IVAC BD tourist visa appointment has been completed.</p>
    `;
    document.body.appendChild(successMessage);
    
    setTimeout(() => {
      successMessage.remove();
    }, 5000);
  }

  waitForFinalConfirmation() {
    const confirmButton = this.findConfirmButton();
    if (confirmButton) {
      this.log('Ready for final confirmation', 'success');
      this.sendSuggestion('Review all information and click Save & Continue');
      
      confirmButton.style.boxShadow = '0 0 10px 3px #28a745';
    }
  }

  findConfirmButton() {
    const selectors = [
      // IVAC BD specific selectors
      'button[name="submit"]',
      'button[name="confirm"]',
      'button[name="save"]',
      'button[type="submit"]',
      'button#submit',
      'button#confirm',
      'button#save',
      'input[type="submit"]',
      // Generic selectors
      'button:contains("Save")',
      'button:contains("Confirm")',
      'button:contains("Submit")',
      'button[type="submit"]'
    ];

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        if (element.textContent.includes('Save') || 
            element.textContent.includes('Confirm') ||
            element.textContent.includes('Submit')) {
          return element;
        }
      }
    }
    return null;
  }

  startAutomation() {
    this.log('Automation started', 'success');
    this.detectPage();
  }

  stopAutomation() {
    this.isRunning = false;
    this.log('Automation stopped', 'info');
    
    if (this.automationInterval) {
      clearInterval(this.automationInterval);
    }
  }

  waitForElement(selector, callback, timeout = 10000) {
    const element = document.querySelector(selector);
    if (element) {
      callback(element);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        callback(element);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
    }, timeout);
  }

  updateBackgroundStatus() {
    chrome.runtime.sendMessage({
      action: 'updateStatus',
      currentStep: this.currentStep,
      isRunning: this.isRunning
    });
  }

  sendSuggestion(suggestion) {
    chrome.runtime.sendMessage({
      action: 'showSuggestion',
      suggestion: suggestion
    });
  }

  log(message, type = 'info') {
    chrome.runtime.sendMessage({
      action: 'log',
      message: message,
      type: type,
      step: this.currentStep
    });
  }

  performDateTimeDebug() {
    this.log('Starting date/time detection debug', 'info');
    
    const dateElements = this.findDateElements();
    const timeElements = this.findTimeElements();
    
    const datesData = dateElements.map(el => ({
      text: el.textContent.trim().substring(0, 30),
      selector: this.getElementSelector(el),
      className: el.className
    }));
    
    const timesData = timeElements.map(el => ({
      text: el.textContent.trim().substring(0, 30),
      selector: this.getElementSelector(el),
      className: el.className
    }));
    
    // Highlight detected elements
    dateElements.forEach(el => {
      el.style.outline = '3px solid #28a745';
      el.style.outlineOffset = '2px';
    });
    
    timeElements.forEach(el => {
      el.style.outline = '3px solid #ffc107';
      el.style.outlineOffset = '2px';
    });
    
    // Remove highlights after 5 seconds
    setTimeout(() => {
      dateElements.forEach(el => {
        el.style.outline = '';
        el.style.outlineOffset = '';
      });
      timeElements.forEach(el => {
        el.style.outline = '';
        el.style.outlineOffset = '';
      });
    }, 5000);
    
    this.log(`Found ${datesData.length} date elements and ${timesData.length} time elements`, 'success');
    
    return {
      dates: datesData,
      times: timesData,
      page: this.currentStep,
      url: window.location.href
    };
  }

  getElementSelector(element) {
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ').join('.')}`;
    return element.tagName.toLowerCase();
  }
}

// Initialize the automation
const appointmentAutomation = new AppointmentAutomation();

// Monitor URL changes for single-page applications
let lastUrl = location.href;
new MutationObserver(() => {
  const currentUrl = location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    appointmentAutomation.detectPage();
  }
}).observe(document, { subtree: true, childList: true });
