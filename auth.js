firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// --- DAILY LOGIN STREAK LOGIC ---
function getTodayDateString() {
  const now = new Date();
  // Convert to UTC+8
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const malaysiaTime = new Date(utc + 8 * 3600000);
  const year = malaysiaTime.getFullYear();
  const month = String(malaysiaTime.getMonth() + 1).padStart(2, "0");
  const day = String(malaysiaTime.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Check if dateA is exactly one day before dateB (both YYYY-MM-DD strings)
function isYesterday(dateA, dateB) {
  const a = new Date(dateA + "T00:00:00+08:00");
  const b = new Date(dateB + "T00:00:00+08:00");
  const diffMs = b - a;
  return diffMs === 86400000; // exactly 24 hours
}

async function recordDailyLogin(uid) {
  const today = getTodayDateString();
  const userRef = db.collection("users").doc(uid);

  try {
    const docSnap = await userRef.get();
    const data = docSnap.exists ? docSnap.data() : {};
    const streakData = data.streakData || {};
    const lastLogin = streakData.lastLoginDate || null;
    let currentStreak = streakData.currentStreak || 0;

    if (lastLogin === today) {
      // Already logged in today — nothing to do
      console.log("Streak: Already logged in today. Current streak:", currentStreak);
      return;
    }

    if (lastLogin && isYesterday(lastLogin, today)) {
      // Consecutive day — increment streak
      currentStreak += 1;
      console.log("Streak continued! New streak:", currentStreak);
    } else {
      // First login ever OR streak broken — reset to 1
      currentStreak = 1;
      console.log("Streak reset to 1.");
    }

    // Save streak data and mirror to profileData.stats.streak
    await userRef.update({
      streakData: { lastLoginDate: today, currentStreak: currentStreak },
      "profileData.stats.streak": currentStreak,
    });
  } catch (error) {
    console.error("Error recording daily login streak:", error);
  }
}

// --- SIGN UP LOGIC ---
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    const confirmPassword = document.getElementById("signupConfirmPassword").value;
    const username = document.getElementById("signupUsername").value;

    if (username.length > 12) {
      alert("❌ Your Hero Name is too long! (Max 12 characters)");
      return;
    }

    if (username.length < 6) {
      alert("❌ Your Hero Name is too short! (Min 6 characters)");
      return;
    }

    if (password !== confirmPassword) {
      alert("❌ Passwords do not match! Please check again.");
      return;
    }

    try {
      const usernameLower = username.toLowerCase();
      const usernameDocRef = db.collection("usernames").doc(usernameLower);
      const snapshot = await usernameDocRef.get();

      if (snapshot.exists) {
        alert("❌ This Hero Name has already been claimed by another player!");
        return;
      }

      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      await db.collection("usernames").doc(usernameLower).set({ uid: user.uid });

      await db.collection("users").doc(user.uid).set({
        profileData: {
          displayName: username,
          email: email,
          equippedFrame: "none",
          stats: {
            level: 1,
            xp: 0,
            gems: 0,
            streak: 0,
            rank: "Unranked",
          },
        },
        streakData: {},
      });

      // Record first daily login on signup (starts streak at 1)
      await recordDailyLogin(user.uid);

      alert("✅ Character created! Welcome to G3MX.");
      window.location.href = "G3MXMain.html"; // #MAINMENU.html ian need to chg

    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        alert("❌ This email is already registered in the guild. Try logging in!");
      } else {
        alert("Signup failed: " + error.message);
      }
    }
  });
}

// --- LOGIN LOGIC ---
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
      const userCredential = await auth.signInWithEmailAndPassword(
        email,
        password,
      );
      const user = userCredential.user;

      // Record daily login streak
      await recordDailyLogin(user.uid);

      const docSnap = await db.collection("users").doc(user.uid).get();
      const data = docSnap.exists ? docSnap.data() : {};
      const role = data.profileData ? data.profileData.role : null;

      if (role === "admin") {
        console.log("Guild Master recognized. Rerouting to Admin Dashboard...");
        window.location.href = "admin.html";
      } else {
        console.log("Student recognized. Rerouting to Game...");
        window.location.href = "G3MXMain.html"; // #MAINMENU.html ian need to chg
      }
    } catch (error) {
      alert("Login failed: " + error.message);
    }
  });
}
