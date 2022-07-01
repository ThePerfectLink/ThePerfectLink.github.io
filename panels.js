let profession = document.querySelector(".profession");
const professions = ["game designer", "backend developer", "frontend developer", "cool dude 👉😎👉",
"game developer", "philosopher", "programmer", "good looking guy"];
let professionNum = 0;
var slider = document.querySelectorAll(".value");
output.innerHTML = slider.value;

function transition() {
    profession.innerHTML = professions[professionNum%professions.length];
    professionNum++;
}

slider.oninput = function() {
    for(let i = 0; i < slider.length; i++) {
        value[i].value = innerHTMLslider[i].value
    }
}

setInterval(transition, 2500);