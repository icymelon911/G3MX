// ═══════════════════════════════════════════════════════════════════════
// ⚔️  GUILD MASTER DASHBOARD — Analytics Chart Engine
// ═══════════════════════════════════════════════════════════════════════
//
//  Theme:  Core Keeper — Retro 16-bit RPG Menus
//  Font:   "Pixelify Sans" (pixel-art Google Font)
//  Lib:    Chart.js v4 via CDN
//
//  CHARTS:
//    1. Scholar Enlistment  — Line Chart  (new users / 7 days)
//    2. Quest Board         — Bar Chart   (chapter completions)
//    3. Merchant Vault      — Doughnut    (top cosmetics bought)
//
//  Each render function uses a MOCK DATA object you will replace
//  with live Firebase Firestore queries. The exact replacement
//  points are marked with boxed comments.
//
// ═══════════════════════════════════════════════════════════════════════


// ──────────────────────────────────────────────────────────────────────
// 🎨  ORE PALETTE — Glowing cave colors used across all charts
// ──────────────────────────────────────────────────────────────────────

const ORE = {
  teal:         '#00d4aa',
  tealGlow:     'rgba(0, 212, 170, 0.18)',
  purple:       '#9b59ff',
  purpleGlow:   'rgba(155, 89, 255, 0.18)',
  amber:        '#ffb347',
  amberGlow:    'rgba(255, 179, 71, 0.18)',
  red:          '#ff4a4a',
  redGlow:      'rgba(255, 74, 74, 0.18)',
  gold:         '#dfa632',
  goldGlow:     'rgba(223, 166, 50, 0.18)',
  copper:       '#c2653e',
  dimStone:     '#8b9bb4',
  dimStoneFade: 'rgba(139, 155, 180, 0.18)',
  textMain:     '#e8dee0',
  textDim:      '#94817a',
  gridSubtle:   'rgba(45, 53, 72, 0.3)',
  gridHidden:   'rgba(0, 0, 0, 0)',
  panelBg:      '#120e0d',
  tooltipBg:    'rgba(13, 10, 9, 0.96)',
};


// ──────────────────────────────────────────────────────────────────────
// 🛠️  SHARED HELPERS — Reusable retro theme configs
// ──────────────────────────────────────────────────────────────────────

/**
 * Build a vertical gradient for the neon glow effect on bars/lines.
 * Goes from solid color at the top → faded at the bottom.
 */
function glowGradient(canvas, solidColor, fadedColor) {
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.parentElement.clientHeight || 300);
  grad.addColorStop(0, solidColor);
  grad.addColorStop(0.55, solidColor);
  grad.addColorStop(1, fadedColor);
  return grad;
}

/**
 * Shared retro tooltip styling — dark stone popup with copper border.
 */
function retroTooltip(extras = {}) {
  return {
    backgroundColor: ORE.tooltipBg,
    titleColor: ORE.gold,
    bodyColor: ORE.textMain,
    borderColor: ORE.copper,
    borderWidth: 2,
    cornerRadius: 2,
    padding: 12,
    titleFont: {
      family: "'Pixelify Sans', monospace",
      size: 14,
      weight: '700',
    },
    bodyFont: {
      family: "'Pixelify Sans', monospace",
      size: 13,
    },
    displayColors: true,
    boxPadding: 6,
    ...extras,
  };
}

/**
 * Shared retro axis styling — subtle grid, pixel font labels.
 */
function retroAxes(opts = {}) {
  return {
    x: {
      stacked: opts.stacked || false,
      ticks: {
        color: ORE.textDim,
        font: { family: "'Pixelify Sans', monospace", size: 13, weight: '600' },
        maxRotation: opts.rotateLabels ? 45 : 0,
      },
      grid: {
        color: ORE.gridHidden,   // No vertical grid lines
        drawBorder: false,
      },
      border: { color: ORE.gridSubtle },
    },
    y: {
      stacked: opts.stacked || false,
      beginAtZero: true,
      ticks: {
        color: ORE.textDim,
        font: { family: "'Pixelify Sans', monospace", size: 12 },
        stepSize: opts.stepSize || undefined,
      },
      grid: {
        color: ORE.gridSubtle,   // Subtle dark horizontal lines
        drawBorder: false,
      },
      border: { color: ORE.gridSubtle },
    },
  };
}


// ──────────────────────────────────────────────────────────────────────
// 🔥  GLOBAL CHART.JS DEFAULTS — Apply retro theme to every chart
// ──────────────────────────────────────────────────────────────────────

Chart.defaults.font.family     = "'Pixelify Sans', monospace";
Chart.defaults.font.weight     = '600';
Chart.defaults.color           = ORE.textDim;
Chart.defaults.borderColor     = ORE.gridSubtle;
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.pointStyleWidth = 14;


