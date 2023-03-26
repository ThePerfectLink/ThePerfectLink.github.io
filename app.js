import SceneTransitions from './nav.js';


const sections = document.querySelectorAll(".section");
const sectBtns = document.querySelectorAll(".controls");
const sectBtn = document.querySelectorAll(".control");
const sectRtn = document.querySelectorAll(".fa-angle-down");
const sectExp = document.querySelectorAll(".fa-angle-up");
const sectIcon = document.querySelectorAll(".navicon");
const allSections = document.querySelector(".main-content");
const colorRtn = document.querySelectorAll(".returnUpwards");
const allColorPickers = document.querySelectorAll(".colorPicker");

function PageTransitions(){
    //button click
    for(let i = 0; i < sectBtn.length; i++) {

        sectBtn[i].addEventListener('click', function(){
            let currentBtn = document.querySelectorAll('.active-btn');
            this.className += ' active-btn';
            if(currentBtn[0] == undefined){
            } else {
                currentBtn[0].className = currentBtn[0].className.replace(' active-btn', '');
            }
            
        });

        sectIcon[i].addEventListener('click', function(){
            let currentBtn = document.querySelectorAll('.active-btn');
            this.className += ' active-btn';
            if(currentBtn[0] == undefined){
            } else {
                currentBtn[0].className = currentBtn[0].className.replace(' active-btn', '');
            }
        });
    }

    //Activate sections
    allSections.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        if(id) {
            //remove selected from other button
            sectBtns.forEach((btn) => {
                btn.classList.remove('active');
            });
            //e.target.classList.add('active');

            //hide other sections
            sections.forEach((section)=>{
                section.classList.remove('active');
                section.classList.remove('expanded');
            });

            const element = document.getElementById(id);
            element.classList.add('active');
            SceneTransitions.sceneSwitch(element.classList[3]);
        }
        
    });
    //Expand sections

    for(let i = 0; i < sectExp.length; i++) {
        sectExp[i].addEventListener('click', function(){
            sectExp[i].parentElement.parentElement.classList.add('expanded');
        });
    }

    //deactivate content
    for(let i = 0; i < sectRtn.length; i++) {
        sectRtn[i].addEventListener('click', function(){
            let currentBtn = document.querySelectorAll('.active-btn');
            if(currentBtn[0])
                currentBtn[0].className = currentBtn[0].className.replace(' active-btn', '');
            else
            SceneTransitions.sceneSwitch(0);
            sections.forEach((section)=>{
                section.classList.remove('active');
                section.classList.remove('expanded');
            });
        });
    }
}

function ColorTransitions() {

        //deactivate color
        for(let i = 0; i < colorRtn.length; i++) {
            colorRtn[i].addEventListener('click', function(){
                let currentBtn = document.querySelectorAll('.active-btnUp');
                currentBtn[0].className = currentBtn[0].className.replace(' active-btnUp', '');
                let currentBox = document.querySelectorAll('.activeUp');
                if(currentBox[0] == undefined){
                } else {
                    currentBox[0].className = currentBox[0].className.replace(' activeUp', '');
                }
            });
        }
}

export default function ColorTransition(id) {
    //Activate colors
    colorRtn.forEach(function(current) {
        current.classList.remove('active-btnUp');
    });
    allColorPickers.forEach(function(current) {
        current.classList.remove('activeUp');
    });
    colorRtn[id].classList.add("active-btnUp");
    allColorPickers[id].classList.add("activeUp");
}

PageTransitions();
ColorTransitions();
