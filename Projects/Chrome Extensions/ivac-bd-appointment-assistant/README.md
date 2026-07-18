# IVAC BD Appointment Assistant Chrome Extension

A Chrome extension specifically designed to automate IVAC BD tourist visa appointment booking with intelligent date/time suggestions and user guidance.

## Features

- **Automated Form Filling**: Auto-fills phone number and password on login pages
- **PDF Upload Support**: Automatically attaches your PDF document
- **Smart Date/Time Suggestions**: 
  - Suggests your preferred date if available
  - Automatically highlights the earliest available appointment
  - Suggests time slots based on your preferences (morning/afternoon/evening)
- **Mission & Center Selection**: Remembers and suggests your preferred mission and IVAC center
- **Workflow Guidance**: Step-by-step guidance through the entire booking process
- **Activity Logging**: Tracks all actions and provides detailed logs
- **State Management**: Maintains workflow state across page navigations
- **User-Friendly UI**: Clean popup interface for configuration

## Workflow States

The extension tracks and guides you through these stages:

1. **Home Page** - Starting point
2. **Login** - Phone number and password entry
3. **OTP Verification** - OTP input and verification
4. **Applicant Information** - PDF document upload
5. **Mission Selection** - Choose your preferred mission
6. **IVAC Center Selection** - Select your preferred center
7. **Instructions** - Review booking instructions
8. **Appointment Selection** - **Main Focus** - Smart date/time suggestions
9. **Payment** - Payment method selection
10. **Confirmation** - Final review and submission
11. **Completed** - Workflow finished

## Installation

### Prerequisites

- Google Chrome or Chromium-based browser (Edge, Brave, etc.)
- Developer mode enabled in Chrome
- Access to IVAC BD appointment portal (ivac.bd.com or visa.gov.bd)

### Steps

1. **Download or Clone** this repository to your local machine

2. **Open Chrome Extensions Page**:
   - Navigate to `chrome://extensions/`
   - Or click Chrome menu → More tools → Extensions

3. **Enable Developer Mode**:
   - Toggle the "Developer mode" switch in the top right corner

4. **Load the Extension**:
   - Click "Load unpacked"
   - Select the `appointment-automation-extension` folder
   - The extension will now appear in your extensions list

5. **Pin the Extension** (Optional):
   - Click the puzzle piece icon in Chrome toolbar
   - Pin "IVAC BD Assistant" for easy access

## Usage

### Initial Setup

1. **Click the Extension Icon** in your browser toolbar
2. **Fill in Your Information**:
   - **Phone Number**: Your contact number (required)
   - **Password**: Your IVAC BD account password (required)
   - **PDF Document**: Select your visa application PDF (required)
   - **Preferred Mission**: Select your preferred mission (Dhaka, Chittagong, Sylhet, etc.)
   - **Preferred IVAC Center**: Select your preferred IVAC center (Gulshan, Uttara, etc.)
   - **Preferred Date**: Choose your preferred appointment date (optional)
   - **Preferred Time**: Select morning/afternoon/evening (optional)

3. **Save Configuration**: Click "💾 Save Configuration"

### Starting Automation

1. Navigate to the IVAC BD appointment portal (ivac.bd.com or visa.gov.bd)
2. Click the extension icon
3. Click "🚀 Start Automation"
4. Follow the on-screen guidance:
   - The extension will auto-fill phone number and password
   - Wait for human verification to complete manually
   - Enter OTP manually when prompted
   - PDF will be automatically attached
   - Review suggestions for mission and center selection
   - **Automatic date/time suggestions** will highlight available slots
   - Click highlighted elements to proceed

### Stopping Automation

- Click "⏹️ Stop" in the extension popup to halt automation
- Click "🔄 Reset" to clear all saved configuration

## Date/Time Auto-Suggestion Features

The extension provides intelligent suggestions for appointment selection:

### Preferred Date Matching
- If you set a preferred date, the extension checks if it's available
- When found, it highlights the date in green and notifies you
- Automatically clicks the date to load time slots

### Earliest Available Date
- If no preferred date is set or it's unavailable
- Finds and highlights the earliest available appointment date
- Suggests you click to view time slots

### Time Slot Suggestions
- **Morning Preference**: Suggests slots between 9AM - 12PM
- **Afternoon Preference**: Suggests slots between 12PM - 4PM
- **Evening Preference**: Suggests slots between 4PM - 6PM
- Highlights matching time slots in yellow

### Visual Indicators
- **Green highlight**: Recommended date/time
- **Yellow highlight**: Secondary suggestions
- **Pulse animation**: Draws attention to important elements
- **Browser notifications**: Suggestions and status updates

## Configuration Storage

All your configuration is stored locally in Chrome's storage:
- Phone number and password are stored locally
- PDF document is converted to base64 and stored
- Preferences are saved for future sessions
- Activity logs are maintained (last 200 entries)

