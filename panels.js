import SceneTransitions from './nav.js';

var profession = document.querySelector(".profession");
const professions = ["game designer", "backend developer", "frontend developer",
"game developer", "philosopher", "programmer"];
var professionNum = 0;
var professionTxt = document.getElementsByClassName('profession')[0];
var slider = document.querySelectorAll(".color");
var resets = document.querySelectorAll(".reset");
var colors = [];

function transitionIn() {
    professionTxt.classList.remove('inactiveProf');
    profession.innerHTML = professions[professionNum%professions.length];
    professionTxt.classList.add('activeProf');
    professionNum++;
}

function transitionOut() {
    professionTxt.classList.remove('activeProf');
    professionTxt.classList.add('inactiveProf');  
}

function colorChange(e) {
    SceneTransitions.colorSwitch(e.target.value, e.target.classList);
}

function resetColor(e) {
    let color;
    if(e.target.classList[0] == 0) {
        if(e.target.classList[1] == "primary") {
            color = 0;
        } else if (e.target.classList[1] == "secondary"){
            color = 1;
        } else {
            color = 2;
        }
    } else {
        if(e.target.classList[1] == "primary") {
            color = 2 * e.target.classList[0] + 1;
        } else {
            color = 2 * e.target.classList[0] + 2;
        }
    }
    slider[color].value = colors[color];
    SceneTransitions.colorSwitch(colors[color], e.target.classList);
}

// slider.oninput = function() {
//     for(let i = 0; i < slider.length; i++) {
//         value[i].value = innerHTMLslider[i].value
//     }
// }

slider.forEach(function(currentBtn) {
    currentBtn.addEventListener('input', colorChange)
    colors.push(currentBtn.value);
})

resets.forEach(function(currentBtn) {
    currentBtn.addEventListener('click', resetColor)
})

setInterval(transitionIn, 2400);
setTimeout(function() {
    setInterval(transitionOut, 2400);
    console.log("hey");
}, 1200);