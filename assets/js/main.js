/**
 * AeroPure - Mold Remediation & Air Quality Testing Service
 * Main JavaScript (main.js)
 * Site-wide Theme (Dark/Light), RTL/LTR, Navigation, and Interactive Features
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initRTL();
  initNavbar();
  initScrollTop();
  initForms();
  initTooltips();
});

/* ==========================================================================
   1. Theme Management (Dark / Light Mode)
   ========================================================================== */
function initTheme() {
  const savedTheme = localStorage.getItem('aeropure_theme') || 
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  
  applyTheme(savedTheme);

  const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
  themeToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-bs-theme') || 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
      localStorage.setItem('aeropure_theme', newTheme);
      showNotification('Theme Updated', `Switched to ${newTheme.toUpperCase()} mode.`, 'info');
    });
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-bs-theme', theme);
  const themeIcons = document.querySelectorAll('.theme-toggle-icon');
  const logoImgs = document.querySelectorAll('.site-logo-img');

  themeIcons.forEach(icon => {
    if (theme === 'dark') {
      icon.classList.remove('bi-moon-stars-fill');
      icon.classList.add('bi-sun-fill');
      icon.style.color = '#F59E0B';
    } else {
      icon.classList.remove('bi-sun-fill');
      icon.classList.add('bi-moon-stars-fill');
      icon.style.color = '';
    }
  });

  logoImgs.forEach(img => {
    // If dark mode, swap to logo-dark.svg if not already
    if (theme === 'dark') {
      img.src = img.src.replace('logo.svg', 'logo-dark.svg');
    } else {
      img.src = img.src.replace('logo-dark.svg', 'logo.svg');
    }
  });
}

/* ==========================================================================
   2. Direction Management (RTL / LTR)
   ========================================================================== */
function initRTL() {
  const savedDir = localStorage.getItem('aeropure_dir') || 'ltr';
  applyRTL(savedDir);

  const rtlToggleBtns = document.querySelectorAll('.rtl-toggle-btn');
  rtlToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const currentDir = document.documentElement.getAttribute('dir') || 'ltr';
      const newDir = currentDir === 'rtl' ? 'ltr' : 'rtl';
      applyRTL(newDir);
      localStorage.setItem('aeropure_dir', newDir);
      showNotification('Layout Direction', `Switched layout to ${newDir.toUpperCase()}.`, 'info');
    });
  });
}

function applyRTL(dir) {
  document.documentElement.setAttribute('dir', dir);
  const rtlBadges = document.querySelectorAll('.rtl-badge-text');
  rtlBadges.forEach(badge => {
    badge.textContent = dir === 'rtl' ? 'LTR' : 'RTL';
  });

  // Load or adjust Bootstrap RTL if needed
  let rtlLink = document.getElementById('bootstrap-rtl-css');
  if (dir === 'rtl') {
    if (!rtlLink) {
      rtlLink = document.createElement('link');
      rtlLink.id = 'bootstrap-rtl-css';
      rtlLink.rel = 'stylesheet';
      rtlLink.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.rtl.min.css';
      document.head.appendChild(rtlLink);
    }
  } else {
    if (rtlLink) {
      rtlLink.remove();
    }
  }
}

/* ==========================================================================
   3. Navbar & Mobile Menu
   ========================================================================== */
function initNavbar() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link, .dropdown-item');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href === currentPath || (currentPath === '' && href === 'index.html'))) {
      link.classList.add('active');
      const parentDropdown = link.closest('.dropdown');
      if (parentDropdown) {
        const toggle = parentDropdown.querySelector('.dropdown-toggle');
        if (toggle) toggle.classList.add('active');
      }
    }
  });

  // Mobile menu close on click
  const navCollapse = document.getElementById('primaryNavCollapse');
  if (navCollapse) {
    const mobileLinks = navCollapse.querySelectorAll('a:not(.dropdown-toggle)');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth < 992) {
          const bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
          if (bsCollapse) bsCollapse.hide();
        }
      });
    });
  }
}

/* ==========================================================================
   4. Scroll To Top Button
   ========================================================================== */
