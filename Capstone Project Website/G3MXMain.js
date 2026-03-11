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

const comingPlanets = document.querySelectorAll(".forest, .desert, .stone");

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