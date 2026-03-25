const firebaseConfig = {
  apiKey: "AIzaSyDxLu8HGi27suKE3UsONs_LecE5XXhm7SA",
  authDomain: "g3mx-b6b1b.firebaseapp.com",
  projectId: "g3mx-b6b1b",
  databaseURL:
    "https://g3mx-b6b1b-default-rtdb.asia-southeast1.firebasedatabase.app",
  messagingSenderId: "942145798920",
  appId: "1:942145798920:web:30d8af7f59c539bba9e2bd",
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

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
  const streakRef = database.ref(`users/${uid}/streakData`);
  const statsStreakRef = database.ref(`users/${uid}/profileData/stats/streak`);

  try {
    const snapshot = await streakRef.once("value");
    const data = snapshot.val() || {};
    const lastLogin = data.lastLoginDate || null;
    let currentStreak = data.currentStreak || 0;

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

    // Save streak data
    await streakRef.set({
      lastLoginDate: today,
      currentStreak: currentStreak,
    });

    // Mirror to profileData/stats so the profile page can read it
    await statsStreakRef.set(currentStreak);
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
      const usernameRef = database.ref(`usernames/${usernameLower}`);
      const snapshot = await usernameRef.once("value");

      if (snapshot.exists()) {
        alert("❌ This Hero Name has already been claimed by another player!");
        return;
      }


      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      await database.ref(`usernames/${usernameLower}`).set(user.uid);

      await database.ref(`users/${user.uid}/profileData`).set({
        displayName: username,
        email: email,
        equippedFrame: "none",
      });

      await database.ref(`users/${user.uid}/profileData/stats`).set({
        level: 1,
        xp: 0,
        gems: 0,
        streak: 0,
        rank: "Unranked",
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

      const snapshot = await database
        .ref(`users/${user.uid}/profileData/role`)
        .once("value");
      const role = snapshot.val();

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