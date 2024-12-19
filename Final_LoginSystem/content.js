// Check and display password strength
document.addEventListener('input', function(event) {
  if (event.target.type === 'password') {
    const password = event.target.value;
    const strength = checkPasswordStrength(password);
    displayStrengthMeter(event.target, strength);
  }
});

function checkPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  return score;
}

function displayStrengthMeter(inputField, strength) {
  let meter = document.getElementById('password-strength-meter');

  if (!meter) {
    meter = document.createElement('div');
    meter.id = 'password-strength-meter';
    meter.style.position = 'absolute';
    meter.style.top = `${inputField.offsetTop + inputField.offsetHeight + 5}px`;
    meter.style.left = `${inputField.offsetLeft}px`;
    meter.style.backgroundColor = 'lightgray';
    meter.style.padding = '5px';
    meter.style.borderRadius = '3px';
    inputField.parentElement.appendChild(meter);
  }

  meter.innerHTML = `Strength: ${strength}/5`;
  meter.style.color = strength >= 4 ? 'green' : 'red';
}




// Alert the user when a phishing site is detected
function warnUser() {
  alert('Warning: The website you are visiting may be a phishing site!');
}


