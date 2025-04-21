import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { FaTshirt, FaClock, FaTools, FaDownload } from "react-icons/fa";
import "./LineStyles.css";

const LineReport = ({ lineNumber, fromDate, toDate }) => {
  const [reportData, setReportData] = useState({
    lineNumber: "",
    totalAvailableHours: 0,
    totalWorkingDays: 0,
    averageMachines: 0,
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
    averageSewingSpeed: 0,
    totalNeedleRuntime: 0,
    needleRuntimePercentage: 0,
    tableData: [],
    allTableData: []
  });

  const [tableFilter, setTableFilter] = useState({
    fromDate: '',
    toDate: ''
  });

  useEffect(() => {
    if (!lineNumber) return;

    const params = new URLSearchParams();
    if (fromDate) params.append('from_date', fromDate);
    if (toDate) params.append('to_date', toDate);

    fetch(`https://2nbcjqrb-8000.inc1.devtunnels.ms/api/line-reports/${lineNumber}/?${params}`)
      .then((response) => response.json())
      .then((data) => {
        setReportData({
          ...data,
          tableData: data.tableData,
          allTableData: data.tableData,
        });
      })
      .catch((error) => console.error("Error fetching line report:", error));
  }, [lineNumber, fromDate, toDate]);

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
    link.setAttribute('download', `line_${lineNumber}_report_${new Date().toISOString().slice(0,10)}.csv`);
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
          <h2>Line ${lineNumber} Report</h2>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <p>Total Available Hours: ${reportData.totalAvailableHours.toFixed(2)}</p>
          <p>Productive Time: ${reportData.totalProductiveTime.hours.toFixed(2)} Hrs (${reportData.totalProductiveTime.percentage.toFixed(2)}%)</p>
          <p>Non-Productive Time: ${reportData.totalNonProductiveTime.hours.toFixed(2)} Hrs (${reportData.totalNonProductiveTime.percentage.toFixed(2)}%)</p>
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
    link.setAttribute('download', `line_${lineNumber}_report_${new Date().toISOString().slice(0,10)}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="line-container">
      <div className="table-section">
        <div className="table-header">
          <h3>Line {lineNumber} Report</h3>
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
                {/* <th>Machine Count</th> */}
              </tr>
            </thead>
            <tbody>
              {reportData.tableData.map((row, index) => (
                <tr key={index}>
                  <td>{row.Date}</td>
                  <td>{row["Sewing Hours (PT)"]?.toFixed(2) || '0.00'}</td>
                  <td>{row["No Feeding Hours"]?.toFixed(2) || '0.00'}</td>
                  <td>{row["Meeting Hours"]?.toFixed(2) || '0.00'}</td>
                  <td>{row["Maintenance Hours"]?.toFixed(2) || '0.00'}</td>
                  <td>{row["Idle Hours"]?.toFixed(2) || '0.00'}</td>
                  <td>{row["Total Hours"]?.toFixed(2) || '0.00'}</td>
                  <td>{row["Productive Time (PT) %"]?.toFixed(2) || '0.00'}%</td>
                  <td>{row["Non-Productive Time (NPT) %"]?.toFixed(2) || '0.00'}%</td>
                  <td>{row["Sewing Speed"]?.toFixed(2) || '0.00'}</td>
                  <td>{row["Stitch Count"] || '0'}</td>
                  <td>{row["Needle Runtime"]?.toFixed(2) || '0.00'}</td>
                  {/* <td>{row["Machine Count"] || '0'}</td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="top-indicators">
        <div className="indicator">
          <h4><FaTshirt /> Total Sewing Hours</h4>
          <p>{reportData.totalProductiveTime.hours?.toFixed(2) || '0.00'} Hrs</p>
          {/* <small>{reportData.totalProductiveTime.percentage?.toFixed(2) || '0.00'}% of total</small> */}
        </div>
        <div className="indicator">
          <h4><FaTools /> Total Non-Productive Hours</h4>
          <p>{reportData.totalNonProductiveTime.hours.toFixed(2)} Hrs</p>
          {/* <small>{reportData.totalNonProductiveTime.percentage.toFixed(2)}% of total</small> */}
        </div>
        <div className="indicator">
  <h4><FaClock /> Total Hours</h4>
  <p>{reportData.totalHours?.toFixed(2) || '0.00'} Hrs</p>
{/* <small>Actual recorded ideal time (Mode 2)</small> */}
</div>
      </div>

      <div className="summary-tiles">
        <div className="tile production-percentage">
          <p>{reportData.totalProductiveTime.percentage.toFixed(2)}%</p>
          <span>Productive Time</span>
        </div>
        <div className="tile average-speed">
          <p>{reportData.averageSewingSpeed.toFixed(2)}</p>
          <span>Avg Sewing Speed</span>
        </div>
        <div className="tile needle-runtime-percentage">
          <p>{reportData.needleRuntimePercentage.toFixed(2)}%</p>
          <span>Needle Runtime</span>
        </div>
      </div>

      <div className="chart-breakdown-container">
        <div className="graph-section">
          <h3>Hours Breakdown (Total: {reportData.totalHours.toFixed(2)} Hrs)</h3>
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
                        formatter: () => `${reportData.totalHours.toFixed(2)} Hrs`
                      },
                      value: {
                        formatter: (val) => `${val.toFixed(2)} Hrs`
                      }
                    }
                  }
                }
              },
              tooltip: {
                y: {
                  formatter: (val) => {
                    const percentage = ((val / reportData.totalHours) * 100).toFixed(2);
                    return `${val.toFixed(2)} Hrs (${percentage}%)`;
                  }
                }
              }
            }}
            series={[
              reportData.totalProductiveTime.hours,
              reportData.totalNonProductiveTime.breakdown.noFeedingHours,
              reportData.totalNonProductiveTime.breakdown.meetingHours,
              reportData.totalNonProductiveTime.breakdown.maintenanceHours,
              reportData.totalNonProductiveTime.breakdown.idleHours
            ]}
            type="donut"
            height={350}
          />
        </div>

        <div className="hour-breakdown">
          <div className="hour-box">
            <span className="dot production"></span>
            <p>{reportData.totalProductiveTime.hours.toFixed(2)} Hrs: Sewing Hours</p>
            {/* <small>{reportData.totalProductiveTime.percentage.toFixed(2)}%</small> */}
          </div>
          <div className="hour-box">
            <span className="dot no-feeding"></span>
            <p>{reportData.totalNonProductiveTime.breakdown.noFeedingHours.toFixed(2)} Hrs: No Feeding</p>
            {/* <small>{((reportData.totalNonProductiveTime.breakdown.noFeedingHours / reportData.totalHours) * 100 || 0).toFixed(2)}%</small> */}
          </div>
          <div className="hour-box">
            <span className="dot meeting"></span>
            <p>{reportData.totalNonProductiveTime.breakdown.meetingHours.toFixed(2)} Hrs: Meetings</p>
            {/* <small>{((reportData.totalNonProductiveTime.breakdown.meetingHours / reportData.totalHours) * 100 || 0).toFixed(2)}%</small> */}
          </div>
          <div className="hour-box">
            <span className="dot maintenances"></span>
            <p>{reportData.totalNonProductiveTime.breakdown.maintenanceHours.toFixed(2)} Hrs: Maintenance</p>
            {/* <small>{((reportData.totalNonProductiveTime.breakdown.maintenanceHours / reportData.totalHours) * 100 || 0).toFixed(2)}%</small> */}
          </div>
          <div className="hour-box">
            <span className="dot idle"></span>
            <p>{reportData.totalNonProductiveTime.breakdown.idleHours.toFixed(2)} Hrs: Idle Time</p>
            {/* <small>{((reportData.totalNonProductiveTime.breakdown.idleHours / reportData.totalHours) * 100 || 0).toFixed(2)}%</small> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LineReport;