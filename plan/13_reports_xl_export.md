# Session 13 — Reports: XL Export (Fixed Asset Summary XL, Asset Transfer XL, Company License List)

## Context
Stack: Node.js, Express, MySQL (mysql2/promise), React, plain CSS.
Sessions 1–12 are complete.
This session builds 3 reports that export data as downloadable Excel files.
Backend uses the 'xlsx' npm package (SheetJS) to generate .xlsx files.
Frontend downloads the file via a blob response.
No new React page needed for each — add an Export to XL button on existing or new simple filter pages.

---

## Backend setup

Install in backend: npm install xlsx

Create a shared utility: backend/src/utils/xlsxExporter.js

```js
// xlsxExporter.js
import XLSX from 'xlsx';

/**
 * Generate and send an xlsx file as HTTP response
 * @param {object} res - Express response object
 * @param {Array} data - Array of plain objects (rows)
 * @param {Array} headers - Array of { key, label } defining column order and display names
 * @param {string} sheetName - Name of the Excel sheet
 * @param {string} fileName - Downloaded file name (without extension)
 */
export function sendXlsx(res, data, headers, sheetName, fileName) {
  // Map data to use label-keyed rows
  const rows = data.map(row => {
    const mapped = {};
    headers.forEach(h => {
      mapped[h.label] = row[h.key] !== undefined && row[h.key] !== null ? row[h.key] : '';
    });
    return mapped;
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Disposition', `attachment; filename="${fileName}.xlsx"`);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buffer);
}
```

---

## Report 1 — Fixed Asset Summary XL

### Backend
```
backend/src/features/reports/fixedAssetSummaryXL/
  fixedAssetSummaryXL.controller.js
  fixedAssetSummaryXL.routes.js
```

**exportXL(req, res, next)**
Query params: division_id, category_id, asset_status (all optional)

Run the same query as Fixed Asset List report (Session 12) — no date filter here.

Headers for XL:
```js
[
  { key: 'asset_code', label: 'Asset Code' },
  { key: 'asset_name', label: 'Asset Name' },
  { key: 'serial_number', label: 'Serial No' },
  { key: 'manufacturer', label: 'Manufacturer' },
  { key: 'division_name', label: 'Division' },
  { key: 'category_name', label: 'Category' },
  { key: 'type_name', label: 'Type' },
  { key: 'location_name', label: 'Location' },
  { key: 'purchase_date', label: 'Purchase Date' },
  { key: 'purchase_cost', label: 'Purchase Cost' },
  { key: 'salvage_value', label: 'Salvage Value' },
  { key: 'accumulated_depreciation', label: 'Accumulated Depreciation' },
  { key: 'current_book_value', label: 'Current Book Value' },
  { key: 'depreciation_method', label: 'Depreciation Method' },
  { key: 'asset_status', label: 'Status' }
]
```

Call sendXlsx(res, rows, headers, 'Fixed Assets', 'Fixed_Asset_Summary')

Route: GET / → exportXL
Mount at: /api/reports/fixed-asset-summary-xl

### Frontend
```
frontend/src/pages/reports/FixedAssetSummaryXL.jsx
frontend/src/api/reports/fixedAssetSummaryXLApi.js
```

API function exportXL(params):
```js
const response = await axiosInstance.get('/reports/fixed-asset-summary-xl', {
  params,
  responseType: 'blob'
});
const url = window.URL.createObjectURL(new Blob([response.data]));
const link = document.createElement('a');
link.href = url;
link.setAttribute('download', 'Fixed_Asset_Summary.xlsx');
document.body.appendChild(link);
link.click();
link.remove();
```

Page layout:
- Title: "Fixed Asset Summary — Export XL"
- Filter bar: Division (select), Category (select), Asset Status (select)
- One button: "Export to Excel" — calls exportXL with current filters, shows loading state while downloading
- Note below button: "All active assets matching the filters will be exported."

---

## Report 2 — Asset Transfer XL

### Backend
```
backend/src/features/reports/assetTransferXL/
  assetTransferXL.controller.js
  assetTransferXL.routes.js
```

**exportXL(req, res, next)**
Query params: from_date, to_date (transfer_date range), status (optional)

