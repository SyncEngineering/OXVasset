-- ============================================================
-- DUMMY DATA FOR OXVasset VERIFICATION
-- ============================================================

-- 1. Division Master
INSERT IGNORE INTO tbl_asset_division_master (division_code, division_name, description, created_by) VALUES
('DIV001', 'Information Technology', 'IT and software assets', 'ADMIN'),
('DIV002', 'Logistics & Transport', 'Vehicles and shipping equipment', 'ADMIN'),
('DIV003', 'Human Resources', 'Office equipment for HR', 'ADMIN');

-- 2. Asset Type Master
INSERT IGNORE INTO tbl_asset_type_master (type_code, type_name, description, created_by) VALUES
('TYP001', 'Hardware', 'Computing hardware', 'ADMIN'),
('TYP002', 'Vehicle', 'Heavy and light vehicles', 'ADMIN'),
('TYP003', 'Furniture', 'Office furniture', 'ADMIN');

-- 3. Asset Sub Type Master (linked to Type)
INSERT IGNORE INTO tbl_asset_sub_type_master (sub_type_code, sub_type_name, asset_type_id, description, created_by) VALUES
('SUB001', 'Laptop', 1, 'Portable computers', 'ADMIN'),
('SUB002', 'Truck', 2, 'Heavy-duty transport', 'ADMIN'),
('SUB003', 'Desk', 3, 'Work desks', 'ADMIN');

-- 4. Asset Category Master
INSERT IGNORE INTO tbl_asset_category_master (category_code, category_name, description, created_by) VALUES
('CAT001', 'Electronics', 'Electronic devices', 'ADMIN'),
('CAT002', 'Automobile', 'Motorized vehicles', 'ADMIN'),
('CAT003', 'Fixed Infrastructure', 'Static installations', 'ADMIN');

-- 5. Asset Group Master (linked to Category)
INSERT IGNORE INTO tbl_asset_group_master (group_code, group_name, category_id, description, created_by) VALUES
('GRP001', 'Computers', 1, 'Standard computing units', 'ADMIN'),
('GRP002', 'Heavy Commercial', 2, 'Logistic trucks', 'ADMIN');

-- 6. Asset Sub Group Master (linked to Group)
INSERT IGNORE INTO tbl_asset_sub_group_master (sub_group_code, sub_group_name, group_id, description, created_by) VALUES
('SGRP01', 'Dell Laptops', 1, 'Dell brand units', 'ADMIN'),
('SGRP02', 'TATA Trucks', 2, 'Tata heavy vehicles', 'ADMIN');

-- 7. Location Master
INSERT IGNORE INTO tbl_location_area_master (location_code, location_name, address, city, state, country, created_by) VALUES
('LOC001', 'Main Warehouse', 'Street 101, Industrial Area', 'Dubai', 'Dubai', 'UAE', 'ADMIN'),
('LOC002', 'Branch Office', 'Tower B, 15th Floor', 'Sharjah', 'Sharjah', 'UAE', 'ADMIN');

-- 8. Common Doc Type
INSERT IGNORE INTO tbl_common_document_type (doc_type_code, doc_type_name, description, is_mandatory, created_by) VALUES
('DOC001', 'Purchase Invoice', 'Original vendor invoice', 1, 'ADMIN'),
('DOC002', 'Warranty Card', 'Manufacturer warranty', 0, 'ADMIN');

-- 9. Expiry Document Type
INSERT IGNORE INTO tbl_expiry_document_type (doc_type_code, doc_type_name, description, alert_before_days, created_by) VALUES
('EXP001', 'Vehicle Registration', 'Mulkia renewal', 30, 'ADMIN'),
('EXP002', 'Insurance Policy', 'Comprehensive insurance', 15, 'ADMIN');

