import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

console.log('hello');
console.log(data);

const canvasWidth = 500;
const canvasHeight = 500;

var discGolfData = data;
console.log(discGolfData[0]);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

//create a blue LineBasicMaterial
const material = new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth: 1500, fog: false });

const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );

const controls = new OrbitControls( camera, renderer.domElement );

// const camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 1, 500);
camera.position.set(0, canvasWidth / 2, 300);
camera.lookAt(0, canvasHeight / 2, 0);

controls.update();

function animate() {

	requestAnimationFrame( animate );

	// required if controls.enableDamping or controls.autoRotate are set to true
	controls.update();

	renderer.render( scene, camera );

}




var yscale = 2.5, xscale = 0.7;
var throwType = "rhbh";
// var pwi=parseInt($("#power").val());
var pwi = 100
var pw = 0.6 + (pwi / 48) * 0.6;
// $("#pwrval").html(Math.floor(pw*100));
// var drawPaths=$("#paths-shown").val();
// var lieColors = { D: '#fff', F: '#faa', M: '#aaf', P: '#afa' };
// var lieOutlines = { D: '#888', F: '#833', M: '#338', P: '#383' };
var lie;
var lieLabels = [];

//disc wear, added myself
var dw = 0;

// draw disc path for selected throw power
var pws = (pwi / 48.0);

// lie=drawPath(parseInt(d[0]), parseInt(d[1]), parseInt(d[2]), pw, dw, pc, (drawPaths=="all" || drawPaths=="one"));
lie = drawPath(parseInt(discGolfData[0].distance), parseInt(discGolfData[0].hst), parseInt(discGolfData[0].lsf), pw, dw);

// drawLie(lie[0], lie[1]);
// lieLabels.push([lie, discGolfData[0].disc_name]);

// draw a lie to disc landing coordinates
function drawLie(x, y) {
    // var pathContext=pathBuffer.getContext("2d");
    // var lieContext=lieBuffer.getContext("2d");
    // var outlineContext=outlineBuffer.getContext("2d");

    // mark the lie
    // pathContext.strokeStyle=color;
    // pathContext.fillStyle=color;
    pathContext.beginPath();
    pathContext.arc(x, y, 2, 0, 2 * 3.1415926);
    pathContext.stroke();
    pathContext.fill();

    // // 15m circle around lie
    // outlineContext.globalCompositeOperation="source-over";
    // outlineContext.globalAlpha=1.0;
    // outlineContext.fillStyle=lieOutline;
    // outlineContext.strokeStyle=lieOutline;
    // outlineContext.beginPath();
    // outlineContext.arc(x, y, 1.5*33, 0, 2*3.1415926);
    // outlineContext.stroke();
    // outlineContext.fill();

    // // 10m circle around lie
    // lieContext.globalCompositeOperation="source-over";
    // lieContext.globalAlpha=1.0;
    // lieContext.fillStyle=lieColor;
    // lieContext.strokeStyle=lieColor;
    // lieContext.beginPath();
    // lieContext.arc(x, y, 33, 0, 2*3.1415926);
    // lieContext.stroke();
    // lieContext.fill();
}

