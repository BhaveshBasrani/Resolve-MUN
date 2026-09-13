export function initPortal() {
// Config: replace with actual sheet API URL when deployed
    const GOOGLE_APP_SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_APP_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbxd_EyDHhJY1yokbma62PFcLu1SyBC-QXe32zb8JRIOUaJBowaivqNcgVwqk4HEsxTLpw/exec";

    const loginSection = document.getElementById('loginSection');
    const dashboardSection = document.getElementById('dashboardSection');
    const loginForm = document.getElementById('loginForm');
    const loginSubmitBtn = document.getElementById('loginSubmitBtn');
    const loginSpinner = document.getElementById('loginSpinner');
    const navActionContainer = document.getElementById('navActionContainer');

    const alertBar = document.getElementById('alertBar');
    const alertMessage = document.getElementById('alertMessage');

    // UI elements to update after login
    const delegateName = document.getElementById('delegateName');
    const delegateIdText = document.getElementById('delegateIdText');
    const avatarText = document.getElementById('avatarText');
    const profileEmail = document.getElementById('profileEmail');
    const profilePhone = document.getElementById('profilePhone');
    const allocatedCommittee = document.getElementById('allocatedCommittee');
    const allocatedCountry = document.getElementById('allocatedCountry');
    const qrPassImg = document.getElementById('qrPassImg');

    const day1Tracker = document.getElementById('day1Tracker');
    const day1Status = document.getElementById('day1Status');
    const day2Tracker = document.getElementById('day2Tracker');
    const day2Status = document.getElementById('day2Status');
    const day3Tracker = document.getElementById('day3Tracker');
    const day3Status = document.getElementById('day3Status');

    // Show Custom Alert Dialog
    function showAlert(message, type = 'error') {
      alertMessage.innerText = message;
      alertBar.className = 'alert-bar';
      if (type === 'success') {
        alertBar.classList.add('success');
      }
      alertBar.classList.add('active');
      
      setTimeout(() => {
        alertBar.classList.remove('active');
      }, 5000);
    }

    // Auto-login from localStorage if session exists
    document.addEventListener('DOMContentLoaded', () => {
      const savedDelegate = localStorage.getItem('resolve_delegate_session');
      if (savedDelegate) {
        try {
          const delegate = JSON.parse(savedDelegate);
          showDashboard(delegate);
        } catch (e) {
          localStorage.removeItem('resolve_delegate_session');
        }
      }
    });

    // Handle Login Submit
    if (loginForm) loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value.trim();

      if (!email || !password) {
        showAlert('Please fill in both email and password.');
        return;
      }

      // Hardening submit state
      loginSubmitBtn.disabled = true;
      loginSpinner.style.display = 'inline-block';

      try {
        const response = await fetch(GOOGLE_APP_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'DELEGATE_LOGIN',
            email: email,
            password: password
          })
        });

        if (!response.ok) {
          throw new Error('Connection error. Please try again later.');
        }

        const result = await response.json();
        
        if (result.status === 'success') {
          // Save session
          localStorage.setItem('resolve_delegate_session', JSON.stringify(result.delegate));
          showAlert('Login successful!', 'success');
          setTimeout(() => {
            showDashboard(result.delegate);
          }, 600);
        } else {
          showAlert(result.message || 'Invalid credentials.');
        }
      } catch (err) {
        showAlert(err.message || 'Login failed. Please check your network connection.');
      } finally {
        loginSubmitBtn.disabled = false;
        loginSpinner.style.display = 'none';
      }
    });

    // Show Dashboard UI and Populate Data
    function showDashboard(delegate) {
      // Hide login, show dashboard
      loginSection.style.display = 'none';
      dashboardSection.style.display = 'grid';

      // Update Nav Action to logout button
      navActionContainer.innerHTML = '<button class="logout-btn" onclick="logoutDelegate()">Logout</button>';

      // Populate text details
      delegateName.innerText = delegate.name;
      delegateIdText.innerText = delegate.delegateId;
      avatarText.innerText = delegate.name ? delegate.name.charAt(0).toUpperCase() : 'D';
      profileEmail.innerText = delegate.email;
      profilePhone.innerText = delegate.phone;
      allocatedCommittee.innerText = delegate.committee || "Not Yet Assigned";
      allocatedCountry.innerText = delegate.country || "Not Yet Assigned";

      // Set Attendance Statuses
      updateAttendanceUI(day1Tracker, day1Status, delegate.checkinDay1);
      updateAttendanceUI(day2Tracker, day2Status, delegate.checkinDay2);
      updateAttendanceUI(day3Tracker, day3Status, delegate.checkinDay3);

      // Generate QR Code using qrserver API
      // Encode delegateId inside QR Code
      const qrData = encodeURIComponent(delegate.delegateId);
      qrPassImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qrData}`;
    }

    // Update Attendance UI Day Styles
    function updateAttendanceUI(cardEl, textEl, status) {
      cardEl.className = 'attendance-day';
      
      const cleanStatus = status ? String(status).trim().toLowerCase() : '';
      if (cleanStatus === 'checked in' || cleanStatus === 'present') {
        cardEl.classList.add('present');
        textEl.innerHTML = '<span class="status-dot"></span><span>Checked In</span>';
        textEl.className = 'day-status present-text';
      } else {
        cardEl.classList.add('absent');
        textEl.innerHTML = '<span class="status-dot"></span><span>Absent</span>';
        textEl.className = 'day-status absent-text';
      }
    }

    // Logout function
    window.logoutDelegate = function() {
      localStorage.removeItem('resolve_delegate_session');
      
      // Reset layout
      loginForm.reset();
      loginSection.style.display = 'block';
      dashboardSection.style.display = 'none';
      navActionContainer.innerHTML = '<a href="index.html" class="back-btn" id="homeBtn">Back to Home</a>';
      showAlert('Logged out successfully.', 'success');
    };

    // Canvas particle background system
    document.addEventListener('DOMContentLoaded', () => {
      const canvas = document.createElement('canvas');
      canvas.id = 'particleCanvas';
      canvas.style.position = 'fixed';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      canvas.style.zIndex = '-1';
      canvas.style.pointerEvents = 'none';
      document.body.appendChild(canvas);

      const ctx = canvas.getContext('2d');
      let particles = [];
      const particleCount = 45;

      function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      window.addEventListener('resize', resize);
      resize();

      class Particle {
        constructor() {
          this.reset();
        }
        reset() {
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
          this.size = Math.random() * 2 + 0.5;
          this.speedX = (Math.random() - 0.5) * 0.25;
          this.speedY = (Math.random() - 0.5) * 0.25;
          this.opacity = Math.random() * 0.4 + 0.15;
        }
        update() {
          this.x += this.speedX;
          this.y += this.speedY;
          if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
            this.reset();
          }
        }
        draw() {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(167, 139, 250, ${this.opacity})`;
          ctx.fill();
        }
      }

      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }

      function loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
          p.update();
          p.draw();
        });
        requestAnimationFrame(loop);
      }
      loop();
    });
}
