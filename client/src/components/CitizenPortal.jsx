import React, { useState } from 'react';
import {
  AlertTriangle,
  Flame,
  Activity,
  Car,
  ShieldAlert,
  Camera,
  MapPin,
  Send,
  PhoneCall,
  CheckCircle2,
  Clock,
  Navigation,
  Check,
  UserCheck
} from 'lucide-react';
import { createIncident } from '../services/api';

const CATEGORIES = [
  { id: 'Medical', label: 'Medical Emergency', icon: Activity, color: 'text-red-400 border-red-500/30 bg-red-500/10' },
  { id: 'Fire', label: 'Fire & Smoke', icon: Flame, color: 'text-orange-400 border-orange-500/30 bg-orange-500/10' },
  { id: 'Accident', label: 'Traffic / Crash', icon: Car, color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
  { id: 'Disaster', label: 'Disaster / Flood', icon: ShieldAlert, color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' },
  { id: 'Safety', label: 'Public Safety', icon: AlertTriangle, color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' }
];

const SEVERITY_LEVELS = [
  { level: 1, label: 'Minor', desc: 'Non-life threatening, stable condition' },
  { level: 2, label: 'Moderate', desc: 'Requires attention soon, stable' },
  { level: 3, label: 'Serious', desc: 'Urgent medical/first aid attention needed' },
  { level: 4, label: 'Severe', desc: 'High risk condition, escalating danger' },
  { level: 5, label: 'Critical', desc: 'Immediate life threat, CPR / immediate rescue' }
];

export default function CitizenPortal({
  activeIncident,
  setActiveIncident,
  responders,
  hospitals,
  pickerLocation,
  setIsLocationPickerMode
}) {
  const [category, setCategory] = useState('Medical');
  const [severity, setSeverity] = useState(4);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('Alex Henderson');
  const [reporterPhone, setReporterPhone] = useState('+1 (555) 321-9988');
  const [address, setAddress] = useState('Market St & 4th St, Downtown');
  const [photoUrl, setPhotoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Auto-detect browser GPS coordinates
  const handleDetectGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = parseFloat(pos.coords.latitude.toFixed(5));
          const lng = parseFloat(pos.coords.longitude.toFixed(5));
          setAddress(`Current GPS: ${lat}, ${lng}`);
        },
        () => {
          // Fallback to demo default
          setAddress('San Francisco Civic Center (GPS Acquired)');
        }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const loc = pickerLocation || {
        lat: 37.7760 + (Math.random() - 0.5) * 0.015,
        lng: -122.4180 + (Math.random() - 0.5) * 0.015,
        address: address || 'Current Location'
      };

      const payload = {
        reporterName,
        reporterPhone,
        type: category,
        title: title || `${category} Emergency Call`,
        severity,
        description: description || 'Immediate assistance requested by citizen.',
        location: loc,
        photoUrl: photoUrl || 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500&auto=format&fit=crop&q=80'
      };

      const res = await createIncident(payload);
      if (res.success) {
        setActiveIncident(res.data);
      }
    } catch (err) {
      console.error('Failed to submit incident:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const assignedResponder = activeIncident && activeIncident.assignedResponderId
    ? responders.find(r => r.id === activeIncident.assignedResponderId)
    : null;

  const assignedHospital = activeIncident && activeIncident.assignedHospitalId
    ? hospitals.find(h => h.id === activeIncident.assignedHospitalId)
    : null;

  const steps = [
    { key: 'REPORTED', label: 'Report Received', desc: 'Emergency broadcasted to dispatch grid' },
    { key: 'ASSIGNED', label: 'Responder Matched', desc: 'Nearby verified specialist assigned' },
    { key: 'EN_ROUTE', label: 'Responder En Route', desc: 'Traveling to your coordinates' },
    { key: 'ON_SCENE', label: 'Arrived On Scene', desc: 'Specialist assisting victim' },
    { key: 'RESOLVED', label: 'Resolved / Safe', desc: 'Incident resolved & documented' }
  ];

  const currentStepIndex = activeIncident
    ? steps.findIndex(s => s.key === activeIncident.status)
    : -1;

  return (
    <div className="space-y-6">
      {/* Active Incident Live Telemetry Panel */}
      {activeIncident ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
                <span className="text-xs uppercase font-extrabold tracking-widest text-red-400">
                  Active Emergency Dispatch Tracking
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-white">{activeIncident.title}</h2>
              <p className="text-xs text-slate-400">
                Incident ID: <span className="font-mono text-slate-300">{activeIncident.id}</span> • Severity: Level {activeIncident.severity}/5
              </p>
            </div>

            <button
              onClick={() => setActiveIncident(null)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              + Report Another Emergency
            </button>
          </div>

          {/* Stepper Progress */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {steps.map((step, idx) => {
              const isPast = currentStepIndex >= idx;
              const isCurrent = currentStepIndex === idx;

              return (
                <div
                  key={step.key}
                  className={`p-3 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'bg-red-500/10 border-red-500/50 text-white'
                      : isPast
                      ? 'bg-slate-800/70 border-emerald-500/40 text-slate-200'
                      : 'bg-slate-900/40 border-slate-800/60 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isCurrent
                          ? 'bg-red-500 text-white animate-pulse'
                          : isPast
                          ? 'bg-emerald-500 text-slate-950 font-black'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isPast ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                    </div>
                    <span className="text-xs font-bold">{step.label}</span>
                  </div>
                  <p className="text-[11px] leading-snug opacity-80">{step.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Assigned First Responder & Facility Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Responder Card */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-400" /> Dispatched Specialist
                </span>
                {assignedResponder && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                    {assignedResponder.status}
                  </span>
                )}
              </div>

              {assignedResponder ? (
                <div className="flex items-start gap-3">
                  <img
                    src={assignedResponder.avatar}
                    alt={assignedResponder.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500/40"
                  />
                  <div className="space-y-1 flex-1">
                    <div className="font-bold text-white text-base">{assignedResponder.name}</div>
                    <div className="text-xs text-emerald-400 font-medium">{assignedResponder.role}</div>
                    <div className="text-xs text-slate-400">
                      Vehicle: <span className="text-slate-200">{assignedResponder.vehicle}</span>
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                      <a
                        href={`tel:${assignedResponder.phone}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-lg shadow-emerald-900/30"
                      >
                        <PhoneCall className="w-3.5 h-3.5" /> Call Responder
                      </a>
                      <span className="text-xs text-slate-400">
                        ⭐ {assignedResponder.rating} ({assignedResponder.totalResponses} rescues)
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">
                  <div className="animate-spin inline-block w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full mb-2"></div>
                  <p>Smart Matching Engine is scanning nearby responders...</p>
                </div>
              )}
            </div>

            {/* Hospital Standby Card */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-blue-400" /> Standby Trauma Facility
                </span>
                {assignedHospital && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {assignedHospital.traumaLevel}
                  </span>
                )}
              </div>

              {assignedHospital ? (
                <div className="space-y-2">
                  <h4 className="font-bold text-white text-sm">{assignedHospital.name}</h4>
                  <p className="text-xs text-slate-400">{assignedHospital.address}</p>
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                    <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-700">
                      <div className="text-lg font-extrabold text-emerald-400">{assignedHospital.availableBeds}</div>
                      <div className="text-[10px] text-slate-400">Available Beds</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-700">
                      <div className="text-lg font-extrabold text-amber-400">{assignedHospital.icuBedsAvailable}</div>
                      <div className="text-[10px] text-slate-400">ICU Slots</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-700">
                      <div className="text-lg font-extrabold text-red-400">{assignedHospital.bloodUnits}</div>
                      <div className="text-[10px] text-slate-400">Blood Units</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-slate-400 text-xs py-4 text-center">
                  Standby hospital not required or pending triage evaluation.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Emergency Reporting Form */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 shadow-inner">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">Broadcast Emergency SOS</h2>
              <p className="text-xs text-slate-400">
                Instantly alerts nearest qualified volunteers, paramedics, and hospitals in real time.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Emergency Type Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                1. Select Emergency Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-2 text-center transition-all ${
                        isSelected
                          ? `${cat.color} ring-2 ring-red-500 shadow-lg scale-[1.02]`
                          : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800/70 text-slate-400'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-xs font-bold">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Severity Level Slider */}
            <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/70">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  2. Severity Level: <span className="text-red-400 text-sm font-black">Level {severity} - {SEVERITY_LEVELS[severity - 1].label}</span>
                </label>
                <span className="text-xs text-slate-400">
                  {SEVERITY_LEVELS[severity - 1].desc}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={severity}
                onChange={(e) => setSeverity(parseInt(e.target.value, 10))}
                className="w-full accent-red-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-bold px-1">
                <span>1 - Minor</span>
                <span>2 - Moderate</span>
                <span>3 - Serious</span>
                <span>4 - Severe</span>
                <span className="text-red-400">5 - Critical</span>
              </div>
            </div>

            {/* Title & Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Emergency Headline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Unconscious pedestrian after bike fall"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Reporter Contact Name & Phone
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Name"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                  />
                  <input
                    type="text"
                    placeholder="Phone"
                    value={reporterPhone}
                    onChange={(e) => setReporterPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </div>

            {/* Location & GPS */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                3. Incident Location
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[240px]">
                  <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={pickerLocation ? `Pinned at: ${pickerLocation.lat}, ${pickerLocation.lng}` : address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter street, landmark, or click on map"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleDetectGPS}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5 text-cyan-400" /> Use GPS
                </button>
                <button
                  type="button"
                  onClick={() => setIsLocationPickerMode((prev) => !prev)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 border border-amber-500/30"
                >
                  📍 Pin on Map
                </button>
              </div>
            </div>

            {/* Situation Details & Optional Photo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Critical Details (Symptoms, Hazards)
                </label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe number of victims, hazards, conscious/unconscious..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                ></textarea>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Optional Incident Photo URL
                </label>
                <div className="space-y-2">
                  <div className="relative">
                    <Camera className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="url"
                      placeholder="Paste image URL or use sample"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div className="flex gap-2 text-[11px] text-slate-400">
                    <span>Quick presets:</span>
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500&auto=format&fit=crop&q=80')}
                      className="text-cyan-400 hover:underline"
                    >
                      Medical
                    </button>
                    •
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('https://images.unsplash.com/photo-1542385151-efd9000785a0?w=500&auto=format&fit=crop&q=80')}
                      className="text-orange-400 hover:underline"
                    >
                      Fire
                    </button>
                    •
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=500&auto=format&fit=crop&q=80')}
                      className="text-amber-400 hover:underline"
                    >
                      Crash
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Big Trigger Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-base tracking-wider uppercase shadow-xl shadow-red-950/60 transition-all flex items-center justify-center gap-2 group transform active:scale-[0.99]"
            >
              <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              {submitting ? 'Triggering Emergency Broadcast...' : 'BROADCAST EMERGENCY SOS NOW'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
