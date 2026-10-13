# AgriConnect - Agricultural Marketplace & Crop Management Platform

An end-to-end digital agribusiness platform connecting agricultural producers (farmers/FPOs), buyers/distributors, and administrators with fair pricing, verified profiles, and atomic zero-overselling inventory transactions.

---

## 🎨 Theme & Aesthetic
- **Color Palette:** Organic Forest Green (`#1b4d3e`, `#2e7d32`), Earth Sage (`#81c784`), Farm Warm Cream (`#faf7ee`, `#f3ede2`), and Harvest Gold (`#e9b949`).
- **Nature Background Effects:** Animated organic floating leaf particles, warm sun-glow ambiance, and stylized farmland contour topography.

---

## 🛠️ Technology Stack (As Specified in Blueprint)
- **Frontend:** React.js (Vite), Tailwind CSS, React Router, Lucide Icons, Canvas Confetti.
- **Backend:** Node.js & Express.js REST API with validation middleware (Zod) and JWT authentication.
- **Database Schema:** PostgreSQL (Supabase ready) complete with relational foreign keys, CHECK constraints, and indexes.

---

## 🚀 Running the Project Locally

### 1. Backend Server (Port 5000)
```bash
cd server
npm install
node src/app.js
```
- Core API: `http://localhost:5000/api/v1`
- Health check: `http://localhost:5000/health`

### 2. Frontend Client (Port 5173)
```bash
cd client
npm install
npm run dev
```
- Open in browser: `http://localhost:5173/`

---

## 🔑 Pre-Configured Demo Accounts (Quick-Fill enabled on Sign In)

| Role | Email | Password |
|---|---|---|
| **Farmer (Producer)** | `ramesh.farmer@agriconnect.org` | `password123` |
| **Buyer (Procurement)** | `buyer@greenharvest.com` | `password123` |
| **Distributor (Logistics)** | `logistics@kisanagro.com` | `password123` |
| **Platform Administrator** | `admin@agriconnect.org` | `password123` |

---

## 📄 Core Architecture Modules Implemented
1. **Atomic Inventory & Ordering (`/api/v1/orders`):** Deducts available quantity, reserves stock, creates order item snapshot, and schedules delivery inside a single transaction.
2. **Product Catalog & Search (`/api/v1/products`):** Multi-filter search (commodity name, category, region, price) with pagination.
3. **Farmer Dashboard (`/farmer-dashboard`):** Real-time inventory volume, crop listing form, and incoming order acceptance.
4. **Order Tracking & Consignment (`/orders`):** 5-stage milestone tracking from harvest booking to delivery.
5. **Admin Governance & Audit (`/admin`):** User verification approvals and immutable event audit logs.
