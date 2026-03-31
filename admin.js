firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// ==========================================
// 🚪 LOGOUT BUTTON
// ==========================================
document.getElementById("adminLogoutBtn").addEventListener("click", () => {
  auth.signOut().then(() => {
    window.location.href = "login.html";
  });
});

// ==========================================
// 📄 GENERATE PDF REPORT (jsPDF)
// ==========================================
document
  .getElementById("generatePdfBtn")
  .addEventListener("click", generateGuildReportPDF);

/**
 * ═══════════════════════════════════════════════════════════════
 * generateGuildReportPDF()
 * ═══════════════════════════════════════════════════════════════
 * Queries Firestore for live analytics data, then builds a
 * professional, structured PDF using the jsPDF library.
 *
 * HOW jsPDF WORKS (Quick Reference):
 *   doc.text(string, x, y)         → Draw text at (x, y) in mm
 *   doc.setFont(name, style)       → e.g. "helvetica", "bold"
 *   doc.setFontSize(pt)            → Set text size in points
 *   doc.setTextColor(r, g, b)      → RGB text color
 *   doc.setDrawColor(r, g, b)      → RGB stroke color
 *   doc.line(x1, y1, x2, y2)       → Draw a line
 *   doc.rect(x, y, w, h, style)    → Draw rectangle ("F"=fill)
 *   doc.splitTextToSize(str, maxW)  → Word-wrap text
 *   doc.save(filename)             → Trigger browser download
 * ═══════════════════════════════════════════════════════════════
 */
