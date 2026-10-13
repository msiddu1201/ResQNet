import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SimulationBar from './components/SimulationBar';
import MapComponent from './components/MapComponent';
import CitizenPortal from './components/CitizenPortal';
import ResponderPortal from './components/ResponderPortal';
import AdminDashboard from './components/AdminDashboard';
import { fetchIncidents, fetchResponders, fetchHospitals } from './services/api';
import { socket } from './services/socket';
import { Bell, X } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('citizen'); // 'citizen' | 'responder' | 'admin'
  const [incidents, setIncidents] = useState([]);
  const [responders, setResponders] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [activeIncident, setActiveIncident] = useState(null); // Track citizen's current emergency
  const [currentResponderId, setCurrentResponderId] = useState('resp-1');
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [isLocationPickerMode, setIsLocationPickerMode] = useState(false);
  const [pickerLocation, setPickerLocation] = useState(null);
  const [toastAlert, setToastAlert] = useState(null);

  // Initial Data Fetch
  useEffect(() => {
    async function loadData() {
      try {
        const [incRes, respRes, hospRes] = await Promise.all([
          fetchIncidents(),
          fetchResponders(),
          fetchHospitals()
        ]);

        if (incRes.success) {
          setIncidents(incRes.data);
          // Set active incident for citizen view default to first active
          const active = incRes.data.find(i => i.status !== 'RESOLVED');
          if (active) setActiveIncident(active);
        }
        if (respRes.success) setResponders(respRes.data);
        if (hospRes.success) setHospitals(hospRes.data);
      } catch (err) {
        console.error('Error fetching initial data:', err);
      }
    }

    loadData();
  }, []);

  // Real-Time Socket.io Listeners
  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }
    function onDisconnect() {
      setIsConnected(false);
    }

    function onIncidentCreated(payload) {
      const { incident } = payload;
      setIncidents(prev => [incident, ...prev]);

      // Pop toast notification
      setToastAlert({
        title: `🚨 Emergency Alert: ${incident.title}`,
        desc: `Level ${incident.severity} • ${incident.type} in ${incident.location.address || 'Metro Sector'}`
      });

      // Auto dismiss after 6 seconds
      setTimeout(() => setToastAlert(null), 6000);
    }

    function onIncidentUpdated(updatedIncident) {
      setIncidents(prev =>
        prev.map(inc => (inc.id === updatedIncident.id ? updatedIncident : inc))
      );
      if (activeIncident && activeIncident.id === updatedIncident.id) {
        setActiveIncident(updatedIncident);
      }
      if (selectedIncident && selectedIncident.id === updatedIncident.id) {
        setSelectedIncident(updatedIncident);
      }
    }

    function onResponderStatusUpdated(updatedResp) {
      setResponders(prev =>
        prev.map(r => (r.id === updatedResp.id ? updatedResp : r))
      );
    }

    function onResponderLocationUpdated(updatedResp) {
      setResponders(prev =>
        prev.map(r => (r.id === updatedResp.id ? updatedResp : r))
      );
    }

    function onHospitalUpdated(updatedHosp) {
      setHospitals(prev =>
        prev.map(h => (h.id === updatedHosp.id ? updatedHosp : h))
      );
    }

    function onSystemReset(data) {
      setIncidents(data.incidents);
      setResponders(data.responders);
      setHospitals(data.hospitals);
      setActiveIncident(data.incidents[0] || null);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('incident:created', onIncidentCreated);
    socket.on('incident:updated', onIncidentUpdated);
    socket.on('responder:status_updated', onResponderStatusUpdated);
    socket.on('responder:location_updated', onResponderLocationUpdated);
    socket.on('hospital:updated', onHospitalUpdated);
    socket.on('system:reset', onSystemReset);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('incident:created', onIncidentCreated);
      socket.off('incident:updated', onIncidentUpdated);
      socket.off('responder:status_updated', onResponderStatusUpdated);
      socket.off('responder:location_updated', onResponderLocationUpdated);
      socket.off('hospital:updated', onHospitalUpdated);
      socket.off('system:reset', onSystemReset);
    };
  }, [activeIncident, selectedIncident]);

  const activeIncidentsCount = incidents.filter(i => i.status !== 'RESOLVED' && i.status !== 'CANCELLED').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast Notification Alert */}
      {toastAlert && (
        <div className="fixed top-20 right-6 z-50 max-w-md bg-red-600 text-white p-4 rounded-2xl shadow-2xl border-2 border-white/20 animate-bounce flex items-start gap-3">
          <Bell className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-extrabold text-sm">{toastAlert.title}</h4>
            <p className="text-xs text-red-100 mt-0.5">{toastAlert.desc}</p>
          </div>
          <button onClick={() => setToastAlert(null)} className="text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        activeIncidentsCount={activeIncidentsCount}
        isConnected={isConnected}
      />

      {/* Top Simulation Bar */}
      <SimulationBar incidents={incidents} responders={responders} />

      {/* Main Responsive Grid Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Portal View (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {currentView === 'citizen' && (
              <CitizenPortal
                activeIncident={activeIncident}
                setActiveIncident={setActiveIncident}
                responders={responders}
                hospitals={hospitals}
                pickerLocation={pickerLocation}
                setIsLocationPickerMode={setIsLocationPickerMode}
              />
            )}

            {currentView === 'responder' && (
              <ResponderPortal
                responders={responders}
                incidents={incidents}
                hospitals={hospitals}
                currentResponderId={currentResponderId}
                setCurrentResponderId={setCurrentResponderId}
                onSelectIncident={(inc) => {
                  setSelectedIncident(inc);
                }}
              />
            )}

            {currentView === 'admin' && (
              <AdminDashboard
                incidents={incidents}
                responders={responders}
                hospitals={hospitals}
                selectedIncident={selectedIncident}
                onSelectIncident={(inc) => {
                  setSelectedIncident(inc);
                }}
              />
            )}
          </div>

          {/* Right Column: Live Interactive Map (5 Cols, Sticky) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-3">
            <div className="h-[460px] sm:h-[580px] w-full">
              <MapComponent
                incidents={incidents}
                responders={responders}
                hospitals={hospitals}
                selectedIncident={selectedIncident}
                onSelectIncident={(inc) => {
                  setSelectedIncident(inc);
                  if (currentView === 'citizen') {
                    setActiveIncident(inc);
                  }
                }}
                isLocationPickerMode={isLocationPickerMode}
                pickerLocation={pickerLocation}
                onLocationSelect={(coords) => {
                  setPickerLocation(coords);
                  setIsLocationPickerMode(false);
                }}
              />
            </div>

            {/* Quick Map Helper Footer */}
            <div className="text-center text-[11px] text-slate-500">
              Interactive OpenStreetMap grid • Real-time WebSocket GPS updates & route telemetry
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
