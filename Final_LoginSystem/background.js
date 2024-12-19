// Initialize storage and set up alarm when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed or updated');
  chrome.storage.local.set({ passwordDate: null });
  chrome.alarms.create('passwordChangeReminder', { periodInMinutes: 1 });
  console.log('Recurring alarm set for every 1 minute.');
});

// Set up the alarm on startup
chrome.runtime.onStartup.addListener(() => {
  console.log('Extension started');
  // Reinitialize alarms or other settings if necessary
  chrome.alarms.create('passwordChangeReminder', { periodInMinutes: 1 });
  console.log('Recurring alarm set for every 1 minute on startup.');
});

// Message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkUrl') {
    const url = request.url;
    checkUrlForPhishing(url).then(isPhishing => {
      sendResponse({ isPhishing });
    });
    return true; // Keep the message channel open for async response
  } else if (request.action === "sendEmailVerification") {
    sendEmailVerification(request.email).then(() => {
      sendResponse({ status: "verification_sent" });
    }).catch(err => {
      console.error('Error sending email:', err);
      sendResponse({ status: "error", message: err.message });
    });
    return true; // Keep the message channel open for async response
  } else if (request.action === "setPasswordDate") {
    chrome.storage.local.set({ passwordDate: new Date().toISOString() }, () => {
      console.log('Password date set to:', new Date().toISOString());
      sendResponse({ status: "date_set" });
    });
    return true; // Keep the message channel open for async response
  } else if (request.action === 'buttonClicked') {
    // Open the extension popup or handle as needed
    sendResponse({ status: "popup_opened" });
  } else {
    sendResponse({ status: "unknown_action" }); // Handle unknown actions
  }
});

// Function to send email verification
async function sendEmailVerification(email) {
  const otp = Math.floor(100000 + Math.random() * 900000);

  try {
    const response = await fetch('http://localhost:3000/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: email, otp: otp })
    });

    const data = await response.json();
    if (data.status === 'success') {
      console.log('Email sent:', data.message);
    } else {
      console.error('Error sending email:', data.message);
    }
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// Alarm listener
chrome.alarms.onAlarm.addListener(alarm => {
  console.log('Alarm triggered:', alarm);
  if (alarm.name === 'passwordChangeReminder') {
    chrome.storage.local.get('passwordDate', data => {
      if (data.passwordDate) {
        const lastSetDate = new Date(data.passwordDate);
        const now = new Date();
        const diff = Math.floor((now - lastSetDate) / (1000 * 60)); // Difference in minutes
        console.log('Time difference (minutes):', diff);

        if (diff >= 1) { // Check if at least 1 minute has passed
          chrome.notifications.create('passwordChangeReminder', {
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'Password Change Reminder',
            message: 'Consider changing your password for better security.'
          }, notificationId => {
            if (chrome.runtime.lastError) {
              console.error('Error creating notification:', chrome.runtime.lastError);
            } else {
              console.log('Notification created with ID:', notificationId);
            }
          });
        }
      } else {
        console.log('No password date found.');
      }
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkUrl') {
    const url = request.url;
    checkUrlForPhishing(url).then(isPhishing => {
      sendResponse({ isPhishing });
    });
    return true; // Keep the message channel open for async response
  }
});

async function checkUrlForPhishing(url) {
  const apiKey = 'AIzaSyAfGUoeC-J8MPza5U151JZgKR6nFOH-qbI'; // Replace with your API key
  const apiUrl = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`;

  const requestBody = {
    client: {
      clientId: "your-client-id",  // You can put any string as the clientId
      clientVersion: "1.0"
    },
    threatInfo: {
      threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
      platformTypes: ["ANY_PLATFORM"],
      threatEntryTypes: ["URL"],
      threatEntries: [
        {"url": url}
      ]
    }
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    return data.matches ? true : false; // Return true if phishing, false otherwise
  } catch (error) {
    console.error('Error checking the URL:', error);
    return false; // Error occurred, treat the URL as safe for now
  }
}
// Display notification
function showNotification(message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon.png',
    title: 'Phishing Alert',
    message: message
  });
}