async function generateGuildReportPDF() {
  try {
    // ──────────────────────────────────────────────
    // STEP 1: FETCH DATA FROM FIRESTORE
    // ──────────────────────────────────────────────

    // 1A: User-level metrics (scholars, streaks, gems)
    const userSnapshot = await db.collection("users").get();
    let totalScholars = 0;
    let highestStreak = 0;
    let streakHolder = "Unknown Wanderer";
    let totalGemsInCirculation = 0;

    userSnapshot.forEach((doc) => {
      const data = doc.data();
      const role = data.profileData ? data.profileData.role : null;

      if (role !== "admin") {
        totalScholars++;

        const stats = (data.profileData && data.profileData.stats) || {};

        // Track highest streak
        const streak = stats.streak || 0;
        if (streak > highestStreak) {
          highestStreak = streak;
          streakHolder =
            (data.profileData && data.profileData.displayName) ||
            "Unknown Wanderer";
        }

        // Sum all gems
        totalGemsInCirculation += stats.gems || 0;
      }
    });

    // 1B: Quest/Chapter completion counts
    const chapters = [
      "Chapter 1",
      "Chapter 2",
      "Chapter 3",
      "Chapter 4",
      "Chapter 5",
    ];
    const chapterTotals = [0, 0, 0, 0, 0];
    let totalQuestsConquered = 0;

    try {
      const logSnapshot = await db.collectionGroup("activity_logs").get();
      logSnapshot.forEach((doc) => {
        const data = doc.data();
        const chapterName = data.chapterName || data.chapter || "";
        const matchedIdx = chapters.findIndex((label) =>
          chapterName.startsWith(label),
        );
        if (matchedIdx !== -1) {
          chapterTotals[matchedIdx]++;
          totalQuestsConquered++;
        }
      });
    } catch (e) {
      console.warn("Could not fetch activity_logs for PDF:", e);
    }

    // ──────────────────────────────────────────────
    // STEP 2: INITIALIZE jsPDF
    // ──────────────────────────────────────────────
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: "portrait", // "portrait" or "landscape"
      unit: "mm", // coordinates in millimeters
      format: "a4", // standard A4 (210 x 297 mm)
    });

    const marginLeft = 20;
    const pageWidth = 210;
    const contentWidth = pageWidth - marginLeft * 2; // 170mm usable
    let y = 20; // vertical cursor

    // ──────────────────────────────────────────────
    // STEP 3A: TITLE PAGE HEADER
    // ──────────────────────────────────────────────
    // Title in copper ore color
    doc.setFont("courier", "bold");
    doc.setFontSize(20);
    doc.setTextColor(194, 101, 62); // #c2653e copper
    doc.text("GUILD MASTER'S ANALYTICS LEDGER", marginLeft, y);

    // Subtitle with date
    y += 10;
    doc.setFont("courier", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const reportDate = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    doc.text(
      `Generated: ${reportDate}  |  G3MX Learning System`,
      marginLeft,
      y,
    );

    // Decorative separator line
    y += 6;
    doc.setLineWidth(0.8);
    doc.setDrawColor(194, 101, 62); // copper line
    doc.line(marginLeft, y, pageWidth - marginLeft, y);

    // ──────────────────────────────────────────────
    // STEP 3B: EXECUTIVE SUMMARY
    // ──────────────────────────────────────────────
    y += 14;
    doc.setFont("courier", "bold");
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text("1.  EXECUTIVE SUMMARY", marginLeft, y);

    y += 8;
    doc.setFont("courier", "normal");
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);

    const summaryText =
      `The G3MX Gamified Learning Platform currently sustains ${totalScholars} enrolled scholars. ` +
      `A total of ${totalQuestsConquered} chapter quests have been conquered across all users, ` +
      `with ${totalGemsInCirculation} GEMs circulating in the student economy. ` +
      `The longest active engagement streak stands at ${highestStreak} consecutive days, ` +
      `held by ${streakHolder}, indicating strong retention among top-performing cohorts.`;

    const wrappedSummary = doc.splitTextToSize(summaryText, contentWidth);
    doc.text(wrappedSummary, marginLeft, y);

    // ──────────────────────────────────────────────
    // STEP 3C: KEY METRICS
    // ──────────────────────────────────────────────
    y += wrappedSummary.length * 5 + 14;
    doc.setFont("courier", "bold");
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text("2.  KEY PERFORMANCE METRICS", marginLeft, y);

    y += 10;
    doc.setFontSize(11);
    const metrics = [
      { label: "Total Enrolled Scholars", value: String(totalScholars) },
      { label: "Total Quests Conquered", value: String(totalQuestsConquered) },
      { label: "GEMs in Circulation", value: String(totalGemsInCirculation) },
      {
        label: "Longest Active Streak",
        value: `${highestStreak} Days  [${streakHolder}]`,
      },
    ];

    metrics.forEach((m) => {
      doc.setFont("courier", "bold");
      doc.setTextColor(50, 50, 50);
      doc.text(`${m.label}:`, marginLeft + 4, y);
      doc.setFont("courier", "normal");
      doc.setTextColor(194, 101, 62); // copper value
      doc.text(m.value, marginLeft + 90, y);
      y += 8;
    });

    // ──────────────────────────────────────────────
    // STEP 3D: CHAPTER COMPLETION DATA TABLE
    // ──────────────────────────────────────────────
    y += 8;
    doc.setFont("courier", "bold");
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text("3.  QUEST BOARD — CHAPTER CLEARANCE TABLE", marginLeft, y);

    y += 10;

    // Table Header Row (filled background)
    doc.setFillColor(42, 34, 32); // --ck-panel-bg
    doc.setTextColor(223, 166, 50); // --ck-gold
    doc.rect(marginLeft, y - 5, contentWidth, 8, "F");
    doc.setFontSize(10);
    doc.setFont("courier", "bold");
    doc.text("CHAPTER", marginLeft + 4, y);
    doc.text("COMPLETIONS", marginLeft + 100, y);

    y += 8;

    // Table Data Rows
    doc.setFont("courier", "normal");
    doc.setTextColor(50, 50, 50);
    chapters.forEach((ch, i) => {
      // Alternating row background
      if (i % 2 === 0) {
        doc.setFillColor(245, 243, 240);
        doc.rect(marginLeft, y - 5, contentWidth, 7, "F");
      }
      doc.text(ch, marginLeft + 4, y);
      doc.text(String(chapterTotals[i]), marginLeft + 100, y);
      y += 7;
    });

    // Total row
    doc.setFillColor(42, 34, 32);
    doc.setTextColor(56, 217, 169); // --ck-crystal-glow teal
    doc.rect(marginLeft, y - 5, contentWidth, 8, "F");
    doc.setFont("courier", "bold");
    doc.text("TOTAL", marginLeft + 4, y);
    doc.text(String(totalQuestsConquered), marginLeft + 100, y);

    // ──────────────────────────────────────────────
    // STEP 3E: STRATEGIC RECOMMENDATIONS
    // ──────────────────────────────────────────────
    y += 18;
    doc.setFont("courier", "bold");
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text("4.  STRATEGIC RECOMMENDATIONS", marginLeft, y);

    y += 10;
    doc.setFont("courier", "normal");
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);

    const recommendations = [
      "Identify chapters with lowest completion rates and review difficulty balance to reduce dropout.",
      "Leverage the GEM economy to incentivize streak-building behaviors beyond the top performers.",
      "Expand the cosmetic shop inventory to sustain engagement in the Merchant Vault marketplace.",
    ];

    recommendations.forEach((rec, i) => {
      const wrapped = doc.splitTextToSize(`${i + 1}. ${rec}`, contentWidth - 8);
      doc.text(wrapped, marginLeft + 4, y);
      y += wrapped.length * 5 + 4;
    });

    // ──────────────────────────────────────────────
    // FOOTER
    // ──────────────────────────────────────────────
    y += 6;
    doc.setLineWidth(0.3);
    doc.setDrawColor(180, 180, 180);
    doc.line(marginLeft, y, pageWidth - marginLeft, y);
    y += 6;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      "* End of Official Guild Master's Ledger — G3MX Gamified E-Learning System *",
      marginLeft,
      y,
    );

    // ──────────────────────────────────────────────
    // STEP 4: SAVE — Trigger browser download
    // ──────────────────────────────────────────────
    const dateStr = new Date().toISOString().split("T")[0];
    doc.save(`Guild_Analytics_Report_${dateStr}.pdf`);
  } catch (error) {
    console.error("Error generating the Guild Report PDF:", error);
    alert("The Scribe encountered an error. Check the console for details.");
  }
}

