const story = document.getElementById('scroll-story');
const scenes = Array.from(document.querySelectorAll('.scene')).sort(
  (a, b) => Number(a.dataset.scene) - Number(b.dataset.scene)
);
const hint = document.querySelector('.scroll-indicator');
const goblin = document.querySelector('.goblin');
const knight = document.querySelector('.knight');
const demoSection = document.getElementById('demo-scroll-section');
const demoCopy = document.getElementById('demo-copy');
const computerStage = document.getElementById('computer-stage');
const computerMask = document.getElementById('computer-video-mask');
const demoVideo = document.getElementById('demo-video');
const knightOutroSection = document.getElementById('knight-outro-section');
const outroKnight = document.getElementById('outro-knight');
const outroPlayBtn = document.getElementById('outro-play-btn');

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function sceneProgress(globalProgress, sceneNumber, total) {
  const firstScene = Number(scenes[0]?.dataset.scene ?? 0);
  const index = sceneNumber - firstScene;
  const segment = 1 / total;
  const start = index * segment;
  return clamp((globalProgress - start) / segment, 0, 1);
}

function sceneOpacity(progress, sceneNumber) {
  if (sceneNumber === 0) {
    if (progress <= 0.35) return 1;
    return clamp(1 - (progress - 0.35) / 0.30, 0, 1);
  }

  if (progress <= 0 || progress >= 1) return 0;
  if (progress < 0.16) return progress / 0.16;
  if (progress > 0.82) return (1 - progress) / 0.18;
  return 1;
}

function updateStory() {
  if (!story || scenes.length === 0) return;

  const rect = story.getBoundingClientRect();
  const scrollDistance = -rect.top;
  const maxScroll = story.offsetHeight - window.innerHeight;
  const globalProgress = clamp(scrollDistance / maxScroll, 0, 1);

  let topInteractiveScene = null;
  let topInteractiveOpacity = 0;

  scenes.forEach((scene) => {
    const sceneNumber = Number(scene.dataset.scene);
    const local = sceneProgress(globalProgress, sceneNumber, scenes.length);
    const opacity = sceneOpacity(local, sceneNumber);
    const bg = scene.querySelector('.scene-bg');
    const content = scene.querySelector('.scene-content');

    scene.style.opacity = opacity;

    if (opacity > topInteractiveOpacity) {
      topInteractiveOpacity = opacity;
      topInteractiveScene = scene;
    }

    if (bg) {
      const zoom = 1 + local * 0.14;
      const moveY = local * 45;
      bg.style.transform = `scale(${zoom}) translateY(${moveY}px)`;
      bg.style.filter = `brightness(${1 - local * 0.08})`;
    }

    if (content) {
      const contentY = (1 - local) * 38 - local * 14;
      content.style.transform = `translate(-50%, calc(-50% + ${contentY}px))`;
      content.style.opacity = String(clamp(opacity * 1.05, 0, 1));
    }

    scene.classList.remove('active-scene');
  });

  if (topInteractiveScene && topInteractiveOpacity > 0.05) {
    topInteractiveScene.classList.add('active-scene');
  }

  const arenaProgress = sceneProgress(globalProgress, 2, scenes.length);
  const mechanicsProgress = sceneProgress(globalProgress, 3, scenes.length);
  const showArenaChars = arenaProgress > 0.18 && arenaProgress < 0.88 && mechanicsProgress < 0.12;

  if (showArenaChars) {
    goblin?.classList.add('show-goblin');
    knight?.classList.add('show-knight');
  } else {
    goblin?.classList.remove('show-goblin');
    knight?.classList.remove('show-knight');
  }

  if (hint) {
    hint.style.opacity = String(clamp(1 - globalProgress * 4, 0, 1));
  }
}

