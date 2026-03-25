// // --- 1. FIREBASE CONFIGURATION ---
// const firebaseConfig = {
//   apiKey: "AIzaSyDxLu8HGi27suKE3UsONs_LecE5XXhm7SA",
//   authDomain: "g3mx-b6b1b.firebaseapp.com",
//   projectId: "g3mx-b6b1b",
//   databaseURL:
//     "https://g3mx-b6b1b-default-rtdb.asia-southeast1.firebasedatabase.app",
//   messagingSenderId: "942145798920",
//   appId: "1:942145798920:web:30d8af7f59c539bba9e2bd",
//   measurementId: "G-0Y9JLM6LHM",
// };

// firebase.initializeApp(firebaseConfig);
// const database = firebase.database();

// document.addEventListener("DOMContentLoaded", () => {
//   // --- TAB NAVIGATION LOGIC ---
//   const tabButtons = document.querySelectorAll(".tab-btn");
//   const tabContents = document.querySelectorAll(".tab-content");

//   tabButtons.forEach((button) => {
//     button.addEventListener("click", () => {
//       tabButtons.forEach((btn) => btn.classList.remove("active"));
//       tabContents.forEach((content) => content.classList.remove("active"));

//       button.classList.add("active");
//       const targetId = button.getAttribute("data-target");
//       document.getElementById(targetId).classList.add("active");
//     });
//   });

//   // --- AVATAR CUSTOMIZER LOGIC ---
//   const profileForm = document.getElementById("editProfileForm");
//   const imageUploadInput = document.getElementById("imageUploadInput");
//   const profileImagePreview = document.getElementById("profileImagePreview");

//   // --- 1. PREVIEW THE IMAGE WHEN SELECTED ---
//   let base64ImageString = ""; // This will hold our image text

//   imageUploadInput.addEventListener("change", function (event) {
//     const file = event.target.files[0];

//     if (file) {
//       // Prevent huge files from crashing the database
//       if (file.size > 1048576) {
//         // 1MB limit
//         alert("File is too large! Please choose an image under 1MB.");
//         imageUploadInput.value = "";
//         return;
//       }

//       const reader = new FileReader();
//       reader.onload = function (e) {
//         base64ImageString = e.target.result; // This is the magic text string!
//         profileImagePreview.src = base64ImageString; // Show the preview
//       };
//       reader.readAsDataURL(file);
//     }
//   });

//   // --- 2. SAVE TO FIREBASE REALTIME DATABASE ---
//   if (profileForm) {
//     profileForm.addEventListener("submit", async function (e) {
//       e.preventDefault();

//       const saveBtn = document.querySelector(".save-btn");
//       saveBtn.textContent = "SAVING...";

//       const updatedUsername = document.getElementById("usernameInput").value;
//       const email = document.getElementById("emailInput").value;
//       const studentId = "student_123";
//       const dbRef = database.ref(`users/${studentId}/profileData`);

//       try {
//         // Save everything, including the image string, directly to the database!
//         await dbRef.set({
//           displayName: updatedUsername,
//           email: email,
//           profileImageUrl: base64ImageString,
//         });

//         document.getElementById("displayUsername").textContent =
//           updatedUsername;

//         // If there's an image, update the header thumbnail too
//         if (base64ImageString) {
//           document.getElementById("header-custom").src = base64ImageString;
//           document.getElementById("header-custom").style.display = "block";
//         }

//         alert("Profile and Image Saved Successfully!");
//       } catch (error) {
//         console.error("Error saving to Firebase:", error);
//         alert("Failed to save. Check the console.");
//       } finally {
//         saveBtn.textContent = "Save Changes";
//       }
//     });
//   }

//   // --- FETCH PROFILE DATA ON PAGE LOAD ---
//   function loadProfileData() {
//     const studentId = "student_123";
//     const dbRef = database.ref(`users/${studentId}/profileData`);

//     console.log("Fetching profile data...");

//     dbRef.get().then((snapshot) => {
//       if (snapshot.exists()) {
//         const data = snapshot.val();
//         console.log("Data loaded successfully!", data);

//         // Restore Text Fields
//         if (data.displayName) {
//           document.getElementById("displayUsername").textContent =
//             data.displayName;
//           document.getElementById("usernameInput").value = data.displayName;
//         }
//         if (data.email) {
//           document.getElementById("displayEmail").textContent = data.email;
//           document.getElementById("emailInput").value = data.email;
//         }

