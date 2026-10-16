/**
 * AeroPure - Mold Remediation & Air Quality Testing Service
 * Dashboard JavaScript (dashboard.js)
 * Logic for User Dashboard, Customer Dashboard, and Admin Dashboard
 */

document.addEventListener('DOMContentLoaded', () => {
  initDashboardTabs();
  initSidebarMobile();
  initAppointmentBooking();
  initDemoModals();
  initCharts();
});

/* ==========================================================================
   1. Dashboard Section Tab Switching & Universal Navigation
   ========================================================================== */
function initDashboardTabs() {
  const navLinks = document.querySelectorAll('.dashboard-nav-link[data-target-tab]');
  const tabSections = document.querySelectorAll('.dashboard-tab-content');

  if (!tabSections.length) return;

  // Global tab switcher function
  window.switchToTab = function(targetId) {
    if (!targetId) return;
    const targetSection = document.getElementById(targetId);
    if (!targetSection) {
      console.warn(`Tab #${targetId} not found on this dashboard.`);
      return;
    }

    const allNavLinks = document.querySelectorAll('.dashboard-nav-link[data-target-tab]');
    const allTabSections = document.querySelectorAll('.dashboard-tab-content');

    allNavLinks.forEach(link => {
      if (link.getAttribute('data-target-tab') === targetId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    allTabSections.forEach(section => {
      section.style.display = 'none';
      section.classList.remove('active');
    });

    targetSection.style.display = 'block';
    targetSection.classList.add('active');

    history.replaceState(null, null, `#${targetId}`);

    // Close mobile sidebar if open
    const sidebar = document.querySelector('.dashboard-sidebar');
    if (sidebar && sidebar.classList.contains('show')) {
      sidebar.classList.remove('show');
    }

    // Scroll cleanly to the top of dashboard main content
    const mainEl = document.querySelector('.dashboard-main') || window;
    mainEl.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Click delegation for any element with data-target-tab (buttons, cards, links, badges)
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-target-tab]');
    if (trigger) {
      const targetId = trigger.getAttribute('data-target-tab');
      if (targetId && document.getElementById(targetId)) {
        e.preventDefault();
        window.switchToTab(targetId);
      }
    }
  });

  // Handle URL hash on page load
  const hash = window.location.hash.substring(1);
  if (hash && document.getElementById(hash)) {
    window.switchToTab(hash);
  } else if (navLinks.length > 0) {
    const firstTarget = navLinks[0].getAttribute('data-target-tab');
    window.switchToTab(firstTarget);
  }

  // Handle browser back/forward buttons
  window.addEventListener('hashchange', () => {
    const newHash = window.location.hash.substring(1);
    if (newHash && document.getElementById(newHash)) {
      window.switchToTab(newHash);
    }
  });
}

window.markAllNotificationsRead = function() {
  const badges = document.querySelectorAll('#userUnreadAlertsCount, .badge-unread-count, a[data-target-tab="tab-notifications"] .badge');
  badges.forEach(b => {
    b.textContent = '0';
    b.classList.remove('bg-primary', 'bg-warning');
    b.classList.add('bg-secondary');
  });

  const alertItems = document.querySelectorAll('#tab-notifications .list-group-item');
  alertItems.forEach(item => {
    item.style.opacity = '0.75';
  });

  showNotification('Notifications Cleared', 'All 3 unread alerts have been marked as read.', 'success');
};

window.sendDashboardMessage = function(formEl) {
  const input = formEl.querySelector('input[type="text"], textarea');
  if (!input || !input.value.trim()) return;

  const msgText = input.value.trim();
  const chatContainer = formEl.closest('.p-4').querySelector('.overflow-y-auto') || formEl.closest('.p-4').querySelector('[style*="overflow-y"]');

  if (chatContainer) {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = document.createElement('div');
    userMsg.className = 'mb-2 text-end';
    userMsg.innerHTML = `
      <span class="badge bg-secondary mb-1">You (${nowTime})</span>
      <p class="bg-primary text-white p-3 rounded-3 text-start small mb-0 d-inline-block shadow-sm">
        ${escapeHtml(msgText)}
      </p>
    `;
    chatContainer.appendChild(userMsg);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    input.value = '';
    showNotification('Message Dispatched', 'Your message has been sent to your environmental team.', 'success');

    // Simulated reply after 1.5s
    setTimeout(() => {
      const replyMsg = document.createElement('div');
      replyMsg.className = 'mb-2 text-start';
      replyMsg.innerHTML = `
        <span class="badge bg-primary-subtle text-primary mb-1">AeroPure Response (${nowTime})</span>
        <p class="bg-surface p-3 rounded-3 border text-start small mb-0 d-inline-block shadow-sm">
          Thank you for your update. A project manager has reviewed your inquiry and updated your file.
        </p>
      `;
      chatContainer.appendChild(replyMsg);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 1500);
  } else {
    showNotification('Message Sent', 'Your inquiry has been submitted.', 'success');
    input.value = '';
  }
};

function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/* ==========================================================================
   2. Mobile Sidebar Drawer Toggle
   ========================================================================== */
function initSidebarMobile() {
  const toggleBtn = document.getElementById('sidebarToggleBtn');
  const sidebar = document.querySelector('.dashboard-sidebar');
  const closeBtn = document.getElementById('sidebarCloseBtn');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('show');
    });
  }

  if (closeBtn && sidebar) {
    closeBtn.addEventListener('click', () => {
      sidebar.classList.remove('show');
    });
  }
}

