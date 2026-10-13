import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Users,
  Building2,
  Clock,
  Filter,
  PlusCircle,
  RotateCcw,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  MapPin
} from 'lucide-react';
import {
  updateIncidentStatus,
  assignResponder,
  spawnMockIncident,
  resetMockData
} from '../services/api';

export default function AdminDashboard({
  incidents = [],
  responders = [],
  hospitals = [],
  selectedIncident,
  onSelectIncident
}) {
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [assigningIncidentId, setAssigningIncidentId] = useState(null);
  const [selectedResponderToAssign, setSelectedResponderToAssign] = useState('');

  // Key Performance Indicators (KPIs)
  const activeIncidents = incidents.filter(i => i.status !== 'RESOLVED' && i.status !== 'CANCELLED');
  const criticalCount = activeIncidents.filter(i => i.severity >= 4).length;
  const availableResponders = responders.filter(r => r.status === 'AVAILABLE').length;
  const totalBeds = hospitals.reduce((acc, h) => acc + h.availableBeds, 0);
  const totalIcu = hospitals.reduce((acc, h) => acc + h.icuBedsAvailable, 0);

  // Filtered incidents
  const filteredIncidents = incidents.filter(inc => {
    if (filterType !== 'ALL' && inc.type !== filterType) return false;
    if (filterStatus === 'ACTIVE' && (inc.status === 'RESOLVED' || inc.status === 'CANCELLED')) return false;
    if (filterStatus === 'RESOLVED' && inc.status !== 'RESOLVED') return false;
    if (filterStatus === 'CRITICAL' && inc.severity < 4) return false;
    return true;
  });

  const handleSpawnEmergency = async () => {
    try {
      await spawnMockIncident();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetData = async () => {
    if (window.confirm('Reset all incidents, responders, and hospitals back to baseline?')) {
      try {
        await resetMockData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAssignSubmit = async (incidentId) => {
    if (!selectedResponderToAssign) return;
    try {
      await assignResponder(incidentId, selectedResponderToAssign);
      setAssigningIncidentId(null);
      setSelectedResponderToAssign('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Tactical KPI Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Active Emergencies
            </span>
            <div className="text-3xl font-black text-white flex items-center gap-2">
              {activeIncidents.length}
              {criticalCount > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-600/30 text-red-400 border border-red-500/40">
                  {criticalCount} Critical
                </span>
              )}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Responders Ready
            </span>
            <div className="text-3xl font-black text-emerald-400">
              {availableResponders} <span className="text-sm font-semibold text-slate-400">/ {responders.length}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Avg Response Time
            </span>
            <div className="text-3xl font-black text-cyan-400">
              3.8 <span className="text-xs font-bold text-slate-400">mins</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Sector Bed Capacity
            </span>
            <div className="text-3xl font-black text-blue-400">
              {totalBeds} <span className="text-xs font-bold text-amber-400">({totalIcu} ICU)</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Incident Command Table & Dispatch Console */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-black text-white">Live Incident Command Queue</h2>
            <p className="text-xs text-slate-400">
              Real-time multi-agency monitoring, automatic dispatch matching, and supervisory override.
            </p>
          </div>

          {/* Quick Simulation Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSpawnEmergency}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all shadow flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" /> Simulate Emergency
            </button>
            <button
              onClick={handleResetData}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all border border-slate-700 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Seeds
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="font-bold text-slate-400">Type:</span>
            {['ALL', 'Medical', 'Fire', 'Accident', 'Disaster'].map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                  filterType === t
                    ? 'bg-red-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">Status:</span>
            {['ALL', 'ACTIVE', 'CRITICAL', 'RESOLVED'].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                  filterStatus === s
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Incident List */}
        <div className="space-y-3">
          {filteredIncidents.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              No incidents matching current filter criteria.
            </div>
          ) : (
            filteredIncidents.map(inc => {
              const assignedResp = responders.find(r => r.id === inc.assignedResponderId);
              const isSelected = selectedIncident && selectedIncident.id === inc.id;

              return (
                <div
                  key={inc.id}
                  onClick={() => onSelectIncident && onSelectIncident(inc)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/90 border-amber-400 shadow-xl'
                      : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Left: Metadata */}
                    <div className="space-y-1.5 flex-1 min-w-[280px]">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded text-white ${
                            inc.severity >= 5
                              ? 'bg-red-600'
                              : inc.severity === 4
                              ? 'bg-orange-500'
                              : 'bg-amber-500'
                          }`}
                        >
                          LVL {inc.severity}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          {inc.type}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-xs text-slate-500 font-mono">{inc.id}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-xs text-slate-400">
                          {new Date(inc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <h4 className="font-bold text-white text-base">{inc.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-1">{inc.description}</p>

                      <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-red-400" />
                          {inc.location.address || `${inc.location.lat}, ${inc.location.lng}`}
                        </span>
                        <span>Reporter: <strong className="text-slate-300">{inc.reporterName}</strong></span>
                      </div>
                    </div>

                    {/* Middle: Assigned Responder */}
                    <div className="text-xs space-y-1 min-w-[180px]">
                      <span className="text-slate-500 uppercase text-[10px] font-bold block">Assigned Unit</span>
                      {assignedResp ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={assignedResp.avatar}
                            alt={assignedResp.name}
                            className="w-7 h-7 rounded-full object-cover border border-emerald-400"
                          />
                          <div>
                            <div className="text-white font-bold">{assignedResp.name}</div>
                            <div className="text-[10px] text-emerald-400">{assignedResp.role}</div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-amber-400 font-bold">Unassigned / Pending</span>
                      )}
                    </div>

                    {/* Right: Status Pill & Actions */}
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-black uppercase px-3 py-1 rounded-full border ${
                          inc.status === 'RESOLVED'
                            ? 'bg-slate-800 text-slate-400 border-slate-700'
                            : inc.status === 'EN_ROUTE'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse'
                            : inc.status === 'ON_SCENE'
                            ? 'bg-purple-500/20 text-purple-400 border-purple-500/40'
                            : 'bg-red-500/20 text-red-400 border-red-500/40'
                        }`}
                      >
                        {inc.status}
                      </span>

                      {/* Manual Override Action */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setAssigningIncidentId(inc.id);
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors"
                      >
                        Reassign
                      </button>

                      {inc.status !== 'RESOLVED' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateIncidentStatus(inc.id, 'RESOLVED', 'Resolved by Dispatch Commander');
                          }}
                          className="px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white text-xs font-bold rounded-xl transition-colors"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Manual Assignment Modal / Inline Form */}
                  {assigningIncidentId === inc.id && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center gap-3 text-xs"
                    >
                      <span className="font-bold text-slate-300">Assign Responder:</span>
                      <select
                        value={selectedResponderToAssign}
                        onChange={(e) => setSelectedResponderToAssign(e.target.value)}
                        className="bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-1.5"
                      >
                        <option value="">Select available responder...</option>
                        {responders.map(r => (
                          <option key={r.id} value={r.id}>
                            {r.name} ({r.role} - {r.status})
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleAssignSubmit(inc.id)}
                        className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-lg"
                      >
                        Confirm Assignment
                      </button>
                      <button
                        onClick={() => setAssigningIncidentId(null)}
                        className="px-2 py-1.5 text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Facilities & Fleet Telemetry Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hospitals Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-400" /> Hospital Resource Grid
          </h3>

          <div className="space-y-3">
            {hospitals.map(hosp => (
              <div
                key={hosp.id}
                className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-white text-xs">{hosp.name}</h4>
                  <p className="text-[11px] text-slate-400">{hosp.traumaLevel}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-right">
                  <div>
                    <span className="text-emerald-400 font-extrabold text-sm">{hosp.availableBeds}</span>
                    <span className="text-[10px] text-slate-500 block">Beds</span>
                  </div>
                  <div>
                    <span className="text-amber-400 font-extrabold text-sm">{hosp.icuBedsAvailable}</span>
                    <span className="text-[10px] text-slate-500 block">ICU</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Responders Fleet Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" /> Active Responder Fleet
          </h3>

          <div className="space-y-3">
            {responders.map(r => (
              <div
                key={r.id}
                className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={r.avatar}
                    alt={r.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-white text-xs">{r.name}</h4>
                    <p className="text-[11px] text-slate-400">{r.role}</p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase border ${
                    r.status === 'AVAILABLE'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : r.status === 'EN_ROUTE'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