// ══════════════════════════════════════════════════════════════════════
//  📜  CHART 1: SCHOLAR ENLISTMENT — Line Chart
//      Metric: New user registrations over the last 7 days
//      Position: Top row, full width
// ══════════════════════════════════════════════════════════════════════

function renderEnlistmentChart() {

  // ┌────────────────────────────────────────────────────────────────┐
  // │  📦 MOCK DATA — Replace with Firebase Firestore query         │
  // │                                                                │
  // │  HOW TO REPLACE WITH FIREBASE:                                │
  // │                                                                │
  // │  // 1. Query users created in the last 7 days                  │
  // │  const sevenDaysAgo = new Date();                              │
  // │  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);            │
  // │                                                                │
  // │  const snap = await db.collection("users")                     │
  // │    .where("profileData.createdAt", ">=", sevenDaysAgo)         │
  // │    .get();                                                     │
  // │                                                                │
  // │  // 2. Bucket into day-of-week counts                          │
  // │  const dayCounts = {};                                         │
  // │  snap.forEach(doc => {                                         │
  // │    const created = doc.data().profileData.createdAt.toDate();   │
  // │    const dayLabel = created.toLocaleDateString('en',            │
  // │      { weekday: 'short' });                                    │
  // │    dayCounts[dayLabel] = (dayCounts[dayLabel] || 0) + 1;       │
  // │  });                                                           │
  // │                                                                │
  // │  // 3. Map into labels[] and data[] arrays                     │
  // │  const labels = Object.keys(dayCounts);                        │
  // │  const data   = Object.values(dayCounts);                      │
  // └────────────────────────────────────────────────────────────────┘

  const mockData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    newUsers: [4, 7, 3, 9, 12, 6, 8],
  };

  const canvas = document.getElementById('enlistmentChart');
  if (!canvas) return;

  // Build the translucent fill gradient (teal → transparent)
  const ctx = canvas.getContext('2d');
  const fillGrad = ctx.createLinearGradient(0, 0, 0, 280);
  fillGrad.addColorStop(0, 'rgba(0, 212, 170, 0.35)');
  fillGrad.addColorStop(0.7, 'rgba(0, 212, 170, 0.06)');
  fillGrad.addColorStop(1, 'rgba(0, 212, 170, 0)');

  new Chart(canvas, {
    type: 'line',
    data: {
      labels: mockData.labels,
      datasets: [{
        label: 'New Scholars',
        data: mockData.newUsers,
        borderColor: ORE.teal,
        backgroundColor: fillGrad,
        borderWidth: 3,
        tension: 0.3,                 // Smooth curve
        fill: true,                   // Translucent area fill
        pointBackgroundColor: ORE.teal,
        pointBorderColor: '#000',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: ORE.teal,
        pointHoverBorderWidth: 3,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1400,
        easing: 'easeOutQuart',
      },
      interaction: {
        intersect: false,
        mode: 'index',
      },
      scales: retroAxes({ stepSize: 3 }),
      plugins: {
        legend: { display: false },   // Clean — title is in the HTML header
        tooltip: retroTooltip({
          callbacks: {
            label: (item) => `  ⚔️  ${item.parsed.y} new scholars enlisted`,
          },
        }),
      },
    },
  });
}


// ══════════════════════════════════════════════════════════════════════
//  ⚔️  CHART 2: QUEST BOARD — Bar Chart
//      Metric: Chapter completion counts (identify difficulty spikes)
//      Position: Bottom-left column
// ══════════════════════════════════════════════════════════════════════

