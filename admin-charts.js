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

let enlistmentChartInstance = null;
let enlistmentUnsubscribe = null;

function subscribeToRegistrationData(timeframeDays, labelText = null) {
  const db = firebase.firestore();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - timeframeDays);
  startDate.setHours(0, 0, 0, 0);

  // Update the UI label if provided
  if (labelText) {
    const labelEl = document.getElementById("enlistmentTimeframeLabel");
    if (labelEl) labelEl.textContent = labelText;
  }

  // Clear existing listener if user changes timeframe
  if (enlistmentUnsubscribe) {
    enlistmentUnsubscribe();
  }

  // Attach real-time listener
  enlistmentUnsubscribe = db.collection("users")
    .where("createdAt", ">=", startDate)
    .onSnapshot((snap) => {
      const dayCounts = {};

      // Initialize buckets to ensure empty days are represented with 0
      for (let i = timeframeDays - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const label = (timeframeDays <= 7) 
          ? d.toLocaleDateString('en', { weekday: 'short' })
          : d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
        dayCounts[label] = 0;
      }

      snap.forEach(doc => {
        const data = doc.data();
        const timestamp = data.createdAt || (data.profileData && data.profileData.createdAt);
        if (timestamp) {
          const created = (typeof timestamp.toDate === 'function') ? timestamp.toDate() : new Date(timestamp);
          const label = (timeframeDays <= 7)
            ? created.toLocaleDateString('en', { weekday: 'short' })
            : created.toLocaleDateString('en', { month: 'short', day: 'numeric' });
          
          if (dayCounts[label] !== undefined) {
            dayCounts[label] += 1;
          }
        }
      });

      // Update Chart.js interactively
      if (enlistmentChartInstance) {
        enlistmentChartInstance.data.labels = Object.keys(dayCounts);
        enlistmentChartInstance.data.datasets[0].data = Object.values(dayCounts);
        enlistmentChartInstance.update();
      }
    }, (error) => {
      console.error("Error with real-time registration data:", error);
    });
}

function renderEnlistmentChart() {
  const canvas = document.getElementById('enlistmentChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const fillGrad = ctx.createLinearGradient(0, 0, 0, 280);
  fillGrad.addColorStop(0, 'rgba(0, 212, 170, 0.35)');
  fillGrad.addColorStop(0.7, 'rgba(0, 212, 170, 0.06)');
  fillGrad.addColorStop(1, 'rgba(0, 212, 170, 0)');

  // Initialize empty chart
  enlistmentChartInstance = new Chart(canvas, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'New Scholars',
        data: [],
        borderColor: ORE.teal,
        backgroundColor: fillGrad,
        borderWidth: 3,
        tension: 0.3,
        fill: true,
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
        legend: { display: false },
        tooltip: retroTooltip({
          callbacks: {
            label: (item) => `  ⚔️  ${item.parsed.y} new scholars enlisted`,
          },
        }),
      },
    },
  });

  // Start listening to the last 7 days by default
  subscribeToRegistrationData(7, "7 days");

  // Setup UI Control Listeners
  const filterBtns = document.querySelectorAll('#enlistmentFilters .filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Manage active state
      filterBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      
      const days = parseInt(e.target.dataset.timeframe, 10);
      const labelTx = e.target.textContent.toLowerCase();
      subscribeToRegistrationData(days, labelTx);
    });
  });
}


// ══════════════════════════════════════════════════════════════════════
//  ⚔️  CHART 2: QUEST BOARD — Bar Chart
//      Metric: Chapter completion counts (identify difficulty spikes)
//      Position: Bottom-left column
// ══════════════════════════════════════════════════════════════════════

let questBoardChartInstance = null;

/**
 * ──────────────────────────────────────────────────────────────────────
 * Firestore Query Logic
 * We use a Collection Group query to search across all "Game_Log" 
 * sub-collections belonging to any user in the database.
 * ──────────────────────────────────────────────────────────────────────
 */
async function loadQuestBoardData() {
  const db = firebase.firestore();
  
  // Array matching the requested fixed chart labels
  const chapters = ['Chapter 1', 'Chapter 2', 'Chapter 3', 'Chapter 4', 'Chapter 5'];
  const totals = [0, 0, 0, 0, 0];

  try {
    // 1. Query all game logs across all users
    const snapshot = await db.collectionGroup("activity_logs").get();
    
    // 2. Tally up the completions by finding the matching chapter prefix
    snapshot.forEach(doc => {
      const data = doc.data();
      const chapterName = data.chapterName || data.chapter || ""; 
      
      // Since activity_logs saves "Chapter 1: Data Types", we check which 
      // label it starts with (e.g., "Chapter 1")
      const matchedIdx = chapters.findIndex(label => chapterName.startsWith(label));
      if (matchedIdx !== -1) {
        totals[matchedIdx]++;
      }
    });

    return totals;
  } catch (error) {
    console.error("Error fetching quest board data:", error);
    // If you don't have an index built yet, Firestore will throw an error with a link to build it.
    // We return zeroed data so the chart doesn't crash visually.
    return totals; 
  }
}

