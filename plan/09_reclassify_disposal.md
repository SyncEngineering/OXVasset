# Session 09 — Asset Reclassify & Asset Sale/Disposal

## Context
Stack: Node.js, Express, MySQL (mysql2/promise), React, plain CSS.
Sessions 1–8 are complete.
This session builds two task screens: Asset Reclassify and Asset Sale/Disposal.
Both use auto-generated document numbers from sequenceGenerator.js.
Hardcode created_by and updated_by as "ADMIN".

---

## Task 1 — Asset Reclassify

Table: tbl_asset_reclassify
Columns:
id, reclassify_no, reclassify_date, asset_id,
old_category_id, new_category_id,
old_group_id, new_group_id,
old_sub_group_id, new_sub_group_id,
reason, status (draft/approved/rejected),
approved_by, approved_at, created_by, created_at, updated_by, updated_at

### Backend files
```
backend/src/features/tasks/assetReclassify/
  assetReclassify.controller.js
  assetReclassify.routes.js
```

**getAll:** JOIN asset_master for asset_code/name, JOIN category twice (old/new), GROUP twice (old/new).
Use aliases: old_cat.category_name AS old_category_name, new_cat.category_name AS new_category_name, etc.

**getById:** Same with WHERE r.id = ?

**getAssetOptions:**
SELECT id, asset_code, asset_name, category_id, group_id, sub_group_id
FROM tbl_asset_master WHERE is_active = 1 AND asset_status = 'active'
Return asset's current classification so frontend can auto-fill old_ fields.

**getCategoryOptions:**
SELECT id, category_name AS name FROM tbl_asset_category_master WHERE is_active = 1

**getGroupOptions:**
SELECT id, group_name AS name, category_id FROM tbl_asset_group_master WHERE is_active = 1

**getSubGroupOptions:**
SELECT id, sub_group_name AS name, group_id FROM tbl_asset_sub_group_master WHERE is_active = 1

**create:**
1. Generate reclassify_no using generateDocNumber(pool, 'RECLASSIFY')
2. Insert with status = 'draft'
Return 201.

**approve(req, res, next):**
Body: { action } — 'approved' or 'rejected'
If approved:
  Transaction:
  1. Set status = 'approved'
  2. UPDATE tbl_asset_master SET category_id = new_category_id, group_id = new_group_id, sub_group_id = new_sub_group_id WHERE id = asset_id
If rejected:
  Set status = 'rejected' only.

**update:** Only if status = 'draft'. Update editable fields.

Routes:
```
GET    /                   → getAll
GET    /asset-options      → getAssetOptions
GET    /category-options   → getCategoryOptions
GET    /group-options      → getGroupOptions
GET    /sub-group-options  → getSubGroupOptions
GET    /:id                → getById
POST   /                   → create
PUT    /:id                → update
PATCH  /:id/approve        → approve
```
Mount at: /api/asset-reclassify

### Frontend files
```
frontend/src/pages/tasks/AssetReclassify.jsx
frontend/src/api/tasks/assetReclassifyApi.js
```

Page layout:
- Filter bar: status filter, search by asset code
- Table: Reclassify No | Asset | Date | Old Category | New Category | Status | Actions
- Actions: Edit (draft only), Approve (draft only), Reject (draft only)

Form — two sections:

Section 1 — Asset & Date:
- Asset select (required) — on selection auto-fill old_category_id, old_group_id, old_sub_group_id
- Reclassify Date (date, required)
- Reason (textarea)

Section 2 — Reclassification:
Left column — Old Classification (read-only, auto-filled from asset selection):
- Old Category (read-only text showing category name)
- Old Group (read-only text)
- Old Sub Group (read-only text)

Right column — New Classification:
- New Category (select, required) — on change filter new groups
- New Group (select, required) — filtered by new category
- New Sub Group (select, optional) — filtered by new group

Dependent dropdown behavior same as Asset Master session.

---

## Task 2 — Asset Sale/Disposal

Table: tbl_asset_sale_disposal
Columns:
id, disposal_no, disposal_date, asset_id, disposal_type (sale/scrap/donation/write_off),
book_value_at_disposal, sale_amount, gain_loss (generated column — do not insert),
buyer_name, buyer_contact, reason, status (draft/approved/completed),
approved_by, approved_at, created_by, created_at, updated_by, updated_at

### Backend files
```
backend/src/features/tasks/assetDisposal/
  assetDisposal.controller.js
  assetDisposal.routes.js
```

**getAll:** JOIN asset_master for code/name.

**getById:** Same with WHERE d.id = ?

**getAssetOptions:**
SELECT id, asset_code, asset_name, current_book_value
FROM tbl_asset_master WHERE is_active = 1 AND asset_status = 'active'
Return current_book_value to auto-fill book_value_at_disposal.

**create:**
1. Generate disposal_no using generateDocNumber(pool, 'DISPOSAL')
2. Insert. Do NOT insert gain_loss (it is a generated column).
3. Status = 'draft'
Return 201: { success: true, message: "Disposal entry created", disposal_no }

**approve(req, res, next):**
Body: { action } — 'approved', 'completed', or 'rejected' (use 'rejected' to map to no action — just update status)
If action = 'completed':
  Transaction:
  1. Set status = 'completed', approved_by = 'ADMIN', approved_at = NOW()
  2. UPDATE tbl_asset_master SET asset_status = disposal_type (map: sale/scrap/donation/write_off → 'disposed'/'scrapped'), is_active = 0 WHERE id = asset_id
  Use this mapping:
    sale → 'disposed'
    scrap → 'scrapped'
    donation → 'disposed'
    write_off → 'disposed'
If action = 'approved':
  Set status = 'approved' only.

**update:** Only if status = 'draft'.

Routes:
```
GET    /               → getAll
GET    /asset-options  → getAssetOptions
GET    /:id            → getById
POST   /               → create
PUT    /:id            → update
PATCH  /:id/approve    → approve
```
Mount at: /api/asset-disposal

### Frontend files
```
frontend/src/pages/tasks/AssetDisposal.jsx
frontend/src/api/tasks/assetDisposalApi.js
```

Table columns: Disposal No | Asset Code | Date | Type | Book Value | Sale Amount | Gain/Loss | Status | Actions

Form:
- Asset select (required) — on selection auto-fill book_value_at_disposal from current_book_value
- Disposal Date (date, required)
- Disposal Type (select: sale, scrap, donation, write_off, required)
- Book Value at Disposal (number, auto-filled, read-only)
- Sale Amount (number, 2 decimal, default 0) — only relevant for sale type
- Gain/Loss (calculated display = sale_amount - book_value_at_disposal, read-only, show in red if negative)
- Buyer Name (text) — show only if disposal_type = 'sale'
- Buyer Contact (text) — show only if disposal_type = 'sale'
- Reason (textarea)

Actions: Edit (draft), Approve (draft), Complete (approved), shown per status.

### Register both in backend/src/routes/index.js
```
/api/asset-reclassify
/api/asset-disposal
```

### Update App.jsx
- /tasks/asset-reclassify → AssetReclassify
- /tasks/asset-disposal → AssetDisposal

---

## Output rules
- Generate all files completely for both tasks
- gain_loss display in frontend is client-calculated from sale_amount - book_value_at_disposal
- Buyer fields visible only when disposal_type = 'sale'
- Confirm dialogs before approve/complete actions
- Do not rebuild previous session files