function renderQuestBoardChart() {

  // ┌────────────────────────────────────────────────────────────────┐
  // │  📦 MOCK DATA — Replace with Firebase Firestore query         │
  // │                                                                │
  // │  HOW TO REPLACE WITH FIREBASE:                                │
  // │                                                                │
  // │  // 1. Query all quiz / chapter completion records             │
  // │  const snap = await db.collection("quizResults").get();        │
  // │                                                                │
  // │  // 2. Count completions per chapter                           │
  // │  const chapterCounts = {};                                     │
  // │  snap.forEach(doc => {                                         │
  // │    const ch = doc.data().chapter; // e.g. "Ch 1"               │
  // │    chapterCounts[ch] = (chapterCounts[ch] || 0) + 1;           │
  // │  });                                                           │
  // │                                                                │
  // │  // 3. Map into labels[] and data[] arrays                     │
  // │  const labels = Object.keys(chapterCounts);                    │
  // │  const data   = Object.values(chapterCounts);                  │
  // └────────────────────────────────────────────────────────────────┘

  const mockData = {
    labels: ['Ch 1', 'Ch 2', 'Ch 3', 'Ch 4', 'Ch 5'],
    completions: [38, 31, 22, 14, 8],
  };

  const canvas = document.getElementById('questBoardChart');
  if (!canvas) return;

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: mockData.labels,
      datasets: [{
        label: 'Completions',
        data: mockData.completions,
        backgroundColor: glowGradient(canvas, ORE.amber, ORE.amberGlow),
        borderColor: ORE.amber,
        borderWidth: 2,
        borderRadius: 4,             // Slightly rounded corners
        hoverBackgroundColor: ORE.amber,
        hoverBorderColor: '#fff',
        hoverBorderWidth: 2,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1200,
        easing: 'easeOutQuart',
        delay: (ctx) => ctx.dataIndex * 100,
      },
      scales: retroAxes({ stepSize: 10 }),
      plugins: {
        legend: { display: false },
        tooltip: retroTooltip({
          callbacks: {
            label: (item) => `  🗡️  ${item.parsed.y} adventurers cleared`,
          },
        }),
      },
    },
  });
}


// ══════════════════════════════════════════════════════════════════════
//  🔮  CHART 3: MERCHANT VAULT — Doughnut Chart
//      Metric: Most popular cosmetic shop items
//      Position: Bottom-right column
// ══════════════════════════════════════════════════════════════════════

function renderMerchantVaultChart() {

  // ┌────────────────────────────────────────────────────────────────┐
  // │  📦 MOCK DATA — Replace with Firebase Firestore query         │
  // │                                                                │
  // │  HOW TO REPLACE WITH FIREBASE:                                │
  // │                                                                │
  // │  // 1. Query the purchases / inventory collection              │
  // │  const snap = await db.collection("purchases").get();          │
  // │                                                                │
  // │  // 2. Count purchases per cosmetic item                       │
  // │  const itemCounts = {};                                        │
  // │  snap.forEach(doc => {                                         │
  // │    const item = doc.data().itemName;                            │
  // │    itemCounts[item] = (itemCounts[item] || 0) + 1;             │
  // │  });                                                           │
  // │                                                                │
  // │  // 3. Sort descending and take top N items                    │
  // │  const sorted = Object.entries(itemCounts)                     │
  // │    .sort((a, b) => b[1] - a[1])                                │
  // │    .slice(0, 5);                                               │
  // │  const labels = sorted.map(s => s[0]);                         │
  // │  const data   = sorted.map(s => s[1]);                         │
  // └────────────────────────────────────────────────────────────────┘

  const mockData = {
    labels: ['Crystal Aura', 'Iron Frame', 'Stealth Cloak', 'Phoenix Wings', 'Void Mask'],
    purchases: [42, 35, 28, 19, 12],
  };

  // Distinct ore colors for each slice
  const sliceColors = [
    ORE.purple,      // Crystal Aura
    ORE.dimStone,    // Iron Frame
    ORE.amber,       // Stealth Cloak
    ORE.teal,        // Phoenix Wings
    ORE.gold,        // Void Mask
  ];

  const sliceHoverColors = [
    '#b577ff',
    '#a3b3cc',
    '#ffc76e',
    '#33ebc2',
    '#f0c040',
  ];

  const canvas = document.getElementById('merchantVaultChart');
  if (!canvas) return;

  new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: mockData.labels,
      datasets: [{
        data: mockData.purchases,
        backgroundColor: sliceColors,
        borderColor: '#0f0c0b',        // Dark stone border between slices
        borderWidth: 3,
        hoverBackgroundColor: sliceHoverColors,
        hoverBorderColor: '#fff',
        hoverBorderWidth: 2,
        hoverOffset: 8,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '75%',                   // Sleek ring shape
      animation: {
        animateRotate: true,
        duration: 1600,
        easing: 'easeOutQuart',
      },
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            color: ORE.textMain,
            font: {
              family: "'Pixelify Sans', monospace",
              size: 12,
              weight: '600',
            },
            padding: 14,
            usePointStyle: true,
            pointStyleWidth: 12,
          },
        },
        tooltip: retroTooltip({
          callbacks: {
            label: (item) => {
              const total = item.dataset.data.reduce((a, b) => a + b, 0);
              const pct = ((item.parsed / total) * 100).toFixed(0);
              return `  ✨  ${item.label}: ${item.parsed} sold (${pct}%)`;
            },
          },
        }),
      },
    },
  });
}


// ──────────────────────────────────────────────────────────────────────
// 🚀  INIT — Render all three charts when the DOM is ready
// ──────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  renderEnlistmentChart();
  renderQuestBoardChart();
  renderMerchantVaultChart();
});
