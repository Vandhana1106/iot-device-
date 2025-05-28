import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { FaTshirt, FaClock, FaTools, FaDownload } from "react-icons/fa";
import "./MachineStyles.css";

const MachineReport = ({ machine_id, fromDate, toDate }) => {
  const [reportData, setReportData] = useState({
    machineId: "",
    totalAvailableHours: 0,
    totalWorkingDays: 0,
    totalHours: 0,
    totalProductiveTime: {
      hours: 0,
      percentage: 0
    },
    totalNonProductiveTime: {
      hours: 0,
      percentage: 0,
      breakdown: {
        noFeedingHours: 0,
        meetingHours: 0,
        maintenanceHours: 0,
        idleHours: 0,
        reworkHours: 0, // Mode 6
        needleBreakHours: 0 // Mode 7
      }
    },
    totalStitchCount: 0,
    totalNeedleRuntime: 0,
    tableData: [],
    allTableData: []
  });

  const [tableFilter, setTableFilter] = useState({
    fromDate: '',
    toDate: ''
  });

  useEffect(() => {
    if (!machine_id) return;

    const params = new URLSearchParams();
    if (fromDate) params.append('from_date', fromDate);
    if (toDate) params.append('to_date', toDate);

    fetch(`http://localhost:8000/api/api/machines/${machine_id}/reports/?${params}`)
      .then((response) => response.json())
      .then((data) => {
        const allTableData = data.tableData || [];
        
        setReportData({
          ...data,
          tableData: allTableData,
          allTableData: allTableData,
        });
      })
      .catch((error) => console.error("Error fetching machine report:", error));
  }, [machine_id, fromDate, toDate]);

  const handleTableFilterChange = (e) => {
    const { name, value } = e.target;
    setTableFilter(prev => ({ ...prev, [name]: value }));
  };

  const applyTableFilter = () => {
    const filteredData = reportData.allTableData.filter(row => {
      const rowDate = new Date(row.Date);
      const fromDate = tableFilter.fromDate ? new Date(tableFilter.fromDate) : null;
      const toDate = tableFilter.toDate ? new Date(tableFilter.toDate) : null;
      
      let valid = true;
      if (fromDate) valid = valid && rowDate >= fromDate;
      if (toDate) valid = valid && rowDate <= toDate;
      return valid;
    });

    setReportData(prev => ({
      ...prev,
      tableData: filteredData
    }));
  };

  const resetTableFilter = () => {
    setTableFilter({ fromDate: '', toDate: '' });
    setReportData(prev => ({
      ...prev,
      tableData: prev.allTableData
    }));
  };

  const downloadCSV = () => {
    const headers = Object.keys(reportData.tableData[0] || {});
    const csvRows = [
      headers.join(','),
      ...reportData.tableData.map(row => 
        headers.map(header => 
          `"${row[header] !== undefined ? row[header] : ''}"`
        ).join(',')
      )
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `machine_${machine_id}_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadHTML = () => {
    const htmlContent = `<!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .title { text-align: center; }
          .summary { margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="summary">
          <h2>Machine ${machine_id} Report</h2>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <p>Total Available Hours: ${(reportData.totalAvailableHours || 0).toFixed(2)} (${reportData.totalWorkingDays || 0} days × 11 hrs)</p>
          <p>Productive Time: ${(reportData.totalProductiveTime.hours || 0).toFixed(2)} Hrs (${(reportData.totalProductiveTime.percentage || 0).toFixed(2)}%)</p>
          <p>Non-Productive Time: ${(reportData.totalNonProductiveTime.hours || 0).toFixed(2)} Hrs (${(reportData.totalNonProductiveTime.percentage || 0).toFixed(2)}%)</p>
        </div>
        <table>
          <thead>
            <tr>
              ${Object.keys(reportData.tableData[0] || {}).map(header => `<th>${header}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${reportData.tableData.map(row => 
              `<tr>
                ${Object.values(row).map(value => `<td>${value !== undefined ? value : ''}</td>`).join('')}
              </tr>`
            ).join('')}
          </tbody>
        </table>
      </body>
      </html>`;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `machine_${machine_id}_report_${new Date().toISOString().slice(0,10)}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Define chart data with explicit colors
  const chartData = [
    { name: "Sewing Hours", value: reportData.totalProductiveTime.hours || 0, color: "#3E3561" },
    { name: "No Feeding Hours", value: reportData.totalNonProductiveTime.breakdown.noFeedingHours || 0, color: "#8E44AD" },
    { name: "Meeting Hours", value: reportData.totalNonProductiveTime.breakdown.meetingHours || 0, color: "#E74C3C" },
    { name: "Maintenance Hours", value: reportData.totalNonProductiveTime.breakdown.maintenanceHours || 0, color: "#118374" },
    { name: "Idle Hours", value: reportData.totalNonProductiveTime.breakdown.idleHours || 0, color: "#F8A723" },
    { name: "Rework", value: reportData.totalNonProductiveTime.breakdown.reworkHours || 0, color: "#FF6F61" }, // Mode 6
    { name: "Needle Break", value: reportData.totalNonProductiveTime.breakdown.needleBreakHours || 0, color: "#00B8D9" } // Mode 7
  ].filter(item => item.value > 0);

  return (
    <div className="operator-container">
      <div className="table-section">
        <div className="table-header">
          <h3>Machine {machine_id} Report</h3>
          <div className="table-controls">
            <div className="download-buttons">
              <button onClick={downloadCSV} className="download-button csv">
                <FaDownload /> CSV
              </button>
              <button onClick={downloadHTML} className="download-button html">
                <FaDownload /> HTML
              </button>
            </div>
          </div>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Sewing Hours (PT)</th>
                <th>No Feeding Hours</th>
                <th>Meeting Hours</th>
                <th>Maintenance Hours</th>
                <th>Idle Hours</th>
                <th>Rework</th>
                <th>Needle Break</th>
                <th>Total Hours</th>
                <th>PT %</th>
                <th>NPT %</th>
                <th>Sewing Speed</th>
                <th>Stitch Count</th>
                <th>Needle Runtime</th>
              </tr>
            </thead>
            <tbody>
              {reportData.tableData.map((row, index) => (
                <tr key={index}>
                  <td>{row.Date || '-'}</td>
                  <td>{(row["Sewing Hours (PT)"] || 0).toFixed(2)}</td>
                  <td>{(row["No Feeding Hours"] || 0).toFixed(2)}</td>
                  <td>{(row["Meeting Hours"] || 0).toFixed(2)}</td>
                  <td>{(row["Maintenance Hours"] || 0).toFixed(2)}</td>
                  <td>{(row["Idle Hours"] || 0).toFixed(2)}</td>
                  <td>{(row["Rework"] || 0).toFixed(2)}</td>
                  <td>{(row["Needle Break"] || 0).toFixed(2)}</td>
                  <td>{(row["Total Hours"] || 0).toFixed(2)}</td>
                  <td>{(row["Productive Time (PT) %"] || 0).toFixed(2)}%</td>
                  <td>{(row["Non-Productive Time (NPT) %"] || 0).toFixed(2)}%</td>
                  <td>{(row["Sewing Speed"] || 0).toFixed(2)}</td>
                  <td>{row["Stitch Count"] || 0}</td>
                  <td>{(row["Needle Runtime"] || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="top-indicators">
        <div className="indicator">
          <h4><FaTshirt /> Total Sewing Hours</h4>
          <p>{(reportData.totalProductiveTime.hours || 0).toFixed(2)} Hrs</p>
        </div>
        <div className="indicator">
          <h4><FaTools /> Total Non-Productive Hours</h4>
          <p>{(reportData.totalNonProductiveTime.hours || 0).toFixed(2)} Hrs</p>
        </div>
        <div className="indicator">
          <h4><FaClock /> Total Hours</h4>
          <p>{reportData.totalHours?.toFixed(2) || '0.00'} Hrs</p>
        </div>
      </div>

      <div className="summary-tiles">
        <div className="tile production-percentage">
          <p>{(reportData.totalProductiveTime.percentage || 0).toFixed(2)}%</p>
          <span>Productive Time</span>
        </div>
        <div className="tile average-speed">
          <p>{
            reportData.tableData.length > 0 
              ? (reportData.tableData.reduce((sum, row) => sum + (row["Sewing Speed"] || 0), 0) / reportData.tableData.length).toFixed(2)
              : '0.00'
          }</p>
          <span>Average Sewing Speed</span>
        </div>
      </div>

      <div className="chart-breakdown-container">
        <div className="graph-section">
          <h3>Hours Breakdown (Total: {(reportData.totalHours || 0).toFixed(2)} Hrs)</h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                fill="#8884d8"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => `${value.toFixed(2)} Hrs`}
                labelFormatter={(_, payload) => payload[0]?.name || ""}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="total-hours" style={{ textAlign: 'center', marginTop: '10px' }}>
            <strong>Total Hours: {(reportData.totalHours || 0).toFixed(2)} Hrs</strong>
          </div>
        </div>

        <div className="hour-breakdown">
          <div className="hour-box">
            <span className="dot production"></span>
            <p>{(reportData.totalProductiveTime.hours || 0).toFixed(2)} Hrs: Sewing Hours</p>
          </div>
          <div className="hour-box">
            <span className="dot no-feeding"></span>
            <p>{(reportData.totalNonProductiveTime.breakdown.noFeedingHours || 0).toFixed(2)} Hrs: No Feeding Hours</p>
          </div>
          <div className="hour-box">
            <span className="dot meeting"></span>
            <p>{(reportData.totalNonProductiveTime.breakdown.meetingHours || 0).toFixed(2)} Hrs: Meeting Hours</p>
          </div>
          <div className="hour-box">
            <span className="dot maintenances"></span>
            <p>{(reportData.totalNonProductiveTime.breakdown.maintenanceHours || 0).toFixed(2)} Hrs: Maintenance Hours</p>
          </div>
          <div className="hour-box">
            <span className="dot idle"></span>
            <p>{(reportData.totalNonProductiveTime.breakdown.idleHours || 0).toFixed(2)} Hrs: Idle Hours</p>
          </div>
          <div className="hour-box">
            <span className="dot rework"></span>
            <p>{(reportData.totalNonProductiveTime.breakdown.reworkHours || 0).toFixed(2)} Hrs: Rework</p>
          </div>
          <div className="hour-box">
            <span className="dot needle-break"></span>
            <p>{(reportData.totalNonProductiveTime.breakdown.needleBreakHours || 0).toFixed(2)} Hrs: Needle Break</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MachineReport;