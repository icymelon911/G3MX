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

      alert("✅ Character created! Welcome to G3MX.");
      window.location.href = "profile.html"; // #MAINMENU.html ian need to chg

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

      const snapshot = await database
        .ref(`users/${user.uid}/profileData/role`)
        .once("value");
      const role = snapshot.val();

      if (role === "admin") {
        console.log("Guild Master recognized. Rerouting to Admin Dashboard...");
        window.location.href = "admin.html";
      } else {
        console.log("Student recognized. Rerouting to Game...");
        window.location.href = "profile.html"; // #MAINMENU.html ian need to chg
      }
    } catch (error) {
      alert("Login failed: " + error.message);
    }
  });
}