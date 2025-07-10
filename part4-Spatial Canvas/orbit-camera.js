(function () {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 800 / 400, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(800, 400);
  renderer.setClearColor(0x000000, 0);
  document.getElementById('threejs-container-2').appendChild(renderer.domElement);

  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);
  const pointLight = new THREE.PointLight(0xaaccff, 1.2);
  pointLight.position.set(10, 10, 10);
  scene.add(pointLight);

  // Central sphere
  const centralGeo = new THREE.SphereGeometry(2, 64, 64);
  const centralMat = new THREE.MeshPhysicalMaterial({
    color: 0x88ccee,
    metalness: 0.1,
    roughness: 0,
    transmission: 0.9,
    thickness: 1.0
  });
  const centralSphere = new THREE.Mesh(centralGeo, centralMat);
  scene.add(centralSphere);

  // Orbiting spheres
  const orbitGroup = new THREE.Group();
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const orbGeo = new THREE.SphereGeometry(0.3, 32, 32);
    const orbMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
      roughness: 0.3
    });
    const orb = new THREE.Mesh(orbGeo, orbMat);
    orb.position.set(Math.cos(angle) * 4, Math.sin(angle) * 1.5, Math.sin(angle) * 4);
    orbitGroup.add(orb);
  }
  scene.add(orbitGroup);

  // Camera
  camera.position.set(6, 4, 6);
  const target = new THREE.Vector3(0, 0, 0);
  camera.lookAt(target);

  // Mouse drag rotation
  let isDragging = false;
  let previousMouse = { x: 0, y: 0 };
  let rotation = { x: 0.5, y: 0.5 };

  const dom = renderer.domElement;
  dom.addEventListener('mousedown', (e) => {
    isDragging = true;
    previousMouse = { x: e.clientX, y: e.clientY };
  });
  window.addEventListener('mouseup', () => { isDragging = false; });
  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - previousMouse.x;
    const deltaY = e.clientY - previousMouse.y;
    rotation.y += deltaX * 0.005;
    rotation.x += deltaY * 0.005;
    previousMouse = { x: e.clientX, y: e.clientY };
  });

  // Animate
  function animate() {
    requestAnimationFrame(animate);

    // Auto-rotation
    if (!isDragging) {
      rotation.y += 0.001;
    }

    // Apply rotation
    const radius = 10;
    const x = radius * Math.sin(rotation.y) * Math.cos(rotation.x);
    const y = radius * Math.sin(rotation.x);
    const z = radius * Math.cos(rotation.y) * Math.cos(rotation.x);
    camera.position.set(x, y, z);
    camera.lookAt(target);

    orbitGroup.rotation.y += 0.002;
    orbitGroup.rotation.x += 0.0005;

    renderer.render(scene, camera);
  }

  animate();
})();
