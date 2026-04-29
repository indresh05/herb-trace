import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text, Sphere, MeshDistortMaterial, Line, OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

const STAGES = [
  { id: 'farmer', label: 'Farmer', position: [-8, 0, 0], color: '#2E7D32' },
  { id: 'collection', label: 'Collection Center', position: [-4, 2, 0], color: '#D89B1D' },
  { id: 'processing', label: 'Processing Unit', position: [0, 0, 0], color: '#1F2933' },
  { id: 'lab', label: 'Lab Test', position: [4, 2, 0], color: '#0F3D2E' },
  { id: 'exporter', label: 'Exporter', position: [8, 0, 0], color: '#2E7D32' },
  { id: 'customer', label: 'QR Customer Scan', position: [12, 1, 0], color: '#D89B1D' },
];

const Node = ({ position, label, color, isPulse }) => {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group position={position}>
        <Sphere args={[0.5, 32, 32]}>
          <MeshDistortMaterial
            color={color}
            speed={isPulse ? 4 : 1.5}
            distort={0.4}
            radius={1}
            emissive={color}
            emissiveIntensity={0.5}
          />
        </Sphere>
        <Text
          position={[0, -1, 0]}
          fontSize={0.4}
          color="#0F3D2E"
          font="https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxM.woff"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      </group>
    </Float>
  );
};

const BlockchainBlock = ({ start, end, delay }) => {
  const meshRef = useRef();
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(...start),
      new THREE.Vector3((start[0] + end[0]) / 2, (start[1] + end[1]) / 2 + 1, (start[2] + end[2]) / 2),
      new THREE.Vector3(...end),
    ]);
  }, [start, end]);

  useFrame(({ clock }) => {
    const t = ((clock.getElapsedTime() + delay) % 3) / 3;
    const pos = curve.getPoint(t);
    meshRef.current.position.copy(pos);
    meshRef.current.rotation.x += 0.05;
    meshRef.current.rotation.y += 0.05;
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[0.2, 0.2, 0.2]} />
      <meshStandardMaterial color="#D89B1D" emissive="#D89B1D" emissiveIntensity={2} />
    </mesh>
  );
};

const Connections = () => {
  return (
    <>
      {STAGES.slice(0, -1).map((stage, i) => (
        <React.Fragment key={`conn-${i}`}>
          <Line
            points={[stage.position, STAGES[i + 1].position]}
            color="#0F3D2E"
            lineWidth={1}
            dashed
            dashScale={2}
            dashSize={0.2}
            gapSize={0.1}
          />
          <BlockchainBlock start={stage.position} end={STAGES[i + 1].position} delay={i * 0.5} />
        </React.Fragment>
      ))}
    </>
  );
};

const HerbTrace3DJourney = () => {
  return (
    <div className="w-full h-[500px] bg-herb-cream/30 rounded-3xl overflow-hidden relative border border-herb-deep/10 shadow-inner">
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <group position={[-2, 0, 0]}>
          {STAGES.map((stage) => (
            <Node
              key={stage.id}
              position={stage.position}
              label={stage.label}
              color={stage.color}
              isPulse={stage.id === 'lab'}
            />
          ))}
          <Connections />
        </group>

        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-herb-deep/40 text-xs font-medium tracking-widest uppercase pointer-events-none">
        Interactive 3D Blockchain Journey
      </div>
    </div>
  );
};

export default HerbTrace3DJourney;
