// spatial-canvas-threejs.js
// Three.js scene: grid, primitives, and orbit controls

(function() {
  // Scene, camera, renderer setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 800 / 400, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(800, 400);
  renderer.setClearColor(0xf0f0f0); // Light grey background

  document.getElementById('threejs-container-2').appendChild(renderer.domElement);

  // Add grid helper
  const grid = new THREE.GridHelper(16, 32, 0xcccccc, 0xcccccc);
  scene.add(grid);

  // Add ambient and directional light
  const ambient = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
  dirLight.position.set(5, 10, 7);
  scene.add(dirLight);

  // Add 3D primitives
  // Box
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.MeshPhongMaterial({ color: 0x3264a8 })
  );
  box.position.set(-5, 1, 0);
  scene.add(box);
  // Sphere
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.2, 32, 32),
    new THREE.MeshPhongMaterial({ color: 0xffa500 })
  );
  sphere.position.set(0, 1.2, 0);
  scene.add(sphere);
  // Cylinder
  const cylinder = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 1, 2, 32),
    new THREE.MeshPhongMaterial({ color: 0x4caf50 })
  );
  cylinder.position.set(5, 1, 0);
  scene.add(cylinder);
  // Cone
  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(1, 2, 32),
    new THREE.MeshPhongMaterial({ color: 0xe91e63 })
  );
  cone.position.set(2.5, 1, -4);
  scene.add(cone);

  // Camera position
  camera.position.set(8, 8, 8);
  camera.lookAt(0, 0, 0);

  // OrbitControls
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.screenSpacePanning = false;
  controls.minDistance = 4;
  controls.maxDistance = 40;
  controls.target.set(0, 1, 0);

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
})(); 