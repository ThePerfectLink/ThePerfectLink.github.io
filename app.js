const sections = document.querySelectorAll(".section");
const sectBtns = document.querySelectorAll(".controls");
const sectBtn = document.querySelectorAll(".control");
const sectRtn = document.querySelectorAll(".return");
const sectIcon = document.querySelectorAll(".navicon");
const allSections = document.querySelector(".main-content");

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
            });

            const element = document.getElementById(id);
            element.classList.add('active');
        }
        
    });
    //deactivate
    for(let i = 0; i < sectRtn.length; i++) {
        sectRtn[i].addEventListener('click', function(){
            let currentBtn = document.querySelectorAll('.active-btn');
            currentBtn[0].className = currentBtn[0].className.replace(' active-btn', '');
            sections.forEach((section)=>{
                section.classList.remove('active');
            });
        });
    }
}

PageTransitions();