const { db } = require('../services/database');
const { findBestResponders, findBestHospital } = require('../services/matchingEngine');

exports.getIncidents = (req, res) => {
  try {
    const incidents = db.getIncidents();
    res.json({ success: true, count: incidents.length, data: incidents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getIncidentById = (req, res) => {
  try {
    const incident = db.getIncidentById(req.params.id);
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }

    // Attach suggested matches dynamically
    const availableResponders = db.getResponders();
    const matches = findBestResponders(incident, availableResponders, 3);
    const suggestedHospital = findBestHospital(incident.location, db.getHospitals());

    res.json({
      success: true,
      data: {
        ...incident,
        suggestedMatches: matches,
        suggestedHospital
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createIncident = (req, res) => {
  try {
    const { reporterName, reporterPhone, type, title, severity, location, description, photoUrl } = req.body;

    const newIncident = db.createIncident({
      reporterName,
      reporterPhone,
      type,
      title,
      severity,
      location,
      description,
      photoUrl
    });

    const io = req.app.get('io');
    const responders = db.getResponders();
    const rankedMatches = findBestResponders(newIncident, responders, 3);
    const suggestedHospital = findBestHospital(newIncident.location, db.getHospitals());

    // Auto-dispatch top candidate if available
    let autoAssigned = null;
    if (rankedMatches.length > 0 && rankedMatches[0].responder.status === 'AVAILABLE') {
      const topMatch = rankedMatches[0].responder;
      db.updateResponder(topMatch.id, {
        status: 'ASSIGNED',
        assignedIncidentId: newIncident.id
      });

      autoAssigned = db.updateIncident(newIncident.id, {
        status: 'ASSIGNED',
        assignedResponderId: topMatch.id,
        assignedHospitalId: suggestedHospital ? suggestedHospital.id : null,
        statusNote: `Auto-dispatched to ${topMatch.name} (${topMatch.role}) - ${rankedMatches[0].recommendationReason}`
      });
    }

    const finalIncident = autoAssigned || newIncident;

    if (io) {
      io.emit('incident:created', {
        incident: finalIncident,
        matches: rankedMatches,
        suggestedHospital
      });

      if (autoAssigned) {
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
      matches: rankedMatches,
      suggestedHospital
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateIncidentStatus = (req, res) => {
  try {
    const { id } = req.params;
    const { status, note, assignedResponderId } = req.body;

    const incident = db.getIncidentById(id);
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }

    const updates = { status, statusNote: note };
    if (assignedResponderId) {
      updates.assignedResponderId = assignedResponderId;
    }

    const updated = db.updateIncident(id, updates);

    // If resolved or cancelled, release assigned responder
    if ((status === 'RESOLVED' || status === 'CANCELLED') && updated.assignedResponderId) {
      const freedResponder = db.updateResponder(updated.assignedResponderId, {
        status: 'AVAILABLE',
        assignedIncidentId: null
      });

      const io = req.app.get('io');
      if (io) {
        io.emit('responder:status_updated', freedResponder);
      }
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('incident:updated', updated);
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.assignResponder = (req, res) => {
  try {
    const { id } = req.params;
    const { responderId } = req.body;

    const incident = db.getIncidentById(id);
    const responder = db.getResponderById(responderId);

    if (!incident || !responder) {
      return res.status(404).json({ success: false, message: 'Incident or responder not found' });
    }

    // Release old responder if any
    if (incident.assignedResponderId && incident.assignedResponderId !== responderId) {
      db.updateResponder(incident.assignedResponderId, {
        status: 'AVAILABLE',
        assignedIncidentId: null
      });
    }

    const updatedResponder = db.updateResponder(responderId, {
      status: 'ASSIGNED',
      assignedIncidentId: incident.id
    });

    const updatedIncident = db.updateIncident(id, {
      status: 'ASSIGNED',
      assignedResponderId: responderId,
      statusNote: `Manually assigned to ${responder.name}`
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('incident:updated', updatedIncident);
      io.emit('responder:status_updated', updatedResponder);
      io.emit('dispatch:alert', {
        responderId: responder.id,
        incident: updatedIncident
      });
    }

    res.json({ success: true, data: updatedIncident, responder: updatedResponder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
