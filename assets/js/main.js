/* ============================================================
   ENAL CORPORATE WEBSITE — MAIN JAVASCRIPT
   Cleaned & Refactored for Language Persistence & Interactions
   ============================================================ */

'use strict';

/* ── Utility ────────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Navigation ─────────────────────────────────────────────── */
function initNav() {
  const nav        = $('#nav');
  const hamburger  = $('#hamburger');
  const mobileMenu = $('#mobileMenu');
  const mobileLinks = $$('[data-mobile-link]');

  if (!nav) return;

  // Scroll state
  function onScroll() {
    nav.classList.toggle('nav--scrolled', window.scrollY > 50);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Hamburger toggle
  function openMenu() {
    hamburger.classList.add('open');
    mobileMenu.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    hamburger.classList.contains('open') ? closeMenu() : openMenu();
  });

  // Close on link click
  mobileLinks.forEach(link => link.addEventListener('click', closeMenu));

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });
}

/* ── Hero Parallax ──────────────────────────────────────────── */
function initParallax() {
  if (prefersReducedMotion) return;

  const heroBg = $('#heroBg');
  if (!heroBg) return;

  let ticking = false;

  function updateParallax() {
    const scrollY = window.scrollY;
    const heroH   = heroBg.closest('.hero')?.offsetHeight || 600;

    if (scrollY <= heroH) {
      const offset = scrollY * 0.35;
      heroBg.style.transform = `scale(1.08) translateY(${offset}px)`;
    }
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });
}

