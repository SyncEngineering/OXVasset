import { body } from 'express-validator';

/**
 * Common validation rules
 */
export const commonRules = {
  description: body('description').optional().isString().withMessage('Description must be a string'),
  is_active: body('is_active').optional().isInt({ min: 0, max: 1 }).withMessage('is_active must be 0 or 1')
};

/**
 * Asset Category Validation
 */
export const assetCategoryRules = [
  body('category_name')
    .notEmpty().withMessage('Category name is required')
    .isLength({ max: 100 }).withMessage('Category name must be max 100 characters'),
  commonRules.description,
  commonRules.is_active
];

/**
 * Asset Division Validation
 */
export const assetDivisionRules = [
  body('division_name')
    .notEmpty().withMessage('Division name is required')
    .isLength({ max: 100 }).withMessage('Division name must be max 100 characters'),
  commonRules.description,
  commonRules.is_active
];

/**
 * Asset Type Validation
 */
export const assetTypeRules = [
  body('type_name')
    .notEmpty().withMessage('Type name is required')
    .isLength({ max: 100 }).withMessage('Type name must be max 100 characters'),
  body('type_prefix')
    .optional()
    .isLength({ max: 3 }).withMessage('Prefix must be max 3 characters'),
  body('fuel_distance')
    .optional()
    .isInt({ min: 0 }).withMessage('Fuel distance must be a positive integer'),
  body('jobcard_control_type')
    .optional()
    .isString(),
  body('doc_expiry_visible_yn')
    .optional()
    .isInt({ min: 0, max: 1 }),
  body('trailer_trip_calc_base_weight')
    .optional()
    .isDecimal(),
  body('trip_applicable_yn')
    .optional()
    .isInt({ min: 0, max: 1 }),
  body('asset_single_unit_yn')
    .optional()
    .isInt({ min: 0, max: 1 }),
  commonRules.description,
  commonRules.is_active
];

/**
 * Asset Sub Type Validation
 */
export const assetSubTypeRules = [
  body('sub_type_name')
    .notEmpty().withMessage('Sub type name is required')
    .isLength({ max: 100 }).withMessage('Sub type name must be max 100 characters'),
  body('type_code')
    .notEmpty().withMessage('Asset type is required')
    .isInt().withMessage('Asset type code must be an integer'),
  commonRules.description,
  commonRules.is_active
];

/**
 * Asset Group Validation
 */
export const assetGroupRules = [
  body('group_name')
    .notEmpty().withMessage('Group name is required')
    .isLength({ max: 100 }).withMessage('Group name must be max 100 characters'),
  body('category_code')
    .notEmpty().withMessage('Category is required')
    .isInt().withMessage('Category code must be an integer'),
  commonRules.description,
  commonRules.is_active
];

/**
 * Asset Sub Group Validation
 */
export const assetSubGroupRules = [
  body('sub_group_name')
    .notEmpty().withMessage('Sub group name is required')
    .isLength({ max: 100 }).withMessage('Sub group name must be max 100 characters'),
  body('group_code')
    .notEmpty().withMessage('Group is required')
    .isInt().withMessage('Group code must be an integer'),
  commonRules.description,
  commonRules.is_active
];

/**
 * Location Area Validation
 */
export const locationAreaRules = [
  body('location_name')
    .notEmpty().withMessage('Location name is required')
    .isLength({ max: 100 }).withMessage('Location name must be max 100 characters'),
  body('address').optional().isLength({ max: 255 }),
  body('city').optional().isLength({ max: 100 }),
  body('state').optional().isLength({ max: 100 }),
  body('country').optional().isLength({ max: 100 }),
  commonRules.is_active
];

/**
 * Common Doc Type Validation
 */
export const commonDocTypeRules = [
  body('doc_type_name')
    .notEmpty().withMessage('Document type name is required')
    .isLength({ max: 100 }).withMessage('Document type name must be max 100 characters'),
  body('is_mandatory').optional().isInt({ min: 0, max: 1 }),
  commonRules.description,
  commonRules.is_active
];

/**
 * Expiry Doc Type Validation
 */
export const expiryDocTypeRules = [
  body('doc_type_name')
    .notEmpty().withMessage('Document type name is required')
    .isLength({ max: 100 }).withMessage('Document type name must be max 100 characters'),
  body('alert_before_days').notEmpty().isInt({ min: 1 }).withMessage('Alert before days must be at least 1'),
  commonRules.description,
  commonRules.is_active
];

/**
 * Odometer Reset Validation
 */
export const odometerResetRules = [
  body('asset_id').notEmpty().isInt(),
  body('reset_date').notEmpty().isDate(),
  body('previous_reading').notEmpty().isDecimal(),
  body('new_reading').notEmpty().isDecimal(),
  body('reason').optional().isLength({ max: 255 })
];

/**
 * Asset Master Validation
 */
