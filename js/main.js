// Global error listener to output errors directly to the screen for visual debugging
window.addEventListener('error', (e) => {
  showDebugBanner(e.error || new Error(e.message));
});

function showDebugBanner(err) {
  let banner = document.getElementById('debug-error-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'debug-error-banner';
    banner.style.position = 'fixed';
    banner.style.top = '0';
    banner.style.left = '0';
    banner.style.right = '0';
    banner.style.background = '#ff5f57';
    banner.style.color = '#fff';
    banner.style.padding = '20px';
    banner.style.zIndex = '999999';
    banner.style.fontFamily = 'monospace';
    banner.style.fontSize = '12px';
    banner.style.maxHeight = '50vh';
    banner.style.overflowY = 'auto';
    banner.style.borderBottom = '3px solid #191818';
    document.body.appendChild(banner);
  }
  banner.innerHTML = `<strong>[DEBUG ERROR]</strong> ${err.message}<br><pre style="margin-top: 10px; white-space: pre-wrap;">${err.stack}</pre>`;
}

// Global charsets for scramble compile effect
const CHARSETS = {
  default: "░▒▓█▄▀▌▐■▪▫▬▲▼◄►",
  binary: "01"
};

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. MOBILE NAV MENU TOGGLE
  // ==========================================
  function initMobileNav() {
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');
    
    if (navToggle && navLinks) {
      navToggle.addEventListener('click', () => {
        const expanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', !expanded);
        navLinks.classList.toggle('is-open');
      });

      navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          navLinks.classList.remove('is-open');
          navToggle.setAttribute('aria-expanded', 'false');
        });
      });
    }
  }

  // ==========================================
  // 2. TEXT COMPILE-SCRAMBLE ANIMATIONS
  // ==========================================

  // Prepares elements for compile animations by wrapping chars in spans with constant widths
  function prepareScrambleText(el, charsetName) {
    const originalText = el.getAttribute('aria-label') || el.textContent || "";
    const charset = CHARSETS[charsetName] || CHARSETS.default;
    const chars = originalText.split("");
    
    el.innerHTML = chars.map(c => 
      c === " " ? '<span class="hero__char">&nbsp;</span>' : `<span class="hero__char">${c}</span>`
    ).join("");
    
    const spans = Array.from(el.querySelectorAll(".hero__char"));
    
    // Set widths to prevent layout shifts during compile
    spans.forEach(span => {
      const rect = span.getBoundingClientRect();
      span.style.width = `${rect.width}px`;
    });

    // Populate with random initial scramble characters
    spans.forEach((span, idx) => {
      if (chars[idx] !== " ") {
        span.textContent = charset[Math.floor(Math.random() * charset.length)];
      }
    });

    return { chars, spans };
  }

  // Performs the scramble-to-reveal animation
  function runScrambleAnimation(chars, spans, charsetName, duration = 1200) {
    const charset = CHARSETS[charsetName] || CHARSETS.default;
    const length = chars.length;
    const startTime = performance.now();
    let tickCount = 0;
    let finished = false;

    function finalize() {
      if (finished) return;
      finished = true;
      spans.forEach((span, idx) => {
        span.textContent = chars[idx] === " " ? "\u00A0" : chars[idx];
        span.style.width = ""; // Reset inline width
      });
    }

    function tick() {
      if (finished) return; // safety timer already finalized this element

      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = progress * progress; // Quadratic ease-in
      const revealLimit = Math.floor(easedProgress * length);
      tickCount++;

      for (let i = 0; i < length; i++) {
        if (chars[i] !== " ") {
          if (i < revealLimit) {
            // Keep original character
            if (spans[i].textContent !== chars[i]) {
              spans[i].textContent = chars[i];
            }
          } else if (tickCount % 5 === 0) {
            // Shuffle scramble characters every few frames
            spans[i].textContent = charset[Math.floor(Math.random() * charset.length)];
          }
        }
      }

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        finalize();
      }
    }

    // Safety net: if requestAnimationFrame stalls or gets interrupted for
    // any reason (backgrounded tab, an error elsewhere on the page, etc.),
    // this is the site's name/role text \u2014 it must never get stuck scrambled.
    // Force the real text to show no later than duration + 600ms.
    setTimeout(finalize, duration + 600);

    requestAnimationFrame(tick);
  }

  // Animates header name toggle (Athul VR <-> Athullvr)
  function initHeaderNameToggle(heroSection) {
    if (!heroSection || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const nameEl = heroSection.querySelector(".hero__name");
    if (!nameEl) return;

    const realName = "Athul VR";
    const nickName = "Athullvr";
    const maxLength = Math.max(realName.length, nickName.length);
    const charset = CHARSETS.default;
    
    let animationFrame = null;
    let timeoutId = null;
    let isHovered = false;
    let isShowingNickname = false;

    // Measures dynamic character width
    function getCharWidth(char) {
      if (!char) return 0;
      const span = document.createElement("span");
      span.className = "hero__char";
      span.style.position = "absolute";
      span.style.visibility = "hidden";
      span.textContent = char === " " ? "\u00A0" : char;
      nameEl.appendChild(span);
      const w = span.getBoundingClientRect().width;
      span.remove();
      return w;
    }

    // Assures length of spans meets target length
    function adjustSpans() {
      let spans = Array.from(nameEl.querySelectorAll(".hero__char"));
      while (spans.length < maxLength) {
        const span = document.createElement("span");
        span.className = "hero__char";
        span.textContent = "";
        span.style.width = "0px";
        nameEl.appendChild(span);
        spans.push(span);
      }
      return spans;
    }

    function setFinalText(text) {
      nameEl.innerHTML = text.split("").map(c => 
        c === " " ? '<span class="hero__char">&nbsp;</span>' : `<span class="hero__char">${c}</span>`
      ).join("");
    }

    function transitionTo(targetText, callback) {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }

      const spans = adjustSpans();
      const targetChars = [];
      for (let i = 0; i < maxLength; i++) {
        targetChars.push(i < targetText.length ? targetText[i] : "");
      }

      // Record widths
      const currentWidths = spans.map(s => s.getBoundingClientRect().width);
      const targetWidths = targetChars.map(c => c ? getCharWidth(c) : 0);

      // Lock current widths
      spans.forEach((span, i) => {
        span.style.width = `${currentWidths[i]}px`;
      });

      // Randomized delays per character (goes from left to right with slight noise)
      const charDelays = Array.from({ length: maxLength }, (_, i) => {
        return (i / maxLength) * 0.55 + Math.random() * 0.3;
      });

      const duration = 800;
      const startTime = performance.now();
      let tickCount = 0;

      const step = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        tickCount++;

        for (let i = 0; i < maxLength; i++) {
          const span = spans[i];
          const targetChar = targetChars[i];
          const isEmpty = targetChar === "";
          
          // Eased linear interpolation for character width changes
          const widthProgress = Math.min(progress * 1.3, 1);
          const cubicProgress = 1 - Math.pow(1 - widthProgress, 3);
          const w = currentWidths[i] + (targetWidths[i] - currentWidths[i]) * cubicProgress;
          span.style.width = `${w}px`;

          if (isEmpty) {
            if (w < 1) {
              span.textContent = "";
            } else if (tickCount % 4 === 0) {
              span.textContent = charset[Math.floor(Math.random() * charset.length)];
            }
          } else if (progress >= charDelays[i]) {
            const finalChar = targetChar === " " ? "\u00A0" : targetChar;
            if (span.textContent !== finalChar) {
              span.textContent = finalChar;
            }
          } else if (tickCount % 4 === 0) {
            span.textContent = charset[Math.floor(Math.random() * charset.length)];
          }
        }

        if (progress < 1) {
          animationFrame = requestAnimationFrame(step);
        } else {
          setFinalText(targetText);
          isShowingNickname = (targetText === nickName);
          animationFrame = null;
          if (callback) callback();
        }
      };

      animationFrame = requestAnimationFrame(step);
    }

    // Auto loop transitions when idle
    function startIdleLoop() {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      const delay = isShowingNickname ? 2500 : 6000 + Math.random() * 4000;
      timeoutId = setTimeout(() => {
        if (isHovered) return;
        transitionTo(isShowingNickname ? realName : nickName, startIdleLoop);
      }, delay);
    }

    // Mouse Listeners
    if (window.matchMedia("(hover: hover)").matches) {
      nameEl.addEventListener("mouseenter", () => {
        isHovered = true;
        if (timeoutId) clearTimeout(timeoutId);
        transitionTo(nickName);
      });
      nameEl.addEventListener("mouseleave", () => {
        isHovered = false;
        transitionTo(realName, startIdleLoop);
      });
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        if (timeoutId) clearTimeout(timeoutId);
      } else if (!isHovered) {
        startIdleLoop();
      }
    });

    startIdleLoop();
  }


  // ==========================================
  // 3. GSAP ANIMATIONS & SCROLL EFFECTS
  // ==========================================
  function initGSAPAnimations() {
    // 1. Text Scramble Compilation on Hero Entrance
    const heroSection = document.getElementById('home');
    const reveals = document.querySelectorAll('[data-hero-reveal]');

    if (heroSection && reveals.length > 0) {
      // Set opacity/y limits
      gsap.set(reveals, { opacity: 0, y: 20 });
      
      const timeline = gsap.timeline({ delay: 0.15 });

      reveals.forEach((el, index) => {
        timeline.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out'
        }, index * 0.14);

        // Scramble trigger
        const compileType = el.getAttribute('data-compile');
        if (compileType && CHARSETS[compileType]) {
          const { chars, spans } = prepareScrambleText(el, compileType);
          timeline.call(() => {
            runScrambleAnimation(chars, spans, compileType, compileType === 'binary' ? 900 : 1100);
          }, [], index * 0.14 + 0.3);
        }
      });

      // Enable name hover toggling after timeline finishes
      timeline.call(() => {
        heroSection.classList.add('is-hero-visible');
        initHeaderNameToggle(heroSection);
      }, [], '+=0.2');
    }

    // 2. Parallax Scroll Tuning for Hero Background & scroll hints
    const heroVisual = document.querySelector('.hero__visual');
    const heroContent = document.querySelector('.hero__content');
    if (heroSection) {
      const pTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: heroSection,
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });
      if (heroContent) pTimeline.to(heroContent, { yPercent: -15, ease: 'none' }, 0);
      if (heroVisual) pTimeline.to(heroVisual, { yPercent: -8, ease: 'none' }, 0);

      // Hero Skew Glitch Trigger on initial scroll
      ScrollTrigger.create({
        trigger: heroSection,
        start: '5% top',
        end: '12% top',
        onEnter: () => {
          gsap.timeline()
            .to(heroSection, { skewX: 0.35, x: 2, duration: 0.04, ease: 'none' })
            .to(heroSection, { skewX: -0.2, x: -1, duration: 0.04, ease: 'none' })
            .to(heroSection, { skewX: 0, x: 0, duration: 0.06, ease: 'power2.out' });
        }
      });
    }

    // 3. Scroll Reveal Actions (blur, clip, scale, up, down, etc.)
    const revealPresets = {
      up: { opacity: 0, y: 30 },
      down: { opacity: 0, y: -30 },
      left: { opacity: 0, x: -30 },
      right: { opacity: 0, x: 30 },
      scale: { opacity: 0, scale: 0.95 },
      blur: { opacity: 0, y: 20, filter: 'blur(10px)' },
      clip: { clipPath: 'inset(100% 0 0 0)' },
      fade: { opacity: 0 }
    };

    const revealTargets = {
      up: { opacity: 1, y: 0 },
      down: { opacity: 1, y: 0 },
      left: { opacity: 1, x: 0 },
      right: { opacity: 1, x: 0 },
      scale: { opacity: 1, scale: 1 },
      blur: { opacity: 1, y: 0, filter: 'blur(0px)' },
      clip: { clipPath: 'inset(0% 0 0 0)' },
      fade: { opacity: 1 }
    };

    // Staggered lists reveals
    document.querySelectorAll('[data-reveal-section]').forEach(sec => {
      const children = sec.querySelectorAll('[data-reveal]');
      if (children.length === 0) return;

      const staggerValue = parseFloat(sec.getAttribute('data-reveal-stagger') || '0.1');
      const startTrigger = sec.getAttribute('data-reveal-start') || 'top 85%';

      // Set initial values
      children.forEach(el => {
        const type = el.getAttribute('data-reveal') || 'up';
        gsap.set(el, revealPresets[type] || revealPresets.up);
      });

      const sectionTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: sec,
          start: startTrigger,
          once: true
        }
      });

      children.forEach((el, index) => {
        const type = el.getAttribute('data-reveal') || 'up';
        const target = { ...revealTargets[type] || revealTargets.up };
        const delay = parseFloat(el.getAttribute('data-reveal-delay') || '0');
        const duration = parseFloat(el.getAttribute('data-reveal-duration') || '0.6');
        const ease = el.getAttribute('data-reveal-ease') || 'power2.out';

        sectionTimeline.to(el, {
          ...target,
          duration: duration,
          ease: ease
        }, index * staggerValue + delay);
      });
    });

    // Standalone item reveals
    document.querySelectorAll('[data-reveal]:not([data-reveal-section] [data-reveal])').forEach(el => {
      const type = el.getAttribute('data-reveal') || 'up';
      const preset = revealPresets[type] || revealPresets.up;
      const target = revealTargets[type] || revealTargets.up;
      const duration = parseFloat(el.getAttribute('data-reveal-duration') || '0.6');
      const ease = el.getAttribute('data-reveal-ease') || 'power2.out';
      const start = el.getAttribute('data-reveal-start') || 'top 85%';

      gsap.set(el, preset);
      gsap.to(el, {
        ...target,
        duration: duration,
        ease: ease,
        scrollTrigger: {
          trigger: el,
          start: start,
          once: true
        }
      });
    });

    // 4. Enhanced Section Stacking (moved to standalone function)
    initEnhancedSectionStacking();

    // Animate scanlines intersection active state
    const scanlines = document.querySelectorAll('.section-scanline');
    scanlines.forEach(scanline => {
      ScrollTrigger.create({
        trigger: scanline.parentElement,
        start: 'top 80%',
        end: 'bottom 20%',
        onEnter: () => scanline.classList.add('is-active'),
        onLeave: () => scanline.classList.remove('is-active'),
        onEnterBack: () => scanline.classList.add('is-active'),
        onLeaveBack: () => scanline.classList.remove('is-active')
      });
    });
  }

  // Basic Intersection Observer triggers if GSAP doesn't load
  function initFallbackAnimations() {
    const revealElements = document.querySelectorAll('[data-reveal], [data-hero-reveal]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'none';
          entry.target.style.filter = 'none';
        }
      });
    }, { threshold: 0.1 });
    
    revealElements.forEach(el => {
      el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
      observer.observe(el);
    });
  }

  // ==========================================
  // 4. LIGHT / SUBTLE BINARY DATA RAIN
  // ==========================================
  function initLightDataRain() {
    const canvas = document.getElementById('rain-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;

    let width = 0, height = 0;
    const chars = '01'.split('');
    const fontSize = 13;
    const gap = 20; // Slightly denser columns
    let columns = 0;
    let drops = [];

    function setupDrops() {
      columns = Math.floor(width / gap);
      drops = [];
      for (let i = 0; i < columns; i++) {
        drops[i] = Math.random() * -60; // Faded start offsets
      }
    }

    function resize() {
      width = canvas.width = container.offsetWidth;
      height = canvas.height = container.offsetHeight;
      setupDrops();
    }

    // Set up observer for layout changes
    new ResizeObserver(() => resize()).observe(container);
    resize();

    let mouseX = -9999;
    let mouseY = -9999;
    
    container.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    });

    container.addEventListener('mouseleave', () => {
      mouseX = -9999;
      mouseY = -9999;
    });

    function draw() {
      if (width === 0 || height === 0) return;
      
      // Background clear with high opacity to keep trace streams short and light
      ctx.fillStyle = 'rgba(244, 244, 244, 0.10)';
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * gap + 6;
        const y = drops[i] * fontSize;

        const dist = Math.hypot(x - mouseX, y - mouseY);

        if (dist < 70) {
          ctx.fillStyle = 'rgba(200, 90, 60, 0.28)'; // Subtle terracotta hover highlight
        } else {
          ctx.fillStyle = 'rgba(42, 111, 87, 0.12)'; // Light forest green
        }

        ctx.fillText(text, x, y);

        // Reset drop
        if (y > height && Math.random() > 0.988) {
          drops[i] = 0;
        }

        // Very slow fall speeds (soft drift)
        drops[i] += 0.22;
      }
    }

    function tick() {
      draw();
      requestAnimationFrame(tick);
    }
    tick();
  }

  // ==========================================
  // 5. PROJECT TELEMETRY MOCK CANVASES
  // ==========================================
  function initProjectTelemetryCanvases() {
    const cardCanvases = document.querySelectorAll('.work-card__canvas-bg');
    
    cardCanvases.forEach(canvas => {
      const ctx = canvas.getContext('2d');
      const project = canvas.getAttribute('data-project');
      const container = canvas.parentElement;
      
      let w = 0, h = 0;
      const nodes = [];
      const count = 12;

      const layers = [3, 4, 4, 2];
      const neurons = [];

      function resize() {
        w = canvas.width = container.offsetWidth;
        h = canvas.height = container.offsetHeight;

        if (w === 0 || h === 0) return;

        // Re-initialize node coordinates for cascadenet graph
        if (project === 'cascadenet') {
          nodes.length = 0;
          for (let i = 0; i < count; i++) {
            nodes.push({
              x: Math.random() * w,
              y: Math.random() * h,
              r: Math.random() * 2 + 1.5,
              pulse: Math.random() * Math.PI,
              speed: 0.02 + Math.random() * 0.025
            });
          }
        }

        // Re-calculate neuron positions for churn neural net
        if (project === 'churn') {
          neurons.length = 0;
          const xSpacing = w / (layers.length + 1);
          for (let l = 0; l < layers.length; l++) {
            const x = (l + 1) * xSpacing;
            const ySpacing = h / (layers[l] + 1);
            const layerNeurons = [];
            for (let n = 0; n < layers[l]; n++) {
              layerNeurons.push({ x: x, y: (n + 1) * ySpacing });
            }
            neurons.push(layerNeurons);
          }
        }
      }

      new ResizeObserver(() => resize()).observe(container);
      resize();

      if (project === 'cascadenet') {
        function drawCascade() {
          if (w === 0 || h === 0 || nodes.length === 0) {
            requestAnimationFrame(drawCascade);
            return;
          }
          ctx.clearRect(0, 0, w, h);
          ctx.strokeStyle = 'rgba(42, 111, 87, 0.06)';
          ctx.lineWidth = 0.8;
          
          for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
              const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
              if (dist < w / 2.8) {
                ctx.beginPath();
                ctx.moveTo(nodes[i].x, nodes[i].y);
                ctx.lineTo(nodes[j].x, nodes[j].y);
                ctx.stroke();
              }
            }
          }

          nodes.forEach(node => {
            node.pulse += node.speed;
            const currentR = node.r + Math.sin(node.pulse) * 1.2;
            ctx.beginPath();
            ctx.arc(node.x, node.y, currentR, 0, Math.PI * 2);
            ctx.fillStyle = node.pulse > Math.PI ? 'rgba(200, 90, 60, 0.3)' : 'rgba(42, 111, 87, 0.3)';
            ctx.fill();
          });
          requestAnimationFrame(drawCascade);
        }
        drawCascade();

      } else if (project === 'telemetryiq') {
        const data = Array(35).fill(h / 2);
        
        function drawTelemetry() {
          if (w === 0 || h === 0) {
            setTimeout(() => requestAnimationFrame(drawTelemetry), 100);
            return;
          }
          ctx.clearRect(0, 0, w, h);
          
          const last = data[data.length - 1];
          let next = last + (Math.random() - 0.5) * 8;
          next = Math.max(15, Math.min(h - 15, next));
          data.shift();
          data.push(next);

          ctx.strokeStyle = 'rgba(25, 24, 24, 0.03)';
          ctx.lineWidth = 1;
          for (let gridY = 15; gridY < h; gridY += 15) {
            ctx.beginPath();
            ctx.moveTo(0, gridY);
            ctx.lineTo(w, gridY);
            ctx.stroke();
          }

          ctx.beginPath();
          const step = w / (data.length - 1);
          ctx.moveTo(0, data[0]);
          for (let i = 1; i < data.length; i++) {
            ctx.lineTo(i * step, data[i]);
          }
          ctx.strokeStyle = '#2a6f57';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.fillStyle = '#c85a3c';
          for (let i = 0; i < data.length; i++) {
            if (data[i] < 22 || data[i] > h - 22) {
              ctx.beginPath();
              ctx.arc(i * step, data[i], 3, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          setTimeout(() => requestAnimationFrame(drawTelemetry), 80);
        }
        drawTelemetry();

      } else if (project === 'churn') {
        let stepTime = 0;
        function drawANN() {
          if (w === 0 || h === 0 || neurons.length === 0) {
            requestAnimationFrame(drawANN);
            return;
          }
          ctx.clearRect(0, 0, w, h);
          stepTime += 0.015;

          ctx.strokeStyle = 'rgba(25, 24, 24, 0.05)';
          ctx.lineWidth = 0.5;
          
          for (let l = 0; l < neurons.length - 1; l++) {
            for (let n1 = 0; n1 < neurons[l].length; n1++) {
              for (let n2 = 0; n2 < neurons[l+1].length; n2++) {
                const nodeStart = neurons[l][n1];
                const nodeEnd = neurons[l+1][n2];
                ctx.beginPath();
                ctx.moveTo(nodeStart.x, nodeStart.y);
                ctx.lineTo(nodeEnd.x, nodeEnd.y);
                ctx.stroke();

                const ratio = (stepTime + (n1 + n2) * 0.15) % 1.0;
                const px = nodeStart.x + (nodeEnd.x - nodeStart.x) * ratio;
                const py = nodeStart.y + (nodeEnd.y - nodeStart.y) * ratio;
                ctx.fillStyle = 'rgba(42, 111, 87, 0.35)';
                ctx.beginPath();
                ctx.arc(px, py, 1.2, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          }

          ctx.fillStyle = 'rgba(25, 24, 24, 0.15)';
          for (let l = 0; l < neurons.length; l++) {
            for (let n = 0; n < neurons[l].length; n++) {
              ctx.beginPath();
              ctx.arc(neurons[l][n].x, neurons[l][n].y, 2.5, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          requestAnimationFrame(drawANN);
        }
        drawANN();
      }
    });
  }

  // ==========================================
  // 5.5 3D CARD TILT EFFECT
  // ==========================================
  function init3DCardTilt() {
    // Only apply on devices with hover capability
    if (window.matchMedia("(hover: none)").matches) return;
    
    const cards = document.querySelectorAll('.work-card');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px) scale(1.02)`;
        card.style.transition = 'transform 0.1s ease-out';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'transform 0.5s var(--ease-standard), box-shadow 0.5s var(--ease-standard)';
      });
    });
  }

  // ==========================================
  // 6. VECTOR TRON GRID CANVAS FOOTER
  // ==========================================
  function initTronGridFooter() {
    const canvas = document.getElementById('tron-canvas');
    const container = document.querySelector('.tron-grid');
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let w = 0, h = 0;
    const gridSpacing = 90;
    const stepSize = 3; // Step multiplier
    const maxLines = 10;
    const lineLifespan = 3000;
    const colors = [
      { r: 27, g: 93, b: 239 }, // Royal Blue
      { r: 226, g: 83, b: 39 }, // Coral Orange
      { r: 34, g: 197, b: 94 }, // Green
      { r: 168, g: 85, b: 247 } // Purple
    ];
    
    let activeLines = [];
    let sparks = [];
    let lineCounter = 0;
    let collisionGrid = [];
    let gridCols = 0, gridRows = 0;
    let isLoopRunning = false;

    function resize() {
      const rect = container.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      
      if (w === 0 || h === 0) return;

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      gridCols = Math.ceil(w / stepSize);
      gridRows = Math.ceil(h / stepSize);
      collisionGrid = new Int16Array(gridCols * gridRows).fill(-1);

      activeLines = [];
      sparks = [];
      
      if (!isReduced) {
        for (let i = 0; i < 4; i++) spawnLine();
        if (!isLoopRunning) {
          isLoopRunning = true;
          requestAnimationFrame(update);
        }
      } else {
        drawStaticGrid();
      }
    }

    // Helper conversions
    const colToX = (c) => c * stepSize + stepSize * 0.5;
    const rowToY = (r) => r * stepSize + stepSize * 0.5;

    function isOccupied(c, r) {
      if (c < 0 || c >= gridCols || r < 0 || r >= gridRows) return true;
      return collisionGrid[r * gridCols + c] !== -1;
    }

    function markCell(c, r, id) {
      if (c >= 0 && c < gridCols && r >= 0 && r < gridRows) {
        collisionGrid[r * gridCols + c] = id;
      }
    }

    function checkObstruction(c, r, direction, steps = 12) {
      const dirOffsets = {
        up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0]
      };
      const [dc, dr] = dirOffsets[direction];
      for (let i = 1; i <= steps; i++) {
        const nextC = c + dc * i;
        const nextR = r + dr * i;
        if (nextC < 1 || nextC >= gridCols - 1 || nextR < 1 || nextR >= gridRows - 1 || isOccupied(nextC, nextR)) {
          return true;
        }
      }
      return false;
    }

    function turnSafe(line) {
      const turns = line.direction === 'up' || line.direction === 'down' ? ['left', 'right'] : ['up', 'down'];
      if (Math.random() > 0.5) turns.reverse();
      
      for (const dir of turns) {
        if (!checkObstruction(line.col, line.row, dir, 15)) {
          return dir;
        }
      }
      return null;
    }

    function spawnLine() {
      if (activeLines.filter(l => l.alive).length >= maxLines) return;

      const id = lineCounter++;
      const edge = Math.floor(Math.random() * 4); // Starting wall
      const colorIdx = Math.floor(Math.random() * colors.length);
      
      let col = 0, row = 0, dir = 'right';
      const pad = Math.floor(10 / stepSize);

      switch (edge) {
        case 0: // Top
          col = pad + Math.floor(Math.random() * (gridCols - pad * 2));
          row = -1; dir = 'down'; break;
        case 1: // Bottom
          col = pad + Math.floor(Math.random() * (gridCols - pad * 2));
          row = gridRows; dir = 'up'; break;
        case 2: // Left
          col = -1; row = pad + Math.floor(Math.random() * (gridRows - pad * 2));
          dir = 'right'; break;
        default: // Right
          col = gridCols; row = pad + Math.floor(Math.random() * (gridRows - pad * 2));
          dir = 'left'; break;
      }

      const speedFactor = 0.85 + Math.random() * 1.2;
      const interval = (stepSize / speedFactor) * 33;

      activeLines.push({
        id: id,
        col: col,
        row: row,
        prevCol: col,
        prevRow: row,
        direction: dir,
        stepInterval: interval,
        stepAccum: 0,
        brightness: 0.5 + Math.random() * 0.4,
        colorIdx: colorIdx,
        trail: [{ x: colToX(col), y: rowToY(row) }],
        alive: true,
        deadAt: 0,
        turnTimer: 0,
        turnInterval: 80 + Math.floor(Math.random() * 140)
      });
    }

    function explodeLine(line) {
      line.alive = false;
      line.deadAt = performance.now();
      
      // Spawn Spark particles
      const ratio = Math.min(line.stepAccum / line.stepInterval, 1);
      const px = colToX(line.prevCol) + (colToX(line.col) - colToX(line.prevCol)) * ratio;
      const py = rowToY(line.prevRow) + (rowToY(line.row) - rowToY(line.prevRow)) * ratio;

      for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI * 2;
        const vel = 0.5 + Math.random() * 2.2;
        sparks.push({
          x: px, y: py,
          vx: Math.cos(angle) * vel,
          vy: Math.sin(angle) * vel,
          life: 1,
          colorIdx: line.colorIdx
        });
      }
    }

    function update(timestamp) {
      if (isReduced || w === 0 || h === 0) {
        isLoopRunning = false;
        return;
      }

      const elapsed = 30; // Mock 33fps increments
      
      // Spawner check
      if (Math.random() > 0.94) spawnLine();

      activeLines.forEach(line => {
        if (!line.alive) return;
        line.stepAccum += elapsed;
        
        // Scan ahead to make pre-emptive turns
        if (checkObstruction(line.col, line.row, line.direction, 10)) {
          const nextDir = turnSafe(line);
          if (nextDir) line.direction = nextDir;
        }

        // Random turns over time
        line.turnTimer++;
        if (line.turnTimer >= line.turnInterval) {
          line.turnTimer = 0;
          line.turnInterval = 100 + Math.floor(Math.random() * 150);
          const nextDir = turnSafe(line);
          if (nextDir) line.direction = nextDir;
        }

        if (line.stepAccum >= line.stepInterval) {
          const dirOffsets = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
          const [dc, dr] = dirOffsets[line.direction];
          const nextC = line.col + dc;
          const nextR = line.row + dr;

          // Out of bounds or collision check
          if (nextC < -12 || nextC >= gridCols + 12 || nextR < -12 || nextR >= gridRows + 12 || isOccupied(nextC, nextR)) {
            explodeLine(line);
          } else {
            markCell(line.col, line.row, line.id);
            line.prevCol = line.col;
            line.prevRow = line.row;
            line.col = nextC;
            line.row = nextR;
            line.stepAccum -= line.stepInterval;
            line.trail.push({ x: colToX(nextC), y: rowToY(nextR) });
          }
        }
      });

      // Animate sparks
      sparks.forEach(s => {
        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.95;
        s.vy *= 0.95;
        s.life -= 0.03;
      });
      sparks = sparks.filter(s => s.life > 0);

      // Clean old paths
      const now = performance.now();
      activeLines.forEach(line => {
        if (!line.alive && now - line.deadAt > lineLifespan) {
          // Clear line trace registration from collisionGrid
          for (let i = 0; i < collisionGrid.length; i++) {
            if (collisionGrid[i] === line.id) collisionGrid[i] = -1;
          }
        }
      });
      activeLines = activeLines.filter(l => l.alive || now - l.deadAt < lineLifespan);

      render(now);
      requestAnimationFrame(update);
    }

    function render(now) {
      // Draw grid texture first
      ctx.fillStyle = 'rgb(244, 244, 244)';
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(25, 24, 24, 0.07)';
      ctx.lineWidth = 0.5;

      for (let x = 0; x <= w; x += gridSpacing) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y <= h; y += gridSpacing) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      // Draw neon vectors
      activeLines.forEach(line => {
        if (line.trail.length < 2) return;
        const color = colors[line.colorIdx];
        
        let opacity = line.brightness;
        if (!line.alive) {
          const deathAge = now - line.deadAt;
          opacity *= Math.max(0, 1 - deathAge / lineLifespan);
        }
        if (opacity <= 0.01) return;

        // Current coordinates
        let currentX = 0, currentY = 0;
        if (line.alive) {
          const ratio = Math.min(line.stepAccum / line.stepInterval, 1);
          currentX = colToX(line.prevCol) + (colToX(line.col) - colToX(line.prevCol)) * ratio;
          currentY = rowToY(line.prevRow) + (rowToY(line.row) - rowToY(line.prevRow)) * ratio;
        } else {
          const lastPoint = line.trail[line.trail.length - 1];
          currentX = lastPoint.x;
          currentY = lastPoint.y;
        }

        const len = line.trail.length;
        const tailLength = 9;
        const startIdx = Math.max(1, len - tailLength);

        // Glow Layer (Thick stroke)
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(line.trail[startIdx - 1].x, line.trail[startIdx - 1].y);
        for (let i = startIdx; i < len - 1; i++) {
          ctx.lineTo(line.trail[i].x, line.trail[i].y);
        }
        ctx.lineTo(currentX, currentY);
        ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 0.15})`;
        ctx.lineWidth = 4.2;
        ctx.stroke();

        // Core Layer (Thin neon stroke)
        ctx.beginPath();
        ctx.moveTo(line.trail[startIdx - 1].x, line.trail[startIdx - 1].y);
        for (let i = startIdx; i < len - 1; i++) {
          ctx.lineTo(line.trail[i].x, line.trail[i].y);
        }
        ctx.lineTo(currentX, currentY);
        ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 0.85})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Glowing dot head
        if (line.alive) {
          ctx.beginPath();
          ctx.arc(currentX, currentY, 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
          ctx.fill();
        }
      });

      // Render Sparks particles
      sparks.forEach(s => {
        const color = colors[s.colorIdx];
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${s.life * 0.85})`;
        ctx.fillRect(s.x - 0.6, s.y - 0.6, 1.2, 1.2);
      });
    }

    function drawStaticGrid() {
      ctx.fillStyle = 'rgb(244, 244, 244)';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(25, 24, 24, 0.08)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= w; x += gridSpacing) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y <= h; y += gridSpacing) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
    }

    // Initialize Tron Grid elements
    new ResizeObserver(() => resize()).observe(container);
    resize();
  }

  // ==========================================
  // 7. CUSTOM CURSOR & LOCK-ON BRACKETS
  // ==========================================
  function initCustomCursor() {
    const cursor = document.querySelector("[data-custom-cursor]");
    const targetFrame = document.querySelector("[data-cursor-target]");
    if (!cursor || !targetFrame) return;

    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    
    if (isTouch || isReduced) {
      cursor.classList.add("is-hidden");
      targetFrame.classList.add("is-hidden");
      return;
    }

    // Hide default cursor
    document.body.style.cursor = "none";
    if (!document.querySelector("[data-cursor-style]")) {
      const style = document.createElement("style");
      style.setAttribute("data-cursor-style", "");
      style.textContent = `
        @media (pointer: fine) and (prefers-reduced-motion: no-preference) {
          a, button, [role="button"], input, textarea, select,
          .btn, .contact-social-link, .site-footer__link, .top-nav__wordmark, .top-nav__link {
            cursor: none !important;
          }
        }
      `;
      document.head.appendChild(style);
    }

    const dot = cursor.querySelector(".custom-cursor__dot");
    const ring = cursor.querySelector(".custom-cursor__ring");

    // Coordinates state
    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    let ringW = 32, ringH = 32;
    let ringRadius = 16;

    // Speeds and interpolation factors
    const lerpNormal = 0.25;
    const lerpTarget = 0.12;
    const easeOutFactor = 0.6;
    const springFactor = 0.15;

    let targetEl = null;
    let isHovering = false;
    let isTargeting = false;
    let isClicking = false;
    let textHover = false;
    let loopFrame = null;
    
    let isVisible = false;
    let initTime = null;

    // Selectors matching codedgar configuration
    const hoverableSelector = ["a", "button", '[role="button"]', 'input[type="submit"]', ".btn", ".contact-social-link", ".site-footer__link", ".top-nav__link", ".top-nav__wordmark"].join(", ");
    const textSelector = ['input[type="text"]', 'input[type="email"]', "textarea"].join(", ");

    // Position locking corners around targeted element
    function updateTargetFrame() {
      if (!targetEl) return;
      const rect = targetEl.getBoundingClientRect();
      const padding = 6;
      targetFrame.style.top = `${rect.top - padding}px`;
      targetFrame.style.left = `${rect.left - padding}px`;
      targetFrame.style.width = `${rect.width + padding * 2}px`;
      targetFrame.style.height = `${rect.height + padding * 2}px`;
    }

    // Main animation loop
    let lastDotX = 0, lastDotY = 0;
    let lastRingX = 0, lastRingY = 0;
    let lastRingW = 0, lastRingH = 0;
    let lastRingR = 0;
    const threshold = 0.2;

    function renderCursor() {
      let destX, destY, destW, destH, destRadius, lerpSpeed;

      if (isTargeting && targetEl) {
        // Snap ring around targeted element
        const rect = targetEl.getBoundingClientRect();
        destW = rect.width + 12;
        destH = rect.height + 12;
        destX = rect.left - 6;
        destY = rect.top - 6;
        destRadius = 4; // Square corners with small rounding
        
        // Use spring interpolation for locking animation
        const calcSpring = (currVal, destVal, velocity) => {
          const delta = (destVal - currVal) * springFactor;
          velocity += delta;
          velocity *= easeOutFactor;
          return [currVal + velocity, velocity];
        };

        // Static tracking velocities
        if (!renderCursor.vels) {
          renderCursor.vels = { x: 0, y: 0, w: 0, h: 0, r: 0 };
        }
        
        const v = renderCursor.vels;
        [ringX, v.x] = calcSpring(ringX, destX, v.x);
        [ringY, v.y] = calcSpring(ringY, destY, v.y);
        [ringW, v.w] = calcSpring(ringW, destW, v.w);
        [ringH, v.h] = calcSpring(ringH, destH, v.h);
        [ringRadius, v.r] = calcSpring(ringRadius, destRadius, v.r);
      } else {
        // Follow mouse coordinates normally
        destW = isClicking ? 20 : 32;
        destH = isClicking ? 20 : 32;
        destRadius = isClicking ? 10 : 16;
        destX = mouseX - destW / 2;
        destY = mouseY - destH / 2;
        lerpSpeed = lerpNormal;

        ringX += (destX - ringX) * lerpSpeed;
        ringY += (destY - ringY) * lerpSpeed;
        ringW += (destW - ringW) * lerpSpeed;
        ringH += (destH - ringH) * lerpSpeed;
        ringRadius += (destRadius - ringRadius) * lerpSpeed;
      }

      // Translate dot
      const dotX = mouseX;
      const dotY = mouseY;

      if (Math.abs(dotX - lastDotX) > threshold || Math.abs(dotY - lastDotY) > threshold) {
        dot.style.transform = `translate(${dotX}px, ${dotY}px)`;
        lastDotX = dotX;
        lastDotY = dotY;
      }

      if (
        Math.abs(ringX - lastRingX) > threshold || 
        Math.abs(ringY - lastRingY) > threshold || 
        Math.abs(ringW - lastRingW) > threshold || 
        Math.abs(ringH - lastRingH) > threshold ||
        Math.abs(ringRadius - lastRingR) > threshold
      ) {
        ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
        ring.style.width = `${ringW}px`;
        ring.style.height = `${ringH}px`;
        ring.style.borderRadius = `${ringRadius}px`;
        
        lastRingX = ringX;
        lastRingY = ringY;
        lastRingW = ringW;
        lastRingH = ringH;
        lastRingR = ringRadius;
      }

      if (isTargeting) {
        updateTargetFrame();
      }

      loopFrame = requestAnimationFrame(renderCursor);
    }

    // Listeners
    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!initTime) {
        initTime = performance.now();
        ringX = e.clientX - 16;
        ringY = e.clientY - 16;
      }

      if (!isVisible && performance.now() - initTime > 80) {
        cursor.classList.add("is-visible");
        isVisible = true;
      }

      if (!loopFrame) {
        loopFrame = requestAnimationFrame(renderCursor);
      }
    });

    document.addEventListener("mouseleave", () => {
      targetEl = null;
      isHovering = false;
      isTargeting = false;
      targetFrame.classList.remove("is-active", "is-cta");
      cursor.classList.remove("is-hovering", "is-targeting");
    });

    document.addEventListener("mouseover", (e) => {
      const target = e.target;
      const hoverable = target.closest(hoverableSelector);
      
      if (hoverable) {
        isHovering = true;
        cursor.classList.add("is-hovering");
        
        // Check if we target with active corner brackets
        const shouldLock = hoverable.matches(".btn, .top-nav__link, .top-nav__wordmark, .contact-social-link, .site-footer__link");
        if (shouldLock) {
          targetEl = hoverable;
          isTargeting = true;
          cursor.classList.add("is-targeting");
          targetFrame.classList.add("is-active");
          
          const isPrimary = hoverable.matches(".btn--primary, .contact-ctas .btn--primary");
          targetFrame.classList.toggle("is-cta", isPrimary);
        }
      }

      const textInput = target.closest(textSelector);
      if (textInput) {
        textHover = true;
        cursor.classList.add("is-text");
      }
    });

    document.addEventListener("mouseout", (e) => {
      const target = e.target;
      if (target.closest(hoverableSelector)) {
        isHovering = false;
        cursor.classList.remove("is-hovering");
        
        if (isTargeting) {
          setTimeout(() => {
            if (!isHovering) {
              targetEl = null;
              isTargeting = false;
              cursor.classList.remove("is-targeting");
              targetFrame.classList.remove("is-active", "is-cta");
            }
          }, 40);
        }
      }

      if (target.closest(textSelector)) {
        textHover = false;
        cursor.classList.remove("is-text");
      }
    });

    document.addEventListener("mousedown", () => {
      isClicking = true;
      cursor.classList.add("is-clicking");

      // Ripple effect
      const ripple = document.createElement("div");
      ripple.className = "custom-cursor__ripple";
      ripple.style.left = `${mouseX}px`;
      ripple.style.top = `${mouseY}px`;
      cursor.appendChild(ripple);

      requestAnimationFrame(() => {
        ripple.style.width = "60px";
        ripple.style.height = "60px";
        ripple.style.opacity = "0";
      });

      setTimeout(() => ripple.remove(), 400);
    });

    document.addEventListener("mouseup", () => {
      isClicking = false;
      cursor.classList.remove("is-clicking");
    });
  }

  // ==========================================
  // 8. MINESWEEPER AUTO-PLAY GRID BACKGROUND
  // ==========================================
  const minesweeperConfig = {
    initialDelay: 1500,
    betweenClicksMin: 500,
    betweenClicksMax: 1000,
    blinkDuration: 150,
    hitBlinkCount: 3,
    allMinesBlinkCount: 2,
    resetDelay: 2500,
    sweepFlipStagger: 35,
    sweepFlipDuration: 400
  };

  class MinesweeperGame {
    constructor(container, gridEl, options) {
      this.container = container;
      this.gridEl = gridEl;
      this.canvas = null;
      this.ctx = null;
      this.cellSize = options.cellSize;
      this.mineDensity = options.mineDensity / 100;
      this.speed = options.speed;
      this.aborted = false;
      this.paused = true;
      this.pauseResolve = null;
      this.timerId = null;
      this.observer = null;
      this.resizeObserver = null;
      this.rafId = 0;
      this.cols = 0;
      this.rows = 0;
      this.grid = [];
      this.dpr = 1;
      this.fontSize = 0;
      this.baselineOffset = 0;
      this.sweepActive = false;
      this.palette = new Map();
      this.initVisibilityGate();
    }

    initVisibilityGate() {
      this.observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          this.resume();
        } else {
          this.pause();
        }
      }, { threshold: 0.05 });
      this.observer.observe(this.container);
      document.addEventListener("visibilitychange", this.onVisibilityChange);
    }

    onVisibilityChange = () => {
      if (document.hidden) {
        this.pause();
      } else {
        const rect = this.container.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          this.resume();
        }
      }
    };

    pause() {
      this.paused = true;
    }

    resume() {
      if (this.paused) {
        this.paused = false;
        if (this.pauseResolve) {
          this.pauseResolve();
          this.pauseResolve = null;
        }
      }
    }

    waitForResume() {
      if (!this.paused || this.aborted) return Promise.resolve();
      return new Promise(resolve => {
        this.pauseResolve = resolve;
      });
    }

    async sleep(ms) {
      if (this.aborted) throw "aborted";
      await this.waitForResume();
      if (this.aborted) throw "aborted";
      return new Promise((resolve, reject) => {
        this.timerId = setTimeout(() => {
          if (this.aborted) reject("aborted");
          else resolve();
        }, ms / this.speed);
      });
    }

    abort() {
      this.aborted = true;
      if (this.timerId) {
        clearTimeout(this.timerId);
        this.timerId = null;
      }
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = 0;
      }
      if (this.pauseResolve) {
        this.pauseResolve();
        this.pauseResolve = null;
      }
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
        this.resizeObserver = null;
      }
      document.removeEventListener("visibilitychange", this.onVisibilityChange);
    }

    calculateDimensions() {
      const rect = this.container.getBoundingClientRect();
      this.cols = Math.floor(rect.width / this.cellSize);
      this.rows = Math.floor(rect.height / this.cellSize);
      return this.cols >= 3 && this.rows >= 3;
    }

    sampleColors() {
      this.palette = new Map();
      const size = this.cellSize;
      const cell = document.createElement("div");
      cell.className = "minesweeper-bg__cell";
      cell.style.cssText = `position:absolute;visibility:hidden;width:${size}px;height:${size}px;font-size:${this.fontSize}px;`;
      this.gridEl.appendChild(cell);

      const getColors = (state, val, classes) => {
        cell.dataset.state = state;
        if (val !== undefined) cell.dataset.value = val;
        else delete cell.dataset.value;
        cell.className = "minesweeper-bg__cell" + (classes ? ` ${classes}` : "");
        const style = getComputedStyle(cell);
        return {
          bg: style.backgroundColor,
          text: style.color,
          borderColor: style.borderColor,
          borderWidth: parseFloat(style.borderTopWidth) || 0
        };
      };

      this.palette.set("unrevealed", getColors("unrevealed"));
      this.palette.set("revealed:0", getColors("revealed"));
      for (let s = 1; s <= 8; s++) {
        this.palette.set(`revealed:${s}`, getColors("revealed", s.toString()));
      }
      this.palette.set("mine", getColors("mine"));
      this.palette.set("mine-hit", getColors("mine-hit"));
      this.palette.set("blinking", getColors("mine", undefined, "blinking"));
      cell.remove();
    }

    measure() {
      if (!this.canvas || !this.ctx) return;
      const size = this.cellSize;
      const w = this.cols * size;
      const h = this.rows * size;
      this.canvas.width = w * this.dpr;
      this.canvas.height = h * this.dpr;
      
      const left = Math.round((this.gridEl.clientWidth - w) / 2);
      const top = Math.round((this.gridEl.clientHeight - h) / 2);
      this.canvas.style.cssText = `position:absolute;top:${top}px;left:${left}px;width:${w}px;height:${h}px;pointer-events:none;`;
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this.ctx.font = `700 ${this.fontSize}px "JetBrains Mono", monospace`;
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "alphabetic";
    }

    initCanvas() {
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.fontSize = Math.round(this.cellSize * 0.4);
      const canvas = document.createElement("canvas");
      this.gridEl.after(canvas);
      this.canvas = canvas;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        canvas.remove();
        this.canvas = null;
        return false;
      }
      this.ctx = ctx;
      this.measure();
      
      const m = ctx.measureText("0");
      const asc = m.fontBoundingBoxAscent ?? m.actualBoundingBoxAscent;
      const desc = m.fontBoundingBoxDescent ?? m.actualBoundingBoxDescent;
      this.baselineOffset = (asc - desc) / 2;
      this.sampleColors();

      this.resizeObserver = new ResizeObserver(() => {
        if (this.aborted || this.sweepActive) return;
        const oldCols = this.cols;
        const oldRows = this.rows;
        if (this.calculateDimensions()) {
          if (this.cols !== oldCols || this.rows !== oldRows) {
            this.measure();
            this.generateGrid();
            this.renderGrid();
          } else {
            this.measure();
            this.renderGrid();
          }
        }
      });
      this.resizeObserver.observe(this.container);
      return true;
    }

    getCellColors(x, y) {
      const cell = this.grid[y][x];
      if (cell.isRevealed) {
        return cell.isMine ? this.palette.get("mine") : this.palette.get(`revealed:${cell.neighborMines}`);
      }
      return this.palette.get("unrevealed");
    }

    getCellText(x, y) {
      const cell = this.grid[y][x];
      if (cell.isRevealed) {
        if (cell.isMine) return "*";
        return cell.neighborMines > 0 ? cell.neighborMines.toString() : "";
      }
      return "";
    }

    drawCell(x, y, colorSet, text, scale = 1) {
      const ctx = this.ctx;
      const size = this.cellSize;
      const left = x * size;
      const top = y * size;
      const centerX = left + size / 2;
      const scaledWidth = size * scale;
      const drawLeft = centerX - scaledWidth / 2;

      ctx.fillStyle = colorSet.bg;
      ctx.fillRect(drawLeft, top, scaledWidth, size);

      if (colorSet.borderWidth > 0 && scaledWidth > 4) {
        ctx.strokeStyle = colorSet.borderColor;
        ctx.lineWidth = colorSet.borderWidth;
        ctx.strokeRect(drawLeft + 0.5, top + 0.5, scaledWidth - 1, size - 1);
      }

      if (text && scaledWidth > size * 0.3) {
        ctx.fillStyle = colorSet.text;
        ctx.save();
        ctx.translate(centerX, top + size / 2 + this.baselineOffset);
        ctx.scale(scale, 1);
        ctx.fillText(text, 0, 0);
        ctx.restore();
      }
    }

    clearCell(x, y) {
      const size = this.cellSize;
      this.ctx.clearRect(x * size, y * size, size, size);
    }

    generateGrid() {
      const totalCells = this.cols * this.rows;
      const mineCount = Math.max(1, Math.floor(totalCells * this.mineDensity));
      this.grid = [];
      for (let y = 0; y < this.rows; y++) {
        this.grid[y] = [];
        for (let x = 0; x < this.cols; x++) {
          this.grid[y][x] = { isMine: false, isRevealed: false, neighborMines: 0 };
        }
      }

      let placedMines = 0;
      while (placedMines < mineCount) {
        const rx = Math.floor(Math.random() * this.cols);
        const ry = Math.floor(Math.random() * this.rows);
        if (!this.grid[ry][rx].isMine) {
          this.grid[ry][rx].isMine = true;
          placedMines++;
        }
      }

      for (let y = 0; y < this.rows; y++) {
        for (let x = 0; x < this.cols; x++) {
          if (!this.grid[y][x].isMine) {
            this.grid[y][x].neighborMines = this.countNeighbors(x, y);
          }
        }
      }
    }

    countNeighbors(x, y) {
      let count = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < this.cols && ny >= 0 && ny < this.rows) {
            if (this.grid[ny][nx].isMine) count++;
          }
        }
      }
      return count;
    }

    floodFill(x, y) {
      const queue = [[x, y]];
      const visited = new Set();
      let ptr = 0;

      while (ptr < queue.length) {
        const [cx, cy] = queue[ptr++];
        if (cx < 0 || cx >= this.cols || cy < 0 || cy >= this.rows) continue;

        const hash = cy * this.cols + cx;
        if (visited.has(hash)) continue;
        visited.add(hash);

        const cell = this.grid[cy][cx];
        if (!cell.isRevealed && !cell.isMine) {
          cell.isRevealed = true;
          if (cell.neighborMines === 0) {
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                queue.push([cx + dx, cy + dy]);
              }
            }
          }
        }
      }
    }

    findSafeEmptyCell() {
      const candidates = [];
      for (let y = 0; y < this.rows; y++) {
        for (let x = 0; x < this.cols; x++) {
          if (!this.grid[y][x].isMine && this.grid[y][x].neighborMines === 0) {
            candidates.push({ x, y });
          }
        }
      }
      if (candidates.length > 0) {
        return candidates[Math.floor(Math.random() * candidates.length)];
      }
      for (let y = 0; y < this.rows; y++) {
        for (let x = 0; x < this.cols; x++) {
          if (!this.grid[y][x].isMine) return { x, y };
        }
      }
      return { x: 0, y: 0 };
    }

    pickRandomUnrevealed() {
      const unrevealed = [];
      for (let y = 0; y < this.rows; y++) {
        for (let x = 0; x < this.cols; x++) {
          if (!this.grid[y][x].isRevealed) unrevealed.push({ x, y });
        }
      }
      if (unrevealed.length === 0) return null;
      return unrevealed[Math.floor(Math.random() * unrevealed.length)];
    }

    renderGrid() {
      for (let y = 0; y < this.rows; y++) {
        for (let x = 0; x < this.cols; x++) {
          this.clearCell(x, y);
          this.drawCell(x, y, this.getCellColors(x, y), this.getCellText(x, y));
        }
      }
    }

    async mineHitSequence(hitX, hitY) {
      const normalMine = this.palette.get("mine");
      const hitMine = this.palette.get("mine-hit");
      const blinkingMine = this.palette.get("blinking");

      this.grid[hitY][hitX].isRevealed = true;
      this.clearCell(hitX, hitY);
      this.drawCell(hitX, hitY, hitMine, "*");

      for (let i = 0; i < minesweeperConfig.hitBlinkCount; i++) {
        this.clearCell(hitX, hitY);
        this.drawCell(hitX, hitY, blinkingMine, "*");
        await this.sleep(minesweeperConfig.blinkDuration);
        this.clearCell(hitX, hitY);
        this.drawCell(hitX, hitY, hitMine, "*");
        await this.sleep(minesweeperConfig.blinkDuration);
      }

      const mineCells = [{ x: hitX, y: hitY }];
      for (let y = 0; y < this.rows; y++) {
        for (let x = 0; x < this.cols; x++) {
          if (this.grid[y][x].isMine && !(x === hitX && y === hitY)) {
            this.grid[y][x].isRevealed = true;
            this.clearCell(x, y);
            this.drawCell(x, y, normalMine, "*");
            mineCells.push({ x, y });
          }
        }
      }
      await this.sleep(minesweeperConfig.blinkDuration * 2);

      for (let i = 0; i < minesweeperConfig.allMinesBlinkCount; i++) {
        for (const cell of mineCells) {
          this.clearCell(cell.x, cell.y);
          this.drawCell(cell.x, cell.y, blinkingMine, "*");
        }
        await this.sleep(minesweeperConfig.blinkDuration);
        for (const cell of mineCells) {
          this.clearCell(cell.x, cell.y);
          const isHit = cell.x === hitX && cell.y === hitY;
          this.drawCell(cell.x, cell.y, isHit ? hitMine : normalMine, "*");
        }
        await this.sleep(minesweeperConfig.blinkDuration);
      }
    }

    async diagonalSweepReset() {
      const colsCount = this.cols;
      const rowsCount = this.rows;
      const totalDiagonals = colsCount - 1 + (rowsCount - 1);
      const unrevealedColor = this.palette.get("unrevealed");
      
      const diagonals = Array.from({ length: totalDiagonals + 1 }, () => []);
      const initialGridState = [];

      for (let r = 0; r < rowsCount; r++) {
        initialGridState[r] = [];
        for (let c = 0; c < colsCount; c++) {
          const isRevealed = this.grid[r][c].isRevealed;
          initialGridState[r][c] = {
            colors: this.getCellColors(c, r),
            text: this.getCellText(c, r)
          };
          if (isRevealed) {
            diagonals[colsCount - 1 - c + r].push({ x: c, y: r });
          }
        }
      }

      this.sweepActive = true;
      
      const drawFlipped = (c, r, scale, reset) => {
        const initial = initialGridState[r][c];
        const colors = reset ? unrevealedColor : initial.colors;
        const text = reset ? "" : initial.text;
        this.drawCell(c, r, colors, text, scale);
      };

      const flipDuration = minesweeperConfig.sweepFlipDuration / 2 / this.speed;
      const stagger = minesweeperConfig.sweepFlipStagger / this.speed;
      const isDiagonalReset = new Array(totalDiagonals + 1).fill(false);

      return new Promise(resolve => {
        let startTime = null;
        let pauseStart = null;
        let accumPause = 0;

        const step = (timestamp) => {
          if (this.aborted) {
            this.sweepActive = false;
            resolve();
            return;
          }

          if (this.paused) {
            if (pauseStart === null) pauseStart = timestamp;
            this.rafId = requestAnimationFrame(step);
            return;
          }

          if (pauseStart !== null) {
            accumPause += timestamp - pauseStart;
            pauseStart = null;
          }

          if (startTime === null) startTime = timestamp;
          const elapsed = timestamp - startTime - accumPause;
          
          let allFlipped = true;

          for (let d = 0; d <= totalDiagonals; d++) {
            if (diagonals[d].length === 0) continue;
            
            const delay = d * stagger;
            const progress = elapsed - delay;
            const fullDuration = flipDuration * 2;

            if (progress < 0) {
              allFlipped = false;
              continue;
            }

            if (progress >= fullDuration) {
              if (!isDiagonalReset[d]) {
                isDiagonalReset[d] = true;
                for (const cell of diagonals[d]) {
                  this.clearCell(cell.x, cell.y);
                  drawFlipped(cell.x, cell.y, 1, true);
                }
              }
              continue;
            }

            allFlipped = false;
            for (const cell of diagonals[d]) {
              this.clearCell(cell.x, cell.y);
            }

            if (progress < flipDuration) {
              const scale = 1 - (progress / flipDuration);
              for (const cell of diagonals[d]) {
                drawFlipped(cell.x, cell.y, scale, false);
              }
            } else {
              const scale = (progress - flipDuration) / flipDuration;
              for (const cell of diagonals[d]) {
                drawFlipped(cell.x, cell.y, scale, true);
              }
            }
          }

          if (allFlipped) {
            this.rafId = 0;
            this.sweepActive = false;
            resolve();
          } else {
            this.rafId = requestAnimationFrame(step);
          }
        };

        this.rafId = requestAnimationFrame(step);
      });
    }

    async start() {
      if (this.calculateDimensions() && this.initCanvas()) {
        try {
          while (!this.aborted) {
            this.generateGrid();
            this.renderGrid();
            await this.sleep(minesweeperConfig.initialDelay);

            const startCell = this.findSafeEmptyCell();
            this.floodFill(startCell.x, startCell.y);
            this.renderGrid();

            let hitMine = false;
            while (!hitMine && !this.aborted) {
              const delay = minesweeperConfig.betweenClicksMin + Math.random() * (minesweeperConfig.betweenClicksMax - minesweeperConfig.betweenClicksMin);
              await this.sleep(delay);

              const cell = this.pickRandomUnrevealed();
              if (!cell) break;

              const gridCell = this.grid[cell.y][cell.x];
              if (gridCell.isMine) {
                await this.mineHitSequence(cell.x, cell.y);
                hitMine = true;
              } else {
                if (gridCell.neighborMines === 0) {
                  this.floodFill(cell.x, cell.y);
                } else {
                  gridCell.isRevealed = true;
                }
                this.renderGrid();
              }
            }

            await this.sleep(minesweeperConfig.resetDelay);
            await this.diagonalSweepReset();
          }
        } catch (e) {
          if (e !== "aborted") console.error("Minesweeper error:", e);
        }
      }
    }
  }

  function initMinesweeper() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    
    document.querySelectorAll(".minesweeper-bg").forEach(container => {
      const gridEl = container.querySelector(".minesweeper-bg__grid");
      if (!gridEl) return;

      const game = new MinesweeperGame(container, gridEl, {
        cellSize: parseInt(container.dataset.mswCellSize || "48", 10),
        mineDensity: parseInt(container.dataset.mswMineDensity || "15", 10),
        speed: parseFloat(container.dataset.mswSpeed || "1")
      });

      game.start();
    });
  }

  // ==========================================
  // 9. GSAP MAGNETIC BUTTON EFFECT
  // ==========================================
  function initMagneticButtons() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || "ontouchstart" in window) return;

    const targets = document.querySelectorAll(".btn, .top-nav__link, .top-nav__wordmark, .contact-social-link, .site-footer__link");
    
    targets.forEach(el => {
      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;

        gsap.to(el, {
          x: deltaX * 0.35,
          y: deltaY * 0.35,
          duration: 0.3,
          ease: "power2.out"
        });
      });

      el.addEventListener("mouseleave", () => {
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: "power3.out"
        });
      });
    });
  }

  // ==========================================
  // 10. LENIS SMOOTH SCROLL
  // ==========================================
  function initLenis() {
    if (typeof Lenis === 'undefined') {
      console.warn('Lenis not loaded, skipping smooth scroll.');
      return null;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;

    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
      wheelMultiplier: 0.8,
      touchMultiplier: 1.5,
      infinite: false
    });

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // Handle anchor link clicks for smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (targetId === '#') return;
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          lenis.scrollTo(target, { offset: -80, duration: 1.2 });
        }
      });
    });

    return lenis;
  }

  // ==========================================
  // 11. PAGE LOADER ANIMATION
  // ==========================================
  function initPageLoader() {
    const loader = document.getElementById('page-loader');
    if (!loader) return;

    let dismissed = false;
    function dismissLoader() {
      if (dismissed) return;
      dismissed = true;
      loader.classList.add('is-loaded');
      loader.style.display = 'none';
      document.body.style.overflow = '';
    }

    // Hard safety net: no matter what happens with GSAP/CDN scripts,
    // never leave visitors stuck on a black "initializing" screen.
    const safetyTimer = setTimeout(dismissLoader, 3500);

    try {
      const logo = loader.querySelector('.page-loader__logo');
      const barFill = loader.querySelector('.page-loader__bar-fill');
      const barTrack = loader.querySelector('.page-loader__bar-track');
      const text = loader.querySelector('.page-loader__text');

      if (typeof gsap === 'undefined') {
        throw new Error('GSAP not available for page loader');
      }

      // Prevent scroll during loading
      document.body.style.overflow = 'hidden';

      const tl = gsap.timeline({
        onComplete: () => {
          clearTimeout(safetyTimer);
          dismissLoader();
        }
      });

      tl.to(logo, { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }, 0.2)
        .to(barTrack, { opacity: 1, duration: 0.3, ease: 'power2.out' }, 0.4)
        .to(text, { opacity: 1, duration: 0.3, ease: 'power2.out' }, 0.4)
        .to(barFill, { width: '100%', duration: 0.8, ease: 'power2.inOut' }, 0.5)
        .to([logo, barTrack, text], { opacity: 0, y: -20, duration: 0.3, ease: 'power2.in', stagger: 0.05 }, '+=0.2')
        .to(loader, {
          clipPath: 'inset(0 0 100% 0)',
          duration: 0.7,
          ease: 'power3.inOut'
        }, '-=0.1')
        .set(loader, { display: 'none' });
    } catch (err) {
      // GSAP missing/failed to load (blocked CDN, offline, slow network) —
      // don't trap visitors behind the loader, just skip the animation.
      clearTimeout(safetyTimer);
      dismissLoader();
    }
  }

  // ==========================================
  // 12. SPLIT TEXT REVEALS FOR SECTION TITLES
  // ==========================================
  function initSplitTextReveals() {
    const titles = document.querySelectorAll('.section-title, .section-subtitle');

    titles.forEach(title => {
      // Skip if inside a [data-reveal] parent that's already handled
      if (title.closest('[data-reveal]')) return;

      const text = title.textContent;
      const words = text.split(/\s+/);

      title.innerHTML = words.map(word =>
        `<span class="split-word"><span class="split-word__inner">${word}</span></span>`
      ).join(' ');

      const innerSpans = title.querySelectorAll('.split-word__inner');

      gsap.set(innerSpans, { y: '110%', opacity: 0 });

      gsap.to(innerSpans, {
        y: '0%',
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out',
        stagger: 0.04,
        scrollTrigger: {
          trigger: title,
          start: 'top 85%',
          once: true
        }
      });
    });
  }

  // ==========================================
  // 13. NAV ACTIVE STATE TRACKING ON SCROLL
  // ==========================================
  function initNavActiveTracking() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.top-nav__link');

    if (sections.length === 0 || navLinks.length === 0) return;

    sections.forEach(section => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top 40%',
        end: 'bottom 40%',
        onEnter: () => setActiveNav(section.id),
        onEnterBack: () => setActiveNav(section.id)
      });
    });

    function setActiveNav(id) {
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === `#${id}`) {
          link.classList.add('is-active');
        } else {
          link.classList.remove('is-active');
        }
      });
    }
  }

  // ==========================================
  // 14. SKILL BAR ANIMATION (BUG FIX)
  // ==========================================
  function initSkillBarAnimation() {
    const skillRings = document.querySelectorAll('.skill-ring');
    if (skillRings.length === 0) return;

    const skillsSection = document.getElementById('skills');
    if (!skillsSection) return;

    ScrollTrigger.create({
      trigger: skillsSection,
      start: 'top 75%',
      once: true,
      onEnter: () => {
        skillRings.forEach((ring, index) => {
          const levelStr = ring.getAttribute('data-level') || '0%';
          const level = parseFloat(levelStr);
          const circle = ring.querySelector('.circle');
          if (circle) {
            setTimeout(() => {
              circle.style.strokeDasharray = `${level}, 100`;
            }, index * 100);
          }
        });
      }
    });
  }

  // ==========================================
  // 15. WIRE UP ORPHANED PARALLAX ATTRIBUTES
  // ==========================================
  function initParallaxElements() {
    // Section numbers parallax
    document.querySelectorAll('[data-parallax="section-number"]').forEach(el => {
      gsap.to(el, {
        yPercent: -40,
        ease: 'none',
        scrollTrigger: {
          trigger: el.closest('.page-section, .hero'),
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5
        }
      });
    });

    // Dot grid parallax
    document.querySelectorAll('[data-parallax="dot-grid"]').forEach(el => {
      gsap.to(el, {
        yPercent: -15,
        ease: 'none',
        scrollTrigger: {
          trigger: el.closest('.page-section'),
          start: 'top bottom',
          end: 'bottom top',
          scrub: 2
        }
      });
    });
  }

  // ==========================================
  // 16. SECTION CLIP-PATH ENTRANCE REVEALS
  // ==========================================
  function initSectionClipReveals() {
    const sections = document.querySelectorAll('.page-section');

    sections.forEach((section, index) => {
      if (index === 0) return; // Skip first section

      gsap.set(section, { clipPath: 'inset(8% 0 0 0)' });

      gsap.to(section, {
        clipPath: 'inset(0% 0 0 0)',
        ease: 'power2.out',
        duration: 0.8,
        scrollTrigger: {
          trigger: section,
          start: 'top 90%',
          end: 'top 50%',
          scrub: 1
        }
      });
    });
  }

  // ==========================================
  // 17. CANVAS VISIBILITY PAUSE FIX
  // ==========================================
  function initCanvasVisibilityPause() {
    // The data rain and project canvases don't pause when tab is hidden
    // We store animation frame IDs so we can cancel them
    let dataRainPaused = false;

    document.addEventListener('visibilitychange', () => {
      dataRainPaused = document.hidden;
    });

    // Patch into existing data rain draw loop by overriding
    // We add a global flag check
    window.__canvasPaused = false;
    document.addEventListener('visibilitychange', () => {
      window.__canvasPaused = document.hidden;
    });
  }

  // ==========================================
  // 18. SCROLL PROGRESS BAR
  // ==========================================
  function initScrollProgress() {
    const bar = document.querySelector('.scroll-progress');
    if (!bar) return;

    gsap.to(bar, {
      width: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3
      }
    });
  }

  // ==========================================
  // 19. ENHANCED SECTION STACKING (IMPROVED)
  // ==========================================
  function initEnhancedSectionStacking() {
    const pageSections = document.querySelectorAll('.page-section');
    const totalSections = pageSections.length;

    pageSections.forEach((section, index) => {
      const container = section.querySelector('.page-section__container');
      if (!container || index >= totalSections - 1) return;

      gsap.to(container, {
        yPercent: -18,
        opacity: 0.3,
        scale: 0.96,
        filter: 'blur(2px)',
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'bottom 75%',
          end: 'bottom 5%',
          scrub: 1.5
        }
      });
    });
  }

  // ==========================================
  // BOOTSTRAP INITIALIZERS
  // ==========================================
  try {
    // 1. Page Loader (must be first)
    initPageLoader();

    // 2. Lenis Smooth Scroll
    const lenis = initLenis();

    // 3. GSAP Animations
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      // Remove native smooth scroll if Lenis is active
      if (lenis) {
        document.documentElement.style.scrollBehavior = 'auto';
      }

      initGSAPAnimations();
      initSectionClipReveals();
      initSplitTextReveals();
      initNavActiveTracking();
      initSkillBarAnimation();
      initParallaxElements();
      initScrollProgress();
    } else {
      console.warn('GSAP and ScrollTrigger CDN not loaded. Falling back to basic scroll reveal.');
      initFallbackAnimations();
    }

    // 4. Interactive elements
    initMobileNav();
    initLightDataRain();
    initProjectTelemetryCanvases();
    init3DCardTilt();
    initTronGridFooter();

    // 5. Premium effects
    initCustomCursor();
    initMinesweeper();
    initMagneticButtons();
    initCanvasVisibilityPause();
  } catch (err) {
    showDebugBanner(err);
    // If something in the bootstrap sequence threw synchronously, don't
    // leave the page loader covering the site or scroll locked.
    const loader = document.getElementById('page-loader');
    if (loader && !loader.classList.contains('is-loaded')) {
      loader.classList.add('is-loaded');
      loader.style.display = 'none';
    }
    document.body.style.overflow = '';
  }

});


