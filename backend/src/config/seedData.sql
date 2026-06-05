-- ============================================================
-- DUMMY DATA FOR OXVasset VERIFICATION (REFACTORED)
-- ============================================================

-- 1. Division Master
INSERT IGNORE INTO tbl_asset_division_master (division_code, division_name, description, created_by) VALUES
(1, 'Information Technology', 'IT and software assets', 'ADMIN'),
(2, 'Logistics & Transport', 'Vehicles and shipping equipment', 'ADMIN'),
(3, 'Human Resources', 'Office equipment for HR', 'ADMIN');

-- 2. Asset Type Master
INSERT IGNORE INTO tbl_asset_type_master (type_code, type_prefix, type_name, fuel_distance, jobcard_control_type, trip_applicable_yn, created_by) VALUES
(1, 'HRD', 'Hardware', 0, 'Workshop(Movable)', 0, 'ADMIN'),
(2, 'VEH', 'Vehicle', 100, 'Workshop(Movable)', 1, 'ADMIN'),
(3, 'FUR', 'Furniture', 0, 'Workshop(Movable)', 0, 'ADMIN');

-- 3. Asset Sub Type Master
INSERT IGNORE INTO tbl_asset_sub_type_master (sub_type_code, sub_type_name, type_code, created_by) VALUES
(1, 'Laptop', 1, 'ADMIN'),
(2, 'Truck', 2, 'ADMIN'),
(3, 'Desk', 3, 'ADMIN');

-- 4. Asset Category Master
INSERT IGNORE INTO tbl_asset_category_master (category_code, category_name, created_by) VALUES
(1, 'Electronics', 'ADMIN'),
(2, 'Automobile', 'ADMIN'),
(3, 'Fixed Infrastructure', 'ADMIN');

-- 5. Asset Group Master
INSERT IGNORE INTO tbl_asset_group_master (group_code, group_name, category_code, created_by) VALUES
(1, 'Computers', 1, 'ADMIN'),
(2, 'Heavy Commercial', 2, 'ADMIN');

-- 6. Asset Sub Group Master
INSERT IGNORE INTO tbl_asset_sub_group_master (sub_group_code, sub_group_name, group_code, created_by) VALUES
(1, 'Dell Laptops', 1, 'ADMIN'),
(2, 'TATA Trucks', 2, 'ADMIN');

-- 7. Location Master
INSERT IGNORE INTO tbl_location_area_master (location_code, location_name, city, country, created_by) VALUES
(1, 'Main Warehouse', 'Dubai', 'UAE', 'ADMIN'),
(2, 'Branch Office', 'Sharjah', 'UAE', 'ADMIN');

-- 8. Common Doc Type
INSERT IGNORE INTO tbl_common_document_type (doc_type_code, doc_type_name, is_mandatory, created_by) VALUES
(1, 'Purchase Invoice', 1, 'ADMIN'),
(2, 'Warranty Card', 0, 'ADMIN');

-- 9. Expiry Document Type
INSERT IGNORE INTO tbl_expiry_document_type (expiry_doc_type_code, doc_type_name, alert_before_days, created_by) VALUES
(1, 'Vehicle Registration', 30, 'ADMIN'),
(2, 'Insurance Policy', 15, 'ADMIN');

-- 10. Asset Master
INSERT IGNORE INTO tbl_asset_master (asset_code, asset_name, division_code, type_code, category_code, group_code, location_code, purchase_date, purchase_cost, useful_life_years, current_book_value, asset_status, created_by) VALUES
('ASSET-001', 'Dell Latitude 5420', 1, 1, 1, 1, 1, '2023-01-15', 4500.00, 3, 3500.00, 'active', 'ADMIN'),
('ASSET-002', 'Tata Prima 3525', 2, 2, 2, 2, 1, '2022-06-10', 250000.00, 8, 180000.00, 'active', 'ADMIN'),
('ASSET-003', 'Executive Office Desk', 3, 3, 3, 1, 2, '2024-02-20', 1200.00, 5, 1200.00, 'wip', 'ADMIN');
