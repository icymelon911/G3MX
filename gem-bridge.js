// ============================================================
// gem-bridge.js — Godot ↔ Firebase Gem Bridge
// ============================================================
// Exposes these global functions for Godot to call:
//
//   window.addGems(n)   — called with the session running total
//                         (e.g. 1, 2, 3... as each gem is collected)
//   window.setGems(n)   — overwrite gem count with an exact value
//   window.exitToMenu() — save gems then go back to MainMenu.html
//
// Call from GDScript:
//   Godot 4:  JavaScriptBridge.eval("window.addGems(" + str(total_gems) + ")")
//   Godot 3:  JavaScript.eval("window.addGems(" + str(total_gems) + ")")
// ============================================================

(function () {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  // The game passes its running session total on every gem collect
  // (1, 2, 3, 4...). We track the last value so we only save the
  // difference each time → exactly +1 per gem regardless of timing.
  var lastSessionTotal = 0;

  // Gems queued before Firebase Auth has resolved
  var queuedGems = 0;

  // userRef is null until auth resolves
  var userRef = null;

  // ----------------------------------------------------------
  // Compute how many NEW gems to save from a session-total call.
  // Handles game resets: if the new total is lower than the last
  // (game restarted), we treat the new total itself as the increment.
  // ----------------------------------------------------------
  function computeDiff(newTotal) {
    var diff;
    if (newTotal > lastSessionTotal) {
      diff = newTotal - lastSessionTotal; // normal increment
    } else if (newTotal < lastSessionTotal) {
      diff = newTotal;                    // game reset — treat new total as increment
    } else {
      diff = 0;                           // same value (e.g. exitToMenu after addGems) — no change
    }
    lastSessionTotal = newTotal;
    return diff;
  }

  // Pre-auth stub — queues gems so nothing is lost if Godot calls
  // addGems before onAuthStateChanged fires.
  window.addGems = function (total) {
    total = parseInt(total) || 0;
    if (total <= 0) return;
    var diff = computeDiff(total);
    if (diff <= 0) return;
    queuedGems += diff;
    console.log("GemBridge: Auth pending — queued +" + diff + " gems. Total queued:", queuedGems);
  };

  // Alias — Chapter 1 GDScript calls saveGemsFromGame instead of addGems
  window.saveGemsFromGame = window.addGems;

  window.setGems = function () {
    console.warn("GemBridge: setGems called before auth resolved — ignored.");
  };

  window.exitToMenu = function () {
    window.location.href = "MainMenu.html";
  };

  firebase.auth().onAuthStateChanged(function (user) {
    if (!user) {
      console.warn("GemBridge: No logged-in user found.");
      return;
    }

    userRef = firebase.firestore().collection("users").doc(user.uid);
    console.log("GemBridge: Auth ready for user", user.uid);

    // ----------------------------------------------------------
    // Internal save — dot-notation update() so only gems is touched.
    // Falls back to set() only if the document doesn't exist yet.
    // ----------------------------------------------------------
    function saveIncrement(amount) {
      if (amount <= 0) return;

      // Add to localStorage queue for race-condition safety (Godot exiting too fast)
      var cached = parseInt(localStorage.getItem('pending_gems') || '0');
      localStorage.setItem('pending_gems', cached + amount);

      userRef.update({
        "profileData.stats.gems": firebase.firestore.FieldValue.increment(amount)
      }).then(function () {
        console.log("GemBridge: +" + amount + " gems saved.");
        // Successfully saved, remove from local queue
        var currentQ = parseInt(localStorage.getItem('pending_gems') || '0');
        localStorage.setItem('pending_gems', Math.max(0, currentQ - amount));
      }).catch(function (err) {
        if (err.code === "not-found") {
          userRef.set({ profileData: { stats: { gems: amount } } }, { merge: true })
            .then(function () { 
              console.log("GemBridge: +" + amount + " gems saved (new doc)."); 
              var currentQ = parseInt(localStorage.getItem('pending_gems') || '0');
              localStorage.setItem('pending_gems', Math.max(0, currentQ - amount));
            })
            .catch(function (e) { console.error("GemBridge: Failed to create doc:", e); });
        } else {
          console.error("GemBridge: Failed to save gems. Will retry later:", err);
        }
      });
    }

    // Flush any gems queued before auth resolved
    if (queuedGems > 0) {
      console.log("GemBridge: Flushing", queuedGems, "queued gems.");
      saveIncrement(queuedGems);
      queuedGems = 0;
    }

    // Flush any gems that failed to save due to Godot exiting too fast
    var pendingGems = parseInt(localStorage.getItem('pending_gems') || '0');
    if (pendingGems > 0) {
      console.log("GemBridge: Recovered " + pendingGems + " pending gems from localStorage.");
      localStorage.setItem('pending_gems', '0');
      saveIncrement(pendingGems);
    }

    // ----------------------------------------------------------
    // window.addGems(total)
    // Game passes running session total (1, 2, 3...).
    // We save only the diff so Firestore gets exactly +1 per gem.
    // ----------------------------------------------------------
    window.addGems = function (total) {
      total = parseInt(total) || 0;
      if (total <= 0) return;
      var diff = computeDiff(total);
      if (diff <= 0) return;
      saveIncrement(diff);
    };

    // Keep alias in sync with the real implementation
    window.saveGemsFromGame = window.addGems;

    // ----------------------------------------------------------
    // window.setGems(total)
    // Overwrites gem count with an exact value.
    // ----------------------------------------------------------
    window.setGems = function (total) {
      total = parseInt(total) || 0;
      if (total < 0) return;
      userRef.update({ "profileData.stats.gems": total })
        .then(function () { console.log("GemBridge: Gems set to", total); })
        .catch(function (err) { console.error("GemBridge: Failed to set gems:", err); });
    };

    // ----------------------------------------------------------
    // window.exitToMenu()
    // Call when player exits. Optionally pass a final gem total.
    //
    //   JavaScriptBridge.eval("window.exitToMenu()")
    //   JavaScriptBridge.eval("window.exitToMenu(" + str(total_gems) + ")")
    // ----------------------------------------------------------
    window.exitToMenu = function (sessionTotal) {
      var total = parseInt(sessionTotal) || 0;

      function goBack() { window.location.href = "MainMenu.html"; }

      if (total > 0) {
        var diff = computeDiff(total);
        if (diff > 0) {
          userRef.update({
            "profileData.stats.gems": firebase.firestore.FieldValue.increment(diff)
          }).then(goBack).catch(goBack);
        } else {
          goBack();
        }
      } else {
        goBack();
      }
    };
  });
})();
