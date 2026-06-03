# Session 01 — Project Scaffold & Base Setup

## Context
You are building a full-stack ERP module called ASSETS from scratch.
Stack: Node.js, Express, MySQL, React (no TypeScript, no component library, plain CSS).
Design style: old Finacle banking ERP — functional, tabular, minimal, no gradients or rounded cards.
This is session 1 of 14. Do not build any feature screens yet. Only scaffold the project.

---

## Backend — generate exactly this folder structure

```
backend/
  src/
    config/
      db.js
    middleware/
      errorHandler.js
      validateRequest.js
    routes/
      index.js
    app.js
  .env.example
  package.json
  server.js
```

### backend/package.json
Dependencies: express, mysql2, dotenv, cors, express-validator, multer
Dev dependencies: nodemon
Start script: node server.js
Dev script: nodemon server.js

### backend/.env.example
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=oxive_assets
```

### backend/src/config/db.js
- Use mysql2/promise
- createPool using process.env values
- Export the pool
- On pool creation log "Database connected"

### backend/src/app.js
- Express app
- cors middleware
- express.json()
- express.urlencoded({ extended: true })
- Mount all routes from src/routes/index.js under /api
- Mount errorHandler as last middleware
- Export app

### backend/server.js
- Import app, dotenv
- Listen on PORT from env
- Log "Server running on port X"

### backend/src/middleware/errorHandler.js
- Express error handler (4 args)
- Log error stack to console
- Return JSON: { success: false, message: error.message }
- Default status 500, use err.status if present

### backend/src/middleware/validateRequest.js
- Import validationResult from express-validator
- If errors, return 400 JSON: { success: false, errors: array }
- Otherwise call next()

### backend/src/routes/index.js
- Empty router for now
- Export router
- Add a comment: // import and mount feature routes here as they are built

---

## Frontend — generate exactly this folder structure

```
frontend/
  public/
    index.html
  src/
    api/
      axiosInstance.js
    components/
      Layout/
        Sidebar.jsx
        Header.jsx
        Layout.jsx
      common/
        Table.jsx
        FormField.jsx
        Modal.jsx
        Pagination.jsx
        StatusBadge.jsx
    pages/
      Dashboard.jsx
    styles/
      global.css
      layout.css
      form.css
      table.css
    App.jsx
    main.jsx
  package.json
  vite.config.js
```

### frontend/package.json
Dependencies: react, react-dom, react-router-dom, axios
Dev dependencies: vite, @vitejs/plugin-react
Scripts: dev, build, preview

### frontend/vite.config.js
- React plugin
- Server proxy: /api → http://localhost:5000

### frontend/src/api/axiosInstance.js
- Base URL: /api
- Default headers: Content-Type application/json
- Response interceptor: on error, throw error.response.data or the error itself

### frontend/src/styles/global.css
Finacle-style design rules:
- Font: Arial, sans-serif, 13px base
- Background: #f0f0f0 for body
- No box shadows, no border-radius beyond 2px
- Links: #00008B, no underline by default
- Tables: full width, 1px solid #ccc borders, #e8e8e8 header background
- Input/select height: 24px, font-size 12px, border 1px solid #999
- Button primary: background #003399, color white, font-size 12px, padding 3px 10px
- Button secondary: background #888, color white
- Button danger: background #cc0000, color white
- Form labels: font-size 12px, font-weight bold, color #333

### frontend/src/styles/layout.css
- Header: height 36px, background #003399, color white, display flex, align-items center, padding 0 10px
- Sidebar: width 220px, background #1a1a2e, color #ccc, font-size 12px, overflow-y auto
- Sidebar active item: background #003399, color white
- Main content: flex 1, padding 10px, overflow-y auto

### frontend/src/styles/form.css
- .form-container: background white, padding 10px, border 1px solid #ccc
- .form-section-title: background #003399, color white, padding 4px 8px, font-size 12px, font-weight bold, margin-bottom 8px
- .form-row: display flex, gap 16px, margin-bottom 6px, flex-wrap wrap
- .form-group: display flex, flex-direction column, min-width 180px
- .required-star: color red

### frontend/src/styles/table.css
- .data-table: width 100%, border-collapse collapse, font-size 12px
- .data-table th: background #003399, color white, padding 4px 8px, text-align left
- .data-table td: padding 3px 8px, border-bottom 1px solid #ddd
- .data-table tr:nth-child(even): background #f5f5f5
- .data-table tr:hover: background #dce6f5
- Action links in table: font-size 11px, color #003399, margin-right 6px, cursor pointer

### frontend/src/components/common/FormField.jsx
Props: label, name, type (text/select/date/number/textarea), value, onChange, required, options (for select), disabled, error
Render a .form-group div with label (append * if required) and the appropriate input element.
Show error string below input in red 11px if present.

### frontend/src/components/common/Table.jsx
Props: columns (array of {key, label, width}), data (array), actions (array of {label, onClick, className})
Render .data-table with thead and tbody.
Actions column appended at end if actions prop provided.
Show "No records found." row if data is empty.

### frontend/src/components/common/Pagination.jsx
Props: currentPage, totalPages, onPageChange
Show: First, Prev, page X of Y, Next, Last buttons.
Disable First/Prev on page 1, Next/Last on last page.

### frontend/src/components/common/Modal.jsx
Props: title, isOpen, onClose, children, width (default 500px)
Simple overlay + centered white box modal.
Title bar background #003399 color white.
Close button top right.

### frontend/src/components/common/StatusBadge.jsx
Props: status
Map status strings to colors:
- active/approved/completed/posted: green background
- draft/pending: orange background
- rejected/disposed/scrapped: red background
- transferred/wip: blue background
Font size 11px, padding 2px 6px, color white.

### frontend/src/components/Layout/Header.jsx
Props: title
Show header bar with "OXIVE ERP — ASSETS MODULE" on left, title prop on right.
Logout button on far right (no functionality yet, just button).

### frontend/src/components/Layout/Sidebar.jsx
Hardcode the ASSETS module menu for now.
Groups: Masters, Tasks, Reports
Each group is collapsible (toggle on click).
Items inside each group are react-router-dom Link components.
Masters items: Asset Division, Asset Type, Asset Category, Asset Group, Asset Sub Group, Asset Sub Type, Location, Common Doc Type, Expiry Doc Type, Odometer Reset, Asset Change WIP, Asset Master
Tasks items: Depreciation Entry, Asset Reclassify, Asset Sale/Disposal, Asset Transfer, Branch Transfer, Expiry Document Entry, Company License Documents
Reports items: Fixed Asset List, Asset Summary, Management Report, Fixed Asset XL, Asset Transfer XL, Company License List, Asset Barcode, Expiry Document List

### frontend/src/components/Layout/Layout.jsx
Compose Header + Sidebar + main content area (children).
Import layout.css, global.css.

### frontend/src/pages/Dashboard.jsx
Simple placeholder: show "ASSETS MODULE — Dashboard" heading and a table with 4 placeholder stat rows (Total Assets, Active Assets, Assets Due for Depreciation, Expiring Documents).

### frontend/src/App.jsx
- Import Layout
- Set up react-router-dom BrowserRouter with Routes
- Default route "/" renders Dashboard
- Add placeholder routes for every sidebar item pointing to a placeholder div for now
- Import global.css

### frontend/src/main.jsx
Standard Vite React entry point.

---

## Output rules
- Generate every file listed above completely, no placeholders or TODOs inside file content
- Do not add extra files beyond what is listed
- Do not install or run any commands
- Comment every function briefly
- Use ES module syntax throughout (import/export)