/* ==========================================================================
   3. Customer Inspection Scheduling (Prevent Past Dates & Time Slots)
   ========================================================================== */
function initAppointmentBooking() {
  const dateInput = document.getElementById('bookingDateInput');
  if (dateInput) {
    // Prevent past dates
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }

  const bookingForm = document.getElementById('customerBookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const serviceSelect = document.getElementById('bookingServiceSelect');
      const dateVal = dateInput ? dateInput.value : '';
      const timeSlot = document.getElementById('bookingTimeSlot');
      const address = document.getElementById('bookingAddress');

      if (!dateVal) {
        showNotification('Validation Error', 'Please choose an inspection date.', 'warning');
        return;
      }

      // Past date check
      const selectedDate = new Date(dateVal + 'T00:00:00');
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);

      if (selectedDate < todayDate) {
        showNotification('Invalid Date', 'Inspection date cannot be in the past. Please select today or a future date.', 'danger');
        return;
      }

      const bookingId = 'AP-' + Math.floor(10000 + Math.random() * 90000);
      const newBooking = {
        id: bookingId,
        service: serviceSelect ? serviceSelect.value : 'Comprehensive Mold Inspection',
        date: dateVal,
        time: timeSlot ? timeSlot.value : '09:00 AM - 11:00 AM',
        address: address ? address.value : '742 Evergreen Terrace, Springfield',
        status: 'Scheduled',
        tech: 'Dr. Marcus Vance (IICRC #88219)'
      };

      // Save to localStorage demo data
      let bookings = JSON.parse(localStorage.getItem('aeropure_demo_appointments') || '[]');
      bookings.unshift(newBooking);
      localStorage.setItem('aeropure_demo_appointments', JSON.stringify(bookings));

      // Add to table if present
      prependAppointmentToTable(newBooking);

      // Update badge count
      updateAppointmentBadgeCount();

      showNotification(
        'Inspection Scheduled!', 
        `Booking ${bookingId} confirmed for ${newBooking.date} (${newBooking.time}). An environmental technician has been assigned.`, 
        'success'
      );

      bookingForm.reset();

      // Switch to appointments tab
      const apptTabLink = document.querySelector('[data-target-tab="tab-appointments"]');
      if (apptTabLink) {
        apptTabLink.click();
      }
    });
  }
}

function prependAppointmentToTable(item) {
  const tableBody = document.getElementById('appointmentsTableBody');
  if (!tableBody) return;

  const row = document.createElement('tr');
  row.id = `row-${item.id}`;
  row.innerHTML = `
    <td><strong>${item.id}</strong></td>
    <td>
      <span class="fw-semibold text-primary">${item.service}</span><br>
      <small class="text-muted"><i class="bi bi-geo-alt"></i> ${item.address}</small>
    </td>
    <td>${item.date}<br><small class="text-muted">${item.time}</small></td>
    <td><span class="badge bg-success-subtle text-success border border-success-subtle">${item.status}</span></td>
    <td><small class="text-secondary">${item.tech}</small></td>
    <td>
      <div class="dropdown">
        <button class="btn btn-sm btn-light border" type="button" data-bs-toggle="dropdown">
          <i class="bi bi-three-dots-vertical"></i>
        </button>
        <ul class="dropdown-menu dropdown-menu-end shadow-sm">
          <li><a class="dropdown-item" href="javascript:void(0)" onclick="rescheduleDemo('${item.id}', '${item.date}')"><i class="bi bi-calendar2-range"></i> Reschedule</a></li>
          <li><a class="dropdown-item text-danger" href="javascript:void(0)" onclick="cancelDemo('${item.id}')"><i class="bi bi-x-circle"></i> Cancel Appointment</a></li>
        </ul>
      </div>
    </td>
  `;
  tableBody.prepend(row);
}

