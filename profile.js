firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth(); // 🛑 AUTH TEAM: Initialize Auth
 
// ==========================================
// 🛑 AUTH TEAM INTEGRATION HOOK 🛑
// ==========================================
// Currently hardcoded to "student_123" so the UI team can test.
// Auth Team: Update this variable when a user successfully logs in!
let currentUserId = "student_123";
 
document.addEventListener("DOMContentLoaded", () => {
  // --- TAB NAVIGATION LOGIC ---
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");
 
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));
 
      button.classList.add("active");
      const targetId = button.getAttribute("data-target");
      document.getElementById(targetId).classList.add("active");
    });
  });
 
  // --- AVATAR CUSTOMIZER LOGIC ---
  const profileForm = document.getElementById("editProfileForm");
  const imageUploadInput = document.getElementById("imageUploadInput");
  const profileImagePreview = document.getElementById("profileImagePreview");
 
  // --- 1. PREVIEW THE IMAGE WHEN SELECTED ---
  let base64ImageString = ""; // This will hold our image text
 
  imageUploadInput.addEventListener("change", function (event) {
    const file = event.target.files[0];
    const fileNameDisplay = document.getElementById("fileUploadName");
 
    if (file) {
      // Prevent huge files from crashing the database
      if (file.size > 1048576) {
        // 1MB limit
        alert("File is too large! Please choose an image under 1MB.");
        imageUploadInput.value = "";
        if (fileNameDisplay) fileNameDisplay.textContent = "No file chosen";
        return;
      }
 
      if (fileNameDisplay) fileNameDisplay.textContent = file.name;
 
      const reader = new FileReader();
      reader.onload = function (e) {
        base64ImageString = e.target.result; // This is the magic text string!
        profileImagePreview.src = base64ImageString; // Show the preview
      };
      reader.readAsDataURL(file);
    }
  });
 
  // --- TOGGLE PASSWORD SECTION ---
  const togglePasswordBtn = document.getElementById("togglePasswordSection");
  const passwordSection = document.getElementById("passwordSection");
  if (togglePasswordBtn && passwordSection) {
    togglePasswordBtn.addEventListener("click", () => {
      const isHidden = passwordSection.style.display === "none";
      passwordSection.style.display = isHidden ? "block" : "none";
      togglePasswordBtn.textContent = isHidden
        ? "Cancel Password Change"
        : "Change Password";
      if (!isHidden) {
        document.getElementById("currentPasswordInput").value = "";
        document.getElementById("passwordInput").value = "";
      }
    });
  }
 
  // --- THEMED ALERT TOAST ---
  function showProfileAlert(message, type = "error") {
    // Remove existing alert if any
    const existing = document.getElementById("profileAlertToast");
    if (existing) existing.remove();
 
    const icons = { error: "⚠️", success: "✅", warning: "⚔️" };
    const colors = {
      error: {
        border: "#d14747",
        bg: "rgba(163, 50, 50, 0.95)",
        glow: "rgba(209, 71, 71, 0.5)",
      },
      success: {
        border: "#38d9a9",
        bg: "rgba(28, 82, 65, 0.95)",
        glow: "rgba(56, 217, 169, 0.5)",
      },
      warning: {
        border: "#dfa632",
        bg: "rgba(120, 88, 24, 0.95)",
        glow: "rgba(223, 166, 50, 0.5)",
      },
    };
    const c = colors[type] || colors.error;
 
    const toast = document.createElement("div");
    toast.id = "profileAlertToast";
    toast.innerHTML = `<span style="font-size:1.6rem;">${icons[type] || "⚠️"}</span><span>${message}</span>`;
    Object.assign(toast.style, {
      position: "fixed",
      top: "24px",
      left: "50%",
      transform: "translateX(-50%) translateY(-120px)",
      background: c.bg,
      border: `4px solid ${c.border}`,
      boxShadow: `8px 8px 0px rgba(0,0,0,0.7), 0 0 20px ${c.glow}`,
      padding: "1rem 2rem",
      display: "flex",
      alignItems: "center",
      gap: "0.8rem",
      zIndex: "9999",
      fontFamily: '"Jersey 15", sans-serif',
      fontSize: "1.4rem",
      color: "#e8dee0",
      textShadow: "2px 2px 0px #000",
      letterSpacing: "1px",
      imageRendering: "pixelated",
      transition:
        "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease",
      opacity: "0",
    });
    document.body.appendChild(toast);
 
    // Animate in
    requestAnimationFrame(() => {
      toast.style.transform = "translateX(-50%) translateY(0)";
      toast.style.opacity = "1";
    });
 
    // Auto-dismiss after 4s
    setTimeout(() => {
      toast.style.transform = "translateX(-50%) translateY(-120px)";
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }
 
  // --- 2. SAVE TO FIRESTORE ---
  if (profileForm) {
    profileForm.addEventListener("submit", async function (e) {
      e.preventDefault();
 
      // 🛑 AUTH TEAM: Prevent saving if no one is logged in
      if (!currentUserId) {
        showProfileAlert("You must be logged in to save.", "error");
        return;
      }
 
      const saveBtn = document.querySelector(".save-btn");
      saveBtn.textContent = "SAVING...";
 
      const updatedUsername = document.getElementById("usernameInput").value;
      const email = document.getElementById("emailInput").value;
 
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showProfileAlert("Please enter a valid email address.", "error");
        saveBtn.textContent = "Save Changes";
        return;
      }
 
      const newPassword = document.getElementById("passwordInput").value;
      const currentPassword = document.getElementById(
        "currentPasswordInput",
      ).value;
      const isChangingPassword =
        passwordSection.style.display !== "none" && newPassword.length > 0;
 
      const userRef = db.collection("users").doc(currentUserId);
 
      try {
        // --- Handle password change with reauthentication ---
        if (isChangingPassword) {
          if (!currentPassword) {
            showProfileAlert(
              "Please enter your current password to set a new one.",
              "warning",
            );
            saveBtn.textContent = "Save Changes";
            return;
          }
          if (newPassword.length < 6) {
            showProfileAlert(
              "New password must be at least 6 characters.",
              "error",
            );
            saveBtn.textContent = "Save Changes";
            return;
          }
          if (newPassword === currentPassword) {
            showProfileAlert(
              "New password cannot be the same as the current password.",
              "error",
            );
            saveBtn.textContent = "Save Changes";
            return;
          }
 
          const user = auth.currentUser;
          const credential = firebase.auth.EmailAuthProvider.credential(
            user.email,
            currentPassword,
          );
 
          try {
            await user.reauthenticateWithCredential(credential);
          } catch (reauthError) {
            showProfileAlert(
              "Current password is incorrect. Please try again.",
              "error",
            );
            saveBtn.textContent = "Save Changes";
            return;
          }
 
          await user.updatePassword(newPassword);
 
          // Hide password section and clear fields after success
          passwordSection.style.display = "none";
          document.getElementById("currentPasswordInput").value = "";
          document.getElementById("passwordInput").value = "";
          togglePasswordBtn.textContent = "Change Password";
        }
 
        // --- Save profile data to Firestore ---
        await userRef.update({
          "profileData.displayName": updatedUsername,
          "profileData.email": email,
          "profileData.profileImageUrl": base64ImageString,
        });
 
        document.getElementById("displayUsername").textContent =
          updatedUsername;
 
        // If there's an image, update the header thumbnail too
        if (base64ImageString) {
          document.getElementById("header-custom").src = base64ImageString;
          document.getElementById("header-custom").style.display = "block";
        }
 
        showProfileAlert(
          isChangingPassword
            ? "Profile and password saved successfully!"
            : "Profile saved successfully!",
          "success",
        );
      } catch (error) {
        console.error("Error saving to Firebase:", error);
        showProfileAlert(
          "Failed to save. Password must contain an upper case character, a numeric character, and a non-alphanumeric character.",
          "error",
        );
      } finally {
        saveBtn.textContent = "Save Changes";
      }
    });
  }
 
  // ============================================
  // --- GEM ACHIEVEMENTS / RELICS (DYNAMIC) ---
  // ============================================
 
  /**
   * Static metadata for achievements.
   * field: matches Firestore key in game_settings/achievements
   * id: DOM ID for the card
   */
  const ACHIEVEMENTS_CONFIG = [
    {
      field: "firstSpark",
      id: "ach-first-spark",
      name: "First Spark",
      icon: "✨",
      desc: "Kindled the flame of knowledge",
    },
    {
      field: "wealthyScholar",
      id: "ach-wealthy-scholar",
      name: "Wealthy Scholar",
      icon: "💰",
      desc: "Amassed a fortune from the core",
    },
    {
      field: "coreMaster",
      id: "ach-core-master",
      name: "Core Master",
      icon: "💎",
      desc: "Reached the heart of the core",
    },
    {
      field: "deepDelver",
      id: "ach-deep-delver",
      name: "Deep Delver",
      icon: "⛏️",
      desc: "Mined deep into the darkness",
    },
    {
      field: "legend",
      id: "ach-legend",
      name: "Legend of the Core",
      icon: "🌟",
      desc: "A living legend of the realm",
    },
  ];
 
  const DEFAULT_GEM_THRESHOLDS = {
    firstSpark: 100,
    wealthyScholar: 500,
    coreMaster: 1000,
    deepDelver: 2500,
    legend: 5000,
  };
 
  let cachedThresholds = { ...DEFAULT_GEM_THRESHOLDS };
 
  /**
   * renderAchievements()
   * ─────────────────────────────────────────────────────────────────
   * Programmatically builds the achievement cards in the DOM.
   * ─────────────────────────────────────────────────────────────────
   */
  function renderAchievements() {
    const grid = document.getElementById("achievementsGrid");
    if (!grid) return;
 
    grid.innerHTML = ""; // Clear placeholders
 
    ACHIEVEMENTS_CONFIG.forEach((ach) => {
      const card = document.createElement("div");
      card.className = "achievement-card locked";
      card.id = ach.id;
      card.innerHTML = `
        <div class="achievement-icon">${ach.icon}</div>
        <div class="achievement-gem-cost">
          <img src="images/gem.png" class="ach-gem-icon" alt="GEM" />
          <span class="ach-cost">...</span>
        </div>
        <h4 class="achievement-name">${ach.name}</h4>
        <p class="achievement-desc">${ach.desc}</p>
      `;
      grid.appendChild(card);
    });
  }
 
  /**
   * checkDynamicAchievements(userTotalGems)
   * ─────────────────────────────────────────────────────────────────
   * Updates UI (locked/unlocked) and cost text based on gems.
   * ─────────────────────────────────────────────────────────────────
   */
  function checkDynamicAchievements(userTotalGems) {
    ACHIEVEMENTS_CONFIG.forEach(({ field, id }) => {
      const card = document.getElementById(id);
      if (!card) return;
 
      const threshold = cachedThresholds[field] || DEFAULT_GEM_THRESHOLDS[field];
 
      // 1. Update text
      const costSpan = card.querySelector(".ach-cost");
      if (costSpan) costSpan.textContent = threshold.toLocaleString();
 
      // 2. Update state
      if (userTotalGems >= threshold) {
        card.classList.remove("locked");
        card.classList.add("unlocked");
      } else {
        card.classList.remove("unlocked");
        card.classList.add("locked");
      }
    });
  }
 
  // --- INITIALIZE RENDER ---
  renderAchievements();
 
  // --- LIVE GLOBAL SETTINGS SYNC ---
  db.collection("game_settings")
    .doc("achievements")
    .onSnapshot((snap) => {
      if (snap.exists) {
        console.log("⚒️ Achievement Sync: Global costs updated!");
        cachedThresholds = { ...DEFAULT_GEM_THRESHOLDS, ...snap.data() };
 
        // Force refresh based on current visible gems
        const gemEl = document.getElementById("userGems");
        if (gemEl) {
          const currentGems =
            parseInt(gemEl.textContent.replace(/,/g, "")) || 0;
          checkDynamicAchievements(currentGems);
        }
      }
    });
 
  // --- STREAK MILESTONES UPDATER ---
  function updateStreakMilestones(streak) {
    const milestones = [
      { id: "milestone-1", day: 1 },
      { id: "milestone-5", day: 5 },
      { id: "milestone-10", day: 10 },
    ];
 
    milestones.forEach((m) => {
      const el = document.getElementById(m.id);
      if (!el) return;
      if (streak >= m.day) {
        el.classList.remove("locked");
        el.classList.add("unlocked");
      } else {
        el.classList.remove("unlocked");
        el.classList.add("locked");
      }
    });
 
    // Update the progress track fill (0% at 0 days, 100% at 10+ days)
    const trackFill = document.getElementById("streakTrackFill");
    if (trackFill) {
      const maxDay = 10;
      const pct = Math.min((streak / maxDay) * 100, 100);
      trackFill.style.width = pct + "%";
    }
  }
 
  // --- COMPUTE LEADERBOARD RANK (Same logic as leaderboard2.html) ---
  async function computeLeaderboardRank(uid) {
    try {
      const snapshot = await db.collection("users").get();
      const players = [];
 
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data && data.profileData) {
          const stats = data.profileData.stats || {};
          players.push({
            id: doc.id,
            gems: stats.gems || 0,
          });
        }
      });
 
      // Sort descending by gems — identical to leaderboard2.html
      players.sort((a, b) => b.gems - a.gems);
 
      // Find current user's position (1-indexed)
      const position = players.findIndex((p) => p.id === uid) + 1;
      return position > 0 ? `No. ${position}` : "Unranked";
    } catch (err) {
      console.error("Error computing rank:", err);
      return "Unranked";
    }
  }
 
  // --- FETCH PROFILE DATA ON PAGE LOAD ---
  function loadProfileData() {
    // 🛑 AUTH TEAM: Don't load if no one is logged in
    if (!currentUserId) return;
 
    // 🛑 AUTH TEAM: Using currentUserId instead of hardcoded student_123
    const userRef = db.collection("users").doc(currentUserId);
 
    console.log("Fetching profile data...");
 
    userRef.get().then((docSnap) => {
      if (docSnap.exists) {
        const userData = docSnap.data();
        const data = userData.profileData || {};
        const stats = data.stats || {};
        console.log("Data loaded successfully!", userData);
 
        // Restore Text Fields
        if (data.displayName) {
          document.getElementById("displayUsername").textContent =
            data.displayName;
          document.getElementById("usernameInput").value = data.displayName;
        }
        if (data.email) {
          document.getElementById("displayEmail").textContent = data.email;
          document.getElementById("emailInput").value = data.email;
        }
 
        if (
          data.profileImageUrl &&
          data.profileImageUrl !== "undefined" &&
          data.profileImageUrl !== "null" &&
          data.profileImageUrl.trim() !== ""
        ) {
          document.getElementById("profileImagePreview").src =
            data.profileImageUrl;
          document.getElementById("header-custom").src = data.profileImageUrl;
          document.getElementById("header-custom").style.display = "block";
 
          // Keep the string in memory in case they save again without picking a new image
          base64ImageString = data.profileImageUrl;
        }
 
        // --- LOAD STATS (Streak, Gems, Level, XP, Rank) ---
 
        // Streak Days
        const streak = stats.streak || 0;
        document.getElementById("userStreak").textContent = streak + " Days";
 
        // Update streak milestone icons
        updateStreakMilestones(streak);
 
        // Gems
        const gems = stats.gems || 0;
        document.getElementById("userGems").textContent = gems.toLocaleString();
 
        // Rank — computed dynamically from all users, same as leaderboard
        computeLeaderboardRank(currentUserId).then((rank) => {
          document.getElementById("userRank").textContent = rank;
        });
 
        // Badge: Streak Master (7-day streak)
        if (streak >= 7) {
          const streakBadge = document.getElementById("badge-streak-master");
          if (streakBadge) streakBadge.classList.remove("locked");
        }
      }
    });
  }
 
  // ============================================
  // --- COSMETICS ON PROFILE HEADER AVATAR ---
  // ============================================
 
  const COSMETICS_CATALOG = [
    { name: "Gold Frame", type: "frame", image: "images/goldframe.png" },
    { name: "Green Frame", type: "frame", image: "images/green frame.png" },
    { name: "Stone Frame", type: "frame", image: "images/core_frame.png" },
    { name: "Fire Frame", type: "frame", image: "images/fire_frame.png" },
    { name: "Wizard Hat", type: "hat", image: "images/wizard hat.png" },
    { name: "Cool Shades", type: "glasses", image: "images/sunglasses.png" },
    {
      name: "Construction Hat",
      type: "hat",
      image: "images/construction hat.png",
    },
    { name: "Nerd Glasses", type: "glasses", image: "images/nerd.png" },
  ];
 
  function applyProfileCosmetics(equipped) {
    const layerMap = {
      frame: "profileFrame",
      hat: "profileHat",
      glasses: "profileGlasses",
    };
    Object.values(layerMap).forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.style.display = "none";
    });
    for (const [type, name] of Object.entries(equipped || {})) {
      if (!name) continue;
      const item = COSMETICS_CATALOG.find((c) => c.name === name);
      const el = document.getElementById(layerMap[type]);
      if (item && el) {
        el.src = item.image;
        el.style.display = "block";
      }
    }
  }
 
  const logoutBtn = document.getElementById("logoutBtn");
  const logoutPopup = document.getElementById("logoutPopup");
  const confirmLogout = document.getElementById("confirmLogout");
  const cancelLogout = document.getElementById("cancelLogout");
  const closeLogout = document.getElementById("closeLogout");
 
  if (logoutBtn && logoutPopup) {
    logoutBtn.addEventListener("click", () => {
      logoutPopup.classList.add("active");
    });
 
    const closePopup = () => logoutPopup.classList.remove("active");
 
    if (closeLogout) closeLogout.addEventListener("click", closePopup);
    if (cancelLogout) cancelLogout.addEventListener("click", closePopup);
 
    if (confirmLogout) {
      confirmLogout.addEventListener("click", () => {
        auth
          .signOut()
          .then(() => {
            console.log("Profile: User logged out successfully.");
            window.location.href = "login.html";
          })
          .catch((error) => {
            console.error("Logout Error:", error);
            alert("Error logging out!");
          });
      });
    }
  }
 
  auth.onAuthStateChanged((user) => {
    if (user) {
      currentUserId = user.uid;
 
      // --- OFFLINE GEM SYNC (Godot Race Condition fix) ---
      var pendingGems = parseInt(localStorage.getItem("pending_gems") || "0");
      if (pendingGems > 0) {
        console.log(
          "Profile: Recovered " +
            pendingGems +
            " stranded gems from Godot exit.",
        );
        localStorage.setItem("pending_gems", "0");
        db.collection("users")
          .doc(user.uid)
          .update({
            "profileData.stats.gems":
              firebase.firestore.FieldValue.increment(pendingGems),
          })
          .catch((e) => console.error("Sync failed", e));
      }
 
      loadProfileData();
      loadChartData(user.uid);
 
      // Real-time listener — updates gems and header cosmetics instantly
      db.collection("users")
        .doc(user.uid)
        .onSnapshot((docSnap) => {
          if (docSnap.exists) {
            const profileData = docSnap.data().profileData || {};
            const gems = (profileData.stats || {}).gems || 0;
            document.getElementById("userGems").textContent =
              gems.toLocaleString();
            checkDynamicAchievements(gems);
            applyProfileCosmetics(profileData.equipped || {});
          }
        });
    } else {
      window.location.href = "login.html";
    }
  });
 
  // ============================================
  // --- 90-DAY ACTIVITY HEATMAP ---
  // ============================================
 
  /**
   * 🔧 FIREBASE INTEGRATION POINT (Gameplay Activity Heatmap):
   * Tracks the total number of times the user played games on each calendar date.
   *
   * Firestore path:  users/{uid}/gamePlays  (a subcollection where each document has a
   *                  `playedAt` Timestamp field)
   *
   * Replace the mock activityData object below with this query:
   *
   *   const playSnap = await db.collection("users").doc(currentUserId)
   *                             .collection("gamePlays").get();
   *   const activityData = {};
   *   playSnap.forEach(doc => {
   *     // Convert Firestore Timestamp → YYYY-MM-DD string
   *     const d = doc.data().playedAt.toDate();
   *     const dateStr = d.toISOString().split("T")[0];
   *     activityData[dateStr] = (activityData[dateStr] || 0) + 1;
   *   });
   *   generateHeatmap(activityData, 90);
   *
   * Tier thresholds (see getOreTier):
   *   0 plays → Empty Stone  |  1-2 → Dull Gray  |  3-5 → Glowing Copper
   *   6-9    → Bright Gold   |  10+ → Blazing Teal Crystal
   */
 
  // Populated by loadChartData() after Firebase Auth resolves
  let cachedActivityData = {};
 
  function getOreTier(count) {
    if (count <= 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 9) return 3;
    return 4;
  }
 
  const tierNames = [
    "Empty Stone",
    "Dull Gray Stone",
    "Glowing Copper",
    "Bright Gold",
    "Blazing Teal Crystal",
  ];
 
  function generateHeatmap(activityData, numDays) {
    numDays = numDays || 90;
    const grid = document.getElementById("heatmapGrid");
    const daysCol = document.querySelector(".heatmap-days");
    if (!grid) return;
    grid.innerHTML = "";
 
    // Scale cell size based on range so all views fill similar space
    let cellSize, gapSize;
    if (numDays <= 7) {
      cellSize = 22;
      gapSize = 4;
    } else if (numDays <= 30) {
      cellSize = 22;
      gapSize = 4;
    } else {
      cellSize = 22;
      gapSize = 4;
    }
 
    // Apply dynamic sizing
    grid.style.gridTemplateRows = `repeat(7, ${cellSize}px)`;
    grid.style.gridAutoColumns = `${cellSize}px`;
    grid.style.gap = `${gapSize}px`;
 
    if (daysCol) {
      daysCol.style.gridTemplateRows = `repeat(7, ${cellSize}px)`;
      daysCol.style.gap = `${gapSize}px`;
      daysCol.querySelectorAll("span").forEach((s) => {
        s.style.lineHeight = cellSize + "px";
        s.style.fontSize = Math.max(cellSize * 0.45, 9) + "px";
      });
    }
 
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (numDays - 1));
 
    // Adjust start to Monday
    const startDay = startDate.getDay();
    const offset = startDay === 0 ? 6 : startDay - 1;
    startDate.setDate(startDate.getDate() - offset);
 
    const totalDays = Math.ceil((today - startDate) / 86400000) + 1;
 
    for (let i = 0; i < totalDays; i++) {
      const cellDate = new Date(startDate);
      cellDate.setDate(cellDate.getDate() + i);
      const dateStr = cellDate.toISOString().split("T")[0];
      const data = activityData[dateStr] || { count: 0, times: [] };
      const count = data.count;
      const tier = getOreTier(count);
 
      const cell = document.createElement("div");
      cell.className = `heatmap-cell heatmap-tier-${tier}`;
      cell.style.width = cellSize + "px";
      cell.style.height = cellSize + "px";
 
      let tooltipText = `${dateStr}: Played ${count} time${count !== 1 ? "s" : ""}`;
      if (count > 0) {
        tooltipText += ` (${data.times.join(", ")})`;
      }
      cell.dataset.tooltip = tooltipText;
      grid.appendChild(cell);
    }
 
    // Update heatmap title
    const titleEl = document.getElementById("heatmapTitle");
    if (titleEl) {
      const labels = { 7: "7-Day", 30: "30-Day", 90: "90-Day" };
      titleEl.textContent = labels[numDays] || numDays + "-Day";
    }
  }
 
  // --- HEATMAP FILTER BUTTONS ---
  const filterBtns = document.querySelectorAll(".heatmap-filter-btn");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const days = parseInt(btn.dataset.days, 10);
      generateHeatmap(cachedActivityData, days);
    });
  });
 
  generateHeatmap(cachedActivityData, 90); // empty shell until auth + Firestore load
 
  // ============================================
  // --- SKILL PROFICIENCY RADAR CHART ---
  // ============================================
 
  // ============================================
  // --- CODER CLASS RADAR CHART ---
  // ============================================
 
  /**
   * 🔧 FIREBASE INTEGRATION POINT (Coder Class Radar):
   * Tracks the player's proficiency in 5 core programming concepts, derived from their
   * quiz scores in the game.
   *
   * Firestore path:  users/{uid}/skillProficiency
   * Expected fields: dataTypes, loops, ifElse, functions, arrays  (each 0–100)
   *
   * Replace the mock skillData array below with this query:
   *
   *   const skillSnap = await db.collection("users").doc(currentUserId)
   *                              .collection("skillProficiency").doc("scores").get();
   *   const s = skillSnap.exists ? skillSnap.data() : {};
   *   // Order must match the labels array: Data Types, Loops, If-Else Logic, Functions, Arrays
   *   const skillData = [
   *     s.dataTypes  || 0,
   *     s.loops      || 0,
   *     s.ifElse     || 0,
   *     s.functions  || 0,
   *     s.arrays     || 0,
   *   ];
   *   initSkillRadarChart(skillData);
   */
 
  function initChapterAffinityChart(affinityData) {
    const canvas = document.getElementById("skillRadarChart");
    if (!canvas) return;
 
    const ctx = canvas.getContext("2d");
 
    new Chart(ctx, {
      type: "radar",
      data: {
        // Multi-line labels using arrays for better fit
        labels: [
          "Chapt 1 (Data types)",
          ["Chap 2", "(Loops & If-else)"],
          "Chap 3",
          "Chap 4",
        ],
        datasets: [
          {
            label: "Chapter Affinity",
            data: affinityData,
            fill: true,
            backgroundColor: "rgba(56, 217, 169, 0.15)",
            borderColor: "#30b38c",
            borderWidth: 2,
            pointBackgroundColor: "#38d9a9",
            pointBorderColor: "#1c1615",
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: "#dfa632",
            pointHoverBorderColor: "#1c1615",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true, // Switched back to true for better shape
        layout: {
          padding: 10,
        },
        scales: {
          r: {
            beginAtZero: true,
            suggestedMin: 0,
            suggestedMax: 5, // Lowered for better "filled" look if data is low
            ticks: {
              display: false, // Hide numeric ticks to reduce clutter
            },
            grid: {
              color: "rgba(82, 68, 63, 0.5)",
              lineWidth: 1,
            },
            angleLines: {
              color: "rgba(82, 68, 63, 0.4)",
            },
            pointLabels: {
              color: "#dfa632",
              padding: 10,
              font: {
                family: "'Pixelify Sans', monospace",
                size: 14,
                weight: "600",
              },
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: "#2a2220",
            titleColor: "#dfa632",
            bodyColor: "#e8dee0",
            borderColor: "#52443f",
            borderWidth: 2,
            titleFont: {
              family: "'Pixelify Sans', monospace",
              size: 13,
            },
            bodyFont: {
              family: "'Pixelify Sans', monospace",
              size: 12,
            },
            callbacks: {
              title: function (items) {
                return items[0].label;
              },
              label: function (context) {
                return "  📖 " + context.parsed.r + " Plays";
              },
            },
          },
        },
      },
    });
  }
 
  // ============================================
  // --- MERCHANT LEDGER BAR CHART (Cosmetic Affinity) ---
  // ============================================
 
  /**
   * 🔧 FIREBASE INTEGRATION POINT (Merchant Ledger):
   * Tracks the player's favorite items based on how many times they've equipped them.
   *
   * Firestore path:  users/{uid}/cosmetics  (subcollection)
   * Fields: timesEquipped (number), purchaseDate (string YYYY-MM-DD), name (string)
   */
 
  async function loadLedgerChartData(uid) {
    try {
      const cosmeticSnap = await db
        .collection("users")
        .doc(uid)
        .collection("cosmetics")
        .get();
 
      const labels = [];
      const usageData = [];
 
      cosmeticSnap.forEach((doc) => {
        const d = doc.data();
        labels.push(d.name || doc.id);
        usageData.push(d.timesEquipped || 0);
      });
 
      // Fallback: if no equip history yet, read ownedItems from the user doc
      if (labels.length === 0) {
        const userSnap = await db.collection("users").doc(uid).get();
        const ownedItems =
          userSnap.exists && userSnap.data().profileData
            ? userSnap.data().profileData.ownedItems || []
            : [];
        ownedItems.forEach((name) => {
          labels.push(name);
          usageData.push(0);
        });
      }
 
      initMerchantLedgerChart(labels, usageData);
    } catch (e) {
      console.warn("Ledger: Could not load cosmetics —", e.message);
      initMerchantLedgerChart([], []);
    }
  }
 
  function initMerchantLedgerChart(labels, usageData) {
    const canvas = document.getElementById("merchantLedgerChart");
    if (!canvas) return;
 
    const ctx = canvas.getContext("2d");
 
    // Find the max usage for dynamic coloring (default 0 when empty)
    const maxVal = usageData.length > 0 ? Math.max(...usageData) : 0;
 
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Times Purchased",
            data: usageData,
            backgroundColor: usageData.map((v) =>
              v === maxVal && v > 0 ? "#38d9a9" : "#dfa632",
            ), // Teal top, others Gold
            borderColor: usageData.map((v) =>
              v === maxVal && v > 0 ? "#5ee8c4" : "#c2653e",
            ),
            borderWidth: 2,
            borderRadius: 4,
            hoverBackgroundColor: "#dfa632",
            barPercentage: 0.6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: {
              color: "#94817a",
              font: { family: "'Pixelify Sans', monospace", size: 12 },
            },
            grid: { display: false },
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: "#94817a",
              precision: 0,
              font: { family: "'Pixelify Sans', monospace", size: 12 },
            },
            grid: { color: "rgba(82, 68, 63, 0.4)" },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#2a2220",
            borderColor: "#52443f",
            borderWidth: 2,
            padding: 12,
            titleFont: { family: "'Pixelify Sans', monospace", size: 14 },
            bodyFont: { family: "'Pixelify Sans', monospace", size: 12 },
            callbacks: {
              title: function (items) {
                return items[0].label;
              },
              label: function (context) {
                return `Times Equipped: ${context.parsed.y}`;
              },
            },
          },
        },
      },
    });
  }
 
  // ============================================
  // --- LOAD ALL CHART DATA FROM FIRESTORE ---
  // ============================================
  // Called once after auth resolves and currentUserId is known.
 
  async function loadChartData(uid) {
    // --- 1. GAMEPLAY ACTIVITY HEATMAP ---
    // Reads users/{uid}/activity_logs subcollection.
    try {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
 
      const playSnap = await db
        .collection("users")
        .doc(uid)
        .collection("activity_logs")
        .where(
          "timestamp",
          ">=",
          firebase.firestore.Timestamp.fromDate(ninetyDaysAgo),
        )
        .get();
 
      cachedActivityData = {}; // Reset to start fresh
 
      // DEBUG: Let the user see exactly what's being fetched
      const debugLogs = [];
      const playHistory = [];
 
      playSnap.forEach((doc) => {
        const d = doc.data().timestamp;
        if (d) {
          const dateRef = d.toDate();
          const dateStr = dateRef.toISOString().split("T")[0];
          const timeStr = dateRef.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          const rawMs = dateRef.getTime();
 
          playHistory.push({
            dateStr,
            timeStr,
            rawMs,
            chapterName: doc.data().chapterName || "Unknown",
          });
        }
      });
 
      // Sort by time first
      playHistory.sort((a, b) => a.rawMs - b.rawMs);
 
      // Group and Deduplicate: If two plays are within 10 seconds, count as one
      const BUFFER_MS = 10000;
      let lastVisitMs = 0;
 
      playHistory.forEach((play) => {
        if (play.rawMs - lastVisitMs > BUFFER_MS) {
          if (!cachedActivityData[play.dateStr]) {
            cachedActivityData[play.dateStr] = { count: 0, times: [] };
          }
          cachedActivityData[play.dateStr].count += 1;
          cachedActivityData[play.dateStr].times.push(play.timeStr);
          debugLogs.push(play);
        }
        lastVisitMs = play.rawMs;
      });
 
      console.log("🔥 Heatmap Activity Detail:");
      console.table(debugLogs);
    } catch (e) {
      console.warn("Heatmap: Could not load activity_logs —", e.message);
    }
 
    // Re-render with whichever filter is active (default 90)
    const activeBtn = document.querySelector(".heatmap-filter-btn.active");
    generateHeatmap(
      cachedActivityData,
      activeBtn ? parseInt(activeBtn.dataset.days) : 90,
    );
 
    // --- 2. CHAPTER AFFINITY RADAR ---
    // Reads users/{uid}/stats/chapterPlays document.
    // Fields: chapter1, chapter2, chapter3, chapter4, chapter5.
    // Incremented by recordChapterPlay() in activity-tracker.js.
    let affinityData = [0, 0, 0, 0, 0];
    try {
      const affinitySnap = await db
        .collection("users")
        .doc(uid)
        .collection("stats")
        .doc("chapterPlays")
        .get();
      if (affinitySnap.exists) {
        const s = affinitySnap.data();
        affinityData = [
          s.chapter1 || 0,
          s.chapter2 || 0,
          s.chapter3 || 0,
          s.chapter4 || 0,
          s.chapter5 || 0,
        ];
      }
    } catch (e) {
      console.warn("Radar: Could not load chapterPlays —", e.message);
    }
    initChapterAffinityChart(affinityData);
 
    // --- 3. MERCHANT LEDGER ---
    // Reads users/{uid}/cosmetics logic.
    loadLedgerChartData(uid);
  }
});