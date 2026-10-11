import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ThreeCanvas: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let animationFrameId: number;
    let renderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({
        antialias: window.innerWidth > 768,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    // Transparent canvas so ambient blurred CSS gradient aura glows show through
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    // Atmospheric depth fog
    scene.fog = new THREE.FogExp2(0x020a1f, 0.008);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 45;

    // Ambient & Point Lighting (Electric Blue & Neon Cyan)
    const ambientLight = new THREE.AmbientLight(0x0e2554, 2.5);
    scene.add(ambientLight);

    const pointLightCyan = new THREE.PointLight(0x00f0ff, 4, 120);
    pointLightCyan.position.set(25, 20, 20);
    scene.add(pointLightCyan);

    const pointLightBlue = new THREE.PointLight(0x2563eb, 3.5, 100);
    pointLightBlue.position.set(-25, -15, 15);
    scene.add(pointLightBlue);

    const pointLightAmber = new THREE.PointLight(0xf59e0b, 1.5, 80);
    pointLightAmber.position.set(0, 30, -10);
    scene.add(pointLightAmber);

    // Particle field (Digital Tech Data Nodes)
    const particleCount = window.innerWidth < 768 ? 500 : 1200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorPalette = [
      new THREE.Color(0x00f0ff), // Neon Cyan
      new THREE.Color(0x38bdf8), // Sky Blue
      new THREE.Color(0x3b82f6), // Royal Blue
      new THREE.Color(0x60a5fa), // Light Blue
      new THREE.Color(0xf59e0b), // Amber Gold
    ];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 160;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 140;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

      const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particleSystem = new THREE.Points(geometry, particleMaterial);
    scene.add(particleSystem);

    // Digital Wireframe Grid Plane (Data Ground Floor)
    const gridHelper = new THREE.GridHelper(160, 40, 0x00f0ff, 0x0c2556);
    gridHelper.position.y = -35;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.25;
    scene.add(gridHelper);

    // Holographic Digital Rings & Radar Orbits
    const ringGroup = new THREE.Group();
    scene.add(ringGroup);

    // Outer Neon Cyan Ring
    const torusGeo1 = new THREE.TorusGeometry(20, 0.2, 16, 120);
    const torusMat1 = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.6,
      roughness: 0.1,
      metalness: 0.9,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });
    const ring1 = new THREE.Mesh(torusGeo1, torusMat1);
    ring1.rotation.x = Math.PI / 3;
    ringGroup.add(ring1);

    // Middle Deep Blue Ring
    const torusGeo2 = new THREE.TorusGeometry(28, 0.15, 16, 140);
    const torusMat2 = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    const ring2 = new THREE.Mesh(torusGeo2, torusMat2);
    ring2.rotation.y = Math.PI / 4;
    ringGroup.add(ring2);

    // Central Digital Node Crystal
    const icoGeo = new THREE.IcosahedronGeometry(4, 1);
    const icoMat = new THREE.MeshStandardMaterial({
      color: 0x0369a1,
      emissive: 0x0284c7,
      emissiveIntensity: 0.4,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const centralIco = new THREE.Mesh(icoGeo, icoMat);
    centralIco.position.set(0, 0, -10);
    ringGroup.add(centralIco);

    // Pointer Tracking for 3D Parallax & Tilt
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;
      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      mouseX = (clientX / window.innerWidth - 0.5) * 2;
      mouseY = (clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth camera interpolation
      targetX = mouseX * 8;
      targetY = -mouseY * 6;
      camera.position.x += (targetX - camera.position.x) * 0.035;
      camera.position.y += (targetY - camera.position.y) * 0.035;
      camera.lookAt(0, 0, 0);

      // Rotate particle cloud gently
      particleSystem.rotation.y = elapsedTime * 0.025;
      particleSystem.rotation.x = Math.sin(elapsedTime * 0.015) * 0.04;

      // Rotate grid slightly for dynamic speed feeling
      gridHelper.rotation.y = -elapsedTime * 0.01;

      // Rotate holographic rings
      ring1.rotation.z = elapsedTime * 0.04;
      ring1.rotation.y = elapsedTime * 0.03;
      ring2.rotation.x = -elapsedTime * 0.03;
      ring2.rotation.z = elapsedTime * 0.02;
      centralIco.rotation.y = elapsedTime * 0.08;
      centralIco.rotation.x = elapsedTime * 0.05;

      // Pulsing cyan & blue point lights (like laser signals)
      pointLightCyan.position.x = Math.sin(elapsedTime * 0.5) * 35;
      pointLightCyan.position.z = Math.cos(elapsedTime * 0.5) * 35;
      pointLightBlue.position.x = -Math.cos(elapsedTime * 0.4) * 30;
      pointLightBlue.position.y = Math.sin(elapsedTime * 0.4) * 20;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('resize', handleResize);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      particleMaterial.dispose();
      gridHelper.dispose();
      torusGeo1.dispose();
      torusMat1.dispose();
      torusGeo2.dispose();
      torusMat2.dispose();
      icoGeo.dispose();
      icoMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-95 transition-opacity duration-1000"
      aria-hidden="true"
    />
  );
};