function updateAppointmentBadgeCount() {
  const badge = document.getElementById('kpiUpcomingCount');
  if (badge) {
    let current = parseInt(badge.textContent || '2', 10);
    badge.textContent = current + 1;
  }
}

/* ==========================================================================
   4. Demo Interactive Actions (Reschedule, Cancel, Lab PDF)
   ========================================================================== */
window.rescheduleDemo = function(id, currentDate) {
  const newDate = prompt(`Reschedule Appointment [${id}]\nEnter new date (YYYY-MM-DD):`, currentDate);
  if (!newDate) return;

  const chosen = new Date(newDate + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (chosen < now) {
    showNotification('Error', 'New date cannot be in the past!', 'danger');
    return;
  }

  showNotification('Appointment Rescheduled', `Booking ${id} rescheduled to ${newDate}. Technicians updated.`, 'info');
};

window.cancelDemo = function(id) {
  if (confirm(`Are you sure you want to cancel inspection appointment [${id}]?`)) {
    const row = document.getElementById(`row-${id}`);
    if (row) {
      row.style.opacity = '0.5';
      const badge = row.querySelector('.badge');
      if (badge) {
        badge.className = 'badge bg-secondary-subtle text-secondary';
        badge.textContent = 'Cancelled';
      }
    }
    showNotification('Cancelled', `Appointment ${id} has been marked as cancelled.`, 'warning');
  }
};

window.previewLabReport = function(reportId) {
  const modalEl = document.getElementById('labReportModal');
  if (modalEl) {
    if (reportId) {
      const sub = modalEl.querySelector('.modal-title + small');
      if (sub) {
        sub.innerHTML = `Chain of Custody ID: #${escapeHtml(reportId)} • Method: ASTM D7391-20`;
      }
    }
    const bsModal = new bootstrap.Modal(modalEl);
    bsModal.show();
  }
};

window.downloadDemoReport = function(filename) {
  showNotification('Demo Download', `Generating ${filename} (Certified Lab Spore Analysis & Chain of Custody)... Download started.`, 'success');
};

function initDemoModals() {
  // Common listeners for demo notifications
  document.querySelectorAll('.demo-action-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const msg = btn.getAttribute('data-demo-msg') || 'Action completed successfully in demo mode.';
      showNotification('Demo Action', msg, 'info');
    });
  });
}

/* ==========================================================================
   5. Chart.js Visualizations (Customer Air Trends & Admin KPI)
   ========================================================================== */
function initCharts() {
  // Customer Air Quality Chart
  const airCtx = document.getElementById('customerAirChart');
  if (airCtx && typeof Chart !== 'undefined') {
    new Chart(airCtx, {
      type: 'line',
      data: {
        labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct (Today)'],
        datasets: [
          {
            label: 'Mold Spores (spores/m³)',
            data: [1420, 1150, 980, 520, 280, 195],
            borderColor: '#0F766E',
            backgroundColor: 'rgba(15, 118, 110, 0.1)',
            fill: true,
            tension: 0.35,
            borderWidth: 2.5
          },
          {
            label: 'TVOC (ppm x 100)',
            data: [85, 70, 60, 35, 20, 12],
            borderColor: '#38BDF8',
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            tension: 0.35,
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              afterBody: () => '✓ Safe Indoor Environmental Baseline reached.'
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(148, 163, 184, 0.15)' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  }

  // Admin Overview Revenue & Bookings Chart
  const adminCtx = document.getElementById('adminOverviewChart');
  if (adminCtx && typeof Chart !== 'undefined') {
    new Chart(adminCtx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
        datasets: [
          {
            label: 'Inspections Completed',
            data: [42, 58, 64, 78, 92, 115, 128, 134, 142, 160],
            backgroundColor: '#0F766E',
            borderRadius: 6
          },
          {
            label: 'Remediation Projects',
            data: [18, 24, 29, 36, 44, 52, 60, 68, 71, 84],
            backgroundColor: '#10B981',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(148, 163, 184, 0.15)' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  }
}
