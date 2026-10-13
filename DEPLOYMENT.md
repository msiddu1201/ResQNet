# 🚀 ResQNet Deployment Guide (Render & Vercel)

This guide provides end-to-end instructions for deploying **ResQNet** to **Render** (Backend API & WebSockets) and **Vercel** (Frontend React Application).

---

## 📋 Architecture Overview

- **Backend (Render Web Service):** Node.js + Express + Socket.io Server (`/server`)
- **Frontend (Vercel):** React 18 + Vite SPA (`/client`)
- **Real-Time Communication:** Socket.io bi-directional WebSocket telemetry

---

## Step 1: Deploy Backend to Render

### Option A: 1-Click Blueprint (Recommended)
1. Go to the [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** $\rightarrow$ **Blueprint**.
3. Connect your GitHub repository: `https://github.com/msiddu1201/ResQNet`.
4. Render will automatically detect [`render.yaml`](./render.yaml).
5. Click **Apply Blueprint**.

### Option B: Manual Web Service Setup
1. In Render Dashboard, click **New +** $\rightarrow$ **Web Service**.
2. Connect your GitHub repository.
3. Configure the following settings:
   - **Name:** `resqnet-server`
   - **Language / Runtime:** `Node`
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free
4. In the **Environment Variables** section, add:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `CLIENT_URL`: `*` *(or your Vercel URL once deployed, e.g. `https://resqnet.vercel.app`)*
5. Click **Create Web Service**.
6. Wait for deployment to finish. Copy your Render URL (e.g., `https://resqnet-server.onrender.com`).
   - Test it by visiting `https://resqnet-server.onrender.com/api/health` in your browser. It should return `{"status":"ONLINE", ...}`.

---

## Step 2: Deploy Frontend to Vercel

### Deploying via Vercel Dashboard
1. Go to the [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** $\rightarrow$ **Project**.
3. Import your GitHub repository (`msiddu1201/ResQNet`).
4. In **Project Configuration**:
   - If using the repository root: Vercel will use the root [`vercel.json`](./vercel.json) automatically.
   - Or, under **Root Directory**, click **Edit** and select `client`.
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. In **Environment Variables**, add:
   - `VITE_API_URL`: Your Render backend URL (e.g., `https://resqnet-server.onrender.com`)
   - `VITE_SOCKET_URL`: Your Render backend URL (e.g., `https://resqnet-server.onrender.com`)
6. Click **Deploy**.
7. Once deployed, copy your Vercel URL (e.g., `https://resqnet.vercel.app`).

---

## Step 3: Link Vercel URL to Render CORS

For optimal security in production:
1. Go back to your Render Dashboard $\rightarrow$ `resqnet-server` $\rightarrow$ **Environment**.
2. Update `CLIENT_URL` to include your Vercel URL:
   ```env
   CLIENT_URL=https://your-app.vercel.app,http://localhost:3000
   ```
3. Save changes. Render will redeploy automatically.

---

## ⚙️ Environment Variables Summary

### Server (`server/.env` / Render Dashboard)
| Variable | Value | Description |
|---|---|---|
| `PORT` | `10000` | Port for the Express/Socket.io server |
| `NODE_ENV` | `production` | Node environment |
| `CLIENT_URL` | `*` or Vercel URL | Allowed CORS & WebSocket origins |

### Client (`client/.env` / Vercel Dashboard)
| Variable | Value | Description |
|---|---|---|
| `VITE_API_URL` | `https://resqnet-server.onrender.com` | Base URL for REST API endpoints |
| `VITE_SOCKET_URL` | `https://resqnet-server.onrender.com` | WebSocket server URL for live updates |
