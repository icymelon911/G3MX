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
});