function updateDemoSection() {
  if (!demoSection || !computerStage || !computerMask || !demoVideo || !demoCopy) return;

  const rect = demoSection.getBoundingClientRect();
  const scrollDistance = -rect.top;
  const maxScroll = demoSection.offsetHeight - window.innerHeight;
  const progress = clamp(scrollDistance / maxScroll, 0, 1);

  let stageScale = 1;
  let stageY = 0;

  if (progress < 0.20) {
    stageScale = 1;
    stageY = 0;
  } else if (progress < 0.30) {
    const p = (progress - 0.20) / 0.10;
    stageScale = 1 + p * 0.18;
    stageY = p * 6;
  } else if (progress < 0.58) {
    const p = (progress - 0.30) / 0.28;
    stageScale = 1.18 + p * 1.72;
    stageY = 6 + p * 20;
  } else if (progress < 0.72) {
    stageScale = 2.9;
    stageY = 26;
  } else {
    const p = (progress - 0.72) / 0.28;
    stageScale = 2.9 - p * 1.9;
    stageY = 26 - p * 26;
  }

  computerStage.style.transform = `translateY(${stageY}px) scale(${stageScale})`;
  computerMask.style.transform = 'scale(1)';

  let copyOpacity = 1;
  let copyLift = 0;
  if (progress < 0.26) {
    copyOpacity = 1;
    copyLift = 0;
  } else if (progress < 0.36) {
    const p = (progress - 0.26) / 0.10;
    copyOpacity = 1 - p;
    copyLift = p * 22;
  } else if (progress < 0.72) {
    copyOpacity = 0;
    copyLift = 22;
  } else {
    const p = (progress - 0.72) / 0.28;
    copyOpacity = p;
    copyLift = 22 - p * 22;
  }

  demoCopy.style.opacity = String(clamp(copyOpacity, 0, 1));
  demoCopy.style.transform = `translateY(-${copyLift}px)`;

  if (progress <= 0.01) {
    demoVideo.pause();
    demoVideo.currentTime = 0;
  }
}

function updateKnightOutro() {
  if (!knightOutroSection || !outroKnight || !outroPlayBtn) return;

  const rect = knightOutroSection.getBoundingClientRect();
  const maxScroll = knightOutroSection.offsetHeight - window.innerHeight;
  const progress = clamp((-rect.top) / maxScroll, 0, 1);

  let reveal = 0;
  if (progress < 0.18) {
    reveal = 0;
  } else if (progress < 0.70) {
    const p = (progress - 0.18) / 0.52;
    reveal = p * p * (3 - 2 * p);
  } else {
    reveal = 1;
  }

  const centerLift = (1 - reveal) * 26;
  const scale = 0.98 + reveal * 0.02;

  outroKnight.style.opacity = String(reveal);
  outroKnight.style.transform = `translate(-50%, calc(-50% + ${centerLift}px)) scale(${scale})`;

  outroPlayBtn.style.opacity = progress > 0.02 ? '1' : '0';
}

function enableWobbleCharacters() {
  const chars = document.querySelectorAll('.wobble-character');
  if (!chars.length) return;

  chars.forEach((el) => {
    let dragging = false;
    let pointerId = null;
    let startX = 0;
    let hoverResetTimer = null;

    const applyAngle = (angle, instant = false) => {
      el.style.transition = instant
        ? 'transform 0.02s linear'
        : 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)';
      el.style.transform = `rotate(${angle}deg)`;
    };

    const onPointerMove = (e) => {
      if (!dragging || (pointerId !== null && e.pointerId !== pointerId)) return;
      const deltaX = e.clientX - startX;
      const angle = clamp(deltaX / 3.2, -28, 28);
      applyAngle(angle, true);
    };

    const release = (e) => {
      if (!dragging || (e && pointerId !== null && e.pointerId !== pointerId)) return;
      dragging = false;
      pointerId = null;
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', release);
      applyAngle(0, false);
    };

    el.addEventListener('pointerdown', (e) => {
      dragging = true;
      pointerId = e.pointerId;
      startX = e.clientX;
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', release);
      window.addEventListener('pointercancel', release);
      e.preventDefault();
    });

    el.addEventListener('pointerenter', (e) => {
      if (dragging) return;
      clearTimeout(hoverResetTimer);
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const direction = e.clientX < centerX ? -1 : 1;
      applyAngle(direction * 10, true);
      hoverResetTimer = setTimeout(() => applyAngle(0, false), 140);
    });

    el.addEventListener('pointermove', (e) => {
      if (dragging) return;
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const deltaX = e.clientX - centerX;
      const angle = clamp(deltaX / 18, -8, 8);
      applyAngle(angle, true);
      clearTimeout(hoverResetTimer);
      hoverResetTimer = setTimeout(() => applyAngle(0, false), 120);
    });

    el.addEventListener('pointerleave', () => {
      if (dragging) return;
      clearTimeout(hoverResetTimer);
      applyAngle(0, false);
    });
  });
}

function onScroll() {
  updateStory();
  updateDemoSection();
  updateKnightOutro();
}

onScroll();
enableWobbleCharacters();
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
