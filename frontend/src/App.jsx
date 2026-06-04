import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';

// Masters
import AssetDivisionMaster from './pages/masters/AssetDivisionMaster.jsx';
import AssetTypeMaster from './pages/masters/AssetTypeMaster.jsx';
import AssetCategoryMaster from './pages/masters/AssetCategoryMaster.jsx';
import AssetGroupMaster from './pages/masters/AssetGroupMaster.jsx';
import AssetSubGroupMaster from './pages/masters/AssetSubGroupMaster.jsx';
import AssetSubTypeMaster from './pages/masters/AssetSubTypeMaster.jsx';
import LocationAreaMaster from './pages/masters/LocationAreaMaster.jsx';
import CommonDocTypeMaster from './pages/masters/CommonDocTypeMaster.jsx';
import ExpiryDocTypeMaster from './pages/masters/ExpiryDocTypeMaster.jsx';
import OdometerResetMaster from './pages/masters/OdometerResetMaster.jsx';
import AssetMaster from './pages/masters/AssetMaster.jsx';

// Tasks
import AssetChangeWip from './pages/tasks/AssetChangeWip.jsx';
import DepreciationEntry from './pages/tasks/DepreciationEntry.jsx';
import AssetReclassify from './pages/tasks/AssetReclassify.jsx';
import AssetDisposal from './pages/tasks/AssetDisposal.jsx';
import AssetTransfer from './pages/tasks/AssetTransfer.jsx';
import BranchTransfer from './pages/tasks/BranchTransfer.jsx';
import ExpiryDocEntry from './pages/tasks/ExpiryDocEntry.jsx';
import CompanyLicense from './pages/tasks/CompanyLicense.jsx';

// Reports
import FixedAssetList from './pages/reports/FixedAssetList.jsx';
import AssetSummaryDepreciation from './pages/reports/AssetSummaryDepreciation.jsx';
import AssetManagement from './pages/reports/AssetManagement.jsx';
import FixedAssetSummaryXL from './pages/reports/FixedAssetSummaryXL.jsx';
import AssetTransferXL from './pages/reports/AssetTransferXL.jsx';
import CompanyLicenseList from './pages/reports/CompanyLicenseList.jsx';
import AssetBarcode from './pages/reports/AssetBarcode.jsx';
import ExpiryDocumentList from './pages/reports/ExpiryDocumentList.jsx';

import './styles/global.css';

/**
 * Main App component with routing configuration.
 */
const App = () => {
  return (
    <BrowserRouter>
      <Layout title="Dashboard">
        <Routes>
          <Route path="/" element={<Dashboard />} />

          {/* Masters */}
          <Route path="/masters/division" element={<AssetDivisionMaster />} />
          <Route path="/masters/type" element={<AssetTypeMaster />} />
          <Route path="/masters/category" element={<AssetCategoryMaster />} />
          <Route path="/masters/group" element={<AssetGroupMaster />} />
          <Route path="/masters/sub-group" element={<AssetSubGroupMaster />} />
          <Route path="/masters/sub-type" element={<AssetSubTypeMaster />} />
          <Route path="/masters/location" element={<LocationAreaMaster />} />
          <Route path="/masters/common-doc-type" element={<CommonDocTypeMaster />} />
          <Route path="/masters/expiry-doc-type" element={<ExpiryDocTypeMaster />} />
          <Route path="/masters/odometer-reset" element={<OdometerResetMaster />} />
          <Route path="/masters/asset-change-wip" element={<AssetChangeWip />} />
          <Route path="/masters/asset-master" element={<AssetMaster />} />
          
          {/* Tasks */}
          <Route path="/tasks/depreciation" element={<DepreciationEntry />} />
          <Route path="/tasks/reclassify" element={<AssetReclassify />} />
          <Route path="/tasks/disposal" element={<AssetDisposal />} />
          <Route path="/tasks/transfer" element={<AssetTransfer />} />
          <Route path="/tasks/branch-transfer" element={<BranchTransfer />} />
          <Route path="/tasks/expiry-doc-entry" element={<ExpiryDocEntry />} />
          <Route path="/tasks/company-license" element={<CompanyLicense />} />
          
          {/* Reports */}
          <Route path="/reports/asset-list" element={<FixedAssetList />} />
          <Route path="/reports/asset-summary" element={<AssetSummaryDepreciation />} />
          <Route path="/reports/management-report" element={<AssetManagement />} />
          <Route path="/reports/asset-xl" element={<FixedAssetSummaryXL />} />
          <Route path="/reports/transfer-xl" element={<AssetTransferXL />} />
          <Route path="/reports/license-list" element={<CompanyLicenseList />} />
          <Route path="/reports/barcode" element={<AssetBarcode />} />
          <Route path="/reports/expiry-doc-list" element={<ExpiryDocumentList />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default App;
