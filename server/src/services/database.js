const { v4: uuidv4 } = require('uuid');

// Seed coordinates centered around a vibrant metropolitan hub (San Francisco / Bay Area by default, easily adaptable)
const DEFAULT_CENTER = { lat: 37.7749, lng: -122.4194 };

// Initial mock responders with diverse skill sets and realistic profiles
const INITIAL_RESPONDERS = [
  {
    id: 'resp-1',
    name: 'Dr. Sarah Lin',
    phone: '+1 (555) 234-5678',
    role: 'Emergency Physician',
    skills: ['Trauma Care', 'CPR', 'Advanced Airway', 'Triage'],
    status: 'AVAILABLE', // AVAILABLE, ASSIGNED, EN_ROUTE, ON_SCENE, OFF_DUTY
    vehicle: 'Ambulance Unit 4',
    location: { lat: 37.7785, lng: -122.4120 },
    assignedIncidentId: null,
    rating: 4.9,
    totalResponses: 142,
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'resp-2',
    name: 'Marcus Vance',
    phone: '+1 (555) 345-6789',
    role: 'Certified Paramedic / EMT',
    skills: ['CPR', 'First Aid', 'AED', 'Pediatric Life Support'],
    status: 'AVAILABLE',
    vehicle: 'Rapid Response Motorcycle',
    location: { lat: 37.7690, lng: -122.4280 },
    assignedIncidentId: null,
    rating: 4.8,
    totalResponses: 98,
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'resp-3',
    name: 'Elena Rostova',
    phone: '+1 (555) 456-7890',
    role: 'Firefighter & Rescue Specialist',
    skills: ['Fire Suppression', 'Search & Rescue', 'Vehicle Extrication', 'Hazmat'],
    status: 'AVAILABLE',
    vehicle: 'Rescue Squad 12',
    location: { lat: 37.7830, lng: -122.4050 },
    assignedIncidentId: null,
    rating: 5.0,
    totalResponses: 215,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'resp-4',
    name: 'David Kim',
    phone: '+1 (555) 567-8901',
    role: 'Community First Responder',
    skills: ['First Aid', 'CPR', 'Crowd Management', 'Water Rescue'],
    status: 'AVAILABLE',
    vehicle: 'Personal Vehicle (All-Terrain SUV)',
    location: { lat: 37.7600, lng: -122.4100 },
    assignedIncidentId: null,
    rating: 4.7,
    totalResponses: 45,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'resp-5',
    name: 'Amara Okafor',
    phone: '+1 (555) 678-9012',
    role: 'Disaster Relief Nurse',
    skills: ['Triage', 'Wound Care', 'CPR', 'Mental Health First Aid'],
    status: 'AVAILABLE',
    vehicle: 'Mobile Clinic Van',
    location: { lat: 37.7890, lng: -122.4350 },
    assignedIncidentId: null,
    rating: 4.9,
    totalResponses: 110,
    avatar: 'https://images.unsplash.com/photo-1594824813628-98e826b52a8a?w=150&auto=format&fit=crop&q=80'
  }
];

// Initial mock hospitals with live resource telemetry
const INITIAL_HOSPITALS = [
  {
    id: 'hosp-1',
    name: 'St. Jude Metropolitan Medical Center',
    location: { lat: 37.7790, lng: -122.4180 },
    totalBeds: 240,
    availableBeds: 34,
    icuBedsAvailable: 6,
    traumaLevel: 'Level 1 Trauma Center',
    bloodUnits: 88,
    phone: '+1 (555) 911-0001',
    address: '1000 Mission St, San Francisco, CA'
  },
  {
    id: 'hosp-2',
    name: 'Pacific Heights General Hospital',
    location: { lat: 37.7910, lng: -122.4310 },
    totalBeds: 180,
    availableBeds: 19,
    icuBedsAvailable: 2,
    traumaLevel: 'Level 2 Trauma Center',
    bloodUnits: 45,
    phone: '+1 (555) 911-0002',
    address: '2200 Webster St, San Francisco, CA'
  },
  {
    id: 'hosp-3',
    name: 'Bay Area Emergency Trauma Care',
    location: { lat: 37.7640, lng: -122.4010 },
    totalBeds: 120,
    availableBeds: 41,
    icuBedsAvailable: 9,
    traumaLevel: 'Level 1 Trauma Center',
    bloodUnits: 120,
    phone: '+1 (555) 911-0003',
    address: '100 Potrero Ave, San Francisco, CA'
  }
];

