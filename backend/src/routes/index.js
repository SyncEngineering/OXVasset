import { Router } from 'express';
import assetDivisionRoutes from '../features/masters/assetDivision/assetDivision.routes.js';
import assetTypeRoutes from '../features/masters/assetType/assetType.routes.js';
import assetCategoryRoutes from '../features/masters/assetCategory/assetCategory.routes.js';
import locationAreaRoutes from '../features/masters/locationArea/locationArea.routes.js';
import commonDocTypeRoutes from '../features/masters/commonDocType/commonDocType.routes.js';

import assetSubTypeRoutes from '../features/masters/assetSubType/assetSubType.routes.js';
import assetGroupRoutes from '../features/masters/assetGroup/assetGroup.routes.js';
import assetSubGroupRoutes from '../features/masters/assetSubGroup/assetSubGroup.routes.js';
import expiryDocTypeRoutes from '../features/masters/expiryDocType/expiryDocType.routes.js';
import odometerResetRoutes from '../features/masters/odometerReset/odometerReset.routes.js';
import assetMasterRoutes from '../features/masters/assetMaster/assetMaster.routes.js';

import assetChangeWipRoutes from '../features/tasks/assetChangeWip/assetChangeWip.routes.js';
import depreciationEntryRoutes from '../features/tasks/depreciationEntry/depreciationEntry.routes.js';
import assetReclassifyRoutes from '../features/tasks/assetReclassify/assetReclassify.routes.js';
import assetDisposalRoutes from '../features/tasks/assetDisposal/assetDisposal.routes.js';
import assetTransferRoutes from '../features/tasks/assetTransfer/assetTransfer.routes.js';
import branchTransferRoutes from '../features/tasks/branchTransfer/branchTransfer.routes.js';
import expiryDocEntryRoutes from '../features/tasks/expiryDocEntry/expiryDocEntry.routes.js';
import companyLicenseRoutes from '../features/tasks/companyLicense/companyLicense.routes.js';

import fixedAssetListRoutes from '../features/reports/fixedAssetList/fixedAssetList.routes.js';
import assetSummaryDepreciationRoutes from '../features/reports/assetSummaryDepreciation/assetSummaryDepreciation.routes.js';
import assetManagementRoutes from '../features/reports/assetManagement/assetManagement.routes.js';
import fixedAssetSummaryXLRoutes from '../features/reports/fixedAssetSummaryXL/fixedAssetSummaryXL.routes.js';
import assetTransferXLRoutes from '../features/reports/assetTransferXL/assetTransferXL.routes.js';
import companyLicenseListRoutes from '../features/reports/companyLicenseList/companyLicenseList.routes.js';
import assetBarcodeRoutes from '../features/reports/assetBarcode/assetBarcode.routes.js';
import expiryDocumentListRoutes from '../features/reports/expiryDocumentList/expiryDocumentList.routes.js';
import dashboardRoutes from '../features/dashboard/dashboard.routes.js';

const router = Router();

// Health check
router.get('/health', (req, res) => res.json({ success: true, message: 'API is reachable' }));

// Dashboard
router.use('/dashboard', dashboardRoutes);

// Masters
router.use('/asset-divisions', assetDivisionRoutes);
router.use('/asset-types', assetTypeRoutes);
router.use('/asset-categories', assetCategoryRoutes);
router.use('/locations', locationAreaRoutes);
router.use('/common-doc-types', commonDocTypeRoutes);
router.use('/asset-sub-types', assetSubTypeRoutes);
router.use('/asset-groups', assetGroupRoutes);
router.use('/asset-sub-groups', assetSubGroupRoutes);
router.use('/expiry-doc-types', expiryDocTypeRoutes);
router.use('/odometer-resets', odometerResetRoutes);
router.use('/assets', assetMasterRoutes);

// Tasks
router.use('/asset-change-wip', assetChangeWipRoutes);
router.use('/depreciation-entries', depreciationEntryRoutes);
router.use('/asset-reclassify', assetReclassifyRoutes);
router.use('/asset-disposal', assetDisposalRoutes);
router.use('/asset-transfers', assetTransferRoutes);
router.use('/branch-transfers', branchTransferRoutes);
router.use('/expiry-doc-entries', expiryDocEntryRoutes);
router.use('/company-licenses', companyLicenseRoutes);

// Reports
router.use('/reports/fixed-asset-list', fixedAssetListRoutes);
router.use('/reports/asset-summary-depreciation', assetSummaryDepreciationRoutes);
router.use('/reports/asset-management', assetManagementRoutes);
router.use('/reports/fixed-asset-summary-xl', fixedAssetSummaryXLRoutes);
router.use('/reports/asset-transfer-xl', assetTransferXLRoutes);
router.use('/reports/company-license-list', companyLicenseListRoutes);
router.use('/reports/asset-barcode', assetBarcodeRoutes);
router.use('/reports/expiry-document-list', expiryDocumentListRoutes);

export default router;
