# Session 05 — Expiry Document Type Master & Vehicle Odometer Reset

## Context
Stack: Node.js, Express, MySQL (mysql2/promise), React, plain CSS.
Sessions 1–4 are complete.
This session builds 2 remaining master screens.
Hardcode created_by as "ADMIN".

---

## Master 1 — Expiry Document Type

Table: tbl_expiry_document_type
Fields: id, doc_type_code, doc_type_name, description, alert_before_days, is_active, created_by, created_at, updated_by, updated_at

This is a simple lookup master identical in pattern to Session 3 masters, with one extra field: alert_before_days (integer, default 30).

### Backend files
```
backend/src/features/masters/expiryDocType/
  expiryDocType.controller.js
  expiryDocType.routes.js
```

Controller exports: getAll, getById, create, update, toggleActive
Routes:
```
GET    /               → getAll
GET    /:id            → getById
POST   /               → create
PUT    /:id            → update
PATCH  /:id/toggle-active → toggleActive
```
Mount at: /api/expiry-doc-types

### Frontend files
```
frontend/src/pages/masters/ExpiryDocTypeMaster.jsx
frontend/src/api/masters/expiryDocTypeApi.js
```

Form fields: doc_type_code, doc_type_name, description, alert_before_days (number input, min=1, max=365), is_active (checkbox)
Table columns: Code, Name, Alert Before (Days), Status, Actions

---

## Master 2 — Vehicle Odometer Reset

Table: tbl_vehicle_odometer_reset
Fields: id, asset_id, reset_date, previous_reading, new_reading, reason, created_by, created_at

This master is different: it is a log/entry table, not a lookup.
There is no update or toggle active — only add and view.
asset_id is selected from a dropdown populated from tbl_asset_master WHERE asset_status = 'active'.

### Backend files
```
backend/src/features/masters/odometerReset/
  odometerReset.controller.js
  odometerReset.routes.js
```

**getAll(req, res, next)**
```sql
SELECT o.*, a.asset_code, a.asset_name
FROM tbl_vehicle_odometer_reset o
JOIN tbl_asset_master a ON o.asset_id = a.id
ORDER BY o.id DESC
```
Return: { success: true, data: rows }

**getAssetOptions(req, res, next)**
```sql
SELECT id, asset_code, asset_name FROM tbl_asset_master WHERE asset_status = 'active' AND is_active = 1
```
Return: { success: true, data: rows }

**create(req, res, next)**
Fields: asset_id, reset_date, previous_reading, new_reading, reason
created_by hardcoded 'ADMIN'
Validate: new_reading must be >= 0, previous_reading must be >= 0
Return 201: { success: true, message: "Odometer reset recorded", id: insertId }

Routes:
```
GET  /               → getAll
GET  /asset-options  → getAssetOptions
POST /               → create
```
Note: /asset-options must be before / in route order.
Mount at: /api/odometer-resets

### Frontend files
```
frontend/src/pages/masters/OdometerResetMaster.jsx
frontend/src/api/masters/odometerResetApi.js
```

API file exports: getAll, getAssetOptions, create

Page behavior:
- On mount: fetch all records and asset options
- Table columns: Asset Code, Asset Name, Reset Date, Previous Reading, New Reading, Reason, Recorded By, Date
- No Edit, no Toggle — only Add New and view
- Form fields:
  - Asset (select from active assets, label = asset_code + " — " + asset_name)
  - Reset Date (date input)
  - Previous Reading (number, 2 decimal places)
  - New Reading (number, 2 decimal places)
  - Reason (textarea)
- Client-side validation: new_reading must not be less than 0
- On save: call create, refetch, hide form

### Update App.jsx routes
- /masters/expiry-doc-type → ExpiryDocTypeMaster
- /masters/odometer-reset → OdometerResetMaster

### Register in backend/src/routes/index.js
Add:
```
/api/expiry-doc-types
/api/odometer-resets
```

---

## Output rules
- Generate all 4 backend files and 4 frontend files completely
- Do not rebuild any Session 3 or 4 files
- Odometer Reset has no update or toggle — do not add them
