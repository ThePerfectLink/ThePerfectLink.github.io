var canvas = document.getElementById('ctx');
import './js/OrbitControls.js';

const sunSize = 31;
let time;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 20000);
camera.position.set(sunSize, sunSize, sunSize);
const controls = new THREE.OrbitControls(camera, canvas);
controls.update();

const renderer = new THREE.WebGLRenderer();
renderer.domElement.addEventListener("click", onclick, true);
renderer.setSize(window.innerWidth, window.innerHeight);
canvas.appendChild(renderer.domElement); 

const geometry = new THREE.BoxGeometry();
var material = new THREE.MeshBasicMaterial({color: 0x00ff00});

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

class Planet {
    constructor(size, vector, color1, color2) {
        this.baseColor = new THREE.Color(Math.min(color1,color2));
        this.endColor = new THREE.Color(Math.max(color1,color2));
        this.colorDif = this.endColor - this.baseColor;
        this.blockArray = new Array();
        this.type = 'Planet';
        this.radius = size/2;
        this.group = new THREE.Group();
        this.center = new THREE.Vector3(vector.x + size/2 , vector.y + size/2 , vector.z + size/2);
        for(let i = vector.x; i < size+vector.x; i++) {
            this.blockArray[i] = new Array();
            for(let j = vector.y; j < size+vector.y; j++) {
                this.blockArray[i][j] = new Array();
                for(let k = vector.z; k < size+vector.z; k++) {
                    let tempVecDist = new THREE.Vector3(i,j,k).distanceTo(this.center);
                    if(tempVecDist <= size/2 && tempVecDist > size/2 - 1) { 
                            material = new THREE.MeshBasicMaterial({ color: new THREE.Color().lerpColors(
                                this.baseColor,this.endColor,((i-vector.x)+(j-vector.y)+(k-vector.z))/(size*3)
                            )
                        });
                        this.blockArray[i][j][k] = new THREE.Mesh(geometry, material);
                        this.blockArray[i][j][k].position.set(i,j,k);
                        this.group.add(this.blockArray[i][j][k]);
                        //scene.add(this.blockArray[i][j][k]);
                    }
                }
            }
        }
        scene.add(this.group);
    }
}

class Star {
    constructor() {
        int
    }
}

let planets = [
    new Planet(sunSize, new THREE.Vector3(0,0,0),0xF6F890,0xF8C690),
    new Planet(17, new THREE.Vector3(100,0,120),0x02a2ff,0x0224ff),
    new Planet(25, new THREE.Vector3(220,0,300),0xff3c19,0xffaf19),
    new Planet(15, new THREE.Vector3(400,0,500),0x0dff7a,0x0dfff3),
    new Planet(13, new THREE.Vector3(600,0,820),0x5AB847,0x47B86C),
    new Planet(11, new THREE.Vector3(900,0,500),0xEB14DC,0x14EB23),
];
controls.target.set(0,0,0);

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

function animate() {
    time++;
    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }
    document.onmousedown = resetTimer;
    // if(time > 300) {
    //     controls.autoRotate = true;
    // }
    function resetTimer() {
        controls.autoRotate = false;
        time = 0
    }
    planets.forEach(element => {
        element.group.rotateOnAxis(planets[0].center,Math.random() * (0.001-0.0001) + 0.0001);
    });
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
};

window.addEventListener( 'mousedown', event => {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(scene.children, true);
    if(intersects.length > 0) {
        let closest = 0;
        for(let i = 1; i < planets.length; i++) {
            if(intersects[0].point.distanceTo(planets[i].center) < planets[closest].center.distanceTo(intersects[0].point)) {
                closest = i;
            }
        }
        camera.position.set(planets[closest].center.x + planets[closest].radius,
            planets[closest].center.y + planets[closest].radius, planets[closest].center.z + planets[closest].radius);
        controls.target.set(planets[closest].center.x,planets[closest].center.y,planets[closest].center.z);
    }
} );
window.requestAnimationFrame(animate);