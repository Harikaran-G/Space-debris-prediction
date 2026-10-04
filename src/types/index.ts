export type ObjectType = 'Satellite' | 'Debris' | 'Rocket Body' | 'Unknown';

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type AlertStatus = 'New' | 'Investigating' | 'Monitoring' | 'Resolved';

export type OrbitType = 'LEO' | 'MEO' | 'GEO' | 'SSO' | 'HEO';

export interface SpaceObject {
  id: string;
  noradId: string;
  name: string;
  type: ObjectType;
  orbitType: OrbitType;
  altitude: number; // km
  velocity: number; // km/s
  inclination: number; // degrees
  eccentricity: number;
  period: number; // minutes
  semiMajorAxis: number; // km
  raan: number; // Right Ascension of Ascending Node (deg)
  argPerigee: number; // Argument of Perigee (deg)
  meanAnomaly: number; // degrees
  latitude: number;
  longitude: number;
  position: [number, number, number]; // 3D coordinates (scaled for Three.js)
  velocityVector: [number, number, number]; // km/s
  riskProbability: number; // percentage (0 - 100)
  riskLevel: RiskLevel;
  estimatedSize: string; // e.g., "1.8 m²" or "0.15 m"
  launchDate?: string;
  origin?: string; // Country / Agency e.g., "USA / NASA", "ESA", "ISRO"
  lastUpdated: string;
  rcs?: 'Small' | 'Medium' | 'Large'; // Radar Cross Section
  apogee?: number; // km
  perigee?: number; // km
  decayPredicted?: string;
}

export interface Conjunction {
  id: string;
  objectA: SpaceObject;
  objectB: SpaceObject;
  closestApproachDistance: number; // km (e.g. 0.42 km)
  relativeVelocity: number; // km/s (e.g. 11.2 km/s)
  timeToClosestApproach: string; // e.g. "04h 18m"
  tcaEpoch: string; // ISO string
  collisionProbability: number; // percentage (e.g. 84.6%)
  riskLevel: RiskLevel;
  missDistanceRadial: number; // km
  missDistanceInTrack: number; // km
  missDistanceCrossTrack: number; // km
  positionUncertainty: number; // meters
  status: AlertStatus;
  notes?: string;
}

export interface MLPrediction {
  id: string;
  objectIdA: string;
  objectIdB: string;
  timestamp: string;
  probability: number;
  riskLevel: RiskLevel;
  confidence: number; // e.g. 94%
  modelVersion: string;
  featureImportance: {
    feature: string;
    importance: number; // percentage 0 - 100
    value: string;
    impact: 'critical' | 'high' | 'moderate' | 'low';
  }[];
  shapValues: {
    feature: string;
    shapValue: number;
  }[];
}

export interface AlertItem {
  id: string;
  conjunctionId: string;
  objectAId: string;
  objectAName: string;
  objectBId: string;
  objectBName: string;
  riskProbability: number;
  closestApproach: number; // km
  timeToEvent: string;
  relativeVelocity: number; // km/s
  riskLevel: RiskLevel;
  status: AlertStatus;
  detectedAt: string;
  reviewedBy?: string;
}

export interface ModelMetrics {
  name: string;
  version: string;
  task: string;
  accuracy: number | null;
  precision: number | null;
  recall: number | null;
  f1Score: number | null;
  rocAuc: number | null;
  isBackendConnected: boolean;
  trainingDataset: string;
  totalSamples: number;
  lastTrainedDate: string;
  confusionMatrix: {
    truePositive: number;
    falsePositive: number;
    trueNegative: number;
    falseNegative: number;
  } | null;
  rocCurveData: {
    fpr: number;
    tpr: number;
  }[];
}

export interface SimulationParams {
  targetObjectId: string;
  deltaAltitude: number; // km (-100 to +100)
  deltaVelocity: number; // m/s (-50 to +50)
  deltaInclination: number; // deg (-5 to +5)
  burnDuration: number; // seconds
  maneuverEpochMinutes: number; // minutes from now
}

export interface SimulationResult {
  originalObject: SpaceObject;
  simulatedObject: SpaceObject;
  originalRisk: number;
  simulatedRisk: number;
  originalTCA: string;
  simulatedTCA: string;
  originalDistance: number;
  simulatedDistance: number;
  fuelCostDeltaV: number; // m/s
  feasibility: 'Optimal' | 'Sub-optimal' | 'High Fuel Cost' | 'Insufficient Time';
}

export interface DataSourceInfo {
  name: string;
  provider: string;
  status: 'Connected' | 'Standby' | 'Synchronizing' | 'Demo Mode';
  totalObjects: number;
  lastUpdated: string;
  dataQuality: string;
  coverage: string;
  apiLatencyMs: number;
}
