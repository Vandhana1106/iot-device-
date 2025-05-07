import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
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
        idleHours: 0
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

    fetch(`https://oceanatlantic.pinesphere.co.in/api/api/machines/${machine_id}/reports/?${params}`)
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
    {/* <small>{(reportData.totalProductiveTime.percentage || 0).toFixed(2)}% of total</small> */}
  </div>
  <div className="indicator">
    <h4><FaTools /> Total Non-Productive Hours</h4>
    <p>{(reportData.totalNonProductiveTime.hours || 0).toFixed(2)} Hrs</p>
    {/* <small>{(reportData.totalNonProductiveTime.percentage || 0).toFixed(2)}% of total</small> */}
  </div>
  <div className="indicator">
    <h4><FaClock /> Total Hours</h4>
    <p>{reportData.totalHours?.toFixed(2) || '0.00'} Hrs</p>
    {/* <small>Actual recorded ideal time (Mode 2)</small> */}
    {/* <small>{((reportData.totalNonProductiveTime.breakdown.idleHours / reportData.totalHours) * 100 || 0).toFixed(2)}% of total</small> */}
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
  {/* <div className="tile needle-runtime-percentage">
    <p>{((reportData.totalNeedleRuntime / reportData.totalAvailableHours) * 100 || 0).toFixed(2)}%</p>
    <span>Needle Runtime Percentage</span>
  </div> */}
</div>

      <div className="chart-breakdown-container">
        <div className="graph-section">
          <h3>Hours Breakdown (Total: {(reportData.totalHours || 0).toFixed(2)} Hrs)</h3>
          <Chart
            options={{
              chart: { type: "donut" },
              labels: [
                "Sewing Hours", 
                "No Feeding Hours", 
                "Meeting Hours", 
                "Maintenance Hours", 
                "Idle Hours"
              ],
              colors: [
                "#3E3561", // Productive Time (matches .production)
                "#8E44AD", // No Feeding (matches .no-feeding)
                "#E74C3C", // Meeting Hours (matches .meeting)
                "#118374", // Maintenance (matches .non-production)
                "#F8A723"  // Idle Time (matches .idle)
              ],
              legend: { show: false },
              dataLabels: { enabled: true },
              plotOptions: {
                pie: {
                  donut: {
                    labels: {
                      show: true,
                      total: {
                        show: true,
                        label: 'Total Hours',
                        formatter: () => `${(reportData.totalHours || 0).toFixed(2)} Hrs`
                      },
                      value: {
                        formatter: (val) => `${val || 0} Hrs`
                      }
                    }
                  }
                }
              },
              tooltip: {
                y: {
                  formatter: (val) => {
                    const percentage = ((val / reportData.totalHours) * 100).toFixed(2);
                    return `${val || 0} Hrs (${percentage}%)`;
                  }
                }
              }
            }}
            series={[
              reportData.totalProductiveTime.hours || 0,
              reportData.totalNonProductiveTime.breakdown.noFeedingHours || 0,
              reportData.totalNonProductiveTime.breakdown.meetingHours || 0,
              reportData.totalNonProductiveTime.breakdown.maintenanceHours || 0,
              reportData.totalNonProductiveTime.breakdown.idleHours || 0
            ]}
            type="donut"
            height={350}
          />
        </div>

        <div className="hour-breakdown">
          <div className="hour-box">
            <span className="dot production"></span>
            <p>{(reportData.totalProductiveTime.hours || 0).toFixed(2)} Hrs: Sewing Hours</p>
            {/* <small>{(reportData.totalProductiveTime.percentage || 0).toFixed(2)}%</small> */}
          </div>
          <div className="hour-box">
            <span className="dot no-feeding"></span>
            <p>{(reportData.totalNonProductiveTime.breakdown.noFeedingHours || 0).toFixed(2)} Hrs: No Feeding Hours</p>
            {/* <small>{((reportData.totalNonProductiveTime.breakdown.noFeedingHours / reportData.totalHours) * 100 || 0).toFixed(2)}%</small> */}
          </div>
          <div className="hour-box">
            <span className="dot meeting"></span>
            <p>{(reportData.totalNonProductiveTime.breakdown.meetingHours || 0).toFixed(2)} Hrs: Meeting Hours</p>
            {/* <small>{((reportData.totalNonProductiveTime.breakdown.meetingHours / reportData.totalHours) * 100 || 0).toFixed(2)}%</small> */}
          </div>
          <div className="hour-box">
            <span className="dot maintenances"></span>
            <p>{(reportData.totalNonProductiveTime.breakdown.maintenanceHours || 0).toFixed(2)} Hrs: Maintenance Hours</p>
            {/* <small>{((reportData.totalNonProductiveTime.breakdown.maintenanceHours / reportData.totalHours) * 100 || 0).toFixed(2)}%</small> */}
          </div>
          <div className="hour-box">
            <span className="dot idle"></span>
            <p>{(reportData.totalNonProductiveTime.breakdown.idleHours || 0).toFixed(2)} Hrs: Idle Hours</p>
            {/* <small>{((reportData.totalNonProductiveTime.breakdown.idleHours / reportData.totalHours) * 100 || 0).toFixed(2)}%</small> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MachineReport;