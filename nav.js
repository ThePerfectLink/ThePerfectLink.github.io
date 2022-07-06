var canvas = document.getElementById('ctx');

import './app.js'
import ColorTransition from './app.js';
import './js/OrbitControls.js';

// -- Start initialization of environment --

let starPrimaryColors = [
    "d2fefd", "a0fcfb", "3bfaf6", "d4fdf3", "edffb8", "faffec", "bebfff",
    "e1ebfe", "f3e2ff", "ffdaf9", "ffe27c", "fff8e1", "ffceca", "ffc700"
];
const sunSize = 43;

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.domElement.addEventListener("click", onclick, true);
renderer.setSize(window.innerWidth, window.innerHeight);
canvas.appendChild(renderer.domElement); 

const geometry = new THREE.BoxGeometry(1,1,1);
var material = new THREE.MeshToonMaterial({color: 0x00ff00});

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const center = new THREE.Vector3(0,1,0);

// -- End initialization of environment --
// -- Start class declarations --

class Camera {
    constructor() {
        this.camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 16000);
        this.group = new THREE.Group();
        this.focus;
        this.controls = new THREE.OrbitControls(this.camera, canvas);
        this.controls.enablePan = false;
        this.controls.autoRotate = false;
        this.controls.enableRotate = false;
        this.controls.autoRotateSpeed = 0.5;
        this.controls.maxDistance = 1000;
        this.group.add(this.camera);
        this.controls.update();
        this.setFocus(planets[0]);
    }
    setFocus(planet) {
        this.focus = planet;
        let temp = this.focus.group.children[this.focus.group.children.length-1].matrixWorld.elements;
        let zoom = this.focus.radius;
        this.controls.minDistance = this.focus.radius + 2;
        this.controls.target.set(temp[12], temp[13], temp[14]);
        this.camera.position.set(temp[12]-2*zoom, temp[13]+2*zoom, temp[14]+2*zoom);
    }
    refocus() {
        let temp = this.focus.group.children[this.focus.group.children.length-1].matrixWorld.elements;
        let zoom = this.focus.radius;
        this.controls.target.set(temp[12], temp[13], temp[14]);
        this.camera.position.set(temp[12]-2*zoom, this.camera.position.y, temp[14]+2*zoom); 
    }
}

class Planet {
    constructor(size, vector, color1, color2, rotation) {
        this.baseColor = new THREE.Color(Math.min(color1,color2));
        this.endColor = new THREE.Color(Math.max(color1,color2));
        this.colorDif = this.endColor - this.baseColor;
        this.blockArray = new Array();
        this.colorChange = function() {
            for (let i=0; i<this.blockArray.length; i++) {
                for(let j = 0; j<this.blockArray[i].length; j++) {
                    if( this.blockArray[i][j]) {
                        for(let k = 0; k<this.blockArray[i][j].length; k++) {
                            if(this.blockArray[i][j][k]) {
                                this.blockArray[i][j][k].material.color.set(new THREE.Color().lerpColors(
                                    this.baseColor,this.endColor,((i)+(j)+(k))/(size*3)));
                            }
                        }
                    }
                }
            }
        };
        this.focus = false
        this.radius = size/2;
        this.group = new THREE.Group();
        this.center = getCenter(vector.x, vector.y, vector.z, size);
        this.rotation = rotation;
        for(let i = vector.x; i < size+vector.x; i++) {
            this.blockArray[Math.round(i-vector.x)] = new Array();
            for(let j = vector.y; j < size+vector.y; j++) {
                this.blockArray[Math.round(i-vector.x)][Math.round(j-vector.y)] = new Array();
                for(let k = vector.z; k < size+vector.z; k++) {
                    let tempVecDist = new THREE.Vector3(i,j,k).distanceTo(this.center);
                    if(tempVecDist <= size/2 && tempVecDist > size/2 - 1) { 
                        material = new THREE.MeshToonMaterial({ color: new THREE.Color().lerpColors(
                            this.baseColor,this.endColor,((i-vector.x)+(j-vector.y)+(k-vector.z))/(size*3))
                        });
                        this.blockArray[Math.round(i-vector.x)][Math.round(j-vector.y)][Math.round(k-vector.z)] = new THREE.Mesh(geometry, material);
                        this.blockArray[Math.round(i-vector.x)][Math.round(j-vector.y)][Math.round(k-vector.z)].position.set(i,j,k);
                        this.group.add(this.blockArray[Math.round(i-vector.x)][Math.round(j-vector.y)][Math.round(k-vector.z)]);
                    }
                }
            }
        }
        this.centerBlock = new THREE.Mesh(geometry, material);
        this.centerBlock.position.set(this.center.x,this.center.y,this.center.z);
        this.group.add(this.centerBlock);
        scene.add(this.group);
    }
}



class Star {
    constructor() {
        this.size = Math.ceil(Math.random() * 9 + 1);
        this.baseColor = new THREE.Color();
        this.baseColor.setHex(`0x${starPrimaryColors[Math.floor(Math.random() * starPrimaryColors.length)]}`);
        this.starGeometry = new THREE.BoxGeometry(this.size,this.size,this.size);
        this.baseMaterial = new THREE.MeshBasicMaterial({color: this.baseColor});
        this.star = new THREE.Mesh(this.starGeometry, this.baseMaterial);
        this.pos = new THREE.Vector3(0,0,0);
        this.pos.setFromSphericalCoords(7000,Math.random()*6.28319,Math.random()*6.28319);
        this.star.position.set(this.pos.x,this.pos.y,this.pos.z);
        scene.add(this.star);
    }
}

