var canvas = document.getElementById('ctx');
import './js/OrbitControls.js';


const sunSize = 41;
let time=0;

const scene = new THREE.Scene();

let starPrimaryColors = [
    "d2fefd", "a0fcfb", "3bfaf6", "d4fdf3", "edffb8", "faffec", "bebfff",
    "e1ebfe", "f3e2ff", "ffdaf9", "ffe27c", "fff8e1", "ffceca", "ffc700"
];

const renderer = new THREE.WebGLRenderer();
renderer.domElement.addEventListener("click", onclick, true);
renderer.setSize(window.innerWidth, window.innerHeight);
canvas.appendChild(renderer.domElement); 

const geometry = new THREE.BoxGeometry();
var material = new THREE.MeshToonMaterial({color: 0x00ff00});

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const center = new THREE.Vector3(0,1,0);

class Camera {
    constructor(planet) {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 20000);
        this.group = new THREE.Group();
        this.focus = planet;
        this.controls = new THREE.OrbitControls(this.camera, canvas);
        this.controls.enablePan = false;
        this.controls.enableRotate = false;
        this.controls.maxDistance = 1000;
        this.group.add(this.camera);
        this.controls.update();
        
    }
    setFocus(planet) {
        this.focus = planet;
        this.refocus();
    }
    refocus() {
        let temp = this.focus.group.children[this.focus.group.children.length-1].matrixWorld.elements;
        let zoom = this.focus.radius;
        this.camera.position.set(temp[12]-2*zoom, this.camera.position.y, temp[14]+2*zoom);
        this.controls.target.set(temp[12], temp[13], temp[14]);
    }
}

class Planet {
    constructor(size, vector, color1, color2, rotation) {
        this.baseColor = new THREE.Color(Math.min(color1,color2));
        this.endColor = new THREE.Color(Math.max(color1,color2));
        this.colorDif = this.endColor - this.baseColor;
        this.blockArray = new Array();
        this.focus = false
        this.radius = size/2;
        this.group = new THREE.Group();
        this.center = getCenter(vector.x, vector.y, vector.z, size);
        this.rotation = rotation;
        for(let i = vector.x; i < size+vector.x; i++) {
            this.blockArray[i] = new Array();
            for(let j = vector.y; j < size+vector.y; j++) {
                this.blockArray[i][j] = new Array();
                for(let k = vector.z; k < size+vector.z; k++) {
                    let tempVecDist = new THREE.Vector3(i,j,k).distanceTo(this.center);
                    if(tempVecDist <= size/2 && tempVecDist > size/2 - 1) { 
                        material = new THREE.MeshToonMaterial({ color: new THREE.Color().lerpColors(
                            this.baseColor,this.endColor,((i-vector.x)+(j-vector.y)+(k-vector.z))/(size*3))
                        });
                        this.blockArray[i][j][k] = new THREE.Mesh(geometry, material);
                        this.blockArray[i][j][k].position.set(i,j,k);
                        this.group.add(this.blockArray[i][j][k]);
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
        this.size = Math.ceil(Math.random() * 5 + 1);
        this.baseColor = new THREE.Color();
        this.baseColor.setHex(`0x${starPrimaryColors[Math.floor(Math.random() * starPrimaryColors.length)]}`);
        this.starGeometry = new THREE.BoxGeometry(this.size,this.size,this.size);
        this.baseMaterial = new THREE.MeshBasicMaterial({color: this.baseColor});
        this.star = new THREE.Mesh(this.starGeometry, this.baseMaterial);
        this.pos = new THREE.Vector3(0,0,0);
        this.pos.setFromSphericalCoords(5000,Math.random()*6.28319,Math.random()*6.28319);
        this.star.position.set(this.pos.x,this.pos.y,this.pos.z);
        scene.add(this.star);
    }
}

let planets = [
    new Planet(sunSize, new THREE.Vector3(0,0,0),0xF6F890,0xF8C690, 0),
    new Planet(sunSize*.43, new THREE.Vector3(100,(sunSize/2)-(sunSize*.23)/2,100),0x02a2ff,0x0224ff, 0.0007),
    new Planet(sunSize*.36, new THREE.Vector3(200,(sunSize/2)-(sunSize*.41)/2,200),0xff3c19,0xffaf19, 0.0009),
    new Planet(sunSize*.55, new THREE.Vector3(300,(sunSize/2)-(sunSize*.55)/2,300),0x0dff7a,0x8877f3, 0.00135),
    new Planet(sunSize*.73, new THREE.Vector3(400,(sunSize/2)-(sunSize*.73)/2,400),0x332288,0x21B899, 0.0004),
    new Planet(sunSize*.37, new THREE.Vector3(550,(sunSize/2)-(sunSize*.37)/2,550),0xEB14DC,0x14EB23, 0.0006)
];

let globalCamera = new Camera(planets[0]);
globalCamera.setFocus(planets[0]);

let starArray = new Array(5000);
for(let i = 0; i < starArray.length; i++){
    starArray[i] = new Star();
}

const lightside = new THREE.PointLight( 0xffff80, .3, 1000 );
const lightside2 = new THREE.PointLight( 0xffff80, .3, 1000 );
const lightside3 = new THREE.PointLight( 0xffff80, .3, 1000 );
const lightside4 = new THREE.PointLight( 0xffff80, .3, 1000 );
const lightside5 = new THREE.PointLight( 0xffff80, .3, 1000 );
const lightside6 = new THREE.PointLight( 0xffff80, .3, 1000 );
lightside.position.set( 0, 0, 23 );
lightside2.position.set( 0, 0, -23 );
scene.add( lightside );
scene.add( lightside2 );
lightside3.position.set( 23, 0, 0 );
lightside4.position.set( -23, 0, 0 );
scene.add( lightside3 );
scene.add( lightside4 );
lightside5.position.set( 0, 23, 0 );
lightside6.position.set( 0, -23, 0 );
scene.add( lightside5 );
scene.add( lightside6 );


function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
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
        globalCamera.camera.aspect = canvas.clientWidth / canvas.clientHeight;
        globalCamera.camera.updateProjectionMatrix();
    }
    planets.forEach(element => {
        element.group.rotateOnAxis(center,element.rotation);
    });
    globalCamera.refocus();
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
    }
} );
window.requestAnimationFrame(animate);