//         if (data.profileImageUrl) {
//           document.getElementById("profileImagePreview").src =
//             data.profileImageUrl;
//           document.getElementById("header-custom").src = data.profileImageUrl;
//           document.getElementById("header-custom").style.display = "block";

//           // Keep the string in memory in case they save again without picking a new image
//           base64ImageString = data.profileImageUrl;
//         }
//       }
//     });
//   }

//   // Trigger data fetch immediately when page loads
//   loadProfileData();
// });

// --- 1. FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyDxLu8HGi27suKE3UsONs_LecE5XXhm7SA",
  authDomain: "g3mx-b6b1b.firebaseapp.com",
  projectId: "g3mx-b6b1b",
  databaseURL:
    "https://g3mx-b6b1b-default-rtdb.asia-southeast1.firebasedatabase.app",
  messagingSenderId: "942145798920",
  appId: "1:942145798920:web:30d8af7f59c539bba9e2bd",
  measurementId: "G-0Y9JLM6LHM",
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
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

    if (file) {
      // Prevent huge files from crashing the database
      if (file.size > 1048576) {
        // 1MB limit
        alert("File is too large! Please choose an image under 1MB.");
        imageUploadInput.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        base64ImageString = e.target.result; // This is the magic text string!
        profileImagePreview.src = base64ImageString; // Show the preview
      };
      reader.readAsDataURL(file);
    }
  });

  // --- 2. SAVE TO FIREBASE REALTIME DATABASE ---
  if (profileForm) {
    profileForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      // 🛑 AUTH TEAM: Prevent saving if no one is logged in
      if (!currentUserId) {
        alert("Error: You must be logged in to save.");
        return;
      }

      const saveBtn = document.querySelector(".save-btn");
      saveBtn.textContent = "SAVING...";

      const updatedUsername = document.getElementById("usernameInput").value;
      const email = document.getElementById("emailInput").value;

      // 🛑 AUTH TEAM: Using currentUserId instead of hardcoded student_123
      const dbRef = database.ref(`users/${currentUserId}/profileData`);

      try {
        // Save everything, including the image string, directly to the database!
        await dbRef.update({
          displayName: updatedUsername,
          email: email,
          profileImageUrl: base64ImageString,
        });

        document.getElementById("displayUsername").textContent =
          updatedUsername;

        // If there's an image, update the header thumbnail too
        if (base64ImageString) {
          document.getElementById("header-custom").src = base64ImageString;
          document.getElementById("header-custom").style.display = "block";
        }

        alert("Profile and Image Saved Successfully!");
      } catch (error) {
        console.error("Error saving to Firebase:", error);
        alert("Failed to save. Check the console.");
      } finally {
        saveBtn.textContent = "Save Changes";
      }
    });
  }

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

  // --- FETCH PROFILE DATA ON PAGE LOAD ---
  function loadProfileData() {
    // 🛑 AUTH TEAM: Don't load if no one is logged in
    if (!currentUserId) return;

    // 🛑 AUTH TEAM: Using currentUserId instead of hardcoded student_123
    const dbRef = database.ref(`users/${currentUserId}/profileData`);

    console.log("Fetching profile data...");

    dbRef.get().then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log("Data loaded successfully!", data);

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

        if (data.profileImageUrl) {
          document.getElementById("profileImagePreview").src =
            data.profileImageUrl;
          document.getElementById("header-custom").src = data.profileImageUrl;
          document.getElementById("header-custom").style.display = "block";

          // Keep the string in memory in case they save again without picking a new image
          base64ImageString = data.profileImageUrl;
        }
      }
    });

    // --- LOAD STATS (Streak, Gems, Level, XP, Rank) ---
    const statsRef = database.ref(`users/${currentUserId}/profileData/stats`);
    statsRef.get().then((snapshot) => {
      if (snapshot.exists()) {
        const stats = snapshot.val();

        // Streak Days
        const streak = stats.streak || 0;
        document.getElementById("userStreak").textContent = streak + " Days";

        // Update streak milestone icons
        updateStreakMilestones(streak);

        // Gems
        const gems = stats.gems || 0;
        document.getElementById("userGems").textContent = gems;

        // Level & XP
        const level = stats.level || 1;
        const xp = stats.xp || 0;
        const xpPerLevel = 1000; // XP needed per level
        const xpProgress = Math.min((xp / xpPerLevel) * 100, 100);

        const levelTitles = {
          1: "Novice",
          2: "Apprentice",
          3: "Adept",
          4: "Expert",
          5: "Master",
        };
        const levelTitle = levelTitles[level] || "Legend";
        document.getElementById("userLevel").textContent =
          "Level " + level + ": " + levelTitle;
        document.getElementById("userXp").textContent =
          xp + " / " + xpPerLevel + " XP";
        document.getElementById("userXpBar").style.width = xpProgress + "%";

        // Rank
        const rank = stats.rank || "Unranked";
        document.getElementById("userRank").textContent = rank;

        // Badge: Streak Master (7-day streak)
        if (streak >= 7) {
          const streakBadge = document.getElementById("badge-streak-master");
          if (streakBadge) streakBadge.classList.remove("locked");
        }
      }
    });
  }

  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      auth
        .signOut()
        .then(() => {
          console.log("User logged out.");
          window.location.href = "login.html";
        })
        .catch((error) => {
          console.error("Logout Error:", error);
          alert("Error logging out!");
        });
    });
  }

  auth.onAuthStateChanged((user) => {
    if (user) {
      currentUserId = user.uid; // Grab the real Firebase UID
      loadProfileData(); // Load their specific profile data
    } else {
      window.location.href = "login.html"; // Kick them out if not logged in
    }
  });
  loadProfileData();

  // ============================================
  // --- 90-DAY ACTIVITY HEATMAP ---
  // ============================================

  /**
   * 🔧 FIREBASE INTEGRATION POINT (Heatmap):
   * When your teammate's game coding is ready, replace activityData with a Firebase query:
   *
   *   const snapshot = await database.ref(`users/${currentUserId}/Activity_Log`).once('value');
   *   const activityData = {};
   *   snapshot.forEach(child => {
   *     const date = child.val().date; // e.g. "2026-03-24"
   *     activityData[date] = (activityData[date] || 0) + 1;
   *   });
   *   generateHeatmap(activityData, 90);
   */
  const activityData = {}; // Empty until Firebase integration

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
      cellSize = 22; gapSize = 4;
    } else if (numDays <= 30) {
      cellSize = 22; gapSize = 4;
    } else {
      cellSize = 22; gapSize = 4;
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
      const count = activityData[dateStr] || 0;
      const tier = getOreTier(count);

      const cell = document.createElement("div");
      cell.className = `heatmap-cell heatmap-tier-${tier}`;
      cell.style.width = cellSize + "px";
      cell.style.height = cellSize + "px";
      cell.dataset.tooltip = `${dateStr}: ${count} action${count !== 1 ? "s" : ""} (${tierNames[tier]})`;
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
      generateHeatmap(activityData, days);
    });
  });

  generateHeatmap(activityData, 90);

  // ============================================
  // --- SKILL PROFICIENCY RADAR CHART ---
  // ============================================

  /**
   * 🔧 FIREBASE INTEGRATION POINT (Radar Chart):
   * When your teammate's game coding is ready, replace skillData with a Firebase query:
   *
   *   const snapshot = await database.ref(`users/${currentUserId}/Game_Log/skills`).once('value');
   *   const skills = snapshot.val();
   *   const skillData = [skills.java, skills.python, skills.webdev, skills.databases, skills.uiux];
   *   initSkillRadarChart(skillData);
   */
  const skillData = [0, 0, 0, 0, 0]; // Empty until Firebase integration

  function initSkillRadarChart(skillData) {
    const canvas = document.getElementById("skillRadarChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    new Chart(ctx, {
      type: "radar",
      data: {
        labels: ["Java", "Python", "Web Dev", "Databases", "UI/UX"],
        datasets: [
          {
            label: "Proficiency",
            data: skillData,
            fill: true,
            backgroundColor: "rgba(56, 217, 169, 0.15)",
            borderColor: "rgba(56, 217, 169, 0.8)",
            borderWidth: 2,
            pointBackgroundColor: "#38d9a9",
            pointBorderColor: "#1c1615",
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 8,
            pointHoverBackgroundColor: "#dfa632",
            pointHoverBorderColor: "#1c1615",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: {
              stepSize: 20,
              color: "#94817a",
              backdropColor: "transparent",
              font: {
                family: "'Pixelify Sans', monospace",
                size: 10,
              },
            },
            grid: {
              color: "rgba(82, 68, 63, 0.4)",
              lineWidth: 1,
            },
            angleLines: {
              color: "rgba(82, 68, 63, 0.3)",
              lineWidth: 1,
            },
            pointLabels: {
              color: "#dfa632",
              font: {
                family: "'Pixelify Sans', monospace",
                size: 13,
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
              label: function (context) {
                return context.parsed.r + "% Proficiency";
              },
            },
          },
        },
      },
    });
  }

  initSkillRadarChart(skillData);
});
