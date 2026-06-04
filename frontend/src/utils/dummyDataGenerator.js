/**
 * Utility to generate dummy data for OXVasset forms.
 * Used for rapid testing and demonstration.
 */

const getRandomInt = (max) => Math.floor(Math.random() * max);
const getRandomDate = (start, end) => {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
};

export const getDummyData = (formName) => {
  const now = new Date();
  const nextMonth = new Date();
  nextMonth.setMonth(now.getMonth() + 1);

  switch (formName) {
    case 'AssetCategory':
      return {
        category_code: `CAT-${getRandomInt(9999)}`,
        category_name: `Dummy Category ${getRandomInt(100)}`,
        description: 'Auto-generated dummy data for testing',
        is_active: 1
      };

    case 'AssetDivision':
      return {
        division_code: `DIV-${getRandomInt(9999)}`,
        division_name: `Dummy Division ${getRandomInt(100)}`,
        description: 'Auto-generated dummy data for testing',
        is_active: 1
      };

    case 'AssetGroup':
      return {
        group_code: `GRP-${getRandomInt(9999)}`,
        group_name: `Dummy Group ${getRandomInt(100)}`,
        category_id: 1, // Assumes CAT001 exists
        description: 'Auto-generated dummy data for testing',
        is_active: 1
      };

    case 'AssetSubGroup':
      return {
        sub_group_code: `SGRP-${getRandomInt(9999)}`,
        sub_group_name: `Dummy Sub-Group ${getRandomInt(100)}`,
        group_id: 1, // Assumes GRP001 exists
        description: 'Auto-generated dummy data for testing',
        is_active: 1
      };

    case 'AssetType':
      return {
        type_code: `TYP-${getRandomInt(9999)}`,
        type_name: `Dummy Type ${getRandomInt(100)}`,
        description: 'Auto-generated dummy data for testing',
        is_active: 1
      };

    case 'AssetSubType':
      return {
        sub_type_code: `SUB-${getRandomInt(9999)}`,
        sub_type_name: `Dummy Sub-Type ${getRandomInt(100)}`,
        asset_type_id: 1, // Assumes TYP001 exists
        description: 'Auto-generated dummy data for testing',
        is_active: 1
      };

    case 'LocationArea':
      return {
        location_code: `LOC-${getRandomInt(9999)}`,
        location_name: `Dummy Location ${getRandomInt(100)}`,
        address: '123 Test Street, Dummy Area',
        city: 'Dubai',
        state: 'Dubai',
        country: 'UAE',
        is_active: 1
      };

    case 'CommonDocType':
      return {
        doc_type_code: `DOC-${getRandomInt(9999)}`,
        doc_type_name: `Dummy Doc Type ${getRandomInt(100)}`,
        description: 'Auto-generated dummy data for testing',
        is_mandatory: 0,
        is_active: 1
      };

    case 'ExpiryDocType':
      return {
        doc_type_code: `EXP-${getRandomInt(9999)}`,
        doc_type_name: `Dummy Expiry Doc Type ${getRandomInt(100)}`,
        description: 'Auto-generated dummy data for testing',
        alert_before_days: 30,
        is_active: 1
      };

    case 'AssetMaster':
      return {
        asset_code: `AST-${getRandomInt(99999)}`,
        asset_name: `Dummy Asset ${getRandomInt(1000)}`,
        description: 'Auto-generated dummy data for testing',
        division_id: 1,
        asset_type_id: 1,
        asset_sub_type_id: 1,
        category_id: 1,
        group_id: 1,
        sub_group_id: 1,
        location_id: 1,
        purchase_date: getRandomDate(new Date(2020, 0, 1), new Date()),
        purchase_cost: (Math.random() * 10000).toFixed(2),
        useful_life_years: 5,
        depreciation_method: 'straight_line',
        asset_status: 'active'
      };

    case 'OdometerReset':
      return {
        asset_id: 2, // Assumes Asset 2 is a vehicle
        reset_date: getRandomDate(new Date(2024, 0, 1), new Date()),
        previous_reading: 50000.00,
        new_reading: 0.00,
        reason: 'Engine swap test'
      };

    case 'AssetChangeWip':
      return {
        asset_id: 1,
        change_date: getRandomDate(new Date(2024, 0, 1), new Date()),
        change_type: 'Component Upgrade',
        old_value: 'Standard',
        new_value: 'Premium',
        cost_incurred: 500.00,
        remarks: 'Dummy entry for testing'
      };

    case 'AssetDisposal':
      return {
        disposal_date: getRandomDate(new Date(2024, 0, 1), new Date()),
        asset_id: 3,
        disposal_type: 'scrap',
        book_value_at_disposal: 1000.00,
        sale_amount: 50.00,
        reason: 'Broken beyond repair'
      };

    case 'AssetReclassify':
      return {
        reclassify_date: getRandomDate(new Date(2024, 0, 1), new Date()),
        asset_id: 1,
        old_category_id: 1,
        new_category_id: 2,
        old_group_id: 1,
        new_group_id: 2,
        reason: 'Change in business use'
      };

    case 'AssetTransfer':
      return {
        transfer_date: getRandomDate(new Date(2024, 0, 1), new Date()),
        asset_id: 1,
        from_division_id: 1,
        to_division_id: 2,
        from_location_id: 1,
        to_location_id: 2,
        reason: 'Departmental move'
      };

    case 'BranchTransfer':
      return {
        transfer_date: getRandomDate(new Date(2024, 0, 1), new Date()),
        asset_id: 1,
        from_branch: 'Main Branch',
        to_branch: 'Satellite Office',
        from_location_id: 1,
        to_location_id: 2,
        reason: 'Regional reallocation'
      };

    case 'CompanyLicense':
      return {
        doc_type_id: 1,
        document_no: `LIC-${getRandomInt(99999)}`,
        document_name: 'Business Trade License',
        issue_date: getRandomDate(new Date(2023, 0, 1), new Date()),
        expiry_date: getRandomDate(new Date(), new Date(2026, 0, 1)),
        issuing_authority: 'DED',
        alert_before_days: 30,
        remarks: 'Dummy entry'
      };

    case 'DepreciationEntry':
      return {
        entry_date: getRandomDate(new Date(2024, 0, 1), new Date()),
        period_from: '2024-01-01',
        period_to: '2024-12-31',
        asset_id: 1,
        opening_book_value: 5000.00,
        depreciation_amount: 500.00,
        closing_book_value: 4500.00,
        depreciation_method: 'straight_line',
        remarks: 'Annual depreciation test'
      };

    case 'ExpiryDocEntry':
      return {
        asset_id: 2,
        doc_type_id: 1,
        document_no: `DOC-${getRandomInt(99999)}`,
        issue_date: getRandomDate(new Date(2023, 0, 1), new Date()),
        expiry_date: getRandomDate(new Date(), new Date(2026, 0, 1)),
        issuing_authority: 'RTA',
        remarks: 'Vehicle registration dummy'
      };

    default:
      return {};
  }
};