function initScrollTop() {
  let btn = document.getElementById('scrollTopBtn');
  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'scrollTopBtn';
    btn.setAttribute('aria-label', 'Scroll to top');
    btn.innerHTML = '<i class="bi bi-arrow-up"></i>';
    document.body.appendChild(btn);
  }

  window.addEventListener('scroll', () => {
    if (window.scrollY > 350) {
      btn.style.display = 'flex';
    } else {
      btn.style.display = 'none';
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ==========================================================================
   5. Site-Wide Form Methods, Input Sanitization & Validation Engine
   ========================================================================== */
function initForms() {
  applyInputRestrictions();
  bindFormSubmissions();
}

/**
 * 1. LIVE INPUT RESTRICTIONS:
 *    - Name Only: Blocks and removes numbers & special characters in real-time.
 *    - Number Only: Blocks and removes letters & invalid characters in real-time.
 *    - Email Method: Real-time pattern validation with clear feedback.
 */
function applyInputRestrictions() {
  // A. Name Only Fields (Letters, spaces, hyphens, and apostrophes only)
  const nameSelector = 'input[data-type="name"], input#contactName, input#regName, input[name="name"], input[name="fullName"], input[name="firstName"], input[name="lastName"], input[placeholder*="Doe"], input[placeholder*="Rachel Keller"], input[placeholder*="Full Name"], input[placeholder*="Your Name"]';
  const nameInputs = document.querySelectorAll(nameSelector);

  nameInputs.forEach(input => {
    // Prevent typing digits or forbidden symbols on keydown
    input.addEventListener('keydown', (e) => {
      // Allow control keys (Backspace, Tab, Delete, Arrow keys, Enter, Ctrl/Cmd shortcuts)
      if (e.key === 'Backspace' || e.key === 'Tab' || e.key === 'Delete' || 
          e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown' ||
          e.key === 'Home' || e.key === 'End' || e.key === 'Enter' || e.ctrlKey || e.metaKey) {
        return;
      }
      // If key is a number (0-9) or forbidden symbol, block it
      if (/[0-9!@#$%^&*()_+=\[\]{};:"\\|,.<>\/?~`]/.test(e.key)) {
        e.preventDefault();
        showFieldFeedback(input, 'Name only: Numbers and special characters are not allowed.', false);
      }
    });

    // Sanitize on input (catches paste, autocomplete, drag-drop)
    input.addEventListener('input', () => {
      const original = input.value;
      const sanitized = original.replace(/[^a-zA-Z\s'.\-]/g, '');
      if (original !== sanitized) {
        input.value = sanitized;
        showFieldFeedback(input, 'Name only: Numbers and special characters were automatically removed.', false);
      } else if (sanitized.trim().length >= 2) {
        clearFieldFeedback(input);
        setFieldState(input, true);
      } else {
        clearFieldFeedback(input);
      }
    });

    input.addEventListener('blur', () => {
      validateNameField(input);
    });
  });

  // B. Number / Phone Only Fields (Digits, +, -, (, ), spaces only)
  const phoneSelector = 'input[type="tel"], input[data-type="phone"], input#contactPhone, input#regPhone, input[name*="phone" i], input[placeholder*="(555)"]';
  const phoneInputs = document.querySelectorAll(phoneSelector);

  phoneInputs.forEach(input => {
    // Prevent typing alphabetical characters on keydown
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' || e.key === 'Tab' || e.key === 'Delete' || 
          e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown' ||
          e.key === 'Home' || e.key === 'End' || e.key === 'Enter' || e.ctrlKey || e.metaKey) {
        return;
      }
      // If key is a letter, block it
      if (/[a-zA-Z]/.test(e.key)) {
        e.preventDefault();
        showFieldFeedback(input, 'Numbers only: Alphabet letters are not allowed in phone number.', false);
      }
    });

    input.addEventListener('input', () => {
      const original = input.value;
      const sanitized = original.replace(/[^0-9+\-()\s]/g, '');
      if (original !== sanitized) {
        input.value = sanitized;
        showFieldFeedback(input, 'Numbers only: Letters were automatically removed.', false);
      } else {
        const digits = sanitized.replace(/\D/g, '');
        if (digits.length >= 7) {
          clearFieldFeedback(input);
          setFieldState(input, true);
        } else {
          clearFieldFeedback(input);
        }
      }
    });

    input.addEventListener('blur', () => {
      validatePhoneField(input);
    });
  });

  // C. Pure Numeric / Zip Code Fields (Digits only)
  const zipInputs = document.querySelectorAll('input[data-type="zip"], input[data-type="digits"], input[placeholder*="90210"], input[name*="zip" i]');
  zipInputs.forEach(input => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' || e.key === 'Tab' || e.key === 'Delete' || 
          e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.ctrlKey || e.metaKey) {
        return;
      }
      if (!/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        showFieldFeedback(input, 'Numbers only for postal/ZIP code.', false);
      }
    });

    input.addEventListener('input', () => {
      input.value = input.value.replace(/\D/g, '').slice(0, 5);
      if (input.value.length === 5) {
        clearFieldFeedback(input);
        setFieldState(input, true);
      }
    });
  });

  // D. Email ID Fields (Strict email format check)
  const emailInputs = document.querySelectorAll('input[type="email"], input[data-type="email"], input#contactEmail, input#regEmail, input#loginEmail, input#forgotEmail');
  emailInputs.forEach(input => {
    input.addEventListener('input', () => {
      const val = input.value.trim();
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (emailRegex.test(val)) {
        clearFieldFeedback(input);
        setFieldState(input, true);
      } else {
        input.classList.remove('is-valid');
      }
    });

    input.addEventListener('blur', () => {
      validateEmailField(input);
    });
  });
}

