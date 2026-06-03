# Session 06 — Asset Master

## Context
Stack: Node.js, Express, MySQL (mysql2/promise), React, plain CSS.
Sessions 1–5 are complete. All lookup master tables exist and have data.
This session builds the Asset Master screen — the central record of the module.
This is the most complex master. Take extra care with dropdowns and dependent fields.
Hardcode created_by as "ADMIN".

---

## Table: tbl_asset_master

Columns:
id, asset_code, asset_name, description, division_id, asset_type_id, asset_sub_type_id,
category_id, group_id, sub_group_id, location_id, serial_number, model_number,
manufacturer, purchase_date, purchase_cost, salvage_value, useful_life_years,
depreciation_method, depreciation_rate, accumulated_depreciation, current_book_value,
barcode, qr_code, asset_status, is_active, remarks, created_by, created_at, updated_by, updated_at

---

## Backend

### Files
```
backend/src/features/masters/assetMaster/
  assetMaster.controller.js
  assetMaster.routes.js
```

### Controller exports

**getAll(req, res, next)**
```sql
SELECT
  a.*,
  d.division_name,
  t.type_name,
  st.sub_type_name,
  c.category_name,
  g.group_name,
  sg.sub_group_name,
  l.location_name
FROM tbl_asset_master a
LEFT JOIN tbl_asset_division_master d ON a.division_id = d.id
LEFT JOIN tbl_asset_type_master t ON a.asset_type_id = t.id
LEFT JOIN tbl_asset_sub_type_master st ON a.asset_sub_type_id = st.id
LEFT JOIN tbl_asset_category_master c ON a.category_id = c.id
LEFT JOIN tbl_asset_group_master g ON a.group_id = g.id
LEFT JOIN tbl_asset_sub_group_master sg ON a.sub_group_id = sg.id
LEFT JOIN tbl_location_area_master l ON a.location_id = l.id
ORDER BY a.id DESC
```
Return: { success: true, data: rows }

**getById(req, res, next)**
Same JOIN, WHERE a.id = ?
Return: { success: true, data: row }

**getDropdownOptions(req, res, next)**
Fetch all options needed for the form in a single request to avoid multiple API calls.
Return:
```json
{
  "success": true,
  "data": {
    "divisions": [{ "id": 1, "label": "division_name" }],
    "assetTypes": [{ "id": 1, "label": "type_name" }],
    "assetSubTypes": [{ "id": 1, "label": "sub_type_name", "asset_type_id": 1 }],
    "categories": [{ "id": 1, "label": "category_name" }],
    "groups": [{ "id": 1, "label": "group_name", "category_id": 1 }],
    "subGroups": [{ "id": 1, "label": "sub_group_name", "group_id": 1 }],
    "locations": [{ "id": 1, "label": "location_name" }]
  }
}
```
Each array fetches only is_active = 1 records.

**create(req, res, next)**
Insert all fields. created_by = 'ADMIN'.
Set current_book_value = purchase_cost - accumulated_depreciation on insert.
Return 201: { success: true, message: "Asset created", id: insertId }

**update(req, res, next)**
Update all editable fields. updated_by = 'ADMIN'.
Recalculate current_book_value = purchase_cost - accumulated_depreciation.
Return: { success: true, message: "Asset updated" }

**updateStatus(req, res, next)**
Body: { asset_status }
Valid values: 'active', 'disposed', 'transferred', 'wip', 'scrapped'
UPDATE asset_status WHERE id = ?
Return: { success: true, message: "Status updated" }

**toggleActive(req, res, next)**
Flip is_active.
Return: { success: true, message: "Active status toggled" }

### Routes
```
GET    /                  → getAll
GET    /dropdown-options  → getDropdownOptions
GET    /:id               → getById
POST   /                  → create
PUT    /:id               → update
PATCH  /:id/status        → updateStatus
PATCH  /:id/toggle-active → toggleActive
```
Note: /dropdown-options must be before /:id.

Mount at: /api/assets

Register in backend/src/routes/index.js.

---

## Frontend

### Files
```
frontend/src/pages/masters/AssetMaster.jsx
frontend/src/api/masters/assetMasterApi.js
```

API file exports: getAll, getById, getDropdownOptions, create, update, updateStatus, toggleActive

### Page layout

**Title bar:** "Asset Master"

**Search/filter bar:**
- Text input: search by asset_code or asset_name
- Select: filter by division (options from loaded data)
- Select: filter by asset_status (All, active, disposed, transferred, wip, scrapped)
- Search button, Clear button, Add New button

**Table columns:**
Asset Code | Asset Name | Division | Type | Category | Location | Purchase Cost | Status | Active | Actions

Actions: Edit, Toggle Active

**Form — split into 3 sections using form-section-title divs:**

Section 1 — Basic Information:
- asset_code (text, required)
- asset_name (text, required)
- description (textarea)
- division_id (select, required) — options from dropdownOptions.divisions
- asset_status (select: active, disposed, transferred, wip, scrapped)
- remarks (textarea)

Section 2 — Classification:
- asset_type_id (select, required) — options from dropdownOptions.assetTypes
- asset_sub_type_id (select, optional) — filtered by selected asset_type_id from dropdownOptions.assetSubTypes
- category_id (select, required) — options from dropdownOptions.categories
- group_id (select, required) — filtered by selected category_id from dropdownOptions.groups
- sub_group_id (select, optional) — filtered by selected group_id from dropdownOptions.subGroups
- location_id (select, optional) — options from dropdownOptions.locations

Section 3 — Purchase & Depreciation:
- serial_number (text)
- model_number (text)
- manufacturer (text)
- purchase_date (date)
- purchase_cost (number, 2 decimal places)
- salvage_value (number, 2 decimal places, default 0)
- useful_life_years (number, integer)
- depreciation_method (select: straight_line, wdv, none)
- depreciation_rate (number, 2 decimal places)
- accumulated_depreciation (number, 2 decimal places, default 0)
- barcode (text)
- qr_code (text)

**Dependent dropdown behavior (implement in React state):**
- When asset_type_id changes: filter assetSubTypes where asset_type_id matches, reset asset_sub_type_id
- When category_id changes: filter groups where category_id matches, reset group_id and sub_group_id
- When group_id changes: filter subGroups where group_id matches, reset sub_group_id

**State:**
- records, formData, editId, showForm, searchTerm, statusFilter, divisionFilter
- dropdownOptions: { divisions, assetTypes, assetSubTypes, categories, groups, subGroups, locations }
- filteredSubTypes, filteredGroups, filteredSubGroups (derived from dropdownOptions + current selections)
- loading, error

On mount: fetch getAll and getDropdownOptions in parallel using Promise.all.

### Update App.jsx
- /masters/asset-master → AssetMaster

---

## Output rules
- Generate all files completely
- Dependent dropdowns must filter client-side from loaded dropdownOptions — do not make extra API calls on selection change
- Do not rebuild any previous session files
- current_book_value is calculated server-side on create/update, not in the form
