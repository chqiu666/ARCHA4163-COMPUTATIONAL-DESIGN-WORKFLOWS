(function () {
  // Setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 800 / 400, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(800, 400);
  renderer.setClearColor(0x000000, 1); // Black background

  document.getElementById('threejs-container-2').appendChild(renderer.domElement);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xccccff, 0.6);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 1, 100);
  pointLight.position.set(0, 5, 10);
  scene.add(pointLight);

  // Transparent sphere material
  const sphereMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x88ccff,
    transparent: true,
    opacity: 0.4,
    roughness: 0.2,
    metalness: 0.3,
    clearcoat: 1,
    clearcoatRoughness: 0,
  });

  // Initial floating sphere
  const spheres = [];
  const sphereGeometry = new THREE.SphereGeometry(0.6, 32, 32);

  function addFloatingSphere(x = 0, y = 1, z = 0) {
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial.clone());
    sphere.position.set(x, y, z);
    sphere.userData.phase = Math.random() * Math.PI * 2;
    scene.add(sphere);
    spheres.push(sphere);
  }

  // Add a few to start
  for (let i = 0; i < 5; i++) {
    addFloatingSphere(
      Math.random() * 6 - 3,
      Math.random() * 2 + 1,
      Math.random() * 6 - 3
    );
  }

  // Camera & controls
  camera.position.set(6, 6, 6);
  camera.lookAt(0, 1, 0);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.target.set(0, 1, 0);

  // Handle click to add spheres
  renderer.domElement.addEventListener("click", (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const mouse = new THREE.Vector2(x, y);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshBasicMaterial()), true);
    const point = raycaster.ray.origin.clone().add(raycaster.ray.direction.clone().multiplyScalar(5));
    addFloatingSphere(point.x, point.y, point.z);
  });

  // Animation loop
  let time = 0;
  function animate() {
    requestAnimationFrame(animate);
    time += 0.01;

    spheres.forEach((s, i) => {
      const t = time + s.userData.phase;
      s.position.y += Math.sin(t) * 0.01;
      s.rotation.y += 0.01;
      s.rotation.x += 0.005;
    });

    controls.update();
    renderer.render(scene, camera);
  }

  animate();
})();
