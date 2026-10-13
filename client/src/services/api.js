const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';


export async function fetchIncidents() {
  const res = await fetch(`${API_BASE}/incidents`);
  return res.json();
}

export async function fetchIncidentById(id) {
  const res = await fetch(`${API_BASE}/incidents/${id}`);
  return res.json();
}

export async function createIncident(data) {
  const res = await fetch(`${API_BASE}/incidents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateIncidentStatus(id, status, note, assignedResponderId) {
  const res = await fetch(`${API_BASE}/incidents/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, note, assignedResponderId })
  });
  return res.json();
}

export async function assignResponder(incidentId, responderId) {
  const res = await fetch(`${API_BASE}/incidents/${incidentId}/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ responderId })
  });
  return res.json();
}

export async function fetchResponders() {
  const res = await fetch(`${API_BASE}/responders`);
  return res.json();
}

export async function updateResponderStatus(id, status) {
  const res = await fetch(`${API_BASE}/responders/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  return res.json();
}

export async function updateResponderLocation(id, lat, lng) {
  const res = await fetch(`${API_BASE}/responders/${id}/location`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lat, lng })
  });
  return res.json();
}

export async function fetchHospitals() {
  const res = await fetch(`${API_BASE}/hospitals`);
  return res.json();
}

export async function updateHospitalBeds(id, delta) {
  const res = await fetch(`${API_BASE}/hospitals/${id}/beds`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ delta })
  });
  return res.json();
}

export async function resetMockData() {
  const res = await fetch(`${API_BASE}/mock/reset`, { method: 'POST' });
  return res.json();
}

export async function spawnMockIncident() {
  const res = await fetch(`${API_BASE}/mock/spawn`, { method: 'POST' });
  return res.json();
}
