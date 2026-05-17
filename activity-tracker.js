/**
 * Activity Tracker for Gamified E-learning System
 * Tracks chapter plays to Firestore for the profile heatmap.
 */

function getLocalDateString() {
    const now = new Date();
    // Convert to UTC+8 (Malaysia Time pattern used in auth.js)
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const localTime = new Date(utc + 8 * 3600000);
    const year = localTime.getFullYear();
    const month = String(localTime.getMonth() + 1).padStart(2, "0");
    const day = String(localTime.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

/**
 * Tracks when a user starts a chapter.
 * Saves to users/{uid}/activity_logs
 */
let isCurrentlyTracking = false;

async function trackChapterPlay(chapterId, chapterName) {
    if (isCurrentlyTracking) return;
    isCurrentlyTracking = true;

    const auth = firebase.auth();
    const db = firebase.firestore();
    
    // Auth might take a moment to resolve on page load
    let user = auth.currentUser;
    if (!user) {
        await new Promise(resolve => {
            const unsubscribe = auth.onAuthStateChanged(u => {
                user = u;
                unsubscribe();
                resolve();
            });
            setTimeout(resolve, 800); // Fail-safe timeout
        });
    }

    if (!user) {
        console.warn("No user logged in. Tracking failed.");
        return;
    }

    const dateStr = getLocalDateString();
    
    try {
        await db.collection("users").doc(user.uid).collection("activity_logs").add({
            chapterId: chapterId,
            chapterName: chapterName,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            dateString: dateStr
        });
        console.log(`Activity Logged: ${chapterName} (${dateStr})`);
    } catch (error) {
        console.error("Error logging activity:", error);
    }
}

/**
 * Increments the total play count for a specific chapter.
 * Saves to users/{uid}/stats/chapterPlays document.
 */
async function recordChapterPlay(chapterId) {
    const auth = firebase.auth();
    const db = firebase.firestore();
    const user = auth.currentUser;
    if (!user) return; // Expecting auth to be handled by the caller or already resolved

    try {
        await db.collection("users").doc(user.uid).collection("stats").doc("chapterPlays").set({
            [chapterId]: firebase.firestore.FieldValue.increment(1)
        }, { merge: true });
        console.log(`Radar Stats: ${chapterId} incremented.`);
    } catch (error) {
        console.error("Error updating radar stats:", error);
    }
}