export default class SceneTransitions {
    static sceneSwitch(planetInt){
        globalCamera.setFocus(planets[planetInt]);
        if(globalCamera.focus == planets[0]) {
            globalCamera.controls.autoRotate=true;
        } else {
            globalCamera.controls.enableRotate=false;
        }
    }

    static colorSwitch(color, id) {
        if(id[0] == "0") {
            if(id[1] == "primary") {
                lights[0].color.setHex(`0x${color.substring(1)}`)
                lights[3].color.setHex(`0x${color.substring(1)}`)
            } else if(id[1] == "secondary") {
                lights[1].color.setHex(`0x${color.substring(1)}`)
                lights[4].color.setHex(`0x${color.substring(1)}`)
            } else {
                lights[2].color.setHex(`0x${color.substring(1)}`)
                lights[5].color.setHex(`0x${color.substring(1)}`)
            }
        } else {
            if(id[1] == "primary") {
                planets[id[0]].baseColor.setHex(`0x${color.substring(1)}`)
                planets[id[0]].colorChange();
            } else {
                planets[id[0]].endColor.setHex(`0x${color.substring(1)}`)
                planets[id[0]].colorChange();
            }
        }
    }
}


// -- End class declarations --
// -- Start initialization of objects --

let planets = [
    new Planet(sunSize, new THREE.Vector3(0,0,0),0xFFFFFF,0xFFFFFF, 0),
    new Planet(sunSize*.24, new THREE.Vector3(100,(sunSize/2)-(sunSize*.24)/2,100),0x02a2ff,0x0224ff, 0.0007),
    new Planet(sunSize*.40, new THREE.Vector3(200,(sunSize/2)-(sunSize*.40)/2,-200),0xff3c19,0xffaf19, 0.0009),
    new Planet(sunSize*.30, new THREE.Vector3(300,(sunSize/2)-(sunSize*.30)/2,-300),0x0dff7a,0x8877f3, 0.00135),
    new Planet(sunSize*.26, new THREE.Vector3(-400,(sunSize/2)-(sunSize*.26)/2,400),0x332288,0x21B899, 0.0004),
    new Planet(sunSize*.20, new THREE.Vector3(550,(sunSize/2)-(sunSize*.20)/2,550),0xEB14DC,0x14EB23, 0.0006)
];

let starArray = new Array(5000);
for(let i = 0; i < starArray.length; i++){
    starArray[i] = new Star();
}

let lights = [
    new THREE.PointLight( 0xfcfa8c, .31, 1600, 4),
    new THREE.PointLight( 0xffb21b, .38, 1600, 4),
    new THREE.PointLight( 0xff5e48, .31, 1600, 4),
    new THREE.PointLight( 0xffb21b, .38, 1600, 4),
    new THREE.PointLight( 0xfcfa8c, .31, 1600, 4),
    new THREE.PointLight( 0xff5e48, .38, 1600, 4)
];

lights[0].position.set( 0, 0, 23 );
lights[1].position.set( 0, 0, -23 );
lights[2].position.set( 23, 0, 0 );
lights[3].position.set( -23, 0, 0 );
lights[4].position.set( 0, 23, 0 );
lights[5].position.set( 0, -23, 0 );
for(let i = 0; i < lights.length; i++) {
    lights[i].shadow.far = 1000;
    scene.add( lights[i] );
}

let globalCamera = new Camera();

// -- End initialization of objects --


function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const needResize = canvas.width != width || canvas.height != height;
    if (needResize) {
        renderer.setSize(width, height, false);
    }
    return needResize;
}

function getCenter(x,y,z,size) {
    return new THREE.Vector3(x + size/2 , y + size/2 , z + size/2);
}

function animate() {
    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        globalCamera.camera.aspect = canvas.width / canvas.height;
        globalCamera.camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight)
    }
    planets.forEach(element => {
        element.group.rotateOnAxis(center,element.rotation);
    });
    lights.forEach(element => {
        let heatDeath = Math.random();
        if(Math.round(heatDeath) && element.color.b > 0 && element.color.g > 0) {
            if(heatDeath < .9)
                element.color.b -= 0.001;
            else 
                element.color.g -= 0.001;
            element.intensity -= 0.0001;
            element.decay += .001;
        } else if (element.color.b < 1 && element.color.g < 1) {
            if(heatDeath < .1)
                element.color.g += 0.001;
            else 
                element.color.b += 0.001;
            element.intensity += 0.0001;
            element.decay -= .001;
        }
    });
    if(globalCamera.focus != planets[0]) {
        globalCamera.refocus();
    }
    globalCamera.controls.update();
    renderer.render(scene, globalCamera.camera);
    requestAnimationFrame(animate);
};

window.addEventListener( 'mousedown', event => {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, globalCamera.camera);
    var intersects = raycaster.intersectObjects(scene.children, true);
    if(intersects.length > 0) {
        let closest = 0;
        let close = new THREE.Vector3(planets[0].centerBlock.matrixWorld.elements[12],planets[0].centerBlock.matrixWorld.elements[13],planets[0].centerBlock.matrixWorld.elements[14]);
        for(let i = 1; i < planets.length; i++) {
            let temp = new THREE.Vector3(planets[i].centerBlock.matrixWorld.elements[12],planets[i].centerBlock.matrixWorld.elements[13],planets[i].centerBlock.matrixWorld.elements[14]);
            if(intersects[0].point.distanceTo(temp) < close.distanceTo(intersects[0].point)) {
                closest = i;
                close = temp;
            }
        }
        globalCamera.setFocus(planets[closest]);
        ColorTransition(closest);
        if(globalCamera.focus == planets[0]) {
            globalCamera.controls.autoRotate=true;
        } else {
            globalCamera.controls.enableRotate=false;
        }
        
    }
} );
window.requestAnimationFrame(animate);