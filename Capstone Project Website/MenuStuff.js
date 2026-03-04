// ===== STAR BACKGROUND =====
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
        speed: Math.random() * 0.5
    });
}

function animateStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(255,255,255,0.8)";

    stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();

        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    });

    requestAnimationFrame(animateStars);
}

animateStars();

// ===== CLICK TRANSITION =====
function enterChapter(chapter) {
    document.body.style.transition = "1s";
    document.body.style.opacity = "0";

    setTimeout(() => {
        window.location.href = "Chapter" + chapter + ".html";
    }, 1000);
}

// ===== FIX MUSIC AUTOPLAY =====
document.addEventListener("click", () => {
    const music = document.getElementById("bgMusic");
    music.play();
});

function shakeLocked(element) {
    element.classList.remove("shake");

    // Force reflow so animation can replay
    void element.offsetWidth;

    element.classList.add("shake");
}