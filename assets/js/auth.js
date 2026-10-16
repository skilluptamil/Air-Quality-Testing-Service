/**
 * AeroPure - Mold Remediation & Air Quality Testing Service
 * Auth JavaScript (auth.js)
 * Password toggles, strength meter, demo quick-fill, and simulated auth flows
 */

document.addEventListener('DOMContentLoaded', () => {
  initPasswordToggles();
  initPasswordStrength();
  initQuickFillButtons();
  initLoginForm();
  initRegisterForm();
  initForgotForm();
  initResetForm();
  initSocialAuthDemo();
});

/* ==========================================================================
   1. Show / Hide Password
   ========================================================================== */
function initPasswordToggles() {
  const toggleBtns = document.querySelectorAll('.password-toggle-btn');
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.closest('.password-toggle-wrap').querySelector('input');
      const icon = btn.querySelector('i');
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('bi-eye');
        icon.classList.add('bi-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.remove('bi-eye-slash');
        icon.classList.add('bi-eye');
      }
    });
  });
}

/* ==========================================================================
   2. Password Strength Meter
   ========================================================================== */
function initPasswordStrength() {
  const passInput = document.getElementById('regPassword');
  const meterBar = document.getElementById('strengthBar');
  const meterText = document.getElementById('strengthText');

  if (!passInput || !meterBar) return;

  passInput.addEventListener('input', () => {
    const val = passInput.value;
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    if (val.length === 0) {
      meterBar.style.width = '0%';
      meterBar.className = 'progress-bar';
      if (meterText) meterText.textContent = '';
      return;
    }

    switch (score) {
      case 1:
        meterBar.style.width = '25%';
        meterBar.className = 'progress-bar bg-danger';
        if (meterText) meterText.innerHTML = '<span class="text-danger fw-semibold">Weak (Add letters &amp; numbers)</span>';
        break;
      case 2:
        meterBar.style.width = '50%';
        meterBar.className = 'progress-bar bg-warning';
        if (meterText) meterText.innerHTML = '<span class="text-warning fw-semibold">Fair (Add special character)</span>';
        break;
      case 3:
        meterBar.style.width = '75%';
        meterBar.className = 'progress-bar bg-info';
        if (meterText) meterText.innerHTML = '<span class="text-info fw-semibold">Good</span>';
        break;
      case 4:
        meterBar.style.width = '100%';
        meterBar.className = 'progress-bar bg-success';
        if (meterText) meterText.innerHTML = '<span class="text-success fw-semibold">Strong &amp; Secure!</span>';
        break;
    }
  });
}

/* ==========================================================================
   3. Quick-Fill Demo Credentials
   ========================================================================== */
function initQuickFillButtons() {
  const fillCustomer = document.getElementById('fillCustomerBtn');
  const fillUser = document.getElementById('fillUserBtn');
  const fillAdmin = document.getElementById('fillAdminBtn');
  const emailInput = document.getElementById('loginEmail');
  const passInput = document.getElementById('loginPassword');

  if (fillCustomer && emailInput && passInput) {
    fillCustomer.addEventListener('click', () => {
      emailInput.value = 'customer@aeropure.com';
      passInput.value = 'CustomerPass@2026';
      showNotification('Demo Fill', 'Customer credentials filled.', 'info');
    });
  }

  if (fillUser && emailInput && passInput) {
    fillUser.addEventListener('click', () => {
      emailInput.value = 'user@aeropure.com';
      passInput.value = 'UserPass@2026';
      showNotification('Demo Fill', 'User credentials filled.', 'info');
    });
  }

  if (fillAdmin && emailInput && passInput) {
    fillAdmin.addEventListener('click', () => {
      emailInput.value = 'admin@aeropure.com';
      passInput.value = 'AdminPass@2026';
      showNotification('Demo Fill', 'Admin credentials filled.', 'info');
    });
  }
}

/* ==========================================================================
   4. Login Form Submission & Dashboard Redirect
   ========================================================================== */
function initLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('loginEmail');
    const passInput = document.getElementById('loginPassword');
    const email = emailInput ? emailInput.value.trim() : '';
    const pass = passInput ? passInput.value.trim() : '';
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!email || !pass) {
      showNotification('Required Fields', 'Please enter your email and password.', 'warning');
      return;
    }

    if (!emailRegex.test(email)) {
      showNotification('Invalid Email', 'Please enter a valid email address (e.g. name@domain.com).', 'warning');
      if (emailInput) {
        emailInput.classList.add('is-invalid');
        emailInput.focus();
      }
      return;
    }

    if (emailInput) emailInput.classList.remove('is-invalid');
    showNotification('Authenticating...', 'Verifying demo credentials...', 'info');

    setTimeout(() => {
      // Direct according to demo role
      if (email.includes('admin')) {
        window.location.href = 'admin-dashboard.html';
      } else if (email.includes('user')) {
        window.location.href = 'user-dashboard.html';
      } else {
        // Default to Customer Dashboard
        window.location.href = 'customer-dashboard.html';
      }
    }, 700);
  });
}

