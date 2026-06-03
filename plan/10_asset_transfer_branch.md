# Session 10 — Asset Transfer & Branch Transfer

## Context
Stack: Node.js, Express, MySQL (mysql2/promise), React, plain CSS.
Sessions 1–9 are complete.
This session builds two transfer task screens.
Both use auto-generated document numbers.
Hardcode created_by and updated_by as "ADMIN".

---

## Task 1 — Asset Transfer (Division to Division)

Table: tbl_asset_transfer
Columns:
id, transfer_no, transfer_date, asset_id,
from_division_id, to_division_id,
from_location_id, to_location_id,
reason, status (draft/approved/completed/rejected),
approved_by, approved_at, created_by, created_at, updated_by, updated_at

### Backend files
```
backend/src/features/tasks/assetTransfer/
  assetTransfer.controller.js
  assetTransfer.routes.js
```

**getAll:**
```sql
SELECT t.*,
  a.asset_code, a.asset_name,
  fd.division_name AS from_division_name,
  td.division_name AS to_division_name,
  fl.location_name AS from_location_name,
  tl.location_name AS to_location_name
FROM tbl_asset_transfer t
JOIN tbl_asset_master a ON t.asset_id = a.id
LEFT JOIN tbl_asset_division_master fd ON t.from_division_id = fd.id
LEFT JOIN tbl_asset_division_master td ON t.to_division_id = td.id
LEFT JOIN tbl_location_area_master fl ON t.from_location_id = fl.id
LEFT JOIN tbl_location_area_master tl ON t.to_location_id = tl.id
ORDER BY t.id DESC
```

**getById:** Same with WHERE t.id = ?

**getAssetOptions:**
SELECT id, asset_code, asset_name, division_id, location_id
FROM tbl_asset_master WHERE is_active = 1 AND asset_status = 'active'
Include division_id and location_id so frontend can auto-fill from_ fields.

**getDivisionOptions:**
SELECT id, division_name AS name FROM tbl_asset_division_master WHERE is_active = 1

**getLocationOptions:**
SELECT id, location_name AS name FROM tbl_location_area_master WHERE is_active = 1

**create:**
1. Generate transfer_no using generateDocNumber(pool, 'TRANSFER')
2. from_division_id and from_location_id auto-populated from asset's current data (sent from frontend)
3. Insert with status = 'draft'

**approve(req, res, next):**
Body: { action } — 'approved', 'completed', 'rejected'
If action = 'completed':
  Transaction:
  1. Set status = 'completed', approved_by/at
  2. UPDATE tbl_asset_master SET
     division_id = to_division_id,
     location_id = to_location_id,
     asset_status = 'transferred',
     updated_by = 'ADMIN'
     WHERE id = asset_id
If action = 'approved': set status = 'approved' only.
If action = 'rejected': set status = 'rejected' only.

**update:** Only if status = 'draft'.

Routes:
```
GET    /                  → getAll
GET    /asset-options     → getAssetOptions
GET    /division-options  → getDivisionOptions
GET    /location-options  → getLocationOptions
GET    /:id               → getById
POST   /                  → create
PUT    /:id               → update
PATCH  /:id/approve       → approve
```
Mount at: /api/asset-transfers

### Frontend files
```
frontend/src/pages/tasks/AssetTransfer.jsx
frontend/src/api/tasks/assetTransferApi.js
```

Table: Transfer No | Asset | Date | From Division | To Division | From Location | To Location | Status | Actions

Form:
- Asset (select, required) — on selection auto-fill from_division_id, from_location_id
- Transfer Date (date, required)
- From Division (select, read-only, auto-filled from asset)
- From Location (select, read-only, auto-filled from asset)
- To Division (select, required) — must differ from from_division_id, client-side check
- To Location (select, optional)
- Reason (textarea)

Actions per status:
- draft: Edit, Approve, Reject
- approved: Complete, Reject
- completed/rejected: View only

---

## Task 2 — Asset Branch Transfer

Table: tbl_asset_branch_transfer
Columns:
id, branch_transfer_no, transfer_date, asset_id,
from_branch (varchar, free text), to_branch (varchar, free text),
from_location_id, to_location_id,
reason, status (draft/approved/completed/rejected),
approved_by, approved_at, created_by, created_at, updated_by, updated_at

Note: from_branch and to_branch are plain text fields (branch names), not foreign keys.

### Backend files
```
backend/src/features/tasks/branchTransfer/
  branchTransfer.controller.js
  branchTransfer.routes.js
```

**getAll:**
```sql
SELECT bt.*,
  a.asset_code, a.asset_name,
  fl.location_name AS from_location_name,
  tl.location_name AS to_location_name
FROM tbl_asset_branch_transfer bt
JOIN tbl_asset_master a ON bt.asset_id = a.id
LEFT JOIN tbl_location_area_master fl ON bt.from_location_id = fl.id
LEFT JOIN tbl_location_area_master tl ON bt.to_location_id = tl.id
ORDER BY bt.id DESC
```

**getById:** Same with WHERE bt.id = ?

**getAssetOptions:**
SELECT id, asset_code, asset_name FROM tbl_asset_master WHERE is_active = 1 AND asset_status = 'active'

**getLocationOptions:**
SELECT id, location_name AS name FROM tbl_location_area_master WHERE is_active = 1

**create:**
1. Generate branch_transfer_no using generateDocNumber(pool, 'BRANCH_TRANSFER')
2. Insert with status = 'draft'

**approve(req, res, next):**
Body: { action } — 'approved', 'completed', 'rejected'
If action = 'completed':
  Transaction:
  1. Set status = 'completed'
  2. UPDATE tbl_asset_master SET location_id = to_location_id WHERE id = asset_id

**update:** Only if status = 'draft'.

Routes:
```
GET    /                  → getAll
GET    /asset-options     → getAssetOptions
GET    /location-options  → getLocationOptions
GET    /:id               → getById
POST   /                  → create
PUT    /:id               → update
PATCH  /:id/approve       → approve
```
Mount at: /api/branch-transfers

### Frontend files
```
frontend/src/pages/tasks/BranchTransfer.jsx
frontend/src/api/tasks/branchTransferApi.js
```

Table: Transfer No | Asset | Date | From Branch | To Branch | From Location | To Location | Status | Actions

Form:
- Asset (select, required)
- Transfer Date (date, required)
- From Branch (text input, required)
- To Branch (text input, required)
- From Location (select, optional)
- To Location (select, optional)
- Reason (textarea)

---

### Register both in backend/src/routes/index.js
```
/api/asset-transfers
/api/branch-transfers
```

### Update App.jsx
- /tasks/asset-transfer → AssetTransfer
- /tasks/branch-transfer → BranchTransfer

---

## Output rules
- Generate all files completely for both tasks
- from_division and from_location in AssetTransfer are read-only, populated from asset selection
- Confirm dialogs before approve/complete/reject actions
- Do not rebuild previous session files
