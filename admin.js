firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// ==========================================
// 🛑 THE ADMIN BOUNCER 🛑
// ==========================================
auth.onAuthStateChanged((user) => {
    if (user) {
        // They are logged in! Check if they have the Admin Key
        db.collection("users").doc(user.uid).get().then((docSnap) => {
            const data = docSnap.exists ? docSnap.data() : {};
            const role = data.profileData ? data.profileData.role : null;
            if (role === "admin") {
                console.log("Admin Access Granted.");
                loadStudentRoster();
            } else {
                // They are a student trying to sneak in!
                alert("Access Denied: Admin Only!");
                window.location.href = "profile.html";
            }
        });
    } else {
        // Not logged in at all
        window.location.href = "login.html";
    }
});

// ==========================================
// 📜 LOAD STUDENT ROSTER 📜
// ==========================================
function loadStudentRoster() {
    const tableBody = document.querySelector("#studentTable tbody");
    const totalStudentsText = document.getElementById("totalStudents");

    // Show a loading message
    tableBody.innerHTML = "<tr><td colspan='5' style='text-align: center;'>Loading Roster...</td></tr>";

    // Fetch the entire 'users' collection from Firestore
    db.collection("users").onSnapshot((querySnapshot) => {
        tableBody.innerHTML = ""; // Clear the table
        let studentCount = 0;

        if (!querySnapshot.empty) {
            querySnapshot.forEach((docSnap) => {
                const uid = docSnap.id;
                const userData = docSnap.data();
                const profile = userData.profileData || {};
                const stats = profile.stats || { level: 1, gems: 0 };

                // Skip drawing this row if the user is an Admin
                if (profile.role === "admin") return;

                studentCount++;

                // 1. Check for custom avatar, otherwise use default placeholder
                const avatarSrc = profile.profileImageUrl || "https://placehold.co/50x50/1c1615/94817a?text=IMG";

                // 2. Check for equipped frame and draw it if it exists
                let frameHTML = "";
                if (profile.equippedFrame && profile.equippedFrame !== "none") {
                    frameHTML = `<img src="${profile.equippedFrame}" style="position: absolute; top: -5px; left: -5px; width: 60px; height: 60px; pointer-events: none;">`;
                }

                // 3. Build the HTML row for this student
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>
                        <div class="mini-avatar-wrapper" style="position: relative;">
                            <img class="mini-photo" src="${avatarSrc}" alt="User">
                            ${frameHTML}
                        </div>
                    </td>
                    <td class="player-name">${profile.displayName || "Unknown Player"}</td>
                    <td class="player-level">Level ${stats.level || 1}</td>
                    <td class="player-gems">${stats.gems || 0} 💎</td>
                    <td>
                        <button class="sm-btn award-btn" onclick="grantXP('${uid}')">Grant XP</button>
                        <button class="sm-btn view-btn">View</button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });
        } else {
            tableBody.innerHTML = "<tr><td colspan='5' style='text-align: center;'>No students found.</td></tr>";
        }

        // Update the quick stats card at the top of the dashboard
        totalStudentsText.textContent = studentCount;
    });
}

// ==========================================
// 🎁 THE "LOOT" SYSTEM (GRANT XP) 🎁
// ==========================================
// We make this global (window.grantXP) so the HTML button can click it
window.grantXP = function(uid) {
    const userRef = db.collection("users").doc(uid);

    userRef.get().then((docSnap) => {
        const data = docSnap.exists ? docSnap.data() : {};
        const currentXP = (data.profileData && data.profileData.stats) ? (data.profileData.stats.xp || 0) : 0;
        const newXP = currentXP + 100; // Give them 100 XP!

        // Save the new XP back to Firestore
        userRef.update({ "profileData.stats.xp": newXP }).then(() => {
            alert("100 XP Granted to student!");
        });
    });
};
