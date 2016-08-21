var server = 'REPLACE';
var port = 'REPLACE';

var scene = new THREE.Scene();
var aspect = window.innerWidth / window.innerHeight;
var camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000 );

// var stats = new Stats();
// stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
// document.body.appendChild( stats.dom );

var light = new THREE.DirectionalLight(0xffffff);
light.position.set(0, 2, 2);
light.target.position.set(0, 0, 0);
light.castShadow = true;
light.shadowDarkness = 0.5;
light.shadowCameraVisible = true; // only for debugging
// these six values define the boundaries of the yellow box seen above
light.shadowCameraNear = 1;
light.shadowCameraFar = 10;
light.shadowCameraLeft = -0.5;
light.shadowCameraRight = 0.5;
light.shadowCameraTop = 0.5;
light.shadowCameraBottom = -0.5;
scene.add(light);

// var d = 40;
// camera = new THREE.OrthographicCamera( - d * aspect, d * aspect, d, - d, 1, 1000 );
// camera.position.set(0,0,45); // top camera

camera.position.set(0,90,45); // perspective camera
// camera.position.set(10,0,1); // player camera


var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor( 0x6BABDB );
document.body.appendChild( renderer.domElement );

var geometry = new THREE.BoxGeometry(120, 88, 1);
var material = new THREE.MeshBasicMaterial( { color: 0x44BB00 });
var pitch = new THREE.Mesh( geometry, material );
pitch.position.z = -2;
pitch.receiveShadow = true;

scene.add(pitch);

//---

var colours = [0x0000ff,0xFFFFFF,0xFFFFFF,0xE4007D];
var controls = new THREE.OrbitControls( camera, renderer.domElement );

var ball = null;
var people = {};

function renderGame(data) {

  var split = data.split(":");
  var players = split[1].split(";");

  var unloaded = people;
  var p;

  for (var i = 0; i < players.length; i++) {
    var splits = players[i].split(",");

    if (splits[0] == "0" || splits[0] == "1") {

      var lleft = (parseInt(splits[3])/100);
      var ttop = (parseInt(splits[4])/100);
      var player;

      console.log(splits[0] + "-" + splits[2])
      console.log(people)

      if (ball == null) {
        var geometry = new THREE.BoxGeometry( 0.6, 0.6, 3 );
        var material = new THREE.MeshBasicMaterial( { color: colours[splits[0]] });
        player = new THREE.Mesh( geometry, material );
        console.log(splits[2])
        people[splits[0] + "-" + splits[2]] = player;
        scene.add(player);
        if (i == players.length - 1) {
          camera.position.set(lleft, ttop,1);
        }
      } else {
        player = people[splits[0] + "-" + splits[2]];
      }
      player.position.set(lleft, ttop, 0);
    }

    if (splits[2] == "1") p = player;

  }

  var bball = split[2].split(",");
  var lleft = (parseInt(bball[0])/100);
  var ttop = (parseInt(bball[1])/100);
  var zz = (parseInt(bball[2])/100) - 1;

  if (ball == null) {
    var geometry = new THREE.SphereGeometry(0.5,32,32);
    var material = new THREE.MeshBasicMaterial( { color: 0xF7FF63 });
    ball = new THREE.Mesh( geometry, material );
    scene.add(ball);
    ball.castShadow = true;
  }
  ball.position.set(lleft, ttop, zz);



  // controls.enableDamping = true;
  // controls.dampingFactor = 0.25;
  // controls.enableZoom = false;
  // controls.center =  new THREE.Vector3(
  //     // ball.position.x,
  //     // ball.position.y,
  //     // ball.position.z
  //     10,0,1
  // );
  camera.up = new THREE.Vector3(0,0,1);
  // camera.lookAt( ball.position );

  // camera.position.set(p.position.x,p.position.y,1); // perspective camera
}


function render() {
  // stats.begin();
  requestAnimationFrame(render);
  // console.log(camera.rotation);
  controls.update();
  renderer.render(scene, camera);
  // stats.end();
}

render();
// requestAnimationFrame(render);


var password = prompt("Please enter the password");

$(document).ready(function() {

  socket = io.connect('ws://'+server+':'+port);

  socket.emit('authentication', {username: "user", password: password});

  socket.on('authenticated', function() {
    socket.on('line', function(data) {
      renderGame(data);
    });
  });

});
