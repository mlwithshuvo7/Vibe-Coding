# 🚀 IVAC BD Appointment Assistant

<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Poppins&size=28&duration=3000&pause=1000&color=4285F4&center=true&vCenter=true&width=900&lines=IVAC+BD+Appointment+Assistant;Chrome+Manifest+V3+Extension;Smart+Appointment+Booking+Assistant;Auto+Form+Filling+%7C+PDF+Upload;Intelligent+Date+%26+Time+Suggestion;Fast+Secure+Reliable+Automation" />
</p>

<p align="center">

![Chrome](https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-34A853?style=for-the-badge)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![Chrome API](https://img.shields.io/badge/Chrome-API-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-success?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-v1.0.0-orange?style=for-the-badge)

</p>

<p align="center">
  <b>⚡ An intelligent Chrome Extension that simplifies the IVAC BD appointment booking workflow.</b><br><br>

  Automatically fills login credentials, uploads visa PDFs, remembers your preferred mission and IVAC center, and provides smart appointment date & time suggestions while keeping OTP verification and final confirmation under your control.
</p>

<p align="center">

**👨‍💻 Creator:** **Shuvo Kundu** • **📄 License:** **MIT**

</p>

---

# 📌 Overview

Booking an **IVAC BD Tourist Visa Appointment** can be time-consuming because of repeated form filling and appointment availability checks.

The **IVAC BD Appointment Assistant** is a **Chrome Extension** designed to simplify the booking workflow by automating repetitive tasks while keeping important verification steps under the user's control.

Instead of manually entering information on every visit, the extension automatically fills login information, uploads documents, remembers preferences, and intelligently suggests the best available appointment dates and time slots.

---

# 🚀 Features

- 📄 Automatic PDF Upload
- 📅 Smart Appointment Date Suggestions
- ⏰ Intelligent Time Slot Recommendations
- 🏢 Mission Selection Assistant
- 📍 IVAC Center Suggestions
- 🔔 Browser Notifications
- 🧭 Step-by-Step Workflow Guidance
- 📋 Activity Logging
- 💾 Local Configuration Storage
- 🛡️ Privacy Focused
- 🎨 Clean & User-Friendly Interface

---

# 🔄 Workflow States

The extension tracks every stage of the appointment process.

```
🏠 Home Page
      ↓
🔐 Login
      ↓
📲 OTP Verification
      ↓
📄 Applicant Information
      ↓
🏢 Mission Selection
      ↓
📍 IVAC Center Selection
      ↓
📑 Instructions
      ↓
📅 Appointment Selection
      ↓
💳 Payment
      ↓
✅ Confirmation
      ↓
🎉 Completed
```

---

# ⚙️ Installation

## Prerequisites

- Google Chrome
- Microsoft Edge
- Brave Browser
- Chromium Browser

Developer Mode must be enabled.

---

## Installation Steps

### 1. Download the Repository

Clone or download this repository.

```bash
git clone https://github.com/yourusername/ivac-bd-appointment-assistant.git
```

---

### 2. Open Chrome Extensions

```
chrome://extensions/
```

---

### 3. Enable Developer Mode

Turn on

```
Developer Mode
```

from the top-right corner.

---

### 4. Load Extension

Click

```
Load unpacked
```

Select

```
appointment-automation-extension
```

---

### 5. Pin Extension

Pin **IVAC BD Assistant** for quick access.

---

# 📝 Usage

## Step 1

Open the extension popup.

Fill in:

- 📱 Phone Number
- 🔒 Password
- 📄 Visa Application PDF
- 🏢 Preferred Mission
- 📍 Preferred IVAC Center
- 📅 Preferred Date (Optional)
- ⏰ Preferred Time (Optional)

Click

```
💾 Save Configuration
```

---

## Step 2

Visit

```
ivac.bd.com
```

or

```
visa.gov.bd
```

---

## Step 3

Click

```
🚀 Start Automation
```

---

## Step 4

The extension automatically

- Fills login credentials
- Waits for human verification
- Waits for OTP
- Uploads PDF
- Suggests Mission
- Suggests IVAC Center
- Suggests Appointment Date
- Suggests Time Slot

---

# 📅 Smart Appointment Suggestions

## Preferred Date

✔ Checks if your preferred date is available.

If available:

- Highlights in Green
- Notifies the user
- Loads available time slots automatically

---

## Earliest Available Date

If your preferred date isn't available:

- Finds the earliest available appointment
- Highlights it
- Suggests booking it

---

## Time Slot Suggestions

Morning

```
09:00 AM – 12:00 PM
```

Afternoon

```
12:00 PM – 04:00 PM
```

Evening

```
04:00 PM – 06:00 PM
```

Matching slots are highlighted automatically.

---

# 🎨 Visual Indicators

🟢 Green

Recommended appointment

🟡 Yellow

Alternative suggestion

✨ Pulse Animation

Important actions

🔔 Browser Notifications

Status updates and recommendations

---

# 💾 Configuration Storage

The extension stores data locally.

Stored Information

- Phone Number
- Password
- PDF (Base64)
- Preferred Mission
- Preferred IVAC Center
- Preferred Date
- Preferred Time
- Activity Logs

> **Security Notice**
>
> All information remains on your local machine.
>
> No external server is used.

---

# 📋 Activity Logs

Logs include

- Current workflow step
- Timestamp
- Validation messages
- Upload status
- Navigation
- Appointment suggestions
- Errors

Maximum

```
200 logs
```

are retained.

---

# ⚠️ Error Handling

The extension handles

- Missing required fields
- Invalid PDF uploads
- OTP waiting
- Human verification
- Timeout detection
- Network interruption
- Upload failures

---

# 🔧 Troubleshooting

## Extension Not Working

- Reload the extension
- Enable Developer Mode
- Verify website compatibility
- Check browser console

---

## Auto Fill Issues

- Save configuration again
- Verify login fields
- Refresh page

---

## PDF Upload Issues

- Use PDF format only
- Verify file size
- Ensure applicant page is loaded

---

## Appointment Suggestions Missing

- Wait until calendar loads
- Refresh page
- Check appointment availability

---

# 📂 Project Structure

```
appointment-automation-extension/
│
├── manifest.json
├── popup.html
├── popup.js
├── styles.css
├── content.js
├── background.js
│
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
│
└── README.md
```

---

# 🧩 Main Components

### manifest.json

Extension configuration

### popup.js

Handles popup UI and settings

### content.js

Automation logic

### background.js

Workflow state management

---

# 🌍 Supported IVAC Missions

- Dhaka
- Chittagong
- Sylhet
- Rajshahi
- Khulna
- Jessore
- Brahmanbaria
- Rangpur
- Barisal

---

# 🏢 Supported IVAC Centers

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

---

# 🔒 Privacy & Security

✔ Local Storage Only

✔ No External Servers

✔ No Tracking

✔ User Controlled Configuration

✔ Secure Local Data

---

# ⚡ Limitations

- Human verification must be completed manually.
- OTP must be entered manually.
- Final submission remains under user control.
- Website updates may require selector updates.
- Appointment availability depends on IVAC BD.

---

---

# 👨‍💻 Creator

<div align="center">

## Shuvo Kundu

**Computer Science Engineer**  
**Machine Learning • AI • Automation Developer**

[![GitHub](https://img.shields.io/badge/GitHub-mlwithshuvo7-181717?style=for-the-badge&logo=github)](https://github.com/mlwithshuvo7)

</div>

---

# 📄 License

This project is licensed under the **MIT License**.

---

# ⭐ Version

**v1.0.0**

Initial Release

- Login Automation
- PDF Upload
- Appointment Suggestions
- Workflow Tracking
- Activity Logging