/* ==========================================================================
   5. Register Form Submission
   ========================================================================== */
function initRegisterForm() {
  const form = document.getElementById('registerForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('regName');
    const emailInput = document.getElementById('regEmail');
    const phoneInput = document.getElementById('regPhone');
    const passInput = document.getElementById('regPassword');
    const roleSelect = document.getElementById('regRole');
    const terms = document.getElementById('regTerms');

    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const pass = passInput ? passInput.value.trim() : '';
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneDigits = phone.replace(/\D/g, '');

    // Validate Name: letters and spaces only
    if (!name || name.length < 2 || /[^a-zA-Z\s'.\-]/.test(name)) {
      showNotification('Name Required', 'Please enter a valid Full Name with letters only (no numbers or symbols).', 'warning');
      if (nameInput) {
        nameInput.classList.add('is-invalid');
        nameInput.focus();
      }
      return;
    }
    if (nameInput) nameInput.classList.remove('is-invalid');

    // Validate Email
    if (!email || !emailRegex.test(email)) {
      showNotification('Invalid Email', 'Please enter a valid email address (e.g. name@domain.com).', 'warning');
      if (emailInput) {
        emailInput.classList.add('is-invalid');
        emailInput.focus();
      }
      return;
    }
    if (emailInput) emailInput.classList.remove('is-invalid');

    // Validate Phone: numbers only (min 7-10 digits)
    if (!phone || phoneDigits.length < 7) {
      showNotification('Phone Number', 'Please enter a valid phone number with numbers only.', 'warning');
      if (phoneInput) {
        phoneInput.classList.add('is-invalid');
        phoneInput.focus();
      }
      return;
    }
    if (phoneInput) phoneInput.classList.remove('is-invalid');

    // Validate Password
    if (!pass || pass.length < 8) {
      showNotification('Password', 'Please create a secure password (minimum 8 characters).', 'warning');
      if (passInput) {
        passInput.classList.add('is-invalid');
        passInput.focus();
      }
      return;
    }
    if (passInput) passInput.classList.remove('is-invalid');

    if (terms && !terms.checked) {
      showNotification('Terms & Conditions', 'Please accept the Terms of Service to create an account.', 'warning');
      return;
    }

    showNotification('Account Created!', 'Registration successful. Redirecting to your dashboard...', 'success');

    setTimeout(() => {
      if (roleSelect && roleSelect.value === 'user') {
        window.location.href = 'user-dashboard.html';
      } else {
        window.location.href = 'customer-dashboard.html';
      }
    }, 900);
  });
}

/* ==========================================================================
   6. Forgot & Reset Password
   ========================================================================== */
function initForgotForm() {
  const form = document.getElementById('forgotForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('forgotEmail');
    const email = emailInput ? emailInput.value.trim() : '';
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!email) {
      showNotification('Email Required', 'Please enter your registered email.', 'warning');
      return;
    }

    if (!emailRegex.test(email)) {
      showNotification('Invalid Email', 'Please enter a valid email address format.', 'warning');
      if (emailInput) emailInput.classList.add('is-invalid');
      return;
    }

    if (emailInput) emailInput.classList.remove('is-invalid');
    const alertBox = document.getElementById('forgotSuccessAlert');
    if (alertBox) {
      alertBox.classList.remove('d-none');
    }
    showNotification('Reset Link Sent', `A simulated password reset link has been dispatched to ${email}.`, 'success');
  });
}

function initResetForm() {
  const form = document.getElementById('resetForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const p1 = document.getElementById('resetPass1').value;
    const p2 = document.getElementById('resetPass2').value;

    if (!p1 || !p2) {
      showNotification('Fields Missing', 'Please enter and confirm your new password.', 'warning');
      return;
    }

    if (p1 !== p2) {
      showNotification('Mismatch', 'Passwords do not match. Please re-enter.', 'danger');
      return;
    }

    showNotification('Password Updated', 'Your password has been successfully reset! Redirecting to login...', 'success');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1200);
  });
}

/* ==========================================================================
   7. Social Auth Simulation
   ========================================================================== */
function initSocialAuthDemo() {
  const googleBtns = document.querySelectorAll('.btn-social-google');
  const fbBtns = document.querySelectorAll('.btn-social-fb');

  googleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      showNotification('Google Demo Sign-In', 'Simulating OAuth login with Google... Signed in as Sarah Jenkins (Customer). Redirecting...', 'info');
      setTimeout(() => {
        window.location.href = 'customer-dashboard.html';
      }, 1000);
    });
  });

  fbBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      showNotification('Facebook Demo Sign-In', 'Simulating OAuth login with Facebook... Signed in as David Miller (Customer). Redirecting...', 'info');
      setTimeout(() => {
        window.location.href = 'customer-dashboard.html';
      }, 1000);
    });
  });
}
