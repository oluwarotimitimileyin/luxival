import { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface LuminousBrainWavesProps {
  intensity?: number;
}

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uIntensity;
  uniform vec2 uResolution;
  varying vec2 vUv;

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;
    float noiseVal = 0.0;
    vec2 noisePos = uv * 3.0;

    float dist = distance(uv, uMouse);
    float mouseInfluence = smoothstep(0.5, 0.0, dist) * 0.5;

    noisePos.x += sin(uTime * 0.2) * 0.3 + mouseInfluence;
    noisePos.y += cos(uTime * 0.15) * 0.3 - mouseInfluence;

    noiseVal += dot(sin(noisePos * 1.0 + uTime * 0.1), vec2(1.0)) * 0.5;
    noiseVal += dot(sin(noisePos * 2.0 - uTime * 0.15), vec2(1.0)) * 0.25;
    noiseVal += dot(sin(noisePos * 4.0 + uTime * 0.2), vec2(1.0)) * 0.125;
    noiseVal += dot(sin(noisePos * 8.0 - uTime * 0.25), vec2(1.0)) * 0.0625;
    noiseVal += dot(sin(noisePos * 16.0 + uTime * 0.3), vec2(1.0)) * 0.03125;
    noiseVal /= 1.0;

    vec3 color1 = vec3(0.0, 0.02, 0.05) * uIntensity;
    vec3 color2 = vec3(0.0, 0.7, 0.8) * uIntensity;
    vec3 color3 = vec3(0.02, 0.1, 0.2) * uIntensity;

    float colorMix = smoothstep(0.3, 0.7, noiseVal);
    vec3 finalColor = mix(color1, color2, colorMix) + color3 * noiseVal * 0.3;

    float grain = random(gl_FragCoord.xy * 0.01 + uTime) * 0.05;
    finalColor += grain;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export default function LuminousBrainWaves({ intensity = 0.5 }: LuminousBrainWavesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const frameRef = useRef<number>(0);
  const targetIntensity = useRef(intensity);
  const currentIntensity = useRef(intensity);

  useEffect(() => {
    targetIntensity.current = intensity;
  }, [intensity]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const aspect = window.innerWidth / window.innerHeight;
    const camera = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    camera.position.z = 1;

    const uniforms = {
      uTime: { value: 0.0 },
      uIntensity: { value: intensity },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
    });
    materialRef.current = material;

    let geometry = new THREE.PlaneGeometry(2 * aspect, 2, 1, 1);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    meshRef.current = mesh;

    const handleMouseMove = (e: MouseEvent) => {
      uniforms.uMouse.value.set(
        e.clientX / window.innerWidth,
        1.0 - e.clientY / window.innerHeight
      );
    };

    const handleResize = () => {
      const newAspect = window.innerWidth / window.innerHeight;
      camera.left = -newAspect;
      camera.right = newAspect;
      camera.top = 1;
      camera.bottom = -1;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
      geometry.dispose();
      geometry = new THREE.PlaneGeometry(2 * newAspect, 2, 1, 1);
      mesh.geometry = geometry;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    const startTime = performance.now();
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = (performance.now() - startTime) / 1000;
      uniforms.uTime.value = elapsed;

      currentIntensity.current += (targetIntensity.current - currentIntensity.current) * 0.05;
      uniforms.uIntensity.value = currentIntensity.current;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
