const express = require('express');
const router = express.Router();

const incidentController = require('../controllers/incidentController');
const responderController = require('../controllers/responderController');
const hospitalController = require('../controllers/hospitalController');
const mockController = require('../controllers/mockController');

// Incident Routes
router.get('/incidents', incidentController.getIncidents);
router.get('/incidents/:id', incidentController.getIncidentById);
router.post('/incidents', incidentController.createIncident);
router.patch('/incidents/:id/status', incidentController.updateIncidentStatus);
router.post('/incidents/:id/assign', incidentController.assignResponder);

// Responder Routes
router.get('/responders', responderController.getResponders);
router.get('/responders/:id', responderController.getResponderById);
router.patch('/responders/:id/status', responderController.updateStatus);
router.patch('/responders/:id/location', responderController.updateLocation);

// Hospital Routes
router.get('/hospitals', hospitalController.getHospitals);
router.get('/hospitals/:id', hospitalController.getHospitalById);
router.patch('/hospitals/:id/beds', hospitalController.updateBedCapacity);

// Mock & Simulation Controls
router.post('/mock/reset', mockController.resetAll);
router.post('/mock/spawn', mockController.spawnMockIncident);

module.exports = router;
