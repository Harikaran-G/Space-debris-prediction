import React, { useState, useMemo } from 'react';
import { SpaceObject, RiskLevel, ObjectType } from '../../types';
import { dataService } from '../../services/dataService';
import {
  Search,
  Download,
  Upload,
  FileSpreadsheet,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Satellite,
  Trash2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Compass,
  CheckCircle2,
  RotateCcw,
  Radio
} from 'lucide-react';

interface DebrisTableProps {
  objects: SpaceObject[];
  onSelectObject: (obj: SpaceObject) => void;
  selectedObjectId?: string;
  onImportObjects?: (imported: SpaceObject[]) => void;
  onDeleteObject?: (id: string) => void;
  onClearCatalog?: () => void;
  onResetCatalog?: () => void;
  onFetchLive?: () => void;
}

type SortField =
  | 'id'
  | 'name'
  | 'type'
  | 'altitude'
  | 'velocity'
  | 'inclination'
  | 'eccentricity'
  | 'riskProbability'
  | 'lastUpdated';

export const DebrisTable: React.FC<DebrisTableProps> = ({
  objects,
  onSelectObject,
  selectedObjectId,
  onImportObjects,
  onDeleteObject,
  onClearCatalog,
  onResetCatalog,
  onFetchLive,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<ObjectType | 'All'>('All');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'All'>('All');
  const [sortField, setSortField] = useState<SortField>('riskProbability');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileCardMode, setMobileCardMode] = useState(true); // Default to clean cards on small screens
  const [importNotice, setImportNotice] = useState<string | null>(null);
  const rowsPerPage = 8;

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const imported = dataService.importFromCsv(content);
        if (imported.length > 0) {
          setImportNotice(`Successfully loaded ${imported.length} orbital objects from ${file.name}!`);
          if (onImportObjects) {
            onImportObjects(imported);
          }
          setTimeout(() => setImportNotice(null), 5000);
        } else {
          setImportNotice(`Warning: No valid rows found in ${file.name}.`);
          setTimeout(() => setImportNotice(null), 5000);
        }
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const processedObjects = useMemo(() => {
    let result = objects.filter((obj) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          obj.name.toLowerCase().includes(q) ||
          obj.id.toLowerCase().includes(q) ||
          obj.noradId.includes(q) ||
          (obj.origin && obj.origin.toLowerCase().includes(q));
        if (!matches) return false;
      }
      if (typeFilter !== 'All' && obj.type !== typeFilter) return false;
      if (riskFilter !== 'All' && obj.riskLevel !== riskFilter) return false;
      return true;
    });

    result.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [objects, searchQuery, typeFilter, riskFilter, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(processedObjects.length / rowsPerPage));
  const currentObjects = processedObjects.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleExportCsv = () => {
    const csvContent = dataService.exportToCsv(processedObjects);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `space_debris_catalog_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-600 opacity-60" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-cyan-400" />
    ) : (
      <ArrowDown className="w-3 h-3 text-cyan-400" />
    );
  };

  return (
    <div className="space-y-3">
      
      {/* Top Controls Toolbar */}
      <div className="glass-panel rounded-xl p-3 sm:p-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 text-xs font-mono">
        
        {/* Search */}
        <div className="relative flex-1 max-w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search NORAD, Name, Origin..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 sm:py-1.5 bg-space-950/80 border border-slate-700/80 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-xs min-h-[40px] sm:min-h-[36px]"
          />
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Type Filter */}
          <div className="flex-1 sm:flex-initial flex items-center gap-1 bg-space-950 px-2.5 py-1.5 rounded-lg border border-slate-800 min-h-[40px] sm:min-h-[36px]">
            <span className="text-slate-400 text-[11px]">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer w-full sm:w-auto"
            >
              <option value="All" className="bg-space-900">All Objects</option>
              <option value="Satellite" className="bg-space-900">Satellites</option>
              <option value="Debris" className="bg-space-900">Debris</option>
              <option value="Rocket Body" className="bg-space-900">Rocket Bodies</option>
            </select>
          </div>

          {/* Risk Filter */}
          <div className="flex-1 sm:flex-initial flex items-center gap-1 bg-space-950 px-2.5 py-1.5 rounded-lg border border-slate-800 min-h-[40px] sm:min-h-[36px]">
            <span className="text-slate-400 text-[11px]">Risk:</span>
            <select
              value={riskFilter}
              onChange={(e) => {
                setRiskFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer w-full sm:w-auto"
            >
              <option value="All" className="bg-space-900">All Risks</option>
              <option value="Low" className="bg-space-900">Low (&lt;30%)</option>
              <option value="Medium" className="bg-space-900">Medium (30-60%)</option>
              <option value="High" className="bg-space-900">High (60-85%)</option>
              <option value="Critical" className="bg-space-900">Critical (&gt;85%)</option>
            </select>
          </div>

          {/* Mobile Card / Table Toggle */}
          <button
            onClick={() => setMobileCardMode(!mobileCardMode)}
            className="md:hidden flex items-center justify-center min-w-[40px] h-10 px-2.5 bg-slate-800 text-brand border border-slate-700 rounded-lg text-xs"
            title="Toggle Card / Table View"
          >
            {mobileCardMode ? <List className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
          </button>

          {/* Hidden File Input for CSV / Excel upload */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileImport}
            accept=".csv, .txt, .tsv"
            className="hidden"
          />

          {/* Fetch Live Telemetry */}
          {onFetchLive && (
            <button
              onClick={onFetchLive}
              className="flex items-center justify-center gap-1.5 px-3 h-10 sm:h-9 bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 rounded-lg transition-all active:scale-95 text-xs font-semibold shadow"
              title="Pull real-time active orbital data from CelesTrak"
            >
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>FETCH LIVE STREAM</span>
            </button>
          )}

          {/* Import CSV / Excel */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-1.5 px-3 h-10 sm:h-9 bg-slate-800 hover:bg-slate-750 text-slate-100 border border-slate-700 rounded-lg transition-all active:scale-95 text-xs font-semibold"
            title="Upload and parse custom CSV / Excel spreadsheet"
          >
            <Upload className="w-3.5 h-3.5 text-brand" />
            <span>IMPORT CSV/EXCEL</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCsv}
            className="flex items-center justify-center gap-1.5 px-3 h-10 sm:h-9 bg-brand-700 hover:bg-brand-600 text-white border border-brand-500/50 rounded-lg transition-all active:scale-95 text-xs font-semibold shadow"
            title="Download CSV Catalog (Opens in Excel / Sheets)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT CSV</span>
          </button>

          {/* Reset Baseline Default */}
          {onResetCatalog && (
            <button
              onClick={() => {
                if (window.confirm('Reset catalog back to baseline Space-Track dataset?')) {
                  onResetCatalog();
                  setImportNotice('Restored baseline orbital catalog (12 objects).');
                  setTimeout(() => setImportNotice(null), 4000);
                }
              }}
              className="flex items-center justify-center gap-1.5 px-2.5 h-10 sm:h-9 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 border border-slate-700 rounded-lg transition-all active:scale-95 text-xs font-semibold"
              title="Reset catalog back to initial default satellites and debris"
            >
              <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">RESET</span>
            </button>
          )}

          {/* Clear All Ingested / Processed Data */}
          {onClearCatalog && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete ALL data and purge the entire catalog? This action will remove all processed telemetry.')) {
                  onClearCatalog();
                  setImportNotice('Catalog purged. All orbital telemetry records deleted.');
                  setTimeout(() => setImportNotice(null), 4000);
                }
              }}
              className="flex items-center justify-center gap-1.5 px-2.5 h-10 sm:h-9 bg-red-950/40 hover:bg-red-900/80 text-red-300 hover:text-white border border-red-500/40 rounded-lg transition-all active:scale-95 text-xs font-semibold"
              title="Purge all records and delete processed data"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span>CLEAR ALL</span>
            </button>
          )}

        </div>

      </div>

      {/* Import / Delete Notification Banner */}
      {importNotice && (
        <div className="p-3 bg-slate-850 border border-brand-500/50 text-slate-100 rounded-lg font-mono text-xs flex items-center justify-between gap-2 shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{importNotice}</span>
          </div>
          <button
            onClick={() => setImportNotice(null)}
            className="text-slate-400 hover:text-slate-200 text-xs px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. Mobile Cards View (Displayed on Mobile when cardMode is active) */}
      <div className={`${mobileCardMode ? 'block md:hidden' : 'hidden'} space-y-2.5`}>
        {currentObjects.length === 0 ? (
          <div className="p-8 text-center text-slate-500 font-mono glass-panel rounded-xl">
            <AlertTriangle className="w-6 h-6 mx-auto text-amber-500 mb-2 opacity-80" />
            No objects in catalog. Ingest a CSV or click RESET to reload default baseline data.
          </div>
        ) : (
          currentObjects.map((obj) => {
            const isSelected = selectedObjectId === obj.id;
            return (
              <div
                key={`mob-card-${obj.id}`}
                onClick={() => onSelectObject(obj)}
                className={`p-3.5 rounded-xl glass-panel border transition-all duration-150 active:scale-[0.99] ${
                  isSelected ? 'border-cyan-400 bg-cyan-950/30' : 'border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="text-sm font-bold text-slate-100">{obj.name}</div>
                    <div className="text-[11px] text-cyan-300 font-mono">{obj.id} • NORAD {obj.noradId}</div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                      obj.riskLevel === 'Critical'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                        : obj.riskLevel === 'High'
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                    }`}
                  >
                    {obj.riskLevel.toUpperCase()} ({obj.riskProbability}%)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-space-950/60 p-2.5 rounded-lg border border-slate-800/80 mb-3">
                  <div>Type: <strong className="text-slate-200">{obj.type}</strong></div>
                  <div>Altitude: <strong className="text-slate-200">{obj.altitude} km</strong></div>
                  <div>Velocity: <strong className="text-slate-200">{obj.velocity} km/s</strong></div>
                  <div>Inclination: <strong className="text-slate-200">{obj.inclination}°</strong></div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectObject(obj);
                    }}
                    className="flex-1 py-2 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 rounded-lg text-xs font-bold font-mono flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>INSPECT</span>
                  </button>
                  {onDeleteObject && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete ${obj.name} (${obj.id}) from catalog?`)) {
                          onDeleteObject(obj.id);
                          setImportNotice(`Deleted ${obj.name} (${obj.id}) from catalog.`);
                          setTimeout(() => setImportNotice(null), 4000);
                        }
                      }}
                      className="px-3 py-2 bg-red-950/40 hover:bg-red-900/80 border border-red-500/40 text-red-300 rounded-lg text-xs font-bold font-mono flex items-center justify-center gap-1 active:scale-95"
                      title="Delete this record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>DELETE</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 2. Desktop / Scrollable Table View */}
      <div className={`${mobileCardMode ? 'hidden md:block' : 'block'} glass-panel rounded-xl border border-slate-800/90 overflow-hidden shadow-glass`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs text-slate-300 min-w-[700px]">
            
            <thead className="bg-space-950/90 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th onClick={() => handleSort('id')} className="py-3 px-3.5 cursor-pointer hover:text-cyan-300">
                  <div className="flex items-center gap-1">
                    <span>Object ID</span>
                    {renderSortIcon('id')}
                  </div>
                </th>
                <th onClick={() => handleSort('name')} className="py-3 px-3.5 cursor-pointer hover:text-cyan-300">
                  <div className="flex items-center gap-1">
                    <span>Designation & Origin</span>
                    {renderSortIcon('name')}
                  </div>
                </th>
                <th onClick={() => handleSort('type')} className="py-3 px-3.5 cursor-pointer hover:text-cyan-300">
                  <div className="flex items-center gap-1">
                    <span>Type</span>
                    {renderSortIcon('type')}
                  </div>
                </th>
                <th onClick={() => handleSort('altitude')} className="py-3 px-3.5 cursor-pointer hover:text-cyan-300">
                  <div className="flex items-center gap-1">
                    <span>Altitude</span>
                    {renderSortIcon('altitude')}
                  </div>
                </th>
                <th onClick={() => handleSort('velocity')} className="py-3 px-3.5 cursor-pointer hover:text-cyan-300">
                  <div className="flex items-center gap-1">
                    <span>Velocity</span>
                    {renderSortIcon('velocity')}
                  </div>
                </th>
                <th onClick={() => handleSort('inclination')} className="py-3 px-3.5 cursor-pointer hover:text-cyan-300">
                  <div className="flex items-center gap-1">
                    <span>Inc (°)</span>
                    {renderSortIcon('inclination')}
                  </div>
                </th>
                <th onClick={() => handleSort('riskProbability')} className="py-3 px-3.5 cursor-pointer hover:text-cyan-300">
                  <div className="flex items-center gap-1">
                    <span>ML Risk</span>
                    {renderSortIcon('riskProbability')}
                  </div>
                </th>
                <th className="py-3 px-3.5 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {currentObjects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-mono">
                    <AlertTriangle className="w-6 h-6 mx-auto text-amber-500 mb-2 opacity-80" />
                    No space objects match criteria.
                  </td>
                </tr>
              ) : (
                currentObjects.map((obj) => {
                  const isSelected = selectedObjectId === obj.id;
                  return (
                    <tr
                      key={obj.id}
                      onClick={() => onSelectObject(obj)}
                      className={`cursor-pointer transition-all duration-150 ${
                        isSelected
                          ? 'bg-cyan-950/40 border-l-4 border-cyan-400 text-slate-100'
                          : 'hover:bg-space-900/60'
                      }`}
                    >
                      <td className="py-3 px-3.5 font-bold text-cyan-300 flex flex-col">
                        <span>{obj.id}</span>
                        <span className="text-[10px] text-slate-500 font-normal">NORAD {obj.noradId}</span>
                      </td>

                      <td className="py-3 px-3.5">
                        <div className="font-semibold text-slate-200 truncate max-w-[200px]">{obj.name}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[200px]">{obj.origin || 'Unknown'}</div>
                      </td>

                      <td className="py-3 px-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                            obj.type === 'Satellite'
                              ? 'bg-blue-950 text-blue-300 border border-blue-500/30'
                              : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {obj.type === 'Satellite' ? <Satellite className="w-3 h-3" /> : <Trash2 className="w-3 h-3" />}
                          {obj.type}
                        </span>
                      </td>

                      <td className="py-3 px-3.5 font-semibold text-slate-200">
                        {obj.altitude.toLocaleString()} km
                      </td>

                      <td className="py-3 px-3.5 text-slate-300">
                        {obj.velocity.toFixed(2)} km/s
                      </td>

                      <td className="py-3 px-3.5 text-slate-300">
                        {obj.inclination.toFixed(1)}°
                      </td>

                      <td className="py-3 px-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            obj.riskLevel === 'Critical'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                              : obj.riskLevel === 'High'
                              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                          }`}
                        >
                          {obj.riskLevel.toUpperCase()} ({obj.riskProbability}%)
                        </span>
                      </td>

                      <td className="py-3 px-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectObject(obj);
                            }}
                            className="p-2 rounded-lg bg-space-850 hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 border border-slate-700/80 transition-all min-h-[36px] min-w-[36px]"
                            title="Inspect Orbital State"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {onDeleteObject && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`Delete ${obj.name} (${obj.id}) from catalog?`)) {
                                  onDeleteObject(obj.id);
                                  setImportNotice(`Deleted ${obj.name} (${obj.id}) from catalog.`);
                                  setTimeout(() => setImportNotice(null), 4000);
                                }
                              }}
                              className="p-2 rounded-lg bg-space-850 hover:bg-red-950/80 text-slate-400 hover:text-red-400 border border-slate-700/80 hover:border-red-500/50 transition-all min-h-[36px] min-w-[36px]"
                              title="Delete this object from catalog"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 bg-space-950/90 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-slate-400">
          <div>
            Showing <span className="text-slate-200 font-semibold">{Math.min(processedObjects.length, (currentPage - 1) * rowsPerPage + 1)}</span> to{' '}
            <span className="text-slate-200 font-semibold">{Math.min(processedObjects.length, currentPage * rowsPerPage)}</span> of{' '}
            <span className="text-cyan-300 font-semibold">{processedObjects.length}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded bg-space-900 border border-slate-800 disabled:opacity-40 hover:bg-space-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 bg-space-900 border border-slate-800 rounded font-semibold text-slate-200">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded bg-space-900 border border-slate-800 disabled:opacity-40 hover:bg-space-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
