# Session 04 — Hierarchical Masters (Sub Type, Group, Sub Group)

## Context
Stack: Node.js, Express, MySQL (mysql2/promise), React, plain CSS.
Sessions 1–3 are complete.
This session builds 3 masters that each depend on a parent master from Session 3.
The dependency chain is:
  Asset Sub Type → parent: Asset Type (tbl_asset_type_master)
  Asset Group    → parent: Asset Category (tbl_asset_category_master)
  Asset Sub Group → parent: Asset Group (tbl_asset_group_master)

Hardcode created_by as "ADMIN" in all INSERT/UPDATE.

---

## Masters to build

| Screen               | Table                      | Parent Table                  | Parent FK       |
|----------------------|----------------------------|-------------------------------|-----------------|
| Asset Sub Type       | tbl_asset_sub_type_master  | tbl_asset_type_master         | asset_type_id   |
| Asset Group          | tbl_asset_group_master     | tbl_asset_category_master     | category_id     |
| Asset Sub Group      | tbl_asset_sub_group_master | tbl_asset_group_master        | group_id        |

---

## Backend

### Files to generate
```
backend/src/features/masters/
  assetSubType/
    assetSubType.controller.js
    assetSubType.routes.js
  assetGroup/
    assetGroup.controller.js
    assetGroup.routes.js
  assetSubGroup/
    assetSubGroup.controller.js
    assetSubGroup.routes.js
```

### Controller pattern for all 3

**getAll(req, res, next)**
JOIN with parent table to include parent name in response.
Example for assetSubType:
```sql
SELECT s.*, t.type_name AS parent_name
FROM tbl_asset_sub_type_master s
JOIN tbl_asset_type_master t ON s.asset_type_id = t.id
ORDER BY s.id DESC
```
Return: { success: true, data: rows }

**getById(req, res, next)**
Same JOIN, WHERE s.id = ?
Return: { success: true, data: row }

**getParentOptions(req, res, next)**
Fetch all active parent records for populating the dropdown.
Example for assetSubType: SELECT id, type_name AS name FROM tbl_asset_type_master WHERE is_active = 1
Return: { success: true, data: rows }

**create(req, res, next)**
INSERT including parent_id field.
Return 201: { success: true, message: "Created successfully", id: insertId }

**update(req, res, next)**
UPDATE including parent_id field.
Return: { success: true, message: "Updated successfully" }

**toggleActive(req, res, next)**
Flip is_active.
Return: { success: true, message: "Status updated" }

### Routes for each (same pattern)
```
GET    /               → getAll
GET    /parent-options → getParentOptions
GET    /:id            → getById
POST   /               → create
PUT    /:id            → update
PATCH  /:id/toggle-active → toggleActive
```

Note: /parent-options must be registered BEFORE /:id to avoid route conflict.

### Register in backend/src/routes/index.js
Add:
```
/api/asset-sub-types
/api/asset-groups
/api/asset-sub-groups
```

---

## Frontend

### Files to generate
```
frontend/src/pages/masters/
  AssetSubTypeMaster.jsx
  AssetGroupMaster.jsx
  AssetSubGroupMaster.jsx

frontend/src/api/masters/
  assetSubTypeApi.js
  assetGroupApi.js
  assetSubGroupApi.js
```

Each API file exports: getAll, getById, getParentOptions, create, update, toggleActive.

### Page component pattern

Same as Session 3 pages with these differences:

**Extra state:**
- parentOptions: array fetched from /parent-options endpoint on mount

**Form additions:**
- Parent dropdown (select) as first field, required
- Use FormField component with type="select" and options={parentOptions.map(o => ({ value: o.id, label: o.name }))}

**Table additions:**
- Extra column "Parent" showing parent_name from joined data

**Finacle style note:**
- Dropdown shows "-- Select --" as default empty option
- On parent selection the code and name fields become editable

### Update App.jsx routes
- /masters/asset-sub-type → AssetSubTypeMaster
- /masters/asset-group → AssetGroupMaster
- /masters/asset-sub-group → AssetSubGroupMaster

---

## Output rules
- Generate all 6 backend files and 6 frontend files completely
- The /parent-options route must return only active records
- Do not rebuild Session 3 files
- Do not add any other screens