-- 10. Asset Master
INSERT IGNORE INTO tbl_asset_master (asset_code, asset_name, division_id, asset_type_id, category_id, group_id, location_id, purchase_date, purchase_cost, useful_life_years, current_book_value, asset_status, created_by) VALUES
('ASSET-001', 'Dell Latitude 5420', 1, 1, 1, 1, 1, '2023-01-15', 4500.00, 3, 3500.00, 'active', 'ADMIN'),
('ASSET-002', 'Tata Prima 3525', 2, 2, 2, 2, 1, '2022-06-10', 250000.00, 8, 180000.00, 'active', 'ADMIN'),
('ASSET-003', 'Executive Office Desk', 3, 3, 3, 1, 2, '2024-02-20', 1200.00, 5, 1200.00, 'wip', 'ADMIN');

-- 11. Odometer Reset
INSERT IGNORE INTO tbl_vehicle_odometer_reset (asset_id, reset_date, previous_reading, new_reading, reason, created_by) VALUES
(2, '2024-05-01', 45000.00, 0.00, 'Engine overhaul', 'ADMIN');

-- 12. Asset Change WIP
INSERT IGNORE INTO tbl_asset_change_wip (asset_id, change_date, change_type, old_value, new_value, cost_incurred, status, created_by) VALUES
(1, '2024-06-01', 'RAM Upgrade', '8GB', '16GB', 400.00, 'pending', 'ADMIN');

-- 13. Expiry Document Entry
INSERT IGNORE INTO tbl_expiry_document_entry (entry_no, asset_id, doc_type_id, document_no, expiry_date, created_by) VALUES
('EXP/00001', 2, 1, 'REG-123456', '2025-12-31', 'ADMIN'),
('EXP/00002', 2, 2, 'INS-998877', '2024-07-01', 'ADMIN'); -- Soon to expire or expired depending on today'

-- 14. Company License
INSERT IGNORE INTO tbl_company_license_documents (entry_no, doc_type_id, document_name, expiry_date, created_by) VALUES
('LIC/00001', 1, 'Trade License', '2026-01-01', 'ADMIN');

-- 15. Depreciation Entry
INSERT IGNORE INTO tbl_depreciation_entry (entry_no, entry_date, period_from, period_to, asset_id, opening_book_value, depreciation_amount, closing_book_value, depreciation_method, status, created_by) VALUES
('DEP/00001', '2024-05-31', '2024-05-01', '2024-05-31', 1, 4500.00, 125.00, 4375.00, 'straight_line', 'posted', 'ADMIN'),
('DEP/00002', '2024-05-31', '2024-05-01', '2024-05-31', 2, 250000.00, 2604.17, 247395.83, 'straight_line', 'posted', 'ADMIN');

-- 16. Asset Reclassify
INSERT IGNORE INTO tbl_asset_reclassify (reclassify_no, reclassify_date, asset_id, old_category_id, new_category_id, reason, status, created_by) VALUES
('RCL/00001', '2024-06-01', 1, 1, 1, 'Correcting classification for sub-group', 'approved', 'ADMIN');

-- 17. Asset Sale/Disposal
INSERT IGNORE INTO tbl_asset_sale_disposal (disposal_no, disposal_date, asset_id, disposal_type, book_value_at_disposal, sale_amount, status, created_by) VALUES
('DIS/00001', '2024-06-10', 3, 'scrap', 1200.00, 100.00, 'draft', 'ADMIN');

-- 18. Asset Transfer (Division)
INSERT IGNORE INTO tbl_asset_transfer (transfer_no, transfer_date, asset_id, from_division_id, to_division_id, reason, status, created_by) VALUES
('TRF/00001', '2024-06-05', 1, 1, 3, 'Project completion transfer', 'approved', 'ADMIN');

-- 19. Asset Branch Transfer
INSERT IGNORE INTO tbl_asset_branch_transfer (branch_transfer_no, transfer_date, asset_id, from_branch, to_branch, reason, status, created_by) VALUES
('BTR/00001', '2024-06-08', 2, 'Main Branch', 'Industrial Area Branch', 'Site requirement', 'pending', 'ADMIN');
