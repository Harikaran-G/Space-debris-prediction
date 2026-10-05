import React, { useState, useEffect } from 'react';
import { SpaceObject, Conjunction, AlertItem, DataSourceInfo, RiskLevel, AlertStatus } from './types';
import { dataService } from './services';
import { Header, Sidebar, TabId, Footer } from './components/layout';
import {
  KpiCards,
  CriticalConjunctions,
  RiskDistributionChart,
  RiskTrendChart,
  AltitudeDistributionChart
} from './components/dashboard';
import { OrbitalCanvas } from './components/3d';
import { OrbitalMapControls } from './components/orbital';
import { DebrisTable } from './components/debris';
import { CollisionPredictionPage } from './components/conjunctions';
import { AlertCenter } from './components/alerts';
import { AnalyticsPage } from './components/analytics';
import { ObjectDetailsView, ObjectDetailsDrawer } from './components/object-detail';
import { MLModelPage } from './components/ml';
import { WhatIfSimulator } from './components/simulation';
import { GroundTrackMap } from './components/groundtrack';
import { SettingsPage } from './components/settings';
import { Globe2, Maximize2, Database } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Core datasets
  const [objects, setObjects] = useState<SpaceObject[]>([]);
  const [conjunctions, setConjunctions] = useState<Conjunction[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [dataSource, setDataSource] = useState<DataSourceInfo>({
    name: 'Live Astrodynamics Engine',
    provider: 'CelesTrak / Space-Track / User Ingestion',
    status: 'Standby',
    totalObjects: 0,
    lastUpdated: 'Catalog Empty (Awaiting Ingestion)',
    dataQuality: 'High Fidelity (SGP4/SDP4)',
    coverage: 'Global LEO / MEO / GEO',
    apiLatencyMs: 0
  });

  // Selected object and Drawer State
  const [selectedObject, setSelectedObject] = useState<SpaceObject | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFullDetailsView, setIsFullDetailsView] = useState(false);

  // Map Controls State - Default to Satellite mode as requested
  const [mapObjectType, setMapObjectType] = useState<'All' | 'Satellites' | 'Debris'>('Satellites');
  const [mapRiskFilter, setMapRiskFilter] = useState<RiskLevel | 'All'>('All');
  const [mapMaxAltitude, setMapMaxAltitude] = useState<number>(2000);
  const [mapTimeOffset, setMapTimeOffset] = useState<number>(0);
  const [showOrbits, setShowOrbits] = useState<boolean>(true);
  const [showGroundTrack, setShowGroundTrack] = useState<boolean>(false);
  const [showPredictedPath, setShowPredictedPath] = useState<boolean>(true);
  const [showConjunctionLines, setShowConjunctionLines] = useState<boolean>(true);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [objs, conjs, alts, ds] = await Promise.all([
        dataService.getObjects(),
        dataService.getConjunctions(),
        dataService.getAlerts(),
        dataService.getDataSourceInfo()
      ]);
      setObjects(objs);
      setConjunctions(conjs);
      setAlerts(alts);
      setDataSource(ds);
      if (objs.length > 0) {
        setSelectedObject(objs[0]);
      } else {
        setSelectedObject(null);
      }
    } finally {
      setTimeout(() => setIsRefreshing(false), 300);
    }
  };

  // Pull real-time CelesTrak active telemetry stream on demand
  const handleFetchLive = async () => {
    setIsRefreshing(true);
    try {
      const liveObjs = await dataService.fetchLiveTelemetry();
      const conjs = await dataService.getConjunctions();
      const alts = await dataService.getAlerts();
      const ds = await dataService.getDataSourceInfo();
      setObjects(liveObjs);
      setConjunctions(conjs);
      setAlerts(alts);
      setDataSource(ds);
      if (liveObjs.length > 0) {
        setSelectedObject(liveObjs[0]);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  // Drawer & Object Selection handlers
  const handleOpenObjectDrawer = (obj: SpaceObject) => {
    setSelectedObject(obj);
    setIsDrawerOpen(true);
  };

  const handleViewFullDetails = (obj: SpaceObject) => {
    setSelectedObject(obj);
    setIsDrawerOpen(false);
    setIsFullDetailsView(true);
  };

  const handleViewTrajectory = (conj: Conjunction | AlertItem) => {
    const objA = objects.find((o) => o.id === ('objectAId' in conj ? conj.objectAId : conj.objectA.id));
    if (objA) {
      setSelectedObject(objA);
      setIsDrawerOpen(true);
    }
    setActiveTab('map');
  };

  const handleUpdateAlertStatus = async (alertId: string, status: AlertStatus) => {
    await dataService.updateAlertStatus(alertId, status);
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status } : a))
    );
  };

  // Delete individual object from catalog
  const handleDeleteObject = async (id: string) => {
    dataService.deleteObject(id);
    const [objs, conjs, alts, ds] = await Promise.all([
      dataService.getObjects(),
      dataService.getConjunctions(),
      dataService.getAlerts(),
      dataService.getDataSourceInfo()
    ]);
    setObjects(objs);
    setConjunctions(conjs);
    setAlerts(alts);
    setDataSource(ds);
    if (selectedObject?.id === id) {
      setIsDrawerOpen(false);
      setSelectedObject(objs[0] || null);
    }
  };

  // Purge entire catalog & processed data
  const handleClearCatalog = () => {
    dataService.clearAllObjects();
    setObjects([]);
    setConjunctions([]);
    setAlerts([]);
    setDataSource({
      name: 'Live Astrodynamics Engine',
      provider: 'CelesTrak / Space-Track / User Ingestion',
      status: 'Standby',
      totalObjects: 0,
      lastUpdated: 'Catalog Cleared',
      dataQuality: 'High Fidelity (SGP4/SDP4)',
      coverage: 'Global LEO / MEO / GEO',
      apiLatencyMs: 0
    });
    setIsDrawerOpen(false);
    setSelectedObject(null);
  };

  // Restore Space-Track default baseline
  const handleResetCatalog = () => {
    dataService.clearAllObjects();
    setObjects([]);
    setConjunctions([]);
    setAlerts([]);
    setDataSource({
      name: 'Live Astrodynamics Engine',
      provider: 'CelesTrak / Space-Track / User Ingestion',
      status: 'Standby',
      totalObjects: 0,
      lastUpdated: 'Catalog Empty',
      dataQuality: 'High Fidelity (SGP4/SDP4)',
      coverage: 'Global LEO / MEO / GEO',
      apiLatencyMs: 0
    });
    setIsDrawerOpen(false);
    setSelectedObject(null);
  };

  const handleGlobalSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() && activeTab !== 'tracking' && activeTab !== 'dashboard') {
      setActiveTab('tracking');
    }
  };

  // Dynamic Header Titles
  const pageHeaderMap: Record<TabId, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Monitor orbital objects and identify potential close approaches.'
    },
    map: {
      title: 'Orbital Map',
      subtitle: '3D ephemeris trajectory visualization and orbital regime inspection.'
    },
    tracking: {
      title: 'Space Objects',
      subtitle: 'Comprehensive catalog of active satellites, rocket bodies, and debris fragments.'
    },
    prediction: {
      title: 'Collision Risk Prediction',
      subtitle: 'Machine learning conjunction assessment and explainable factor attribution.'
    },
    alerts: {
      title: 'Conjunction Alerts',
      subtitle: 'Operational conjunction screening log and investigation workflow.'
    },
    analytics: {
      title: 'Orbital Analytics',
      subtitle: 'Population density, relative velocity kinematics, and risk trends.'
    },
    model: {
      title: 'ML Model Information',
      subtitle: 'Model architecture specifications, training metrics, and feature weights.'
    },
    simulation: {
      title: 'Orbital What-If Simulator',
      subtitle: 'Delta-V maneuver simulator for conjunction mitigation and risk comparison.'
    },
    settings: {
      title: 'System Settings',
      subtitle: 'Data source status, coordinate systems, and API service configuration.'
    }
  };

  const activeHeader = isFullDetailsView
    ? { title: `Object Details: ${selectedObject?.name || ''}`, subtitle: 'State vectors, orbital history, and conjunction assessment.' }
    : pageHeaderMap[activeTab];

  return (
    <div className="h-screen w-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-blue-500/20 selection:text-blue-300 overflow-hidden">

      {/* Top Header - Static & Fixed at Top */}
      <Header
        pageTitle={activeHeader.title}
        pageSubtitle={activeHeader.subtitle}
        onSearch={handleGlobalSearch}
        searchQuery={searchQuery}
        onRefresh={loadData}
        isRefreshing={isRefreshing}
        dataSource={dataSource}
        onOpenSettings={() => {
          setIsFullDetailsView(false);
          setActiveTab('settings');
        }}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onOpenAlerts={() => {
          setIsFullDetailsView(false);
          setActiveTab('alerts');
        }}
        alertCount={alerts.filter((a) => a.riskLevel === 'Critical' && a.status === 'New').length}
      />

      {/* Body Area - Fixed height flex container */}
      <div className="flex-1 flex w-full overflow-hidden relative">
        {/* Left Sidebar - Static in place, all items in one view without scroll */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setIsFullDetailsView(false);
            setActiveTab(tab);
            setIsMobileMenuOpen(false);
          }}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          alertCount={alerts.filter((a) => a.riskLevel === 'Critical' && a.status === 'New').length}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Viewport - Scaled automatically when drawer is open to prevent data from being hidden */}
        <main className={`flex-1 h-full overflow-y-auto overflow-x-hidden p-4 lg:p-6 transition-all duration-300 ${
          isDrawerOpen ? 'lg:mr-96' : 'mr-0'
        }`}>

          {/* Full Object Details Page (When clicked from drawer) */}
          {isFullDetailsView && selectedObject ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-750">
                <button
                  onClick={() => setIsFullDetailsView(false)}
                  className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-medium"
                >
                  ← Back to {activeTab.toUpperCase()}
                </button>
              </div>
              <ObjectDetailsView
                object={selectedObject}
                allObjects={objects}
                conjunctions={conjunctions}
                onSelectAnotherObject={(obj) => setSelectedObject(obj)}
              />
            </div>
          ) : (
            <>
              {/* ========================================================= */}
              {/* 1. DASHBOARD OVERVIEW PAGE */}
              {/* ========================================================= */}
              {activeTab === 'dashboard' && (
                <div className="space-y-4">

                  {/* KPI Cards */}
                  <KpiCards objects={objects} conjunctions={conjunctions} alerts={alerts} />

                  {/* Main Grid: 3D Visualization (65% width) + Critical Conjunctions (35% width) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

                    {/* 3D Visualization (8 cols = ~67%) */}
                    <div className="lg:col-span-8 flex flex-col gap-4">
                      <div className="surface-card overflow-hidden flex flex-col h-[400px] sm:h-[460px] lg:h-[500px]">
                        <div className="p-3 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Globe2 className="w-4 h-4 text-brand" />
                            <span className="font-semibold text-xs text-slate-100 uppercase tracking-wide">
                              Orbital Visualization
                            </span>
                          </div>

                          <button
                            onClick={() => setActiveTab('map')}
                            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-mono transition-colors"
                          >
                            <Maximize2 className="w-3 h-3" />
                            <span>Full Map</span>
                          </button>
                        </div>

                        <div className="flex-1 relative w-full h-full">
                          <OrbitalCanvas
                            objects={objects}
                            selectedObject={selectedObject}
                            onSelectObject={handleOpenObjectDrawer}
                            conjunctions={conjunctions}
                            showSatellites={mapObjectType !== 'Debris'}
                            showDebris={mapObjectType !== 'Satellites'}
                            showOrbits={showOrbits}
                            showPredictedPath={showPredictedPath}
                            showConjunctionLines={showConjunctionLines}
                            timeOffsetHours={mapTimeOffset}
                            riskFilter={mapRiskFilter}
                            maxAltitudeFilter={mapMaxAltitude}
                            onToggleOrbits={() => setShowOrbits(!showOrbits)}
                            onToggleGroundTrack={() => setShowGroundTrack(!showGroundTrack)}
                            showGroundTrack={showGroundTrack}
                          />
                        </div>
                      </div>

                      {/* 2D Mercator Ground Track (Rendered when Ground Track button is clicked) */}
                      {showGroundTrack && (
                        <GroundTrackMap
                          objects={objects}
                          selectedObject={selectedObject}
                          onSelectObject={handleOpenObjectDrawer}
                          onClose={() => setShowGroundTrack(false)}
                        />
                      )}
                    </div>

                    {/* Critical Conjunctions Panel (4 cols = ~33%) */}
                    <div className="lg:col-span-4">
                      <CriticalConjunctions
                        conjunctions={conjunctions}
                        onViewTrajectory={handleViewTrajectory}
                        onOpenDrawer={handleOpenObjectDrawer}
                      />
                    </div>

                  </div>

                  {/* Analytics Charts Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    <RiskDistributionChart objects={objects} />
                    <RiskTrendChart />
                    <div className="md:col-span-2 xl:col-span-1">
                      <AltitudeDistributionChart objects={objects} />
                    </div>
                  </div>

                  {/* System & Data Source Footer Panel */}
                  <div className="surface-card p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono text-slate-400">
                    <div className="flex items-center gap-2">
                      <span>Data Source: <strong className="text-slate-200">{dataSource.name}</strong></span>
                      <span className="text-slate-600">|</span>
                      <span>Objects Loaded: <strong className="text-slate-200">{dataSource.totalObjects.toLocaleString()}</strong></span>
                      <span className="text-slate-600">|</span>
                      <span className="text-emerald-400">Status: {dataSource.status}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Last Updated: <strong className="text-slate-200">{dataSource.lastUpdated}</strong>
                    </div>
                  </div>

                </div>
              )}

              {/* ========================================================= */}
              {/* 2. ORBITAL MAP PAGE */}
              {/* ========================================================= */}
              {activeTab === 'map' && (
                <div className="space-y-4">
                  <OrbitalMapControls
                    objectTypeFilter={mapObjectType}
                    onChangeObjectType={setMapObjectType}
                    riskFilter={mapRiskFilter}
                    onChangeRiskFilter={setMapRiskFilter}
                    maxAltitude={mapMaxAltitude}
                    onChangeMaxAltitude={setMapMaxAltitude}
                    timeOffsetHours={mapTimeOffset}
                    onChangeTimeOffset={setMapTimeOffset}
                    showOrbits={showOrbits}
                    onToggleOrbits={() => setShowOrbits(!showOrbits)}
                    showGroundTrack={showGroundTrack}
                    onToggleGroundTrack={() => setShowGroundTrack(!showGroundTrack)}
                    showPredictedPath={showPredictedPath}
                    onTogglePredictedPath={() => setShowPredictedPath(!showPredictedPath)}
                    showConjunctionLines={showConjunctionLines}
                    onToggleConjunctionLines={() => setShowConjunctionLines(!showConjunctionLines)}
                  />

                  <div className="surface-card overflow-hidden h-[460px] sm:h-[540px] lg:h-[620px] relative">
                    <OrbitalCanvas
                      objects={objects}
                      selectedObject={selectedObject}
                      onSelectObject={handleOpenObjectDrawer}
                      conjunctions={conjunctions}
                      showSatellites={mapObjectType !== 'Debris'}
                      showDebris={mapObjectType !== 'Satellites'}
                      showOrbits={showOrbits}
                      showPredictedPath={showPredictedPath}
                      showConjunctionLines={showConjunctionLines}
                      timeOffsetHours={mapTimeOffset}
                      riskFilter={mapRiskFilter}
                      maxAltitudeFilter={mapMaxAltitude}
                      onToggleOrbits={() => setShowOrbits(!showOrbits)}
                      onToggleGroundTrack={() => setShowGroundTrack(!showGroundTrack)}
                      showGroundTrack={showGroundTrack}
                    />
                  </div>

                  {showGroundTrack && (
                    <GroundTrackMap
                      objects={objects}
                      selectedObject={selectedObject}
                      onSelectObject={handleOpenObjectDrawer}
                      onClose={() => setShowGroundTrack(false)}
                    />
                  )}
                </div>
              )}

              {/* ========================================================= */}
              {/* 3. SPACE OBJECTS (DEBRIS & SATELLITES TABLE) */}
              {/* ========================================================= */}
              {activeTab === 'tracking' && (
                <div className="space-y-4">
                  <DebrisTable
                    objects={objects}
                    onSelectObject={handleOpenObjectDrawer}
                    onImportObjects={async () => {
                      const [objs, conjs, alts, ds] = await Promise.all([
                        dataService.getObjects(),
                        dataService.getConjunctions(),
                        dataService.getAlerts(),
                        dataService.getDataSourceInfo()
                      ]);
                      setObjects(objs);
                      setConjunctions(conjs);
                      setAlerts(alts);
                      setDataSource(ds);
                      if (objs.length > 0 && !selectedObject) {
                        setSelectedObject(objs[0]);
                      }
                    }}
                    onDeleteObject={handleDeleteObject}
                    onClearCatalog={handleClearCatalog}
                    onResetCatalog={handleResetCatalog}
                    onFetchLive={handleFetchLive}
                  />
                </div>
              )}

              {/* ========================================================= */}
              {/* 4. PREDICTIONS PAGE */}
              {/* ========================================================= */}
              {activeTab === 'prediction' && (
                <CollisionPredictionPage
                  objects={objects}
                  initialObjectA={conjunctions[0]?.objectA}
                  initialObjectB={conjunctions[0]?.objectB}
                />
              )}

              {/* ========================================================= */}
              {/* 5. ALERTS PAGE */}
              {/* ========================================================= */}
              {activeTab === 'alerts' && (
                <AlertCenter
                  alerts={alerts}
                  onUpdateStatus={handleUpdateAlertStatus}
                  onViewTrajectory={handleViewTrajectory}
                  onViewDetails={(id) => {
                    const found = objects.find((o) => o.id === id);
                    if (found) handleOpenObjectDrawer(found);
                  }}
                />
              )}

              {/* ========================================================= */}
              {/* 6. ANALYTICS PAGE */}
              {/* ========================================================= */}
              {activeTab === 'analytics' && <AnalyticsPage />}

              {/* ========================================================= */}
              {/* 7. ML MODEL PAGE */}
              {/* ========================================================= */}
              {activeTab === 'model' && <MLModelPage />}

              {/* ========================================================= */}
              {/* 8. SIMULATION PAGE */}
              {/* ========================================================= */}
              {activeTab === 'simulation' && <WhatIfSimulator objects={objects} />}

              {/* ========================================================= */}
              {/* 9. SETTINGS PAGE */}
              {/* ========================================================= */}
              {activeTab === 'settings' && (
                <SettingsPage
                  dataSource={dataSource}
                  onClearCatalog={handleClearCatalog}
                  onResetCatalog={handleResetCatalog}
                />
              )}
            </>
          )}

        </main>

        {/* Right-Side Object Details Drawer (Docks into reserved margin space) */}
        <ObjectDetailsDrawer
          object={selectedObject}
          conjunctions={conjunctions}
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onViewFullDetails={handleViewFullDetails}
          onDeleteObject={handleDeleteObject}
        />
      </div>

      {/* Scientific Disclaimer Footer */}
      <Footer />

    </div>
  );
}

export default App;
