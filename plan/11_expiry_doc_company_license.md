# Session 11 — Expiry Document Entry & Company License Documents

## Context
Stack: Node.js, Express, MySQL (mysql2/promise), React, plain CSS.
Sessions 1–10 are complete.
This session builds two document management task screens.
Both use auto-generated document numbers and support file upload (store path only, no actual file serving needed).
Hardcode created_by and updated_by as "ADMIN".

---

## Task 1 — Expiry Document Entry

Table: tbl_expiry_document_entry
Columns:
id, entry_no, asset_id, doc_type_id, document_no,
issue_date, expiry_date, issuing_authority, file_path,
alert_sent, remarks, is_active,
created_by, created_at, updated_by, updated_at

### Backend files
```
backend/src/features/tasks/expiryDocEntry/
  expiryDocEntry.controller.js
  expiryDocEntry.routes.js
```

**getAll:**
```sql
SELECT e.*,
  a.asset_code, a.asset_name,
  dt.doc_type_name, dt.alert_before_days
FROM tbl_expiry_document_entry e
JOIN tbl_asset_master a ON e.asset_id = a.id
JOIN tbl_expiry_document_type dt ON e.doc_type_id = dt.id
ORDER BY e.expiry_date ASC
```
Order by expiry_date ascending so soonest expiry appears first.

**getById:** Same with WHERE e.id = ?

**getAssetOptions:**
SELECT id, asset_code, asset_name FROM tbl_asset_master WHERE is_active = 1

**getDocTypeOptions:**
SELECT id, doc_type_name AS name, alert_before_days FROM tbl_expiry_document_type WHERE is_active = 1

**create:**
1. Generate entry_no using generateDocNumber(pool, 'EXPIRY_DOC')
2. Handle file upload: if req.file exists, store req.file.path as file_path, else null
3. Insert with is_active = 1
Return 201: { success: true, message: "Document entry created", entry_no }

**update:**
Update editable fields. If new file uploaded, update file_path.
updated_by = 'ADMIN'

**toggleActive:** Flip is_active.

File upload: use multer. Configure storage to uploads/expiry-docs/ directory. Accept pdf, jpg, png only. Max 5MB.
Export the multer middleware as upload from the controller file.

Routes:
```
GET    /               → getAll
GET    /asset-options  → getAssetOptions
GET    /doc-options    → getDocTypeOptions
GET    /:id            → getById
POST   /               → upload.single('document'), create
PUT    /:id            → upload.single('document'), update
PATCH  /:id/toggle-active → toggleActive
```
Mount at: /api/expiry-doc-entries

### Frontend files
```
frontend/src/pages/tasks/ExpiryDocEntry.jsx
frontend/src/api/tasks/expiryDocEntryApi.js
```

API exports: getAll, getAssetOptions, getDocTypeOptions, create, update, toggleActive
For create and update use FormData (multipart) when a file is attached.

Table columns:
Entry No | Asset Code | Doc Type | Document No | Issue Date | Expiry Date | Issuing Authority | Status | Expiry Alert | Active | Actions

Expiry Alert column: calculate days remaining from today to expiry_date.
- If <= 0: show "EXPIRED" in red
- If <= alert_before_days: show "Due in X days" in orange
- Otherwise: show "OK" in green

Form:
- Asset (select, required)
- Document Type (select, required) — on select show alert_before_days as info text
- Document No (text)
- Issue Date (date)
- Expiry Date (date, required)
- Issuing Authority (text)
- Document File (file input — accept .pdf, .jpg, .png) — show current file_path as text if editing
- Remarks (textarea)

---

## Task 2 — Company License Documents

Table: tbl_company_license_documents
Columns:
id, entry_no, doc_type_id, document_no, document_name,
issue_date, expiry_date, issuing_authority, file_path,
alert_before_days, alert_sent, remarks, is_active,
created_by, created_at, updated_by, updated_at

Note: This table is NOT linked to assets. It stores company-level license documents.

### Backend files
```
backend/src/features/tasks/companyLicense/
  companyLicense.controller.js
  companyLicense.routes.js
```

**getAll:**
```sql
SELECT cl.*, dt.doc_type_name
FROM tbl_company_license_documents cl
JOIN tbl_common_document_type dt ON cl.doc_type_id = dt.id
ORDER BY cl.expiry_date ASC
```

**getById:** Same with WHERE cl.id = ?

**getDocTypeOptions:**
SELECT id, doc_type_name AS name FROM tbl_common_document_type WHERE is_active = 1

**create:**
1. Generate entry_no using generateDocNumber(pool, 'COMPANY_LICENSE')
2. Handle file upload: store path if file present
3. Insert with is_active = 1
Return 201.

**update:** Update editable fields, handle new file.

**toggleActive:** Flip is_active.

File upload: same multer config, store in uploads/company-licenses/.

Routes:
```
GET    /               → getAll
GET    /doc-options    → getDocTypeOptions
GET    /:id            → getById
POST   /               → upload.single('document'), create
PUT    /:id            → upload.single('document'), update
PATCH  /:id/toggle-active → toggleActive
```
Mount at: /api/company-licenses

### Frontend files
```
frontend/src/pages/tasks/CompanyLicense.jsx
frontend/src/api/tasks/companyLicenseApi.js
```

Table columns:
Entry No | Doc Type | Document Name | Document No | Issue Date | Expiry Date | Alert Before (Days) | Expiry Alert | Active | Actions

Same Expiry Alert color logic as Expiry Doc Entry.

Form:
- Document Type (select, required)
- Document Name (text, required)
- Document No (text)
- Issue Date (date)
- Expiry Date (date)
- Issuing Authority (text)
- Alert Before Days (number, default 30)
- Document File (file input)
- Remarks (textarea)

---

### Register both in backend/src/routes/index.js
Also add static file serving in app.js:
```js
import path from 'path';
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
```

```
/api/expiry-doc-entries
/api/company-licenses
```

### Update App.jsx
- /tasks/expiry-doc-entry → ExpiryDocEntry
- /tasks/company-license → CompanyLicense

---

## Output rules
- Generate all files completely for both tasks
- Expiry alert calculation is client-side in the table render
- File input shows existing file_path as plain text link when in edit mode
- Do not rebuild previous session files
- multer config can be a shared file at backend/src/config/multerConfig.js used by both controllers
