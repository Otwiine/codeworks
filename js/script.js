// ============================================================
// Cworks — script.js v3
// ============================================================
document.addEventListener('DOMContentLoaded', function () {

  // 0. AUTO YEAR
  document.querySelectorAll('.footer-year').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // 1. STICKY NAVBAR
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', function () {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // 2. MOBILE MENU
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('active', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
    });
    mobileMenu.querySelectorAll('.nav-link, .btn-primary').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 3. TYPING ANIMATION (service pages only)
  const typingPhraseMap = {
    'ui-ux-design.html':        'Beautiful and functional.',
    'web-development.html':     'From idea to live website.',
    'graphic-design.html':      'Your brand, defined.',
    'database-management.html': 'Structured. Fast. Reliable.',
    'system-building.html':     'Built exactly for your business.'
  };

  const currentPage  = window.location.pathname.split('/').pop();
  const typingPhrase = window._typingOverride || typingPhraseMap[currentPage];
  const typingTarget = document.getElementById('typing-text');

  if (typingTarget && typingPhrase) {
    let charIndex = 0;
    function type() {
      if (charIndex <= typingPhrase.length) {
        typingTarget.textContent = typingPhrase.slice(0, charIndex);
        charIndex++;
        setTimeout(type, 75);
      }
    }
    type();
  }

  // 4. SCROLL REVEAL
  const revealEls = document.querySelectorAll('.reveal');
  const revealObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(function (el) { revealObs.observe(el); });
  if (!('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  // 5. ACTIVE NAV
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links .nav-link');
  const secObs   = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        navLinks.forEach(function (l) { l.classList.remove('active'); });
        const active = document.querySelector(
          '.nav-links a[href="#' + entry.target.id + '"],' +
          '.nav-links a[href$="#' + entry.target.id + '"]'
        );
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(function (s) { secObs.observe(s); });

}); // end DOMContentLoaded

// ── CONTACT FORM ─────────────────────────────────────────────
(function () {
  const form      = document.getElementById('contact-form');
  if (!form) return;

  const submitBtn  = document.getElementById('form-submit');
  const feedback   = document.getElementById('form-feedback');
  const nameInput  = document.getElementById('contact-name');
  const emailInput = document.getElementById('contact-email');
  const phoneInput = document.getElementById('contact-phone');
  const tierSelect = document.getElementById('contact-tier');
  const nameError  = document.getElementById('name-error');
  const emailError = document.getElementById('email-error');
  const phoneError = document.getElementById('phone-error');
  const tierError  = document.getElementById('tier-error');

  function validateName() {
    if (!nameInput || !nameInput.value.trim()) {
      if (nameError) nameError.textContent = 'Please enter your name.';
      if (nameInput) nameInput.classList.add('input-error');
      return false;
    }
    if (nameError) nameError.textContent = '';
    nameInput.classList.remove('input-error');
    return true;
  }

  function validateEmail() {
    if (!emailInput) return true;
    const val = emailInput.value.trim();
    const ok  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    if (!val || !ok) {
      if (emailError) emailError.textContent = !val ? 'Please enter your email.' : 'Please enter a valid email.';
      emailInput.classList.add('input-error');
      return false;
    }
    if (emailError) emailError.textContent = '';
    emailInput.classList.remove('input-error');
    return true;
  }

  function validatePhone() {
    if (!phoneInput) return true;
    if (!phoneInput.value.trim()) {
      if (phoneError) phoneError.textContent = 'Please enter your phone number.';
      phoneInput.classList.add('input-error');
      return false;
    }
    if (phoneError) phoneError.textContent = '';
    phoneInput.classList.remove('input-error');
    return true;
  }

  function validateTier() {
    if (!tierSelect) return true;
    if (!tierSelect.value) {
      if (tierError) tierError.textContent = 'Please select a service tier.';
      tierSelect.classList.add('input-error');
      return false;
    }
    if (tierError) tierError.textContent = '';
    tierSelect.classList.remove('input-error');
    return true;
  }

  if (nameInput)  nameInput.addEventListener('input',  validateName);
  if (emailInput) emailInput.addEventListener('input',  validateEmail);
  if (phoneInput) phoneInput.addEventListener('input',  validatePhone);
  if (tierSelect) tierSelect.addEventListener('change', validateTier);

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const ok = validateName() & validateEmail() & validatePhone() & validateTier();
    if (!ok) return;

    const orig          = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled  = true;
    feedback.hidden     = true;
    feedback.className  = 'form-feedback';

    try {
      const res  = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: new FormData(form) });
      const data = await res.json();

      if (res.ok) {
        const name    = nameInput  ? nameInput.value.trim()  : 'N/A';
        const email   = emailInput ? emailInput.value.trim() : 'N/A';
        const phone   = phoneInput ? phoneInput.value.trim() : 'N/A';
        const tier    = tierSelect ? tierSelect.value        : 'N/A';
        const msg     = form.querySelector('textarea') ? form.querySelector('textarea').value.trim() : 'N/A';

        await fetch('https://discord.com/api/webhooks/1493186929200730232/FEOmFACU4P64xHDYXEieG20kWcHU306K0qlwxspmWnumiJg9VmjxMMXC1oc7inaJst_7', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username:   'Cworks Website',
            avatar_url: 'https://the-runner-team.github.io/website/CodeHub.png',
            embeds: [{
              title:  '📬 New Contact Form Submission',
              color:  0x0d9488,
              fields: [
                { name: '👤 Name',         value: name,  inline: true },
                { name: '📧 Email',        value: email, inline: true },
                { name: '📞 Phone',        value: phone, inline: true },
                { name: '🎯 Service Tier', value: tier,  inline: true },
                { name: '💬 Message',      value: msg,   inline: false }
              ],
              footer:    { text: 'Sent from cworks website' },
              timestamp: new Date().toISOString()
            }]
          })
        });

        feedback.textContent = '✓ Message sent! We\'ll get back to you soon.';
        feedback.classList.add('form-feedback--success');
        feedback.hidden = false;
        form.reset();
        [nameError, emailError, phoneError, tierError].forEach(function (el) { if (el) el.textContent = ''; });
      } else {
        throw new Error(data.message || 'Submission failed');
      }
    } catch (err) {
      feedback.textContent = '✗ ' + (err.message || 'Network error. Please try again.');
      feedback.classList.add('form-feedback--error');
      feedback.hidden = false;
    } finally {
      submitBtn.innerHTML = orig;
      submitBtn.disabled  = false;
    }
  });
})();