// ==========================================
// 🛑 THE ADMIN BOUNCER 🛑
// ==========================================
auth.onAuthStateChanged((user) => {
  if (user) {
    // They are logged in! Check if they have the Admin Key
    db.collection("users")
      .doc(user.uid)
      .get()
      .then((docSnap) => {
        const data = docSnap.exists ? docSnap.data() : {};
        const role = data.profileData ? data.profileData.role : null;
        if (role === "admin") {
          console.log("Admin Access Granted.");
          loadStudentRoster();
          loadAdminStats();
          loadForgeSettings();
        } else {
          // They are a student trying to sneak in!
          alert("Access Denied: Admin Only!");
          window.location.href = "profile.html";
        }
      });
  } else {
    // Not logged in at all
    window.location.href = "login.html";
  }
});

/**
 * 🏛️ LOAD ADMIN STATS
 * Queries Firestore for global guild metrics.
 */
async function loadAdminStats() {
  try {
    const userSnapshot = await db.collection("users").get();
    let studentCount = 0;
    let maxStreak = 0;
    let topStrekker = "Unknown Wanderer";

    userSnapshot.forEach((doc) => {
      const data = doc.data();
      const role = data.profileData ? data.profileData.role : null;

      // Only aggregate stats for students (non-admins)
      if (role !== "admin") {
        studentCount++;

        const currentStreak =
          (data.profileData &&
            data.profileData.stats &&
            data.profileData.stats.streak) ||
          0;
        if (currentStreak > maxStreak) {
          maxStreak = currentStreak;
          topStrekker = data.profileData.displayName || "Unknown Wanderer";
        }
      }
    });

    // Update Total Scholars
    const statElement = document.getElementById("totalStudentsStat");
    if (statElement) {
      statElement.textContent = studentCount.toString().padStart(2, "0");
    }

    // Update Highest Streak
    const streakElement = document.getElementById("highestStreakStat");
    if (streakElement) {
      streakElement.innerHTML = `${maxStreak.toString().padStart(2, "0")} Days — <small id="streakHolderName">[${topStrekker}]</small>`;
    }
  } catch (err) {
    console.error("Error loading top-level stats:", err);
  }
}