// draw a single disc trajectory path
// function drawPath(dist, hss, lsf, armspeed, wear, color, drawPath)
function drawPath(dist, hss, lsf, armspeed, wear) {
    //   var pathContext=pathBuffer.getContext("2d");
    //   pathContext.strokeStyle = color;
    //   pathContext.lineWidth = 2.4;

    var airspeed = armspeed;
    var ehss = hss, elsf = lsf;
    var turnsign = throwType == "rhbh" ? 1.0 : -1.0;
    var fadestart = 0.4 + (1.0 - airspeed * airspeed) * 0.3;
    var impact = (1.0 - airspeed) / 5;
    var turnend = 0.8 - airspeed * airspeed * 0.36;
    var x, y;
    //   var ox=canvas.width/2; oy=canvas.height;
    var ox = canvasWidth / 2;
    var oy = canvasHeight;
    var vx = 0.0, vy = -1.0;
    var ht = yscale * dist;
    var deltav = yscale / ht;
    var wm = wear / 10.0;

    // calculate effective HSS and LSF
    ehss *= 1.0 + 1.0 - wm;
    ehss -= ((1.0 - wm) / 0.05) * (dist / 100);
    elsf *= wm;
    if (airspeed > 0.8) {
        var op = (airspeed - 0.8) / 0.4;
        op *= op * 2;
        var dc = Math.max(0.0, (350 - dist)) / 10.0; // emphasize high-speed turn on sub-350ft discs
        ehss -= op * dc;
    }
    ehss *= airspeed * airspeed * airspeed * airspeed;
    elsf *= 1.0 / (airspeed * airspeed);

    // iterate through the flight path
    var yd, yt, yf;
    do {
        y = oy + vy;
        x = ox + vx * xscale;
        airspeed -= deltav;
        if (airspeed > turnend) {
            vx -= turnsign * (ehss / 14000) * (turnend / airspeed);
            //   yt=canvas.height-y;
            yt = canvasHeight - y;
        }
        if (airspeed < fadestart) {
            vx -= turnsign * (elsf / 4000) * (fadestart - airspeed) / fadestart;
            // } else { yf=canvas.height-y; }
        } else { yf = canvasHeight - y; }
        if (airspeed > 0.0) {
            // if (drawPath) {
            //     pathContext.beginPath();
            //     pathContext.moveTo(ox, oy);
            //     pathContext.lineTo(x, y);
            //     pathContext.stroke();
            // }
            var points = [];
            points.push(new THREE.Vector3(ox, oy, 0));
            points.push(new THREE.Vector3(x, y, 0));
            console.log(points);

            var geometry = new THREE.BufferGeometry().setFromPoints(points);
            var line = new THREE.Line(geometry, material);

            scene.add(line);
            ox = x; oy = y;
        }
    } while (airspeed > impact);
    //   yd=canvas.height-oy;
    yd = canvasHeight - oy;

    // var hx=canvas.width/2;
    var hx = canvasWidth / 2;
    console.log("hss " + hss + " lsf " + lsf + " ehss " + ehss + " elsf " + elsf + " turnend " + turnend + " fadestart " + fadestart + " yd " + yd);

    points = [];
    points.push(new THREE.Vector3(hx - 20, canvasHeight - yd, 0));
    points.push(new THREE.Vector3(hx + 20, canvasHeight - yd, 0));
    console.log(points);
    geometry = new THREE.BufferGeometry().setFromPoints(points);
    line = new THREE.Line(geometry, material);

    scene.add(line);

    points = [];
    points.push(new THREE.Vector3(hx - 20, canvasHeight - yt, 0));
    points.push(new THREE.Vector3(hx + 20, canvasHeight - yt, 0));
    console.log(points);
    geometry = new THREE.BufferGeometry().setFromPoints(points);
    line = new THREE.Line(geometry, material);

    scene.add(line);

    points = [];
    points.push(new THREE.Vector3(hx - 20, canvasHeight - yf, 0));
    points.push(new THREE.Vector3(hx + 20, canvasHeight - yf, 0));
    console.log(points);
    geometry = new THREE.BufferGeometry().setFromPoints(points);
    line = new THREE.Line(geometry, material);

    scene.add(line);

    // pathContext.strokeStyle = "#fff";
    // pathContext.beginPath();
    // pathContext.moveTo(hx - 20, canvas.height - yd);
    // pathContext.lineTo(hx + 20, canvas.height - yd);
    // pathContext.stroke();

    // pathContext.strokeStyle = "#0ff";
    // pathContext.beginPath();
    // pathContext.moveTo(hx - 20, canvas.height - yt);
    // pathContext.lineTo(hx + 20, canvas.height - yt);
    // pathContext.stroke();

    // pathContext.strokeStyle = "#f0f";
    // pathContext.beginPath();
    // pathContext.moveTo(hx - 20, canvas.height - yf);
    // pathContext.lineTo(hx + 20, canvas.height - yf);
    // pathContext.stroke();

    // return lie coordinates to caller
    // return [x, y];

    // console.log(points);

    // const geometry = new THREE.BufferGeometry().setFromPoints(points);

    // const line = new THREE.Line(geometry, material);

    // scene.add(line);
}

renderer.render(scene, camera);
animate();

// points.push(new THREE.Vector3(0, 0, 0));
// points.push(new THREE.Vector3(Number(discGolfData[0].distance) / 4, Number(discGolfData[0].distance) / 4, 0));
// points.push(new THREE.Vector3(0, Number(discGolfData[0].distance) / 2, 0));

// const geometry = new THREE.BufferGeometry().setFromPoints(points);

// const line = new THREE.Line(geometry, material);

// scene.add(line);
// renderer.render(scene, camera);