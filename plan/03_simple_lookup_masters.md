# Session 03 — Simple Lookup Masters (Division, Type, Category, Location, Common Doc Type)

## Context
Stack: Node.js, Express, MySQL (mysql2/promise), React, plain CSS.
Sessions 1 and 2 are complete. Scaffold and schema exist.
This session builds 5 simple lookup master screens end to end.
Each master has the same structure: Code, Name, Description, Is Active.
Build all 5 in one session. They share identical patterns.

Hardcode created_by as "ADMIN" for now in all INSERT/UPDATE queries.
No authentication middleware yet.

---

## Masters to build in this session

| Screen Name          | Table                        | Code field        | Name field        |
|----------------------|------------------------------|-------------------|-------------------|
| Asset Division       | tbl_asset_division_master    | division_code     | division_name     |
| Asset Type           | tbl_asset_type_master        | type_code         | type_name         |
| Asset Category       | tbl_asset_category_master    | category_code     | category_name     |
| Location / Area      | tbl_location_area_master     | location_code     | location_name     |
| Common Document Type | tbl_common_document_type     | doc_type_code     | doc_type_name     |

Location master has extra fields: address, city, state, country.
Common Document Type has extra field: is_mandatory (checkbox, boolean).
All others are strictly: code, name, description, is_active.

---

## Backend — for each of the 5 masters generate these files

### File pattern
```
backend/src/features/masters/
  assetDivision/
    assetDivision.controller.js
    assetDivision.routes.js
  assetType/
    assetType.controller.js
    assetType.routes.js
  assetCategory/
    assetCategory.controller.js
    assetCategory.routes.js
  locationArea/
    locationArea.controller.js
    locationArea.routes.js
  commonDocType/
    commonDocType.controller.js
    commonDocType.routes.js
```

### Controller pattern (same for all 5, adapt table/column names)

Each controller exports these functions:

**getAll(req, res, next)**
- Query: SELECT * FROM [table] ORDER BY id DESC
- Return: { success: true, data: rows }

**getById(req, res, next)**
- Query: SELECT * FROM [table] WHERE id = ?
- If not found return 404: { success: false, message: "Not found" }
- Return: { success: true, data: row }

**create(req, res, next)**
- Destructure fields from req.body
- INSERT INTO [table] (...fields...) VALUES (...)
- created_by hardcoded as 'ADMIN'
- Return 201: { success: true, message: "Created successfully", id: insertId }

**update(req, res, next)**
- Destructure fields from req.body
- UPDATE [table] SET ...fields..., updated_by = 'ADMIN' WHERE id = ?
- If affectedRows === 0 return 404
- Return: { success: true, message: "Updated successfully" }

**toggleActive(req, res, next)**
- SELECT is_active WHERE id = ?
- Flip the value
- UPDATE is_active WHERE id = ?
- Return: { success: true, message: "Status updated" }

### Routes pattern (same for all 5)
```
GET    /         → getAll
GET    /:id      → getById
POST   /         → create
PUT    /:id      → update
PATCH  /:id/toggle-active → toggleActive
```

### Register in backend/src/routes/index.js
Mount each router:
```
/api/asset-divisions
/api/asset-types
/api/asset-categories
/api/locations
/api/common-doc-types
```

---

## Frontend — for each of the 5 masters generate these files

### File pattern
```
frontend/src/pages/masters/
  AssetDivisionMaster.jsx
  AssetTypeMaster.jsx
  AssetCategoryMaster.jsx
  LocationAreaMaster.jsx
  CommonDocTypeMaster.jsx
```

### API helper files
```
frontend/src/api/masters/
  assetDivisionApi.js
  assetTypeApi.js
  assetCategoryApi.js
  locationAreaApi.js
  commonDocTypeApi.js
```

Each API file exports: getAll, getById, create, update, toggleActive
Using axiosInstance from src/api/axiosInstance.js.

### Page component pattern (same for all 5, adapt fields)

Each page is a single React component with this layout and behavior:

**Layout (Finacle style):**
- Page title bar: dark blue background, white text, e.g. "Asset Division Master"
- Search/filter bar below title: one text input for code or name search, Search button, Clear button, Add New button
- Data table below: shows all records with columns: Code, Name, Description, Status, Actions
- Actions column: Edit link, Toggle Active link
- Form section below table (or above, your choice): shown/hidden via state
  - Form title: "Add New" or "Edit — [code]"
  - Fields rendered using FormField component from components/common/FormField.jsx
  - Save button, Cancel button

**State:**
- records: array from API
- formData: object matching table columns
- editId: null or id being edited
- showForm: boolean
- searchTerm: string
- loading: boolean
- error: string

**Behavior:**
- On mount: fetch all records
- Search filters records client-side by code or name
- Add New: set showForm true, reset formData, set editId null
- Edit: populate formData with selected row, set editId, set showForm true
- Save: if editId is null call create, else call update, then refetch, hide form
- Toggle Active: call toggleActive, refetch
- Cancel: hide form, reset formData

**Location Master extra fields in form:** address, city, state, country (all text inputs)
**Common Doc Type extra field in form:** is_mandatory (checkbox)

**Status display:** use StatusBadge component. Active = green, Inactive = red.

### Update App.jsx routes
Replace the placeholder routes for these 5 masters with actual imports and components:
- /masters/asset-division → AssetDivisionMaster
- /masters/asset-type → AssetTypeMaster
- /masters/asset-category → AssetCategoryMaster
- /masters/location → LocationAreaMaster
- /masters/common-doc-type → CommonDocTypeMaster

---

## Output rules
- Generate all files completely for all 5 masters
- Keep controller logic minimal and clear
- Do not add validation middleware yet
- Do not build any other screens beyond these 5
- Use the Table, FormField, StatusBadge, Pagination components from Session 1
