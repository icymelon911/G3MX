/**
 * ═══════════════════════════════════════════════════════════
 * auth-guard.js — Firebase Authentication Route Guard
 * ═══════════════════════════════════════════════════════════
 * Include this script on ANY page that requires login.
 * It MUST be loaded AFTER firebase-app-compat.js,
 * firebase-auth-compat.js, and firebase-config.js.
 *
 * What it does:
 *   1. Hides the page body until auth state is confirmed
 *   2. If no user is signed in → redirects to login.html
 *   3. If user is signed in → shows the page
 *
 * Usage (add after firebase scripts):
 *   <script src="auth-guard.js"></script>
 * ═══════════════════════════════════════════════════════════
 */
(function () {
  // Hide the page immediately to prevent flash of content
  document.documentElement.style.visibility = "hidden";

  // Initialize Firebase if not already done
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  firebase.auth().onAuthStateChanged(function (user) {
    if (!user) {
      // Not logged in — redirect to login page
      window.location.href = "login.html";
    } else {
      // Authenticated — reveal the page
      document.documentElement.style.visibility = "visible";
    }
  });
})();
