// ResQNet Smart Matching & Resource Allocation Engine

/**
 * Calculate distance in kilometers between two lat/lng coordinates using the Haversine formula
 */
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

/**
 * Skill relevance definitions mapped to emergency categories
 */
const REQUIRED_SKILLS = {
  Medical: ['Trauma Care', 'CPR', 'Advanced Airway', 'Triage', 'First Aid', 'AED'],
  Fire: ['Fire Suppression', 'Search & Rescue', 'Hazmat', 'Vehicle Extrication'],
  Accident: ['Vehicle Extrication', 'Trauma Care', 'First Aid', 'AED', 'CPR'],
  Disaster: ['Search & Rescue', 'Water Rescue', 'Triage', 'Crowd Management', 'Wound Care'],
  Safety: ['Crowd Management', 'First Aid', 'Mental Health First Aid']
};

/**
 * Compute skill match percentage (0.0 to 1.0)
 */
function computeSkillScore(incidentType, responderSkills) {
  const targetSkills = REQUIRED_SKILLS[incidentType] || REQUIRED_SKILLS.Medical;
  if (!responderSkills || responderSkills.length === 0) return 0.2;

  let matched = 0;
  for (const skill of responderSkills) {
    if (targetSkills.includes(skill)) {
      matched += 1;
    }
  }

  // Baseline credit for general responder capability
  const matchRatio = matched / Math.min(targetSkills.length, 3);
  return Math.min(1.0, 0.3 + 0.7 * matchRatio);
}

/**
 * Match the optimal responder for an incident based on multi-factor evaluation
 */
function findBestResponders(incident, responders, limit = 3) {
  const { lat, lng } = incident.location;
  const severity = incident.severity || 3;

  // Filter only eligible responders (exclude OFF_DUTY)
  const candidates = responders.filter(r => r.status === 'AVAILABLE' || r.status === 'ASSIGNED');

  const scoredCandidates = candidates.map(responder => {
    const distanceKm = calculateDistanceKm(
      lat,
      lng,
      responder.location.lat,
      responder.location.lng
    );

    // Proximity score: 1.0 at 0km, decays smoothly up to 15km
    const proximityScore = Math.max(0, 1 - distanceKm / 15);

    // Skill score
    const skillScore = computeSkillScore(incident.type, responder.skills);

    // Availability penalty if already assigned
    const availabilityScore = responder.status === 'AVAILABLE' ? 1.0 : 0.4;

    // Experience / rating factor
    const ratingScore = (responder.rating || 4.5) / 5.0;

    // Dynamic weights adjusted by severity
    // Critical emergencies (Severity 4-5) value proximity and raw speed heavily
    let wDistance = 0.45;
    let wSkill = 0.35;
    let wAvail = 0.15;
    let wRating = 0.05;

    if (severity >= 4) {
      wDistance = 0.55;
      wSkill = 0.30;
      wAvail = 0.10;
      wRating = 0.05;
    }

    const totalScore = (
      proximityScore * wDistance +
      skillScore * wSkill +
      availabilityScore * wAvail +
      ratingScore * wRating
    );

    // Estimated response time (approx 35 km/h urban speed + 2 min prep)
    const etaMinutes = Math.max(2, Math.round((distanceKm / 35) * 60 + 2));

    return {
      responder,
      distanceKm,
      etaMinutes,
      proximityScore: parseFloat(proximityScore.toFixed(3)),
      skillScore: parseFloat(skillScore.toFixed(3)),
      totalScore: parseFloat(totalScore.toFixed(3)),
      recommendationReason: `Distance: ${distanceKm}km | ETA: ~${etaMinutes}m | Skill match: ${Math.round(skillScore * 100)}%`
    };
  });

  // Sort descending by total score
  scoredCandidates.sort((a, b) => b.totalScore - a.totalScore);

  return scoredCandidates.slice(0, limit);
}

/**
 * Find closest hospital with capacity
 */
function findBestHospital(incidentLocation, hospitals) {
  if (!hospitals || hospitals.length === 0) return null;

  const scoredHospitals = hospitals.map(hospital => {
    const distanceKm = calculateDistanceKm(
      incidentLocation.lat,
      incidentLocation.lng,
      hospital.location.lat,
      hospital.location.lng
    );

    // Bed availability factor
    const hasCapacity = hospital.availableBeds > 0;
    const hasIcu = hospital.icuBedsAvailable > 0;

    return {
      hospital,
      distanceKm,
      hasCapacity,
      hasIcu,
      score: (hasCapacity ? 10 : 0) + (hasIcu ? 5 : 0) - distanceKm
    };
  });

  scoredHospitals.sort((a, b) => b.score - a.score);
  return scoredHospitals[0] ? scoredHospitals[0].hospital : null;
}

module.exports = {
  calculateDistanceKm,
  findBestResponders,
  findBestHospital,
  REQUIRED_SKILLS
};
