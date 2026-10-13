import React from 'react';
import {
  Sparkles,
  Play,
  RotateCcw,
  Zap,
  Info
} from 'lucide-react';
import { spawnMockIncident, resetMockData } from '../services/api';
import { socket } from '../services/socket';

export default function SimulationBar({ incidents, responders }) {
  const handleSpawn = async () => {
    try {
      await spawnMockIncident();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulateMovement = () => {
    // Find active incident with assigned responder
    const targetInc = incidents.find(i => i.status === 'ASSIGNED' || i.status === 'EN_ROUTE');
    if (targetInc && targetInc.assignedResponderId) {
      socket.emit('simulation:start_responder_movement', {
        responderId: targetInc.assignedResponderId,
        incidentId: targetInc.id
      });
    } else {
      alert('Spawn or select an assigned incident first to simulate live responder movement!');
    }
  };

  const handleReset = async () => {
    if (window.confirm('Reset all demo incidents and responder telemetry?')) {
      await resetMockData();
    }
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-y border-slate-800/80 px-4 sm:px-8 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-5 h-5 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <Zap className="w-3.5 h-3.5" />
          </span>
          <span className="font-extrabold text-white">Live Demo & Simulation Controls:</span>
          <span className="text-slate-400 hidden lg:inline">
            Test real-time matching, GPS telemetry, and WebSocket status transitions in 1-click.
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSpawn}
            className="px-3 py-1.5 bg-red-600/90 hover:bg-red-500 text-white font-bold rounded-xl transition-all shadow flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            + Simulate Citizen SOS
          </button>

          <button
            onClick={handleSimulateMovement}
            className="px-3 py-1.5 bg-amber-600/90 hover:bg-amber-500 text-white font-bold rounded-xl transition-all shadow flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Animate Responder Route
          </button>

          <button
            onClick={handleReset}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all border border-slate-700 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
