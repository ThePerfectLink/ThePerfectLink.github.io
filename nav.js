var canvas = document.getElementById('ctx');

import './app.js'
import ColorTransition from './app.js';
import './js/OrbitControls.js';

// -- Start initialization of environment --

let starPrimaryColors = [
    "d2fefd", "a0fcfb", "3bfaf6", "d4fdf3", "edffb8", "faffec", "bebfff",
    "e1ebfe", "f3e2ff", "ffdaf9", "ffe27c", "fff8e1", "ffceca", "ffc700"
];
const sunSize = 61;

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.premultipliedAlpha =false;
renderer.stencil = false;
const transparentColor =  new THREE.Color(0xFF000000);
renderer.domElement.addEventListener("click", onclick, true);
renderer.setSize(window.innerWidth, window.innerHeight);
canvas.appendChild(renderer.domElement); 

const geometry = new THREE.BoxGeometry(1,1,1);
var material = new THREE.MeshToonMaterial();

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const center = new THREE.Vector3(0,1,0);

// -- End initialization of environment --
// -- Start class declarations --

class Camera {
    constructor() {
        this.camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 3, 10000);
        this.group = new THREE.Group();
        this.focus;
        this.pos = new THREE.Vector3();
        this.controls = new THREE.OrbitControls(this.camera, canvas);
        this.controls.enablePan = false;
        this.controls.autoRotate=true;
        this.controls.enableRotate = false;
        this.controls.autoRotateSpeed = 0.5;
        this.controls.maxDistance = 1000;
        this.group.add(this.camera);
        this.controls.update();
        this.setFocus(star);
    }
    setFocus(planet) {
        this.focus = planet;
        //this.pos = this.getMiddle(this.focus);
        this.pos = planet.instanceArray.matrixWorld.elements;
        let zoom = this.focus.radius;
        this.controls.minDistance = this.focus.radius + 2;
        this.controls.target.set(this.pos[12], this.pos[13], this.pos[14]);
        this.camera.position.set(this.pos[12]-2*zoom, this.pos[13]+2*zoom, this.pos[14]+2*zoom);
    }
    refocus() {
        //this.pos = this.getMiddle(this.focus);
        this.pos = this.focus.instanceArray.matrixWorld.elements;
        let zoom = this.focus.radius;
        this.controls.target.set(this.pos[12], this.pos[13], this.pos[14]);
        this.camera.position.set(this.pos[12]-2*zoom, this.camera.position.y, this.pos[14]+2*zoom); 
    }

    getMiddle(planet) {
        var geometry = planet.instanceArray.geometry.center();
        var center = planet.instanceArray.position;
        geometry.computeBoundingSphere();
        geometry.boundingBox.getCenter( center ); 
        planet.instanceArray.localToWorld( center );
        return center;
    }
}

class Body {
    constructor(size, vector, rotation) {
        this.instanceArray = new THREE.InstancedMesh(geometry, material, size*size*size);
        this.radius = size/2;
        this.center = vector;
        this.rotation = rotation;
        this.dummyBlock = new THREE.Object3D();
        this.instanceArray.position.set(vector.x, vector.y, vector.z);
    }
}

class Sun extends Body {
    constructor(size, vector, color1, rotation) {
        super(size, vector, rotation);
        for(let i = -size, l =  0; i < size; i++) {
            for(let j = -size; j < size; j++) {
                for(let k = -size; k < size; k++) {
                    let tempVecDist = new THREE.Vector3(i+vector.x,j+vector.y,k+vector.z).distanceTo(this.instanceArray.position);
                    if(tempVecDist <= this.radius && tempVecDist > this.radius - 1) { 
                        this.dummyBlock.position.set(i,j,k);
                        this.dummyBlock.updateMatrix();
                        this.instanceArray.setMatrixAt(l, this.dummyBlock.matrix);
                        this.instanceArray.setColorAt(l, new THREE.Color(color1));
                        l++;
                    }
                }
            }
        }
        scene.add(this.instanceArray);
    }
}

