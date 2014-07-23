// if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
var container, stats;

var cameraRTT, camera, sceneRTT, sceneScreen, scene, renderer, zmesh1, zmesh2;

var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var rtTexture, material, quad;

var delta = 0.01;

function onDocumentMouseMove( event ) {
  "use strict";
  mouseX = ( event.clientX - windowHalfX );
  mouseY = ( event.clientY - windowHalfY );
}

function init() {
  "use strict";
  var i, j, n,
    light, plane, geometry, mat1, mat2,
    mesh, materialScreen, material2;
  container = document.getElementById( 'container' );

  camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 10000 );
  camera.position.z = 100;

  cameraRTT = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, -10000, 10000 );
  cameraRTT.position.z = 100;

  //

  scene = new THREE.Scene();
  sceneRTT = new THREE.Scene();
  sceneScreen = new THREE.Scene();

  light = new THREE.DirectionalLight( 0xffffff );
  light.position.set( 0, 0, 1 ).normalize();
  sceneRTT.add( light );

  light = new THREE.DirectionalLight( 0xffaaaa, 1.5 );
  light.position.set( 0, 0, -1 ).normalize();
  sceneRTT.add( light );

  rtTexture = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat } );

  material = new THREE.ShaderMaterial( {
    uniforms: {
      tDiffuse: { type: "t", value: rtTexture },
      time: { type: "f", value: 0.0 }
    },
    vertexShader: document.getElementById( 'vertexShader' ).textContent,
    fragmentShader: document.getElementById( 'fragment_shader_pass_1' ).textContent
  } );

  materialScreen = new THREE.ShaderMaterial( {
    uniforms: {
      tDiffuse: { type: "t", value: rtTexture }
    },
    vertexShader: document.getElementById( 'vertexShader' ).textContent,
    fragmentShader: document.getElementById( 'fragment_shader_screen' ).textContent,
    depthWrite: false
  } );

  plane = new THREE.PlaneGeometry( window.innerWidth, window.innerHeight );
  quad = new THREE.Mesh( plane, material );
  quad.position.z = -100;
  sceneRTT.add( quad );

  geometry = new THREE.TorusGeometry( 100, 25, 15, 30 );

  mat1 = new THREE.MeshPhongMaterial( { color: 0x555555, specular: 0xffaa00, shininess: 5 } );
  mat2 = new THREE.MeshPhongMaterial( { color: 0x550000, specular: 0xff2200, shininess: 5 } );

  zmesh1 = new THREE.Mesh( geometry, mat1 );
  zmesh1.position.set( 0, 0, 100 );
  zmesh1.scale.set( 1.5, 1.5, 1.5 );
  sceneRTT.add( zmesh1 );

  zmesh2 = new THREE.Mesh( geometry, mat2 );
  zmesh2.position.set( 0, 150, 100 );
  zmesh2.scale.set( 0.75, 0.75, 0.75 );
  sceneRTT.add( zmesh2 );

  quad = new THREE.Mesh( plane, materialScreen );
  quad.position.z = -100;
  sceneScreen.add( quad );

  n = 5;
  geometry = new THREE.SphereGeometry( 10, 64, 32 );
  material2 = new THREE.MeshBasicMaterial( { color: 0xffffff, map: rtTexture } );
  for( j = 0; j < n; j += 1 ) {
    for( i = 0; i < n; i += 1 ) {
      mesh = new THREE.Mesh( geometry, material2 );
      mesh.position.x = ( i - ( n - 1 ) / 2 ) * 20;
      mesh.position.y = ( j - ( n - 1 ) / 2 ) * 20;
      mesh.position.z = 0;
      mesh.rotation.y = - Math.PI / 2;
      scene.add( mesh );
    }
  }

  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.autoClear = false;

  container.appendChild( renderer.domElement );

  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  container.appendChild( stats.domElement );

  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
}

//

function render() {
  "use strict";
  var time = Date.now() * 0.0015;

  camera.position.x += ( mouseX - camera.position.x ) * 0.05;
  camera.position.y += ( - mouseY - camera.position.y ) * 0.05;

  camera.lookAt( scene.position );

  if ( zmesh1 && zmesh2 ) {
    zmesh1.rotation.y = - time;
    zmesh2.rotation.y = - time + Math.PI / 2;
  }

  if ( material.uniforms.time.value > 1 || material.uniforms.time.value < 0 ) {
    delta *= -1;
  }

  material.uniforms.time.value += delta;

  renderer.clear();

  // Render first scene into texture
  renderer.render( sceneRTT, cameraRTT, rtTexture, true );

  // Render full screen quad with generated texture
  renderer.render( sceneScreen, cameraRTT );

  // Render second scene to screen
  // (using first scene as regular texture)
  renderer.render( scene, camera );
}

function animate() {
  "use strict";
  window.requestAnimationFrame( animate );

  render();
  stats.update();
}

init();
animate();