**Security Note**: All data is stored locally on your machine. No data is sent to external servers.

## Activity Logs

The extension maintains detailed logs of:
- Current page and step
- Timestamp of each action
- User-confirmed progress
- Validation errors
- Upload completion status
- Navigation events
- Suggestions provided

View logs in the extension popup under "📋 Activity Log"

## Error Handling

The extension handles various error scenarios:

- **Missing Required Fields**: Displays validation messages
- **PDF Upload Failure**: Notifies user and allows retry
- **Incomplete Verification**: Waits for manual completion
- **Incomplete OTP**: Remains on verification screen
- **Page Load Timeout**: Logs error and suggests retry
- **Network Interruption**: Detects and reports connection issues

## Troubleshooting

### Extension Not Working
- Ensure Developer Mode is enabled
- Reload the extension after updates
- Check browser console for errors
- Verify you're on the correct IVAC BD website

### Auto-fill Not Working
- Check that phone number and password are saved
- Ensure form fields are detected on IVAC BD login page
- Try manually focusing the field first
- Check if IVAC BD has updated their form field names

### Date/Time Not Highlighting
- Wait for the IVAC calendar to fully load
- Refresh the page if elements don't appear
- Check that appointment slots are available
- Verify you're on the appointment selection page

### PDF Upload Issues
- Ensure file is in PDF format
- Check file size limits (IVAC BD typically has size restrictions)
- Verify the file input is detected on the applicant page
- Make sure PDF is your visa application document

### IVAC BD Specific Issues
- **Website Changes**: IVAC BD may update their website structure. If selectors don't work, you may need to update the selectors in `content.js`
- **Session Timeout**: If your session expires, you'll need to log in again
- **Appointment Availability**: No slots may be available for your preferred dates
- **Browser Compatibility**: Works best with Chrome/Edge on desktop

## Development

### File Structure

```
appointment-automation-extension/
├── manifest.json          # Extension configuration
├── popup.html            # Popup UI structure
├── popup.js              # Popup logic and controller
├── styles.css            # Styling for popup
├── content.js            # Page detection and automation
├── background.js         # State management and messaging
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md             # This file
```

### Key Components

- **manifest.json**: Defines extension permissions and configuration
- **popup.js**: Handles user input and configuration management
- **content.js**: Detects pages, automates form filling, provides suggestions
- **background.js**: Manages workflow state and inter-tab communication

### Modifying for IVAC BD Website

The extension is pre-configured for IVAC BD with specific selectors. If IVAC BD updates their website structure, you may need to:

1. Update selectors in `content.js`:
   - `findPhoneInput()` - Add IVAC BD phone input selectors
   - `findPasswordInput()` - Add password input selectors
   - `findDateElements()` - Add IVAC calendar/date selectors
   - `findTimeElements()` - Add time slot selectors
   - `findMissionDropdown()` - Add mission selection selectors
   - `findCenterDropdown()` - Add IVAC center selectors

2. Add IVAC BD-specific page detection in `detectPage()` method

3. Test thoroughly on the IVAC BD website

### Current IVAC BD Missions Supported

- Dhaka
- Chittagong
- Sylhet
- Rajshahi
- Khulna
- Jessore
- Brahmanbaria
- Rangpur
- Barisal

### Current IVAC Centers Supported

- IVAC Dhaka (Gulshan)
- IVAC Dhaka (Uttara)
- IVAC Chittagong
- IVAC Sylhet
- IVAC Rajshahi
- IVAC Khulna
- IVAC Jessore
- IVAC Brahmanbaria
- IVAC Rangpur
- IVAC Barisal

## Privacy & Security

- **Local Storage Only**: All data stored locally in browser
- **No External Servers**: No data transmitted to external services
- **No Tracking**: No analytics or user tracking
- **User Control**: Full control over stored data via reset button

## Limitations

- **Manual Steps Required**: Human verification, OTP entry, and final confirmation must be done manually
- **IVAC BD Website Changes**: May require selector adjustments if IVAC BD updates their website
- **Single Page Applications**: Navigation detection may vary by IVAC BD implementation
- **PDF Size**: Large PDF files may affect performance (IVAC BD has file size limits)
- **Appointment Availability**: Extension cannot create appointments - only helps with booking available slots
- **Session Management**: User must handle session timeouts and re-authentication

## Support

For issues, questions, or contributions:
- Check the troubleshooting section
- Review browser console for errors
- Ensure website compatibility
- Modify selectors for your specific website

## License

This extension is provided as-is for educational and personal use.

## Version History

- **v1.0.0** - Initial release with core automation features
  - Login automation
  - PDF upload support
  - Date/time auto-suggestion
  - Workflow state tracking
  - Activity logging
