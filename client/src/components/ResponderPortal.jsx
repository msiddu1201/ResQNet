import React, { useState } from 'react';
import {
  Shield,
  Activity,
  Flame,
  Car,
  MapPin,
  Phone,
  Navigation,
  CheckCircle,
  Clock,
  ArrowRight,
  AlertCircle,
  Play,
  HeartHandshake
} from 'lucide-react';
import {
  updateResponderStatus,
  updateIncidentStatus,
  updateHospitalBeds
} from '../services/api';
import { socket } from '../services/socket';

export default function ResponderPortal({
  responders,
  incidents,
  hospitals,
  currentResponderId,
  setCurrentResponderId,
  onSelectIncident
}) {
  const [actionLoading, setActionLoading] = useState(false);

  const currentResponder = responders.find(r => r.id === currentResponderId) || responders[0];

  // Incidents assigned to this responder
  const assignedIncident = currentResponder && currentResponder.assignedIncidentId
    ? incidents.find(i => i.id === currentResponder.assignedIncidentId)
    : null;

  // Other unassigned or available incidents
  const otherIncidents = incidents.filter(i =>
    i.status !== 'RESOLVED' &&
    (!assignedIncident || i.id !== assignedIncident.id)
  );

  const handleToggleDuty = async () => {
    if (!currentResponder) return;
    const newStatus = currentResponder.status === 'OFF_DUTY' ? 'AVAILABLE' : 'OFF_DUTY';
    await updateResponderStatus(currentResponder.id, newStatus);
  };

  const handleUpdateIncidentStatus = async (status, note) => {
    if (!assignedIncident || !currentResponder) return;
    setActionLoading(true);
    try {
      if (status === 'EN_ROUTE') {
        // Trigger live movement simulation over WebSocket
        socket.emit('simulation:start_responder_movement', {
          responderId: currentResponder.id,
          incidentId: assignedIncident.id
        });
      } else {
        await updateIncidentStatus(assignedIncident.id, status, note, currentResponder.id);
        if (status === 'RESOLVED') {
          await updateResponderStatus(currentResponder.id, 'AVAILABLE');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleHospitalAdmit = async (hospitalId) => {
    try {
      await updateHospitalBeds(hospitalId, -1);
      alert('Patient pre-admission confirmed! Hospital trauma bay alerted.');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Responder Switcher & Profile Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
              <Shield className="w-4 h-4" /> ResQNet First Responder Console
            </span>
            <h2 className="text-xl font-black text-white mt-0.5">Active Unit Dashboard</h2>
          </div>

          {/* Quick Profile Dropdown */}
          <div className="flex items-center gap-3">
            <label className="text-xs text-slate-400 font-bold">Operating As:</label>
            <select
              value={currentResponder?.id || ''}
              onChange={(e) => setCurrentResponderId(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-xs font-bold text-white rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
            >
              {responders.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Current Responder Card */}
        {currentResponder && (
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
            <div className="flex items-center gap-4">
              <img
                src={currentResponder.avatar}
                alt={currentResponder.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-lg"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-white text-base">{currentResponder.name}</h3>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase ${
                      currentResponder.status === 'AVAILABLE'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : currentResponder.status === 'EN_ROUTE'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : currentResponder.status === 'ON_SCENE'
                        ? 'bg-purple-500/20 text-purple-400 border-purple-500/40'
                        : 'bg-slate-700 text-slate-400 border-slate-600'
                    }`}
                  >
                    {currentResponder.status}
                  </span>
                </div>
                <p className="text-xs text-emerald-400 font-semibold">{currentResponder.role}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {currentResponder.skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-slate-900/90 text-slate-300 px-2 py-0.5 rounded-lg border border-slate-700"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleDuty}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-colors shadow-lg ${
                  currentResponder.status === 'OFF_DUTY'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                }`}
              >
                {currentResponder.status === 'OFF_DUTY' ? 'Go Available On Duty' : 'Go Off-Duty'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Assigned Emergency Card */}
      {assignedIncident ? (
        <div className="bg-slate-900 border-2 border-red-500/40 rounded-3xl p-6 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black uppercase px-4 py-1 rounded-bl-xl tracking-wider animate-pulse">
            DISPATCH ASSIGNMENT ACTIVE
          </div>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-red-400">
                  {assignedIncident.type} Emergency • Severity {assignedIncident.severity}/5
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-white">{assignedIncident.title}</h3>
              <p className="text-xs text-slate-300">{assignedIncident.description}</p>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400">Current Phase</span>
              <div className="text-base font-black text-amber-400 uppercase tracking-wide">
                {assignedIncident.status}
              </div>
            </div>
          </div>

          {/* Incident Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 block mb-0.5">Location</span>
              <span className="text-white font-bold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-red-400" />
                {assignedIncident.location.address || `${assignedIncident.location.lat}, ${assignedIncident.location.lng}`}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Reporter Contact</span>
              <span className="text-white font-bold flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                {assignedIncident.reporterName} ({assignedIncident.reporterPhone})
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Assigned Facility</span>
              <span className="text-white font-bold flex items-center gap-1">
                <HeartHandshake className="w-3.5 h-3.5 text-blue-400" />
                {hospitals[0]?.name || 'Metro Central'}
              </span>
            </div>
          </div>

          {/* Workflow Action Buttons */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Dispatch Progression Actions
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                disabled={actionLoading || assignedIncident.status === 'EN_ROUTE'}
                onClick={() => handleUpdateIncidentStatus('EN_ROUTE', 'Responder departed and traveling to scene.')}
                className="p-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                Start Travel (En Route)
              </button>

              <button
                disabled={actionLoading || assignedIncident.status === 'ON_SCENE'}
                onClick={() => handleUpdateIncidentStatus('ON_SCENE', 'Responder arrived on scene. Administering care.')}
                className="p-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
              >
                <MapPin className="w-4 h-4" />
                Mark Arrived On Scene
              </button>

              <button
                disabled={actionLoading}
                onClick={() => handleUpdateIncidentStatus('RESOLVED', 'Situation resolved successfully. Patient stabilized.')}
                className="p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
              >
                <CheckCircle className="w-4 h-4" />
                Resolve & Clear Unit
              </button>
            </div>
          </div>

          {/* Hospital Pre-Admit Action */}
          <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-400">
              Need immediate trauma bay reservation for patient transport?
            </span>
            <button
              onClick={() => handleHospitalAdmit(hospitals[0]?.id || 'hosp-1')}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors shadow"
            >
              Reserve Hospital Trauma Bay (-1 Bed)
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-3 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">All Clear • Unit on Standby</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {currentResponder?.name} is ready for new dispatches. You will be alerted immediately when an emergency matches your profile and location.
          </p>
        </div>
      )}

      {/* Other Active Incidents in Sector */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400" /> Active Grid Incidents ({otherIncidents.length})
        </h3>

        {otherIncidents.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No other unassigned incidents.</p>
        ) : (
          <div className="space-y-3">
            {otherIncidents.map(inc => (
              <div
                key={inc.id}
                onClick={() => onSelectIncident && onSelectIncident(inc)}
                className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex flex-wrap items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-600 text-white">
                      Sev {inc.severity}
                    </span>
                    <span className="text-xs font-bold text-white">{inc.title}</span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">{inc.description}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 font-mono">Status: {inc.status}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateIncidentStatus(inc.id, 'ASSIGNED', `Manually accepted by ${currentResponder.name}`, currentResponder.id);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-600 text-white text-xs font-bold transition-colors"
                  >
                    Accept Incident
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
