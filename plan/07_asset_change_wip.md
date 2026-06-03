# Session 07 — Asset Change WIP

## Context
Stack: Node.js, Express, MySQL (mysql2/promise), React, plain CSS.
Sessions 1–6 are complete. Asset Master exists.
This session builds the Asset Change WIP screen only.
This is a task/entry screen that tracks changes made to assets (upgrades, modifications, repairs) with an approval workflow.
Hardcode created_by and updated_by as "ADMIN".

---

## Table: tbl_asset_change_wip

Columns:
id, asset_id, change_date, change_type, old_value, new_value, cost_incurred,
status (pending/approved/rejected), approved_by, approved_at,
remarks, created_by, created_at, updated_by, updated_at

---

## Backend

### Files
```
backend/src/features/tasks/assetChangeWip/
  assetChangeWip.controller.js
  assetChangeWip.routes.js
```

### Controller exports

**getAll(req, res, next)**
```sql
SELECT w.*, a.asset_code, a.asset_name
FROM tbl_asset_change_wip w
JOIN tbl_asset_master a ON w.asset_id = a.id
ORDER BY w.id DESC
```
Return: { success: true, data: rows }

**getById(req, res, next)**
Same JOIN WHERE w.id = ?

**getAssetOptions(req, res, next)**
```sql
SELECT id, asset_code, asset_name FROM tbl_asset_master WHERE is_active = 1 ORDER BY asset_code
```
Return: { success: true, data: rows }

**create(req, res, next)**
Fields: asset_id, change_date, change_type, old_value, new_value, cost_incurred, remarks
status defaults to 'pending', created_by = 'ADMIN'
Return 201: { success: true, message: "WIP entry created", id: insertId }

**update(req, res, next)**
Only allowed if status = 'pending'.
Check status before update:
```sql
SELECT status FROM tbl_asset_change_wip WHERE id = ?
```
If status != 'pending' return 400: { success: false, message: "Only pending entries can be edited" }
Update fields: change_date, change_type, old_value, new_value, cost_incurred, remarks, updated_by = 'ADMIN'

**approve(req, res, next)**
Body: { action } where action is 'approved' or 'rejected'
Update:
```sql
UPDATE tbl_asset_change_wip
SET status = ?, approved_by = 'ADMIN', approved_at = NOW(), updated_by = 'ADMIN'
WHERE id = ? AND status = 'pending'
```
If affectedRows === 0 return 400: { success: false, message: "Entry not found or already processed" }
Return: { success: true, message: "Entry " + action }

### Routes
```
GET    /               → getAll
GET    /asset-options  → getAssetOptions
GET    /:id            → getById
POST   /               → create
PUT    /:id            → update
PATCH  /:id/approve    → approve
```
Note: /asset-options before /:id.

Mount at: /api/asset-change-wip
Register in backend/src/routes/index.js.

---

## Frontend

### Files
```
frontend/src/pages/tasks/AssetChangeWip.jsx
frontend/src/api/tasks/assetChangeWipApi.js
```

API exports: getAll, getAssetOptions, create, update, approve

### Page layout

**Title bar:** "Asset Change — WIP"

**Filter bar:**
- Select: filter by status (All, pending, approved, rejected)
- Text input: search by asset code or name
- Clear button, Add New button

**Table columns:**
Asset Code | Asset Name | Change Date | Change Type | Old Value | New Value | Cost Incurred | Status | Actions

Actions:
- Edit link — only visible if status = 'pending'
- Approve link — only visible if status = 'pending'
- Reject link — only visible if status = 'pending'

**Form — single section:**
- Asset (select, required) — options from assetOptions, label = asset_code + " — " + asset_name
- Change Date (date, required)
- Change Type (text, required) — e.g. Upgrade, Repair, Modification
- Old Value (text)
- New Value (text)
- Cost Incurred (number, 2 decimal places, default 0)
- Remarks (textarea)

**State:**
- records, assetOptions, formData, editId, showForm
- statusFilter, searchTerm, loading, error

**Behavior:**
- On approve click: show a confirm dialog ("Approve this entry?"), call approve with action='approved', refetch
- On reject click: show a confirm dialog ("Reject this entry?"), call approve with action='rejected', refetch
- Edit only allowed for pending entries — if user somehow triggers edit on non-pending, show alert

### Update App.jsx
- /tasks/asset-change-wip → AssetChangeWip

---

## Output rules
- Generate all files completely
- Status badge colors: pending=orange, approved=green, rejected=red
- Do not rebuild previous session files
