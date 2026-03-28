const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let stars = [];

for (let i = 0; i < 150; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1, 
        speed: Math.random() * 0.4
    });
}

function animateStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";

    stars.forEach(star => {
        ctx.fillRect(
            Math.round(star.x), 
            Math.round(star.y), 
            Math.round(star.size), 
            Math.round(star.size)
        );

        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    });

    requestAnimationFrame(animateStars);
}

animateStars();

function enterChapter(chapter) {
    const fade = document.getElementById("screenFade");
    fade.classList.add("active");

    setTimeout(() => {
        window.location.href = "Chapter" + chapter + ".html";
    }, 1000);
}

document.addEventListener("click", () => {
    const music = document.getElementById("bgMusic");
    if (music.paused) {
        music.play();
    }
}, { once: true });

const back = document.getElementById("backBtn");
const fade = document.getElementById("screenFade");

back.addEventListener("click", () => {
    fade.classList.add("active");
    setTimeout(()=>{
        window.location.href = "G3MXMain.html";
    },1000);
});
