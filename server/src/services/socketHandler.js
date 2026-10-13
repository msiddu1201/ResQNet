// Socket.io Real-Time Dispatch and Telemetry Hub
const { db } = require('./database');
const { findBestResponders, findBestHospital } = require('./matchingEngine');

let activeSimulations = {};

function setupSocketIO(io) {
  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Join specific rooms (e.g., 'admin', 'responder-<id>', 'incident-<id>')
    socket.on('join', (room) => {
      socket.join(room);
      console.log(`[Socket.io] Socket ${socket.id} joined room: ${room}`);
    });

    socket.on('leave', (room) => {
      socket.leave(room);
    });

    // Handle responder location updates (e.g. mobile GPS streaming)
    socket.on('responder:update_location', ({ responderId, lat, lng }) => {
      const updated = db.updateResponder(responderId, {
        location: { lat, lng }
      });
      if (updated) {
        io.emit('responder:location_updated', updated);
      }
    });

    // Handle responder status toggle (e.g., toggle AVAILABLE / OFF_DUTY)
    socket.on('responder:update_status', ({ responderId, status }) => {
      const updated = db.updateResponder(responderId, { status });
      if (updated) {
        io.emit('responder:status_updated', updated);
      }
    });

    // Trigger responder movement simulation towards an incident
    socket.on('simulation:start_responder_movement', ({ responderId, incidentId }) => {
      const responder = db.getResponderById(responderId);
      const incident = db.getIncidentById(incidentId);

      if (!responder || !incident) return;

      // Cancel existing simulation for this responder if any
      if (activeSimulations[responderId]) {
        clearInterval(activeSimulations[responderId]);
      }

      const startLat = responder.location.lat;
      const startLng = responder.location.lng;
      const targetLat = incident.location.lat;
      const targetLng = incident.location.lng;

      const totalSteps = 12; // 12-second simulated travel
      let currentStep = 0;

      // Mark responder EN_ROUTE
      db.updateResponder(responderId, { status: 'EN_ROUTE' });
      db.updateIncident(incidentId, {
        status: 'EN_ROUTE',
        statusNote: `${responder.name} is en route to scene.`
      });

      io.emit('incident:updated', db.getIncidentById(incidentId));
      io.emit('responder:status_updated', db.getResponderById(responderId));

      const interval = setInterval(() => {
        currentStep++;
        const fraction = currentStep / totalSteps;
        const currentLat = startLat + (targetLat - startLat) * fraction;
        const currentLng = startLng + (targetLng - startLng) * fraction;

        const updatedResp = db.updateResponder(responderId, {
          location: { lat: currentLat, lng: currentLng }
        });

        io.emit('responder:location_updated', updatedResp);

        if (currentStep >= totalSteps) {
          clearInterval(interval);
          delete activeSimulations[responderId];

          // Arrived on scene
          db.updateResponder(responderId, { status: 'ON_SCENE' });
          const onSceneIncident = db.updateIncident(incidentId, {
            status: 'ON_SCENE',
            statusNote: `${responder.name} arrived on scene.`
          });

          io.emit('incident:updated', onSceneIncident);
          io.emit('responder:status_updated', db.getResponderById(responderId));
        }
      }, 1000);

      activeSimulations[responderId] = interval;
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

module.exports = { setupSocketIO };
