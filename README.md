# OXVasset — Asset Management Module (OXIVE ERP)

OXVasset is a robust, full-stack Asset Management module designed as a core component of the **OXIVE ERP** ecosystem. Built with a focus on high-performance data handling and a functional, enterprise-grade user interface, it provides comprehensive tracking, maintenance, and reporting for fixed and movable assets.

---

## 🏛 Project Overview

The OXVasset module manages the entire lifecycle of an asset—from procurement and categorization to depreciation, transfers, and eventual disposal. It is designed to handle complex organizational hierarchies (Divisions, Branches, Locations) and detailed asset classifications.

### Core Philosophy
Unlike modern "flashy" SaaS applications, OXVasset follows a **Functional Enterprise Design**. It prioritizes data density, keyboard accessibility, and rapid data entry, inspired by classic banking ERP systems like **Finacle**.

---

## 🚀 Key Features

### 1. Master Data Management
Comprehensive lookup tables to ensure data integrity across the system:
- **Asset Hierarchy:** Divisions, Categories, Groups, Sub-Groups, Types, and Sub-Types.
- **Location Tracking:** Multi-level location and area management.
- **Document Control:** Common document types and expiry-tracked document types.
- **Maintenance:** Vehicle odometer reset tracking.
- **Asset Master:** The central repository for all asset details, including costs, dates, and specifications.

### 2. Operational Tasks
Transactional workflows for day-to-day asset operations:
- **Asset Change (WIP):** Track modifications and work-in-progress updates.
- **Depreciation Engine:** Automated Straight-Line and WDV depreciation calculation and posting.
- **Asset Reclassification:** Move assets between categories or groups with full audit trails.
- **Disposal & Scrap:** Manage asset sales, write-offs, and scrapping with gain/loss calculation.
- **Transfers:** Inter-division and Inter-branch asset movements.
- **Compliance:** Entry and tracking of expiry-based documents and company licenses.

### 3. Reporting & Analytics
Detailed insights and exportable data:
- **Fixed Asset List:** Comprehensive registry of all assets.
- **Depreciation Summary:** Detailed breakdown of asset valuations.
- **Asset Management Reports:** Operational logs and status reports.
- **Barcode Generation:** Integrated barcode reporting for physical asset tracking.
- **Excel Integration:** High-performance XLSX exports for summary reports and transfers.

---

## 🛠 Tech Stack

### Backend
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Database:** MySQL 8.0+ (using `mysql2/promise` for async pooling)
- **Validation:** `express-validator` for strict schema enforcement.
- **File Handling:** `multer` for document uploads.
- **Standards:** ES Modules (ESM), RESTful API design.

### Frontend
- **Library:** React 18
- **Build Tool:** Vite
- **State Management:** React Hooks (useState, useEffect, useMemo)
- **Routing:** React Router DOM v6
- **Styling:** **Plain CSS3** (Zero external UI libraries like MUI or Tailwind)
- **Communication:** Axios with centralized interceptors.

---

## 🎨 Design Philosophy: "The Finacle Look"

OXVasset adheres to a specific "Old ERP" aesthetic to ensure consistency with legacy enterprise environments:
- **Typography:** Arial / Sans-serif, 13px base for high density.
- **Color Palette:** Professional blues (#003399), neutral grays, and high-contrast alert colors.
- **Table Design:** 1px solid borders, compact rows, fixed headers, and alternating row colors.
- **Inputs:** Minimalistic 24px height inputs with explicit "focus" states for fast keyboard navigation.

---

## 🏗 Architecture & Dataflow

### System Architecture
The project follows a **Modular Feature-Based Architecture**:
- Each feature (e.g., `assetMaster`) has its own `controller`, `routes`, and frontend components.
- **Centralized Config:** Database pooling, sequence generation, and middleware are shared.

### Dataflow Pattern
1.  **User Interface:** User interacts with a React component (e.g., `AssetMaster.jsx`).
2.  **API Layer:** The component calls a specialized API function (e.g., `assetMasterApi.js`) using `axiosInstance`.
3.  **Routing:** Express router directs the request to the specific feature controller.
4.  **Middleware:** `validateRequest` ensures the payload matches the expected schema.
5.  **Controller:** Logic is executed, interacting with MySQL via raw SQL queries for maximum performance and transparency.
6.  **Response:** A standardized JSON object `{ success: true, data: [...] }` is returned.
7.  **State Update:** The frontend updates the local state and re-renders the UI.

### Sequence Generation
The system uses a dedicated `tbl_asset_doc_sequence` table to generate professional document numbers (e.g., `DEP-2025-0001`, `TRF-2025-0042`) instead of exposing raw database IDs.

---

## 📂 Project Structure

```text
OXVasset/
├── backend/                # Express API
│   ├── src/
│   │   ├── config/         # DB Connection, SQL Schema, Seeding
│   │   ├── features/       # Modular business logic (Masters, Tasks, Reports)
│   │   ├── middleware/     # Auth, Validation, Error Handling
│   │   ├── routes/         # Central API routing index
│   │   └── utils/          # Sequence generators, Excel exporters
│   └── server.js           # Entry point
├── frontend/               # React SPA
│   ├── src/
│   │   ├── api/            # Centralized Axios services
│   │   ├── components/     # Custom UI Kit (Table, Modal, FormField)
│   │   ├── pages/          # Screen-level components
│   │   ├── styles/         # Finacle-style CSS modules
│   │   └── utils/          # Formatting and helpers
│   └── vite.config.js
└── plan/                   # Step-by-step implementation roadmap
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v18+)
- MySQL Server (v8.0+)
- NPM or Yarn

### 1. Database Setup
1. Create a database named `oxvasset`.
2. Import the schema: `mysql -u root -p oxvasset < backend/src/config/schema.sql`.
3. (Optional) Seed initial data: `mysql -u root -p oxvasset < backend/src/config/seedData.sql`.

### 2. Backend Configuration
1. `cd backend`
2. `npm install`
3. Create a `.env` file:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=your_password
   DB_NAME=oxvasset
   ```
4. `npm run dev`

### 3. Frontend Configuration
1. `cd frontend`
2. `npm install`
3. `npm run dev`
4. Access the app at `http://localhost:5173`.

---

## 📝 API Endpoints (Summary)

| Category | Endpoint | Methods |
| :--- | :--- | :--- |
| **Dashboard** | `/api/dashboard` | GET |
| **Masters** | `/api/assets`, `/api/asset-divisions`, etc. | GET, POST, PUT, DELETE |
| **Tasks** | `/api/depreciation-entries`, `/api/asset-transfers` | GET, POST |
| **Reports** | `/api/reports/fixed-asset-list` | GET (with filters) |
| **Exports** | `/api/reports/fixed-asset-summary-xl` | GET (triggers download) |

---

## 🛠 Development Workflow

1.  **DB First:** Update `schema.sql` and run `runSchema.js`.
2.  **API Feature:** Create folder in `backend/src/features/`, add controller and routes.
3.  **Register Route:** Add to `backend/src/routes/index.js`.
4.  **Frontend API:** Create service in `frontend/src/api/`.
5.  **UI Page:** Create page in `frontend/src/pages/` using the custom UI components.
6.  **Navigation:** Add to `App.jsx` and `Sidebar.jsx`.

---

© 2024 OXIVE ERP Systems. All Rights Reserved.
