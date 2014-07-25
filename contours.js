// if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
var container, stats;

var cameraRTT, camera, sceneRTT, sceneScreen, scene, renderer, zmesh1, zmesh2;

var depthPassPlugin, depthTarget;

var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var rtTexture, material, quad, lines;

var delta = 0.01;

function onDocumentMouseMove( event ) {
  "use strict";
  mouseX = ( event.clientX - windowHalfX );
  mouseY = ( event.clientY - windowHalfY );
}

function init() {
  "use strict";
  var i, j, n,
    light, plane, geometry, mat1, mat2, lineVerts, lineStepX, lineStepY,
    mesh, materialScreen, material2, materialDepth, materialLine;
  container = document.getElementById( 'container' );

  camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 10000 );
  camera.position.z = 100;

  cameraRTT = new THREE.OrthographicCamera(window.innerWidth  / -2, window.innerWidth  /  2,
                                           window.innerHeight /  2, window.innerHeight / -2,
                                           -200, 200 );
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

  rtTexture = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight,
                                          { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat } );
  depthTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight,
                                            {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter} );

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

  materialDepth = new THREE.ShaderMaterial( {
    uniforms: {
      tDepth: { type: "t", value: depthTarget }
    },
    vertexShader: document.getElementById( 'vertexShader' ).textContent,
    fragmentShader: document.getElementById( 'fragment_shader_depth' ).textContent,
    depthWrite: false
  } );

  materialLine = new THREE.ShaderMaterial( {
    uniforms: {
      tDepth: { type: "t", value: depthTarget }
    },
    vertexShader: document.getElementById( 'vertexShaderLine' ).textContent,
    fragmentShader: document.getElementById( 'fragment_shader_line' ).textContent
  } );

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

  plane = new THREE.PlaneGeometry( window.innerWidth, window.innerHeight );
  quad = new THREE.Mesh( plane, materialDepth ); // materialScreen
  quad.position.z = -100;
  //sceneScreen.add( quad );

  lineStepX = window.innerWidth / 500;
  lineStepY = window.innerHeight / 100;
  for(j=0; j<100+1; j += 1) {
    lineVerts = new THREE.Geometry();
    for(i=0; i<500+1; i += 1) {
      lineVerts.vertices.push(
        new THREE.Vector3(-window.innerWidth/2 + i*lineStepX, -window.innerHeight/2 + j*lineStepY, 50) );
    }
    lines = new THREE.Line(lineVerts, materialLine, THREE.LineStrip);
    sceneScreen.add(lines)
  }

  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.autoClear = false;

  depthPassPlugin = new THREE.DepthPassPlugin();
  depthPassPlugin.renderTarget = depthTarget;
  renderer.addPrePlugin(depthPassPlugin);

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
  depthPassPlugin.enabled = true;
  renderer.render( sceneRTT, cameraRTT, rtTexture, true );
  depthPassPlugin.enabled = false;

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