export const assetMasterRules = [
  body('asset_code').notEmpty().withMessage('Asset code is required').isLength({ max: 30 }),
  body('asset_name').notEmpty().withMessage('Asset name is required').isLength({ max: 150 }),
  body('division_code').notEmpty().withMessage('Division is required').isInt(),
  body('type_code').notEmpty().withMessage('Asset type is required').isInt(),
  body('category_code').notEmpty().withMessage('Category is required').isInt(),
  body('group_code').notEmpty().withMessage('Group is required').isInt(),
  body('purchase_date').optional().isDate().withMessage('Invalid purchase date'),
  body('purchase_cost').optional().isDecimal().withMessage('Purchase cost must be a number'),
  body('depreciation_method').optional().isIn(['straight_line', 'wdv', 'none']),
  body('useful_life_years').optional().isInt({ min: 0 }),
  body('is_active').optional().isInt({ min: 0, max: 1 })
];

/**
 * Asset Change WIP Validation
 */
export const assetChangeWipRules = [
  body('asset_id').notEmpty().withMessage('Asset is required').isInt(),
  body('change_date').notEmpty().withMessage('Change date is required').isDate(),
  body('change_type').notEmpty().withMessage('Change type is required'),
  body('cost_incurred').optional().isDecimal(),
  body('remarks').optional().isLength({ max: 500 })
];

/**
 * Depreciation Entry Validation
 */
export const depreciationEntryRules = [
  body('entry_date').notEmpty().withMessage('Entry date is required').isDate(),
  body('period_from').notEmpty().withMessage('Period from is required').isDate(),
  body('period_to').notEmpty().withMessage('Period to is required').isDate(),
  body('asset_id').notEmpty().withMessage('Asset is required').isInt(),
  body('opening_book_value').notEmpty().isDecimal(),
  body('depreciation_amount').notEmpty().isDecimal(),
  body('closing_book_value').notEmpty().isDecimal(),
  body('depreciation_method').notEmpty().isIn(['straight_line', 'wdv'])
];

/**
 * Asset Reclassify Validation
 */
export const assetReclassifyRules = [
  body('reclassify_date').notEmpty().withMessage('Reclassify date is required').isDate(),
  body('asset_id').notEmpty().withMessage('Asset is required').isInt(),
  body('old_category_code').notEmpty().isInt(),
  body('new_category_code').notEmpty().withMessage('New category is required').isInt(),
  body('reason').optional().isLength({ max: 500 })
];

/**
 * Asset Disposal Validation
 */
export const assetDisposalRules = [
  body('disposal_date').notEmpty().withMessage('Disposal date is required').isDate(),
  body('asset_id').notEmpty().withMessage('Asset is required').isInt(),
  body('disposal_type').notEmpty().isIn(['sale', 'scrap', 'donation', 'write_off']),
  body('book_value_at_disposal').notEmpty().isDecimal(),
  body('sale_amount').optional().isDecimal(),
  body('buyer_name').optional().isLength({ max: 150 }),
  body('reason').optional().isLength({ max: 500 })
];

/**
 * Asset Transfer Validation
 */
export const assetTransferRules = [
  body('transfer_date').notEmpty().withMessage('Transfer date is required').isDate(),
  body('asset_id').notEmpty().withMessage('Asset is required').isInt(),
  body('from_division_code').notEmpty().isInt(),
  body('to_division_code').notEmpty().withMessage('Target division is required').isInt(),
  body('reason').optional().isLength({ max: 500 })
];

/**
 * Branch Transfer Validation
 */
export const assetBranchTransferRules = [
  body('transfer_date').notEmpty().withMessage('Transfer date is required').isDate(),
  body('asset_id').notEmpty().withMessage('Asset is required').isInt(),
  body('from_branch').notEmpty().withMessage('From branch is required'),
  body('to_branch').notEmpty().withMessage('To branch is required'),
  body('reason').optional().isLength({ max: 500 })
];

/**
 * Expiry Doc Entry Validation
 */
export const expiryDocEntryRules = [
  body('asset_id').notEmpty().withMessage('Asset is required').isInt(),
  body('expiry_doc_type_code').notEmpty().withMessage('Document type is required').isInt(),
  body('expiry_date').notEmpty().withMessage('Expiry date is required').isDate(),
  body('document_no').optional().isLength({ max: 100 }),
  body('remarks').optional().isLength({ max: 500 })
];

/**
 * Company License Validation
 */
export const companyLicenseRules = [
  body('expiry_doc_type_code').notEmpty().withMessage('Document type is required').isInt(),
  body('document_name').notEmpty().withMessage('Document name is required').isLength({ max: 150 }),
  body('document_no').optional().isLength({ max: 100 }),
  body('expiry_date').optional().isDate(),
  body('alert_before_days').optional().isInt({ min: 0 })
];