async function renderQuestBoardChart() {
  const canvas = document.getElementById('questBoardChart');
  if (!canvas) return;

  // Fetch the real totals
  const totals = await loadQuestBoardData();

  // Initialize the Chart
  questBoardChartInstance = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: ['Chapter 1', 'Chapter 2', 'Chapter 3', 'Chapter 4', 'Chapter 5'],
      datasets: [{
        label: 'Completions',
        data: totals,
        backgroundColor: glowGradient(canvas, '#dfa632', 'rgba(223, 166, 50, 0.18)'), // Glowing gold with gradient fade
        borderColor: '#f0be44',      // Slightly lighter gold border
        borderWidth: 2,
        borderRadius: 4,             // Slightly rounded pixel corners
        hoverBackgroundColor: '#38d9a9', // Glowing teal on hover
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
      // Hide x-axis grid lines entirely and use subtle dark lines for y-axis
      scales: retroAxes({ stepSize: 1 }), 
      plugins: {
        legend: { display: false }, // Disabled legend (title explains it)
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

/**
 * ──────────────────────────────────────────────────────────────────────
 * Firestore Aggregation Logic
 * Loops through the "users" collection and tallies items in 
 * their profileData.ownedItems arrays.
 * ──────────────────────────────────────────────────────────────────────
 */
async function loadMerchantVaultData() {
  const db = firebase.firestore();
  
  // The exact 6 items in the shop
  const shopItems = [
    "Gold Frame", "Green Frame", "Wizard Hat", 
    "Cool Shades", "Construction Hat", "Nerd Glasses"
  ];
  const tally = {
    "Gold Frame": 0, "Green Frame": 0, "Wizard Hat": 0,
    "Cool Shades": 0, "Construction Hat": 0, "Nerd Glasses": 0
  };

  try {
    const snapshot = await db.collection("users").get();
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const owned = (data.profileData && data.profileData.ownedItems) || [];
      
      owned.forEach(item => {
        if (tally.hasOwnProperty(item)) {
          tally[item]++;
        }
      });
    });

    return shopItems.map(name => tally[name]);
  } catch (error) {
    console.error("Error aggregating merchant data:", error);
    return [0, 0, 0, 0, 0, 0];
  }
}

async function renderMerchantVaultChart() {
  const canvas = document.getElementById('merchantVaultChart');
  if (!canvas) return;

  const dataValues = await loadMerchantVaultData();
  const labels = ["Gold Frame", "Green Frame", "Wizard Hat", "Cool Shades", "Construction Hat", "Nerd Glasses"];

  // ── Dynamic Coloring Logic ──
  const maxVal = Math.max(...dataValues);
  const minVal = Math.min(...dataValues);

  const backgroundColors = dataValues.map((val, index) => {
    if (val === maxVal && maxVal > 0) return '#38d9a9'; // Most Purchased (Teal)
    if (val === minVal) return '#a33232';              // Least Purchased (Danger Red)
    
    // Split remaining between Gold and Purple for variety
    return index % 2 === 0 ? '#dfa632' : '#9b59ff';
  });

  new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: dataValues,
        backgroundColor: backgroundColors,
        borderColor: '#0d1117',        // Deep cave background
        borderWidth: 4,                // Creates "gaps" between slices
        hoverOffset: 12,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '75%',                   // Sleek high-tech ring
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
            color: '#e8dee0',          // --ck-text-main
            font: {
              family: "'Pixelify Sans', monospace",
              size: 13,
              weight: '600',
            },
            padding: 18,
            usePointStyle: true,
            pointStyleWidth: 10,
          },
        },
        tooltip: retroTooltip({
          callbacks: {
            label: (item) => {
              const total = item.dataset.data.reduce((a, b) => a + b, 0);
              const pct = total > 0 ? ((item.parsed / total) * 100).toFixed(0) : 0;
              let rank = "";
              if (item.parsed === maxVal && maxVal > 0) rank = " (BEST SELLER!)";
              if (item.parsed === minVal) rank = " (LOW STOCK)";
              
              return `  ✨  ${item.label}: ${item.parsed} sold ${rank}`;
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
