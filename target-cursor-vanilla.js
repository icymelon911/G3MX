// target-cursor-vanilla.js
// Vanilla JS version of TargetCursor component
// Requires GSAP to be included in the page: <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
// Also include the CSS: <link rel="stylesheet" href="TargetCursor.css">

(function() {
  'use strict';

  // Configuration
  const config = {
    targetSelector: '.cursor-target, button, .planet, .side-item, a, .island, .cyber-home-btn',
    spinDuration: 2,
    hideDefaultCursor: true,
    hoverDuration: 0.2,
    parallaxOn: true
  };

  // Constants
  const constants = {
    borderWidth: 3,
    cornerSize: 12
  };

  // Check if mobile
  const isMobile = (() => {
    if (typeof window === 'undefined') return false;
    const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 768;
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    const isMobileUserAgent = mobileRegex.test(userAgent.toLowerCase());
    return (hasTouchScreen && isSmallScreen) || isMobileUserAgent;
  })();

  if (isMobile) return;

  // Elements
  let cursorWrapper = null;
  let dot = null;
  let corners = [];
  let spinTl = null;
  let tickerFn = null;

  // State
  let isActive = false;
  let targetCornerPositions = null;
  let activeStrength = 0;
  let activeTarget = null;
  let currentLeaveHandler = null;
  let resumeTimeout = null;

  // Functions
  const moveCursor = (x, y) => {
    if (!cursorWrapper) return;
    gsap.to(cursorWrapper, {
      x,
      y,
      duration: 0.1,
      ease: 'power3.out'
    });
  };

  const createElements = () => {
    cursorWrapper = document.createElement('div');
    cursorWrapper.className = 'target-cursor-wrapper';

    dot = document.createElement('div');
    dot.className = 'target-cursor-dot';
    cursorWrapper.appendChild(dot);

    const cornerClasses = ['corner-tl', 'corner-tr', 'corner-br', 'corner-bl'];
    cornerClasses.forEach(cls => {
      const corner = document.createElement('div');
      corner.className = `target-cursor-corner ${cls}`;
      cursorWrapper.appendChild(corner);
      corners.push(corner);
    });

    document.body.appendChild(cursorWrapper);
  };

  const createSpinTimeline = () => {
    if (spinTl) {
      spinTl.kill();
    }
    spinTl = gsap
      .timeline({ repeat: -1 })
      .to(cursorWrapper, { rotation: '+=360', duration: config.spinDuration, ease: 'none' });
  };

  const tickerFunction = () => {
    if (!targetCornerPositions || !cursorWrapper || !corners.length) {
      return;
    }

    const strength = activeStrength;
    if (strength === 0) return;

    const cursorX = gsap.getProperty(cursorWrapper, 'x');
    const cursorY = gsap.getProperty(cursorWrapper, 'y');

    corners.forEach((corner, i) => {
      const currentX = gsap.getProperty(corner, 'x');
      const currentY = gsap.getProperty(corner, 'y');

      const targetX = targetCornerPositions[i].x - cursorX;
      const targetY = targetCornerPositions[i].y - cursorY;

      const finalX = currentX + (targetX - currentX) * strength;
      const finalY = currentY + (targetY - currentY) * strength;

      const duration = strength >= 0.99 ? (config.parallaxOn ? 0.2 : 0) : 0.05;

      gsap.to(corner, {
        x: finalX,
        y: finalY,
        duration: duration,
        ease: duration === 0 ? 'none' : 'power1.out',
        overwrite: 'auto'
      });
    });
  };

  const cleanupTarget = (target) => {
    if (currentLeaveHandler) {
      target.removeEventListener('mouseleave', currentLeaveHandler);
    }
    currentLeaveHandler = null;
  };

  const enterHandler = (e) => {
    const directTarget = e.target;
    const allTargets = [];
    let current = directTarget;
    while (current && current !== document.body) {
      if (current.matches(config.targetSelector)) {
        allTargets.push(current);
      }
      current = current.parentElement;
    }
    const target = allTargets[0] || null;
    if (!target || !cursorWrapper || !corners.length) return;
    if (activeTarget === target) return;
    if (activeTarget) {
      cleanupTarget(activeTarget);
    }
    if (resumeTimeout) {
      clearTimeout(resumeTimeout);
      resumeTimeout = null;
    }

    activeTarget = target;
    corners.forEach(corner => gsap.killTweensOf(corner));

    gsap.killTweensOf(cursorWrapper, 'rotation');
    spinTl?.pause();
    gsap.set(cursorWrapper, { rotation: 0 });

    const rect = target.getBoundingClientRect();
    const { borderWidth, cornerSize } = constants;
    const cursorX = gsap.getProperty(cursorWrapper, 'x');
    const cursorY = gsap.getProperty(cursorWrapper, 'y');

    targetCornerPositions = [
      { x: rect.left - borderWidth, y: rect.top - borderWidth },
      { x: rect.right + borderWidth - cornerSize, y: rect.top - borderWidth },
      { x: rect.right + borderWidth - cornerSize, y: rect.bottom + borderWidth - cornerSize },
      { x: rect.left - borderWidth, y: rect.bottom + borderWidth - cornerSize }
    ];

    isActive = true;
    gsap.ticker.add(tickerFunction);

    gsap.to(window, {
      activeStrength: 1,
      duration: config.hoverDuration,
      ease: 'power2.out',
      onUpdate: () => {
        activeStrength = window.activeStrength;
      }
    });

    corners.forEach((corner, i) => {
      gsap.to(corner, {
        x: targetCornerPositions[i].x - cursorX,
        y: targetCornerPositions[i].y - cursorY,
        duration: 0.2,
        ease: 'power2.out'
      });
    });

    const leaveHandler = () => {
      gsap.ticker.remove(tickerFunction);

      isActive = false;
      targetCornerPositions = null;
      activeStrength = 0;
      activeTarget = null;

      if (corners.length) {
        gsap.killTweensOf(corners);
        const { cornerSize } = constants;
        const positions = [
          { x: -cornerSize * 1.5, y: -cornerSize * 1.5 },
          { x: cornerSize * 0.5, y: -cornerSize * 1.5 },
          { x: cornerSize * 0.5, y: cornerSize * 0.5 },
          { x: -cornerSize * 1.5, y: cornerSize * 0.5 }
        ];
        const tl = gsap.timeline();
        corners.forEach((corner, index) => {
          tl.to(
            corner,
            {
              x: positions[index].x,
              y: positions[index].y,
              duration: 0.3,
              ease: 'power3.out'
            },
            0
          );
        });
      }

      resumeTimeout = setTimeout(() => {
        if (!activeTarget && cursorWrapper && spinTl) {
          const currentRotation = gsap.getProperty(cursorWrapper, 'rotation');
          const normalizedRotation = currentRotation % 360;
          spinTl.kill();
          spinTl = gsap
            .timeline({ repeat: -1 })
            .to(cursorWrapper, { rotation: '+=360', duration: config.spinDuration, ease: 'none' });
          gsap.to(cursorWrapper, {
            rotation: normalizedRotation + 360,
            duration: config.spinDuration * (1 - normalizedRotation / 360),
            ease: 'none',
            onComplete: () => {
              spinTl?.restart();
            }
          });
        }
        resumeTimeout = null;
      }, 50);

      cleanupTarget(target);
    };

    currentLeaveHandler = leaveHandler;
    target.addEventListener('mouseleave', leaveHandler);
  };

  const scrollHandler = () => {
    if (!activeTarget || !cursorWrapper) return;
    const mouseX = gsap.getProperty(cursorWrapper, 'x');
    const mouseY = gsap.getProperty(cursorWrapper, 'y');
    const elementUnderMouse = document.elementFromPoint(mouseX, mouseY);
    const isStillOverTarget =
      elementUnderMouse &&
      (elementUnderMouse === activeTarget || elementUnderMouse.closest(config.targetSelector) === activeTarget);
    if (!isStillOverTarget) {
      if (currentLeaveHandler) {
        currentLeaveHandler();
      }
    }
  };

  const mouseDownHandler = () => {
    if (!dot) return;
    gsap.to(dot, { scale: 0.7, duration: 0.3 });
    gsap.to(cursorWrapper, { scale: 0.9, duration: 0.2 });
  };

  const mouseUpHandler = () => {
    if (!dot) return;
    gsap.to(dot, { scale: 1, duration: 0.3 });
    gsap.to(cursorWrapper, { scale: 1, duration: 0.2 });
  };

  // Initialize
  const init = () => {
    createElements();

    const originalCursor = document.body.style.cursor;
    if (config.hideDefaultCursor) {
      document.body.style.cursor = 'none';
    }

    gsap.set(cursorWrapper, {
      xPercent: -50,
      yPercent: -50,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    });

    createSpinTimeline();

    tickerFn = tickerFunction;

    window.addEventListener('mousemove', (e) => moveCursor(e.clientX, e.clientY));
    window.addEventListener('mouseover', enterHandler, { passive: true });
    window.addEventListener('scroll', scrollHandler, { passive: true });
    window.addEventListener('mousedown', mouseDownHandler);
    window.addEventListener('mouseup', mouseUpHandler);

    // Cleanup on unload
    window.addEventListener('beforeunload', () => {
      if (tickerFn) {
        gsap.ticker.remove(tickerFn);
      }
      spinTl?.kill();
      document.body.style.cursor = originalCursor;
    });
  };

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();