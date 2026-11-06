// Load header, content, and footer from separate files
function loadSection(url, elementId, errorMsg, callback) {
  if (!document.getElementById(elementId)) return;
  fetch(url)
    .then(r => {
      if (!r.ok) throw new Error(`Failed to load ${url}`);
      return r.text();
    })
    .then(t => {
      document.getElementById(elementId).innerHTML = t;
      if (callback) callback();
    })
    .catch(e => document.getElementById(elementId).innerHTML = errorMsg);
}

// Load reusable components
loadSection('header.html?v=20261026-2', 'header', '<div class="error">Header failed to load.</div>');
loadSection('footer.html?v=20261026-2', 'footer', '<div class="error">Footer failed to load.</div>');
// Shared invitation layout; each page supplies its own copy and destination.
const invitationSlots = document.querySelectorAll('[data-cta], section#cta');
if (invitationSlots.length) {
  fetch('primary-cta.html?v=20261017-2')
    .then(response => {
      if (!response.ok) throw new Error('CTA template failed to load');
      return response.text();
    })
    .then(template => invitationSlots.forEach(slot => {
      slot.classList.remove('cta');
      slot.classList.add('content-invitation');
      slot.innerHTML = template;
      const heading = slot.querySelector('[data-cta-part="heading"]');
      if (slot.dataset.ctaHeading) {
        heading.textContent = slot.dataset.ctaHeading;
        heading.hidden = false;
      }
      const context = slot.querySelector('[data-cta-part="context"]');
      if (slot.dataset.ctaContext) context.textContent = slot.dataset.ctaContext;
      if (slot.dataset.ctaFollowup) {
        const followup = document.createElement('p');
        followup.className = 'cta-context';
        followup.textContent = slot.dataset.ctaFollowup;
        context.after(followup);
      }
      const button = slot.querySelector('[data-cta-part="button"]');
      if (slot.dataset.ctaLabel) button.textContent = slot.dataset.ctaLabel;
      if (slot.dataset.ctaHref) button.setAttribute('href', slot.dataset.ctaHref);
    }))
    .catch(() => invitationSlots.forEach(slot => {
      const link = document.createElement('a');
      link.href = slot.dataset.ctaHref || 'contact.html';
      link.className = 'cta-button';
      link.textContent = slot.dataset.ctaLabel || 'Schedule a conversation';
      slot.replaceChildren(link);
    }));
}

// Case study pagination logic
document.addEventListener("DOMContentLoaded", function() {
  const studies = [
    { href: "artizent.html", label: "Artizent" },
    { href: "afi.html", label: "American Family" },
    { href: "cgi.html", label: "CGI" },
    { href: "smc.html", label: "Santa's Magic Call" },
    //{ href: "vocus.html", label: "Vocus Marketing Cloud" },
    //{ href: "tableworks.html", label: "Tableworks" }
  ];

  const currentFile = window.location.pathname.split('/').pop();
  const currentIndex = studies.findIndex(s => s.href === currentFile);

  const pagination = document.querySelector('pagination');
  if (pagination) {
    pagination.innerHTML = `
      <nav class="pagination-nav" aria-label="Case studies">
        <ul class="pagination-list">
          ${studies.map((study, index) => `<li>${index === currentIndex
            ? `<span class="pagination-current" aria-current="page" aria-disabled="true">${study.label}</span>`
            : `<a href="${study.href}" class="pagination-link">${study.label}</a>`
          }</li>`).join('')}
        </ul>
      </nav>
    `;
  }
});

// recommendations 
document.addEventListener("DOMContentLoaded", function() {
  // Recommendation image responsive fix (optional)
  const recImg = document.querySelector('.recommendation img');
  if (recImg) {
    recImg.style.maxWidth = '48px';
    recImg.style.height = 'auto';
    recImg.style.verticalAlign = 'middle';
  }

  // If you want to dynamically load recommendations, example:
  // const recommendationText = document.querySelector('.recommendation-text');
  // if (recommendationText) {
  //   recommendationText.innerHTML = "Recommendations<br/>Allan has both a deep understanding of design, and of the technical details required...";
  // }
});

