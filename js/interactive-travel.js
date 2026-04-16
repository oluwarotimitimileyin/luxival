document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('threeScene');
  const description = document.getElementById('mapDescription');
  const actionButtons = document.querySelectorAll('[data-hotspot]');
  const mapHotspots = document.querySelectorAll('.map-hotspot');

  const hotspotData = {
    helsinki: {
      title: 'Helsinki route',
      description: 'Design-led city stops, gallery visits, and boutique concierge transport from Helsinki-Vantaa.',
      color: 0x7c5cff,
    },
    lakes: {
      title: 'Lake retreat',
      description: 'Premium lakeside stays, sauna escapes, and curated private rides to Finland’s tranquil summer retreats.',
      color: 0x3cb371,
    },
    aurora: {
      title: 'Lapland auroras',
      description: 'Northern light travel planning with a winter-ready premium route to Lapland and remote hotel experiences.',
      color: 0x70d6ff,
    },
  };

  function updateHotspot(key) {
    const detail = hotspotData[key];
    if (!detail) return;
    description.innerHTML = `<h4>${detail.title}</h4><p>${detail.description}</p>`;
    mapHotspots.forEach((item) => {
      item.classList.toggle('active', item.dataset.hotspot === key);
    });
    if (scene && sphereMaterial) {
      sphereMaterial.color.setHex(detail.color);
    }
  }

  mapHotspots.forEach((item) => {
    item.addEventListener('click', () => updateHotspot(item.dataset.hotspot));
  });

  actionButtons.forEach((button) => {
    button.addEventListener('click', () => updateHotspot(button.dataset.hotspot));
  });

  if (!container || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 1.2, 3);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0xffffff, 0.75);
  scene.add(ambient);
  const directional = new THREE.DirectionalLight(0xffffff, 0.8);
  directional.position.set(5, 8, 5);
  scene.add(directional);

  const sphereGeometry = new THREE.IcosahedronGeometry(1, 3);
  const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0x7c5cff,
    roughness: 0.25,
    metalness: 0.5,
    emissive: 0x202040,
    emissiveIntensity: 0.2,
  });
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  scene.add(sphere);

  const pointsGeometry = new THREE.BufferGeometry();
  const pointCount = 32;
  const pointPositions = new Float32Array(pointCount * 3);
  for (let i = 0; i < pointCount; i += 1) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 1.6;
    pointPositions[i * 3] = Math.sin(phi) * Math.cos(theta) * r;
    pointPositions[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * r;
    pointPositions[i * 3 + 2] = Math.cos(phi) * r;
  }
  pointsGeometry.setAttribute('position', new THREE.BufferAttribute(pointPositions, 3));
  const pointsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.04 });
  const points = new THREE.Points(pointsGeometry, pointsMaterial);
  scene.add(points);

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function onPointerMove(event) {
    const rect = container.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    mouse.x = x;
    mouse.y = y;
  }

  function animate() {
    requestAnimationFrame(animate);
    sphere.rotation.y += 0.004;
    points.rotation.y += 0.003;
    raycaster.setFromCamera(mouse, camera);
    renderer.render(scene, camera);
  }

  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  animate();
});
