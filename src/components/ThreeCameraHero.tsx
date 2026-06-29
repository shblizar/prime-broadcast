import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function ThreeCameraHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Fallback interactive coordinate tracking
  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      const x = (e.clientX / w) * 2 - 1;
      const y = -(e.clientY / h) * 2 + 1;
      if (isFinite(x) && isFinite(y)) {
        setMousePos({ x, y });
      }
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
    };
  }, []);
  
  useEffect(() => {
    if (!containerRef.current) return;
    if (!webglSupported) return;
    
    const container = containerRef.current;
    let renderer: THREE.WebGLRenderer | null = null;
    let animationId: number;
    let isMounted = true;
    
    try {
      const width = container.clientWidth;
      const height = container.clientHeight || 500;
      
      // Check basic WebGL availability on a separate throwaway dummy canvas
      const dummyCanvas = document.createElement('canvas');
      const gl = dummyCanvas.getContext('webgl') || dummyCanvas.getContext('experimental-webgl');
      if (!gl) {
        throw new Error('WebGL not supported');
      }

      // Scene
      const scene = new THREE.Scene();
      
      // Camera
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.z = 7;
      
      // Renderer with high quality PCFSoftShadowMap shadows
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(renderer.domElement);
      
      // Create a main group that rotates dynamically based on mouse coordinates
      const intercomGroup = new THREE.Group();
      scene.add(intercomGroup);
      
      // DEFINING HIGH-END FUTURISTIC MATERIALS (PBR - Physically Based Rendering)
      // 1. Matte Carbon Chassis (Matte texture, high roughness, subtle metallic shine)
      const matteCarbonMaterial = new THREE.MeshStandardMaterial({
        color: 0x141416,
        roughness: 0.65,
        metalness: 0.35,
      });
      
      // 2. High-gloss visual lens chrome/gold
      const polishedChromeMaterial = new THREE.MeshStandardMaterial({
        color: 0xe4e4e7,
        roughness: 0.08,
        metalness: 0.95,
      });

      const refinedGoldMaterial = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        roughness: 0.15,
        metalness: 0.90,
      });

      // 3. Deep Dark Visor material (Low roughness, high metalness reflection)
      const metallicVisorMaterial = new THREE.MeshStandardMaterial({
        color: 0x050507,
        roughness: 0.04,
        metalness: 0.98,
      });

      // 4. Glowing futuristic glass lens
      const neonAuraMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x00f2fe,
        emissive: 0x00455e,
        roughness: 0.05,
        metalness: 0.1,
        transparent: true,
        opacity: 0.95,
        transmission: 0.8,
        thickness: 2.2,
      });

      const neonPulseMaterial = new THREE.MeshBasicMaterial({
        color: 0x00f2fe,
      });

      const activeRedLedMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0055,
      });

      // --- MODEL TREE CREATION: FUTURISTIC PROFESSIONAL CAMERA ---
      
      // 1. Sleek Matte Carbon Camera Main Chassis
      const chassisGeo = new THREE.BoxGeometry(2.3, 1.4, 1.4);
      const cameraChassis = new THREE.Mesh(chassisGeo, matteCarbonMaterial);
      cameraChassis.castShadow = true;
      cameraChassis.receiveShadow = true;
      intercomGroup.add(cameraChassis);

      // 2. High-Gloss Viewfinder / Top Handle
      const handleBaseGeo = new THREE.BoxGeometry(0.12, 0.45, 1.1);
      const topHandleBase = new THREE.Mesh(handleBaseGeo, polishedChromeMaterial);
      topHandleBase.position.set(0, 0.9, -0.1);
      topHandleBase.castShadow = true;
      intercomGroup.add(topHandleBase);
      
      const handleGripGeo = new THREE.BoxGeometry(0.24, 0.08, 1.05);
      const topHandleGrip = new THREE.Mesh(handleGripGeo, refinedGoldMaterial);
      topHandleGrip.position.set(0, 1.1, -0.1);
      intercomGroup.add(topHandleGrip);

      // 3. Side Viewfinder LCD Monitor (Glows beautifully)
      const monitorArmGeo = new THREE.BoxGeometry(0.12, 0.45, 0.15);
      const monitorArm = new THREE.Mesh(monitorArmGeo, polishedChromeMaterial);
      monitorArm.position.set(-1.2, 0.05, -0.25);
      intercomGroup.add(monitorArm);

      const monitorChassisGeo = new THREE.BoxGeometry(0.1, 0.8, 1.15);
      const monitorChassis = new THREE.Mesh(monitorChassisGeo, matteCarbonMaterial);
      monitorChassis.position.set(-1.3, 0.05, -0.25);
      monitorChassis.rotation.y = Math.PI / 15;
      intercomGroup.add(monitorChassis);

      const screenGeo = new THREE.PlaneGeometry(0.68, 1.02);
      // Create glowing screen mesh
      const monitorScreen = new THREE.Mesh(screenGeo, new THREE.MeshBasicMaterial({
        color: 0x01a3b8,
        transparent: true,
        opacity: 0.9,
      }));
      monitorScreen.position.set(-1.36, 0.05, -0.25);
      monitorScreen.rotation.y = Math.PI / 2 + Math.PI / 15;
      intercomGroup.add(monitorScreen);

      // 4. Primary Lens Multi-Barrel Configuration (Extends forward along Z-axis)
      // Stage A - Barrel Mount Base (Chrome Finish)
      const lensBaseGeo = new THREE.CylinderGeometry(0.68, 0.68, 0.35, 32);
      lensBaseGeo.rotateX(Math.PI / 2);
      const lensBase = new THREE.Mesh(lensBaseGeo, polishedChromeMaterial);
      lensBase.position.set(0, 0, 0.85);
      lensBase.castShadow = true;
      lensBase.receiveShadow = true;
      intercomGroup.add(lensBase);

      // Stage B - Focal Expansion Tube (Matte carbon)
      const lensMidGeo = new THREE.CylinderGeometry(0.56, 0.56, 0.55, 32);
      lensMidGeo.rotateX(Math.PI / 2);
      const lensMid = new THREE.Mesh(lensMidGeo, matteCarbonMaterial);
      lensMid.position.set(0, 0, 1.3);
      lensMid.castShadow = true;
      intercomGroup.add(lensMid);

      // Stage C - Shiny Gold Calibration Ring (Focus / Zoom adjusters)
      const focusRingGeo = new THREE.CylinderGeometry(0.58, 0.58, 0.08, 32);
      focusRingGeo.rotateX(Math.PI / 2);
      const focusRing = new THREE.Mesh(focusRingGeo, refinedGoldMaterial);
      focusRing.position.set(0, 0, 1.15);
      intercomGroup.add(focusRing);

      const zoomRingGeo = new THREE.CylinderGeometry(0.58, 0.58, 0.08, 32);
      zoomRingGeo.rotateX(Math.PI / 2);
      const zoomRing = new THREE.Mesh(zoomRingGeo, refinedGoldMaterial);
      zoomRing.position.set(0, 0, 1.4);
      intercomGroup.add(zoomRing);

      // Stage D - Outer Flare Rim (Refined gold bevel)
      const outerRimGeo = new THREE.CylinderGeometry(0.62, 0.54, 0.22, 32);
      outerRimGeo.rotateX(Math.PI / 2);
      const outerRim = new THREE.Mesh(outerRimGeo, refinedGoldMaterial);
      outerRim.position.set(0, 0, 1.65);
      outerRim.castShadow = true;
      intercomGroup.add(outerRim);

      // Stage E - Master Glass Aperture Convex focal lens (Luminous Cyan reflective element)
      const lensGlassGeo = new THREE.SphereGeometry(0.48, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      lensGlassGeo.rotateX(Math.PI / 2);
      const lensGlass = new THREE.Mesh(lensGlassGeo, neonAuraMaterial);
      lensGlass.position.set(0, 0, 1.68);
      intercomGroup.add(lensGlass);

      // 5. Dual Active Indicator LED Beacons (Recording / Sensor trackers)
      const tallyBaseGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.12, 16);
      tallyBaseGeo.rotateX(Math.PI / 2);
      const tallyBase = new THREE.Mesh(tallyBaseGeo, polishedChromeMaterial);
      tallyBase.position.set(0.65, 0.5, 0.85);
      intercomGroup.add(tallyBase);

      const tallyLed = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), activeRedLedMaterial);
      tallyLed.position.set(0.65, 0.5, 0.92);
      intercomGroup.add(tallyLed);

      const sensorBaseGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.15, 16);
      sensorBaseGeo.rotateX(Math.PI / 2);
      const sensorBase = new THREE.Mesh(sensorBaseGeo, polishedChromeMaterial);
      sensorBase.position.set(-0.65, 0.5, 0.85);
      intercomGroup.add(sensorBase);

      const sensorGlass = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), neonPulseMaterial);
      sensorGlass.position.set(-0.65, 0.5, 0.94);
      intercomGroup.add(sensorGlass);

      // Keep animation variables compatible
      const beaconLeft = tallyLed;
      const beaconRight = sensorGlass;

      // 6. Slowly orbiting futuristic status telemetry halo ring
      const ringTorusGeo = new THREE.TorusGeometry(2.3, 0.035, 8, 48);
      const telemetryRing = new THREE.Mesh(ringTorusGeo, neonPulseMaterial);
      telemetryRing.rotation.x = Math.PI / 4;
      intercomGroup.add(telemetryRing);

      // CINEMATIC DARK MODE LIGHTING CONFIGURATION
      // 1. Ambient light configured extremely low (0.1) as requested to maintain deep rich black backdrop
      const lowAmbientLight = new THREE.AmbientLight(0xffffff, 0.08);
      scene.add(lowAmbientLight);
      
      // 2. High-contrast Rim Lights representing premium studio broadcast look:
      // Left-rear rim light (intense cyan-white illumination highlight)
      const rimLightLeft = new THREE.DirectionalLight(0x00f2fe, 5.5);
      rimLightLeft.position.set(-8, 4, -8);
      rimLightLeft.castShadow = true;
      rimLightLeft.shadow.bias = -0.0015;
      scene.add(rimLightLeft);
      
      // Right-rear rim light (intense warm white silhouette creator)
      const rimLightRight = new THREE.DirectionalLight(0xffffff, 6.0);
      rimLightRight.position.set(8, 4, -8);
      rimLightRight.castShadow = true;
      rimLightRight.shadow.bias = -0.0015;
      scene.add(rimLightRight);
      
      // Subtle organic key light from front-top to resolve matte chassis volume softly
      const keySoftFront = new THREE.DirectionalLight(0xffffff, 1.2);
      keySoftFront.position.set(2, 6, 6);
      scene.add(keySoftFront);

      // Additional accent spot reflecting on the shiny chrome & lens glass surfaces
      const blueAccentLight = new THREE.DirectionalLight(0x00f2fe, 1.5);
      blueAccentLight.position.set(-4, -2, 5);
      scene.add(blueAccentLight);
      
      // Coordinate mouse movement dynamics
      const mouse = { x: 0, y: 0 };
      const target = { x: 0, y: 0 };
      
      const handleMouseMoveLocal = (event: MouseEvent) => {
        const w = window.innerWidth || 1;
        const h = window.innerHeight || 1;
        const x = (event.clientX / w) * 2 - 1;
        const y = -(event.clientY / h) * 2 + 1;
        if (isFinite(x) && isFinite(y)) {
          mouse.x = x;
          mouse.y = y;
        }
      };
      
      window.addEventListener('mousemove', handleMouseMoveLocal);
      
      // Render loop animation & continuous orbits
      let time = 0;
      
      const animate = () => {
        if (!isMounted) return;
        
        try {
          animationId = requestAnimationFrame(animate);
          time += 0.015;
          
          // Gentle organic idle hover float pattern
          if (intercomGroup) {
            intercomGroup.position.y = Math.sin(time * 1.2) * 0.14;
          }
          
          // Steady rotation of the telemetry active laser ring
          if (telemetryRing) {
            telemetryRing.rotation.z += 0.02;
          }
          
          // Compute interactive targeting vector coordinate shifts
          target.x = mouse.x * 0.48;
          target.y = mouse.y * 0.38;
          
          // Smooth lerp follow cursor mechanics
          if (intercomGroup) {
            intercomGroup.rotation.y += (target.x - intercomGroup.rotation.y) * 0.08;
            intercomGroup.rotation.x += (-target.y - intercomGroup.rotation.x) * 0.08;
          }
          
          // Flashing frequency for the neon telemetry & warning beacon LEDs
          const flashFactor = Math.sin(time * 6);
          if (beaconLeft && beaconRight) {
            beaconLeft.scale.setScalar(0.7 + flashFactor * 0.3);
            beaconRight.scale.setScalar(0.7 + flashFactor * 0.3);
          }
          
          if (renderer) {
            renderer.render(scene, camera);
          }
        } catch (err) {
          console.warn('An error occurred during animation frame:', err);
          cancelAnimationFrame(animationId);
        }
      };
      
      animate();
      
      // Handle canvas resize updates dynamically
      const handleResize = () => {
        if (!isMounted || !container || !renderer) return;
        try {
          const w = container.clientWidth;
          const h = container.clientHeight || 500;
          
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        } catch (err) {
          console.warn('Resize handler error:', err);
        }
      };
      
      let resizeTimeoutId: number;
      const handleResizeThrottled = () => {
        if (!isMounted) return;
        cancelAnimationFrame(resizeTimeoutId);
        resizeTimeoutId = requestAnimationFrame(handleResize);
      };
      
      window.addEventListener('resize', handleResizeThrottled);
      
      return () => {
        isMounted = false;
        window.removeEventListener('mousemove', handleMouseMoveLocal);
        window.removeEventListener('resize', handleResizeThrottled);
        cancelAnimationFrame(resizeTimeoutId);
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
        if (renderer) {
          try {
            if (container && renderer.domElement && container.contains(renderer.domElement)) {
              container.removeChild(renderer.domElement);
            }
          } catch (e) {
            // Silently handle any DOM removal glitches
          }
          try {
            renderer.dispose();
          } catch (e) {
            // Silently handle any gl dispose issues
          }
          renderer = null;
        }
      };
    } catch (err) {
      console.warn('Three.js initialization failed, rendering fallback blueprint:', err);
      setWebglSupported(false);
    }
  }, [webglSupported]);
  
  return (
    <div className="relative w-full h-[380px] sm:h-[450px] lg:h-[550px] flex items-center justify-center">
      {/* Decorative wireframe tracking scope overlay */}
      <div className="absolute inset-x-8 inset-y-12 border border-zinc-900/40 pointer-events-none rounded-2xl flex items-center justify-center opacity-30">
        <div className="w-10 h-[1px] bg-cyan-500/50 absolute left-0" />
        <div className="w-10 h-[1px] bg-cyan-500/50 absolute right-0" />
        <div className="h-10 w-[1px] bg-cyan-500/50 absolute top-0" />
        <div className="h-10 w-[1px] bg-cyan-500/50 absolute bottom-0" />
        
        <div className="absolute w-4 h-4 border-l border-t border-cyan-500/60 top-4 left-4" />
        <div className="absolute w-4 h-4 border-r border-t border-cyan-500/60 top-4 right-4" />
        <div className="absolute w-4 h-4 border-l border-b border-cyan-500/60 bottom-4 left-4" />
        <div className="absolute w-4 h-4 border-r border-b border-cyan-500/60 bottom-4 right-4" />
      </div>

      {/* Target status indicators */}
      <div className="absolute top-6 left-12 flex items-center gap-2 pointer-events-none select-none z-10">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <span className="text-[9px] font-mono tracking-widest text-zinc-400 font-bold uppercase">
          {webglSupported ? 'FUTURISTIC 3D STUDIO CAMERA' : '2D BLUEPRINT CAMERA'}
        </span>
      </div>

      <div className="absolute bottom-6 right-12 flex items-center gap-1.5 pointer-events-none select-none z-10 text-[9px] font-mono text-zinc-400 tracking-wider">
        <span>OPTICAL ZOOM: ACTIVE</span>
      </div>

      {webglSupported ? (
        /* Actual 3D Container element */
        <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing animate-fade-in" />
      ) : (
        /* Cyber-Styled 2D Parallax Fallback Camera Blueprint Graphic */
        <div className="w-full h-full flex items-center justify-center relative overflow-hidden select-none">
          <svg 
            viewBox="0 0 600 400" 
            className="w-[85%] h-[85%] max-w-[400px] transition-transform duration-300 ease-out pointer-events-none text-zinc-100"
            style={{
              transform: `perspective(800px) rotateY(${mousePos.x * 20}deg) rotateX(${mousePos.y * 15}deg)`,
              filter: 'drop-shadow(0 15px 35px rgba(0, 0, 0, 0.7))'
            }}
          >
            {/* Soft inner glow ring */}
            <circle cx="300" cy="200" r="140" fill="none" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.1" strokeDasharray="3,3" />

            {/* Back handle (Parallax offset) */}
            <path 
              d="M 180 120 L 250 120 L 250 150" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="3.5" 
              strokeOpacity="0.4"
              style={{ transform: `translateX(${mousePos.x * -6}px) translateY(${mousePos.y * -4}px)` }}
            />

            {/* Main Camera Body (Deep slate metallic background) */}
            <rect 
              x="200" 
              y="150" 
              width="180" 
              height="110" 
              rx="12" 
              fill="#18181b" 
              stroke="#27272a" 
              strokeWidth="2.5" 
            />

            {/* Futuristic reflective glass visor band */}
            <rect 
              x="300" 
              y="150" 
              width="80" 
              height="110" 
              rx="4" 
              fill="#09090b" 
              fillOpacity="0.9"
              stroke="#2dd4bf" 
              strokeWidth="1"
              strokeOpacity="0.5"
              style={{ transform: `translateX(${mousePos.x * 3}px)` }}
            />

            {/* Top view finder monitor */}
            <rect 
              x="230" 
              y="110" 
              width="90" 
              height="40" 
              rx="6" 
              fill="#09090b" 
              stroke="#27272a" 
              strokeWidth="2" 
              style={{ transform: `translateX(${mousePos.x * 2}px)` }}
            />
            {/* Viewfinder monitor detail lines */}
            <line x1="240" y1="120" x2="260" y2="120" stroke="#2dd4bf" strokeWidth="1.5" strokeOpacity="0.8" style={{ transform: `translateX(${mousePos.x * 3}px)` }} />

            {/* Dual Lens Ring Bases */}
            <rect 
              x="380" 
              y="175" 
              width="35" 
              height="60" 
              rx="4" 
              fill="#27272a" 
              stroke="#3f3f46" 
              strokeWidth="1.5"
              style={{ transform: `translateX(${mousePos.x * 5}px) translateY(${mousePos.y * 2}px)` }}
            />
            {/* Golden luxury rings config */}
            <line 
              x1="395" 
              y1="175" 
              x2="395" 
              y2="235" 
              stroke="#d4af37" 
              strokeWidth="3.2" 
              style={{ transform: `translateX(${mousePos.x * 5.8}px) translateY(${mousePos.y * 2.2}px)` }}
            />

            {/* Cyan glowing frontend aperture */}
            <path 
              d="M 415 185 A 25 25 0 0 1 415 225" 
              fill="none" 
              stroke="#2dd4bf" 
              strokeWidth="4" 
              strokeLinecap="round"
              style={{ 
                transform: `translateX(${mousePos.x * 8}px) translateY(${mousePos.y * 3}px)`,
                filter: 'drop-shadow(0 0 6px rgba(45, 212, 191, 0.8))'
              }}
            />

            {/* Tally light blinker details */}
            <circle 
              cx="220" 
              cy="175" 
              r="5" 
              fill="#ef4444" 
              className="animate-pulse"
              style={{ transform: `translateX(${mousePos.x * -2}px) translateY(${mousePos.y * -1}px)` }}
            />

            <circle 
              cx="235" 
              cy="175" 
              r="3.5" 
              fill="#14b8a6" 
              style={{ transform: `translateX(${mousePos.x * -2}px) translateY(${mousePos.y * -1}px)` }}
            />

            {/* Interactive Grid Reticle Coordinates */}
            <g opacity="0.35" className="text-[10px] font-mono" fill="currentColor">
              <text x="350" y="320">X: {(mousePos.x * 100).toFixed(0)}</text>
              <text x="350" y="340">Y: {(mousePos.y * 100).toFixed(0)}</text>
              <text x="120" y="320">ORIENT_TRACK: ACTIVE</text>
            </g>
          </svg>
        </div>
      )}
    </div>
  );
}
