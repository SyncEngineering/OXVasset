-- ============================================================
-- DUMMY DATA FOR OXVasset VERIFICATION (REFACTORED)
-- ============================================================

-- 1. Division Master
INSERT IGNORE INTO tbl_asset_division_master (division_code, division_name, description, created_by) VALUES
(1, 'IT Cell — Headquarters', 'IT and software assets', 'ADMIN'),
(2, 'Operations — Southern Zone', 'Buses and transport equipment', 'ADMIN'),
(3, 'Administrative Wing', 'Office equipment for HR', 'ADMIN');

-- 2. Asset Type Master
INSERT IGNORE INTO tbl_asset_type_master (type_code, type_prefix, type_name, fuel_distance, jobcard_control_type, trip_applicable_yn, created_by) VALUES
(1, 'ETM', 'Ticket Machines', 0, 'Workshop(Movable)', 0, 'ADMIN'),
(2, 'BUS', 'Transport Bus', 100, 'Workshop(Movable)', 1, 'ADMIN'),
(3, 'FUR', 'Furniture', 0, 'Workshop(Movable)', 0, 'ADMIN');

-- 3. Asset Sub Type Master
INSERT IGNORE INTO tbl_asset_sub_type_master (sub_type_code, sub_type_name, type_code, created_by) VALUES
(1, 'Android ETM', 1, 'ADMIN'),
(2, 'Super Fast Bus', 2, 'ADMIN'),
(3, 'Depot Bench', 3, 'ADMIN');

-- 4. Asset Category Master
INSERT IGNORE INTO tbl_asset_category_master (category_code, category_name, created_by) VALUES
(1, 'Electronics', 'ADMIN'),
(2, 'Buses', 'ADMIN'),
(3, 'Fixed Infrastructure', 'ADMIN');

-- 5. Asset Group Master
INSERT IGNORE INTO tbl_asset_group_master (group_code, group_name, category_code, created_by) VALUES
(1, 'Computing Devices', 1, 'ADMIN'),
(2, 'Stage Carriages', 2, 'ADMIN');

-- 6. Asset Sub Group Master
INSERT IGNORE INTO tbl_asset_sub_group_master (sub_group_code, sub_group_name, group_code, created_by) VALUES
(1, 'Handheld Units', 1, 'ADMIN'),
(2, 'Ashok Leyland 12M', 2, 'ADMIN');

-- 7. Location Master
INSERT IGNORE INTO tbl_location_area_master (location_code, location_name, city, country, created_by) VALUES
(1, 'Trivandrum Central Depot', 'Trivandrum', 'India', 'ADMIN'),
(2, 'Kollam Depot', 'Kollam', 'India', 'ADMIN');

-- 8. Common Doc Type
INSERT IGNORE INTO tbl_common_document_type (doc_type_code, doc_type_name, is_mandatory, created_by) VALUES
(1, 'Purchase Invoice', 1, 'ADMIN'),
(2, 'Fitness Certificate', 1, 'ADMIN');

-- 9. Expiry Document Type
INSERT IGNORE INTO tbl_expiry_document_type (expiry_doc_type_code, doc_type_name, alert_before_days, created_by) VALUES
(1, 'Bus Permit / RC', 30, 'ADMIN'),
(2, 'Third Party Insurance', 15, 'ADMIN');

-- 10. Asset Master
INSERT IGNORE INTO tbl_asset_master (asset_code, asset_name, division_code, type_code, category_code, group_code, location_code, purchase_date, purchase_cost, useful_life_years, current_book_value, asset_status, created_by) VALUES
('BUS-742', 'Ashok Leyland — Fast Passenger', 2, 2, 2, 2, 1, '2023-01-15', 3500000.00, 10, 3200000.00, 'active', 'ADMIN'),
('ETM-102', 'Android Ticket Machine v2', 1, 1, 1, 1, 1, '2022-06-10', 15000.00, 3, 8000.00, 'active', 'ADMIN'),
('FUR-055', 'Depot Master Table', 3, 3, 3, 1, 2, '2024-02-20', 5000.00, 5, 5000.00, 'wip', 'ADMIN');

-- 11. Document Sequences
INSERT IGNORE INTO tbl_asset_doc_sequence (doc_type, prefix, last_sequence, fiscal_year) VALUES
('ASSET',               'AST',  0, '2025-26'),
('DEPRECIATION',        'DEP',  0, '2025-26'),
('RECLASSIFY',          'RCL',  0, '2025-26'),
('DISPOSAL',            'DIS',  0, '2025-26'),
('TRANSFER',            'TRF',  0, '2025-26'),
('BRANCH_TRANSFER',     'BTR',  0, '2025-26'),
('EXPIRY_DOC',          'EXP',  0, '2025-26'),
('COMPANY_LICENSE',     'LIC',  0, '2025-26');
