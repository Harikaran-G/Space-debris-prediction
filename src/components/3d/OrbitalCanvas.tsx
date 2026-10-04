import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';
import * as THREE from 'three';
import { SpaceObject, Conjunction, RiskLevel } from '../../types';
import { getOrbitPoints, THREE_EARTH_RADIUS, calculateOrbitalPoint } from '../../services/dataService';
import {
  RotateCcw,
  Orbit,
  MapPin,
  Clock,
  Layers
} from 'lucide-react';

interface OrbitalCanvasProps {
  objects: SpaceObject[];
  selectedObject: SpaceObject | null;
  onSelectObject: (obj: SpaceObject) => void;
  conjunctions?: Conjunction[];
  showSatellites?: boolean;
  showDebris?: boolean;
  showOrbits?: boolean;
  showPredictedPath?: boolean;
  showConjunctionLines?: boolean;
  timeOffsetHours?: number;
  riskFilter?: RiskLevel | 'All';
  maxAltitudeFilter?: number;
  className?: string;
  onToggleOrbits?: () => void;
  onToggleGroundTrack?: () => void;
  showGroundTrack?: boolean;
}

// Procedural Canvas Earth Texture Generator
function createEarthCanvasTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Deep ocean (IN PIECES #1A1A1D)
  ctx.fillStyle = '#1A1A1D';
  ctx.fillRect(0, 0, 1024, 512);

  // Lat / Long grid lines (#34343D)
  ctx.strokeStyle = '#34343D';
  ctx.lineWidth = 1;

  for (let lat = 0; lat <= 512; lat += 512 / 12) {
    ctx.beginPath();
    ctx.moveTo(0, lat);
    ctx.lineTo(1024, lat);
    ctx.stroke();
  }
  for (let lon = 0; lon <= 1024; lon += 1024 / 24) {
    ctx.beginPath();
    ctx.moveTo(lon, 0);
    ctx.lineTo(lon, 512);
    ctx.stroke();
  }

  // Continent shapes (#302026 with #6F2232 / #950740 borders)
  ctx.fillStyle = '#2C2025';
  ctx.strokeStyle = '#6F2232';
  ctx.lineWidth = 1.3;

  // Continents vector paths
  ctx.beginPath();
  ctx.ellipse(250, 150, 90, 60, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(320, 320, 60, 90, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(540, 140, 50, 40, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(550, 260, 65, 80, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(720, 160, 110, 70, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(820, 350, 50, 40, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// 3D Earth Globe
const EarthSphere: React.FC = () => {
  const earthRef = useRef<THREE.Mesh>(null);
  const texture = useMemo(() => createEarthCanvasTexture(), []);

  useFrame((_, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.025;
    }
  });

  return (
    <group>
      <mesh ref={earthRef}>
        <sphereGeometry args={[THREE_EARTH_RADIUS, 48, 48]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.7}
          metalness={0.1}
          emissive="#0A0F1D"
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Subtle Atmosphere Ring */}
      <mesh>
        <sphereGeometry args={[THREE_EARTH_RADIUS * 1.025, 32, 32]} />
        <meshBasicMaterial
          color="#950740"
          transparent
          opacity={0.06}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Equator Guide */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[THREE_EARTH_RADIUS * 1.001, THREE_EARTH_RADIUS * 1.004, 64]} />
        <meshBasicMaterial color="#4E4E50" transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

// Object marker in 3D orbit
interface ObjectMarkerProps {
  object: SpaceObject;
  isSelected: boolean;
  timeOffsetHours: number;
  onSelect: (obj: SpaceObject) => void;
  onHover: (obj: SpaceObject | null) => void;
}

const ObjectMarker: React.FC<ObjectMarkerProps> = ({
  object,
  isSelected,
  timeOffsetHours,
  onSelect,
  onHover,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  const position = useMemo(() => {
    if (timeOffsetHours === 0) return object.position;
    const anomalyDeltaDeg = (360 / (object.period || 95)) * (timeOffsetHours * 60);
    const totalAnomalyRad = (((object.meanAnomaly + anomalyDeltaDeg) % 360) * Math.PI) / 180;
    return calculateOrbitalPoint(
      object.semiMajorAxis,
      object.eccentricity,
      object.inclination,
      object.raan,
      object.argPerigee,
      totalAnomalyRad
    );
  }, [object, timeOffsetHours]);

  let color = '#38BDF8'; // Satellites: Bright Sky Blue (#38BDF8)
  if (object.riskLevel === 'Critical') color = '#EF4444'; // Critical: Bright Red (#EF4444)
  else if (object.riskLevel === 'High') color = '#F43F5E'; // High Risk: Crimson (#F43F5E)
  else if (object.type === 'Debris' || object.type === 'Rocket Body') color = '#F59E0B'; // Debris: Warm Amber (#F59E0B)

  if (isSelected) color = '#FEFFFF';

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(object);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(object);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onHover(null);
        }}
      >
        <sphereGeometry args={[isSelected ? 0.08 : 0.05, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 2.5 : 1.4}
          roughness={0.3}
        />
      </mesh>

      {/* Selected Reticle */}
      {isSelected && (
        <mesh>
          <ringGeometry args={[0.11, 0.13, 32]} />
          <meshBasicMaterial color="#38BDF8" side={THREE.DoubleSide} transparent opacity={0.85} />
        </mesh>
      )}
    </group>
  );
};

// Orbital Path
const OrbitalPath: React.FC<{
  object: SpaceObject;
  isSelected: boolean;
  showPredicted?: boolean;
}> = ({ object, isSelected, showPredicted }) => {
  const points = useMemo(() => getOrbitPoints(object, 64), [object]);
  const vectorPoints = useMemo(() => points.map((p) => new THREE.Vector3(...p)), [points]);

  let lineColor = '#4E4E50';
  let opacity = 0.3;
  let lineWidth = 1;

  if (object.riskLevel === 'Critical') {
    lineColor = '#EF4444';
    opacity = 0.75;
    lineWidth = 1.5;
  } else if (object.riskLevel === 'High') {
    lineColor = '#F43F5E';
    opacity = 0.6;
  } else if (object.type === 'Debris' || object.type === 'Rocket Body') {
    lineColor = '#D97706';
    opacity = 0.35;
  } else if (object.type === 'Satellite') {
    lineColor = '#0284C7';
    opacity = 0.45;
  }

  if (isSelected) {
    lineColor = '#38BDF8';
    opacity = 0.95;
    lineWidth = 2.2;
  }

  return (
    <group>
      <Line
        points={vectorPoints}
        color={lineColor}
        lineWidth={lineWidth}
        transparent
        opacity={opacity}
      />
      {isSelected && showPredicted && (
        <Line
          points={vectorPoints.slice(0, Math.floor(vectorPoints.length * 0.5))}
          color="#FEFFFF"
          lineWidth={2}
          dashed
          dashScale={6}
          dashSize={0.25}
          dashOffset={0}
        />
      )}
    </group>
  );
};

// Conjunction Beam
const ConjunctionBeam: React.FC<{ conjunction: Conjunction }> = ({ conjunction }) => {
  const posA = new THREE.Vector3(...conjunction.objectA.position);
  const posB = new THREE.Vector3(...conjunction.objectB.position);
  const isCritical = conjunction.riskLevel === 'Critical';

  return (
    <group>
      <Line
        points={[posA, posB]}
        color={isCritical ? '#C3073F' : '#950740'}
        lineWidth={1.5}
        dashed
        dashScale={8}
        dashSize={0.3}
      />
      <mesh position={posA.clone().add(posB).multiplyScalar(0.5)}>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshBasicMaterial color={isCritical ? '#C3073F' : '#950740'} />
      </mesh>
    </group>
  );
};

// Camera Controller
const CameraController: React.FC<{ resetTrigger: number }> = ({ resetTrigger }) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (resetTrigger > 0) {
      camera.position.set(0, 3.2, 6.2);
      camera.lookAt(0, 0, 0);
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      }
    }
  }, [resetTrigger, camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={2.8}
      maxDistance={20.0}
      rotateSpeed={0.6}
      zoomSpeed={0.8}
    />
  );
};

export const OrbitalCanvas: React.FC<OrbitalCanvasProps> = ({
  objects,
  selectedObject,
  onSelectObject,
  conjunctions = [],
  showSatellites = true,
  showDebris = true,
  showOrbits = true,
  showPredictedPath = true,
  showConjunctionLines = true,
  timeOffsetHours = 0,
  riskFilter = 'All',
  maxAltitudeFilter = 2000,
  className = '',
  onToggleOrbits,
  onToggleGroundTrack,
  showGroundTrack,
}) => {
  const [hoveredObj, setHoveredObj] = useState<SpaceObject | null>(null);
  const [resetCount, setResetCount] = useState(0);

  const filteredObjects = useMemo(() => {
    return objects.filter((obj) => {
      if (!showSatellites && obj.type === 'Satellite') return false;
      if (!showDebris && (obj.type === 'Debris' || obj.type === 'Rocket Body')) return false;
      if (riskFilter !== 'All' && obj.riskLevel !== riskFilter) return false;
      if (obj.altitude > maxAltitudeFilter) return false;
      return true;
    });
  }, [objects, showSatellites, showDebris, riskFilter, maxAltitudeFilter]);

  return (
    <div className={`relative w-full h-full bg-[#1A1A1D] overflow-hidden select-none ${className}`}>

      {/* 3D WebGL Canvas */}
      <Canvas
        camera={{ position: [0, 3.2, 6.2], fov: 45 }}
        gl={{ antialias: true }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <color attach="background" args={['#1A1A1D']} />
        <ambientLight intensity={0.75} />
        <directionalLight position={[10, 8, 12]} intensity={1.5} color="#FEFFFF" />
        <pointLight position={[-10, -5, -10]} intensity={0.4} color="#C3073F" />

        <EarthSphere />

        {/* Orbits */}
        {showOrbits &&
          filteredObjects.map((obj) => (
            <OrbitalPath
              key={`orbit-${obj.id}`}
              object={obj}
              isSelected={selectedObject?.id === obj.id}
              showPredicted={showPredictedPath}
            />
          ))}

        {/* Conjunction Lines */}
        {showConjunctionLines &&
          conjunctions.map((conj) => (
            <ConjunctionBeam key={`conj-beam-${conj.id}`} conjunction={conj} />
          ))}

        {/* 3D Object Markers */}
        {filteredObjects.map((obj) => (
          <ObjectMarker
            key={`marker-${obj.id}`}
            object={obj}
            isSelected={selectedObject?.id === obj.id}
            timeOffsetHours={timeOffsetHours}
            onSelect={(o) => onSelectObject(o)}
            onHover={(o) => setHoveredObj(o)}
          />
        ))}

        <CameraController resetTrigger={resetCount} />
      </Canvas>

      {/* Floating View Controls (Top Left) */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-1.5 pointer-events-auto">
        <button
          onClick={() => setResetCount((c) => c + 1)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono shadow transition-colors"
          title="Reset Camera View"
        >
          <RotateCcw className="w-3.5 h-3.5 text-brand-300" />
          <span>Reset</span>
        </button>

        {onToggleOrbits && (
          <button
            onClick={onToggleOrbits}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded border text-xs font-mono transition-colors ${showOrbits
                ? 'bg-brand-700/90 border-brand-500/50 text-[#FEFFFF]'
                : 'bg-slate-900/90 border-slate-700 text-slate-400'
              }`}
          >
            <Orbit className="w-3.5 h-3.5" />
            <span>Show Orbits</span>
          </button>
        )}

        {onToggleGroundTrack && (
          <button
            onClick={onToggleGroundTrack}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded border text-xs font-mono transition-colors ${showGroundTrack
                ? 'bg-brand-700/90 border-brand-500/50 text-[#FEFFFF]'
                : 'bg-slate-900/90 border-slate-700 text-slate-400'
              }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Ground Track</span>
          </button>
        )}

        {timeOffsetHours > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-slate-850 border border-slate-700 text-brand-300 text-xs font-mono">
            <Clock className="w-3 h-3" />
            <span>+{timeOffsetHours}h</span>
          </div>
        )}
      </div>

      {/* Hover Object Tooltip Card (Exact format requested) */}
      {hoveredObj && (
        <div className="absolute bottom-3 right-3 z-30 p-3 rounded bg-slate-900/95 border border-slate-700 text-xs font-mono shadow-xl pointer-events-none min-w-[200px]">
          <div className="font-bold text-slate-100 mb-1 border-b border-slate-800 pb-1 flex items-center justify-between">
            <span>{hoveredObj.id}</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${hoveredObj.riskLevel === 'Critical' ? 'badge-critical' : hoveredObj.riskLevel === 'High' ? 'badge-high' : 'badge-low'
              }`}>
              {hoveredObj.riskLevel}
            </span>
          </div>
          <div className="space-y-0.5 text-slate-300 text-[11px]">
            <div>Type: <span className="text-slate-100">{hoveredObj.type}</span></div>
            <div>Altitude: <span className="text-slate-100">{hoveredObj.altitude} km</span></div>
            <div>Velocity: <span className="text-slate-100">{hoveredObj.velocity} km/s</span></div>
            <div>Risk: <span className="text-slate-100 font-semibold">{hoveredObj.riskLevel} ({hoveredObj.riskProbability}%)</span></div>
          </div>
          <div className="mt-1.5 pt-1 border-t border-slate-800 text-[10px] text-slate-400">
            Click to inspect parameters
          </div>
        </div>
      )}

      {/* Bottom Left Legend */}
      <div className="absolute bottom-3 left-3 z-20 pointer-events-none hidden sm:flex items-center gap-3 px-2.5 py-1 rounded bg-slate-900/90 border border-slate-750 text-[10px] font-mono text-slate-300 shadow-md">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8] shadow-[0_0_8px_#38BDF8]" />
          <span className="font-medium text-slate-200">Satellites</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shadow-[0_0_8px_#F59E0B]" />
          <span className="font-medium text-slate-200">Debris</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] shadow-[0_0_8px_#EF4444]" />
          <span className="font-medium text-slate-200">High Risk</span>
        </div>
      </div>

    </div>
  );
};
