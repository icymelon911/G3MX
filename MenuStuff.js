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

(function () {
    const snowflakeCanvas = document.getElementById("snowflakes");
    if (!snowflakeCanvas) return;
    const sCtx = snowflakeCanvas.getContext("2d");
    snowflakeCanvas.width = window.innerWidth;
    snowflakeCanvas.height = window.innerHeight;

    const flakes = [];
    for (let i = 0; i < 220; i++) {
        flakes.push({
            x: Math.random() * snowflakeCanvas.width,
            y: Math.random() * snowflakeCanvas.height,
            r: Math.random() * 1.5,
            s: Math.random() * 0.5 + 0.2 // Slightly faster than background stars
        });
    }

    function drawSnowflakes() {
        sCtx.clearRect(0, 0, snowflakeCanvas.width, snowflakeCanvas.height);
        sCtx.fillStyle = "#ffffff";
        flakes.forEach(f => {
            sCtx.fillRect(
                Math.round(f.x),
                Math.round(f.y),
                Math.ceil(f.r * 2),
                Math.ceil(f.r * 2)
            );
            f.y += f.s;
            if (f.y > snowflakeCanvas.height) {
                f.y = -5;
                f.x = Math.random() * snowflakeCanvas.width;
            }
        });
        requestAnimationFrame(drawSnowflakes);
    }

    drawSnowflakes();

    // Reset canvas dimensions on resize
    window.addEventListener('resize', () => {
        snowflakeCanvas.width = window.innerWidth;
        snowflakeCanvas.height = window.innerHeight;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
})();

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

function showUnavailablePopup() {
    document.getElementById("unavailablePopup").style.display = "flex";
}

function closePopup() {
    document.getElementById("unavailablePopup").style.display = "none";
}