```sql
SELECT
  t.transfer_no, t.transfer_date, t.status,
  a.asset_code, a.asset_name,
  fd.division_name AS from_division,
  td.division_name AS to_division,
  fl.location_name AS from_location,
  tl.location_name AS to_location,
  t.reason, t.approved_by, t.approved_at
FROM tbl_asset_transfer t
JOIN tbl_asset_master a ON t.asset_id = a.id
LEFT JOIN tbl_asset_division_master fd ON t.from_division_id = fd.id
LEFT JOIN tbl_asset_division_master td ON t.to_division_id = td.id
LEFT JOIN tbl_location_area_master fl ON t.from_location_id = fl.id
LEFT JOIN tbl_location_area_master tl ON t.to_location_id = tl.id
WHERE 1=1
  [AND t.transfer_date >= ? if from_date]
  [AND t.transfer_date <= ? if to_date]
  [AND t.status = ? if status]
ORDER BY t.transfer_date DESC
```

Headers:
```js
[
  { key: 'transfer_no', label: 'Transfer No' },
  { key: 'transfer_date', label: 'Transfer Date' },
  { key: 'asset_code', label: 'Asset Code' },
  { key: 'asset_name', label: 'Asset Name' },
  { key: 'from_division', label: 'From Division' },
  { key: 'to_division', label: 'To Division' },
  { key: 'from_location', label: 'From Location' },
  { key: 'to_location', label: 'To Location' },
  { key: 'status', label: 'Status' },
  { key: 'reason', label: 'Reason' },
  { key: 'approved_by', label: 'Approved By' },
  { key: 'approved_at', label: 'Approved At' }
]
```

Route: GET / → exportXL
Mount at: /api/reports/asset-transfer-xl

### Frontend
```
frontend/src/pages/reports/AssetTransferXL.jsx
frontend/src/api/reports/assetTransferXLApi.js
```

Filter bar: Date From, Date To, Status (select), Export to Excel button.

---

## Report 3 — Company License Documents List

### Backend
```
backend/src/features/reports/companyLicenseList/
  companyLicenseList.controller.js
  companyLicenseList.routes.js
```

This report has two endpoints: one for screen view, one for XL export.

**getReport(req, res, next)**
Query params: doc_type_id, is_active, expiry_status (expired/upcoming/all)
upcoming = expiry_date between today and today + alert_before_days

```sql
SELECT cl.*, dt.doc_type_name,
  DATEDIFF(cl.expiry_date, CURDATE()) AS days_to_expiry
FROM tbl_company_license_documents cl
JOIN tbl_common_document_type dt ON cl.doc_type_id = dt.id
WHERE 1=1
  [AND cl.doc_type_id = ? if provided]
  [AND cl.is_active = ? if provided]
  [AND DATEDIFF(cl.expiry_date, CURDATE()) < 0 if expiry_status = 'expired']
  [AND DATEDIFF(cl.expiry_date, CURDATE()) BETWEEN 0 AND cl.alert_before_days if expiry_status = 'upcoming']
ORDER BY cl.expiry_date ASC
```

Return: { success: true, data: rows }

**exportXL(req, res, next)**
Same query, call sendXlsx with headers:
```js
[
  { key: 'entry_no', label: 'Entry No' },
  { key: 'doc_type_name', label: 'Document Type' },
  { key: 'document_name', label: 'Document Name' },
  { key: 'document_no', label: 'Document No' },
  { key: 'issue_date', label: 'Issue Date' },
  { key: 'expiry_date', label: 'Expiry Date' },
  { key: 'issuing_authority', label: 'Issuing Authority' },
  { key: 'alert_before_days', label: 'Alert Before (Days)' },
  { key: 'days_to_expiry', label: 'Days to Expiry' },
  { key: 'remarks', label: 'Remarks' }
]
```

Routes:
```
GET /        → getReport
GET /export  → exportXL
```
Mount at: /api/reports/company-license-list

### Frontend
```
frontend/src/pages/reports/CompanyLicenseList.jsx
frontend/src/api/reports/companyLicenseListApi.js
```

API exports: getReport(params), exportXL(params)

Filter bar: Doc Type (select), Active/Inactive toggle, Expiry Status (All/Expired/Upcoming), Search, Clear, Export to Excel, Print

Table columns:
Entry No | Doc Type | Document Name | Document No | Issue Date | Expiry Date | Alert Days | Days to Expiry | Active | Actions (View file link if file_path exists)

Days to Expiry coloring: negative = red, 0–30 = orange, >30 = green.

---

### Register in backend/src/routes/index.js
```
/api/reports/fixed-asset-summary-xl
/api/reports/asset-transfer-xl
/api/reports/company-license-list
```

### Update App.jsx
- /reports/fixed-asset-summary-xl → FixedAssetSummaryXL
- /reports/asset-transfer-xl → AssetTransferXL
- /reports/company-license-list → CompanyLicenseList

---

## Output rules
- Generate all files completely
- xlsx package must be imported as: import XLSX from 'xlsx'
- Blob download pattern must be used exactly as shown
- Do not rebuild previous session files
