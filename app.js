/**
 * Sanka Sri Art - Interactive Logic, Filter Tabs, QR Generator & Poster Lightbox
 */

document.addEventListener('DOMContentLoaded', () => {
  // Set Current Year
  const currentYearEl = document.getElementById('currentYear');
  if (currentYearEl) {
    currentYearEl.textContent = new Date().getFullYear();
  }

  // QR Modal Elements
  const qrModal = document.getElementById('qrModal');
  const openQrBtn = document.getElementById('openQrBtn');
  const closeQrBtn = document.getElementById('closeQrBtn');
  const shareBtn = document.getElementById('shareBtn');
  const customQrUrlInput = document.getElementById('customQrUrl');
  const updateQrBtn = document.getElementById('updateQrBtn');
  const downloadQrBtn = document.getElementById('downloadQrBtn');
  const copyLinkBtn = document.getElementById('copyLinkBtn');
  const downloadVcardBtn = document.getElementById('downloadVcardBtn');
  const toastBox = document.getElementById('toastBox');
  const toastMsg = document.getElementById('toastMsg');
  const qrcodeContainer = document.getElementById('qrcode');

  let qrInstance = null;

  // Initialize Default QR Code Target URL
  const initialUrl = window.location.protocol.startsWith('http') 
    ? window.location.href 
    : 'http://www.sankasriart.com/';

  if (customQrUrlInput) {
    customQrUrlInput.value = initialUrl;
  }

  // Generate QR Function
  function generateQRCode(text) {
    if (!qrcodeContainer) return;
    qrcodeContainer.innerHTML = '';
    
    qrInstance = new QRCode(qrcodeContainer, {
      text: text,
      width: 192,
      height: 192,
      colorDark: '#0a0c12',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });
  }

  generateQRCode(initialUrl);

  // QR Modal Open / Close
  function openModal() {
    qrModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (typeof confetti === 'function') {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#e50914', '#ff2a34', '#ffffff', '#facc15']
      });
    }
  }

  function closeModal() {
    qrModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  openQrBtn?.addEventListener('click', openModal);
  closeQrBtn?.addEventListener('click', closeModal);

  qrModal?.addEventListener('click', (e) => {
    if (e.target === qrModal) {
      closeModal();
    }
  });

  // Update QR on user input
  updateQrBtn?.addEventListener('click', () => {
    const newUrl = customQrUrlInput.value.trim();
    if (newUrl) {
      generateQRCode(newUrl);
      showToast('QR Code updated successfully!');
    } else {
      showToast('Please enter a valid URL');
    }
  });

  // Download QR as PNG
  downloadQrBtn?.addEventListener('click', () => {
    const qrImg = qrcodeContainer.querySelector('img') || qrcodeContainer.querySelector('canvas');
    if (qrImg) {
      let dataUrl = '';
      if (qrImg.tagName.toLowerCase() === 'img') {
        dataUrl = qrImg.src;
      } else if (qrImg.tagName.toLowerCase() === 'canvas') {
        dataUrl = qrImg.toDataURL('image/png');
      }

      if (dataUrl) {
        const link = document.createElement('a');
        link.download = 'sanka-sri-art-qr.png';
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('QR Code downloaded!');
      }
    }
  });

  // Copy Link Button
  copyLinkBtn?.addEventListener('click', () => {
    const currentUrl = customQrUrlInput.value.trim() || window.location.href;
    navigator.clipboard.writeText(currentUrl).then(() => {
      showToast('URL copied to clipboard!');
    }).catch(() => {
      showToast('Failed to copy');
    });
  });

  // Native Web Share API
  shareBtn?.addEventListener('click', async () => {
    const shareData = {
      title: 'Sanka Sri Art',
      text: 'Sanka Sri Art - Photography & Event Management | Bookings Open',
      url: window.location.protocol.startsWith('http') ? window.location.href : 'http://www.sankasriart.com/'
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(shareData.url).then(() => {
        showToast('Link copied to clipboard!');
      });
    }
  });

  // Save Contact Card (.vcf)
  downloadVcardBtn?.addEventListener('click', () => {
    const vCardData = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      'N:Art;Sanka Sri;;;',
      'FN:Sanka Sri Art',
      'ORG:Sanka Sri Art (Photography & Event Management)',
      'TITLE:Founder & Creative Director',
      'TEL;TYPE=CELL,VOICE,PREF:+94766025459',
      'URL:http://www.sankasriart.com/',
      'URL;TYPE=Facebook:https://www.facebook.com/sankasriart.lk',
      'NOTE:Turning Your Special Moments into Timeless Memories. Photography & Event Management.',
      'END:VCARD'
    ].join('\r\n');

    const blob = new Blob([vCardData], { type: 'text/vcard;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Sanka_Sri_Art.vcf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    showToast('Contact card (vCard) saved!');
  });

  // Service Tabs Filter (All / Photography / Events)
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPhoto = document.getElementById('tabPhoto');
  const tabEvents = document.getElementById('tabEvents');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-tab');
      if (filter === 'all') {
        tabPhoto.style.display = 'block';
        tabEvents.style.display = 'block';
      } else if (filter === 'photography') {
        tabPhoto.style.display = 'block';
        tabEvents.style.display = 'none';
      } else if (filter === 'events') {
        tabPhoto.style.display = 'none';
        tabEvents.style.display = 'block';
      }
    });
  });

  // ESC key listener
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  });

  // Toast Functionality
  let toastTimer = null;
  function showToast(message) {
    if (!toastBox || !toastMsg) return;
    toastMsg.textContent = message;
    toastBox.classList.add('show');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastBox.classList.remove('show');
    }, 2800);
  }

  // Cinematic Welcome Splash Screen Controller
  const welcomeScreen = document.getElementById('welcomeScreen');
  const welcomeEnterBtn = document.getElementById('welcomeEnterBtn');
  const welcomeProgressFill = document.getElementById('welcomeProgressFill');
  const welcomeStatusText = document.getElementById('welcomeStatusText');

  if (welcomeScreen) {
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 6;
      if (welcomeProgressFill) {
        welcomeProgressFill.style.width = `${Math.min(progress, 100)}%`;
      }

      if (progress >= 45 && welcomeStatusText) {
        welcomeStatusText.textContent = 'Welcome to Sanka Sri Art';
      }

      if (progress >= 100) {
        clearInterval(progressInterval);
        setTimeout(dismissWelcomeScreen, 220);
      }
    }, 32);

    function dismissWelcomeScreen() {
      if (!welcomeScreen || welcomeScreen.classList.contains('hidden')) return;
      welcomeScreen.classList.add('fade-out');
      setTimeout(() => {
        welcomeScreen.classList.add('hidden');
      }, 550);
    }

    welcomeEnterBtn?.addEventListener('click', () => {
      clearInterval(progressInterval);
      dismissWelcomeScreen();
    });
  }
});