class Planet extends Body {
    constructor(size, vector, color1, color2, rotation, orbitSpeed, orbitTarget) {
        super(size, vector, rotation);
        this.baseColor = new THREE.Color(Math.min(color1,color2));
        this.endColor = new THREE.Color(Math.max(color1,color2));
        this.orbit = new THREE.Object3D();
        orbitTarget.instanceArray.add(this.orbit);
        this.orbitSpeed = orbitSpeed;
        this.dummyBlock = new THREE.Object3D();
        this.instanceArray.position.set(vector.x, vector.y, vector.z);
        for(let i = -size, l=0; i < size; i++) {
            for(let j = -size; j < size; j++) {
                for(let k = -size; k < size; k++) {
                    let tempVecDist = new THREE.Vector3(i+vector.x,j+vector.y,k+vector.z).distanceTo(this.instanceArray.position);
                    if(tempVecDist <= this.radius && tempVecDist > this.radius - 1) { 
                        this.dummyBlock.position.set(i,j,k);
                        this.dummyBlock.updateMatrix();
                        this.instanceArray.setMatrixAt(l, this.dummyBlock.matrix);
                        this.instanceArray.setColorAt(l, new THREE.Color().lerpColors(
                            this.baseColor,this.endColor,((i)+(j)+(k))/(size*3)));
                        l++;
                    }
                }
            }
        }
        this.orbit.add(this.instanceArray);
        this.colorChange = function() {
            for (let i = -size, l=0; i<size; i++) {
                for(let j = -size; j<size; j++) {
                    for(let k = -size; k<size; k++) {
                        let tempVecDist = new THREE.Vector3(i+vector.x,j+vector.y,k+vector.z).distanceTo(this.instanceArray.position);
                        if(tempVecDist <= this.radius && tempVecDist > this.radius - 1) {
                            this.instanceArray.setColorAt(l, new THREE.Color().lerpColors(
                                this.baseColor,this.endColor,((i)+(j)+(k))/(size*3)));
                            l++;
                        }
                    }
                }
            }
            this.instanceArray.instanceColor.needsUpdate = true;
        };
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
        if(planetInt == 0) {
            globalCamera.setFocus(star);
        } else {
            globalCamera.setFocus(planets[parseInt(planetInt-1)]);
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
                planets[id[0]-1].baseColor.setHex(`0x${color.substring(1)}`)
                planets[id[0]-1].colorChange();
            } else {
                planets[id[0]-1].endColor.setHex(`0x${color.substring(1)}`)
                planets[id[0]-1].colorChange();
            }
        }
    }
}


// -- End class declarations --
// -- Start initialization of objects --

let lights = [
    new THREE.PointLight( 0xffffff, .31, sunSize*16, 4),
    new THREE.PointLight( 0xffffff, .38, sunSize*16, 4),
    new THREE.PointLight( 0xffffff, .31, sunSize*16, 4),
    new THREE.PointLight( 0xffffff, .38, sunSize*16, 4),
    new THREE.PointLight( 0xffffff, .31, sunSize*16, 4),
    new THREE.PointLight( 0xffffff, .38, sunSize*16, 4)
];

lights[0].position.set( sunSize, 0, sunSize );
lights[1].position.set( sunSize, 0, -sunSize );
lights[2].position.set( sunSize, 0, sunSize );
lights[3].position.set( -sunSize, 0, sunSize );
lights[4].position.set( sunSize, 23, sunSize );
lights[5].position.set( sunSize, -23, sunSize );
for(let i = 0; i < lights.length; i++) {
    lights[i].castShadow=false;
    lights[i].shadow.far = 1000;
    scene.add( lights[i] );
}

let star =  new Sun(sunSize, new THREE.Vector3(0,1,0),0xFFFF00, 0.00001);
let planets = [
    new Planet(sunSize*.15, new THREE.Vector3(sunSize*1.25,0,sunSize*1.25),0x0224ff,0x02a2ff, 0.01, 0.0009, star),
    new Planet(sunSize*.30, new THREE.Vector3(sunSize*2.5,0,-sunSize*2.5),0xff3c19,0xffaf19, 0.0089, 0.0008, star),
    new Planet(sunSize*.27, new THREE.Vector3(-sunSize*3.75,0,sunSize*3.75),0x0dff7a,0x8877f3, 0.0021, 0.0007, star),
    new Planet(sunSize*.18, new THREE.Vector3(sunSize*5,0,-sunSize*5),0x21B899,0x332288, 0.0041, 0.0005, star),
    new Planet(sunSize*.21, new THREE.Vector3(-sunSize*5.75,0,-sunSize*5.75),0x14EB23,0xEB14DC, 0.00012, 0.00045, star)
];

let starArray = new Array(5000);
for(let i = 0; i < starArray.length; i++){
    starArray[i] = new Star();
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
        element.instanceArray.rotateOnAxis(center, element.rotation);
        element.orbit.rotation.y += element.orbitSpeed;
    });
    if(globalCamera.focus != star) {
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
        let closest = -1;
        let close = new THREE.Vector3(star.instanceArray.matrixWorld.elements[12],star.instanceArray.matrixWorld.elements[13],star.instanceArray.matrixWorld.elements[14]);
        for(let i = 0; i < planets.length; i++) {
            let temp = new THREE.Vector3(planets[i].instanceArray.matrixWorld.elements[12],planets[i].instanceArray.matrixWorld.elements[13],planets[i].instanceArray.matrixWorld.elements[14]);
            if(intersects[0].point.distanceTo(temp) < close.distanceTo(intersects[0].point)) {
                closest = i;
                close = temp;
            }
        }
        if(closest == -1) {
            globalCamera.setFocus(star);
        } else {
            globalCamera.setFocus(planets[closest]);
            
        }
        ColorTransition(closest+1);
        
    }
} );
window.requestAnimationFrame(animate);