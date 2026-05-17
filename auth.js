firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ==========================================
// 🎨 THEMED ALERT TOAST (Auth Pages)
// ==========================================
function showAuthAlert(message, type = 'error') {
  const existing = document.getElementById('authAlertToast');
  if (existing) existing.remove();

  const icons = { error: '⚠️', success: '✅', warning: '⚔️' };
  const colors = {
    error: { border: '#d14747', bg: 'rgba(163, 50, 50, 0.95)', glow: 'rgba(209, 71, 71, 0.5)' },
    success: { border: '#38d9a9', bg: 'rgba(28, 82, 65, 0.95)', glow: 'rgba(56, 217, 169, 0.5)' },
    warning: { border: '#dfa632', bg: 'rgba(120, 88, 24, 0.95)', glow: 'rgba(223, 166, 50, 0.5)' },
  };
  const c = colors[type] || colors.error;

  const toast = document.createElement('div');
  toast.id = 'authAlertToast';
  toast.innerHTML = `<span style="font-size:1.6rem;">${icons[type] || '⚠️'}</span><span>${message}</span>`;
  Object.assign(toast.style, {
    position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%) translateY(-120px)',
    background: c.bg, border: `4px solid ${c.border}`,
    boxShadow: `8px 8px 0px rgba(0,0,0,0.7), 0 0 20px ${c.glow}`,
    padding: '1rem 2rem', display: 'flex', alignItems: 'center', gap: '0.8rem',
    zIndex: '9999', fontFamily: "'VT323', monospace", fontSize: '1.4rem',
    color: '#e8dee0', textShadow: '2px 2px 0px #000', letterSpacing: '1px',
    borderRadius: '6px',
    transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease',
    opacity: '0', maxWidth: '90vw',
  });
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(-50%) translateY(0)';
    toast.style.opacity = '1';
  });

  setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(-120px)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}
// ==========================================
// 🔒 AUTO-LOGOUT ON AUTH PAGES
// ==========================================
// If a user navigates to login or signup, clear any
// existing session so they can't "go back" to stay logged in.
// This runs once on page load — long before the login form is submitted.
(function () {
  const page = window.location.pathname.split("/").pop();
  if (page === "login.html" || page === "signup.html") {
    auth.signOut().catch(function () { /* ignore if already signed out */ });
  }
})();

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

function validatePasswordCriteria(password) {
  return {
    minLength: password.length >= 6,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
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
      showAuthAlert("Your Hero Name is too long! (Max 12 characters)", "warning");
      return;
    }

    if (username.length < 6) {
      showAuthAlert("Your Hero Name is too short! (Min 6 characters)", "warning");
      return;
    }

    if (password !== confirmPassword) {
      showAuthAlert("Passwords do not match! Please check again.", "error");
      return;
    }

    const criteria = validatePasswordCriteria(password);
    if (!criteria.minLength || !criteria.uppercase || !criteria.number || !criteria.special) {
      const missing = [];
      if (!criteria.minLength) missing.push("at least 6 characters");
      if (!criteria.uppercase) missing.push("an uppercase letter");
      if (!criteria.number) missing.push("a number");
      if (!criteria.special) missing.push("a special character");
      showAuthAlert(`Password must contain ${missing.join(", ")}.`, "error");
      return;
    }

    try {
      const usernameLower = username.toLowerCase();
      const usernameDocRef = db.collection("usernames").doc(usernameLower);
      const snapshot = await usernameDocRef.get();

      if (snapshot.exists) {
        showAuthAlert("This Hero Name has already been claimed by another player!", "error");
        return;
      }

      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      await db.collection("usernames").doc(usernameLower).set({ uid: user.uid });

      await db.collection("users").doc(user.uid).set({
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        profileData: {
          displayName: username,
          email: email,
          equippedFrame: "none",
          profileImageUrl: "images/steam.png",
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

      showAuthAlert("Character created! Welcome to G3MX.", "success");
      setTimeout(() => { window.location.href = "G3MXMain.html"; }, 1500);

    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        showAuthAlert("This email is already registered in the guild. Try logging in!", "error");
      } else if (error.code === 'auth/weak-password') {
        showAuthAlert("Password is too weak. It must be at least 6 characters.", "error");
      } else if (error.code === 'auth/invalid-email') {
        showAuthAlert("Please enter a valid email address.", "error");
      } else {
        showAuthAlert(`Signup failed: ${error.message}`, "error");
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
      showAuthAlert("Login failed: Invalid email or password.", "error");
    }
  });
}
