import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function MapComponent({
  incidents = [],
  responders = [],
  hospitals = [],
  selectedIncident = null,
  onSelectIncident = null,
  onLocationSelect = null,
  isLocationPickerMode = false,
  pickerLocation = null
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const routesLayerRef = useRef(null);
  const pickerMarkerRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default center San Francisco
    const initialCenter = [37.7749, -122.4194];
    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 13,
      zoomControl: false
    });

    // Use OpenStreetMap's standard tiles, which do not require an API key.
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
      maxZoom: 19
    }).addTo(map);

    // Zoom controls at top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    routesLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    // Handle map click for picker mode
    map.on('click', (e) => {
      if (onLocationSelect) {
        onLocationSelect({
          lat: parseFloat(e.latlng.lat.toFixed(5)),
          lng: parseFloat(e.latlng.lng.toFixed(5))
        });
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Sync Markers and Routes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersLayerRef.current || !routesLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    routesLayerRef.current.clearLayers();

    // 1. Render Hospitals
    hospitals.forEach((hosp) => {
      const hospIcon = L.divIcon({
        className: 'custom-hosp-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="w-9 h-9 rounded-xl bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 6v12m-6-6h12"/></svg>
            </div>
            <span class="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border border-slate-900 shadow">
              ${hosp.availableBeds}
            </span>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const marker = L.marker([hosp.location.lat, hosp.location.lng], { icon: hospIcon });
      marker.bindPopup(`
        <div class="p-2 space-y-1">
          <div class="flex items-center gap-1.5 text-blue-400 font-bold text-sm">
            <span>🏥</span> ${hosp.name}
          </div>
          <p class="text-xs text-slate-300">${hosp.traumaLevel}</p>
          <div class="grid grid-cols-2 gap-1 text-xs mt-2 pt-2 border-t border-slate-700">
            <div>Available Beds: <strong class="text-emerald-400">${hosp.availableBeds}</strong></div>
            <div>ICU Beds: <strong class="text-amber-400">${hosp.icuBedsAvailable}</strong></div>
          </div>
          <p class="text-[11px] text-slate-400 mt-1">${hosp.phone}</p>
        </div>
      `);
      marker.addTo(markersLayerRef.current);
    });

    // 2. Render Responders
    responders.forEach((resp) => {
      const isEnRoute = resp.status === 'EN_ROUTE';
      const isAssigned = resp.status === 'ASSIGNED';
      const isOnScene = resp.status === 'ON_SCENE';
      const isAvailable = resp.status === 'AVAILABLE';

      const statusColor = isEnRoute
        ? 'bg-amber-500'
        : isOnScene
        ? 'bg-purple-600'
        : isAssigned
        ? 'bg-blue-600'
        : isAvailable
        ? 'bg-emerald-500'
        : 'bg-slate-500';

      const respIcon = L.divIcon({
        className: 'custom-resp-marker',
        html: `
          <div class="relative group cursor-pointer">
            <div class="w-8 h-8 rounded-full ${statusColor} border-2 border-white shadow-xl flex items-center justify-center text-white text-xs font-bold transition-transform group-hover:scale-110">
              ${resp.name.charAt(0)}${resp.name.split(' ')[1] ? resp.name.split(' ')[1].charAt(0) : ''}
            </div>
            ${isEnRoute ? '<div class="absolute -inset-1 rounded-full border-2 border-amber-400 animate-ping opacity-75"></div>' : ''}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([resp.location.lat, resp.location.lng], { icon: respIcon });
      marker.bindPopup(`
        <div class="p-2 space-y-1">
          <div class="flex items-center justify-between">
            <strong class="text-white text-sm">${resp.name}</strong>
            <span class="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${statusColor} text-white">${resp.status}</span>
          </div>
          <p class="text-xs text-slate-400">${resp.role}</p>
          <div class="text-[11px] text-slate-300">
            Skills: <span class="text-blue-300">${resp.skills.join(', ')}</span>
          </div>
          <div class="text-[11px] text-slate-400">Vehicle: ${resp.vehicle}</div>
        </div>
      `);
      marker.addTo(markersLayerRef.current);
    });

    // 3. Render Incidents & Dynamic Routes
    incidents.forEach((inc) => {
      const isResolved = inc.status === 'RESOLVED';
      const isSelected = selectedIncident && selectedIncident.id === inc.id;

      // Severity color mapping
      const severityColor =
        inc.severity >= 5
          ? 'bg-red-600'
          : inc.severity === 4
          ? 'bg-orange-500'
          : inc.severity === 3
          ? 'bg-amber-500'
          : 'bg-blue-500';

      const pulseColor = inc.severity >= 4 ? 'bg-red-500/40' : 'bg-orange-500/30';

      const incIcon = L.divIcon({
        className: 'custom-beacon-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer">
            ${!isResolved ? `<div class="beacon-pulse ${pulseColor}"></div>` : ''}
            <div class="w-10 h-10 rounded-2xl ${isResolved ? 'bg-slate-600' : severityColor} border-2 ${isSelected ? 'border-amber-300 ring-4 ring-amber-400/50' : 'border-white'} shadow-2xl flex items-center justify-center text-white font-extrabold text-sm z-10">
              ${inc.severity}
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const marker = L.marker([inc.location.lat, inc.location.lng], { icon: incIcon });

      marker.on('click', () => {
        if (onSelectIncident) onSelectIncident(inc);
      });

      marker.bindPopup(`
        <div class="p-2 space-y-2 max-w-xs">
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${severityColor} text-white">
              Sev ${inc.severity} • ${inc.type}
            </span>
            <span class="text-[10px] text-slate-400">${inc.status}</span>
          </div>
          <h4 class="font-bold text-white text-sm leading-snug">${inc.title}</h4>
          <p class="text-xs text-slate-300 line-clamp-2">${inc.description}</p>
          <div class="text-[11px] text-slate-400 border-t border-slate-750 pt-1">
            📍 ${inc.location.address || `${inc.location.lat}, ${inc.location.lng}`}
          </div>
        </div>
      `);

      marker.addTo(markersLayerRef.current);

      // Render Route to assigned responder if active
      if (inc.assignedResponderId && !isResolved) {
        const assignedResp = responders.find(r => r.id === inc.assignedResponderId);
        if (assignedResp) {
          const polyline = L.polyline(
            [
              [assignedResp.location.lat, assignedResp.location.lng],
              [inc.location.lat, inc.location.lng]
            ],
            {
              color: inc.severity >= 4 ? '#ef4444' : '#3b82f6',
              weight: 3.5,
              opacity: 0.85,
              dashArray: '8, 8'
            }
          );
          polyline.addTo(routesLayerRef.current);
        }
      }
    });

    // 4. Render Picker Marker (Citizen SOS location selection)
    if (pickerLocation) {
      const pickerIcon = L.divIcon({
        className: 'picker-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="w-7 h-7 rounded-full bg-red-600 border-4 border-white shadow-2xl animate-bounce"></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 28]
      });
      L.marker([pickerLocation.lat, pickerLocation.lng], { icon: pickerIcon }).addTo(markersLayerRef.current);
    }
  }, [incidents, responders, hospitals, selectedIncident, pickerLocation]);

  // Center on selected incident
  useEffect(() => {
    if (selectedIncident && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(
        [selectedIncident.location.lat, selectedIncident.location.lng],
        15,
        { duration: 1.2 }
      );
    }
  }, [selectedIncident]);

  return (
    <div className="relative w-full h-full min-h-[400px] overflow-hidden rounded-2xl border border-slate-800 shadow-2xl bg-slate-900">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Map Legend & Indicator Overlay */}
      <div className="absolute bottom-4 left-4 z-[400] bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 text-xs shadow-xl space-y-2 pointer-events-none sm:pointer-events-auto">
        <div className="font-bold text-slate-200 tracking-wider text-[11px] uppercase flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Live Dispatch Grid
        </div>
        <div className="flex flex-wrap items-center gap-3 text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-red-600 inline-block"></span> Critical (5)
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-orange-500 inline-block"></span> Severe (4)
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> Ready Responder
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span> En Route
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-600 inline-block"></span> Hospital
          </div>
        </div>
        {isLocationPickerMode && (
          <div className="text-amber-400 font-semibold pt-1 border-t border-slate-800">
            👉 Click anywhere on map to pin emergency location
          </div>
        )}
      </div>
    </div>
  );
}