/**
 * 🛠️ Placeholder for Student Roster
 * (Maintain this if you are building the table in a separate step)
 */
function loadStudentRoster() {
  console.log("Guild Roster: Searching for adventurers...");
}

// ==========================================
// ⚒️ RELIC FORGE — ACHIEVEMENT ECONOMY
// ==========================================

// ==========================================
// ⚒️ RELIC FORGE — ACHIEVEMENT ECONOMY
// ==========================================

/**
 * saveAchievementSettings()
 * ─────────────────────────────────────────────────────────────────
 * Reads the 5 threshold inputs from the Relic Forge panel and
 * writes them to:  game_settings / achievements  (Firestore)
 *
 * Mode: set({ ... }, { merge: true })
 * ─────────────────────────────────────────────────────────────────
 */
async function saveAchievementSettings() {
  const btn = document.getElementById("saveForgeBtn");
  if (!btn) return;

  const originalText = btn.textContent;

  // Helper to parse input values safely
  const getVal = (id) => {
    const el = document.getElementById(id);
    const val = el ? parseInt(el.value, 10) : null;
    return isNaN(val) || val <= 0 ? null : val;
  };

  const thresholds = {
    firstSpark: getVal("forge-first-spark"),
    wealthyScholar: getVal("forge-wealthy-scholar"),
    coreMaster: getVal("forge-core-master"),
    deepDelver: getVal("forge-deep-delver"),
    legend: getVal("forge-legend"),
  };

  // Filter out nulls so we only update what was typed
  const updateData = {};
  for (const [key, value] of Object.entries(thresholds)) {
    if (value !== null) updateData[key] = value;
  }

  if (Object.keys(updateData).length === 0) {
    alert("Please enter at least one enchantment value!");
    return;
  }

  // EXPERT UI FEEDBACK
  btn.textContent = "ENCHANTING...";
  btn.disabled = true;

  try {
    // AS ARCHITECT: Using merge: true to preserve other potential global settings
    await db
      .collection("game_settings")
      .doc("achievements")
      .set(updateData, { merge: true });

    // SUCCESS FEEDBACK
    btn.textContent = "✅ SAVED!";
    btn.style.backgroundColor = "var(--ck-crystal-glow)";

    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.backgroundColor = "";
      btn.disabled = false;
    }, 2500);

    console.log("⚒️ Relic Forge: Sync Complete ->", updateData);
  } catch (err) {
    console.error("Relic Forge Error:", err);
    btn.textContent = "❌ FAILED";
    setTimeout(() => {
      btn.textContent = originalText;
      btn.disabled = false;
    }, 2500);
  }
}

/**
 * loadForgeSettings()
 * ─────────────────────────────────────────────────────────────────
 * Pre-populates the Relic Forge inputs with whatever thresholds
 * are currently stored in Firestore so the admin sees live values.
 * ─────────────────────────────────────────────────────────────────
 */
async function loadForgeSettings() {
  try {
    const snap = await db.collection("game_settings").doc("achievements").get();
    if (!snap.exists) return;

    const d = snap.data();
    const map = {
      "forge-first-spark": d.firstSpark,
      "forge-wealthy-scholar": d.wealthyScholar,
      "forge-core-master": d.coreMaster,
      "forge-deep-delver": d.deepDelver,
      "forge-legend": d.legend,
    };

    Object.entries(map).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el && val !== undefined) el.value = val;
    });
  } catch (err) {
    console.warn(
      "Relic Forge: Could not load existing thresholds —",
      err.message,
    );
  }
}
