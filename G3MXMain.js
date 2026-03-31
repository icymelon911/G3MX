const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let stars = [];

for (let i = 0; i < 250; i++) {
    stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 2,
    speed: Math.random() * 0.6
    });
}

function drawStars(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.imageSmoothingEnabled = false;

    stars.forEach(star=>{
    ctx.fillRect(
    Math.round(star.x),
    Math.round(star.y),
    Math.ceil(star.radius*2),
    Math.ceil(star.radius*2)
    );

    star.y += star.speed * star.radius;

    if(star.y>canvas.height){
        star.y=0;
        }

    });

    requestAnimationFrame(drawStars);
}

drawStars();

const planet = document.getElementById("itPlanet");
const container = document.querySelector(".planet-container");
const fade = document.getElementById("screenFade");

planet.addEventListener("click", () => {

const rect = planet.getBoundingClientRect();

const planetCenterX = rect.left + rect.width / 2;
const planetCenterY = rect.top + rect.height / 2;

const screenCenterX = window.innerWidth / 2;
const screenCenterY = window.innerHeight / 2;

const offsetX = (screenCenterX - planetCenterX) * 0.2;
const offsetY = screenCenterY - planetCenterY + 50;

container.style.transform =
`translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px)) scale(2)`;

const starsCanvas = document.getElementById("stars");
starsCanvas.classList.add("warp-speed");

setTimeout(()=>{
fade.classList.add("active");
},1400);

setTimeout(()=>{
window.location.href = "MainMenu.html";
},3200);

});

const popup = document.getElementById("comingSoonPopup");
const closeBtn = document.getElementById("closePopup");
const okBtn = document.getElementById("popupOk");

const comingPlanets = document.querySelectorAll(".forest, .business, .stone");

let popupTimer;

comingPlanets.forEach(planet=>{
planet.addEventListener("click", ()=>{

popup.classList.add("active");

popupTimer = setTimeout(()=>{
popup.classList.remove("active");
},10000);

});
});

function closePopup(){
popup.classList.remove("active");
clearTimeout(popupTimer);
}

closeBtn.addEventListener("click", closePopup);
okBtn.addEventListener("click", closePopup);

const profileBtn = document.getElementById("headerProfileBtn");
const profileDropdown = document.getElementById("headerProfileDropdown");
const logoutBtnMain = document.getElementById("logoutBtnMain");
const logoutPopup = document.getElementById("logoutPopup");

const closeLogout = document.getElementById("closeLogout");
const confirmLogout = document.getElementById("confirmLogout");
const cancelLogout = document.getElementById("cancelLogout");

if (profileBtn) {
    profileBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle("show");
    });
}

window.addEventListener("click", (e) => {
    if (profileDropdown && profileDropdown.classList.contains("show")) {
        if (!e.target.closest(".profile-menu-container")) {
            profileDropdown.classList.remove("show");
        }
    }
});

if (logoutBtnMain) {
    logoutBtnMain.addEventListener("click", () => {
        profileDropdown.classList.remove("show");
        logoutPopup.classList.add("active");
    });
}

function closeLogoutPopup() {
    logoutPopup.classList.remove("active");
}

closeLogout.addEventListener("click", closeLogoutPopup);
cancelLogout.addEventListener("click", closeLogoutPopup);

if (confirmLogout) {
    confirmLogout.addEventListener("click", () => {
        firebase.auth().signOut().then(() => {
            console.log("Main Menu: User logged out successfully.");
            // Redirect will be handled by onAuthStateChanged in the HTML
        }).catch((error) => {
            console.error("Main Menu: Logout failed", error);
            alert("Error logging out! Please try again.");
        });
    });
}

// --- Side Nav Toggle (Mobile) ---
const sideNavToggle = document.getElementById("sideNavToggle");
const sideNav = document.getElementById("sideNav");

if (sideNavToggle && sideNav) {
    sideNavToggle.addEventListener("click", () => {
        sideNav.classList.toggle("active");
        // Change icon based on state
        const icon = sideNavToggle.querySelector("i");
        if (sideNav.classList.contains("active")) {
            icon.classList.remove("fa-bars");
            icon.classList.add("fa-times");
        } else {
            icon.classList.remove("fa-times");
            icon.classList.add("fa-bars");
        }
    });

    // Close menu when clicking outside
    window.addEventListener("click", (e) => {
        if (sideNav.classList.contains("active")) {
            if (!e.target.closest(".side-left") && !e.target.closest(".side-nav-toggle")) {
                sideNav.classList.remove("active");
                const icon = sideNavToggle.querySelector("i");
                icon.classList.remove("fa-times");
                icon.classList.add("fa-bars");
            }
        }
    });
}

