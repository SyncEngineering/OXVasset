import React, { useState, useEffect, useRef } from 'react';
import * as api from '../api/dashboardApi';
import Table from '../components/common/Table.jsx';
import '../styles/form.css';
import '../styles/table.css';

/**
 * Dashboard page with real-time statistics and visualizations.
 */
const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  const categoryChartRef = useRef(null);
  const statusChartRef = useRef(null);
  const divisionChartRef = useRef(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.getStats();
      if (res.success) {
        setData(res.data);
      } else {
        setError(res.message || 'Backend returned success: false');
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError('Failed to reach server or database error.');
      setDebugInfo(JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (data && window.Chart) {
      try {
        // 1. Assets by Category Bar Chart
        const catEl = document.getElementById('categoryChart');
        if (catEl) {
          const categoryCtx = catEl.getContext('2d');
          if (categoryChartRef.current) categoryChartRef.current.destroy();
          categoryChartRef.current = new window.Chart(categoryCtx, {
            type: 'bar',
            data: {
              labels: data.charts.assetsByCategory.map(i => i.label),
              datasets: [{
                label: 'Assets per Category',
                data: data.charts.assetsByCategory.map(i => i.value),
                backgroundColor: '#003399',
                borderColor: '#002266',
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              interaction: {
                mode: 'index',
                intersect: false,
                axis: 'x'
              },
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
            }
          });
        }

        // 2. Asset Status Stacked Bar Chart
        const statEl = document.getElementById('statusChart');
        if (statEl) {
          const statusCtx = statEl.getContext('2d');
          if (statusChartRef.current) statusChartRef.current.destroy();
          statusChartRef.current = new window.Chart(statusCtx, {
            type: 'bar',
            data: {
              labels: ['Status'],
              datasets: data.charts.assetsByStatus.map((item, index) => ({
                label: item.label.toUpperCase(),
                data: [item.value],
                backgroundColor: ['#4caf50', '#f44336', '#ff9800', '#2196f3', '#9c27b0', '#888'][index % 6],
              }))
            },
            options: {
              indexAxis: 'y',
              responsive: true,
              maintainAspectRatio: false,
              interaction: {
                mode: 'index',
                intersect: false,
                axis: 'y'
              },
              scales: {
                x: { stacked: true, beginAtZero: true },
                y: { stacked: true }
              },
              plugins: { legend: { position: 'bottom' } }
            }
          });
        }

        // 3. Asset Value by Division Bar Chart (Horizontal)
        const divEl = document.getElementById('divisionChart');
        if (divEl) {
          const divisionCtx = divEl.getContext('2d');
          if (divisionChartRef.current) divisionChartRef.current.destroy();
          divisionChartRef.current = new window.Chart(divisionCtx, {
            type: 'bar',
            data: {
              labels: data.charts.valueByDivision.map(i => i.label),
              datasets: [{
                label: 'Total Value',
                data: data.charts.valueByDivision.map(i => i.value),
                backgroundColor: '#888',
              }]
            },
            options: {
              indexAxis: 'y',
              responsive: true,
              maintainAspectRatio: false,
              interaction: {
                mode: 'index',
                intersect: false,
                axis: 'y'
              },
              plugins: { legend: { display: false } }
            }
          });
        }
      } catch (chartErr) {
        console.error('Chart rendering error:', chartErr);
      }
    }
  }, [data]);

  const columns = [
    { key: 'label', label: 'Statistic', width: '300px' },
    { key: 'value', label: 'Count / Value', width: '150px' }
  ];

  if (loading) return <div style={{ padding: '20px' }}>Loading dashboard data from server...</div>;

  return (
    <div>
      <style>{`
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }
        .chart-card {
          background: #fff;
          border: 1px solid #ccc;
          padding: 15px;
        }
        .chart-title {
          font-weight: bold;
          font-size: 13px;
          margin-bottom: 15px;
          padding-bottom: 5px;
          border-bottom: 1px solid #eee;
          color: #333;
        }
        .chart-container {
          height: 250px;
          position: relative;
        }
        .debug-panel {
          background: #333;
          color: #0f0;
          padding: 10px;
          margin-top: 20px;
          font-family: monospace;
          font-size: 11px;
          overflow: auto;
          max-height: 200px;
        }
      `}</style>

      <h2 style={{ fontSize: '16px', marginBottom: '15px', color: '#003399' }}>
        KSRTC Asset Management System - Dashboard
      </h2>

      {error && (
        <div style={{ padding: '15px', background: '#fee', border: '1px solid #fcc', color: '#c00', marginBottom: '20px' }}>
          <strong>Error:</strong> {error}
          <button onClick={fetchDashboardData} style={{ marginLeft: '10px', fontSize: '11px' }}>Retry</button>
          {debugInfo && (
            <div className="debug-panel">
              <pre>{debugInfo}</pre>
            </div>
          )}
        </div>
      )}
      
      {!error && (
        <>
          <div className="form-container">
            <div className="form-section-title">Module Overview Summary</div>
            <Table columns={columns} data={data?.summary || []} />
          </div>

          <div className="dashboard-grid">
            <div className="chart-card">
              <div className="chart-title">Assets Count by Category</div>
              <div className="chart-container">
                <canvas id="categoryChart"></canvas>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-title">Asset Status Distribution</div>
              <div className="chart-container">
                <canvas id="statusChart"></canvas>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-title">Total Asset Value by Division</div>
              <div className="chart-container">
                <canvas id="divisionChart"></canvas>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
