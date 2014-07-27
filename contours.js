var container, stats;

var cameraRTT, sceneRTT, sceneScreen, renderer, zmesh1, zmesh2;

var depthPassPlugin, depthTarget;

var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var rtTexture, lines;

function onDocumentMouseMove( event ) {
  "use strict";
  mouseX = ( event.clientX - windowHalfX );
  mouseY = ( event.clientY - windowHalfY );
}

function init() {
  "use strict";
  var i, j,
    geometry, mat1, lineVerts, lineStepX, lineStepY,
    materialLine;
  container = document.getElementById( 'container' );

  cameraRTT = new THREE.OrthographicCamera(window.innerWidth  / -2, window.innerWidth  /  2,
                                           window.innerHeight /  2, window.innerHeight / -2,
                                           -200, 200 );
  cameraRTT.position.z = 100;

  //

  sceneRTT = new THREE.Scene();
  sceneScreen = new THREE.Scene();

  rtTexture = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight,
                                          { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat } );
  depthTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight,
                                            {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter} );

  materialLine = new THREE.ShaderMaterial( {
    uniforms: {
      tDepth: { type: "t", value: depthTarget }
    },
    vertexShader: document.getElementById( 'vertexShaderLine' ).textContent,
    fragmentShader: document.getElementById( 'fragment_shader_line' ).textContent
  } );

  geometry = new THREE.TorusGeometry( 100, 25, 15, 30 );

  mat1 = new THREE.MeshPhongMaterial( { color: 0x555555, specular: 0xffaa00, shininess: 5 } );

  zmesh1 = new THREE.Mesh( geometry, mat1 );
  zmesh1.position.set( 0, 0, 100 );
  zmesh1.scale.set( 1.5, 1.5, 1.5 );
  sceneRTT.add( zmesh1 );

  zmesh2 = new THREE.Mesh( geometry, mat1 );
  zmesh2.position.set( 0, 150, 100 );
  zmesh2.scale.set( 0.75, 0.75, 0.75 );
  sceneRTT.add( zmesh2 );

  lineStepX = window.innerWidth / 500;
  lineStepY = 10;
  for(j=0; j<window.innerHeight/lineStepY; j += 1) {
    lineVerts = new THREE.Geometry();
    for(i=0; i<500+1; i += 1) {
      lineVerts.vertices.push(
        new THREE.Vector3(-window.innerWidth/2 + i*lineStepX, -window.innerHeight/2 + j*lineStepY, 50) );
    }
    lines = new THREE.Line(lineVerts, materialLine, THREE.LineStrip);
    sceneScreen.add(lines);
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

  if ( zmesh1 && zmesh2 ) {
    zmesh1.rotation.y = - time;
    zmesh2.rotation.y = - time + Math.PI / 2;
  }

  renderer.clear();

  // Render first scene into texture
  depthPassPlugin.enabled = true;
  renderer.render( sceneRTT, cameraRTT, rtTexture, true );
  depthPassPlugin.enabled = false;

  // Render full screen quad with generated texture
  renderer.render( sceneScreen, cameraRTT );
}

function animate() {
  "use strict";
  window.requestAnimationFrame( animate );

  render();
  stats.update();
}

init();
animate();
