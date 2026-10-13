const { db } = require('../services/database');

exports.getHospitals = (req, res) => {
  try {
    const hospitals = db.getHospitals();
    res.json({ success: true, count: hospitals.length, data: hospitals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getHospitalById = (req, res) => {
  try {
    const hospital = db.getHospitalById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }
    res.json({ success: true, data: hospital });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateBedCapacity = (req, res) => {
  try {
    const { id } = req.params;
    const { delta } = req.body; // e.g. -1 for admitting patient

    const hospital = db.updateHospitalBeds(id, parseInt(delta, 10) || 0);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('hospital:updated', hospital);
    }

    res.json({ success: true, data: hospital });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
