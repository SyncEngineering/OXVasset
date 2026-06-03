-- ============================================================
-- OXIVE ERP — ASSETS MODULE SCHEMA
-- Engine: MySQL 8.0+
-- Convention: snake_case, tbl_ prefix, soft deletes via is_active
-- Standalone: no foreign keys to other modules
-- ============================================================

-- ------------------------------------------------------------
-- MASTERS
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS tbl_asset_division_master (
    id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    division_code       VARCHAR(20)     NOT NULL UNIQUE,
    division_name       VARCHAR(100)    NOT NULL,
    description         VARCHAR(255),
    is_active           TINYINT(1)      NOT NULL DEFAULT 1,
    created_by          VARCHAR(50)     NOT NULL,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by          VARCHAR(50),
    updated_at          DATETIME        ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tbl_asset_type_master (
    id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    type_code           VARCHAR(20)     NOT NULL UNIQUE,
    type_name           VARCHAR(100)    NOT NULL,
    description         VARCHAR(255),
    is_active           TINYINT(1)      NOT NULL DEFAULT 1,
    created_by          VARCHAR(50)     NOT NULL,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by          VARCHAR(50),
    updated_at          DATETIME        ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tbl_asset_sub_type_master (
    id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sub_type_code       VARCHAR(20)     NOT NULL UNIQUE,
    sub_type_name       VARCHAR(100)    NOT NULL,
    asset_type_id       INT UNSIGNED    NOT NULL,
    description         VARCHAR(255),
    is_active           TINYINT(1)      NOT NULL DEFAULT 1,
    created_by          VARCHAR(50)     NOT NULL,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by          VARCHAR(50),
    updated_at          DATETIME        ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tbl_asset_category_master (
    id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_code       VARCHAR(20)     NOT NULL UNIQUE,
    category_name       VARCHAR(100)    NOT NULL,
    description         VARCHAR(255),
    is_active           TINYINT(1)      NOT NULL DEFAULT 1,
    created_by          VARCHAR(50)     NOT NULL,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by          VARCHAR(50),
    updated_at          DATETIME        ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tbl_asset_group_master (
    id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    group_code          VARCHAR(20)     NOT NULL UNIQUE,
    group_name          VARCHAR(100)    NOT NULL,
    category_id         INT UNSIGNED    NOT NULL,
    description         VARCHAR(255),
    is_active           TINYINT(1)      NOT NULL DEFAULT 1,
    created_by          VARCHAR(50)     NOT NULL,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by          VARCHAR(50),
    updated_at          DATETIME        ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tbl_asset_sub_group_master (
    id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sub_group_code      VARCHAR(20)     NOT NULL UNIQUE,
    sub_group_name      VARCHAR(100)    NOT NULL,
    group_id            INT UNSIGNED    NOT NULL,
    description         VARCHAR(255),
    is_active           TINYINT(1)      NOT NULL DEFAULT 1,
    created_by          VARCHAR(50)     NOT NULL,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by          VARCHAR(50),
    updated_at          DATETIME        ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tbl_location_area_master (
    id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    location_code       VARCHAR(20)     NOT NULL UNIQUE,
    location_name       VARCHAR(100)    NOT NULL,
    address             VARCHAR(255),
    city                VARCHAR(100),
    state               VARCHAR(100),
    country             VARCHAR(100),
    is_active           TINYINT(1)      NOT NULL DEFAULT 1,
    created_by          VARCHAR(50)     NOT NULL,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by          VARCHAR(50),
    updated_at          DATETIME        ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tbl_common_document_type (
    id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    doc_type_code       VARCHAR(20)     NOT NULL UNIQUE,
    doc_type_name       VARCHAR(100)    NOT NULL,
    description         VARCHAR(255),
    is_mandatory        TINYINT(1)      NOT NULL DEFAULT 0,
    is_active           TINYINT(1)      NOT NULL DEFAULT 1,
    created_by          VARCHAR(50)     NOT NULL,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by          VARCHAR(50),
    updated_at          DATETIME        ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tbl_expiry_document_type (
    id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    doc_type_code       VARCHAR(20)     NOT NULL UNIQUE,
    doc_type_name       VARCHAR(100)    NOT NULL,
    description         VARCHAR(255),
    alert_before_days   INT             NOT NULL DEFAULT 30,
    is_active           TINYINT(1)      NOT NULL DEFAULT 1,
    created_by          VARCHAR(50)     NOT NULL,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by          VARCHAR(50),
    updated_at          DATETIME        ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tbl_asset_master (
    id                      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    asset_code              VARCHAR(30)     NOT NULL UNIQUE,
    asset_name              VARCHAR(150)    NOT NULL,
    description             VARCHAR(500),
    division_id             INT UNSIGNED    NOT NULL,
    asset_type_id           INT UNSIGNED    NOT NULL,
    asset_sub_type_id       INT UNSIGNED,
    category_id             INT UNSIGNED    NOT NULL,
    group_id                INT UNSIGNED    NOT NULL,
    sub_group_id            INT UNSIGNED,
    location_id             INT UNSIGNED,
    serial_number           VARCHAR(100),
    model_number            VARCHAR(100),
    manufacturer            VARCHAR(150),
    purchase_date           DATE,
    purchase_cost           DECIMAL(15,2),
    salvage_value           DECIMAL(15,2)   DEFAULT 0,
    useful_life_years       INT,
    depreciation_method     ENUM('straight_line', 'wdv', 'none') NOT NULL DEFAULT 'straight_line',
    depreciation_rate       DECIMAL(5,2),
    accumulated_depreciation DECIMAL(15,2)  DEFAULT 0,
    current_book_value      DECIMAL(15,2),
    barcode                 VARCHAR(100),
    qr_code                 VARCHAR(255),
    asset_status            ENUM('active','disposed','transferred','wip','scrapped') NOT NULL DEFAULT 'active',
    is_active               TINYINT(1)      NOT NULL DEFAULT 1,
    remarks                 VARCHAR(500),
    created_by              VARCHAR(50)     NOT NULL,
    created_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(50),
    updated_at              DATETIME        ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tbl_vehicle_odometer_reset (
    id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    asset_id            INT UNSIGNED    NOT NULL,
    reset_date          DATE            NOT NULL,
    previous_reading    DECIMAL(10,2)   NOT NULL,
    new_reading         DECIMAL(10,2)   NOT NULL,
    reason              VARCHAR(255),
    created_by          VARCHAR(50)     NOT NULL,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tbl_asset_change_wip (
    id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    asset_id            INT UNSIGNED    NOT NULL,
    change_date         DATE            NOT NULL,
    change_type         VARCHAR(100)    NOT NULL,
    old_value           VARCHAR(255),
    new_value           VARCHAR(255),
    cost_incurred       DECIMAL(15,2)   DEFAULT 0,
    status              ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
    approved_by         VARCHAR(50),
    approved_at         DATETIME,
    remarks             VARCHAR(500),
    created_by          VARCHAR(50)     NOT NULL,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by          VARCHAR(50),
    updated_at          DATETIME        ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tbl_depreciation_entry (
    id                      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    entry_no                VARCHAR(30)     NOT NULL UNIQUE,
    entry_date              DATE            NOT NULL,
    period_from             DATE            NOT NULL,
    period_to               DATE            NOT NULL,
    asset_id                INT UNSIGNED    NOT NULL,
    opening_book_value      DECIMAL(15,2)   NOT NULL,
    depreciation_amount     DECIMAL(15,2)   NOT NULL,
    closing_book_value      DECIMAL(15,2)   NOT NULL,
    depreciation_method     ENUM('straight_line', 'wdv') NOT NULL,
    status                  ENUM('draft','posted','reversed') NOT NULL DEFAULT 'draft',
    posted_by               VARCHAR(50),
    posted_at               DATETIME,
    remarks                 VARCHAR(500),
    created_by              VARCHAR(50)     NOT NULL,
    created_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(50),
    updated_at              DATETIME        ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tbl_asset_reclassify (
    id                      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    reclassify_no           VARCHAR(30)     NOT NULL UNIQUE,
    reclassify_date         DATE            NOT NULL,
    asset_id                INT UNSIGNED    NOT NULL,
    old_category_id         INT UNSIGNED    NOT NULL,
    new_category_id         INT UNSIGNED    NOT NULL,
    old_group_id            INT UNSIGNED,
    new_group_id            INT UNSIGNED,
    old_sub_group_id        INT UNSIGNED,
    new_sub_group_id        INT UNSIGNED,
    reason                  VARCHAR(500),
    status                  ENUM('draft','approved','rejected') NOT NULL DEFAULT 'draft',
    approved_by             VARCHAR(50),
    approved_at             DATETIME,
    created_by              VARCHAR(50)     NOT NULL,
    created_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(50),
    updated_at              DATETIME        ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tbl_asset_sale_disposal (
    id                      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    disposal_no             VARCHAR(30)     NOT NULL UNIQUE,
    disposal_date           DATE            NOT NULL,
    asset_id                INT UNSIGNED    NOT NULL,
    disposal_type           ENUM('sale','scrap','donation','write_off') NOT NULL,
    book_value_at_disposal  DECIMAL(15,2)   NOT NULL,
    sale_amount             DECIMAL(15,2)   DEFAULT 0,
    gain_loss               DECIMAL(15,2)   GENERATED ALWAYS AS (sale_amount - book_value_at_disposal) STORED,
    buyer_name              VARCHAR(150),
    buyer_contact           VARCHAR(100),
    reason                  VARCHAR(500),
    status                  ENUM('draft','approved','completed') NOT NULL DEFAULT 'draft',
    approved_by             VARCHAR(50),
    approved_at             DATETIME,
    created_by              VARCHAR(50)     NOT NULL,
    created_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(50),
    updated_at              DATETIME        ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tbl_asset_transfer (
    id                      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    transfer_no             VARCHAR(30)     NOT NULL UNIQUE,
    transfer_date           DATE            NOT NULL,
    asset_id                INT UNSIGNED    NOT NULL,
    from_division_id        INT UNSIGNED    NOT NULL,
    to_division_id          INT UNSIGNED    NOT NULL,
    from_location_id        INT UNSIGNED,
    to_location_id          INT UNSIGNED,
    reason                  VARCHAR(500),
    status                  ENUM('draft','approved','completed','rejected') NOT NULL DEFAULT 'draft',
    approved_by             VARCHAR(50),
    approved_at             DATETIME,
    created_by              VARCHAR(50)     NOT NULL,
    created_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(50),
    updated_at              DATETIME        ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tbl_asset_branch_transfer (
    id                      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    branch_transfer_no      VARCHAR(30)     NOT NULL UNIQUE,
    transfer_date           DATE            NOT NULL,
    asset_id                INT UNSIGNED    NOT NULL,
    from_branch             VARCHAR(100)    NOT NULL,
    to_branch               VARCHAR(100)    NOT NULL,
    from_location_id        INT UNSIGNED,
    to_location_id          INT UNSIGNED,
    reason                  VARCHAR(500),
    status                  ENUM('draft','approved','completed','rejected') NOT NULL DEFAULT 'draft',
    approved_by             VARCHAR(50),
    approved_at             DATETIME,
    created_by              VARCHAR(50)     NOT NULL,
    created_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(50),
    updated_at              DATETIME        ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tbl_expiry_document_entry (
    id                      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    entry_no                VARCHAR(30)     NOT NULL UNIQUE,
    asset_id                INT UNSIGNED    NOT NULL,
    doc_type_id             INT UNSIGNED    NOT NULL,
    document_no             VARCHAR(100),
    issue_date              DATE,
    expiry_date             DATE            NOT NULL,
    issuing_authority       VARCHAR(150),
    file_path               VARCHAR(500),
    alert_sent              TINYINT(1)      NOT NULL DEFAULT 0,
    remarks                 VARCHAR(500),
    is_active               TINYINT(1)      NOT NULL DEFAULT 1,
    created_by              VARCHAR(50)     NOT NULL,
    created_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(50),
    updated_at              DATETIME        ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tbl_company_license_documents (
    id                      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    entry_no                VARCHAR(30)     NOT NULL UNIQUE,
    doc_type_id             INT UNSIGNED    NOT NULL,
    document_no             VARCHAR(100),
    document_name           VARCHAR(150)    NOT NULL,
    issue_date              DATE,
    expiry_date             DATE,
    issuing_authority       VARCHAR(150),
    file_path               VARCHAR(500),
    alert_before_days       INT             DEFAULT 30,
    alert_sent              TINYINT(1)      NOT NULL DEFAULT 0,
    remarks                 VARCHAR(500),
    is_active               TINYINT(1)      NOT NULL DEFAULT 1,
    created_by              VARCHAR(50)     NOT NULL,
    created_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by              VARCHAR(50),
    updated_at              DATETIME        ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tbl_asset_doc_sequence (
    id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    doc_type            VARCHAR(50)     NOT NULL UNIQUE,
    prefix              VARCHAR(10)     NOT NULL,
    last_sequence       INT UNSIGNED    NOT NULL DEFAULT 0,
    fiscal_year         VARCHAR(10),
    updated_at          DATETIME        ON UPDATE CURRENT_TIMESTAMP
);

INSERT IGNORE INTO tbl_asset_doc_sequence (doc_type, prefix, last_sequence, fiscal_year) VALUES
('DEPRECIATION',        'DEP',  0, '2025-26'),
('RECLASSIFY',          'RCL',  0, '2025-26'),
('DISPOSAL',            'DIS',  0, '2025-26'),
('TRANSFER',            'TRF',  0, '2025-26'),
('BRANCH_TRANSFER',     'BTR',  0, '2025-26'),
('EXPIRY_DOC',          'EXP',  0, '2025-26'),
('COMPANY_LICENSE',     'LIC',  0, '2025-26');

CREATE INDEX idx_asset_master_division    ON tbl_asset_master (division_id);
CREATE INDEX idx_asset_master_category    ON tbl_asset_master (category_id);
CREATE INDEX idx_asset_master_status      ON tbl_asset_master (asset_status);
CREATE INDEX idx_asset_master_location    ON tbl_asset_master (location_id);
CREATE INDEX idx_depreciation_asset       ON tbl_depreciation_entry (asset_id);
CREATE INDEX idx_depreciation_period      ON tbl_depreciation_entry (period_from, period_to);
CREATE INDEX idx_transfer_asset           ON tbl_asset_transfer (asset_id);
CREATE INDEX idx_expiry_doc_expiry_date   ON tbl_expiry_document_entry (expiry_date);
CREATE INDEX idx_company_license_expiry   ON tbl_company_license_documents (expiry_date);