// Initial active demo incidents to showcase immediate activity
const INITIAL_INCIDENTS = [
  {
    id: 'inc-101',
    reporterName: 'Carlos Ramirez',
    reporterPhone: '+1 (555) 777-1234',
    type: 'Medical', // Medical, Fire, Accident, Disaster, Safety
    title: 'Severe Respiratory Distress & Collapse',
    severity: 5, // 1 to 5 scale (5 = Critical Life Threat)
    location: {
      lat: 37.7712,
      lng: -122.4215,
      address: 'Near 16th St & Valencia St, Mission District'
    },
    description: 'Elderly man collapsed outside cafe, breathing shallowly, pulse weak. Bystanders initiating CPR.',
    photoUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500&auto=format&fit=crop&q=80',
    status: 'ASSIGNED', // REPORTED, ASSIGNED, EN_ROUTE, ON_SCENE, RESOLVED, CANCELLED
    assignedResponderId: 'resp-2',
    assignedHospitalId: 'hosp-1',
    createdAt: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
    timeline: [
      { status: 'REPORTED', time: new Date(Date.now() - 6 * 60 * 1000).toISOString(), note: 'Incident broadcasted via SOS' },
      { status: 'ASSIGNED', time: new Date(Date.now() - 5 * 60 * 1000).toISOString(), note: 'Auto-dispatched to Marcus Vance (Paramedic, 0.8km away)' }
    ]
  },
  {
    id: 'inc-102',
    reporterName: 'Jessica Wong',
    reporterPhone: '+1 (555) 888-5678',
    type: 'Accident',
    title: 'Multi-Vehicle Collision with Oil Leak',
    severity: 4,
    location: {
      lat: 37.7815,
      lng: -122.4085,
      address: 'Market St & 5th St Intersection'
    },
    description: 'Two cars collided at high speed. Driver trapped in driver seat, smoke coming from engine block.',
    photoUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=500&auto=format&fit=crop&q=80',
    status: 'EN_ROUTE',
    assignedResponderId: 'resp-3',
    assignedHospitalId: 'hosp-1',
    createdAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    timeline: [
      { status: 'REPORTED', time: new Date(Date.now() - 14 * 60 * 1000).toISOString(), note: 'Citizen emergency reported' },
      { status: 'ASSIGNED', time: new Date(Date.now() - 12 * 60 * 1000).toISOString(), note: 'Matched with Rescue Specialist Elena Rostova' },
      { status: 'EN_ROUTE', time: new Date(Date.now() - 8 * 60 * 1000).toISOString(), note: 'Responder en route. ETA 3 mins.' }
    ]
  }
];

class DatabaseService {
  constructor() {
    this.resetData();
  }

  resetData() {
    // Deep clone to ensure mutation freedom on reset
    this.responders = JSON.parse(JSON.stringify(INITIAL_RESPONDERS));
    this.hospitals = JSON.parse(JSON.stringify(INITIAL_HOSPITALS));
    this.incidents = JSON.parse(JSON.stringify(INITIAL_INCIDENTS));

    // Update initial responders state to reflect active assignments
    const resp2 = this.responders.find(r => r.id === 'resp-2');
    if (resp2) {
      resp2.status = 'ASSIGNED';
      resp2.assignedIncidentId = 'inc-101';
    }
    const resp3 = this.responders.find(r => r.id === 'resp-3');
    if (resp3) {
      resp3.status = 'EN_ROUTE';
      resp3.assignedIncidentId = 'inc-102';
    }
  }

  // --- Incidents ---
  getIncidents() {
    return this.incidents;
  }

  getIncidentById(id) {
    return this.incidents.find(inc => inc.id === id);
  }

  createIncident(data) {
    const newIncident = {
      id: `inc-${Date.now()}`,
      reporterName: data.reporterName || 'Anonymous Citizen',
      reporterPhone: data.reporterPhone || 'Not provided',
      type: data.type || 'Medical',
      title: data.title || `${data.type || 'Emergency'} Incident`,
      severity: parseInt(data.severity, 10) || 3,
      location: data.location || { ...DEFAULT_CENTER, address: 'Reported Location' },
      description: data.description || '',
      photoUrl: data.photoUrl || null,
      status: 'REPORTED',
      assignedResponderId: null,
      assignedHospitalId: null,
      createdAt: new Date().toISOString(),
      timeline: [
        {
          status: 'REPORTED',
          time: new Date().toISOString(),
          note: 'Emergency reported by citizen. Initiating smart dispatch matching...'
        }
      ]
    };

    this.incidents.unshift(newIncident);
    return newIncident;
  }

  updateIncident(id, updates) {
    const incidentIndex = this.incidents.findIndex(inc => inc.id === id);
    if (incidentIndex === -1) return null;

    const existing = this.incidents[incidentIndex];
    const updated = { ...existing, ...updates };

    if (updates.status && updates.status !== existing.status) {
      updated.timeline = [
        ...existing.timeline,
        {
          status: updates.status,
          time: new Date().toISOString(),
          note: updates.statusNote || `Status updated to ${updates.status}`
        }
      ];
    }

    this.incidents[incidentIndex] = updated;
    return updated;
  }

  // --- Responders ---
  getResponders() {
    return this.responders;
  }

  getResponderById(id) {
    return this.responders.find(r => r.id === id);
  }

  updateResponder(id, updates) {
    const respIndex = this.responders.findIndex(r => r.id === id);
    if (respIndex === -1) return null;

    this.responders[respIndex] = { ...this.responders[respIndex], ...updates };
    return this.responders[respIndex];
  }

  // --- Hospitals ---
  getHospitals() {
    return this.hospitals;
  }

  getHospitalById(id) {
    return this.hospitals.find(h => h.id === id);
  }

  updateHospitalBeds(id, change) {
    const hosp = this.getHospitalById(id);
    if (hosp) {
      hosp.availableBeds = Math.max(0, hosp.availableBeds + change);
      if (change < 0 && hosp.icuBedsAvailable > 0) {
        hosp.icuBedsAvailable -= 1;
      }
    }
    return hosp;
  }
}

const db = new DatabaseService();
module.exports = { db, DEFAULT_CENTER };
