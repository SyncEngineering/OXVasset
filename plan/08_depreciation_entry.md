# Session 08 — Depreciation Entry

## Context
Stack: Node.js, Express, MySQL (mysql2/promise), React, plain CSS.
Sessions 1–7 are complete.
This session builds the Depreciation Entry task screen.
This is a financial entry with a post/reverse workflow. It must auto-generate the entry_no using the sequence utility.
Hardcode created_by and updated_by as "ADMIN".

---

## Table: tbl_depreciation_entry

Columns:
id, entry_no, entry_date, period_from, period_to, asset_id,
opening_book_value, depreciation_amount, closing_book_value,
depreciation_method (straight_line/wdv), status (draft/posted/reversed),
posted_by, posted_at, remarks, created_by, created_at, updated_by, updated_at

---

## Backend

### Files
```
backend/src/features/tasks/depreciationEntry/
  depreciationEntry.controller.js
  depreciationEntry.routes.js
```

### Controller exports

**getAll(req, res, next)**
```sql
SELECT d.*, a.asset_code, a.asset_name, a.depreciation_method AS asset_dep_method
FROM tbl_depreciation_entry d
JOIN tbl_asset_master a ON d.asset_id = a.id
ORDER BY d.id DESC
```

**getById(req, res, next)**
Same JOIN WHERE d.id = ?

**getAssetOptions(req, res, next)**
```sql
SELECT id, asset_code, asset_name, current_book_value, depreciation_method, depreciation_rate, useful_life_years
FROM tbl_asset_master
WHERE is_active = 1 AND asset_status = 'active'
ORDER BY asset_code
```
Return this full data so the frontend can auto-calculate depreciation.

**create(req, res, next)**
1. Generate entry_no using generateDocNumber(pool, 'DEPRECIATION') from sequenceGenerator.js
2. Insert record with status = 'draft', created_by = 'ADMIN'
3. Return 201: { success: true, message: "Entry created", id: insertId, entry_no }

**post(req, res, next)**
Only allowed if status = 'draft'.
Steps:
1. Fetch entry and check status
2. UPDATE tbl_depreciation_entry SET status = 'posted', posted_by = 'ADMIN', posted_at = NOW() WHERE id = ?
3. UPDATE tbl_asset_master SET
   accumulated_depreciation = accumulated_depreciation + [depreciation_amount],
   current_book_value = current_book_value - [depreciation_amount],
   updated_by = 'ADMIN'
   WHERE id = [asset_id]
4. Do both updates in a transaction
Return: { success: true, message: "Entry posted" }

**reverse(req, res, next)**
Only allowed if status = 'posted'.
Steps:
1. Fetch entry and check status
2. UPDATE status = 'reversed' on depreciation entry
3. Reverse the asset book value update:
   accumulated_depreciation = accumulated_depreciation - [depreciation_amount]
   current_book_value = current_book_value + [depreciation_amount]
4. Do both in a transaction
Return: { success: true, message: "Entry reversed" }

**update(req, res, next)**
Only allowed if status = 'draft'.
Update: entry_date, period_from, period_to, asset_id, opening_book_value, depreciation_amount, closing_book_value, depreciation_method, remarks
updated_by = 'ADMIN'

### Routes
```
GET    /               → getAll
GET    /asset-options  → getAssetOptions
GET    /:id            → getById
POST   /               → create
PUT    /:id            → update
PATCH  /:id/post       → post
PATCH  /:id/reverse    → reverse
```
Mount at: /api/depreciation-entries
Register in backend/src/routes/index.js.

---

## Frontend

### Files
```
frontend/src/pages/tasks/DepreciationEntry.jsx
frontend/src/api/tasks/depreciationEntryApi.js
```

API exports: getAll, getAssetOptions, create, update, post, reverse

### Page layout

**Title bar:** "Depreciation Entry"

**Filter bar:**
- Select: status (All, draft, posted, reversed)
- Date input: filter by entry_date (from)
- Date input: filter by entry_date (to)
- Clear button, Add New button

**Table columns:**
Entry No | Asset Code | Asset Name | Entry Date | Period From | Period To | Depreciation Amount | Closing Book Value | Method | Status | Actions

Actions:
- Edit — only if status = 'draft'
- Post — only if status = 'draft'
- Reverse — only if status = 'posted'

**Form — two sections:**

Section 1 — Entry Details:
- Asset (select, required) — label = asset_code + " — " + asset_name
- Entry Date (date, required)
- Period From (date, required)
- Period To (date, required)
- Depreciation Method (select: straight_line, wdv, required) — auto-filled from asset's depreciation_method when asset is selected, editable
- Remarks (textarea)

Section 2 — Calculation (auto-calculated when asset selected, all editable):
- Opening Book Value (number, 2 decimal places) — auto-filled from asset's current_book_value
- Depreciation Amount (number, 2 decimal places) — auto-calculated (see below)
- Closing Book Value (number, 2 decimal places) — auto-calculated as opening - depreciation

**Auto-calculation logic in React (on asset select):**
```
if depreciation_method === 'straight_line':
  annual = (purchase_cost - salvage_value) / useful_life_years
  depreciation_amount = annual / 12  // monthly
else if depreciation_method === 'wdv':
  depreciation_amount = current_book_value * (depreciation_rate / 100) / 12
```
Use current_book_value from asset options as opening_book_value.
closing_book_value = opening_book_value - depreciation_amount
All calculated values are pre-filled but remain editable by the user.

**State:**
records, assetOptions, formData, editId, showForm
statusFilter, dateFrom, dateTo, loading, error

**Behavior:**
- Confirm dialog before Post: "Post this depreciation entry? This will update the asset book value."
- Confirm dialog before Reverse: "Reverse this entry? The asset book value will be restored."

### Update App.jsx
- /tasks/depreciation-entry → DepreciationEntry

---

## Output rules
- Generate all files completely
- The post and reverse actions must use confirm dialog before calling API
- Auto-calculation is client-side only — server does not recalculate, it takes what is submitted
- Do not rebuild previous session files
