# Session 12 — Reports: Fixed Asset List, Asset Summary, Management Report

## Context
Stack: Node.js, Express, MySQL (mysql2/promise), React, plain CSS.
Sessions 1–11 are complete.
This session builds 3 report screens. Reports are read-only — no create/update/delete.
All reports support filter parameters passed as query strings.
All reports have a Print button that triggers window.print() on the report table.

---

## Report 1 — Fixed Asset List

Purpose: Full list of all assets with their classification and current values.

### Backend
```
backend/src/features/reports/fixedAssetList/
  fixedAssetList.controller.js
  fixedAssetList.routes.js
```

**getReport(req, res, next)**
Query params: division_id, category_id, asset_status, from_date (purchase_date), to_date (purchase_date)
All params optional.

```sql
SELECT
  a.asset_code, a.asset_name, a.serial_number, a.manufacturer,
  a.purchase_date, a.purchase_cost, a.salvage_value,
  a.accumulated_depreciation, a.current_book_value,
  a.depreciation_method, a.asset_status,
  d.division_name, t.type_name, c.category_name,
  g.group_name, l.location_name
FROM tbl_asset_master a
LEFT JOIN tbl_asset_division_master d ON a.division_id = d.id
LEFT JOIN tbl_asset_type_master t ON a.asset_type_id = t.id
LEFT JOIN tbl_asset_category_master c ON a.category_id = c.id
LEFT JOIN tbl_asset_group_master g ON a.group_id = g.id
LEFT JOIN tbl_location_area_master l ON a.location_id = l.id
WHERE a.is_active = 1
  [AND a.division_id = ? if provided]
  [AND a.category_id = ? if provided]
  [AND a.asset_status = ? if provided]
  [AND a.purchase_date >= ? if from_date provided]
  [AND a.purchase_date <= ? if to_date provided]
ORDER BY a.asset_code
```

Build the WHERE clause dynamically using an array of conditions and params.

Also return summary totals:
```js
{
  total_assets: rows.length,
  total_purchase_cost: sum of purchase_cost,
  total_accumulated_depreciation: sum of accumulated_depreciation,
  total_current_book_value: sum of current_book_value
}
```

Return: { success: true, data: rows, summary: {...} }

Routes: GET / → getReport
Mount at: /api/reports/fixed-asset-list

### Frontend
```
frontend/src/pages/reports/FixedAssetList.jsx
frontend/src/api/reports/fixedAssetListApi.js
```

Filter bar:
- Division (select, load from /api/asset-divisions)
- Category (select, load from /api/asset-categories)
- Asset Status (select: All, active, disposed, transferred, wip, scrapped)
- Purchase Date From (date)
- Purchase Date To (date)
- Search button, Clear button, Print button

Summary bar (shown after data loads):
- Total Assets | Total Purchase Cost | Total Accumulated Depreciation | Total Book Value
- Display as 4 info boxes in a row, Finacle style (plain bordered boxes)

Table columns:
Asset Code | Asset Name | Division | Category | Type | Location | Purchase Date | Purchase Cost | Accum. Depreciation | Book Value | Status

Print CSS: add a style block in component with @media print that hides the filter bar and buttons, shows only the table.

---

## Report 2 — Asset Summary Included Depreciation

Purpose: Asset-wise depreciation summary — how much depreciation has been posted per asset.

### Backend
```
backend/src/features/reports/assetSummaryDepreciation/
  assetSummaryDepreciation.controller.js
  assetSummaryDepreciation.routes.js
```

**getReport(req, res, next)**
Query params: asset_id (optional), from_date, to_date (entry_date range), status (draft/posted/reversed/all)