function validateNameField(input) {
  const val = input.value.trim();
  if (input.required && !val) {
    showFieldFeedback(input, 'Name is required (letters only).', false);
    return false;
  }
  if (val && val.length < 2) {
    showFieldFeedback(input, 'Name must be at least 2 letters long.', false);
    return false;
  }
  if (val && /[^a-zA-Z\s'.\-]/.test(val)) {
    showFieldFeedback(input, 'Name only: Numbers and special characters are not allowed.', false);
    return false;
  }
  if (val) {
    setFieldState(input, true);
    return true;
  }
  return true;
}

function validatePhoneField(input) {
  const val = input.value.trim();
  const digits = val.replace(/\D/g, '');
  if (input.required && !val) {
    showFieldFeedback(input, 'Phone number is required (numbers only).', false);
    return false;
  }
  if (val && digits.length < 7) {
    showFieldFeedback(input, 'Please enter a valid phone number with numbers only (min 7-10 digits).', false);
    return false;
  }
  if (val) {
    setFieldState(input, true);
    return true;
  }
  return true;
}

function validateEmailField(input) {
  const val = input.value.trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (input.required && !val) {
    showFieldFeedback(input, 'Email ID is required.', false);
    return false;
  }
  if (val && !emailRegex.test(val)) {
    showFieldFeedback(input, 'Please enter a valid Email ID (e.g. name@domain.com).', false);
    return false;
  }
  if (val) {
    setFieldState(input, true);
    return true;
  }
  return true;
}

function showFieldFeedback(input, message, isValid = false) {
  setFieldState(input, isValid);
  let feedback = input.parentNode.querySelector('.invalid-feedback');
  if (!feedback) {
    feedback = document.createElement('div');
    feedback.className = 'invalid-feedback';
    input.parentNode.appendChild(feedback);
  }
  feedback.textContent = message;
  feedback.style.display = isValid ? 'none' : 'block';
}

function clearFieldFeedback(input) {
  input.classList.remove('is-invalid');
  const feedback = input.parentNode.querySelector('.invalid-feedback');
  if (feedback) feedback.style.display = 'none';
}

function setFieldState(input, isValid) {
  if (isValid) {
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
  } else {
    input.classList.remove('is-valid');
    input.classList.add('is-invalid');
  }
}

/**
 * 2. UNIVERSAL FORM SUBMISSION VALIDATOR
 */
function bindFormSubmissions() {
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    if (form.dataset.formBound === 'true') return;
    form.dataset.formBound = 'true';

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      let formIsValid = true;
      let firstInvalidEl = null;

      // Validate all inputs in the form
      const inputs = form.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        if (input.disabled || input.readOnly) return;

        let fieldValid = true;

        // Name check
        if (input.dataset.type === 'name' || 
            input.id === 'contactName' || input.id === 'regName' || 
            input.name === 'name' || input.name === 'fullName' ||
            (input.placeholder && input.placeholder.toLowerCase().includes('doe'))) {
          fieldValid = validateNameField(input);
        }
        // Phone check
        else if (input.type === 'tel' || input.dataset.type === 'phone' || 
                 input.id === 'contactPhone' || input.id === 'regPhone') {
          fieldValid = validatePhoneField(input);
        }
        // Email check
        else if (input.type === 'email' || input.dataset.type === 'email' || input.id === 'contactEmail' || input.id === 'regEmail') {
          fieldValid = validateEmailField(input);
        }
        // Required check for others
        else if (input.required) {
          if (input.type === 'checkbox') {
            fieldValid = input.checked;
            if (!fieldValid) showFieldFeedback(input, 'You must agree before proceeding.', false);
            else setFieldState(input, true);
          } else if (!input.value.trim()) {
            fieldValid = false;
            showFieldFeedback(input, 'This field is required.', false);
          } else {
            setFieldState(input, true);
          }
        }

        if (!fieldValid) {
          formIsValid = false;
          if (!firstInvalidEl) firstInvalidEl = input;
        }
      });

      if (!formIsValid) {
        if (firstInvalidEl) {
          firstInvalidEl.focus();
        }
        showNotification('Validation Error', 'Please check the highlighted fields with proper name, number, or email format.', 'warning');
        return;
      }

      // Handle Form Success Actions
      if (form.id === 'publicContactForm') {
        const cMsg = document.getElementById('contactSuccessMsg');
        if (cMsg) {
          cMsg.classList.remove('d-none');
          cMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        showNotification('Inquiry Submitted!', 'Thank you! Your inspection inquiry has been sent to our dispatch team.', 'success');
        form.reset();
        clearFormValidationClasses(form);
      }
      else if (form.classList.contains('newsletter-form')) {
        showNotification('Subscribed!', 'Thank you! You are now subscribed to Air Quality alerts and tips.', 'success');
        form.reset();
        clearFormValidationClasses(form);
      }
      else if (form.id === 'registerForm') {
        showNotification('Account Created!', 'Registration successful! Directing to customer dashboard...', 'success');
        setTimeout(() => {
          window.location.href = 'customer-dashboard.html';
        }, 1200);
      }
      else if (form.id === 'loginForm') {
        showNotification('Login Successful!', 'Welcome back to AeroPure Solutions! Directing to dashboard...', 'success');
        setTimeout(() => {
          window.location.href = 'customer-dashboard.html';
        }, 1000);
      }
      else if (form.id === 'forgotForm') {
        showNotification('Reset Link Dispatched', 'Password reset instructions have been sent to your email.', 'success');
        form.reset();
        clearFormValidationClasses(form);
      }
      else if (form.id === 'resetForm') {
        showNotification('Password Updated', 'Your password has been changed successfully. Directing to login...', 'success');
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1200);
      }
      else if (form.id === 'customerBookingForm') {
        showNotification('Inspection Scheduled!', 'Your environmental diagnostic appointment has been confirmed.', 'success');
        form.reset();
        clearFormValidationClasses(form);
      }
      else {
        showNotification('Form Submitted', 'Thank you! Your information has been processed successfully.', 'success');
        form.reset();
        clearFormValidationClasses(form);
      }
    });
  });
}

