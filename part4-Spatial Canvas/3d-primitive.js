(function () {
  // Setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, 800 / 400, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(800, 400);
  renderer.setClearColor(0x000000); // Deep black background
  document.getElementById('threejs-container-1').appendChild(renderer.domElement);

  // Lights
  const pointLight = new THREE.PointLight(0x88ccff, 1.5, 100);
  pointLight.position.set(0, 0, 0);
  scene.add(pointLight);

  const ambientLight = new THREE.AmbientLight(0x222222); // subtle fill
  scene.add(ambientLight);

  // Geometry setup
  const count = 120;
  const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
  const material = new THREE.MeshStandardMaterial({
    color: 0x66ffff,
    metalness: 0.5,
    roughness: 0.3,
    emissive: 0x222244,
    emissiveIntensity: 0.5,
  });

  const mesh = new THREE.InstancedMesh(geometry, material, count);
  scene.add(mesh);

  const dummy = new THREE.Object3D();

  // Camera motion parameters
  let t = 0;

  function animate() {
    requestAnimationFrame(animate);
    t += 0.01;

    for (let i = 0; i < count; i++) {
      const angle = i * 0.2 + t;
      const radius = 1.5 + i * 0.015;
      const y = Math.sin(i * 0.1 + t) * 1.2;

      dummy.position.set(
        Math.cos(angle) * radius,
        y,
        Math.sin(angle) * radius
      );

      dummy.rotation.set(angle * 0.3, angle * 0.2, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;

    // Camera slow orbit
    camera.position.x = Math.cos(t * 0.2) * 5;
    camera.position.z = Math.sin(t * 0.2) * 5;
    camera.position.y = Math.sin(t * 0.1) * 1.5;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  animate();
})();