```sql
SELECT
  a.asset_code, a.asset_name, a.purchase_cost, a.current_book_value,
  COUNT(d.id) AS total_entries,
  SUM(CASE WHEN d.status = 'posted' THEN d.depreciation_amount ELSE 0 END) AS total_posted_depreciation,
  SUM(CASE WHEN d.status = 'reversed' THEN d.depreciation_amount ELSE 0 END) AS total_reversed,
  MIN(d.period_from) AS earliest_period,
  MAX(d.period_to) AS latest_period
FROM tbl_asset_master a
LEFT JOIN tbl_depreciation_entry d ON a.id = d.asset_id
  [AND d.entry_date >= from_date if provided]
  [AND d.entry_date <= to_date if provided]
  [AND d.status = ? if status != 'all']
WHERE a.is_active = 1
  [AND a.id = ? if asset_id provided]
GROUP BY a.id, a.asset_code, a.asset_name, a.purchase_cost, a.current_book_value
ORDER BY a.asset_code
```

Return: { success: true, data: rows }

Routes: GET / → getReport
Mount at: /api/reports/asset-summary-depreciation

### Frontend
```
frontend/src/pages/reports/AssetSummaryDepreciation.jsx
frontend/src/api/reports/assetSummaryApi.js
```

Filter bar: Asset (select, optional), Date From, Date To, Status filter, Search, Clear, Print

Table columns:
Asset Code | Asset Name | Purchase Cost | Current Book Value | Total Entries | Posted Depreciation | Reversed | Earliest Period | Latest Period

---

## Report 3 — Asset Management Report

Purpose: Cross-module management view — assets with their transfer history count, disposal status, and document expiry count.

### Backend
```
backend/src/features/reports/assetManagement/
  assetManagement.controller.js
  assetManagement.routes.js
```

**getReport(req, res, next)**
Query params: division_id, asset_status, category_id

```sql
SELECT
  a.asset_code, a.asset_name, a.asset_status,
  a.purchase_cost, a.current_book_value,
  d.division_name, c.category_name,
  (SELECT COUNT(*) FROM tbl_asset_transfer t WHERE t.asset_id = a.id) AS transfer_count,
  (SELECT COUNT(*) FROM tbl_asset_branch_transfer bt WHERE bt.asset_id = a.id) AS branch_transfer_count,
  (SELECT COUNT(*) FROM tbl_asset_change_wip w WHERE w.asset_id = a.id) AS wip_count,
  (SELECT COUNT(*) FROM tbl_expiry_document_entry e WHERE e.asset_id = a.id AND e.expiry_date >= CURDATE()) AS active_docs,
  (SELECT COUNT(*) FROM tbl_expiry_document_entry e WHERE e.asset_id = a.id AND e.expiry_date < CURDATE()) AS expired_docs
FROM tbl_asset_master a
LEFT JOIN tbl_asset_division_master d ON a.division_id = d.id
LEFT JOIN tbl_asset_category_master c ON a.category_id = c.id
WHERE a.is_active = 1
  [AND a.division_id = ? if provided]
  [AND a.asset_status = ? if provided]
  [AND a.category_id = ? if provided]
ORDER BY a.asset_code
```

Return: { success: true, data: rows }

Routes: GET / → getReport
Mount at: /api/reports/asset-management

### Frontend
```
frontend/src/pages/reports/AssetManagement.jsx
frontend/src/api/reports/assetManagementApi.js
```

Filter bar: Division, Category, Asset Status, Search, Clear, Print

Table columns:
Asset Code | Asset Name | Division | Category | Status | Purchase Cost | Book Value | Transfers | Branch Transfers | WIP Entries | Active Docs | Expired Docs

Expired Docs column: show in red if > 0.

---

### Register all 3 in backend/src/routes/index.js
```
/api/reports/fixed-asset-list
/api/reports/asset-summary-depreciation
/api/reports/asset-management
```

### Update App.jsx
- /reports/fixed-asset-list → FixedAssetList
- /reports/asset-summary → AssetSummaryDepreciation
- /reports/asset-management → AssetManagement

---

## Output rules
- Generate all files completely for all 3 reports
- Reports are read-only — no forms, no mutations
- All filter dropdowns load their options from existing API endpoints (use axiosInstance)
- Print button calls window.print() — no PDF generation
- Do not rebuild previous session files
