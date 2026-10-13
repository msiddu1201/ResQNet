const { db, DEFAULT_CENTER } = require('../services/database');
const { findBestResponders, findBestHospital } = require('../services/matchingEngine');

const MOCK_INCIDENT_TEMPLATES = [
  {
    type: 'Medical',
    title: 'Severe Anaphylactic Shock at Restaurant',
    severity: 5,
    description: 'Customer ingested peanut allergy ingredient, throat swelling rapidly, difficulty breathing.',
    photoUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500&auto=format&fit=crop&q=80'
  },
  {
    type: 'Fire',
    title: 'Apartment Kitchen Grease Fire',
    severity: 4,
    description: 'Thick black smoke billowing from second-floor window. Occupants evacuating building.',
    photoUrl: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?w=500&auto=format&fit=crop&q=80'
  },
  {
    type: 'Accident',
    title: 'Pedestrian Struck by Electric Scooter',
    severity: 3,
    description: 'Victim suffered head laceration and fractured wrist on pedestrian walkway.',
    photoUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=500&auto=format&fit=crop&q=80'
  },
  {
    type: 'Disaster',
    title: 'Flash Flooding & Submerged Vehicle',
    severity: 4,
    description: 'Storm drain overflow trapped sedan in underpass with water up to window level.',
    photoUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=500&auto=format&fit=crop&q=80'
  }
];

exports.resetAll = (req, res) => {
  try {
    db.resetData();
    const io = req.app.get('io');
    if (io) {
      io.emit('system:reset', {
        incidents: db.getIncidents(),
        responders: db.getResponders(),
        hospitals: db.getHospitals()
      });
    }

    res.json({
      success: true,
      message: 'All mock and incident data reset to default seed state',
      data: {
        incidents: db.getIncidents(),
        responders: db.getResponders(),
        hospitals: db.getHospitals()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.spawnMockIncident = (req, res) => {
  try {
    const template = MOCK_INCIDENT_TEMPLATES[Math.floor(Math.random() * MOCK_INCIDENT_TEMPLATES.length)];

    // Slight randomized offset around city center (~1 to 2.5km)
    const latOffset = (Math.random() - 0.5) * 0.028;
    const lngOffset = (Math.random() - 0.5) * 0.032;

    const newIncident = db.createIncident({
      reporterName: 'Automated 911 Triage Dispatch',
      reporterPhone: '+1 (555) 019-2834',
      type: template.type,
      title: template.title,
      severity: template.severity,
      description: template.description,
      photoUrl: template.photoUrl,
      location: {
        lat: parseFloat((DEFAULT_CENTER.lat + latOffset).toFixed(5)),
        lng: parseFloat((DEFAULT_CENTER.lng + lngOffset).toFixed(5)),
        address: `Simulated Sector ${Math.floor(Math.random() * 90 + 10)}, Metro Area`
      }
    });

    const io = req.app.get('io');
    const responders = db.getResponders();
    const matches = findBestResponders(newIncident, responders, 3);
    const suggestedHospital = findBestHospital(newIncident.location, db.getHospitals());

    let finalIncident = newIncident;
    if (matches.length > 0 && matches[0].responder.status === 'AVAILABLE') {
      const best = matches[0].responder;
      db.updateResponder(best.id, {
        status: 'ASSIGNED',
        assignedIncidentId: newIncident.id
      });

      finalIncident = db.updateIncident(newIncident.id, {
        status: 'ASSIGNED',
        assignedResponderId: best.id,
        assignedHospitalId: suggestedHospital ? suggestedHospital.id : null,
        statusNote: `Auto-matched with ${best.name} (${matches[0].recommendationReason})`
      });
    }

    if (io) {
      io.emit('incident:created', {
        incident: finalIncident,
        matches,
        suggestedHospital
      });

      if (finalIncident.assignedResponderId) {
        const assignedResp = db.getResponderById(finalIncident.assignedResponderId);
        io.emit('responder:status_updated', assignedResp);
        io.emit('dispatch:alert', {
          responderId: assignedResp.id,
          incident: finalIncident
        });
      }
    }

    res.status(201).json({
      success: true,
      data: finalIncident,
      matches,
      suggestedHospital
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
