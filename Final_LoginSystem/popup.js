document.addEventListener('DOMContentLoaded', () => {
  // Event listener for remembering the password date
  document.getElementById('rememberPassword').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: "setPasswordDate" }, response => {
      if (response.status === "date_set") {
        document.getElementById('status').innerText = 'Password date remembered!';
      }
    });
  });

  // Event listener for setting up 2FA
  document.getElementById('setup2FA').addEventListener('click', () => {
    const emailInputContainer = document.getElementById('emailInputContainer');
    emailInputContainer.style.display = 'block';
  });

  // Event listener for submitting email for 2FA
  document.getElementById('submitEmail').addEventListener('click', () => {
    const email = document.getElementById('emailInput').value;
    if (email) {
      chrome.runtime.sendMessage({ action: "sendEmailVerification", email: email }, response => {
        if (response.status === "verification_sent") {
          document.getElementById('status').innerText = '2FA setup initiated. Check your email.';
        } else {
          document.getElementById('status').innerText = `Error: ${response.message}`;
        }
      });
    } else {
      document.getElementById('status').innerText = 'Please enter a valid email address.';
    }
  });

  // Check URL status for phishing
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    const url = currentTab.url;

    chrome.runtime.sendMessage({ action: 'checkUrl', url: url }, (response) => {
      const status = response.isPhishing ? 'Warning: This website is a phishing site!' : 'This website is safe.';
      document.getElementById('status').textContent = status;
    });
  });

  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('generatePassword').addEventListener('click', () => {
      fetch('http://localhost:8000/generate-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
        })
      .then(response => response.json())
      .then(data => {
        const generatedPasswordElement = document.getElementById('generatedPassword');
        if (generatedPasswordElement) {
          generatedPasswordElement.innerText = `Generated Password: ${data.password}`;
        } else {
          console.error('Element with ID "generatedPassword" not found.');
        }
  
        const passwordStrengthElement = document.getElementById('passwordStrength');
        if (passwordStrengthElement) {
          passwordStrengthElement.innerText = `Password Strength: ${data.strength}`;
        } else {
          console.error('Element with ID "passwordStrength" not found.');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        const generatedPasswordElement = document.getElementById('generatedPassword');
        if (generatedPasswordElement) {
          generatedPasswordElement.innerText = 'Failed to generate password';
        }
      });
    });
  });
  
});