/* ── Scroll Reveal ──────────────────────────────────────────── */
function initScrollReveal() {
  const elements = $$('.reveal');
  if (!elements.length) return;

  if (prefersReducedMotion) {
    elements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

/* ── Scroll to Top ──────────────────────────────────────────── */
function initScrollTop() {
  const btn = $('#scrollTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 600);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ── Active Nav Link on Scroll ──────────────────────────────── */
function initActiveNav() {
  const sections = $$('section[id], footer[id]');
  const navLinks = $$('.nav__link');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          const href = link.getAttribute('href').replace('#', '');
          link.style.color = href === id ? 'var(--gold)' : '';
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => observer.observe(s));
}

/* ── Project Category Filter ────────────────────────────────── */
function initCategoryFilter() {
  const tabs  = $$('.cat__tab');
  const cards = $$('.cat__card');
  if (!tabs.length || !cards.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const cat = tab.dataset.cat;

      // Update tabs
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      // Filter cards
      cards.forEach(card => {
        const cats = card.dataset.categories || '';
        const show = cat === 'all' || cats.includes(cat);

        if (show) {
          card.style.display = 'block';
          requestAnimationFrame(() => {
            card.classList.add('visible');
          });
        } else {
          card.classList.remove('visible');
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ── Contact Form ───────────────────────────────────────────── */
function initContactForm() {
  const form    = $('#contactForm');
  const success = $('#formSuccess');
  if (!form) return;

  const ENAL_EMAIL = 'enal@enal.com.sa';

  form.addEventListener('submit', e => {
    e.preventDefault();

    // Validation
    const nameEl    = $('#name',    form);
    const emailEl   = $('#email',   form);
    const messageEl = $('#message', form);
    let valid = true;

    [nameEl, emailEl, messageEl].forEach(field => {
      if (!field.value.trim()) {
        field.style.borderColor = 'rgba(210,100,100,0.6)';
        valid = false;
      } else {
        field.style.borderColor = '';
      }
    });

    if (!valid) return;

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(emailEl.value.trim())) {
      emailEl.style.borderColor = 'rgba(210,100,100,0.6)';
      return;
    }

    // Collect form data
    const name    = nameEl.value.trim();
    const company = $('#company', form).value.trim();
    const email   = emailEl.value.trim();
    const phone   = $('#phone',   form).value.trim();
    const inquiry = $('#inquiry', form).value || '';
    const message = messageEl.value.trim();

    const isAr = currentLang === 'ar';

    // Build subject
    const inquiryLabels = {
      civil:          isAr ? 'أعمال مدنية'        : 'Civil Works',
      infrastructure: isAr ? 'بنية تحتية'          : 'Infrastructure',
      structural:     isAr ? 'أعمال إنشائية'       : 'Structural Works',
      roads:          isAr ? 'طرق وطرق سريعة'      : 'Roads & Highways',
      buildings:      isAr ? 'مباني'               : 'Buildings',
      other:          isAr ? 'أخرى'                : 'Other',
    };
    const inquiryLabel = inquiryLabels[inquiry] || (isAr ? 'استفسار عام' : 'General Inquiry');

    const subject = isAr
      ? `استفسار من ${name} — ${inquiryLabel}`
      : `Inquiry from ${name} — ${inquiryLabel}`;

    // Build body
    const body = isAr
      ? [
          `الاسم: ${name}`,
          company ? `الشركة: ${company}` : '',
          `البريد الإلكتروني: ${email}`,
          phone   ? `الهاتف: ${phone}`   : '',
          `نوع الاستفسار: ${inquiryLabel}`,
          '',
          'الرسالة:',
          message,
        ].filter(Boolean).join('\n')
      : [
          `Name: ${name}`,
          company ? `Company: ${company}` : '',
          `Email: ${email}`,
          phone   ? `Phone: ${phone}`     : '',
          `Inquiry Type: ${inquiryLabel}`,
          '',
          'Message:',
          message,
        ].filter(Boolean).join('\n');

    // Open mailto
    const mailto = `mailto:${ENAL_EMAIL}`
      + `?subject=${encodeURIComponent(subject)}`
      + `&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;

    // Show success message
    if (success) {
      const msg = isAr
        ? success.getAttribute('data-ar')
        : success.getAttribute('data-en');
      if (msg) success.textContent = msg;
      success.style.display = 'block';
      setTimeout(() => { success.style.display = 'none'; }, 6000);
    }

    // Reset form after short delay (let mailto open first)
    setTimeout(() => { form.reset(); }, 500);
  });

  // Clear error on input
  $$('.form__input, .form__textarea', form).forEach(field => {
    field.addEventListener('input', () => { field.style.borderColor = ''; });
  });
}

/* ── Smooth Anchor Scroll ───────────────────────────────────── */
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const navH = document.getElementById('nav')?.offsetHeight || 80;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ============================================================
   JS-LANG: Language Switch + Modal + WhatsApp Messages
   ============================================================ */

const WA_NUMBER = '966505558040';

const WA_MESSAGES = {
  en: {
    default:  'Hello, I would like to inquire about ENAL\'s construction and infrastructure services.',
    service:  (s) => `Hello, I would like to inquire about ENAL\'s service: ${s}.`,
  },
  ar: {
    default:  'مرحباً، أود الاستفسار عن خدمات شركة إينال للإنشاء والبنية التحتية.',
    service:  (s) => `مرحباً، أود الاستفسار عن خدمة ${s} لدى شركة إينال.`,
  }
};

/* ── Language State & Persistence Management ────────────────── */
let currentLang = localStorage.getItem('enal-lang') || 'en';

/* ── Apply language to all elements ────────────────────────── */
function applyLanguage(lang) {
  const html = document.documentElement;
  html.lang = lang;
  html.dir  = lang === 'ar' ? 'rtl' : 'ltr';

  // Keep document metadata aligned with the visible language.
  const seoTitle = html.getAttribute(`data-seo-title-${lang}`);
  const seoDescription = html.getAttribute(`data-seo-description-${lang}`);
  if (seoTitle) document.title = seoTitle;
  if (seoDescription) {
    const description = document.querySelector('meta[name="description"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    [description, ogDescription, twitterDescription].forEach(meta => {
      if (meta) meta.setAttribute('content', seoDescription);
    });
  }

  // Update all translatable text elements
  document.querySelectorAll('[data-en][data-ar]').forEach(el => {
    const text = el.getAttribute(`data-${lang}`);
    if (!text) return;
    if (text.includes('<')) {
      el.innerHTML = text;
    } else {
      el.textContent = text;
    }
  });

  // Update placeholders
  document.querySelectorAll('[data-placeholder-en][data-placeholder-ar]').forEach(el => {
    el.placeholder = el.getAttribute(`data-placeholder-${lang}`) || '';
  });

  // Update select options
  document.querySelectorAll('select option[data-en][data-ar]').forEach(opt => {
    opt.textContent = opt.getAttribute(`data-${lang}`) || opt.textContent;
  });

  // Update lang toggle buttons
  const toggleLabel = lang === 'ar' ? 'EN' : 'AR';
  ['langToggle', 'footerLangToggle'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.textContent = id === 'footerLangToggle'
      ? (lang === 'ar' ? 'EN | English' : 'AR | العربية')
      : (lang === 'ar' ? '🌐 EN' : '🌐 AR');
  });

  const mobileToggle = document.getElementById('mobileLangToggle');
  if (mobileToggle) {
    mobileToggle.textContent = lang === 'ar' ? 'EN | English' : 'AR | العربية';
  }

  const langToggleMobile = document.getElementById('langToggleMobile');
  if (langToggleMobile) {
    langToggleMobile.textContent = lang === 'ar' ? '🌐 EN' : '🌐 AR';
  }

  // Update WhatsApp links
  updateWhatsAppLinks(lang);

  // Save preference correctly without reset bug
  localStorage.setItem('enal-lang', lang);
  sessionStorage.setItem('lang-chosen', 'true');
  currentLang = lang;
}

/* ── Update WhatsApp links ─────────────────────────────────── */
function updateWhatsAppLinks(lang) {
  const msg     = encodeURIComponent(WA_MESSAGES[lang].default);
  const baseUrl = `https://wa.me/${WA_NUMBER}?text=${msg}`;

  const floatBtn = document.getElementById('whatsappFloat');
  if (floatBtn) floatBtn.href = baseUrl;

  const contactBtn = document.getElementById('whatsappContactBtn');
  if (contactBtn) contactBtn.href = baseUrl;

  document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
    if (link.id === 'whatsappFloat' || link.id === 'whatsappContactBtn') return;
    link.href = baseUrl;
  });
}

/* ── Language Toggle Init ──────────────────────────────────── */
function initLanguage() {
  applyLanguage(currentLang);

  const toggleLanguage = () => {
    const newLang = currentLang === 'en' ? 'ar' : 'en';
    applyLanguage(newLang);
  };

  const toggle = document.getElementById('langToggle');
  if (toggle) toggle.addEventListener('click', toggleLanguage);

  const mobileToggle = document.getElementById('mobileLangToggle');
  if (mobileToggle) mobileToggle.addEventListener('click', toggleLanguage);

  const langToggleMobile = document.getElementById('langToggleMobile');
  if (langToggleMobile) langToggleMobile.addEventListener('click', toggleLanguage);

  const footerToggle = document.getElementById('footerLangToggle');
  if (footerToggle) footerToggle.addEventListener('click', toggleLanguage);
}

/* ── Service Inquiry Modal ──────────────────────────────────── */
function initServiceModal() {
  const overlay    = document.getElementById('serviceModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalSvc   = document.getElementById('modalService');
  const confirmBtn = document.getElementById('modalConfirm');
  const cancelBtn  = document.getElementById('modalCancel');

  // رسائل واتساب مخصصة لكل خدمة
  const SERVICE_MESSAGES = {
    en: {
      'Civil & Infrastructure':
        "Hello, I would like to inquire about ENAL's Civil & Infrastructure services, including civil works, earthworks, road construction, and infrastructure projects. Please provide more details.",
      'Structural Works':
        "Hello, I would like to inquire about ENAL's Structural Works services, including concrete structures, steel works, and structural construction. Please provide more details.",
      'Mechanical · Electrical · Communication':
        "Hello, I would like to inquire about ENAL's Mechanical, Electrical & Communication works services. Please provide more details.",
      'Building & Finishing':
        "Hello, I would like to inquire about ENAL's Building & Finishing services, including building construction and finishing works. Please provide more details.",
      'Equipment & Field Capability':
        "Hello, I would like to inquire about ENAL's Equipment & Field Capability, including heavy machinery and field operations. Please provide more details.",
      'Project Control':
        "Hello, I would like to inquire about ENAL's Project Control services, including project management, planning, and quality control. Please provide more details.",
    },
    ar: {
      'الأعمال المدنية والبنية التحتية':
        'مرحباً، أود الاستفسار عن خدمات شركة إينال في الأعمال المدنية والبنية التحتية، شاملةً أعمال الحفر والطرق ومشاريع البنية التحتية. أرجو تزويدي بمزيد من التفاصيل.',
      'الأعمال الإنشائية':
        'مرحباً، أود الاستفسار عن خدمات شركة إينال في الأعمال الإنشائية، شاملةً الهياكل الخرسانية والمعدنية والأعمال الإنشائية. أرجو تزويدي بمزيد من التفاصيل.',
      'الأعمال الميكانيكية والكهربائية والاتصالات':
        'مرحباً، أود الاستفسار عن خدمات شركة إينال في الأعمال الميكانيكية والكهربائية والاتصالات. أرجو تزويدي بمزيد من التفاصيل.',
      'البناء والتشطيبات':
        'مرحباً، أود الاستفسار عن خدمات شركة إينال في أعمال البناء والتشطيبات، شاملةً تشييد المباني وأعمال الإنهاء. أرجو تزويدي بمزيد من التفاصيل.',
      'المعدات والقدرة الميدانية':
        'مرحباً، أود الاستفسار عن قدرات شركة إينال في المعدات الثقيلة والعمليات الميدانية. أرجو تزويدي بمزيد من التفاصيل.',
      'التحكم في المشاريع':
        'مرحباً، أود الاستفسار عن خدمات شركة إينال في إدارة ومتابعة المشاريع، شاملةً التخطيط وضبط الجودة والسلامة. أرجو تزويدي بمزيد من التفاصيل.',
    }
  };

  if (!overlay) return;

  let currentService = { en: '', ar: '' };

  document.querySelectorAll('.cap__item').forEach(item => {
    item.addEventListener('click', () => openModal(item));
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(item);
      }
    });
  });

  function openModal(item) {
    currentService.en = item.getAttribute('data-service-en') || '';
    currentService.ar = item.getAttribute('data-service-ar') || '';

    modalSvc.textContent = currentLang === 'ar'
      ? currentService.ar
      : currentService.en;

    const titleText = currentLang === 'ar'
      ? modalTitle.getAttribute('data-ar')
      : modalTitle.getAttribute('data-en');
    if (titleText) modalTitle.textContent = titleText;

    const confirmText = currentLang === 'ar'
      ? confirmBtn.getAttribute('data-ar')
      : confirmBtn.getAttribute('data-en');
    if (confirmText) confirmBtn.textContent = confirmText;

    const cancelText = currentLang === 'ar'
      ? cancelBtn.getAttribute('data-ar')
      : cancelBtn.getAttribute('data-en');
    if (cancelText) cancelBtn.textContent = cancelText;

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    confirmBtn.focus();
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  confirmBtn.addEventListener('click', () => {
    const svcKey = currentLang === 'ar' ? currentService.ar : currentService.en;
    const msgs   = SERVICE_MESSAGES[currentLang];
    const msg    = msgs[svcKey] || WA_MESSAGES[currentLang].service(svcKey);
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
    closeModal();
  });

  cancelBtn.addEventListener('click', closeModal);

  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
  });
}

/* ── DOM Ready Initializer ──────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initParallax();
  initScrollReveal();
  initScrollTop();
  initActiveNav();
  initCategoryFilter();
  initContactForm();
  initSmoothScroll();
  initLanguage();
  initServiceModal();
});

/* ── Towers Gallery Slider ──────────────────────────────────── */
function initTowersGallery() {
  const track    = document.getElementById('towersTrack');
  const dotsWrap = document.getElementById('towersDots');
  const prevBtn  = document.getElementById('towersPrev');
  const nextBtn  = document.getElementById('towersNext');
  if (!track || !prevBtn || !nextBtn) return;

  const slides = [...track.querySelectorAll('.tower__slide')];
  const total  = slides.length;
  let current  = 0;
  let startX   = 0;
  let isDragging = false;

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'towers__dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  function getSlideWidth() {
    return slides[0].offsetWidth + parseInt(getComputedStyle(track).gap || '24');
  }

  function goTo(index) {
    current = Math.max(0, Math.min(index, total - 1));
    const isRtl = document.documentElement.dir === 'rtl';
    const offset = current * getSlideWidth();
    track.style.transform = isRtl
      ? `translateX(${offset}px)`
      : `translateX(-${offset}px)`;

    // Update dots
    [...dotsWrap.querySelectorAll('.towers__dot')].forEach((d, i) => {
      d.classList.toggle('active', i === current);
      d.setAttribute('aria-selected', i === current ? 'true' : 'false');
    });

    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === total - 1;
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  // Touch / drag support
  track.addEventListener('pointerdown', e => {
    startX = e.clientX;
    isDragging = true;
    track.setPointerCapture(e.pointerId);
  });

  track.addEventListener('pointerup', e => {
    if (!isDragging) return;
    isDragging = false;
    const diff = startX - e.clientX;
    const isRtl = document.documentElement.dir === 'rtl';
    if (Math.abs(diff) > 50) {
      if (isRtl) {
        diff < 0 ? goTo(current + 1) : goTo(current - 1);
      } else {
        diff > 0 ? goTo(current + 1) : goTo(current - 1);
      }
    }
  });

  // Keyboard
  track.setAttribute('tabindex', '0');
  track.addEventListener('keydown', e => {
    const isRtl = document.documentElement.dir === 'rtl';
    if (e.key === 'ArrowRight') { e.preventDefault(); isRtl ? goTo(current - 1) : goTo(current + 1); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); isRtl ? goTo(current + 1) : goTo(current - 1); }
  });

  goTo(0);
}

// Add to DOMContentLoaded
document.addEventListener('DOMContentLoaded', initTowersGallery);

/* ── Credentials Lightbox ───────────────────────────────────── */
function initCredLightbox() {
  const overlay   = document.getElementById('credLightbox');
  const closeBtn  = document.getElementById('lightboxClose');
  const lightImg  = document.getElementById('lightboxImg');
  if (!overlay || !closeBtn || !lightImg) return;

  document.querySelectorAll('.cred__card').forEach(card => {
    card.addEventListener('click', () => {
      const img = card.querySelector('img');
      if (!img) return;
      lightImg.src = img.src;
      lightImg.alt = img.alt;
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    });
  });

  function closeLightbox() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    lightImg.src = '';
  }

  closeBtn.addEventListener('click', closeLightbox);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeLightbox(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeLightbox();
  });
}

document.addEventListener('DOMContentLoaded', initCredLightbox);