function clearFormValidationClasses(form) {
  const fields = form.querySelectorAll('.is-valid, .is-invalid');
  fields.forEach(f => {
    f.classList.remove('is-valid', 'is-invalid');
  });
  const feedbacks = form.querySelectorAll('.invalid-feedback');
  feedbacks.forEach(fb => fb.style.display = 'none');
}

/* ==========================================================================
   6. Universal Toast Notification Helper
   ========================================================================== */
function showNotification(title, message, type = 'info') {
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    toastContainer.style.zIndex = '1100';
    document.body.appendChild(toastContainer);
  }

  const icons = {
    success: 'bi-check-circle-fill text-success',
    info: 'bi-info-circle-fill text-primary',
    warning: 'bi-exclamation-triangle-fill text-warning',
    danger: 'bi-x-circle-fill text-danger'
  };

  const toastEl = document.createElement('div');
  toastEl.className = 'toast border-0 shadow-lg';
  toastEl.setAttribute('role', 'alert');
  toastEl.setAttribute('aria-live', 'assertive');
  toastEl.setAttribute('aria-atomic', 'true');
  toastEl.innerHTML = `
    <div class="toast-header bg-surface border-bottom">
      <i class="bi ${icons[type] || icons.info} me-2 fs-5"></i>
      <strong class="me-auto font-heading">${title}</strong>
      <small class="text-muted">Just now</small>
      <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body bg-surface text-secondary">
      ${message}
    </div>
  `;

  toastContainer.appendChild(toastEl);
  const bsToast = new bootstrap.Toast(toastEl, { delay: 4000 });
  bsToast.show();

  toastEl.addEventListener('hidden.bs.toast', () => {
    toastEl.remove();
  });
}

function initTooltips() {
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
}