// ------------------------------------------------------------
// MEDIA MODAL — Images & Video (local + YouTube)
// Usage (example):
// <a href="#" class="media-trigger" data-type="image" data-src="img/pic.jpg">Open image</a>
// <a href="#" class="media-trigger" data-type="video" data-src="media/clip.mp4">Open video</a>
// <a href="#" class="media-trigger" data-type="youtube" data-video="https://www.youtube.com/embed/VIDEO_ID">Open YouTube</a>
// ------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function() {
  function createMediaModal() {
    if (document.getElementById('mediaModal')) return;

    const modal = document.createElement('div');
    modal.id = 'mediaModal';
    modal.className = 'modal media-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <div class="modal-inner" role="document">
        <button class="modal-close" aria-label="Close media">×</button>
        <div class="modal-body" aria-live="polite"></div>
      </div>
    `;
    document.body.appendChild(modal);
    // Close when clicking the backdrop (modal) or the close button.
    // Also prevent clicks inside the modal inner from bubbling to the backdrop.
    const inner = modal.querySelector('.modal-inner');
    const closeBtn = modal.querySelector('.modal-close');
    modal.addEventListener('click', function(e) {
      if (e.target === modal) closeMediaModal();
    });
    if (closeBtn) closeBtn.addEventListener('click', function(e) { e.preventDefault(); closeMediaModal(); });
    if (inner) inner.addEventListener('click', function(e) { e.stopPropagation(); });
  }

  function openMediaModal({ type, src, aspect: passedAspect, title, description, proof, descriptionLabel, proofLabel, alt }) {
    createMediaModal();
    const modal = document.getElementById('mediaModal');
    const body = modal.querySelector('.modal-body');
    body.innerHTML = '';
    modal.classList.toggle('has-details', Boolean(title || description || proof));

    if (type === 'image') {
      const img = document.createElement('img');
      img.src = src;
      img.alt = alt || '';
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      body.appendChild(img);
    } else if (type === 'video') {
      const video = document.createElement('video');
      video.controls = true;
      video.autoplay = true;
      video.src = src;
      video.style.maxWidth = '100%';
      video.style.height = 'auto';
      body.appendChild(video);
    } else if (type === 'youtube') {
      // Use a responsive wrapper so portrait (9:16) and landscape (16:9) videos scale correctly.
      // Trigger can optionally include `data-aspect="W:H"` (e.g. "9:16" or "16:9"). Default to 16:9.
      const aspectAttr = (src && src._triggerAspect) || null;
      // If trigger passed aspect via src wrapper (legacy), ignore; we'll get dataset from caller below.
      // Build a frame and responsive container; we'll set padding-top based on aspect ratio.
      const frame = document.createElement('div');
      frame.className = 'media-frame';

      const embed = document.createElement('div');
      embed.className = 'embed-responsive';

      const iframe = document.createElement('iframe');
      const sep = src.includes('?') ? '&' : '?';
      iframe.src = `${src}${sep}autoplay=1&rel=0`;
      iframe.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('loading', 'lazy');

      // Determine aspect ratio: prefer the passedAspect (from trigger), then modal._currentAspect, then fallback 16:9
      let aspect = 16 / 9;
      if (typeof passedAspect === 'number' && passedAspect > 0) {
        aspect = passedAspect;
      } else {
        try {
          const modalTemp = document.getElementById('mediaModal');
          if (modalTemp && modalTemp._currentAspect) aspect = modalTemp._currentAspect;
        } catch (e) {}
      }

      // Compute padding-top percent from aspect (width / height)
      // We also clamp the rendered height to the viewport so the modal doesn't become excessively tall.
      embed.style.position = 'relative';
      embed.style.width = '100%';
      // set a base paddingTop from aspect
      let paddingTop = (1 / aspect) * 100; // percent

      // ensure the outer frame has a sensible width so the responsive calculation yields visible height
      frame.style.width = 'min(960px, 92vw)';
      frame.style.maxWidth = '100%';

      // After the frame is added to the DOM we'll compute its rendered width and clamp height
      // but since we haven't appended yet, compute using a viewport-aware fallback width
      const viewportWidth = Math.min(960, Math.round(window.innerWidth * 0.92));
      const desiredHeight = viewportWidth * (1 / aspect);
      const maxAllowed = Math.max(160, window.innerHeight - 80); // leave room for close button & padding
      if (desiredHeight > maxAllowed) {
        // reduce paddingTop so height becomes maxAllowed
        paddingTop = (maxAllowed / viewportWidth) * 100;
      }
      embed.style.paddingTop = paddingTop + '%';
      // Ensure the outer frame has a sensible width so the responsive calculation yields visible height
      // Use viewport-aware sizing: up to 960px, otherwise 92vw
      frame.style.width = 'min(960px, 92vw)';
      frame.style.maxWidth = '100%';
      iframe.style.position = 'absolute';
      iframe.style.top = '0';
      iframe.style.left = '0';
      iframe.style.width = '100%';
      iframe.style.height = '100%';

      embed.appendChild(iframe);
      frame.appendChild(embed);
      body.appendChild(frame);
    }

    if (title || description || proof) {
      const details = document.createElement('div');
      details.className = 'media-details';

      if (title) {
        const heading = document.createElement('h2');
        heading.className = 'media-details-title';
        heading.textContent = title;
        details.appendChild(heading);
      }

      if (description && descriptionLabel) {
        const label = document.createElement('h3');
        label.className = 'media-details-title';
        label.textContent = descriptionLabel;
        details.appendChild(label);
      }
      if (description) {
        const copy = document.createElement('p');
        copy.className = 'media-details-description';
        copy.textContent = description;
        details.appendChild(copy);
      }

      if (proof) {
        const proofBlock = document.createElement('div');
        proofBlock.className = 'media-details-proof';

        const proofTitle = document.createElement('h3');
        proofTitle.textContent = proofLabel || 'What this proves';
        proofBlock.appendChild(proofTitle);

        const proofCopy = document.createElement('p');
        proofCopy.textContent = proof;
        proofBlock.appendChild(proofCopy);

        details.appendChild(proofBlock);
      }

      body.appendChild(details);
    }

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) closeBtn.focus();

    // store a reference for cleanup
    modal._currentType = type;
  }

  function closeMediaModal() {
    const modal = document.getElementById('mediaModal');
    if (!modal) return;
    const body = modal.querySelector('.modal-body');

    // Pause and remove media sources to stop playback
    const video = body.querySelector('video');
    if (video) {
      try { video.pause(); } catch (e) {}
      video.src = '';
      video.load && video.load();
    }
    const iframe = body.querySelector('iframe');
    if (iframe) {
      iframe.src = '';
    }
    body.innerHTML = '';
    modal.classList.remove('has-details');

    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = 'auto';
  }

  // Initialize triggers
  const triggers = document.querySelectorAll('.media-trigger');
  if (triggers && triggers.length) {
    triggers.forEach((trigger) => {
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        const type = (this.dataset.type || 'image').toLowerCase();
        const src = this.dataset.src || this.dataset.video || this.href || this.getAttribute('href');
        const title = this.dataset.title || '';
        const description = this.dataset.description || '';
        const proof = this.dataset.proof || '';
        const descriptionLabel = this.dataset.descriptionLabel || '';
        const proofLabel = this.dataset.proofLabel || '';
        const triggerImage = this.querySelector('img');
        const alt = triggerImage ? triggerImage.alt : '';
        // If the trigger supplies an explicit aspect (e.g. data-aspect="9:16" or "16:9"), parse it
        let aspect = null;
        if (this.dataset.aspect) {
          const a = this.dataset.aspect.trim();
          // allow formats like "9:16", "16:9", or decimal (0.5625)
          if (a.includes(':') || a.includes('/')) {
            const parts = a.split(/[:\/]/).map(p => parseFloat(p));
            if (parts.length === 2 && parts[0] > 0 && parts[1] > 0) {
              aspect = parts[0] / parts[1];
            }
          } else {
            const v = parseFloat(a);
            if (!Number.isNaN(v) && v > 0) aspect = v;
          }
        }
        // store aspect temporarily on modal for the youtube render path (fallback) and pass it into the open call
        const modalEl = document.getElementById('mediaModal');
        if (modalEl) modalEl._currentAspect = aspect || (16/9);
        if (!src) return;
        openMediaModal({ type, src, aspect, title, description, proof, descriptionLabel, proofLabel, alt });
      });
    });

    // Delegate modal-level events
    document.body.addEventListener('click', function (e) {
      const modal = document.getElementById('mediaModal');
      if (!modal) return;
      if (e.target.matches('.modal-close')) return closeMediaModal();
      if (e.target === modal) return closeMediaModal();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMediaModal();
    });
  }
});
