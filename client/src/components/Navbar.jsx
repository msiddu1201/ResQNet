import React from 'react';
import {
  ShieldAlert,
  Radio,
  UserCheck,
  LayoutDashboard,
  BellRing,
  Activity
} from 'lucide-react';

export default function Navbar({
  currentView,
  setCurrentView,
  activeIncidentsCount,
  isConnected
}) {
  const navItems = [
    { id: 'citizen', label: 'Citizen SOS', icon: ShieldAlert, desc: 'Report & Track' },
    { id: 'responder', label: 'Responder Unit', icon: UserCheck, desc: 'Accept & Dispatch' },
    { id: 'admin', label: 'Admin Command', icon: LayoutDashboard, desc: 'Tactical Overview' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center text-white shadow-lg shadow-red-950/60 font-black">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-tight text-white">ResQ<span className="text-red-500">Net</span></span>
              <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                v1.0 MVP
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Community Emergency & Resource Dispatch Grid</p>
          </div>
        </div>

        {/* View Switcher Pills */}
        <nav className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-2xl shadow-inner">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  isActive
                    ? 'bg-red-600 text-white shadow-lg shadow-red-950/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                {item.id === 'citizen' && activeIncidentsCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Live Status Indicators */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'
              }`}
            />
            <span className="font-mono text-[11px] text-slate-300">
              {isConnected ? 'GRID ONLINE' : 'CONNECTING...'}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 font-bold">
            <BellRing className="w-3.5 h-3.5 animate-bounce" />
            <span>{activeIncidentsCount} Active SOS</span>
          </div>
        </div>
      </div>
    </header>
  );
}
