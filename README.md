# 🚨 ResQNet — Real-Time Emergency Response & Resource Dispatch Network

**ResQNet** is a decentralized community emergency response system connecting citizens in distress with nearby qualified first responders (paramedics, off-duty physicians, firefighters, and trained volunteers) and hospital resources in real time.

Built on the **MERN Stack** (MongoDB/Node.js/Express/React) with **Socket.io** bi-directional WebSockets and **Leaflet OpenStreetMap** geospatial rendering.

---

## 🌟 Why ResQNet Stands Out

- **Feels like a real-world product:** Real-time bi-directional telemetry, dynamic ETA calculations, and multi-tier emergency dispatch workflows instead of a static CRUD app.
- **Smart Multi-Factor Matching Engine:** Automatically calculates distance via the **Haversine formula**, compares incident category with responder certifications (e.g. CPR, Trauma Care, Hazmat), and weighs urgency multipliers to allocate the highest-scoring candidate.
- **Three Specialized Operational Portals:**
  1. **Citizen SOS Portal:** One-touch GPS broadcast, category selection (Medical, Fire, Crash, Disaster), severity scale (1–5), photo proof, and real-time live tracking with assigned responder details and hospital standby.
  2. **First Responder Console:** Active duty switcher, urgent dispatch audio/visual alerts, interactive workflow progression (`ASSIGNED` ➔ `EN_ROUTE` ➔ `ON_SCENE` ➔ `RESOLVED`), live GPS navigation simulation, and hospital trauma bay reservations.
  3. **Admin Command Center:** Tactical map grid, MTTA/MTTR response time metrics, critical alert counters, hospital ICU bed gauges, manual dispatch override, and simulation controls.
- **Zero-Friction Startup & Mock Simulation:** Includes mock hospitals, verified responders, realistic incident seeds, and a 1-click simulation toolbar to test emergency broadcasts and animated responder routes without needing external 911 integrations.

---

## 🛠️ Architecture & Tech Stack

```
               ┌────────────────────────────────────────────────────────┐
               │                CLIENT (React 18 + Vite)                │
               │  Citizen Portal  │  Responder App  │  Admin Dashboard   │
               │  Leaflet Tactical Maps  │  Tailwind CSS UI System      │
               └───────────────────────────▲────────────────────────────┘
                                           │
                        REST APIs & WebSocket (Socket.io)
                                           │
               ┌───────────────────────────▼────────────────────────────┐
               │              SERVER (Node.js & Express)                │
               │  REST API Router  │  Socket.io Telemetry Broadcast     │
               │  Smart Matching Engine (Haversine + Skill Matrix)      │
               │  Resilient Data Store (MongoDB / In-Memory Fallback)   │
               └────────────────────────────────────────────────────────┘
```

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons, Leaflet / OpenStreetMap.
- **Backend:** Node.js, Express, Socket.io, UUID, CORS, Multer.
- **Matching Algorithm:** Spherical trigonometry (Haversine), weighted skill matrix, and urgency penalty functions.

---

## 📐 Smart Matching Algorithm Formula

The dispatcher scores every active responder within sector bounds:

$$\text{Score} = (w_{\text{dist}} \times \text{ProximityScore}) + (w_{\text{skill}} \times \text{SkillScore}) + (w_{\text{avail}} \times \text{AvailabilityScore}) + (w_{\text{exp}} \times \text{RatingScore})$$

- **Proximity Score:** Derived from Haversine distance, scaling from $1.0$ at 0 km down to $0.0$ at 15 km.
- **Skill Score:** Matches incident category requirements (e.g., *Medical* requires `Trauma Care`, `CPR`, `AED`; *Fire* requires `Fire Suppression`, `Vehicle Extrication`).
- **Urgency Weighting:** When incident severity is $\ge 4$, proximity weight increases to prioritize immediate intervention time.
- **Hospital Standby:** Identifies the closest hospital with available general beds and emergency ICU slots.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)

### 2. Installation
Open a terminal in the project root:

```bash
# Install root orchestration dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
cd ..
```

Or run all installs in one command:
```bash
npm run install-all
```

### 3. Launching the Application
You can run the full stack simultaneously with concurrently:

```bash
npm run dev
```

Or run the server and client in separate terminals:

**Terminal 1 (Backend Server):**
```bash
cd server
npm start
```
*Server starts on `http://localhost:5000`*

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
```
*Client starts on `http://localhost:3000`*

Open **http://localhost:3000** in your browser!

---

## 🎮 Interactive Simulation Walkthrough

Use the **Simulation Bar** at the top of the interface:
1. Click **"+ Simulate Citizen SOS"**: A new emergency will be generated with randomized coordinates and auto-dispatched to the best available responder.
2. Click **"Animate Responder Route"**: Watches the assigned first responder navigate along the coordinates to the scene on the live map in real time!
3. Switch between **Citizen SOS**, **Responder Unit**, and **Admin Command** tabs to see live updates sync instantaneously across all views via WebSockets.
4. Click **"Reset Seeds"** anytime to return the grid to default clean demo state.
