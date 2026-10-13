const { db } = require('../services/database');

exports.getResponders = (req, res) => {
  try {
    const responders = db.getResponders();
    res.json({ success: true, count: responders.length, data: responders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getResponderById = (req, res) => {
  try {
    const responder = db.getResponderById(req.params.id);
    if (!responder) {
      return res.status(404).json({ success: false, message: 'Responder not found' });
    }
    res.json({ success: true, data: responder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateStatus = (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = db.updateResponder(id, { status });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Responder not found' });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('responder:status_updated', updated);
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateLocation = (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lng } = req.body;

    const updated = db.updateResponder(id, {
      location: { lat, lng }
    });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Responder not found' });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('responder:location_updated', updated);
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
